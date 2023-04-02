import { LocalStorage } from 'quasar'
import { route } from 'quasar/wrappers'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'
import { StateInterface } from '../store'
import routes from './routes'
import { solidAuth } from '../services/podHelper'

export default route<StateInterface>(function ({ store /* , ssrContext */ }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({
      left: 0,
      top: 0,
    }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(
      process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE,
    ),
  })

  void store.dispatch('loadContractNames')
  const tutorialFinalStep = 3

  Router.beforeEach(async (to, from) => {
    if (to.query.error) {
      switch (to.query.error) {
        case 'interaction_required':
        case 'access_denied': {
          LocalStorage.remove('restorePreviousSession')
          break
        }
        default: {
          break
        }
      }
    }

    switch (to.path) {
      case '/privacy':
      case '/auth': {
        return true
      }
      case '/tutorial': {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (store.getters['Tutorial/tutorialCompleted']) {
          return {
            name: 'archive',
            query: {
              page: 1,
            },
          }
        }
        // Если пользователь отменил вход через WebId
        if (to.query.error === 'access_denied') {
          return {
            name: 'tutorial',
            query: {
              step: tutorialFinalStep,
            },
          }
        }
        if (
          !to.query.error &&
          to.query.step === String(tutorialFinalStep) &&
          to.query.code &&
          to.query.state
        ) {
          const redirectUrl = window.location.origin + window.location.pathname
          try {
            await solidAuth({
              redirectUrl: redirectUrl,
              loginCallback: () =>
                void store.dispatch('Auth/openIdHandleIncoming'),
            })
            return
          } catch {
            /* empty */
          }
        }
        // Если мы остановились на шаге три, то возвращаем аутентификацию
        break
      }
      default: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!store.getters['Tutorial/tutorialCompleted']) {
          return {
            name: 'tutorial',
            query: {},
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        if (!store.getters['Auth/checkAuth']) {
          return {
            name: 'auth',
            query: {
              fullPath: to.fullPath,
            },
          }
        }
        if (to.path === '/' && Object.keys(to.query).length === 0) {
          return {
            name: 'archive',
            query: {
              page: 1,
            },
          }
        }
        if (to.query.error === 'access_denied') {
          return {
            name: 'archive',
            query: {
              page: 1,
            },
          }
        }
        if (to.query.code && to.query.state) {
          return { name: to.name, query: {} }
        }
        if (
          !from.name &&
          !to.query.error &&
          !to.query.code &&
          !to.query.state &&
          LocalStorage.has('restorePreviousSession')
        ) {
          try {
            await solidAuth({
              redirectUrl: window.location.origin + to.path,
              sessionRestoreCallback: () =>
                void store.dispatch('Auth/openIdHandleIncoming'),
              loginCallback: () =>
                void store.dispatch('Auth/openIdHandleIncoming'),
              restorePreviousSession: true,
            })
            return
          } catch (e) {
            console.error(e)
            return false
          }
        }
        break
      }
    }

    // explicitly return false to cancel the navigation
    // return false
  })

  return Router
})
