import { date } from 'quasar'
import { Temporal } from '@js-temporal/polyfill'
import { VEvent, default as ICalendar } from 'ical-browser'
import type { Event } from 'ical-browser/dist/types/types'
import { formatIcal } from './dateHelper'

export function createCal(id: string, obj: unknown): File {
  /* eslint-disable */
  const ev = new VEvent(obj.event as Event)
  const calendar = new ICalendar()
  calendar.addEvent(id, ev)
  return calendar.download('calendar.ics')
  /* eslint-enable */
}

type GoogleCalendarParams = {
  text: string
  details?: string
  startTime: Date
  endTime?: Date
  location: string
}

export function googleCalendarUrl(o: GoogleCalendarParams) {
  const link = new URL('https://calendar.google.com/calendar/render')
  link.searchParams.append('action', 'TEMPLATE')
  link.searchParams.append('text', o.text)
  link.searchParams.append('details', o.details)
  if (o.endTime) {
    link.searchParams.append(
      'dates',
      formatIcal(o.startTime) + '/' + formatIcal(o.endTime),
    )
  } else {
    link.searchParams.append(
      'dates',
      formatIcal(o.startTime) + '/' + formatIcal(o.startTime),
    )
  }
  if (location) {
    link.searchParams.append('location', o.location)
  }
  return link
}

export function formatToCalendarDate(elem: Date | string = new Date()) {
  return Temporal.PlainDate.from(date.formatDate(elem, 'YYYY-MM-DD'))
}

export function isCurrentDate(
  elem: Date | string,
  now: Date | string = new Date(),
) {
  return date.isSameDate(elem, now, 'day')
}
