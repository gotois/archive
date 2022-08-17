import {Module} from 'vuex'
import {Contract, FormatContract, ContractTable} from 'components/models'
import {db} from 'components/ContractDatabase'
import {StateInterface} from './index'
import {formatterContracts} from '../services/schemaHelper'

export interface ContractState {
  contracts: Contract[];
  contractsCount: number;
}

const Contract: Module<ContractState, StateInterface> = {
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
  },
  actions: {
    async addContract(context, contract: ContractTable) {
      context.commit('addContract', contract)
      await db.contracts.add(contract)
    },
    async filterFromContracts(context, {query}: {query: string}) {
      const contracts = await db.contracts.where('instrument_name')
        .equals(query)
        .reverse()
        .toArray() as Contract[]
      context.commit('setContractsCount', contracts.length)
      context.commit('setContracts', contracts)
    },
    async searchFromContracts(context, { query, offset, limit }: { query: string, offset: number, limit: number }) {
      if (query.length <= 0) {
        context.commit('setContracts', [])
        return
      }
      const searchTerms = query.split(' ')
      const count = await db.contracts.where('instrument_name')
        .startsWithAnyOfIgnoreCase(searchTerms)
        .or('instrument_name')
        .anyOfIgnoreCase(searchTerms)
        .count()
      context.commit('setContractsCount', count)
      if (!count) {
        context.commit('setContracts', [])
        return
      }
      const contracts = await db.contracts.where('instrument_name')
        .startsWithAnyOfIgnoreCase(searchTerms)
        .or('instrument_name')
        .anyOfIgnoreCase(searchTerms)
        .reverse()
        .offset(offset)
        .limit(limit)
        .toArray() as Contract[]
      context.commit('setContracts', contracts)
    },
    async loadAllContracts(context, {offset,limit}: {offset: number, limit: number}) {
      const count: number = await db.contracts.count()
      context.commit('setContractsCount', count)
      if (!count) {
        context.commit('setContracts', [])
        return
      }
      const contracts = await db.contracts.orderBy('startTime')
        .reverse()
        .offset(offset)
        .limit(limit)
        .toArray() as Contract[]
      context.commit('setContracts', contracts)
    },
  },
  getters: {
    contracts(state): FormatContract[] {
      return formatterContracts(state.contracts)
    },
    contractsCount(state) {
      return state.contractsCount ?? 0
    },
  },
}

export default Contract
