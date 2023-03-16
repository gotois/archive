export interface Contract {
  id: number
  agent_name: string
  participant_name: string
  instrument_name: string
  instrument_description: string
  startTime: Date
  endTime: Date
  images: string[]
}

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

export interface FormatContract {
  '@context': string
  '@type': string
  'agent': {
    '@type': string
    'name': string
  }
  'participant': {
    '@type': string
    'name': string
  }
  'instrument': {
    '@type': string
    'name': string
    'description': string
  }
  'identifier': {
    '@type': string
    'propertyID': string
    'value': string
  }
  'startTime': Date
  'endTime': Date
  'object': FormatContractObject[]
  '_currentSlide'?: number
}

export interface FormatContractObject {
  '@type': string
  'contentUrl': string
}
