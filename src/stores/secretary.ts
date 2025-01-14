import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { RequestedContact, retrieveLaunchParams } from '@telegram-apps/sdk'
import rpc from '../helpers/rpc'
import {
  TelegramUser,
  ActivityObjectNote,
  ActivityObjectLink,
} from '../types/models'
import { isTMA } from '../helpers/twaHelper'

interface Store {
  available: boolean
  jwt: string
  login?: string
  password?: string
}
export default defineStore('secretary', {
  state: (): Store => ({
    available: false,
    jwt: LocalStorage.getItem('jwt') ?? null,
    login: LocalStorage.getItem('login') ?? null,
    password: LocalStorage.getItem('password') ?? null,
  }),
  actions: {
    async ping() {
      if (!process.env.server) {
        console.warn('Unknown server url')
        this.available = false
        return
      }
      try {
        const response = await fetch(process.env.server + '/ping', {
          method: 'GET',
          headers: {
            'Content-Type': 'text/plain',
            'Authorization': this.basicAuth,
          },
        })
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        this.available = Boolean(await response.text())
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/ban-ts-comment
        // @ts-expect-error
        console.warn('GIC Server: ', error.message)
        this.available = false
      }
    },
    // todo - похоже это не нужно больше
    setLoginAndPassword(login: string, password: string) {
      this.login = login
      this.password = password
      LocalStorage.set('login', login)
      LocalStorage.set('password', password)
    },
    logout() {
      LocalStorage.removeItem('jwt')
      this.jwt = null
    },
    async authorizationByTg() {
      const response = await fetch(process.env.server + '/authorization', {
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
      const response = await fetch(process.env.server + '/authorization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
    getOfferta() {
      return rpc('offerta')
    },
    async generate(object: ActivityObjectNote[] | ActivityObjectLink[]) {
      const result = await rpc('generate-calendar', {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'type': 'Activity',
        'object': object,
      })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
      return result
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
  },
})
