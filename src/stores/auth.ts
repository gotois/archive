import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'
import { getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { getHash } from '../services/cryptoHelper'

export default defineStore('auth', {
  state: () => ({
    code: '',
    openIdSessionId: '',
    openIdExpirationDate: null,
    openIdIsLoggedIn: false,
    webId: null,
  }),
  actions: {
    async setCode(value: string) {
      const cryptoCode = await getHash(value)
      LocalStorage.set('code', cryptoCode)
      this.code = cryptoCode
    },
    removeCode() {
      LocalStorage.remove('code')
      this.code = ''
    },
    async checkCode(value: string) {
      const cryptoCode = await getHash(value)
      return cryptoCode === LocalStorage.getItem('code')
    },
    openIdHandleIncoming() {
      const { info } = getDefaultSession()
      this.openIdSessionId = info.sessionId
      if (info.webId) {
        this.webId = info.webId
      }
      this.openIdIsLoggedIn = info?.isLoggedIn ?? false
      if (info.expirationDate) {
        this.openIdExpirationDate = info?.expirationDate
      }
    },
  },
  getters: {
    checkAuth(state) {
      if (!LocalStorage.has('code')) {
        return true
      }
      return state.code === LocalStorage.getItem('code')
    },
    hasCode(state) {
      return Boolean(state.code)
    },
    isLoggedIn(state) {
      return state.openIdIsLoggedIn
    },
  },
})
