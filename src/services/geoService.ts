import { Platform } from 'quasar'
import { open } from '../helpers/urlHelper'

interface LatLng {
  lat: number
  lng: number
}

export function openMap({ lat, lng }: LatLng) {
  const query = 'Mexican+Restaurant'
  if (Platform.is.safari) {
    return open(
      `https://maps.apple.com/?q=${query}&sll=${lng + ',' + lat}&z=10&t=s`,
    )
  } else if (Platform.is.chrome) {
    return open(
      `https://www.google.com/maps/search/${query}/@${lng + ', ' + lat},12z`,
    )
  }
  // todo - yandex отображать только для русских пользователей
  return open(`https://maps.yandex.ru/?ll=${lat + ',' + lng}&z=12`)
}
