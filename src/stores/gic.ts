import { defineStore } from 'pinia'
import secretary from '../services/secretary'

interface Store {
  available: boolean
}

interface Calendar {
  categories: string[]
  description: string | null
  start: string // like Date
  end: string | null // like Date
  location: string | null
  organizer: string | null // has name, email, telephone, url
  summary: string
}

export default defineStore('gic', {
  state: (): Store => ({
    available: false,
  }),
  actions: {
    // делаем ping чтобы понять что есть доступ к GIC
    async ping() {
      const { error, result } = await secretary('ping', {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'type': 'Activity',
        'startTime': new Date().toJSON(),
      })
      if (error as { message: string }) {
        this.available = false
        console.warn('GIC Server: ', error.message)
        return
      }
      this.available = Boolean(result)
    },
    async calendar(
      object: { type: string; content: string; mediaType: string }[],
    ) {
      if (!this.available) {
        throw new Error('GIC Server Unavailable')
      }
      const { error, result } = await secretary('generate-calendar', {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'type': 'Activity',
        'object': object,
      })
      if (error as { message: string }) {
        console.warn('GIC Server: ', error.message)
        throw new Error(error.message)
      }
      return JSON.parse(result) as Calendar
    },
  },
})
