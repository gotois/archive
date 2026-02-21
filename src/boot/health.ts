import { boot } from 'quasar/wrappers'
import useSecretaryStore from 'stores/secretary'
import useGeoStore from 'stores/geo'

export default boot(async () => {
  const secretaryStore = useSecretaryStore()
  const geoStore = useGeoStore()

  Promise.all([geoStore.start()]).catch((error) => {
    console.warn('geo', error)
  })
  await secretaryStore.ping()
})
