import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'
import { getEmailProperty, getGravatarURL } from '../helpers/schemaHelper'

interface State {
  consumer: string
  email: string
  avatar: string
}

export default defineStore('profile', {
  state: (): State => ({
    consumer: LocalStorage.getItem('consumer') ?? '',
    email: LocalStorage.getItem('email') ?? '',
    avatar: LocalStorage.getItem('avatar') ?? '',
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
    async setAvatar(email: string) {
      const avatar = await getGravatarURL(email)
      LocalStorage.set('avatar', avatar)
      this.avatar = avatar
    },
  },
  getters: {
    getPersonLD(state) {
      return {
        '@context': 'https://json-ld.org/contexts/person.jsonld',
        '@type': 'Person',
        'email': getEmailProperty(state.email),
        'name': state.consumer,
        'image': state.avatar,
      }
    },
  },
})
