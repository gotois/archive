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
  resolver: string // возможно дублирование с id
  context: credentialContextType
  type: string[]
  issuer: string
  issuanceDate: Date
  identifier: ContractIdentifier[]
  proof?: Proof | Proof[]
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
  endTime?: Date
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
  created: string
  proofPurpose: string
  proofValue: string
  type: ProofTypes.Ed25519Signature2020
  verificationMethod: string
}

export interface VerifiedCredential {
  '@context': credentialContextType
  'credentialSubject': CredentialSubject
  'id': string
  'issuanceDate': string
  'issuer': string
  'proof'?: Proof | Proof[]
  'type': string[]
}

export interface Presentation {
  '@context': string[]
  'proof': Proof | Proof[]
  'type': string[]
  'verifiableCredential': ProofCredential[]
}

export interface ProofCredential extends VerifiedCredential {
  proof: Proof
}

export type credentialContextType =
  | [string, ContextCredential<string>]
  | string[]

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

export interface FormatImageType extends BaseSchemaType, ImageType {}

export interface ImageType {
  url: string
  mediaType: string
  name?: string
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

export interface Calendar {
  categories: string[]
  description: string | null
  start: string // like Date
  end: string | null // like Date
  location: string | null
  organizer: string | null // has name, email, telephone, url
  summary: string
}

export interface CalendarEventExternal {
  id: number | string
  start: string
  end: string
  title?: string
  people?: string[]
  location?: string
  description?: string
  calendarId?: string
  _customContent?: {
    timeGrid?: string
    dateGrid?: string
    monthGrid?: string
    monthAgenda?: string
  }
}

export type ActivityObjectNote = {
  type: 'Note'
  content: string
  mediaType: string
}

export type ActivityObjectLink = {
  type: 'Link'
  href: string
}

export type Activity = {
  '@context': string
  'type': string
  'object'?:
    | ActivityObjectNote
    | ActivityObjectNote[]
    | ActivityObjectLink
    | ActivityObjectLink[]
    | { type: 'Activity' }
  'startTime'?: string
  'actor'?: unknown
}

export interface NavigationDate {
  year: number
  month: number
}

export interface TelegramUser {
  id: string
  first_name: string
  last_name?: string
  username: string
  photo_url?: string
  auth_date: string
  hash: string
}

export interface Suite {
  verifier: unknown
  verificationMethod: string
  useNativeCanonize: unknown
  type: string
  signer: unknown
  requiredKeyType: string
  proof: unknown
  key: unknown
  contextUrl: string
  canonizeOptions: unknown
  LDKeyClass: unknown
}
