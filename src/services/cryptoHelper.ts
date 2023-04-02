import { uid, LocalStorage } from 'quasar'
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
// @ts-ignore
import cred from 'credentials-context'
// @ts-ignore
import ed25519Ctx from 'ed25519-signature-2020-context'
import {
  Ed25519Signature2020,
  // @ts-ignore
} from '@digitalbazaar/ed25519-signature-2020'
// @ts-ignore
import { JsonLdDocumentLoader } from 'jsonld-document-loader'
import { Credential, ProofCredential } from '../types/models'

const jdl = new JsonLdDocumentLoader()
jdl.addStatic(ed25519Ctx.CONTEXT_URL, ed25519Ctx.CONTEXT)
jdl.addStatic(Ed25519Signature2020.CONTEXT_URL, Ed25519Signature2020.CONTEXT)
jdl.addStatic(
  cred.CREDENTIALS_CONTEXT_V1_URL,
  cred.contexts.get(cred.constants.CREDENTIALS_CONTEXT_V1_URL),
)

const documentLoader = jdl.build()

export async function sign({
  credential,
  verificationMethod = 'https://gotointeractive.com',
}: {
  credential: Credential<unknown>
  verificationMethod?: string
}): Promise<ProofCredential<unknown>> {
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
    documentLoader: documentLoader,
  })
}

export function createAndSignPresentation({
  issue, // aka signedVC
  suite,
  challenge = uid(),
}: {
  issue: unknown
  suite: unknown
  challenge: string
}) {
  const presentation = vc.createPresentation({
    verifiableCredential: issue,
  })
  return vc.signPresentation({
    presentation,
    suite,
    challenge,
    documentLoader: documentLoader,
  })
}

export async function getAndSaveKeyPair() {
  if (LocalStorage.has('publicKey') && LocalStorage.has('privateKey')) {
    return Ed25519VerificationKey2020.from({
      ...JSON.parse(LocalStorage.getItem('publicKey')),
      ...JSON.parse(LocalStorage.getItem('privateKey')),
    })
  }

  const newKeyPair = await Ed25519VerificationKey2020.generate()
  const publicKey = await newKeyPair.export({
    publicKey: true,
  })
  LocalStorage.set('publicKey', JSON.stringify(publicKey))
  const privateKey = await newKeyPair.export({
    privateKey: true,
  })
  LocalStorage.set('privateKey', JSON.stringify(privateKey))

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
