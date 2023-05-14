import { formatIcal } from '../helpers/dateHelper'
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

export function googleMailUrl(item: FormatContract) {
  const link = new URL('https://calendar.google.com/calendar/render')
  link.searchParams.append('action', 'TEMPLATE')
  link.searchParams.append('text', item.instrument.name)
  link.searchParams.append('details', item.instrument.description)
  if (item.endTime) {
    link.searchParams.append(
      'dates',
      formatIcal(item.startTime) + '/' + formatIcal(item.endTime),
    )
  } else {
    link.searchParams.append(
      'dates',
      formatIcal(item.startTime) + '/' + formatIcal(item.startTime),
    )
  }
  if (item.sameAs) {
    link.searchParams.append('location', item.sameAs)
  }
  return link
}
