import { FormatContract } from '../types/models'

export function mailUrl(item: FormatContract) {
  let str = item.participant.email
  if (item.agent.email) {
    const bccEmail = item.agent.email.replace('mailto:', '')
    str += '?bcc=' + bccEmail
  }
  if (item.instrument.name) {
    str += '&subject=' + item.instrument.name
  }
  let body = `Hello ${item.participant.sameAs}.\n\n`
  if (item.sameAs) {
    body += `Link: ${item.sameAs}`
  }
  if (body) {
    str += '&body=' + encodeURIComponent(body)
  }
  return str
}
