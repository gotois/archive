import ICAL from 'ical.js'
import { date } from 'quasar'
import { event as createEvent, default as icalendar } from 'ical-browser'
import {
  CalendarEventExternal,
  ContractTable,
} from '../types/models'
import { formatIcal } from './dateHelper'

export function createCal(id: string, obj) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const str = icalendar(id, {
    event: createEvent(obj.event),
  }) as string
  return new File([new TextEncoder().encode(str)], 'calendar.ics', {
    type: 'text/calendar',
  })
}

export function googleCalendarUrl(
  text: string,
  details: string,
  startTime: Date,
  endTime: Date,
  sameAs: string,
) {
  const link = new URL('https://calendar.google.com/calendar/render')
  link.searchParams.append('action', 'TEMPLATE')
  link.searchParams.append('text', text)
  link.searchParams.append('details', details)
  if (endTime) {
    link.searchParams.append(
      'dates',
      formatIcal(startTime) + '/' + formatIcal(endTime),
    )
  } else {
    link.searchParams.append(
      'dates',
      formatIcal(startTime) + '/' + formatIcal(startTime),
    )
  }
  if (sameAs) {
    link.searchParams.append('location', sameAs)
  }
  return link
}

export function convertSchemaPodToEvent(contract: ContractTable) {
  return {
    id: contract.id,
    start: date.formatDate(contract.startTime, 'YYYY-MM-DD HH:mm'),
    end: date.formatDate(contract.endTime, 'YYYY-MM-DD HH:mm'),
    title: contract.name,
    calendarId: 'secretary', // todo использовать разные форматы календаря такие как work, etc
    description: contract.description,
    attaches: contract.attachment,
    tag: contract.tag,
    organizer: contract.organizer,
    participant: contract.participant,
    location: contract.location,
    link: contract.link,
  } as CalendarEventExternal
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
    calendarId: 'secretary', // todo использовать разные форматы календаря такие как work, etc
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
