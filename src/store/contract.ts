import { Module } from 'vuex'
import { FormatContract, ContractTable } from '../types/models'
import { StateInterface } from './index'
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

export interface ContractState {
  contracts: ContractTable[]
  contractsCount: number
  contractNames: Map<string, { count: number }>
}

const ContractClass: Module<ContractState, StateInterface> = {
  state: () => ({
    contracts: [],
    contractNames: new Map(),
    contractsCount: 0,
  }),
  mutations: {
    setContractNames(state, contractNames: Map<string, { count: number }>) {
      state.contractNames = contractNames
    },
    setContractsCount(state, count: number) {
      state.contractsCount = count
    },
    setContracts(state, contracts: ContractTable[]) {
      state.contracts = contracts
    },
    addContract(state, contract: ContractTable) {
      state.contracts.push(contract)
    },
    removeContract(state, id: number) {
      const i = state.contracts.map((item) => item.id).indexOf(id)
      state.contracts.splice(i, 1)
    },
  },
  actions: {
    async addContract(
      context,
      {
        contractData,
        usePod = false,
      }: { contractData: ContractTable; usePod: boolean },
    ) {
      // Step 1: JS
      context.commit('addContract', contractData)

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
        contractData.resource_url =
          'https://storage.inrupt.com/1189569a-8a9f-41dd-9d48-e1b0bca02371/contracts/2023-04-01T21:00:00.000Z.ttl' // fixme test
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
    async editContract(context, contract: FormatContract) {
      const id = Number(contract.identifier.value)
      const count = await db.contracts.where('id').equals(id).modify({
        instrument_description: contract.instrument.description,
      })
      if (count === 0) {
        console.error('Cannot edit this item')
        return
      }
    },
    async removeContract(
      context,
      {
        contractData,
        usePod = false,
      }: { contractData: FormatContract; usePod: boolean },
    ) {
      // Step 1: JS
      const id = Number(contractData.identifier.value)
      context.commit('removeContract', id)

      // Step 2: IndexedDB
      const count = await db.remove(id)
      if (count === 0) {
        console.error('Cannot remove this item')
      }
      if (!usePod) {
        return
      }

      // Step 3: Solid Pod
      if (contractData.sameAs) {
        await removeFromPod(contractData.sameAs)
      }
    },
    async filterFromContracts(context, { query }: { query: string }) {
      const contracts = await db.contracts
        .where('instrument_name')
        .equals(query)
        .reverse()
        .toArray()
      context.commit('setContractsCount', contracts.length)
      context.commit('setContracts', contracts)
    },
    async searchFromContracts(
      context,
      {
        query,
        offset,
        limit,
        scoreRate = 0.5,
      }: { query: string; offset: number; limit: number; scoreRate: number },
    ) {
      if (query.length <= 0) {
        context.commit('setContracts', [])
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
      context.commit('setContractsCount', count)
      if (!count) {
        context.commit('setContracts', [])
        return
      }
      const contracts = await cursor
        .reverse()
        .offset(offset)
        .limit(limit)
        .toArray()
      context.commit('setContracts', contracts)
    },
    async loadAllContracts(
      context,
      { offset = 0, limit = 10 }: { offset: number; limit: number },
    ) {
      const count: number = await db.contracts.count()
      context.commit('setContractsCount', count)
      if (!count) {
        context.commit('setContracts', [])
        return
      }
      const contracts = await db.contracts
        .orderBy('startTime')
        .reverse()
        .offset(offset)
        .limit(limit)
        .toArray()
      context.commit('setContracts', contracts)
    },
    async loadContractNames(context) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!context.getters.consumer) {
        return
      }
      const map = new Map()
      for (const names of await db.getContractNames()) {
        map.set(...names)
      }
      context.commit('setContractNames', map)
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
          count: contractName.count,
          recommendation: false,
        })
      })

      return Array.from(map)
    },
    contracts(state): FormatContract[] {
      return formatterContracts(state.contracts)
    },
    contractsCount(state) {
      return state.contractsCount ?? 0
    },
  },
}

export default ContractClass
