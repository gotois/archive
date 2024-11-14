import { LocalStorage, SessionStorage } from 'quasar'
import { defineStore } from 'pinia'
import { WebId } from '@inrupt/solid-client'
import { RequestedContact } from '@telegram-apps/sdk'
import { getDefaultSession } from '@inrupt/solid-client-authn-browser'

interface Store {
  pinIsLoggedIn: boolean
  openIdSessionId: string
  openIdExpirationDate: null | number
  openIdIsLoggedIn: boolean
  webId: WebId
  tryAuth: boolean
  jwt: string
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
    // todo - сделать авторизацию по ТГ для тех кто уже регистрировался в Секретаре
    authorizationByTg(initData: unknown) {
      console.warn('WIP: получаем новый JWT', initData)
    },
    async registration(requestedContact: RequestedContact) {
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
    basicAuth() {
      return (
        'Basic ' +
        btoa(
          process.env.server_basic_auth_user +
            ':' +
            process.env.server_basic_auth_pass,
        )
      )
    },
    isDemo(state) {
      return state.openIdSessionId.length === 0 && !state.tryAuth
    },
    isLoggedIn(state) {
      return state.openIdIsLoggedIn
    },
  },
})
