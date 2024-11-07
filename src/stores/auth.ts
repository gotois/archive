import { LocalStorage, SessionStorage } from 'quasar'
import { defineStore } from 'pinia'
import { WebId } from '@inrupt/solid-client'
import { getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { registration } from '../services/secretary'
import { sendData, requestContact } from '@telegram-apps/sdk-vue'

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
    async tgWebAppAuth() {
      if (!requestContact.isSupported()) {
        throw new Error('requestContact is not Supported')
      }
      SessionStorage.set('telegramWebApp', true)
      this.hasTelegramWebApp = true
      const requestedContact = await requestContact()
      const jwt = await registration(requestedContact)
      // todo save jwt to localstorage
      // ...
      sendData(jwt)
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
