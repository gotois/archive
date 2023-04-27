import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'
import { WebId } from '@inrupt/solid-client'
import { getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { getHash } from '../services/cryptoHelper'

interface Store {
  code: string
  openIdSessionId: string
  openIdExpirationDate: null | number
  openIdIsLoggedIn: boolean
  webId: WebId | string
}

export default defineStore('auth', {
  state: (): Store => ({
    code: LocalStorage.getItem('code'),
    openIdSessionId: '',
    openIdExpirationDate: null,
    openIdIsLoggedIn: false,
    webId: getDefaultSession().info.webId,
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
      } else {
        console.warn('Your WebId empty')
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
