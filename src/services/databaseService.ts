import Dexie from 'dexie'
import { Platform } from 'quasar'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020'
import { PublicKey } from '@solana/web3.js'
import recommendationContractTypes from './recommendationContractEnum'
import {
  ContractTable,
  KeysTable,
  DIDTable,
  ContractData,
} from '../types/models'
import { WalletType } from './cryptoService'

class KeyPairDatabase extends Dexie {
  public keyPair: Dexie.Table<DIDTable, number>

  public constructor() {
    super('KeyPairDatabase')

    if (!Platform.has.webStorage) {
      throw new Error('webStorage not supported')
    }

    this.version(1).stores({
      keyPair: 'id, controller, type, publicKeyMultibase, privateKeyMultibase',
    })
    this.keyPair = this.table('keyPair')
  }

  async prepareKeyPair() {
    const keys = await this.last()
    const exportKeys = keys.export({
      publicKey: true,
      privateKey: true,
    })
    return JSON.stringify(exportKeys, null, 2)
  }

  public async last() {
    const keysTable = await this.keyPair.reverse().last()
    if (!keysTable) {
      throw new Error('KeyPair not found')
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    return Ed25519VerificationKey2020.from(keysTable) as DIDTable
  }

  generateNewKeyPair(controller: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    return Ed25519VerificationKey2020.generate({
      controller,
    }) as Promise<DIDTable>
  }
  async setKeyPair(keyPair: DIDTable) {
    await this.destroy()
    return this.keyPair.add(keyPair)
  }

  public destroy() {
    return this.keyPair.clear()
  }
}

class SolanaKeysDatabase extends Dexie {
  public keys: Dexie.Table<KeysTable, number> // id is number in this case

  public constructor() {
    super('SolanaKeysDatabase')

    if (!Platform.has.webStorage) {
      throw new Error('webStorage not supported')
    }

    this.version(1).stores({
      keys: '++id, publicKey, privateKey, type, clusterApiUrl',
    })
    this.keys = this.table('keys')
  }

  public async last(): Promise<{
    type: WalletType
    publicKey: PublicKey
    secretKey?: Uint8Array
    clusterApiUrl?: string
  } | null> {
    const keysTable = await this.keys.reverse().last()
    if (!keysTable) {
      return null
    }
    switch (keysTable.type) {
      case WalletType.Phantom: {
        return {
          type: WalletType.Phantom,
          publicKey: new PublicKey(keysTable.publicKey),
        }
      }
      case WalletType.Unknown: {
        if (!keysTable.privateKey) {
          throw new Error('Error privateKey')
        }
        return {
          type: WalletType.Unknown,
          secretKey: keysTable.privateKey,
          publicKey: new PublicKey(keysTable.publicKey),
          clusterApiUrl: keysTable.clusterApiUrl,
        }
      }
      default: {
        throw new Error(`Unknown type: ${String(keysTable.type)}`)
      }
    }
  }

  public async add(keyPair: KeysTable) {
    await this.destroy()
    return this.keys.add(keyPair)
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
    await this.contracts.each((value) => {
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
    await this.contracts.each((contract) => {
      documents.push({
        id: contract.id,
        instrument_name: contract.instrument_name,
        instrument_description: contract.instrument_description,
      })
    })
    return documents
  }

  public add(contract: ContractTable) {
    return this.contracts.add(contract)
  }

  public update(id: number, contract: ContractTable) {
    return this.contracts.update(id, contract)
  }

  public remove(id: number) {
    return this.contracts.where('id').equals(id).delete()
  }

  public destroy() {
    return this.contracts.clear()
  }
}

export const db = new ContractDatabase()
export const keys = new SolanaKeysDatabase()
export const keyPair = new KeyPairDatabase()
