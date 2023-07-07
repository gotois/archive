export interface ContractTable {
  id?: number
  agent_name: string
  agent_email: string
  participant_name: string
  participant_email: string
  instrument_name: string
  instrument_description?: string
  startTime: Date
  endTime?: Date | null
  images?: string[]
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

interface Issuer {
  id: string
}

export interface Credential {
  '@context': credentialContextType
  'type': string[]
  'issuer': Issuer
  'issuanceDate': string
  'credentialSubject': credentialSubjectType
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
}

interface Person {
  name: string
  email?: string
}

interface ContractIdentifier {
  propertyID: string
  value: string
  name?: string // здесь может храниться signature от Phantom Solana
}

interface ContractInstrument {
  name: string
  description: string
}

interface BaseSchemaType {
  '@type': string
}

export interface FormatContract extends BaseSchemaType {
  '@context': string
  'sameAs'?: string
  'agent': FormatContractAgent
  'participant': FormatContractParticipant
  'instrument': FormatContractInstrument
  'identifier': FormatContractIdentifier
  'startTime': Date
  'endTime'?: Date
  'object': {
    '@type': string
    'contentUrl': string
    'encodingFormat': string
  }[]
}
export interface FormatContractAgent extends BaseSchemaType, Person {}
export interface FormatContractParticipant extends BaseSchemaType, Person {}
interface FormatContractIdentifier extends BaseSchemaType, ContractIdentifier {}
interface FormatContractInstrument extends BaseSchemaType, ContractInstrument {}

export interface CredentialSubject {
  id: string
  agent: Person
  participant: Person
  instrument: ContractInstrument
  identifier: ContractIdentifier
  startTime: Date
  endTime?: Date
  object: string[]
}

export type ContractData = {
  count: number
  recommendation: boolean
}
