import { computed } from 'vue'
import { Platform } from 'quasar'
import { host } from '../../twa-manifest.json'

export const isTWA = computed(() => {
  return document.referrer.includes('android-app://') && Platform.is.android
})

export const isTMA = computed(() => {
  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  return Boolean(window?.Telegram) || Boolean(window?.TelegramWebviewProxy)
  /* eslint-enable */
})

export const isPWA = computed(() => {
  return document.location.host === host
})
