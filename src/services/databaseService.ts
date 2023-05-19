import Dexie from 'dexie'
import { Platform } from 'quasar'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020'
import recommendationContractTypes from '../services/recommendationContractEnum'
import { ContractTable, KeysTable, ContractData } from '../types/models'

class KeysDatabase extends Dexie {
  public keys: Dexie.Table<KeysTable, number> // id is number in this case

  public constructor() {
    super('KeysDatabase')

    if (!Platform.has.webStorage) {
      throw new Error('webStorage not supported')
    }

    this.version(1).stores({
      keys: '++id, publicKey, privateKey, type',
    })
    this.keys = this.table('keys')
  }

  public async last() {
    const keysTable = await keys.keys.reverse().last()
    if (!keysTable) {
      throw new Error('KeyPair not found')
    }
    switch (keysTable.type) {
      case 'Ed25519VerificationKey2020': {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-return
        return Ed25519VerificationKey2020.from({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          publicKeyMultibase: keysTable.publicKey,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          privateKeyMultibase: keysTable.privateKey,
        })
      }
      default: {
        throw new Error(`Unknown type: ${String(keysTable.type)}`)
      }
    }
  }

  public add(keyPair: {
    type: string
    privateKeyMultibase: string
    publicKeyMultibase: string
  }) {
    return keys.keys.add({
      publicKey: keyPair.publicKeyMultibase,
      privateKey: keyPair.privateKeyMultibase,
      type: keyPair.type,
    })
  }

  public destroy() {
    return this.keys.clear()
  }
}

class ContractDatabase extends Dexie {
  public contracts: Dexie.Table<ContractTable, number> // id is number in this case

  public constructor() {
    super('ContractDatabase')

    if (!Platform.has.webStorage) {
      throw new Error('webStorage not supported')
    }

    this.version(2)
      .stores({
        contracts:
          '++id, agent_name, agent_email, participant_name, participant_email, instrument_name, instrument_description, startTime, endTime, *images, *resource_url',
      })
      .upgrade((/* trans */) => {
        return
      })
    this.contracts = this.table('contracts')
  }

  public async getContractNames() {
    const map: Map<string, ContractData> = new Map()
    recommendationContractTypes.forEach((contractName) => {
      map.set(contractName, { count: 0, recommendation: true })
    })
    await db.contracts.each((value) => {
      let count = 1
      if (map.get(value.instrument_name)) {
        count += map.get(value.instrument_name).count
      }
      map.set(value.instrument_name, { count, recommendation: false })
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
    return db.contracts.add(contract)
  }

  public update(id: number, contract: ContractTable) {
    return db.contracts.update(id, contract)
  }

  public remove(id: number) {
    return db.contracts.where('id').equals(id).delete()
  }

  public destroy() {
    return this.contracts.clear()
  }
}

export const db = new ContractDatabase()
export const keys = new KeysDatabase()
