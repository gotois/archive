import { date } from 'quasar'
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

export function googleCalendarUrl(
  text: string,
  details: string,
  startTime: Date,
  endTime: Date,
  location: string,
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
  if (location) {
    link.searchParams.append('location', location)
  }
  return link
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
