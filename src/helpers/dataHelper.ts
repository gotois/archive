export function getMimeType(str: string) {
  return str.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0]
}

export function getFileExt(mimeType: string) {
  return mimeType.split('/')[1]
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
