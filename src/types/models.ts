import { WebId } from '@inrupt/solid-client'

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
  location?: string
  agent_name: string
  agent_email: string
  participant_name: string // todo - вместо этого сейчас participant_sameAs
  participant_email: string // todo поддержать массив
  participant_tel: string // todo поддержать массив
  participant_url: string // todo поддержать массив
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

export interface Presentation {
  '@context': string[]
  'proof': Proof | Proof[]
  'type': string[]
  'verifiableCredential': ProofCredential[]
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

export interface Agent {
  type: 'Organization' | 'Person'
  sameAs: WebId
  name?: string
  email?: string
  telephone?: string
  url?: string
}

export interface GeoCoordinates {
  '@type': 'GeoCoordinates'
  'latitude': number
  'longitude': number
}

export interface Place {
  geo: GeoCoordinates
  name?: string
}

export interface ContractIdentifier {
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

interface FormatImageType extends BaseSchemaType, ImageType {}

export interface ImageType {
  contentUrl: string
  encodingFormat: string
  caption?: string
}

export interface OwnerContract {
  agent?: Agent
  participant?: Agent
  instrument?: ContractInstrument
  files: ImageType[]
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
  'location'?: FormatPlace
  'proof'?: Proof
  'object': FormatImageType[]
}
export interface FormatContractAgent extends BaseSchemaType, Agent {}
export interface FormatContractParticipant extends BaseSchemaType, Agent {}
interface FormatContractIdentifier extends BaseSchemaType, ContractIdentifier {}
interface FormatContractInstrument extends BaseSchemaType, ContractInstrument {}
export interface FormatPlace extends BaseSchemaType, Place {}

export interface CredentialSubject {
  agent: Agent
  participant: Agent
  instrument: ContractInstrument
  identifier: ContractIdentifier[]
  startTime: Date
  endTime?: Date
  object: ImageType[]
  location?: Place
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
  participant_email?: string
  participant_tel?: string
  participant_url?: string
  location?: Place
  startTime: Date
  endTime?: Date
}

export type ContractData = {
  count: number
  recommendation: boolean
}

export interface FullTextDocument {
  id: number
  instrument_name: string
  endTime: Date
  instrument_description: string
}
