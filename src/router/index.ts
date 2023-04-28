import { LocalStorage, SessionStorage } from 'quasar'
import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import useAuthStore from 'stores/auth'
import routes from './routes'
import solidAuth from '../services/authHelper'

export default route(() => {
  const Router = createRouter({
    scrollBehavior: () => ({
      left: 0,
      top: 0,
    }),
    routes,
    history: createWebHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to, from) => {
    const authStore = useAuthStore()
    if (
      !from.name &&
      !to.query.error &&
      to.query.code &&
      to.query.state &&
      !authStore.isLoggedIn
    ) {
      try {
        await solidAuth({
          redirectUrl: window.location.origin + to.path,
        })
        delete to.query.code
        delete to.query.state
        return {
          name: to.name,
          query: to.query,
        }
      } catch (e) {
        console.error(e)
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
          try {
            await solidAuth({
              redirectUrl: window.location.origin + to.path,
            })
          } catch (e) {
            console.error(e)
            SessionStorage.remove('restorePreviousSession')
          }
        }
        break
      }
    }
  })

  return Router
})
