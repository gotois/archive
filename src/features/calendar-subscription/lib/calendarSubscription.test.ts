import { describe, expect, test } from 'vitest'
import {
  getBusyBackgroundEvents,
  getCalendarSubscriptionStatus,
} from './calendarSubscription'

describe('calendar subscription presentation', () => {
  test('maps VFREEBUSY periods to non-interactive background ranges', () => {
    const source = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VFREEBUSY',
      'UID:busy-1',
      'FREEBUSY;FBTYPE=BUSY-TENTATIVE:20260726T180000Z/20260726T190000Z',
      'END:VFREEBUSY',
      'END:VCALENDAR',
    ].join('\r\n')

    const [event] = getBusyBackgroundEvents(source, 'Europe/Moscow', 'Занят')

    expect(event?.title).toBe('Занят')
    expect(event?.start.toString()).toBe(
      '2026-07-26T21:00:00+03:00[Europe/Moscow]',
    )
    expect(event?.end.toString()).toBe(
      '2026-07-26T22:00:00+03:00[Europe/Moscow]',
    )
    expect(event?.style.background).toContain('repeating-linear-gradient')
    expect(getCalendarSubscriptionStatus(source)).toBe('ready')
  })

  test('does not turn VAVAILABILITY into a calendar event', () => {
    const source = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VAVAILABILITY',
      'UID:free-1',
      'BUSYTYPE:BUSY',
      'DTSTART;TZID=Europe/Moscow:20260726T210000',
      'DTEND;TZID=Europe/Moscow:20260726T220000',
      'BEGIN:AVAILABLE',
      'UID:window-1',
      'DTSTART;TZID=Europe/Moscow:20260726T210000',
      'DTEND;TZID=Europe/Moscow:20260726T220000',
      'END:AVAILABLE',
      'END:VAVAILABILITY',
      'END:VCALENDAR',
    ].join('\r\n')

    expect(getBusyBackgroundEvents(source, 'Europe/Moscow', 'Занят')).toEqual(
      [],
    )
    expect(getCalendarSubscriptionStatus(source)).toBe('empty')
  })

  test('does not shade FREE periods as busy space', () => {
    const source = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VFREEBUSY',
      'FREEBUSY;FBTYPE=FREE:20260726T180000Z/20260726T190000Z',
      'END:VFREEBUSY',
      'END:VCALENDAR',
    ].join('\r\n')

    expect(getBusyBackgroundEvents(source, 'Europe/Moscow', 'Занят')).toEqual(
      [],
    )
    expect(getCalendarSubscriptionStatus(source)).toBe('empty')
  })

  test('recognizes a valid calendar without display content as empty', () => {
    expect(
      getCalendarSubscriptionStatus(
        [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Secretary//Tests//EN',
          'END:VCALENDAR',
        ].join('\r\n'),
      ),
    ).toBe('empty')
  })

  test('recognizes a calendar containing VEVENT as ready', () => {
    expect(
      getCalendarSubscriptionStatus(
        [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'BEGIN:VEVENT',
          'UID:42',
          'DTSTART:20260102T090000Z',
          'DTEND:20260102T100000Z',
          'END:VEVENT',
          'END:VCALENDAR',
        ].join('\r\n'),
      ),
    ).toBe('ready')
  })

  test.each(['', 'not an ics file', 'BEGIN:VCALENDAR\nVERSION:2.0'])(
    'rejects invalid calendar data: %j',
    (source) => {
      expect(() => getCalendarSubscriptionStatus(source)).toThrow(
        'Invalid calendar subscription',
      )
    },
  )
})
