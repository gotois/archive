import { defineStore } from 'pinia'
import usePodStore from './pod'
import { db } from '../services/databaseHelper'
import { recommendationContractTypes } from '../services/recommendationContractTypes'
import { formatterContracts } from '../services/schemaHelper'
import { FormatContract, ContractTable } from '../types/models'

interface Store {
  contracts: ContractTable[]
  contractNames: Map<string, { count: number }>
  contractsCount: number
}

export default defineStore('contracts', {
  state: (): Store => ({
    contracts: [],
    contractNames: new Map(),
    contractsCount: 0,
  }),
  actions: {
    async addContract({
      contractData,
      usePod = false,
    }: {
      contractData: ContractTable
      usePod: boolean
    }) {
      this.contracts.push(contractData)

      // Save to IndexedDb
      await db.add(contractData)

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
      const count = await db.remove(id)
      if (count === 0) {
        return Promise.reject('Cannot remove this item')
      }
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
      const contracts = await db.contracts
        .where('instrument_name')
        .equals(query)
        .reverse()
        .sortBy('startTime')
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
      this.contractsCount = searchResults.length
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
    formatContracts(state): FormatContract[] {
      return formatterContracts(state.contracts)
    },
  },
})
