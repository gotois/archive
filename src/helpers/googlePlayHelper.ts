import { packageId, host } from '../../twa-manifest.json'

export const applicationURL =
  'https://play.google.com/store/apps/details?id=' + packageId

export const isProductionApp = document.location.host === host
