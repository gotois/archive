import Dexie from 'dexie'
import {ContractTable} from '../types/models'

export class ContractDatabase extends Dexie {
  public contracts: Dexie.Table<ContractTable, number> // id is number in this case

  public constructor() {
    super('ContractDatabase')
    this.version(1).stores({
      contracts: '++id, agent_name, participant_name, instrument_name, instrument_description, startTime, endTime, *images',
    })
    this.contracts = this.table('contracts')
  }

  public async getContractNames() {
    const map: Map<string, {count: number}> = new Map()
    await db.contracts.each((value) => {
      let count = 1
      if (map.get(value.instrument_name)) {
        count += map.get(value.instrument_name).count
      }
      map.set(value.instrument_name, { count })
    })
    return map
  }

  public add(contract: ContractTable) {
    return db.contracts.add(contract)
  }

  public remove(id: number) {
    return db.contracts.where('id')
      .equals(id)
      .delete()
  }

  public destroy() {
    return this.contracts.clear()
  }
}

export const db = new ContractDatabase()
