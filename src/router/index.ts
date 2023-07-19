import { Notify, Loading, LocalStorage, SessionStorage } from 'quasar'
import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import useAuthStore from 'stores/auth'
import usePodStore from 'stores/pod'
import routes from './routes'
import { ROUTE_NAMES } from './routes'
import { keys, keyPair, db } from '../services/databaseService'
import solidAuth from '../services/authService'

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
    const { code, state, error } = to.query

    // hack - специальный путь для сброса состояния приложения
    if (to.path === '/reset') {
      LocalStorage.clear()
      SessionStorage.clear()
      await keys.destroy()
      await db.destroy()
      await keyPair.destroy()
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
    if (to.path === '/reset') {
      return {
        name: ROUTE_NAMES.TUTORIAL,
      }
    }
    switch (to.name) {
      case ROUTE_NAMES.PRIVACY: {
        return true
      }
      case ROUTE_NAMES.LOGIN: {
        if (!authStore.isLoggedIn) {
          return true
        }
        break
      }
      case ROUTE_NAMES.TUTORIAL: {
        if (LocalStorage.has('tutorialCompleted')) {
          return {
            name: ROUTE_NAMES.ARCHIVE,
            query: {
              page: 1,
            },
          }
        }
        return true
      }
      case 'auth': {
        if (
          !LocalStorage.has('code') ||
          (LocalStorage.has('code') && authStore.pinIsLoggedIn)
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
        if (!LocalStorage.has('tutorialCompleted')) {
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
          return {
            name: ROUTE_NAMES.TUTORIAL,
            query: {},
          }
        }
        if (LocalStorage.has('code') && !authStore.pinIsLoggedIn) {
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
          }
        }
        break
      }
    }
  })

  return Router
})
