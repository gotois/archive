import { PublicKey } from '@solana/web3.js'
import { encodeMessage, encode } from '@/shared/lib/cryptoHelper'

export function getSolana() {
  return globalThis.phantom?.solana
}

export async function signMessageUsePhantom(message: string) {
  const solana = getSolana()
  if (!solana) {
    throw new Error('Solana Phantom Wallet not found')
  }
  if (!solana.isConnected) {
    await solana.connect({ onlyIfTrusted: false })
  }
  const signed: { signature: Uint8Array; publicKey: PublicKey } =
    await solana.signMessage(encodeMessage(message), 'utf8')
  return {
    signature: encode(signed.signature),
    publicKey: signed.publicKey.toBase58(),
  }
}
