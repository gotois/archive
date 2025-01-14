import { defineStore } from 'pinia'
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
      const result = await rpc('chat', {
        '@context': ['https://www.w3.org/ns/activitystreams'],
        'type': 'Collection',
        'totalItems': this.messages.length,
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
      return result
    },
  },
})
