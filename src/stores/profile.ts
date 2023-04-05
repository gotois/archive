import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'

interface State {
  consumer: string
}

export default defineStore('profile', {
  state: (): State => ({
    consumer: LocalStorage.getItem('consumer') ?? '',
  }),
  actions: {
    consumerName(value: string) {
      const consumer = value.trim()
      LocalStorage.set('consumer', consumer)
      this.consumer = consumer
    },
  },
})
