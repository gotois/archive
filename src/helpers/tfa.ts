import { Secret } from 'otpauth'
import pkg from '../../package.json'

const generateRandomString = (length: number) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let result = ''
  const randomValues = new Uint32Array(length)
  window.crypto.getRandomValues(randomValues)
  randomValues.forEach((value) => {
    result += characters.charAt(value % charactersLength)
  })
  return result
}

export function createRandomSecret() {
  return Secret.fromUTF8(generateRandomString(72))
}

export const issuer = pkg.author.name
export const productName = pkg.productName
export const digits = 6
export const period = 30
