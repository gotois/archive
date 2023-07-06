import { defineStore } from 'pinia'
import { PublicKey, Keypair } from '@solana/web3.js'
import useAuthStore from 'stores/auth'
import useProfileStore from 'stores/profile'
import { decode } from '../services/cryptoService'

interface Store {
  type: WalletType
  secretKey: Uint8Array | null
  publicKey: PublicKey
}

const keyPair = await keys.last()

export default defineStore('wallet', {
  state: (): Store => ({
    type: keyPair?.type ?? WalletType.Unknown,
    secretKey: keyPair?.secretKey,
    publicKey: keyPair?.publicKey,
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
      return state.publicKey
    },
    getMultibase(state): string {
      if (state.type === WalletType.Phantom) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
        return this.getPublicKey?.toBase58() ?? ''
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return state.publicKey ?? ''
    },
    getWalletLD(state) {
      const authStore = useAuthStore()
      const profileStore = useProfileStore()

      return {
        '@context': ['https://w3id.org/wallet/v1'],
        'id': 'did:example', // todo заменить идентификатор на адрес хранения кошелька, который выгружен, например на Solid сервере
        'type': 'SolanaAddress',
        'multibase': String(state.getMultibase),
        'name': String(state.type),
        'correlation': [authStore.webId, profileStore.email],
      }
    },
  },
})
