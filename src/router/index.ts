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

  Router.beforeEach(async (to) => {
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
        // если пользователь отменил вход через WebId
        if (to.query.error === 'access_denied') {
          return {
            name: 'tutorial',
            query: {
              step: 3,
            },
          }
        }
        // Если мы останвоились на шаге три, то возвращаем аутентификацию
        if (
          navigator.onLine &&
          to.query.code &&
          to.query.state &&
          !to.query.error
        ) {
          const redirectUrl = window.location.origin + window.location.pathname
          try {
            await solidAuth({
              redirectUrl: redirectUrl,
              loginCallback: () =>
                void store.dispatch('Auth/openIdHandleIncoming'),
            })
            return true
          } catch {
            /* empty */
          }
        }
        break
      }
      default: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!store.getters['Tutorial/tutorialCompleted']) {
          return {
            name: 'tutorial',
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
        if (navigator.onLine && !to.query.error) {
          try {
            await solidAuth({
              sessionRestoreCallback: () =>
                void store.dispatch('Auth/openIdHandleIncoming'),
              loginCallback: () =>
                void store.dispatch('Auth/openIdHandleIncoming'),
              restorePreviousSession: true,
            })
            return true
          } catch (e) {
            console.error(e)
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
