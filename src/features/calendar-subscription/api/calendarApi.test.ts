import { afterEach, describe, expect, test, vi } from 'vitest'
import { calendarApi } from '@/features/calendar-subscription'
import { HttpError } from '@/shared/api/http'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('calendarApi.getSubscription', () => {
  test('loads ICS with timezone, authorization and cookies', async () => {
    vi.stubEnv('server', 'https://secretary.example')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue('BEGIN:VCALENDAR\r\nEND:VCALENDAR'),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      calendarApi.getSubscription({
        timezone: 'Asia/Tokyo',
        authorization: 'Basic token',
      }),
    ).resolves.toBe('BEGIN:VCALENDAR\r\nEND:VCALENDAR')

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = init.headers as Headers
    expect(url).toBe('https://secretary.example/calendar/subscription')
    expect(init).toMatchObject({ method: 'GET', credentials: 'include' })
    expect(headers.get('Accept')).toBe('text/calendar')
    expect(headers.get('Timezone')).toBe('Asia/Tokyo')
    expect(headers.get('Authorization')).toBe('Basic token')
  })

  test('omits authorization when the session has none', async () => {
    vi.stubEnv('server', 'https://secretary.example')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(''),
    })
    vi.stubGlobal('fetch', fetchMock)

    await calendarApi.getSubscription({
      timezone: 'UTC',
      authorization: null,
    })

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect((init.headers as Headers).has('Authorization')).toBe(false)
  })

  test('throws HttpError for an unsuccessful response', async () => {
    vi.stubEnv('server', 'https://secretary.example')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      }),
    )

    const request = calendarApi.getSubscription({
      timezone: 'Europe/Moscow',
      authorization: null,
    })

    await expect(request).rejects.toEqual(
      expect.objectContaining<HttpError>({
        name: 'HttpError',
        status: 503,
        message: '503 Service Unavailable',
      }),
    )
  })
})
