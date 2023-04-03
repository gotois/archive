export interface ContractTable {
  id?: number
  agent_name: string
  participant_name: string
  instrument_name: string
  instrument_description?: string
  startTime: Date
  endTime?: Date | null
  images?: string[]
  resource_url?: string
}

interface ContextCredential<T> {
  [key: string]: T
}
// eslint-disable-next-line no-unused-vars
enum ProofTypes {
  // eslint-disable-next-line
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

interface ContractAgent {
  name: string
}

interface ContractParticipant {
  name: string
}

interface ContractIdentifier {
  propertyID: string
  value: string
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
  '_currentSlide'?: number
  'agent': FormatContractAgent
  'participant': FormatContractParticipant
  'instrument': FormatContractInstrument
  'identifier': FormatContractIdentifier
  'startTime': Date
  'endTime'?: Date
  'object': {
    '@type': string
    'contentUrl': string
  }[]
}
interface FormatContractAgent extends BaseSchemaType, ContractAgent {}
interface FormatContractParticipant
  extends BaseSchemaType,
    ContractParticipant {}
interface FormatContractIdentifier extends BaseSchemaType, ContractIdentifier {}
interface FormatContractInstrument extends BaseSchemaType, ContractInstrument {}

export interface CredentialSubject {
  id: string
  agent: ContractAgent
  participant: ContractParticipant
  instrument: ContractInstrument
  identifier: ContractIdentifier
  startTime: Date
  endTime?: Date
  object: string[]
}
