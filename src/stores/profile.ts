import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'
import useSecretaryStore from 'stores/secretary'
import { getGravatarURL } from '../helpers/schemaHelper'
import { validUrlString } from '../helpers/urlHelper'
import getLocation from '../services/cloudflare'
import { parseJwt } from '../helpers/dataHelper'

interface State {
  did: string
  email: string
  phone: string
  avatar: string
  loc: string
}

export default defineStore('profile', {
  state: (): State => ({
    // todo выбирать все не из LocalStorage, а из JWT payload
    did: LocalStorage.getItem('did') ?? '',
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
    consumerDID(value: string) {
      const did = value.trim()
      LocalStorage.set('did', did)
      this.did = did
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
      const obj = parseJwt(secretaryStore.jwt) // todo перенести в геттер secretaryStore
      // todo - поддержать выдачу WebId
      return {
        '@context': 'https://json-ld.org/contexts/person.jsonld',
        '@type': 'Person',
        'email': state.email,
        'name': obj.name.trim(),
        'image': state.avatar,
        'telephone': state.phone?.length ? state.phone : null,
        'homepage': null, // todo поддержать значение личного сайта
      }
    },
  },
})
