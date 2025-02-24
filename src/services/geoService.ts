import { BottomSheet } from 'quasar'
import { open } from '../helpers/urlHelper'
import type { Place } from '../types/models'

export function checkGeolocationPermission() {
  if (!navigator.permissions) {
    return Promise.reject('Текущий браузер не поддерживает API разрешений')
  }
  return navigator.permissions.query({ name: 'geolocation' })
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  if (!navigator.geolocation) {
    return Promise.reject('navigator.geolocation error')
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position)
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 3600,
      },
    )
  })
}

export function openMap(place: Place) {
  const query = place.name ?? ''
  const lat = place.geo.latitude
  const lng = place.geo.longitude
  BottomSheet.create({
    grid: true,
    actions: [
      { id: 'google', label: 'Google Maps', icon: 'map', color: 'primary' },
      { id: 'yandex', label: 'Yandex Maps', icon: 'map', color: 'secondary' },
      { id: 'apple', label: 'Apple Maps', icon: 'map', color: 'yellow' },
    ],
  }).onOk((action: { id: string }) => {
    const zoom = 12
    switch (action.id) {
      case 'apple':
        return open(
          `https://maps.apple.com/?q=${query}&sll=${lng + ',' + lat}&z=${zoom}&t=s`,
        )
      case 'google':
        return open(
          `https://www.google.com/maps/search/${query}/@${
            lng + ', ' + lat
          },${zoom}z`,
        )
      case 'yandex':
        return open(`https://maps.yandex.ru/?ll=${lat + ',' + lng}&z=${zoom}`)
      default:
        break
    }
  })
}
