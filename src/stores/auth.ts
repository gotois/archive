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
  hasTelegramWebApp: boolean
}

export const demoUserWebId = 'did:gic:demo' as WebId

export default defineStore('auth', {
  state: (): Store => ({
    tryAuth: LocalStorage.getItem('tryAuth') ?? false,
    pinIsLoggedIn: SessionStorage.getItem('isLoggedIn') ?? false,
    openIdSessionId: '',
    openIdExpirationDate: null,
    openIdIsLoggedIn: false,
    hasTelegramWebApp:
      Boolean(SessionStorage.getItem('telegramWebApp')) ??
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      Boolean(window?.Telegram?.WebApp?.version),
    webId: getDefaultSession().info.webId ?? demoUserWebId,
  }),
  actions: {
    setTryAuthValue() {
      LocalStorage.set('tryAuth', true)
    },
    setTelegramWebApp(value: boolean) {
      SessionStorage.set('telegramWebApp', value)
      this.hasTelegramWebApp = value
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
    isDemo(state) {
      return state.openIdSessionId.length === 0 && !state.tryAuth
    },
    isTelegramWebApp(state) {
      return state.hasTelegramWebApp
    },
    isLoggedIn(state) {
      return state.openIdIsLoggedIn
    },
  },
})
