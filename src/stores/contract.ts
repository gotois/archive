import { FormatContract, ContractTable } from '../types/models'
import { defineStore } from 'pinia'
import { db } from '../services/databaseHelper'
import { recommendationContractTypes } from '../services/recommendationContractTypes'
import {
  formatterContracts,
  formatterContract,
  formatterLDContract,
  formatterDatasetContract,
} from '../services/schemaHelper'
import {
  saveToPod,
  removeFromPod,
  getWebId,
  getResourceBaseUrl,
} from '../services/podHelper'
import { sign, getAndSaveKeyPair } from '../services/cryptoHelper'

export default defineStore('contracts', {
  state: () => ({
    contracts: [] as ContractTable[],
    contractNames: new Map<string, { count: number }>(),
    contractsCount: 0,
  }),
  actions: {
    async uploadContract(contractData: ContractTable) {
      // Step 1: JS
      const resourceBaseUrl = await getResourceBaseUrl()
      const resourceName =
        resourceBaseUrl + contractData.startTime.toJSON() + '.ttl'
      contractData.resource_url = resourceName
      // todo update for Store
      // context.commit('updateContract', contractData)

      // Step 2: JSON-LD
      const jsldContract = formatterContract(contractData)

      // Step 3: Signed LD
      const webId = getWebId()
      const credential = formatterLDContract(webId, jsldContract)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const signedVC = await sign({
        credential: credential,
      })

      const solidDatasetContract = formatterDatasetContract(
        resourceName,
        signedVC,
      )
      await saveToPod(resourceName, solidDatasetContract)
      return db.add(contractData)
    },
    async addContract({
      contractData,
      usePod = false,
    }: {
      contractData: ContractTable
      usePod: boolean
    }) {
      // Step 1: JS
      this.contracts.push(contractData)

      // Step 2: JSON-LD
      const jsldContract = formatterContract(contractData)

      // Step 3: Signed LD
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const keyPair = await getAndSaveKeyPair()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      // если нет доступа к WebID используем для идентификации fingerprint от keyPair
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const webId = getWebId() ?? 'did:key:' + (keyPair.fingerprint() as string)
      const credential = formatterLDContract(webId, jsldContract)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const signedVC = await sign({
        credential: credential,
      })
      // Save to IndexedDb
      if (!usePod) {
        return db.add(contractData)
      }

      // Step 4: Solid Dataset to Pod
      const resourceBaseUrl = await getResourceBaseUrl()
      const resourceName =
        resourceBaseUrl + contractData.startTime.toJSON() + '.ttl'
      contractData.resource_url = resourceName
      const solidDatasetContract = formatterDatasetContract(
        resourceName,
        signedVC,
      )
      await saveToPod(resourceName, solidDatasetContract)
      return db.add(contractData)
    },
    async editContract(contract: FormatContract) {
      const id = Number(contract.identifier.value)
      const count = await db.contracts.where('id').equals(id).modify({
        instrument_description: contract.instrument.description,
      })
      if (count === 0) {
        console.error('Cannot edit this item')
        return
      }
    },
    async removeContract({
      contractData,
      usePod = false,
    }: {
      contractData: FormatContract
      usePod: boolean
    }) {
      // Step 1: JS
      const id = Number(contractData.identifier.value)
      const i = this.contracts.map((item) => item.id).indexOf(id)
      this.contracts.splice(i, 1)

      // Step 2: IndexedDB
      const count = await db.remove(id)
      if (count === 0) {
        console.error('Cannot remove this item')
      }
      if (!usePod) {
        return
      }
      // Step 3: Solid Pod
      if (!contractData.sameAs) {
        return
      }
      return removeFromPod(contractData.sameAs)
    },
    async filterFromContracts({ query }: { query: string }) {
      const contracts = await db.contracts
        .where('instrument_name')
        .equals(query)
        .reverse()
        .toArray()
      this.contractsCount = contracts.length
      this.contracts = contracts
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
      if (query.length <= 0) {
        this.contracts = []
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
      const cursor = db.contracts.orderBy('startTime').filter(({ id }) => {
        return searchResults.some((result) => result.id === id)
      })
      const count = await cursor.count()
      this.contractsCount = count
      if (!count) {
        this.contracts = []
        return
      }
      const contracts = await cursor
        .reverse()
        .offset(offset)
        .limit(limit)
        .toArray()
      this.contracts = contracts
    },
    async loadAllContracts({
      offset = 0,
      limit = 10,
    }: {
      offset: number
      limit: number
    }) {
      const count: number = await db.contracts.count()
      this.contractsCount = count
      if (!count) {
        this.contracts = []
        return
      }
      const contracts = await db.contracts
        .orderBy('startTime')
        .reverse()
        .offset(offset)
        .limit(limit)
        .toArray()
      this.contracts = contracts
    },
    async loadContractNames() {
      const map = new Map<string, { count: number }>()
      for (const names of await db.getContractNames()) {
        map.set(...names)
      }
      this.contractNames = map
    },
  },
  getters: {
    archiveNames(state) {
      const map = new Map()

      recommendationContractTypes.forEach((contractName) => {
        map.set(contractName, { count: 0, recommendation: true })
      })

      state.contractNames.forEach((contractName, name) => {
        map.set(name, {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
          count: contractName.count,
          recommendation: false,
        })
      })

      return Array.from(map)
    },
    formatContracts(): FormatContract[] {
      return formatterContracts(this.contracts)
    },
  },
})
