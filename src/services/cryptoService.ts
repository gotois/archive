import tweetnacl from 'tweetnacl'
import { PublicKey } from '@solana/web3.js'
import { encodeMessage, decode, encode } from '../helpers/cryptoHelper'

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
