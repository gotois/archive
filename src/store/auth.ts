import {LocalStorage} from 'quasar'
import {Module} from 'vuex'
import {StateInterface} from './index'
import {getHash} from '../services/cryptoHelper'

export interface AuthState {
  code: string|null;
}

const Auth: Module<AuthState, StateInterface> = {
  namespaced: true,
  state: () => ({
    code: null,
  }),
  mutations: {
    setCode(state, code: string) {
      state.code = code
    },
  },
  actions: {
    async setCode(context, value: string) {
      const cryptoCode = await getHash(value)
      LocalStorage.set('code', cryptoCode)
      context.commit('setCode', cryptoCode)
    },
    async checkCode(context, value: string) {
      const cryptoCode = await getHash(value)
      return cryptoCode === LocalStorage.getItem('code')
    },
  },
  getters: {
    checkAuth(state) {
      return state.code === LocalStorage.getItem('code')
    },
    code(state) {
      return state.code
    },
  },
}

export default Auth
