import {Module} from 'vuex'
import {Contract, FormatContract} from 'components/models';
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
  },
  actions: {
    async searchFromContracts(context, { queryFilter, offset, limit }: { queryFilter: string, offset: number, limit: number }) {
      const searchTerms = queryFilter.split(' ')
      const count = await db.contracts.where('instrument_name')
        .startsWithAnyOfIgnoreCase(searchTerms)
        .or('instrument_name')
        .anyOfIgnoreCase(searchTerms)
        .count()
      context.commit('setContractsCount', count)
      if (count) {
        const contracts = await db.contracts.where('instrument_name')
          .startsWithAnyOfIgnoreCase(searchTerms)
          .or('instrument_name')
          .anyOfIgnoreCase(searchTerms)
          .reverse()
          .offset(offset)
          .limit(limit)
          .toArray()
        context.commit('setContracts', contracts as Contract[])
      }
    },
    async loadAllContracts(context, {offset,limit}: {offset: number, limit: number}) {
      const count: number = await db.contracts.count()
      context.commit('setContractsCount', count)
      if (count) {
        const contracts = await db.contracts.orderBy('startTime')
          .reverse()
          .offset(offset)
          .limit(limit)
          .toArray()
        context.commit('setContracts', contracts as Contract[])
      }
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
