import { Platform } from 'quasar'
import { open } from '../helpers/urlHelper'
import { Place } from '../types/models'

export function openMap(place: Place) {
  const query = place.name ?? ''
  const lat = place.geo.latitude
  const lng = place.geo.longitude
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
