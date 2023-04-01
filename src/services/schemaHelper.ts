/* eslint-disable */
import { ContractTable, FormatContract, Credential, ProofCredential } from '../types/models'
import { getWebId } from '../services/podHelper'

function createCredential(
  webId: string,
  issuanceDate?: string,
): Credential<{ id: string }> {
  return {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    'type': ['VerifiableCredential'],
    'issuer': {
      id: 'https://archive.gotointeractive.com',
    },
    'issuanceDate': issuanceDate ?? new Date().toISOString(),
    'credentialSubject': {
      id: webId,
    },
  }
}

export function formatterContracts(
  contracts: ContractTable[],
): FormatContract[] {
  return contracts.map((contract: ContractTable) => formatterContract(contract))
}

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

function deepMerge<T extends { [key: string]: any }>(target: T, source: DeepPartial<T>): T {
  if (Array.isArray(target)) {
    return (target.concat(source) as unknown) as T;
  }
  if (target && source && typeof target === 'object' && typeof source === 'object') {
    return Object.assign(
      target,
      ...Object.keys(source).map((key) => ({ [key]: deepMerge(target[key as keyof T], source[key as keyof T] as DeepPartial<T[keyof T]> ) }))
    )
  }
  return source as T;
}

export function formatterLDContract(formatContract: FormatContract) {
  const context = new Map()
  const credentialSubject = new Map()

  const webId = getWebId()
  const baseCredential = createCredential(webId)
  const type = formatContract['@type']
  const agent = formatContract.agent
  const participant = formatContract.participant
  const instrument = formatContract.instrument
  const identifier = formatContract.identifier
  const startTime = formatContract.startTime
  const endTime = formatContract.endTime
  const object = formatContract.object

  const schemaUrl = formatContract['@context'] + '/'
  context.set(formatContract['@type'], schemaUrl + formatContract['@type'])
  context.set('agent', schemaUrl + agent['@type'])
  context.set('name', 'https://schema.org/name')
  context.set('instrument', 'https://schema.org/instrument')
  context.set('description', 'https://schema.org/description')
  context.set('participant', 'https://schema.org/participant')
  context.set('identifier', 'https://schema.org/identifier')
  context.set('startTime', 'https://schema.org/startTime')
  context.set('endTime', 'https://schema.org/endTime')
  context.set('propertyID', 'https://schema.org/propertyID')
  context.set('value', 'https://schema.org/value')
  context.set('object', 'https://schema.org/ImageObject')

  credentialSubject.set('agent', {
    name: formatContract.agent.name
  })
  credentialSubject.set('instrument', {
    name: instrument.name,
    description: instrument.description,
  })
  credentialSubject.set('startTime', startTime.toJSON())
  credentialSubject.set('participant', {
    name: participant.name
  })
  credentialSubject.set('identifier', {
    propertyID: identifier.propertyID,
    value: identifier.value
  })
  if (endTime) {
    credentialSubject.set('endTime', endTime.toJSON())
  }
  if (object) {
    credentialSubject.set('object', object.map(({ contentUrl }) => contentUrl))
  }
  const credential = {
    '@context': Object.fromEntries(context),
    type: type,
    credentialSubject: Object.fromEntries(credentialSubject),
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return deepMerge(baseCredential, credential) as Credential<unknown>
}

export function formatterContract(contract: ContractTable): FormatContract {
  return {
    '@context': 'https://schema.org',
    '@type': 'OrganizeAction',
    'agent': {
      '@type': 'Person',
      'name': contract.agent_name,
    },
    'participant': {
      '@type': 'Person',
      'name': contract.participant_name,
    },
    'instrument': {
      '@type': 'Thing',
      'name': contract.instrument_name,
      'description': contract.instrument_description,
    },
    'identifier': {
      '@type': 'PropertyValue',
      'propertyID': 'Database ID',
      'value': String(contract.id), // todo сделать проверку на пустоту
    },
    'startTime': contract.startTime,
    'endTime': contract.endTime,
    'object': contract.images.map((image) => ({
      '@type': 'ImageObject',
      'contentUrl': image,
    })),
    '_currentSlide': 1,
  }
}
