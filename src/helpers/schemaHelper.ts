import {
  FormatContractAgent,
  ContractTable,
  FormatContract,
  FormatContractParticipant,
  BaseContext,
} from '../types/models'
import { getHash } from '../services/cryptoService'

export function formatterContracts(
  contracts: ContractTable[],
): FormatContract[] {
  return contracts.map((contract: ContractTable) => formatterContract(contract))
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
    '@type': contract.context[1]?.participant,
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
  const object = contract.images.map((image) => ({
    '@type': 'ImageObject',
    'encodingFormat': image.encodingFormat,
    'contentUrl': image.contentUrl,
  }))
  return {
    '@context': BaseContext.schemaOrg,
    '@type': contract.type[1],
    'sameAs': contract.resource_url,
    'agent': agent,
    'participant': participant,
    'instrument': instrument,
    'identifier': identifier,
    'startTime': new Date(contract.startTime),
    'endTime': new Date(contract.endTime),
    'object': object,
  } as FormatContract
}
