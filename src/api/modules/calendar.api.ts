import { requestText } from '../http'

export interface CalendarSubscriptionParams {
  source: 'web' | 'tma'
  timezone: string
  authorization: string | null
}

export const calendarApi = {
  getSubscription({
    source,
    timezone,
    authorization,
  }: CalendarSubscriptionParams): Promise<string> {
    const headers = new Headers({
      Accept: 'text/calendar',
      Timezone: timezone,
    })

    if (authorization) {
      headers.set('Authorization', authorization)
    }

    if (source === 'tma') {
      return requestText(import.meta.env.server + '/calendar/subscription', {
        method: 'GET',
        headers,
      })
    }

    return requestText(import.meta.env.secretary + '/tasks/subscription', {
      method: 'GET',
      headers,
      credentials: 'include',
    })
  },
}
