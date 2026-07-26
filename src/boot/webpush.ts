import { boot } from 'quasar/wrappers'
import { silentResubscribe } from '@/features/web-push'
import { isChatGPT } from '@/shared/lib/detector'

export default boot(() => {
  if (isChatGPT.value) {
    return
  }
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
