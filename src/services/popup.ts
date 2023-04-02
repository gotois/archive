import { Platform, openURL } from 'quasar'
import { FormatContractObject } from '../types/models'

export async function showPDFInPopup(image: FormatContractObject) {
  const { contentUrl } = image
  const res = await fetch(contentUrl)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  openURL(url, undefined, {
    popup: Platform.is.desktop ? 1 : null,
    menubar: false,
  })
  URL.revokeObjectURL(url)
}
