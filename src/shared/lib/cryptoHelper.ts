// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as base68 from 'base58-universal'

export function encodeMessage(message: string) {
  return new TextEncoder().encode(JSON.stringify(message))
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
export const decode: (str: string) => Uint8Array = base68.decode

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
export const encode: (x: Uint8Array) => string = base68.encode

export async function getHash(str: string, algo = 'SHA-256') {
  const strBuf = new TextEncoder().encode(str)
  const hash = await crypto.subtle.digest(algo, strBuf)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
