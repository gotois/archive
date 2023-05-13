import { Loading, LocalStorage, SessionStorage } from 'quasar'
import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import useAuthStore from 'stores/auth'
import usePodStore from 'stores/pod'
import routes from './routes'
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
    } catch (e) {
      console.error(e)
    }
    Loading.hide()
  })

  Router.beforeEach((to) => {
    const authStore = useAuthStore()
    // hack - специальный путь для сброса состояния приложения
    if (to.path === '/reset') {
      LocalStorage.clear()
      SessionStorage.clear()
      return {
        name: 'tutorial',
      }
    }
    switch (to.name) {
      case 'privacy': {
        return true
      }
      case 'login': {
        if (!authStore.isLoggedIn) {
          return true
        }
        break
      }
      case 'tutorial': {
        if (LocalStorage.has('tutorialCompleted')) {
          return {
            name: 'archive',
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
            name: 'archive',
            query: { page: 1 },
          }
        }
        return true
      }
      default: {
        switch (to.query.error) {
          case 'access_denied': {
            return {
              name: 'main',
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
          return {
            name: 'tutorial',
            query: {},
          }
        }
        if (LocalStorage.has('code') && !authStore.pinIsLoggedIn) {
          return {
            name: 'auth',
            query: {
              fullPath: to.fullPath,
            },
          }
        }
        if (
          !authStore.isLoggedIn &&
          SessionStorage.has('restorePreviousSession')
        ) {
          return {
            ...to,
            name: 'login',
          }
        }
        break
      }
    }
  })

  return Router
})
