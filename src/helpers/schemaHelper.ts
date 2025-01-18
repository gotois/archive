// import {
//   FormatContractAgent,
//   ContractTable,
//   FormatContract,
//   FormatContractParticipant,
//   FormatPlace,
//   // VerifiableCredential,
// } from '../types/models'
import { getHash } from '../helpers/cryptoHelper'

/* fixme парсить контракт схему с выгруженного solid
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
*/

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
// export function getIdentifierMessage(item: CredentialSubject) {
//   return item.instrument.name + '-' + new Date(item.startTime).toJSON()
// }
