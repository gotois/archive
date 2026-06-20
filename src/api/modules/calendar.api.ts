import { requestText } from '../http'

export interface CalendarSubscriptionParams {
  timezone: string
  authorization: string | null
}

export const calendarApi = {
  getSubscription({
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

    return requestText(import.meta.env.server + '/calendar/subscription', {
      method: 'GET',
      headers,
      credentials: 'include',
    })
  },
}
