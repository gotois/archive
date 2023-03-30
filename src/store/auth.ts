import { LocalStorage } from 'quasar'
import { Module } from 'vuex'
import {
  getDefaultSession,
  ISessionInfo,
} from '@inrupt/solid-client-authn-browser'
import { StateInterface } from './index'
import { getHash } from '../services/cryptoHelper'

export interface AuthState {
  openIdExpirationDate: number
  openIdSessionId: string
  openIdIsLoggedIn: boolean
  code: string | null
  webId: string
}

const Auth: Module<AuthState, StateInterface> = {
  namespaced: true,
  state: () => ({
    code: null,

    openIdSessionId: '',
    openIdExpirationDate: null,
    openIdIsLoggedIn: false,
    webId: null,
  }),
  mutations: {
    setCode(state, code: string) {
      state.code = code
    },
    setSessionInfo(state, sessionInfo: ISessionInfo) {
      state.openIdSessionId = sessionInfo.sessionId
      if (sessionInfo.webId) {
        state.webId = sessionInfo.webId
      }
      state.openIdIsLoggedIn = sessionInfo?.isLoggedIn ?? false
      if (sessionInfo.expirationDate) {
        state.openIdExpirationDate = sessionInfo?.expirationDate
      }
    },
  },
  actions: {
    async setCode(context, value: string) {
      const cryptoCode = await getHash(value)
      LocalStorage.set('code', cryptoCode)
      context.commit('setCode', cryptoCode)
    },
    removeCode(context) {
      LocalStorage.remove('code')
      context.commit('setCode', '')
    },
    async checkCode(context, value: string) {
      const cryptoCode = await getHash(value)
      return cryptoCode === LocalStorage.getItem('code')
    },
    openIdHandleIncoming(context) {
      const { info } = getDefaultSession()
      context.commit('setSessionInfo', info)
    },
  },
  getters: {
    checkAuth(state) {
      return state.code === LocalStorage.getItem('code')
    },
    code(state) {
      return state.code
    },
    isLoggedIn(state) {
      return navigator.onLine && state.openIdIsLoggedIn
    },
  },
}

export default Auth
