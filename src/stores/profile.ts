import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'
import { getEmailProperty } from '../helpers/schemaHelper'

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
    getPersonLD(state) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        'email': getEmailProperty(state.email),
        'name': state.consumer,
      }
    },
  },
})
