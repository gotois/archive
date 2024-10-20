import { event as createEvent, default as icalendar } from 'ical-browser'
import { FormatContract } from '../types/models'
import { formatIcal } from './dateHelper'

export function createCal(id: string, object: FormatContract) {
  const attach: string[] = []
  for (const { contentUrl } of object.object) {
    attach.push(contentUrl)
  }
  if (!object.sameAs) {
    console.warn('object sameAs is empty')
  }
  let uid = null
  if (object.identifier.length) {
    uid = object.identifier.find((i) => i.name === 'Contract').value
  }

  const organizer = []
  if (object.agent.name && object.agent.email) {
    organizer.push({
      name: object.agent.name,
      email: object.agent.email,
    })
  }
  const attendee = []
  if (object.participant.sameAs && object.participant.email) {
    attendee.push({
      name: object.participant.sameAs,
      email: object.participant.email,
    })
  }

  let geo = null
  if (object.location?.geo) {
    geo = [object.location.geo.latitude, object.location.geo.longitude]
  }

  let location = null
  if (object.location?.name) {
    location = object.location.name
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const event = createEvent({
    uid: uid as string,
    url: object.sameAs ? new URL(object.sameAs) : null,
    summary: object.instrument.name,
    description: object.instrument.description,
    location: location,
    geo: geo,
    stamp: new Date(),
    start: object.startTime,
    end: object.endTime,
    attach: attach,
    organizer: organizer,
    attendee: attendee,
  }) as string

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const str = icalendar(id, { event }) as string
  const encoder = new TextEncoder()
  return new File([encoder.encode(str)], 'calendar.ics', {
    type: 'text/calendar',
  })
}

export function googleCalendarUrl(item: FormatContract) {
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
