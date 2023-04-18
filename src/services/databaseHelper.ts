import Dexie from 'dexie'
import { Platform } from 'quasar'
import { ContractTable } from '../types/models'

export class ContractDatabase extends Dexie {
  public contracts: Dexie.Table<ContractTable, number> // id is number in this case

  public constructor() {
    super('ContractDatabase')
    this.version(2)
      .stores({
        contracts:
          '++id, agent_name, participant_name, instrument_name, instrument_description, startTime, endTime, *images, *resource_url',
      })
      .upgrade((/* trans */) => {
        return
      })
    this.contracts = this.table('contracts')
  }

  public async getContractNames() {
    const map: Map<string, { count: number }> = new Map()
    await db.contracts.each((value) => {
      let count = 1
      if (map.get(value.instrument_name)) {
        count += map.get(value.instrument_name).count
      }
      map.set(value.instrument_name, { count })
    })
    return map
  }

  public async getFulltextDocument() {
    const documents: {
      id: number
      instrument_name: string
      instrument_description: string
    }[] = []
    await db.contracts.each((contract) => {
      documents.push({
        id: contract.id,
        instrument_name: contract.instrument_name,
        instrument_description: contract.instrument_description,
      })
    })
    return documents
  }

  public add(contract: ContractTable) {
    if (!Platform.has.webStorage) {
      throw new Error('webStorage not supported')
    }
    return db.contracts.add(contract)
  }

  public update(id: number, contract: ContractTable) {
    if (!Platform.has.webStorage) {
      throw new Error('webStorage not supported')
    }
    return db.contracts.update(id, contract)
  }

  public remove(id: number) {
    if (!Platform.has.webStorage) {
      throw new Error('webStorage not supported')
    }
    return db.contracts.where('id').equals(id).delete()
  }

  public destroy() {
    return this.contracts.clear()
  }
}

export const db = new ContractDatabase()
