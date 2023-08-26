export enum WalletType {
  Phantom = 'Phantom Wallet',
  Secret = 'Unknown Wallet', // Solana base58
  Unknown = 'No Wallet',
}

export interface ContractDate {
  id: number
  start: string
  end?: string
}

export interface ContractTable {
  id?: number
  context: credentialContextType
  type: string[]
  issuer: string
  issuanceDate: Date
  identifier: ContractIdentifier[]
  proof?: Proof
  agent_name: string
  agent_email: string
  participant_name: string
  participant_email: string
  instrument_name: string
  instrument_description?: string
  startTime: Date
  endTime?: Date | null
  images?: {
    contentUrl: string
    encodingFormat: string
  }[]
  resource_url?: string
}

export interface KeysTable {
  id?: number
  publicKey: string
  privateKey: Uint8Array
  type: string
  clusterApiUrl?: string
}

export interface DIDTable {
  id: string
  controller: string
  type: 'Ed25519VerificationKey2020'
  publicKeyMultibase: string
  privateKeyMultibase: string
}

interface ContextCredential<T> {
  [key: string]: T
}

enum ProofTypes {
  Ed25519Signature2020 = 'Ed25519Signature2020',
}

interface Proof {
  type: ProofTypes
  created: string
  verificationMethod: string
  proofPurpose: string
  proofValue: string
}

interface BaseCredentialSubject {
  id: string
}

export interface Credential {
  '@context': credentialContextType
  'id': string
  'type': string[]
  'issuer': string
  'issuanceDate': Date
  'credentialSubject': CredentialSubject
}

export enum BaseContext {
  schemaOrg = 'https://schema.org',
}

export interface ProofCredential extends Credential {
  proof: Proof
}

export type credentialSubjectType = BaseCredentialSubject | CredentialSubject
export type credentialContextType =
  | [string, ContextCredential<string>]
  | string[]

export interface BaseContract {
  id?: string
  agent: FormatContractAgent
  participant: FormatContractParticipant
  instrument: FormatContractInstrument
  identifier: FormatContractIdentifier
  startTime: Date
  endTime?: Date
  object: string[]
}

export interface CredentialTypes {
  agent: string
  endTime: string
  value: string
  instrument: string
  object: string
  participant: string
  startTime: string
  identifier: string
  contentUrl: string
  description: string
  email: string
  encodingFormat: string
  name: string
  propertyID: string
  url: string
}

interface Person {
  name: string
  email?: string
}

interface ContractIdentifier {
  value: string | number
  name: string | WalletType
  propertyID?: number
}

interface ContractInstrument {
  name: string
  description: string
}

interface BaseSchemaType {
  '@type': string
}

interface ImageType {
  '@type': string
  'contentUrl': string
  'encodingFormat': string
}

export interface FormatContract extends BaseSchemaType {
  '@context': string
  'sameAs'?: string
  'agent': FormatContractAgent
  'participant': FormatContractParticipant
  'instrument': FormatContractInstrument
  'identifier': FormatContractIdentifier[]
  'startTime': Date
  'endTime'?: Date
  'object': ImageType[]
}
export interface FormatContractAgent extends BaseSchemaType, Person {}
export interface FormatContractParticipant extends BaseSchemaType, Person {}
interface FormatContractIdentifier extends BaseSchemaType, ContractIdentifier {}
interface FormatContractInstrument extends BaseSchemaType, ContractInstrument {}

export interface CredentialSubject {
  agent: Person
  participant: Person
  instrument: ContractInstrument
  identifier: ContractIdentifier[]
  startTime: Date
  endTime?: Date
  object: ImageType[]
  url: string
  sameAs?: string
}

export interface MyContract {
  agent_email: string
  agent_name: string
  agent_legal: boolean
  images?: string[]
  instrument_description?: string
  instrument_name: string
  participant_name: string
  participant_email: string
  startTime: Date
  endTime?: Date
}

export type ContractData = {
  count: number
  recommendation: boolean
}
