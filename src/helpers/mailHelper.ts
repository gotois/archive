import { FormatContract } from '../types/models'

export function mailUrl(item: FormatContract) {
  let str = item.participant.email
  if (item.agent.email) {
    str += '?bcc=' + item.agent.email
  }
  if (item.instrument.name) {
    str += '&subject=' + item.instrument.name
  }
  return str
}
