import { Platform, openURL } from 'quasar'

export async function showPDFInPopup(contentUrl: string) {
  const res = await fetch(contentUrl)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  openURL(url, undefined, {
    popup: Platform.is.desktop ? 1 : null,
    menubar: false,
  })
  URL.revokeObjectURL(url)
}
