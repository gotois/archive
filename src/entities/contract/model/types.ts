import type { Agent, Place } from '@/shared/model/contact'
import type { FormatImageType } from '@/shared/model/media'
import type { Proof } from '@/shared/model/jsonld'
import type {
  ContractNameRecord,
  ContractRecord,
} from '@/shared/model/persistence'

export interface ContractDate {
  id: number
  start: string
  end?: string
}

export type ContractTable = ContractRecord

interface BaseSchemaType {
  '@type': string
}

interface ContractInstrument {
  name: string
  description: string
}

export interface FormatContract extends BaseSchemaType {
  '@context': string
  'sameAs'?: string
  'agent': FormatContractAgent
  'participant': FormatContractParticipant
  'instrument': FormatContractInstrument
  'startTime': Date
  'endTime'?: Date
  'location'?: FormatPlace
  'proof'?: Proof
  'object': FormatImageType[]
}

export interface FormatContractAgent extends BaseSchemaType, Agent {}
export interface FormatContractParticipant extends BaseSchemaType, Agent {}
interface FormatContractInstrument extends BaseSchemaType, ContractInstrument {}
export interface FormatPlace extends BaseSchemaType, Place {}

export type ContractData = ContractNameRecord

export interface FullTextDocument {
  id: number
  name: string
  endTime: Date
  description: string
}
