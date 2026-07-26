import { LocalStorage, SessionStorage } from 'quasar'
import { createRouter, createWebHistory } from 'vue-router'
import useAuthStore from '@/entities/oidc-session'
import useLangStore from '@/shared/model/lang'
import { deleteDatabases, reset } from '@/shared/lib/databaseService'
import { ROUTE_NAMES } from '@/shared/config/routes'
import routes from './routes'

interface AppRouterOptions {
  sessionMode?: 'internal' | 'external'
}

export function createAppRouter({
  sessionMode = 'internal',
}: AppRouterOptions = {}) {
  let sessionChecked = false
  const router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createWebHistory(String(import.meta.env.QUASAR_VUE_ROUTER_BASE)),
  })

  router.beforeEach(async (to) => {
    if (sessionMode === 'external') {
      return true
    }

    if (to.path === '/reset') {
      LocalStorage.clear()
      SessionStorage.clear()
      await reset()
      deleteDatabases()
      window.location.replace(ROUTE_NAMES.PROMO)
      return false
    }

    const lang = typeof to.query.lang === 'string' ? to.query.lang : undefined
    if (lang) {
      useLangStore().setLang(lang)
    }

    const authStore = useAuthStore()
    if (!sessionChecked) {
      try {
        await authStore.restoreSession()
      } catch (error) {
        console.error('Unable to restore BFF session:', error)
      } finally {
        sessionChecked = true
      }
    }

    if (to.name === ROUTE_NAMES.PROMO || to.name === ROUTE_NAMES.PRIVACY) {
      return true
    }

    if (to.name === ROUTE_NAMES.LOGIN) {
      if (authStore.isLoggedIn) {
        return { name: ROUTE_NAMES.ARCHIVE, query: { page: 1 } }
      }
      return true
    }

    if (!authStore.isLoggedIn) {
      return { name: ROUTE_NAMES.LOGIN, query: {} }
    }

    return true
  })

  return router
}
