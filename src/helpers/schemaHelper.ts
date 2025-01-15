import {
  FormatContractAgent,
  ContractTable,
  FormatContract,
  FormatContractParticipant,
  FormatPlace,
  VerifiableCredential,
  CredentialSubject,
} from '../types/models'
import { getHash } from '../helpers/cryptoHelper'

export function formatterContracts(
  contracts: ContractTable[],
): FormatContract[] {
  return contracts.map((contract: ContractTable) => formatterContract(contract))
}

export function getContractFromLD(jsldContract: VerifiableCredential) {
  return JSON.parse(
    JSON.stringify({
      context: jsldContract['@context'],
      type: jsldContract.type,
      issuer: jsldContract.issuer,
      issuanceDate: new Date(jsldContract.issuanceDate),
      identifier: jsldContract.credentialSubject?.identifier,
      agent_name: jsldContract.credentialSubject.agent?.name,
      agent_email: jsldContract.credentialSubject.agent?.email,
      participant_name: jsldContract.credentialSubject.participant?.sameAs, // todo упростить схему
      participant_email: jsldContract.credentialSubject.participant?.email, // todo упростить схему
      participant_url: jsldContract.credentialSubject.participant?.url, // todo упростить схему
      participant_tel: jsldContract.credentialSubject.participant?.telephone, // todo упростить схему
      instrument_name: jsldContract.credentialSubject.instrument.name,
      location: jsldContract.credentialSubject.location,
      instrument_description:
        jsldContract.credentialSubject.instrument.description ?? null,
      startTime: new Date(jsldContract.credentialSubject.startTime),
      endTime: jsldContract.credentialSubject.endTime
        ? new Date(jsldContract.credentialSubject.endTime)
        : null,
      images: jsldContract.credentialSubject.object,
      // url: jsldContract.credentialSubject.url,
    }),
  ) as ContractTable
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

// todo - нужно использовать в качестве идентификатора сообщения более точное состояние (мб proof?)
export function getIdentifierMessage(item: CredentialSubject) {
  return item.instrument.name + '-' + new Date(item.startTime).toJSON()
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
    'sameAs': contract.participant_name,
    'url': contract.participant_url,
    'telephone': contract.participant_tel,
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
  const object = contract?.images?.map(({ encodingFormat, contentUrl }) => ({
    '@type': 'ImageObject',
    'encodingFormat': encodingFormat,
    'contentUrl': contentUrl,
  }))
  return {
    '@context': 'https://schema.org',
    '@type': contract.type ? contract.type[1] : 'OrganizeAction',
    'sameAs': contract.resource_url,
    'agent': agent,
    'participant': participant,
    'instrument': instrument,
    'identifier': identifier,
    'location': contract.location
      ? (JSON.parse(contract.location) as FormatPlace)
      : null,
    'startTime': new Date(contract.startTime),
    'endTime': contract.endTime ? new Date(contract.endTime) : null,
    'object': object ?? [],
    'proof': contract.proof ? contract.proof : null,
    // 'url': contract.url, // todo поддержать url
  } as FormatContract
}
