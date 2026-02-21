import { boot } from 'quasar/wrappers'
import { init, retrieveLaunchParams, viewport } from '@telegram-apps/sdk'
import { isTMA, isWebApp } from '../composables/detector'
import { appendErundaScript } from '../services/debug'
import { appendTelegramWebAppScript } from '../services/telegram'

export default boot(() => {
  if (!isTMA.value && !isWebApp.value) {
    console.log('It is not TMA. Skipping...')
    return
  }
  init()
  const { tgWebAppStartParam } = retrieveLaunchParams()
  console.log('tgWebAppStartParam::', tgWebAppStartParam)
  if (tgWebAppStartParam) {
    const payload = JSON.parse(atob(tgWebAppStartParam)) as Record<
      string,
      unknown
    >

    if (payload?.debug) {
      appendErundaScript()
      appendTelegramWebAppScript()
    }
  }
  viewport.expand()
})
