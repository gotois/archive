import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { RequestedContact, retrieveLaunchParams } from '@telegram-apps/sdk'
import useTutorialStore from 'stores/tutorial'
import rpc from '../helpers/rpc'
import {
  TelegramUser,
  ActivityObjectNote,
  ActivityObjectLink,
  VerifiableCredential,
} from '../types/models'
import { isTMA } from '../helpers/twaHelper'
import { parseJwt } from '../helpers/dataHelper'

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
        console.warn('Unknown Server host')
        this.available = false
        return
      }
      try {
        const response = await fetch(process.env.server + '/ping', {
          method: 'GET',
          headers: {
            'Content-Type': 'text/plain',
            'Authorization': this.auth as string,
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
      const tutorialStore = useTutorialStore()
      LocalStorage.removeItem('jwt')
      tutorialStore.tutorialComplete(false)
      this.jwt = null
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
    async getOfferta() {
      return await rpc('offerta')
    },
    async generate(object: ActivityObjectNote[] | ActivityObjectLink[]) {
      return await rpc('generate-calendar', {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'type': 'Activity',
        'object': object,
      })
    },
    async notify(contract: VerifiableCredential) {
      return await rpc('add-calendar', {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'type': 'Activity',
        'object': contract,
      })
    },
  },
  getters: {
    auth(): string | Error {
      if (isTMA) {
        return this.tmaAuth
      } else if (this.jwt) {
        return this.bearerAuth
      }
      return this.basicAuth
    },
    basicAuth(store): string | Error {
      if (!store.login || !store.password) {
        throw new Error('Empty login or password')
      }
      return 'Basic ' + btoa(store.login + ':' + store.password)
    },
    bearerAuth(store): string | Error {
      if (!this.jwt) {
        throw new Error('Empty jwt')
      }
      return 'Bearer ' + store.jwt
    },
    tmaAuth(): string | Error {
      const { initDataRaw } = retrieveLaunchParams()
      if (!initDataRaw?.length) {
        throw new Error('Empty telegram init data')
      }
      return `tma ${initDataRaw}`
    },
    payload(store) {
      return parseJwt(store.jwt)
    },
  },
})
