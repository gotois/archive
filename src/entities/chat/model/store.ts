import { defineStore } from 'pinia'

type Message = {
  type: string
  mediaType: string
  content: string
}

type DialogResponse = {
  credentialSubject: {
    object: {
      contentMap: Record<string, string>
    }
  }
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
    dialog(): DialogResponse | null {
      console.log('передавать данные через AI иным способом')
      return null
    },
  },
})
