import { LocalStorage, SessionStorage } from 'quasar'
import { defineStore } from 'pinia'
import usePodStore from './pod'
import { db } from '../services/databaseService'
import recommendationContractTypes from '../services/recommendationContractEnum'
import { formatterContracts } from '../helpers/schemaHelper'
import { FormatContract, ContractTable, ContractData } from '../types/models'

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
  contractNames = new Map<string, ContractData>()
  recommendationContractTypes.forEach((contractName) => {
    contractNames.set(contractName, { count: 0, recommendation: true })
  })
  LocalStorage.set('contractNames', Array.from(contractNames))
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
    removeContractName(name: string) {
      this.contractNames.delete(name)
      LocalStorage.set('contractNames', this.archiveNames)
    },
    async addContract({
      contractData,
      usePod = false,
    }: {
      contractData: ContractTable
      usePod: boolean
    }) {
      this.contracts.push(contractData)

      // Save to IndexedDb
      const countIndex = await db.add(contractData)
      if (countIndex === 0) {
        return Promise.reject('Cannot add this item')
      }
      const count = await db.contracts.count()
      this.setContractsCount(count)

      if (!usePod) {
        return
      }

      // Or Save to Pod
      const podStore = usePodStore()
      await podStore.uploadContract(contractData)
    },
    async editContract(contract: FormatContract) {
      const id = Number(contract.identifier.value)
      const count = await db.contracts.where('id').equals(id).modify({
        instrument_description: contract.instrument.description,
      })
      if (count === 0) {
        return Promise.reject('Cannot edit this item')
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
      if (!contractData.sameAs) {
        return Promise.reject('Not exist sameAs')
      }
      return usePodStore().removeFromPod(contractData.sameAs)
    },
    async filterFromContracts(query: string) {
      this.contracts = await db.contracts
        .where('instrument_name')
        .equals(query)
        .reverse()
        .sortBy('startTime')
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
    async loadContractNames() {
      for (const [name, data] of await db.getContractNames()) {
        this.contractNames.set(name, data)
      }
    },
  },
  getters: {
    archiveNames(state) {
      return Array.from(state.contractNames)
    },
    getContractsCount(state) {
      return state.contractsCount
    },
    formatContracts(state): FormatContract[] {
      return formatterContracts(state.contracts)
    },
  },
})
