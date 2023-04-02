import { Platform } from 'quasar'
import { FormatContractObject } from '../types/models'

export async function showPDFInPopup(image: FormatContractObject) {
  const { contentUrl } = image
  const res = await fetch(contentUrl)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const featues = Platform.is.desktop ? 'popup=1' : ''
  window.open(url, '_pdf', featues)
  URL.revokeObjectURL(url)
}
