import { LocalStorage } from 'quasar'
import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import ContractStore from 'stores/contract'
import AuthStore from 'stores/auth'
import TutorialStore from 'stores/tutorial'
import routes from './routes'
import { solidAuth } from '../services/podHelper'

const contractStore = ContractStore()
const authStore = AuthStore()
const tutorialStore = TutorialStore()

export default route(async function () {
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

  await contractStore.loadContractNames()
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
          name: 'tutorial',
        }
      }
      case '/privacy': {
        return true
      }
      case '/auth': {
        if (authStore.hasCode) {
          return true
        }
        break
      }
      case '/tutorial': {
        if (tutorialStore.tutorialCompleted) {
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
              loginCallback: () => void authStore.openIdHandleIncoming(),
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
        if (!tutorialStore.tutorialCompleted) {
          return {
            name: 'tutorial',
            query: {},
          }
        }
        if (!authStore.checkAuth) {
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
                void authStore.openIdHandleIncoming(),
              loginCallback: () => void authStore.openIdHandleIncoming(),
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
