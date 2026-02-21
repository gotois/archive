import { Loading, LocalStorage, Notify, SessionStorage } from 'quasar'
import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import useTutorialStore from 'stores/tutorial'
import useAuthStore from 'stores/auth'
import usePodStore from 'stores/pod'
import useLangStore from 'stores/lang'
import routes, { ROUTE_NAMES } from './routes'
import { deleteDatabases, reset } from '../services/databaseService'
import solidAuth from '../services/authService'
import { isTWA } from '../composables/detector'
import rpc from '../helpers/rpc'

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
    const { code, state, error, lang } = to.query as {
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

    if (error || !(code && state)) {
      return
    }
    if (lang) {
      const langStore = useLangStore()
      langStore.setLang(lang)
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

  Router.beforeEach(async (to, from) => {
    const authStore = useAuthStore()
    const tutorialStore = useTutorialStore()

    switch (to.name) {
      case ROUTE_NAMES.PROMO:
      case ROUTE_NAMES.PRIVACY: {
        break
      }
      case ROUTE_NAMES.LOGIN: {
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
        try {
          await rpc('hello', {})

          if (isTWA.value) {
            // todo - нужно делать sendData jwt в бота
            return {
              name: ROUTE_NAMES.ROOT,
            }
          }

          return {
            name: ROUTE_NAMES.ARCHIVE,
            query: {
              fullPath: to.fullPath,
            },
          }
        } catch (error) {
          console.warn('auth:', error)
        }
        break
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
    return true
  })

  return Router
})
