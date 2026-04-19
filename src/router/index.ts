import { Loading, LocalStorage, SessionStorage } from 'quasar'
import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import {
  getDefaultSession,
  handleIncomingRedirect,
} from '@inrupt/solid-client-authn-browser'
import useAuthStore from 'stores/auth'
import usePodStore from 'stores/pod'
import useLangStore from 'stores/lang'
import routes, { ROUTE_NAMES } from './routes'
import { deleteDatabases, reset } from '../services/databaseService'

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

    if (error) {
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
    if (code && state) {
      Loading.show()
      try {
        const sessionInfo = await handleIncomingRedirect({
          restorePreviousSession: true,
        })
        const response = await getDefaultSession().fetch(
          sessionInfo.webId + '/inbox',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include',
          },
        )
        if (!response.ok) {
          throw new Error('Not logged in')
        }
        const ok = await response.json()
        console.log('ok', ok)

        return {
          name: ROUTE_NAMES.ARCHIVE,
          query: {
            page: 1,
          },
        }
      } catch (error) {
        console.error(error)
      } finally {
        Loading.hide()
      }
    }
  })

  Router.beforeEach(async (to, from) => {
    const authStore = useAuthStore()

    switch (to.name) {
      case ROUTE_NAMES.PROMO:
      case ROUTE_NAMES.PRIVACY: {
        break
      }
      case ROUTE_NAMES.LOGIN: {
        /* todo - при ранее успешном логине и рабочем JWT перекидываем обратно на главную страницу
        if (tutorialStore.tutorialCompleted) {
          return {
            name: ROUTE_NAMES.ARCHIVE,
            query: {
              fullPath: to.fullPath,
              page: 1,
            },
          }
        }
         */
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
