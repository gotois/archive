import { store } from 'quasar/wrappers'
import { InjectionKey } from 'vue'
import { createStore, Store as VuexStore, useStore as vuexUseStore } from 'vuex'
import Profile from './profile'
import Contract from './contract'
import Tutorial, { TutorialState } from './tutorial'
import Auth, { AuthState } from './auth'

export interface StateInterface {
  auth: AuthState
  tutorial: TutorialState
}

// provide typings for `this.$store`
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: VuexStore<StateInterface>
  }
}

// provide typings for `useStore` helper
export const storeKey: InjectionKey<VuexStore<StateInterface>> =
  Symbol('vuex-key')

export default store(function () {
  const Store = createStore<StateInterface>({
    modules: {
      Profile,
      Contract,
      Auth,
      Tutorial,
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: !!process.env.DEBUGGING,
  })

  return Store
})

export function useStore() {
  return vuexUseStore(storeKey)
}
