import { boot } from 'quasar/wrappers'
import { silentResubscribe } from '../services/webPushService'

export default boot(() => {
  if (process.env.MODE !== 'pwa') {
    return
  }
  if (!navigator.serviceWorker) {
    return
  }

  silentResubscribe().catch((error) => {
    console.error('WebPush boot error:', error)
  })
})
