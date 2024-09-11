import { openURL, Platform } from 'quasar'

export function validUrlString(url: string) {
  if (!url || url.length < 10) {
    return false
  }
  if (
    !(
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('did:')
    )
  ) {
    return false
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return !(Reflect.has(URL, 'canParse') && !URL.canParse(url))
}

export function open(url: string) {
  if (Platform.is.desktop) {
    openURL(url, undefined, {
      noopener: true,
      noreferrer: true,
      toolbar: false,
      menubar: false,
      popup: 1,
    })
  } else {
    window.location.href = url
  }
}
