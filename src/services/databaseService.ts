import Dexie from 'dexie'
import { Platform } from 'quasar'
import { PublicKey } from '@solana/web3.js'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020'
import recommendationContractTypes from './recommendationContractEnum'
import {
  ContractTable,
  KeysTable,
  DIDTable,
  ContractData,
  MyContract,
  WalletType,
  FullTextDocument,
} from '../types/models'
import { getContractFromLD } from '../helpers/schemaHelper'
import { Suite } from './cryptoService'
import Dogovor from './contractGeneratorService'

export function reset() {
  return Promise.all([
    Dexie.delete('KeyPairDatabase'),
    Dexie.delete('SolanaKeysDatabase'),
    Dexie.delete('ContractDatabase'),
  ])
}

export function deleteDatabases() {
  indexedDB.deleteDatabase('KeysDatabase')
  indexedDB.deleteDatabase('SolanaKeysDatabase')
  indexedDB.deleteDatabase('ContractDatabase')
}

class KeyPairDatabase extends Dexie {
  public keyPair: Dexie.Table<DIDTable, number>

  public constructor() {
    super('KeyPairDatabase')

    if (!Platform.has.webStorage) {
      throw new Error('webStorage not supported')
    }

    this.version(1).stores({
      keyPair:
        '&id, controller, type, &publicKeyMultibase, privateKeyMultibase',
    })
    this.keyPair = this.table('keyPair')
  }

  async prepareKeyPair() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const keys = await this.last()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
    return Ed25519VerificationKey2020.from(keysTable) as unknown
  }

  generateNewKeyPair(controller: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    return Ed25519VerificationKey2020.generate({
      controller,
    }) as Promise<DIDTable>
  }
  async setKeyPair(keyPair: DIDTable) {
    await this.keyPair.clear()
    return this.keyPair.add(keyPair)
  }

  async getSuite() {
    const key = await keyPair.last()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return new Ed25519Signature2020({
      key: key,
    }) as Suite
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async destroy() {
    this.close()
    try {
      void this.delete()
    } catch (error) {
      console.error(error)
    } finally {
      void this.open()
    }
  }
}

class SolanaKeysDatabase extends Dexie {
  public keys: Dexie.Table<KeysTable, number> // id is number in this case

  public constructor() {
    super('SolanaKeysDatabase')

    if (!Platform.has.webStorage) {
      throw new Error('webStorage not supported')
    }

    this.version(2).stores({
      keys: '&publicKey, privateKey, type, *clusterApiUrl',
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
    switch (keysTable.type as WalletType) {
      case WalletType.Phantom: {
        return {
          type: WalletType.Phantom,
          publicKey: new PublicKey(keysTable.publicKey),
        }
      }
      case WalletType.Secret: {
        if (!keysTable.privateKey) {
          throw new Error('Error privateKey')
        }
        return {
          type: WalletType.Secret,
          secretKey: keysTable.privateKey,
          publicKey: new PublicKey(keysTable.publicKey),
          clusterApiUrl: keysTable.clusterApiUrl,
        }
      }
      case WalletType.Unknown: {
        return {
          publicKey: null,
          secretKey: null,
          type: WalletType.Unknown,
        }
      }
      default: {
        throw new Error(`Unknown type: ${String(keysTable.type)}`)
      }
    }
  }

  public async add(keyPair: KeysTable) {
    await this.keys.clear()
    return this.keys.add(keyPair)
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async destroy() {
    this.close()
    try {
      void this.delete()
    } catch (error) {
      console.error(error)
    } finally {
      void this.open()
    }
  }
}

class ContractDatabase extends Dexie {
  public contracts: Dexie.Table<ContractTable, number> // id is number in this case

  public constructor() {
    super('ContractDatabase')

    if (!Platform.has.webStorage) {
      throw new Error('webStorage not supported')
    }
    const contracts = [
      '++id',
      'context',
      'type',
      'issuer',
      '&issuanceDate',
      '*identifier',
      '*proof',
      // todo объединить name и email в один объект agent
      'agent_name',
      'agent_email',
      // todo объединить name, email, tel, url в один participant
      'participant_name',
      'participant_email',
      'participant_tel',
      'participant_url',
      // todo объединить name, description в один instrument
      'instrument_name',
      'instrument_description',
      'location',
      'startTime',
      'endTime',
      '*images',
      '*resource_url',
    ]

    this.version(2)
      .stores({
        contracts: contracts.join(','),
      })
      .upgrade(async (trans) => {
        return trans
          .table('contracts')
          .toCollection()
          .modify((contract) => {
            // fixme - add follow next parameters: 'id', 'resolver'
            const ld = Dogovor.createContractLD(contract as MyContract)
            const ct = getContractFromLD(ld)
            Object.keys(ct).forEach((key) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
              contract[key] = ct[key] as unknown
            })
          })
          .catch((error) => {
            console.error(error)
          })
      })
    this.contracts = this.table('contracts')
  }

  public async getContractNames() {
    const map: Map<string, ContractData> = new Map()
    recommendationContractTypes.forEach((contractName) => {
      map.set(contractName, { count: 0, recommendation: true })
    })
    await this.contracts
      .each((value) => {
        let count = 1
        if (map.get(value.instrument_name)) {
          count += map.get(value.instrument_name).count
        }
        map.set(value.instrument_name, { count, recommendation: false })
      })
      .catch((error) => {
        console.error(error)
      })
    return map
  }

  public async getFulltextDocument() {
    const documents: FullTextDocument[] = []
    await this.contracts.each((contract) => {
      documents.push({
        id: contract.id,
        instrument_name: contract.instrument_name,
        endTime: contract.endTime,
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

  public async destroy() {
    try {
      await this.contracts.clear()
    } catch (e) {
      if (e.name === 'DatabaseClosedError') {
        this.close()
        await this.delete()
      }
    } finally {
      await this.open()
    }
  }
}

export const db = new ContractDatabase()
export const keys = new SolanaKeysDatabase()
export const keyPair = new KeyPairDatabase()
