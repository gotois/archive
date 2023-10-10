import { is, uid, date, LocalStorage, SessionStorage } from 'quasar'
import { defineStore } from 'pinia'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020'
import usePodStore from './pod'
import useWalletStore from './wallet'
import { demoUserWebId } from './auth'
import {
  signMessageUsePhantom,
  signMessageUseSolana,
  sign,
  createAndSignPresentation,
} from '../services/cryptoService'
import { db, keys, keyPair } from '../services/databaseService'
import {
  formatterContracts,
  createContractLD,
  getContractFromLD,
  getIdentifierMessage,
} from '../helpers/schemaHelper'
import {
  ContractData,
  ContractDate,
  ContractTable,
  Credential,
  FormatContract,
  MyContract,
  WalletType,
  ContractIdentifier,
} from '../types/models'

interface Store {
  contractNames: Map<string, ContractData>
  contracts: ContractTable[]
  contractsCount: number
}

let contractNames: Map<string, ContractData> = null
if (LocalStorage.has('contractNames')) {
  contractNames = new Map<string, ContractData>(
    LocalStorage.getItem('contractNames'),
  )
} else {
  contractNames = await db.getContractNames()
  LocalStorage.set(
    'contractNames',
    Array.from(contractNames).filter((key) => !!key),
  )
}

export default defineStore('contracts', {
  state: (): Store => ({
    contracts: [],
    contractNames: contractNames,
    contractsCount: SessionStorage.getItem('contractsCount') ?? 0,
  }),
  actions: {
    setContractsCount(count: number) {
      this.contractsCount = count
      SessionStorage.set('contractsCount', count)
    },
    addContractName(name: string) {
      if (!name) {
        throw new Error('Empty name')
      }
      const count = this.contractNames.get(name)?.count ?? 0
      this.contractNames.set(name, { count: count + 1, recommendation: false })
      LocalStorage.set('contractNames', this.getArchiveNames)
    },
    removeContractName(name: string) {
      this.contractNames.delete(name)
      LocalStorage.set('contractNames', this.getArchiveNames)
    },
    // This contract already in IndexedDB
    async existContract(identifier: ContractIdentifier[]) {
      const dexieId = identifier.find((i) => i.name === 'Dexie')
      const contract = await db.contracts.get({
        id: Number(dexieId.value),
      })
      return is.deepEqual(contract.identifier, identifier)
    },
    // Save to IndexedDb
    async insertContract(credential: Credential) {
      const contract = getContractFromLD(credential)

      const index = await db.add(contract)
      if (index === 0) {
        return Promise.reject('Cannot add this item')
      }
      this.addContractName(contract.instrument_name)

      return { contract, index }
    },
    async createPresentation(contract: Credential) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const key = await keyPair.last()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
      const suite = new Ed25519Signature2020({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        key: key,
      })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return createAndSignPresentation({
        signedVC: contract,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        suite,
      })
    },
    async signContract(contract: Credential) {
      const walletStore = useWalletStore()
      // подписываем документ и обновляем идентификатор подписи
      const message = getIdentifierMessage(contract.credentialSubject)
      switch (walletStore.type) {
        case WalletType.Phantom: {
          const { signature } = await signMessageUsePhantom(message)
          contract.credentialSubject.identifier.push({
            value: signature,
            name: WalletType.Phantom,
          })
          break
        }
        case WalletType.Secret: {
          const { secretKey } = await keys.last()
          const { signature } = signMessageUseSolana(message, secretKey)
          contract.credentialSubject.identifier.push({
            value: signature,
            name: WalletType.Secret,
          })
          break
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const key = await keyPair.last()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
      const suite = new Ed25519Signature2020({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        key: key,
      })
      const signedVC = await sign({
        credential: contract,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        suite,
      })
      return signedVC
    },
    async addContract({
      contractData,
      usePod = false,
    }: {
      contractData: MyContract
      usePod: boolean
    }) {
      const walletStore = useWalletStore()

      // Step 1: JSON-LD
      const id = uid()
      const jsldContract = createContractLD(contractData)
      const idName = 'Contract'
      const gicId = walletStore?.publicKey?.toString()
      const resolver = gicId ? `did:gic:${gicId}` : demoUserWebId
      jsldContract.id = `${resolver}?${idName.toLowerCase()}=${id}`
      jsldContract.credentialSubject.identifier.push({
        value: id,
        name: idName,
      })
      // fixme поддержать открытие договора в браузере через ссылку по его url
      // jsldContract.credentialSubject.url =
      //   'https://archive.gotointeractive.com/' + id
      // todo: сейчас происходит сохранение в БД Dexie даже если не выполнились остальные условия.
      //  Требуется сохранять во внутреннее хранилище и удалять тот контракт, что не прошел весь цикл обслуживания
      const { contract, index } = await this.insertContract(jsldContract)
      // после первичной записи обновляем идентификатор Dexie
      jsldContract.credentialSubject.identifier.push({
        name: 'Dexie',
        propertyID: db.verno, // используемая версия движка
        value: index,
      })
      const count = await db.contracts.count()
      this.setContractsCount(count)

      const signedVC = await this.signContract(jsldContract)
      contract.identifier = jsldContract.credentialSubject.identifier
      contract.proof = signedVC.proof

      // Save to SOLiD Pod
      if (usePod) {
        const podStore = usePodStore()
        contract.resource_url = await podStore.uploadContract(signedVC)
      }
      // обновляем запись в БД
      await db.contracts.where('id').equals(index).modify({
        resource_url: contract.resource_url,
        identifier: contract.identifier,
        proof: contract.proof,
      })
      this.contracts.push(contract)
    },
    async editContract(contract: FormatContract) {
      const id = contract.identifier.find(({ name }) => name === 'Dexie')
        .value as number
      const count = await db.contracts.where('id').equals(id).modify({
        instrument_description: contract.instrument.description,
      })
      if (count === 0) {
        return Promise.reject('Cannot edit this item')
      }
      const i = this.contracts.map((item) => item.id).indexOf(id)
      this.contracts[i].instrument_description = contract.instrument.description
    },
    async removeContract({
      contract,
      usePod = false,
    }: {
      contract: FormatContract
      usePod: boolean
    }) {
      // Step 1: JS
      const id = contract.identifier.find(({ name }) => name === 'Dexie')
        ?.value as number
      if (!id) {
        throw new Error('Unknown Dexie ID')
      }
      const i = this.contracts.map((item) => item.id).indexOf(id)
      this.contracts.splice(i, 1)
      this.removeContractName(contract.instrument.name)

      // Step 2: IndexedDB
      const removedCount = await db.remove(id)
      if (removedCount === 0) {
        return Promise.reject('Cannot remove this item')
      }
      const count = await db.contracts.count()
      this.setContractsCount(count)
      if (!usePod) {
        return
      }
      // Step 3: Solid Pod
      if (!contract.sameAs) {
        return Promise.reject('Not exist sameAs')
      }
      return usePodStore().removeFromPod(contract.sameAs)
    },
    async filterFromContracts(query: string) {
      if (!query) {
        return
      }
      this.contracts = await db.contracts
        .where('instrument_name')
        .equals(query)
        .reverse()
        .sortBy('startTime')
    },
    async filteredByIds({ ids }: { ids: number[] }) {
      this.contracts = await db.contracts.bulkGet(ids)
    },
    async searchFromContracts({
      query,
      offset,
      limit,
      scoreRate = 0.5,
    }: {
      query: string
      offset: number
      limit: number
      scoreRate?: number
    }) {
      this.contracts = []
      if (query.length <= 0) {
        return
      }
      const MiniSearch = await import('minisearch')
      const miniSearch = new MiniSearch.default({
        fields: ['instrument_name'],
      })
      const documents = await db.getFulltextDocument()
      miniSearch.addAll(documents)
      const searchResults = miniSearch.search(query, {
        fuzzy: (term) => (term.length > 3 ? 0.2 : null),
        filter({ score }) {
          return score >= scoreRate
        },
      })
      const ids = searchResults.map((results) => results.id as number)
      if (!ids) {
        return
      }
      const contracts = await db.contracts.bulkGet(ids)
      this.contracts = contracts.slice(offset, offset + limit)
    },
    async getCalendarContracts({ from, to }: { from: Date; to: Date }) {
      const contracts = await db.contracts
        .filter((c) => {
          if (date.isBetweenDates(c.startTime, from, to)) {
            return true
          }
          if (date.isBetweenDates(c.endTime, from, to)) {
            return true
          }
          if (c.startTime <= from) {
            return c.endTime > to
          }
          return false
        })
        .toArray()
      return contracts.map((contract) => {
        return {
          id: contract.id,
          start: date.formatDate(contract.startTime, 'YYYY/MM/DD'),
          end: date.formatDate(contract.endTime, 'YYYY/MM/DD'),
        }
      }) as ContractDate[]
    },
    async loadAllContracts({
      offset = 0,
      limit = 10,
    }: {
      offset: number
      limit: number
    }) {
      const count = await db.contracts.count()
      this.setContractsCount(count)
      if (!count) {
        this.contracts = []
        return
      }
      this.contracts = await db.contracts
        .orderBy('startTime')
        .reverse()
        .offset(offset)
        .limit(limit)
        .toArray()
    },
  },
  getters: {
    formatContracts(state): FormatContract[] {
      return formatterContracts(state.contracts)
    },
    getArchiveKeys(state) {
      return Array.from(state.contractNames.keys()).sort((a, b) => {
        if (a.toLowerCase() < b.toLowerCase()) {
          return -1
        } else if (a.toLowerCase() === b.toLowerCase()) {
          return 0
        } else {
          return 1
        }
      })
    },
    getArchiveNames(state) {
      return Array.from(state.contractNames)
    },
    getContractsCount(state) {
      return state.contractsCount
    },
  },
})
