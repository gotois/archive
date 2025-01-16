import { defineStore } from 'pinia'
import rpc from '../helpers/rpc'

interface Message {
  type: string
  mediaType: string
  content: string
}

interface Store {
  messages: Message[]
}

export default defineStore('chat', {
  state: (): Store => ({
    messages: [],
  }),
  actions: {
    add(item: Message) {
      console.log('message', item)
      this.messages.push(item)
    },
    async dialog() {
      return await rpc('chat', {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'type': 'Collection',
        'totalItems': this.messages.length,
        'items': this.messages,
      })
    },
  },
})
