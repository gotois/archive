import { SessionStorage } from 'quasar'
import { defineStore } from 'pinia'
import { PublicKey, Keypair } from '@solana/web3.js'
import useAuthStore from 'stores/auth'
import useProfileStore from 'stores/profile'
import { decode } from '../services/cryptoService'

interface Store {
  publicKey: PublicKey
  secretKey: Uint8Array
}

export default defineStore('wallet', {
  state: (): Store => ({
    secretKey: null,
    publicKey: SessionStorage.getItem('walletPublicKey')
      ? new PublicKey(SessionStorage.getItem('walletPublicKey'))
      : null,
  }),
  actions: {
    setPrivateKey(privateKey: string) {
      const key = decode(privateKey)
      const keypair = Keypair.fromSecretKey(key)
      this.setPublicKey(keypair.publicKey)
      this.secretKey = keypair.secretKey
    },
    setPublicKey(publicKey: PublicKey) {
      this.publicKey = publicKey
      SessionStorage.set('walletPublicKey', publicKey)
    },
  },
  getters: {
    getPublicKey(state) {
      /* eslint-disable */
      if (state.publicKey) {
        return state.publicKey
      } else if (window?.phantom?.solana?.isConnected) {
        return window.phantom.solana.publicKey
      }
      /* eslint-enable */
      return null
    },
    getMultibase(): string {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
      return this.getPublicKey?.toBase58() ?? ''
    },
    getName() {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return window?.phantom?.solana?.isPhantom
        ? 'Phantom Wallet'
        : 'Unknown Wallet'
    },
    getWalletLD(state) {
      const authStore = useAuthStore()
      const profileStore = useProfileStore()

      return {
        '@context': ['https://w3id.org/wallet/v1'],
        'id': 'did:example', // todo заменить идентификатор на адрес хранения кошелька, который выгружен, например на Solid сервере
        'type': 'SolanaAddress',
        'multibase': String(state.getMultibase),
        'name': String(state.getName),
        'correlation': [authStore.webId, profileStore.email],
      }
    },
  },
})
