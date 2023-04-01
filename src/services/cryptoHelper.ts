/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { uid } from 'quasar'
// @ts-ignore
import * as vc from '@digitalbazaar/vc'
// @ts-ignore
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020'
import {
  Ed25519Signature2020,
  suiteContext,
  // @ts-ignore
} from '@digitalbazaar/ed25519-signature-2020'
import { Credential } from '../types/models'

function getDocumentLoader(url: string) {
  // hack - make sure the cryptosuite context can load too
  if (url === suiteContext.constants.CONTEXT_URL) {
    const document = suiteContext.CONTEXT
    return {
      documentUrl: suiteContext.constants.CONTEXT_URL,
      document,
    }
  }
  return vc.defaultDocumentLoader(url)
}

export async function sign({
  credential,
  verificationMethod = 'https://gotointeractive.com',
}: {
  credential: Credential
  verificationMethod?: string
}) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const keyPair = await getAndSaveKeyPair()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call

  const suite = new Ed25519Signature2020({
    key: keyPair,
  })
  suite.verificationMethod = verificationMethod

  return vc.issue({
    credential,
    suite,
    documentLoader: getDocumentLoader,
  })
}

export function createAndSignPresentation({
  issue, // aka signedVC
  suite,
  challenge = uid(),
}: {
  issue: any
  suite: any
  challenge: string
}) {
  const presentation = vc.createPresentation({
    verifiableCredential: issue,
  })
  return vc.signPresentation({
    presentation,
    suite,
    challenge,
    documentLoader: getDocumentLoader,
  })
}

export async function getAndSaveKeyPair() {
  if (
    // eslint-disable-next-line no-prototype-builtins
    localStorage.hasOwnProperty('publicKey') &&
    // eslint-disable-next-line no-prototype-builtins
    localStorage.hasOwnProperty('privateKey')
  ) {
    return Ed25519VerificationKey2020.from({
      ...JSON.parse(localStorage.getItem('publicKey')),
      ...JSON.parse(localStorage.getItem('privateKey')),
    })
  }

  const newKeyPair = await Ed25519VerificationKey2020.generate()
  const publicKey = await newKeyPair.export({
    publicKey: true,
  })
  localStorage.setItem('publicKey', JSON.stringify(publicKey))
  const privateKey = await newKeyPair.export({
    privateKey: true,
  })
  localStorage.setItem('privateKey', JSON.stringify(privateKey))

  return newKeyPair
}

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
