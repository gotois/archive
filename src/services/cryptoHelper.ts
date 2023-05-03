import { uid } from 'quasar'
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import { keys } from '../services/databaseHelper'
import { Credential, ProofCredential } from '../types/models'
import { KeysTable } from '../types/models'

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
  credential: Credential
  verificationMethod?: string
}): Promise<ProofCredential> {
  const keyPair = await keys.last()
  const suite = new Ed25519Signature2020({
    key: keyPair,
  })
  suite.verificationMethod = verificationMethod

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return vc.signPresentation({
    presentation,
    suite,
    challenge,
    documentLoader: documentLoader,
  })
}

export async function generateKeyPair(): Promise<KeysTable> {
  const newKeyPair = await Ed25519VerificationKey2020.generate({})
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  await keys.add(newKeyPair)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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

export async function exportKeyPair() {
  const keyPair = await keys.last()
  const exportKeys = await keyPair.export({
    publicKey: true,
    privateKey: true,
  })
  const jsonKeys = JSON.stringify(exportKeys, null, 2)
  return jsonKeys
}
