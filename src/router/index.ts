import { LocalStorage, SessionStorage } from 'quasar'
import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import useAuthStore from 'stores/auth'
import routes from './routes'

export default route(() => {
  const Router = createRouter({
    scrollBehavior: () => ({
      left: 0,
      top: 0,
    }),
    routes,
    history: createWebHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach((to, from) => {
    if (to.name === 'login') {
      return true
    }
    const authStore = useAuthStore()
    if (
      !from.name &&
      !to.query.error &&
      to.query.code &&
      to.query.state &&
      !authStore.isLoggedIn
    ) {
      return {
        ...to,
        name: 'login',
      }
    }
    switch (to.path) {
      // hack - специальная страница для сброса состояния приложения
      case '/reset': {
        LocalStorage.clear()
        return {
          name: 'tutorial',
        }
      }
      case '/privacy': {
        return true
      }
      case '/auth': {
        if (
          !LocalStorage.has('code') ||
          (LocalStorage.has('code') && authStore.pinIsLoggedIn)
        ) {
          console.log('to archive')
          return {
            name: 'archive',
            query: { page: 1 },
          }
        }
        return true
      }
      case '/tutorial': {
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
        if (SessionStorage.has('restorePreviousSession')) {
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
