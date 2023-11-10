import { formatIcal } from './dateHelper'
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
