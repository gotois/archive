import { boot } from 'quasar/wrappers'
import useSecretaryStore from 'stores/secretary'
import useGeoStore from 'stores/geo'

export default boot(() => {
  const secretaryStore = useSecretaryStore()
  const geoStore = useGeoStore()

  Promise.all([secretaryStore.ping()]).catch((error) => {
    console.warn('ping', error)
  })
  Promise.all([geoStore.start()]).catch((error) => {
    console.warn('geo', error)
  })
})
