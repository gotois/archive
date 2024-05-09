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
      const request = (await vzor('ping', { content: 'hello' })) as {
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
      // fixme два последовательных JSON RPC 2.0 запроса на API Server:
      const ld1 = (await vzor('generate-ocr', {
        content: content,
        type: 'plain/text',
      })) as {
        text: string
      }
      const ld2 = (await vzor('generate-event', {
        content: ld1.text,
        type: 'plain/text',
      })) as {
        name: string
        description: string | null
        location: string | null
        startDate: string | null
        endDate: string | null
        inLanguage: {
          name: string
        }
        organizer: {
          name: string
          email: string | null
          telephone: string | null
          url: string | null
        }
      }
      return ld2
    },
  },
})
