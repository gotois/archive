import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'

export default defineStore('profile', {
  state: () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
