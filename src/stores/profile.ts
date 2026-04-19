import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'
import { getGravatarURL } from '../helpers/schemaHelper'

interface State {
  email: string
  phone: string
  avatar: string
  loc: string
}

export default defineStore('profile', {
  state: (): State => ({
    email: LocalStorage.getItem('email') ?? '',
    phone: LocalStorage.getItem('phone') ?? '',
    avatar: LocalStorage.getItem('avatar') ?? '',
    loc: undefined,
  }),
  actions: {
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
      if (avatarURL) {
        this.consumerImg(avatarURL)
      }
    },
  },
  getters: {},
})
