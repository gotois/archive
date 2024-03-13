import { Notify, Loading, LocalStorage, SessionStorage } from 'quasar'
import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import useTutorialStore from 'stores/tutorial'
import useAuthStore from 'stores/auth'
import usePodStore from 'stores/pod'
import routes from './routes'
import { ROUTE_NAMES } from './routes'
import { reset, deleteDatabases } from '../services/databaseService'
import solidAuth from '../services/authService'
import { isTWA } from '../helpers/twaHelper'

export default route(() => {
  const Router = createRouter({
    scrollBehavior: () => ({
      left: 0,
      top: 0,
    }),
    routes,
    history: createWebHistory(process.env.VUE_ROUTER_BASE),
  })
  // Если пользователь уже входил через Pod, пробуем авторизовать автоматически
  Router.beforeEach(async (to) => {
    const { code, state, error, lang } = to.query

    // hack - специальный путь для сброса состояния приложения
    if (to.path === '/reset') {
      LocalStorage.clear()
      SessionStorage.clear()
      await reset()
      deleteDatabases()
      window.location.replace(ROUTE_NAMES.PROMO)
      return
    }
    if (lang && !LocalStorage.has('locale')) {
      LocalStorage.set('locale', lang)
    }
    if (error || !(code && state)) {
      return
    }
    const podStore = usePodStore()
    if (!podStore.getOidcIssuer) {
      return
    }
    Loading.show()
    try {
      await solidAuth({
        restorePreviousSession: true,
        oidcIssuer: podStore.getOidcIssuer,
      })
    } catch (error) {
      console.error(error)
    } finally {
      Loading.hide()
    }
  })

  Router.beforeEach((to, from) => {
    const authStore = useAuthStore()
    const tutorialStore = useTutorialStore()
    switch (to.name) {
      case ROUTE_NAMES.PRIVACY: {
        return true
      }
      case ROUTE_NAMES.PROMO: {
        if (isTWA) {
          return {
            name: ROUTE_NAMES.ROOT,
          }
        }
        break
      }
      case ROUTE_NAMES.LOGIN: {
        if (!authStore.isLoggedIn) {
          return true
        }
        break
      }
      case ROUTE_NAMES.TUTORIAL: {
        if (tutorialStore.tutorialCompleted) {
          return {
            name: ROUTE_NAMES.ARCHIVE,
            query: {
              page: 1,
            },
          }
        }
        return true
      }
      case ROUTE_NAMES.AUTH: {
        if (
          !LocalStorage.has('secret') ||
          (LocalStorage.has('secret') && authStore.pinIsLoggedIn)
        ) {
          return {
            name: ROUTE_NAMES.ARCHIVE,
            query: { page: 1 },
          }
        }
        return true
      }
      default: {
        switch (to.query.error) {
          case 'access_denied': {
            SessionStorage.remove('restorePreviousSession')
            return {
              name: ROUTE_NAMES.ROOT,
              query: {},
            }
          }
          case 'interaction_required': {
            SessionStorage.remove('restorePreviousSession')
            break
          }
          default: {
            break
          }
        }
        if (!tutorialStore.tutorialCompleted) {
          if (to.path !== '/') {
            Notify.create({
              message: 'HTTP 403',
              type: 'warning',
              timeout: 99999999999,
              multiLine: true,
              actions: [
                {
                  label: 'Try again',
                  handler() {
                    void Router.replace(to.fullPath)
                  },
                },
                {
                  icon: 'close',
                },
              ],
            })
          }
          if (isTWA) {
            return {
              name: ROUTE_NAMES.TUTORIAL,
              query: {},
            }
          }
          return {
            name: ROUTE_NAMES.PROMO,
            query: {},
          }
        }
        if (LocalStorage.has('secret') && !authStore.pinIsLoggedIn) {
          return {
            name: ROUTE_NAMES.AUTH,
            query: {
              fullPath: to.fullPath,
            },
          }
        }
        if (
          !authStore.isLoggedIn &&
          from.name !== ROUTE_NAMES.LOGIN &&
          SessionStorage.has('restorePreviousSession')
        ) {
          return {
            ...to,
            name: ROUTE_NAMES.LOGIN,
            query: {
              ...to.query,
              fullPath: to.fullPath,
            },
          }
        }
        break
      }
    }
  })

  return Router
})
