import { Platform } from 'quasar'

export const isTWA =
  document.referrer.includes('android-app://') && Platform.is.android

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export const isTMA =
  Boolean(window?.Telegram) || Boolean(window?.TelegramWebviewProxy)
/* eslint-enable */
