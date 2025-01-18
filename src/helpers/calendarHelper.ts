import { date } from 'quasar'
import { event as createEvent, default as icalendar } from 'ical-browser'
import { formatIcal } from './dateHelper'

export function createCal(id: string, obj: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const str = icalendar(id, {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
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
