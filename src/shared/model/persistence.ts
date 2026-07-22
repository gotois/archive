import type { Agent } from './contact'
import type { Attachment } from './media'
import type { credentialContextType, Proof } from './jsonld'

export enum WalletRecordType {
  Phantom = 'Phantom Wallet',
  Secret = 'Unknown Wallet',
  Unknown = 'No Wallet',
}

export interface KeysTable {
  id?: number
  publicKey: string
  privateKey: Uint8Array
  type: string
  clusterApiUrl?: string
}

export interface ContractRecord {
  id?: number
  resolver: string
  context: credentialContextType
  type: string[]
  issuer: string
  issuanceDate: Date
  proof?: Proof | Proof[]
  location?: string
  tag: string[]
  organizer: Agent
  participant: Agent[]
  link?: string
  name: string
  description?: string
  startTime: Date
  endTime?: Date
  attachment?: Attachment[]
  resource_url?: string
}

export type ContractNameRecord = {
  count: number
  recommendation: boolean
}

export interface DIDTable {
  id: string
  controller: string
  type: 'Ed25519VerificationKey2020'
  publicKeyMultibase: string
  privateKeyMultibase: string
}
