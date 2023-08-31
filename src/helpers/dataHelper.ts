export function getMimeType(str: string) {
  return str.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0]
}

export function parseJwt(token: string): unknown {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return undefined
  }
}

export function validTelString(tel: string) {
  if (!tel.startsWith('+')) {
    return false
  }
  return true
}

export function validUrlString(url: string) {
  if (!url || !url.length) {
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
  if (Reflect.has(URL, 'canParse') && !URL.canParse(url)) {
    return false
  }
  return true
}
