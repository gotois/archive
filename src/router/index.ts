import { LocalStorage } from 'quasar'
import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import { StateInterface } from '../store'
import routes from './routes'
import { solidAuth } from '../services/podHelper'

export default route<StateInterface>(function ({ store /* , ssrContext */ }) {
  const Router = createRouter({
    scrollBehavior: () => ({
      left: 0,
      top: 0,
    }),
    routes,
    history: createWebHistory(
      process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE,
    ),
  })

  void store.dispatch('loadContractNames')
  const tutorialFinalStep = 3

  Router.beforeEach(async (to, from) => {
    switch (to.query.error) {
      case 'access_denied': {
        return {
          name: 'main',
          query: {},
        }
      }
      case 'interaction_required': {
        LocalStorage.remove('restorePreviousSession')
        break
      }
      default: {
        break
      }
    }

    switch (to.path) {
      // hack - специальная страница для сброса состояния приложения
      case '/reset': {
        localStorage.clear()
        return {
          name: 'main',
          query: {},
        }
      }
      case '/privacy': {
        return true
      }
      case '/auth': {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (store.getters['Auth/hasCode']) {
          return true
        }
        break
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
            return true
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
          return true
        }
        if (to.query.code && to.query.state) {
          return true
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
            return true
          } catch (e) {
            console.error(e)
            // explicitly return false to cancel the navigation
            return false
          }
        }
        break
      }
    }
  })

  return Router
})
