import { boot } from 'quasar/wrappers'
import useGeoStore from '@/shared/model/geo'
import { isChatGPT } from '@/shared/lib/detector'
import { getHostBridge } from '@/shared/lib/hostBridge'

export default boot(async () => {
  const geoStore = useGeoStore()
  const bridge = getHostBridge()

  if (isChatGPT.value) {
    geoStore.timeZone = bridge.timezone || 'Europe/Moscow'
    return
  }

  Promise.all([geoStore.start()]).catch((error) => {
    console.warn('geo', error)
  })
})
