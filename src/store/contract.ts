import { Module } from 'vuex'
import MiniSearch from 'minisearch'
import { Contract, FormatContract, ContractTable } from '../types/models'
import { StateInterface } from './index'
import { db } from '../services/databaseHelper'
import { formatterContracts } from '../services/schemaHelper'

export interface ContractState {
  contracts: Contract[]
  contractsCount: number
}

const ContractClass: Module<ContractState, StateInterface> = {
  state: () => ({
    contracts: [],
    contractsCount: 0,
  }),
  mutations: {
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
      }: { query: string; offset: number; limit: number },
    ) {
      if (query.length <= 0) {
        context.commit('setContracts', [])
        return
      }
      const searchTerms = query.split(' ').map((term) => term.toLowerCase())
      const cursor = db.contracts.orderBy('startTime').filter((contract) => {
        const instrumentName = contract.instrument_name.toLowerCase()
        const instrumentDescription =
          contract.instrument_description.toLowerCase()
        const agentName = contract.agent_name.toLowerCase()
        return searchTerms.some((term) => {
          if (instrumentName.includes(term)) return true
          if (instrumentDescription.includes(term)) return true
          if (agentName.includes(term)) return true
        })
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
    // Index all documents
    async loadFullText(context) {
      const documents = context.state.contracts
      const miniSearch = new MiniSearch({
        fields: ['instrument_name', 'instrument_description'],
        searchOptions: {
          boost: {
            instrument_name: 2,
          },
        },
      })
      await miniSearch.addAllAsync(documents)

      return miniSearch
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
  },
  getters: {
    pureContracts(state) {
      return state.contracts
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
