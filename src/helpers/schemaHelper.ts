import {
  FormatContractAgent,
  ContractTable,
  FormatContract,
  FormatContractParticipant,
  Credential,
  CredentialSubject,
  MyContract,
  BaseContext,
} from '../types/models'
import { getHash } from '../services/cryptoService'
import { getMimeType } from '../helpers/dataHelper'

export function formatterContracts(
  contracts: ContractTable[],
): FormatContract[] {
  return contracts.map((contract: ContractTable) => formatterContract(contract))
}

function getAgentType(name: string) {
  const orgNames = ['ОРГАНИЗАЦИЯ', 'ООО', 'АО', 'DAO', 'LLC', 'INC', 'COMPANY']
  return orgNames.includes(name.toUpperCase()) ? 'Organization' : 'Person'
}

export function getContractFromLD(jsldContract: Credential) {
  return {
    context: jsldContract['@context'],
    type: jsldContract.type,
    issuer: jsldContract.issuer,
    issuanceDate: new Date(jsldContract.issuanceDate),
    identifier: jsldContract.credentialSubject?.identifier,
    agent_name: jsldContract.credentialSubject.agent?.name,
    agent_email: jsldContract.credentialSubject.agent?.email,
    participant_name: jsldContract.credentialSubject.participant?.name,
    participant_email: jsldContract.credentialSubject.participant?.email,
    instrument_name: jsldContract.credentialSubject.instrument.name,
    instrument_description:
      jsldContract.credentialSubject.instrument.description ?? null,
    startTime: new Date(jsldContract.credentialSubject.startTime),
    endTime: jsldContract.credentialSubject.endTime
      ? new Date(jsldContract.credentialSubject.endTime)
      : null,
    images: jsldContract.credentialSubject.object,
    url: jsldContract.credentialSubject.url,
  } as ContractTable
}

export function createContractLD(contractData: MyContract) {
  const context = new Map()
  context.set('OrganizeAction', BaseContext.schemaOrg + '/OrganizeAction')
  context.set('agent', BaseContext.schemaOrg + '/agent')
  context.set('name', BaseContext.schemaOrg + '/name')
  context.set('email', BaseContext.schemaOrg + '/email')
  context.set('instrument', BaseContext.schemaOrg + '/instrument')
  context.set('description', BaseContext.schemaOrg + '/description')
  context.set(
    'participant',
    BaseContext.schemaOrg + '/' + getAgentType(contractData.participant_name),
  )
  context.set('identifier', BaseContext.schemaOrg + '/identifier')
  context.set('startTime', BaseContext.schemaOrg + '/startTime')
  context.set('endTime', BaseContext.schemaOrg + '/endTime')
  context.set('propertyID', BaseContext.schemaOrg + '/propertyID')
  context.set('value', BaseContext.schemaOrg + '/PropertyValue')
  context.set('object', BaseContext.schemaOrg + '/ImageObject')
  context.set('encodingFormat', BaseContext.schemaOrg + '/encodingFormat')
  context.set('contentUrl', BaseContext.schemaOrg + '/contentUrl')
  context.set('value', BaseContext.schemaOrg + '/value')
  context.set('url', BaseContext.schemaOrg + '/url')

  const credentialSubject = new Map()
  credentialSubject.set('agent', {
    name: contractData?.agent_name,
    email: contractData.agent_email
      ? getEmailProperty(contractData.agent_email)
      : null,
  })
  credentialSubject.set('instrument', {
    name: contractData.instrument_name,
    description: contractData.instrument_description,
  })
  if (contractData.startTime) {
    credentialSubject.set('startTime', contractData.startTime.toJSON())
  }
  credentialSubject.set('participant', {
    name: contractData.participant_name,
    email: contractData.participant_email
      ? getEmailProperty(contractData.participant_email)
      : null,
  })
  credentialSubject.set('identifier', [])
  if (contractData.endTime) {
    credentialSubject.set('endTime', contractData.endTime.toJSON())
  }
  if (contractData.images) {
    credentialSubject.set(
      'object',
      contractData.images.map((contentUrl: string) => ({
        encodingFormat: getMimeType(contentUrl),
        contentUrl: contentUrl,
      })),
    )
  }
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      Object.fromEntries(context),
    ],
    'type': ['VerifiableCredential', 'OrganizeAction'],
    'issuer': 'https://archive.gotointeractive.com',
    'issuanceDate': new Date().toISOString(),
    'credentialSubject': Object.fromEntries(
      credentialSubject,
    ) as CredentialSubject,
  } as Credential
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
  return ''
}

export function formatterContract(contract: ContractTable) {
  const agent: FormatContractAgent = {
    '@type': 'Person',
    'name': contract.agent_name,
  }
  if (contract.agent_email) {
    agent.email = getEmailProperty(contract.agent_email)
  }
  const participant: FormatContractParticipant = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    '@type': contract.context ? contract?.context[1]?.participant : 'Person',
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
  const identifier = contract.identifier
  const object = contract.images.map(({ encodingFormat, contentUrl }) => ({
    '@type': 'ImageObject',
    'encodingFormat': encodingFormat,
    'contentUrl': contentUrl,
  }))
  return {
    '@context': BaseContext.schemaOrg,
    '@type': contract.type ? contract.type[1] : 'OrganizeAction',
    'sameAs': contract.resource_url,
    'agent': agent,
    'participant': participant,
    'instrument': instrument,
    'identifier': identifier,
    'startTime': contract.startTime,
    'endTime': contract.endTime,
    'object': object,
  } as FormatContract
}
