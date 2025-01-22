import { MimeType } from './mimeTypes'

export interface JWTPayload {
  exp: number
  iat: number
  name: string
  email: string
  aud?: string
  azp?: string
  email_verified?: boolean
  family_name?: string
  given_name?: string
  iss?: string
  jti?: string
  nbf?: number
  picture?: string
  sub?: string
}

export function getFileExt(mimeType: MimeType) {
  return mimeType.split('/')[1]
}

export function parseJwt(token: string) {
  return JSON.parse(atob(token.split('.')[1])) as JWTPayload
}
