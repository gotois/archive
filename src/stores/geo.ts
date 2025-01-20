import { defineStore } from 'pinia'
import {
  checkGeolocationPermission,
  getCurrentPosition,
} from '../services/geoService'

interface Store {
  coordinates: GeolocationCoordinates
}

export default defineStore('geo', {
  state: (): Store => ({
    coordinates: null,
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
    locationName(state) {
      if (state.coordinates) {
        // todo давать более читаемое название локации из геокоординат
        return state.coordinates.latitude + ':' + state.coordinates.longitude
      }
    },
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
