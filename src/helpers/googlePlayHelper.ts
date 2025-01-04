import { packageId, host } from '../../twa-manifest.json'

export const GOOGLE_PLAY_URL =
  'https://play.google.com/store/apps/details?id=' + packageId

export const isProductionApp = document.location.host === host
