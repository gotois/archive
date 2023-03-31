/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/ban-ts-comment */

// @ts-ignore
import * as vc from '@digitalbazaar/vc'
// @ts-ignore
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020'
import {
  Ed25519Signature2020,
  suiteContext,
  // @ts-ignore
} from '@digitalbazaar/ed25519-signature-2020'

export function getBaseCredential(webId: string, issuanceDate?: string) {
  return {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    'type': ['VerifiableCredential'],
    'issuer': {
      id: 'https://archive.gotointeractive.com',
    },
    'issuanceDate': issuanceDate ?? new Date().toISOString(),
    'credentialSubject': {
      id: webId,
    },
  }
}

function getDocumentLoader(url: string) {
  // hack - make sure the cryptosuite context can load too
  if (url === suiteContext.constants.CONTEXT_URL) {
    const document = suiteContext.CONTEXT
    return {
      contextUrl: null,
      documentUrl: suiteContext.constants.CONTEXT_URL,
      document,
    }
  }
  return vc.defaultDocumentLoader(url)
}

export function sign({
  credential,
  keyPair,
  verificationMethod = 'https://gotointeractive.com',
}: {
  credential: any
  keyPair: any
  verificationMethod?: string
}) {
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
  challenge = '12ec21',
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
  if (localStorage.hasOwnProperty('publicKey') && localStorage.hasOwnProperty('privateKey')) {
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
