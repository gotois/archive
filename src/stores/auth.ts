import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'
import { getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { getHash, getAndSaveKeyPair } from '../services/cryptoHelper'

interface Store {
  code: string
  openIdSessionId: string
  openIdExpirationDate: null | number
  openIdIsLoggedIn: boolean
  webId: string
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
    async openIdHandleIncoming() {
      const { info } = getDefaultSession()
      this.openIdSessionId = info.sessionId
      if (info.webId) {
        this.webId = info.webId
      } else {
        // если нет доступа к WebID используем для идентификации fingerprint от keyPair
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const keyPair = await getAndSaveKeyPair()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        this.webId = 'did:key:' + (keyPair.fingerprint() as string)
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
