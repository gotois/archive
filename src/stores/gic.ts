import { defineStore } from 'pinia'
import vzor from '../services/vzorService'

interface Store {
  available: boolean
}

export default defineStore('gic', {
  state: (): Store => ({
    available: false,
  }),
  actions: {
    // делаем ping чтобы понять что есть доступ к GIC
    async ping() {
      const request = (await vzor('ping', {
        content: 'hello',
      })) as {
        text?: string
        error?: {
          code: number
          message: string
        }
      }
      if (request.error) {
        console.warn('GIC Server: ', request.error.message)
        return
      }
      this.available = true
    },
    async document(content: string) {
      if (!this.available) {
        throw new Error('GIC Server Unavailable')
      }
      const ld = (await vzor('generate-event', {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'type': 'Activity',
        'object': [{ type: 'Note', content: content, mediaType: 'text/plain' }],
        // startTime: '2024-06-03T19:31:33.000Z',
        // endTime: '2024-06-03T19:31:33.000Z',
      })) as {
        name: string
        description: string | null
        location: string | null
        startDate: string | null
        endDate: string | null
        inLanguage: {
          name: string
        }
        text: string
        organizer: {
          name: string
          email: string | null
          telephone: string | null
          url: string | null
        }
      }
      return ld
    },
  },
})
