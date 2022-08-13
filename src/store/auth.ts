import {LocalStorage} from 'quasar'
import {Module} from 'vuex'
import {StateInterface} from './index'

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
    setCode(context, value: string) {
      LocalStorage.set('code', value)
      context.commit('setCode', value)
    },
  },
  getters: {
    code(state) {
      return state.code
    },
  },
}

export default Auth
