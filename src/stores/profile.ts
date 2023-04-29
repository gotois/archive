import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'

interface State {
  consumer: string
  email: string
}

export default defineStore('profile', {
  state: (): State => ({
    consumer: LocalStorage.getItem('consumer') ?? '',
    email: LocalStorage.getItem('email') ?? '',
  }),
  actions: {
    consumerName(value: string) {
      const consumer = value.trim()
      LocalStorage.set('consumer', consumer)
      this.consumer = consumer
    },
    consumerEmail(value: string) {
      const email = value.trim()
      LocalStorage.set('email', email)
      this.email = email
    },
  },
  getters: {
    getConsumer(state) {
      return state.consumer
    },
    getEmail(state) {
      return state.email
    },
  },
})
