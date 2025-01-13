import { uid } from 'quasar'
import { defineStore } from 'pinia'
import requestJsonRpc2 from 'request-json-rpc2'
import {
  ActivityObjectNote,
  ActivityObjectLink,
  Calendar,
  CalendarEventExternal,
} from '../types/models'
import rpc from '../helpers/rpc'

interface Store {
  messages: string[]
}

export default defineStore('chat', {
  state: (): Store => ({
    messages: [],
  }),
  actions: {
    async send(message: string) {
      console.log('message', message)
      this.messages.push(message)
      try {
        const result = await rpc('chat', {
          '@context': ['https://www.w3.org/ns/activitystreams'],
          'type': 'Collection',
          'totalItems': 1,
          'items': this.messages.map((message) => {
            return {
              '@context': 'https://www.w3.org/ns/activitystreams',
              'type': 'Activity',
              'object': {
                type: 'Note',
                content: message,
                mediaType: 'text/plain',
              },
              // instrument: instrument(message),
              // actor: group(message.channel_post.chat),
              // origin: origin(message),
              // startTime: time(message.channel_post.date),
              // endTime: time(now),
            }
          }),
        })
        console.log('result', result)
        return result
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        console.warn('GIC Server: ', error.message)
      }
    },
  },
})
