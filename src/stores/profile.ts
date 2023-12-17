import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'
import { getEmailProperty, getGravatarURL } from '../helpers/schemaHelper'
import { validUrlString } from '../helpers/urlHelper'

interface State {
  did: string
  consumer: string
  email: string
  phone: string
  avatar: string
}

export default defineStore('profile', {
  state: (): State => ({
    did: LocalStorage.getItem('did') ?? '',
    consumer: LocalStorage.getItem('consumer') ?? '',
    email: LocalStorage.getItem('email') ?? '',
    phone: LocalStorage.getItem('phone') ?? '',
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
    consumerPhone(value: string) {
      const phone = value.trim()
      LocalStorage.set('phone', phone)
      this.phone = phone
    },
    consumerImg(value: string) {
      LocalStorage.set('avatar', value)
      this.avatar = value
    },
    async setAvatar(email: string) {
      const avatarURL = await getGravatarURL(email)
      if (validUrlString(avatarURL)) {
        this.consumerImg(avatarURL)
      }
    },
  },
  getters: {
    getPersonLD(state) {
      // todo - поддержать выдачу WebId
      return {
        '@context': 'https://json-ld.org/contexts/person.jsonld',
        '@type': 'Person',
        'email': getEmailProperty(state.email),
        'name': state.consumer,
        'image': state.avatar,
        'telephone': state.phone?.length ? state.phone : null,
        'homepage': null, // todo поддержать значение личного сайта
      }
    },
  },
})
