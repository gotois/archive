export interface Contract {
  agent_name: string;
  participant_name: string;
  instrument_name: string;
  instrument_description: string;
  startTime: Date;
  endTime: Date;
  images: Array<string>;
}

export interface ContractTable {
  id?: number;
  'agent_name'?: string;
  'participant_name'?: string;
  'instrument_name'?: string;
  'instrument_description'?: string;
  'startTime'?: Date;
  'endTime'?: Date;
  'images'?: Array<Blob>;
}

export interface FormatContract {
  '@context': string;
  '@type': string;
  agent: {
    '@type': string;
    name: string;
  };
  participant: {
    '@type': string;
    name: string
  };
  instrument: {
    '@type': string;
    name: string;
    description: string
  };
  startTime: Date;
  endTime: Date;
  object: Array<{ '@type': string, contentUrl: string }>;
}
