import { boot } from 'quasar/wrappers'
import useGeoStore from 'stores/geo'

export default boot(async () => {
  const geoStore = useGeoStore()

  Promise.all([geoStore.start()]).catch((error) => {
    console.warn('geo', error)
  })
})
