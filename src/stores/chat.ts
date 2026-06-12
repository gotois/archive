import { defineStore } from 'pinia'

type Message = {
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
      this.messages.push(item)
    },
    dialog() {
      console.log('передавать данные через AI иным способом')
    },
  },
})
