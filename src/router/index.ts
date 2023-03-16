import { route } from 'quasar/wrappers'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'
import { StateInterface } from '../store'
import routes from './routes'

export default route<StateInterface>(function ({ store /* , ssrContext */ }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({
      left: 0,
      top: 0,
    }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(
      process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE,
    ),
  })
  Router.beforeEach((to) => {
    switch (to.path) {
      case '/privacy':
      case '/auth': {
        return true
      }
      case '/tutorial': {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (store.getters['Tutorial/tutorialCompleted']) {
          return '/'
        }
        break
      }
      default: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!store.getters['Tutorial/tutorialCompleted']) {
          return '/tutorial'
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        if (!store.getters['Auth/checkAuth']) {
          return {
            name: 'auth',
            query: {
              fullPath: to.fullPath,
            },
          }
        }
        if (to.path === '/' && Object.keys(to.query).length === 0) {
          return '/?page=1'
        }
        break
      }
    }
    // explicitly return false to cancel the navigation
    // return false
  })

  return Router
})
