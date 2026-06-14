import { defineStore } from 'pinia'
import useSecretaryStore from 'stores/secretary'
import useGeoStore from 'stores/geo'
import { isTMA } from '../composables/detector'
import type {
  CalendarEventExternal,
} from '../types/models'

interface Store {
  events: CalendarEventExternal[]
}

export default defineStore('calendar', {
  state: (): Store => ({
    events: [],
  }),
  actions: {
    async loadSubscriptionCalendar() {
      const secretaryStore = useSecretaryStore()
      const geoStore = useGeoStore()

      const requestInit: RequestInit = {
        method: 'GET',
      }
      const headers = new Headers()
      headers.set('Accept', 'text/calendar')
      headers.set('Timezone', geoStore.timezone)
      if (isTMA) {
        if (secretaryStore.auth) {
          headers.set('Authorization', secretaryStore.auth)
        }
        requestInit.headers = headers
        const response = await fetch(import.meta.env.server + '/calendar/subscription', requestInit)
        if (!response.ok) {
          throw new Error('Response failed')
        }

        return response.text()
      }

      requestInit.credentials = 'include'
      requestInit.headers = headers
      const response = await fetch(
        import.meta.env.secretary + '/tasks/subscription',
        requestInit,
      )
      if (!response.ok) {
        throw new Error(`${response.status} Failed to load subscription calendar`)
      }
      return response.text()
    },
  },
})
