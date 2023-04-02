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

export interface ContextCredential<T> {
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

interface CredentialSubject<T> {
  [key: string]: T
}

export interface Credential<T> {
  '@context': [string, ContextCredential<string>] | string[]
  'type': string[]
  'issuer': { id: string }
  'issuanceDate': string
  'credentialSubject': { id: string } | CredentialSubject<T>
}

export interface ProofCredential<T> extends Credential<T> {
  proof: Proof
}

export interface BaseContract {
  id?: string
  agent: FormatContractAgent
  participant: FormatContractParticipant
  instrument: FormatContractInstrument
  identifier: FormatContractIdentifier
  startTime: Date
  endTime?: Date
  object: FormatContractObject[]
}

export interface FormatContract extends BaseContract {
  '@context': string
  '@type': string
  'sameAs'?: string
  '_currentSlide'?: number
}

interface FormatContractAgent {
  '@type': string
  'name': string
}

interface FormatContractParticipant {
  '@type': string
  'name': string
}

interface FormatContractIdentifier {
  '@type': string
  'propertyID': string
  'value': string
}

interface FormatContractInstrument {
  '@type': string
  'name': string
  'description': string
}

export interface FormatContractObject {
  '@type': string
  'contentUrl': string
}
