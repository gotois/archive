import { LocalStorage, SessionStorage } from 'quasar'
import { defineStore } from 'pinia'
import { WebId } from '@inrupt/solid-client'
import { getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { getHash } from '../helpers/cryptoHelper'

interface Store {
  pinIsLoggedIn: boolean
  code: string
  openIdSessionId: string
  openIdExpirationDate: null | number
  openIdIsLoggedIn: boolean
  webId: WebId
  tryAuth: boolean
}

export const demoUserWebId = 'did:gic:demo' as WebId

export default defineStore('auth', {
  state: (): Store => ({
    tryAuth: LocalStorage.getItem('tryAuth') ?? false,
    pinIsLoggedIn: SessionStorage.getItem('isLoggedIn') ?? false,
    code: LocalStorage.getItem('code'),
    openIdSessionId: '',
    openIdExpirationDate: null,
    openIdIsLoggedIn: false,
    webId: getDefaultSession().info.webId ?? demoUserWebId,
  }),
  actions: {
    async setCode(value: string) {
      const cryptoCode = await getHash(value)
      LocalStorage.set('code', cryptoCode)
      this.code = cryptoCode
    },
    setTryAuthValue() {
      LocalStorage.set('tryAuth', true)
    },
    removeCode() {
      LocalStorage.remove('code')
      SessionStorage.remove('isLoggedIn')
      this.code = ''
    },
    async validate(value: string) {
      const cryptoCode = await getHash(value)
      this.pinIsLoggedIn = cryptoCode === LocalStorage.getItem('code')
      SessionStorage.set('isLoggedIn', this.pinIsLoggedIn)
    },
    openIdHandleIncoming() {
      const { info } = getDefaultSession()
      if (info.webId) {
        this.openIdSessionId = info.sessionId
        this.webId = info.webId
        this.setTryAuthValue()
      } else {
        console.warn('Your WebId empty')
      }
      this.openIdIsLoggedIn = info.isLoggedIn
      if (info.expirationDate) {
        this.openIdExpirationDate = info?.expirationDate
        this.setTryAuthValue()
      }
    },
  },
  getters: {
    isDemo(state) {
      return state.openIdSessionId.length === 0 && !state.tryAuth
    },
    hasCode(state) {
      return Boolean(state.code)
    },
    isLoggedIn(state) {
      return state.openIdIsLoggedIn
    },
  },
})
