import { boot } from 'quasar/wrappers'
import { init, retrieveLaunchParams, viewport } from '@telegram-apps/sdk'
import type { Router } from 'vue-router'
import { isTMA, isWebApp } from '@/composables/detector'
import { appendErundaScript } from '@/services/debug'
import { appendTelegramWebAppScript } from '@/services/telegram'

export default boot(({ router }: { router: Router }) => {
  if (!isTMA.value && !isWebApp.value) {
    console.log('It is not TMA. Skipping...')
    return
  }
  init()
  const { payload, tgWebAppStartParam } = retrieveLaunchParams()
  const { to, debug, twa } = JSON.parse(atob(payload || tgWebAppStartParam))

  if (typeof to === 'string') {
    router.isReady()
      .then(() => router.replace(decodeURIComponent(to)))
      .catch(error => console.error(error))
  }
  if (debug) {
    appendErundaScript()
  }
  if (twa) {
    appendTelegramWebAppScript()
  }

  viewport.expand()
})
