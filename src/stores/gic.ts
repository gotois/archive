import { defineStore } from 'pinia'
import {
  ping,
  generateCalendar,
  ActivityObjectNote,
  ActivityObjectLink,
} from '../services/secretary'

interface Store {
  available: boolean
}

export default defineStore('gic', {
  state: (): Store => ({
    available: false,
  }),
  actions: {
    async ping() {
      this.available = await ping()
    },
    calendar(object: ActivityObjectNote[] | ActivityObjectLink[]) {
      if (!this.available) {
        throw new Error('GIC Server Unavailable')
      }
      return generateCalendar({
        '@context': 'https://www.w3.org/ns/activitystreams',
        'type': 'Activity',
        'object': object,
      })
    },
  },
})
