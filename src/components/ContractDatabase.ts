import Dexie from 'dexie'
import {ContractTable} from './models'

export class ContractDatabase extends Dexie {
  public contracts: Dexie.Table<ContractTable, number> // id is number in this case

  public constructor() {
    super('ContractDatabase')
    this.version(1).stores({
      contracts: '++id, agent_name, participant_name, instrument_name, instrument_description, startTime, endTime, *images'
    })
    this.contracts = this.table('contracts')
  }
}

export const db = new ContractDatabase()

