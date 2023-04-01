export interface ContractTable {
  id?: number
  agent_name: string
  participant_name: string
  instrument_name: string
  instrument_description?: string
  startTime: Date
  endTime?: Date | null
  images?: string[]
}

export interface ContextCredential<T> {
  [key: string]: T
}

export interface Credential {
  '@context': string[] | ContextCredential<string>[]
  'type': string[]
  'issuer': { id: string }
  'issuanceDate': string
  'credentialSubject': { id: string }
}

export interface FormatContract {
  '@context': string
  '@type': string
  'agent': FormatContractAgent
  'participant': FormatContractParticipant
  'instrument': FormatContractInstrument
  'identifier': FormatContractIdentifier
  'startTime': Date
  'endTime': Date
  'object': FormatContractObject[]
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
