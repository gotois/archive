import * as openpgp from 'openpgp'
import jsigs from 'jsonld-signatures'

const { Ed25519Signature2018 } = jsigs.suites
const { AuthenticationProofPurpose } = jsigs.purposes

export async function getHash(str: string, algo = 'SHA-256') {
  const strBuf = new TextEncoder().encode(str)
  const hash = await crypto.subtle.digest(algo, strBuf)
  // here hash is an arrayBuffer,
  // so we'll convert it to its hex version
  let result = ''
  const view = new DataView(hash)
  for (let i = 0; i < hash.byteLength; i += 4) {
    result += ('00000000' + view.getUint32(i).toString(16)).slice(-8)
  }
  return result
}

/**
 * Create the JSON-LD document that should be signed
 *
 * @param {object} document - jsonld document
 * @param {object} key - controller
 * @param {string} verificationMethod - verification
 * @returns {Promise<object>}
 */
export async function signDocument(document, key, verificationMethod) {
  const signed = await jsigs.sign(document, {
    suite: new Ed25519Signature2018({
      verificationMethod,
      key,
    }),
    purpose: new AuthenticationProofPurpose({
      challenge: 'abc',
      domain: 'example.com',
    }),
  })
  return signed
}

export const openpgpEncrypt = async (buffer, passwords) => {
  if (Buffer.byteLength(buffer) === 0) {
    throw new Error('Empty buffer')
  }
  const encrypted = await openpgp.encrypt({
    message: openpgp.message.fromBinary(buffer),
    passwords,
    compression: openpgp.enums.compression.zlib,
  })
  return encrypted
}

export const openpgpDecrypt = async (buffer, passwords) => {
  const utf8Content = buffer.toString('utf8')
  if (utf8Content.startsWith('-----BEGIN PGP MESSAGE-----')) {
    const rawDecrypt = await openpgp.decrypt({
      message: await openpgp.message.readArmored(utf8Content),
      passwords,
      format: 'binary',
    })
    return rawDecrypt.data
  }
  return utf8Content
}
