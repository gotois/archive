import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'
import { getEmailProperty, getGravatarURL } from '../helpers/schemaHelper'

interface State {
  did: string
  consumer: string
  email: string
  avatar: string
}

export default defineStore('profile', {
  state: (): State => ({
    did: LocalStorage.getItem('did') ?? '',
    consumer: LocalStorage.getItem('consumer') ?? '',
    email: LocalStorage.getItem('email') ?? '',
    avatar: LocalStorage.getItem('avatar') ?? '',
  }),
  actions: {
    consumerDID(value: string) {
      const did = value.trim()
      LocalStorage.set('did', did)
      this.did = did
    },
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
    consumerImg(value: string) {
      LocalStorage.set('avatar', value)
      this.avatar = value
    },
    async setAvatar(email: string) {
      const avatarURL = await getGravatarURL(email)
      if (!avatarURL.length) {
        return
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      if (Reflect.has(URL, 'canParse') && !URL.canParse(avatarURL)) {
        return
      }
      this.consumerImg(avatarURL)
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
