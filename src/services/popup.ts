import { Platform } from 'quasar'
import { FormatContractObject } from '../types/models'

function windowOpen(url: string, target: string) {
  const featues = Platform.is.desktop ? 'popup=1' : ''
  return window.open(url, target, featues)
}

export async function showPDFInPopup(image: FormatContractObject) {
  const { contentUrl } = image
  const res = await fetch(contentUrl)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  windowOpen(url, '_pdf')
  URL.revokeObjectURL(url)
}
