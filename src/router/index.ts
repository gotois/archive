import { Platform, Loading, LocalStorage, Notify, SessionStorage } from 'quasar'
import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import useTutorialStore from 'stores/tutorial'
import useAuthStore from 'stores/auth'
import usePodStore from 'stores/pod'
import useLangStore from 'stores/lang'
import routes, { ROUTE_NAMES } from './routes'
import { deleteDatabases, reset } from '../services/databaseService'
import solidAuth from '../services/authService'
import { isTWA, isTMA } from '../composables/detector'
import { appendTelegramWebAppScript } from '../services/telegram'
import { appendErundaScript } from '../services/debug'

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
    const { code, state, error, lang, debug } = to.query as {
      code?: string
      state?: string
      error?: string
      lang?: string
      debug?: string
    }

    // hack - специальный путь для сброса состояния приложения
    if (to.path === '/reset') {
      LocalStorage.clear()
      SessionStorage.clear()
      await reset()
      deleteDatabases()
      window.location.replace(ROUTE_NAMES.PROMO)
      return
    }

    if (debug) {
      if (!Platform.is.desktop) {
        appendErundaScript()
      }
      if (!isTMA) {
        appendTelegramWebAppScript()
      }
    }
    if (lang) {
      const langStore = useLangStore()
      langStore.setLang(lang)
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
