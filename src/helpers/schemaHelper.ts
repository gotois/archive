import { uid } from 'quasar'
import {
  setThing,
  buildThing,
  createThing,
  createSolidDataset,
} from '@inrupt/solid-client'
import { RDF, SCHEMA_INRUPT } from '@inrupt/vocab-common-rdf'
import {
  FormatContractAgent,
  ContractTable,
  FormatContract,
  Credential,
  ProofCredential,
  CredentialSubject,
  CredentialTypes,
  credentialContextType,
  credentialSubjectType,
  FormatContractParticipant,
} from '../types/models'
import { getMimeType } from './dataHelper'
import { getHash } from '../services/cryptoService'

enum BaseContext {
  schemaOrg = 'https://schema.org',
}

function createCredential(webId: string, issuanceDate?: string): Credential {
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

export function formatterDatasetContract(
  resourceUrl: string,
  signedVC: ProofCredential,
) {
  const types = signedVC['@context'][1] as unknown as CredentialTypes
  const item = signedVC.credentialSubject as CredentialSubject

  const agent = buildThing(createThing({ url: resourceUrl + '#agent' }))
    .addStringNoLocale(SCHEMA_INRUPT.name, item.agent.name)
    .addUrl(RDF.type, types.agent)
  const endTime = buildThing(createThing({ url: resourceUrl + '#endTime' }))
  if (item.endTime) {
    endTime
      .addDate(SCHEMA_INRUPT.endTime, new Date(item.endTime))
      .addUrl(RDF.type, types.endTime)
  }
  const identifier = buildThing(
    createThing({ url: resourceUrl + '#identifier' }),
  )
    .addStringNoLocale(SCHEMA_INRUPT.identifier, item.identifier.value)
    .addUrl(RDF.type, types.value)
  const instrument = buildThing(
    createThing({ url: resourceUrl + '#instrument' }),
  )
    .addStringNoLocale(SCHEMA_INRUPT.description, item.instrument.description)
    .addStringNoLocale(SCHEMA_INRUPT.name, item.instrument.name)
    .addUrl(RDF.type, types.instrument)
  const objectThing = buildThing(createThing({ url: resourceUrl + '#object' }))
  item.object.forEach((contentUrl) =>
    objectThing.addUrl(SCHEMA_INRUPT.image, contentUrl),
  )
  objectThing.addUrl(RDF.type, types.object)
  const participant = buildThing(
    createThing({ url: resourceUrl + '#participant' }),
  )
    .addStringNoLocale(SCHEMA_INRUPT.name, item.participant.name)
    .addUrl(RDF.type, types.participant)
  const startTime = buildThing(createThing({ url: resourceUrl + '#startTime' }))
    .addDate(SCHEMA_INRUPT.startTime, new Date(item.startTime))
    .addUrl(RDF.type, types.startTime)

  let dataset = createSolidDataset()
  dataset = setThing(dataset, agent.build())
  dataset = setThing(dataset, endTime.build())
  dataset = setThing(dataset, identifier.build())
  dataset = setThing(dataset, instrument.build())
  dataset = setThing(dataset, participant.build())
  dataset = setThing(dataset, startTime.build())
  dataset = setThing(dataset, objectThing.build())

  return dataset
}

export function formatterContracts(
  contracts: ContractTable[],
): FormatContract[] {
  return contracts.map((contract: ContractTable) => formatterContract(contract))
}

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge<T extends { [key: string]: any }>(
  target: T,
  source: DeepPartial<T>,
): T {
  if (Array.isArray(target)) {
    return target.concat(source) as unknown as T
  }
  if (
    target &&
    source &&
    typeof target === 'object' &&
    typeof source === 'object'
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Object.assign(
      target,
      ...Object.keys(source).map((key) => ({
        [key]: deepMerge(
          target[key as keyof T],
          source[key as keyof T] as DeepPartial<T[keyof T]>,
        ),
      })),
    )
  }
  return source as T
}

export function formatterLDContract(
  webId: string,
  formatContract: FormatContract,
) {
  if (!webId) {
    throw new Error('WebId is empty')
  }
  const context = new Map()
  const credentialSubject = new Map()

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
  context.set('name', BaseContext.schemaOrg + '/name')
  context.set('instrument', BaseContext.schemaOrg + '/instrument')
  context.set('description', BaseContext.schemaOrg + '/description')
  context.set('participant', BaseContext.schemaOrg + '/participant')
  context.set('identifier', BaseContext.schemaOrg + '/identifier')
  context.set('startTime', BaseContext.schemaOrg + '/startTime')
  context.set('endTime', BaseContext.schemaOrg + '/endTime')
  context.set('propertyID', BaseContext.schemaOrg + '/propertyID')
  context.set('value', BaseContext.schemaOrg + '/PropertyValue')
  context.set('object', BaseContext.schemaOrg + '/ImageObject')

  credentialSubject.set('agent', {
    name: formatContract.agent.name,
  })
  credentialSubject.set('instrument', {
    name: instrument.name,
    description: instrument.description,
  })
  credentialSubject.set('startTime', startTime.toJSON())
  credentialSubject.set('participant', {
    name: participant.name,
  })
  credentialSubject.set('identifier', {
    propertyID: identifier.propertyID,
    value: identifier.value,
  })
  if (endTime) {
    credentialSubject.set('endTime', endTime.toJSON())
  }
  if (object) {
    credentialSubject.set(
      'object',
      object.map(({ contentUrl }) => contentUrl),
    )
  }
  const credential = {
    '@context': Object.fromEntries(context) as credentialContextType,
    'type': type,
    'credentialSubject': Object.fromEntries(
      credentialSubject,
    ) as credentialSubjectType,
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return deepMerge(baseCredential, credential)
}

export function getEmailProperty(email: string) {
  return email.startsWith('mailto:') ? email : 'mailto:' + email
}

export async function getGravatarURL(email: string) {
  const hashHex = await getHash(email)
  const link = `https://www.gravatar.com/avatar/${hashHex}`

  if (navigator.onLine) {
    const { status } = await fetch(link + '?d=404')
    if (status >= 200 && status < 400) {
      return link
    }
  }
}

export function formatterContract(contract: ContractTable): FormatContract {
  const agent: FormatContractAgent = {
    '@type': 'Person',
    'name': contract.agent_name,
  }
  if (contract.agent_email) {
    agent.email = getEmailProperty(contract.agent_email)
  }

  const orgNames = ['ОРГАНИЗАЦИЯ', 'ООО', 'АО', 'DAO', 'LLC', 'INC', 'COMPANY']
  const participant: FormatContractParticipant = {
    '@type': orgNames.includes(contract.participant_name.toUpperCase())
      ? 'Organization'
      : 'Person',
    'name': contract.participant_name,
  }
  if (contract.participant_email) {
    participant.email = getEmailProperty(contract.participant_email)
  }
  const instrument = {
    '@type': 'Thing',
    'name': contract.instrument_name,
    'description': contract.instrument_description,
  }
  const identifier = {
    '@type': 'PropertyValue',
    'propertyID': 'Database ID',
    'value': contract.id ? String(contract.id) : uid(),
  }
  const object = contract.images.map((image) => ({
    '@type': 'ImageObject',
    'encodingFormat': getMimeType(image),
    'contentUrl': image,
  }))
  return {
    '@context': BaseContext.schemaOrg,
    '@type': 'OrganizeAction',
    'sameAs': contract.resource_url,
    'agent': agent,
    'participant': participant,
    'instrument': instrument,
    'identifier': identifier,
    'startTime': contract.startTime,
    'endTime': contract.endTime,
    'object': object,
  }
}
