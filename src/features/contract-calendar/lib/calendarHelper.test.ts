import { describe, expect, test } from 'vitest'
import {
  addBusyAvailabilityEvents,
  createCal,
  formatCalendarDateTime,
  getCalendarSubscriptionStatus,
  taskOverlapsRange,
  taskToCalendarEvent,
} from './calendarHelper'
import { formatIcal } from '@/shared/lib/dateHelper'
import type { ContractTable } from '@/entities/contract'

describe('calendar file creation', () => {
  test('creates an ICS file using the current ical-browser API', async () => {
    const file = createCal('-//Secretary//Calendar//EN', {
      event: {
        uid: 'event-1@example.com',
        summary: 'Project meeting',
        start: new Date('2026-07-22T10:00:00Z'),
        end: new Date('2026-07-22T11:00:00Z'),
      },
    })

    expect(file.name).toBe('calendar.ics')
    expect(file.type).toBe('text/calendar')
    await expect(file.text()).resolves.toContain(
      'PRODID:-//Secretary//Calendar//EN',
    )
  })
})

function createTask(overrides: Partial<ContractTable> = {}): ContractTable {
  return {
    id: 42,
    resolver: 'https://example.com/tasks/42',
    context: ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential'],
    issuer: 'https://example.com/users/1',
    issuanceDate: new Date('2026-01-01T00:00:00Z'),
    organizer: { type: 'Person', name: 'Organizer' },
    participant: [{ type: 'Person', name: 'Participant' }],
    name: 'Timezone boundary',
    description: 'Description',
    startTime: new Date('2026-01-01T23:30:00Z'),
    endTime: new Date('2026-01-02T00:30:00Z'),
    tag: ['calendar'],
    attachment: [
      {
        type: 'Document',
        name: 'Agenda',
        mediaType: 'text/plain',
        url: 'https://example.com/agenda.txt',
      },
    ],
    location: 'Online',
    link: 'https://example.com/meeting',
    ...overrides,
  }
}

describe('calendar date formatting', () => {
  test('formats an instant in an explicit timezone across a date boundary', () => {
    const instant = new Date('2026-01-01T23:30:00Z')

    expect(formatCalendarDateTime(instant, 'Asia/Tokyo')).toBe(
      '2026-01-02 08:30',
    )
    expect(formatCalendarDateTime(instant, 'America/New_York')).toBe(
      '2026-01-01 18:30',
    )
  })

  test('formats Google Calendar dates as UTC without depending on local timezone', () => {
    expect(formatIcal(new Date('2026-01-01T00:15:30+05:30'))).toBe(
      '20251231T184530Z',
    )
  })
})

describe('task calendar mapping', () => {
  const from = new Date('2026-01-02T00:00:00Z')
  const to = new Date('2026-01-02T01:00:00Z')

  test.each([
    ['ends at from', '2026-01-01T23:00:00Z', '2026-01-02T00:00:00Z'],
    ['starts at to', '2026-01-02T01:00:00Z', '2026-01-02T02:00:00Z'],
    ['is inside', '2026-01-02T00:15:00Z', '2026-01-02T00:45:00Z'],
    ['covers the range', '2026-01-01T23:00:00Z', '2026-01-02T02:00:00Z'],
  ])('includes a task that %s', (_label, start, end) => {
    expect(
      taskOverlapsRange(
        createTask({ startTime: new Date(start), endTime: new Date(end) }),
        from,
        to,
      ),
    ).toBe(true)
  })

  test('excludes a task outside the range', () => {
    expect(
      taskOverlapsRange(
        createTask({
          startTime: new Date('2026-01-02T01:00:01Z'),
          endTime: new Date('2026-01-02T02:00:00Z'),
        }),
        from,
        to,
      ),
    ).toBe(false)
  })

  test('maps task fields and uses start as end when endTime is absent', () => {
    const task = createTask({ endTime: undefined })

    expect(taskToCalendarEvent(task, 'Asia/Tokyo')).toEqual({
      id: 42,
      start: '2026-01-02 08:30',
      end: '2026-01-02 08:30',
      title: 'Timezone boundary',
      calendarId: 'secretary',
      description: 'Description',
      attaches: task.attachment,
      tag: ['calendar'],
      organizer: task.organizer,
      participant: task.participant,
      location: 'Online',
      link: 'https://example.com/meeting',
    })
  })
})

describe('calendar subscription classification', () => {
  test('adds a display event for a bounded busy availability', () => {
    const source = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VAVAILABILITY',
      'UID:busy-1',
      'BUSYTYPE:BUSY',
      'DTSTART;TZID=Europe/Moscow:20260726T210000',
      'DTEND;TZID=Europe/Moscow:20260726T220000',
      'END:VAVAILABILITY',
      'END:VCALENDAR',
    ].join('\r\n')

    const result = addBusyAvailabilityEvents(source, 'Europe/Moscow', 'Занят')

    expect(result).toContain('BEGIN:VEVENT')
    expect(result).toContain('UID:availability-busy-1')
    expect(result).toContain('SUMMARY:Занят')
    expect(result).toContain('DTSTART:20260726T180000Z')
    expect(result).toContain('DTEND:20260726T190000Z')
    expect(getCalendarSubscriptionStatus(result)).toBe('ready')
  })

  test('does not display availability containing an AVAILABLE window as busy', () => {
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

    const result = addBusyAvailabilityEvents(source, 'Europe/Moscow', 'Занят')

    expect(result).not.toContain('BEGIN:VEVENT')
    expect(getCalendarSubscriptionStatus(result)).toBe('empty')
  })

  test('recognizes a valid calendar without VEVENT as empty', () => {
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
