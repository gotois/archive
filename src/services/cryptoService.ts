import { uid } from 'quasar'
import tweetnacl from 'tweetnacl'
import { PublicKey } from '@solana/web3.js'
import { encodeMessage, decode, encode } from '../helpers/cryptoHelper'
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// @ts-ignore
import * as vc from '@digitalbazaar/vc'
// @ts-ignore
import cred from 'credentials-context'
// @ts-ignore
import ed25519Ctx from 'ed25519-signature-2020-context'
// @ts-ignore
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020'
// @ts-ignore
import { JsonLdDocumentLoader } from 'jsonld-document-loader'
import { Credential, ProofCredential, Presentation } from '../types/models'

export interface Suite {
  verifier: unknown
  verificationMethod: string
  useNativeCanonize: unknown
  type: string
  signer: unknown
  requiredKeyType: string
  proof: unknown
  key: unknown
  contextUrl: string
  canonizeOptions: unknown
  LDKeyClass: unknown
}

function createDocumentLoader() {
  const jdl = new JsonLdDocumentLoader()
  jdl.addStatic(ed25519Ctx.CONTEXT_URL, ed25519Ctx.CONTEXT)
  jdl.addStatic(Ed25519Signature2020.CONTEXT_URL, Ed25519Signature2020.CONTEXT)
  jdl.addStatic(
    cred.CREDENTIALS_CONTEXT_V1_URL,
    cred.contexts.get(cred.constants.CREDENTIALS_CONTEXT_V1_URL),
  )

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return jdl.build()
}

const documentLoader = createDocumentLoader()

export function issue({
  credential,
  suite,
}: {
  credential: Credential
  suite: Suite
}) {
  return vc.issue({
    credential,
    suite,
    documentLoader: documentLoader,
  }) as Promise<ProofCredential>
}

export function signPresentation({
  presentation,
  suite,
  challenge = uid(),
}: {
  presentation: Presentation
  suite: Suite
  challenge?: string
}) {
  return vc.signPresentation({
    presentation,
    suite,
    challenge,
    documentLoader: documentLoader,
  }) as Promise<Presentation>
}

export function verifySign(
  message: string,
  signature: string,
  publicKey: PublicKey,
) {
  try {
    return tweetnacl.sign.detached.verify(
      encodeMessage(message),
      decode(signature),
      decode(publicKey.toBase58()),
    )
  } catch (e) {
    console.error(e)
    return false
  }
}

export function signMessageUseSecretKey(
  message: string,
  secretKey: Uint8Array,
) {
  const fromWallet = tweetnacl.sign.keyPair.fromSecretKey(secretKey)
  const signature = tweetnacl.sign.detached(
    encodeMessage(message),
    fromWallet.secretKey,
  )
  return {
    signature: encode(signature),
    publicKey: fromWallet.publicKey,
  }
}
