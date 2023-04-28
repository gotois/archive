import { LocalStorage, SessionStorage} from 'quasar'
import { defineStore } from 'pinia'
import { WebId } from '@inrupt/solid-client'
import { getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { getHash } from '../services/cryptoHelper'

interface Store {
  pinIsLoggedIn: boolean
  code: string
  openIdSessionId: string
  openIdExpirationDate: null | number
  openIdIsLoggedIn: boolean
  webId: WebId | string
}

export default defineStore('auth', {
  state: (): Store => ({
    pinIsLoggedIn: SessionStorage.getItem('isLoggedIn') ?? false,
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
    async validate(value: string) {
      const cryptoCode = await getHash(value)
      this.pinIsLoggedIn = cryptoCode === LocalStorage.getItem('code')
      console.log('this.pinIsLoggedIn', this.pinIsLoggedIn)
      SessionStorage.set('isLoggedIn', this.pinIsLoggedIn)
    },
    openIdHandleIncoming() {
      const { info } = getDefaultSession()
      this.openIdSessionId = info.sessionId
      if (info.webId) {
        this.webId = info.webId
      } else {
        console.warn('Your WebId empty')
      }
      this.openIdIsLoggedIn = info?.isLoggedIn ?? false
      if (info.expirationDate) {
        this.openIdExpirationDate = info?.expirationDate
      }
    },
  },
  getters: {
    hasCode(state) {
      return Boolean(state.code)
    },
    isLoggedIn(state) {
      return state.openIdIsLoggedIn
    },
  },
})
