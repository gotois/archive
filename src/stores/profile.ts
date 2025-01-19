import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'
import useSecretaryStore from 'stores/secretary'
import useAuthStore from 'stores/auth'
import { getGravatarURL } from '../helpers/schemaHelper'
import { validUrlString } from '../helpers/urlHelper'
import getLocation from '../services/cloudflare'

interface State {
  email: string
  phone: string
  avatar: string
  loc: string
}

export default defineStore('profile', {
  state: (): State => ({
    // todo выбирать все не из LocalStorage, а из JWT payload
    email: LocalStorage.getItem('email') ?? '',
    phone: LocalStorage.getItem('phone') ?? '',
    avatar: LocalStorage.getItem('avatar') ?? '',
    loc: undefined,
  }),
  actions: {
    async setNetworkUser() {
      const { loc } = await getLocation()
      this.loc = loc
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
      const secretaryStore = useSecretaryStore()
      const authStore = useAuthStore()
      return {
        '@context': 'https://json-ld.org/contexts/person.jsonld',
        '@type': 'Person',
        'id': authStore.webId,
        'email': secretaryStore.payload.email,
        'name': secretaryStore.payload.name,
        'image': state.avatar,
        'telephone': state.phone?.length ? state.phone : null,
        'homepage': null, // todo поддержать значение личного сайта
      }
    },
  },
})
