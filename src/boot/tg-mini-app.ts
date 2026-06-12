import { boot } from 'quasar/wrappers'
import { init, retrieveLaunchParams, viewport } from '@telegram-apps/sdk'
import type { Router } from 'vue-router'
import { isTMA, isWebApp } from '../composables/detector'
import { appendErundaScript } from '../services/debug'
import { appendTelegramWebAppScript } from '../services/telegram'

export default boot(({ router }: { router: Router }) => {
  if (!isTMA.value && !isWebApp.value) {
    console.log('It is not TMA. Skipping...')
    return
  }
  init()
  const { tgWebAppStartParam } = retrieveLaunchParams()
  if (tgWebAppStartParam) {
    const payload = JSON.parse(atob(tgWebAppStartParam)) as Record<
      string,
      unknown
    >

    if (payload?.debug) {
      appendErundaScript()
    }
    if (payload?.twa) {
      appendTelegramWebAppScript()
    }

    if (typeof payload?.to === 'string') {
      router.isReady()
        .then(() => router.replace(payload.to))
        .catch(error => console.error(error))
    }
  }
  viewport.expand()
})
