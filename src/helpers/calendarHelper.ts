import ICAL from 'ical.js'
import { date } from 'quasar'
import { event as createEvent, default as icalendar } from 'ical-browser'
import { FormatContract, CalendarEventExternal } from '../types/models'
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/ban-ts-comment
  // @ts-expect-error
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

export function convertIcalToEvent(ical: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const icalData = ICAL.parse(ical)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const comp = new ICAL.Component(icalData)
  const vevent = comp.getFirstSubcomponent('vevent')
  const eventName = vevent.getFirstPropertyValue('summary')
  const eventDescription = vevent.getFirstPropertyValue('description')
  const uid = vevent.getFirstPropertyValue('uid')
  const dtStart = vevent
    .getFirstPropertyValue('dtstart')
    .toString()
    .replace('Z', '')
  const dtEnd = vevent
    .getFirstPropertyValue('dtend')
    .toString()
    .replace('Z', '')
  return {
    id: uid,
    start: date.formatDate(dtStart, 'YYYY-MM-DD HH:mm'),
    end: date.formatDate(dtEnd, 'YYYY-MM-DD HH:mm'),
    title: eventName,
    description: eventDescription,
    location: vevent.getFirstPropertyValue('location') || null,
    people: vevent
      .getAllProperties('attendee')
      .map((att) => att.getFirstValue()),
  } as CalendarEventExternal
}

export function formatToCalendarDate(elem: Date) {
  return date.formatDate(elem, 'YYYY-MM-DD')
}

export function isCurrentDate(
  elem: Date | string,
  now: Date | string = new Date(),
) {
  return date.isSameDate(elem, now, 'day')
}
