import { uid } from 'quasar'
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
// @ts-ignore
import * as base68 from 'base58-universal'
import tweetnacl from 'tweetnacl'
import { Keypair } from '@solana/web3.js'
import { Credential, ProofCredential } from '../types/models'

const jdl = new JsonLdDocumentLoader()
jdl.addStatic(ed25519Ctx.CONTEXT_URL, ed25519Ctx.CONTEXT)
jdl.addStatic(Ed25519Signature2020.CONTEXT_URL, Ed25519Signature2020.CONTEXT)
jdl.addStatic(
  cred.CREDENTIALS_CONTEXT_V1_URL,
  cred.contexts.get(cred.constants.CREDENTIALS_CONTEXT_V1_URL),
)

const documentLoader = jdl.build()

export const decode: (str: string) => Uint8Array = base68.decode

export const encode: (x: Uint8Array) => string = base68.encode

export enum WalletType {
  Phantom = 'Phantom Wallet',
  Secret = 'Unknown Wallet', // Solana base58
  Unknown = 'No Wallet',
}

export function sign({
  credential,
  suite,
}: {
  credential: Credential
  suite: Ed25519Signature2020
}): Promise<ProofCredential> {
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

function encodeMessage(message: string) {
  return new TextEncoder().encode(JSON.stringify(message))
}

export async function signMessageUsePhantom(message: string) {
  if (!globalThis?.phantom?.solana) {
    throw new Error('Solana Phantom Wallet not found')
  }
  if (!globalThis?.phantom?.solana?.isConnected) {
    await globalThis?.phantom?.solana.connect({ onlyIfTrusted: false })
  }
  const signed = await globalThis?.phantom?.solana?.signMessage(
    encodeMessage(message),
    'utf8',
  )
  const signature = encode(signed.signature as Uint8Array)
  return {
    signature,
    publicKey: signed.publicKey.toString(),
  }
}

export function signMessageUseSolana(message: string, secretKey: Uint8Array) {
  const fromWallet = Keypair.fromSecretKey(secretKey)
  const signature = tweetnacl.sign(encodeMessage(message), fromWallet.secretKey)
  return {
    signature: encode(signature),
    publicKey: fromWallet.publicKey.toString(),
  }
}

export async function getHash(str: string, algo = 'SHA-256') {
  const strBuf = new TextEncoder().encode(str)
  const hash = await crypto.subtle.digest(algo, strBuf)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
