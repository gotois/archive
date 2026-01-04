import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { RequestedContact, retrieveLaunchParams } from '@telegram-apps/sdk'
import useTutorialStore from 'stores/tutorial'
import rpc from '../helpers/rpc'
import type {
  TelegramUser,
  ActivityObjectNote,
  ActivityObjectLink,
  VerifiableCredential,
} from '../types/models'
import { isTMA } from '../composables/detector'

interface Store {
  available: boolean
  login?: string
  password?: string
}
export default defineStore('secretary', {
  state: (): Store => ({
    available: false,
    login: LocalStorage.getItem('login') ?? null,
    password: LocalStorage.getItem('password') ?? null,
  }),
  actions: {
    async ping() {
      try {
        if (!process.env.server) {
          throw new Error('Unknown Server host')
        }
        const response = await fetch(
          process.env.server + '/health?service=redis',
          {
            method: 'GET',
            headers: {
              Accept: 'text/plain',
            },
          },
        )
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        this.available = Boolean(await response.text())
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/ban-ts-comment
        // @ts-expect-error
        console.warn('GIC Server: ', error.message)
        this.available = false
        throw error
      }
    },
    async authWithLoginAndPassword(login: string, password: string) {
      try {
        this.login = login
        this.password = password
        await rpc('hello', {})
        LocalStorage.set('login', login)
        LocalStorage.set('password', password)
      } catch (error) {
        console.error(error)
        this.login = null
        this.password = null
      }
    },
    logout() {
      const tutorialStore = useTutorialStore()
      tutorialStore.tutorialComplete(false)
    },
    async registration(requestedContact: RequestedContact | TelegramUser) {
      const response = await fetch(process.env.server + '/users/telegram/bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestedContact),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return (await response.json()) as VerifiableCredential
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
    auth(store): string {
      try {
        if (isTMA.value) {
          return this.tmaAuth as string
        } else if (store.login && store.password) {
          return this.basicAuth as string
        }
        throw new Error('Unknown auth error')
      } catch (error) {
        console.warn(error)
        return ''
      }
    },
    basicAuth(store): string | Error {
      if (!store.login?.length || !store.password?.length) {
        throw new Error('Empty login or password')
      }
      return 'Basic ' + btoa(store.login + ':' + store.password)
    },
    tmaAuth(): string | Error {
      const { initDataRaw } = retrieveLaunchParams()
      if (!initDataRaw?.length) {
        throw new Error('Empty telegram init data')
      }
      return `tma ${initDataRaw}`
    },
  },
})
