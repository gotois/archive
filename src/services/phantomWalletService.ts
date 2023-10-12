import { PublicKey } from '@solana/web3.js'
import { encodeMessage, encode } from '../helpers/cryptoHelper'

interface PhantomSolana {
  on: (
    type: 'connect' | 'disconnect' | 'accountChanged',
    callback: (arg: never) => void,
  ) => void
}
export function getSolana() {
  /* eslint-disable */
  return globalThis?.phantom?.solana as PhantomSolana
  /* eslint-enable */
}

export async function signMessageUsePhantom(message: string) {
  /* eslint-disable */
  if (!globalThis?.phantom?.solana) {
    throw new Error('Solana Phantom Wallet not found')
  }
  if (!globalThis?.phantom?.solana?.isConnected) {
    await globalThis?.phantom?.solana.connect({ onlyIfTrusted: false })
  }
  const signed: { signature: Uint8Array; publicKey: PublicKey } =
    await globalThis?.phantom?.solana?.signMessage(
      encodeMessage(message),
      'utf8',
    )
  /* eslint-enable */
  return {
    signature: encode(signed.signature),
    publicKey: signed.publicKey.toBase58(),
  }
}
