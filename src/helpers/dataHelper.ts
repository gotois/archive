export function getFileExt(mimeType: string) {
  return mimeType.split('/')[1]
}

export function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1])) as {
      exp: number
      iat: number
      id: number
      name: string
      email: string
      login: string
      // todo - поддержать avatar
      // todo - поддержать telephone
      // todo - поддержать email
    }
  } catch {
    return undefined
  }
}
