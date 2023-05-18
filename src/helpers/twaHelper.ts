import { Platform } from 'quasar'

export const isTWA =
  document.referrer.includes('android-app://') && Platform.is.android
