import { LocalStorage } from 'quasar'
import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
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
    if (!from.name && !to.query.error && to.query.code && to.query.state) {
      try {
        await solidAuth({
          redirectUrl: window.location.origin + to.path,
          restorePreviousSession: false,
        })
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
        if (!LocalStorage.has('code')) {
          return {
            name: 'main',
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
            LocalStorage.remove('restorePreviousSession')
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
        if (LocalStorage.has('code')) {
          return {
            name: 'auth',
            query: {
              fullPath: to.fullPath,
            },
          }
        }
        try {
          await solidAuth({
            redirectUrl: window.location.origin + to.path,
            restorePreviousSession: true,
          })
        } catch (e) {
          console.error(e)
          LocalStorage.remove('restorePreviousSession')
        }
        break
      }
    }
  })

  return Router
})
