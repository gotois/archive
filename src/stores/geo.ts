import { defineStore } from 'pinia'
import {
  checkGeolocationPermission,
  getCurrentPosition,
} from '../services/geoService'

interface Store {
  coordinates: GeolocationCoordinates
  timeZone: string
  u: number // точность в метрах
  cgen: string
}

export default defineStore('geo', {
  state: (): Store => ({
    coordinates: null,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    u: 10,
    cgen: 'gps',
  }),
  actions: {
    async start() {
      const geoLocationPermissionStatus = await checkGeolocationPermission()
      if (geoLocationPermissionStatus.state !== 'denied') {
        const { coords } = await getCurrentPosition()
        this.coordinates = coords
      }
      geoLocationPermissionStatus.onchange = async () => {
        const { coords } = await getCurrentPosition()
        this.coordinates = coords
      }
    },
  },
  getters: {
    geolocation(state): string | undefined {
      if (state.coordinates) {
        return `geo:${state.coordinates.latitude},${state.coordinates.longitude};cgen=${this.cgen};u=${this.u}`
      }
    },
    // @deprecated
    point(state) {
      if (state.coordinates) {
        return {
          content: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [
                state.coordinates.latitude,
                state.coordinates.longitude,
              ],
            },
          },
          mediaType: 'application/vnd.geo+json',
        }
      }
    },
  },
})
