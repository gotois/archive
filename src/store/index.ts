import {store} from 'quasar/wrappers'
import {LocalStorage} from 'quasar'
import {InjectionKey} from 'vue'
import {
  createStore,
  Store as VuexStore,
  useStore as vuexUseStore,
} from 'vuex'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export interface StateInterface {
  tutorialCompleted: boolean,
  consumer: string,
}

// provide typings for `this.$store`
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: VuexStore<StateInterface>
  }
}

// provide typings for `useStore` helper
export const storeKey: InjectionKey<VuexStore<StateInterface>> = Symbol('vuex-key')

export default store(function (/* { ssrContext } */) {
  const Store = createStore<StateInterface>({
    modules: {
    },

    state: {
      tutorialCompleted: LocalStorage.getItem('tutorialCompleted') ?? false,
      consumer: LocalStorage.getItem('consumer') ?? '',
    },
    mutations: {
      tutorialComplete(state) {
        state.tutorialCompleted = true
      },
      consumerName(state, name: string) {
        state.consumer = name
      },
    },
    actions: {
      tutorialComplete(context) {
        LocalStorage.set('tutorialCompleted', true)
        context.commit('tutorialComplete')
      },
      consumerName(context, value: string) {
        LocalStorage.set('consumer', value)
        context.commit('consumerName', value)
      },
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
