import { Module } from 'vuex'
import { Contract, FormatContract, ContractTable } from '../types/models'
import { StateInterface } from './index'
import { db } from '../services/databaseHelper'
import { recommendationContractTypes } from '../services/recommendationContractTypes'
import { formatterContracts } from '../services/schemaHelper'

export interface ContractState {
  contracts: Contract[]
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
    setContracts(state, contracts: Contract[]) {
      state.contracts = contracts
    },
    addContract(state, contract: Contract) {
      state.contracts.push(contract)
    },
    removeContract(state, id: number) {
      const i = state.contracts.map((item) => item.id).indexOf(id)
      state.contracts.splice(i, 1)
    },
  },
  actions: {
    async addContract(context, contractTable: ContractTable) {
      await db.add(contractTable)
      context.commit('addContract', contractTable)
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
    async removeContract(context, contract: FormatContract) {
      const id = Number(contract.identifier.value)
      context.commit('removeContract', id)
      const count = await db.remove(id)
      if (count === 0) {
        console.error('Cannot remove this item')
        return
      }
    },
    async filterFromContracts(context, { query }: { query: string }) {
      const contracts = (await db.contracts
        .where('instrument_name')
        .equals(query)
        .reverse()
        .toArray()) as Contract[]
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
      const contracts = (await cursor
        .reverse()
        .offset(offset)
        .limit(limit)
        .toArray()) as Contract[]
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
      const contracts = (await db.contracts
        .orderBy('startTime')
        .reverse()
        .offset(offset)
        .limit(limit)
        .toArray()) as Contract[]
      context.commit('setContracts', contracts)
    },
    async loadContractNames(context) {
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
