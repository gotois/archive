import { boot } from 'quasar/wrappers'
import { silentResubscribe } from '../services/webPushService'

export default boot(() => {
  if (!import.meta.env.QUASAR_PWA_MODE) {
    return
  }
  if (!navigator.serviceWorker) {
    return
  }

  silentResubscribe().catch((error) => {
    console.error('WebPush boot error:', error)
  })
})
