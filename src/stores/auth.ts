import { LocalStorage, SessionStorage } from 'quasar'
import { defineStore } from 'pinia'
import { WebId } from '@inrupt/solid-client'
import { getDefaultSession } from '@inrupt/solid-client-authn-browser'

interface Store {
  pinIsLoggedIn: boolean
  openIdSessionId: string
  openIdExpirationDate: null | number
  openIdIsLoggedIn: boolean
  webId: WebId
  tryAuth: boolean
}

export default defineStore('auth', {
  state: (): Store => ({
    tryAuth: LocalStorage.getItem('tryAuth') ?? false,
    pinIsLoggedIn: SessionStorage.getItem('isLoggedIn') ?? false,
    openIdSessionId: '',
    openIdExpirationDate: null,
    openIdIsLoggedIn: false,
    webId: getDefaultSession().info.webId,
  }),
  actions: {
    setTryAuthValue() {
      LocalStorage.set('tryAuth', true)
    },
    removeAuthValue() {
      SessionStorage.remove('isLoggedIn')
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
    isLoggedIn(state) {
      return state.openIdIsLoggedIn
    },
  },
})
