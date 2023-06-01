import { PublicKey } from '@solana/web3.js'
/* eslint-disable */
export const provider = 'phantom' in window ? window.phantom?.solana : null
export const isPhantom = provider ? provider.isPhantom : null

if (isPhantom) {
  provider.on('connect', (publicKey: PublicKey) => {
    console.log('connect, account:', publicKey.toBase58())
  })
  provider.on('disconnect', () => {
    console.warn('disconnect')
  })
  provider.on('accountChanged', (publicKey: PublicKey | null) => {
    console.log(publicKey)
  })
}
/* eslint-enable */
