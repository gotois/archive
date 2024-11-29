import { LocalStorage, SessionStorage } from 'quasar'
import { defineStore } from 'pinia'
import { WebId } from '@inrupt/solid-client'
import { RequestedContact, retrieveLaunchParams } from '@telegram-apps/sdk'
import { getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { isTMA } from '../helpers/twaHelper'
import { TelegramUser } from '../types/models'

interface Store {
  pinIsLoggedIn: boolean
  openIdSessionId: string
  openIdExpirationDate: null | number
  openIdIsLoggedIn: boolean
  webId: WebId
  tryAuth: boolean
  jwt: string
  login?: string
  password?: string
}

export const demoUserWebId = 'did:gic:demo' as WebId

export default defineStore('auth', {
  state: (): Store => ({
    tryAuth: LocalStorage.getItem('tryAuth') ?? false,
    pinIsLoggedIn: SessionStorage.getItem('isLoggedIn') ?? false,
    openIdSessionId: '',
    openIdExpirationDate: null,
    openIdIsLoggedIn: false,
    webId: getDefaultSession().info.webId ?? demoUserWebId,
    jwt: LocalStorage.getItem('jwt') ?? null,
    login: LocalStorage.getItem('login') ?? null,
    password: LocalStorage.getItem('password') ?? null,
  }),
  actions: {
    setLoginAndPassword(login: string, password: string) {
      this.login = login
      this.password = password
      LocalStorage.set('login', login)
      LocalStorage.set('password', password)
    },
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
    async authorizationByTg() {
      const response = await fetch(process.env.server + '/auth', {
        method: 'GET',
        headers: {
          'Content-Type': 'plain/text',
          'Authorization': this.tmaAuth,
        },
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const jwt: string = await response.text()
      if (!jwt) {
        throw new Error('jwt is empty')
      }
      LocalStorage.set('jwt', jwt)
      this.jwt = jwt
    },
    async registration(requestedContact: RequestedContact | TelegramUser) {
      const response = await fetch(process.env.server + '/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.basicAuth,
        },
        body: JSON.stringify(requestedContact),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const jwt: string = await response.json()
      LocalStorage.set('jwt', jwt)
      this.jwt = jwt
    },
  },
  getters: {
    basicAuth(): string {
      if (!this.login || !this.password) {
        return
      }
      return 'Basic ' + btoa(this.login + ':' + this.password)
    },
    tmaAuth() {
      if (!isTMA) {
        return
      }
      const { initDataRaw } = retrieveLaunchParams()
      if (!initDataRaw?.length) {
        throw new Error('Empty telegram init data')
      }
      return `tma ${initDataRaw}`
    },
    isDemo(state) {
      return state.openIdSessionId.length === 0 && !state.tryAuth
    },
    // todo - нужно разделение описания, так как сейчас можно быть залогиненым как через Solid, так и через Telegram
    isLoggedIn(state) {
      return state.openIdIsLoggedIn
    },
  },
})
