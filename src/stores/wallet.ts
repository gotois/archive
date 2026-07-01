import { defineStore } from 'pinia'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import useAuthStore from 'stores/auth'
import useProfileStore from 'stores/profile'
import { keys } from '../services/databaseService'
import { decode } from '../helpers/cryptoHelper'
import { WalletType } from '../types/models'

interface Store {
  type: WalletType
  publicKey: PublicKey | null
}

const solanaKeys = await keys.last()

function getMultibase(publicKey: PublicKey | null) {
  return publicKey?.toBase58() ?? ''
}

export default defineStore('wallet', {
  state: (): Store => ({
    type: solanaKeys?.type ?? WalletType.Unknown,
    publicKey: solanaKeys?.publicKey,
  }),
  actions: {
    async setKeypare({
      privateKey,
      publicKey,
      type,
      clusterApiUrl,
    }: {
      privateKey?: string
      publicKey?: string
      type: WalletType
      clusterApiUrl?: string
    }) {
      switch (type) {
        case WalletType.Phantom: {
          this.type = type
          this.publicKey = new PublicKey(publicKey)
          await keys.add({
            type: this.type,
            privateKey: null,
            publicKey: getMultibase(this.publicKey),
            clusterApiUrl: null,
          })
          break
        }
        case WalletType.Secret: {
          this.type = type
          const key = decode(privateKey)
          const keypair = Keypair.fromSecretKey(key)
          this.publicKey = keypair.publicKey
          const connection = new Connection(clusterApiUrl, {
            commitment: 'confirmed',
            confirmTransactionInitialTimeout: 60000,
          })
          const getBalance = await connection.getBalance(keypair.publicKey)
          if (getBalance === 0) {
            throw new Error('Cannot connect unbalanced wallet')
          }
          await keys.add({
            type: this.type,
            privateKey: keypair.secretKey,
            publicKey: getMultibase(this.publicKey),
            clusterApiUrl: clusterApiUrl,
          })
          break
        }
        default: {
          this.type = WalletType.Unknown
          break
        }
      }
    },
  },
  getters: {
    getPublicKey(state) {
      return state.publicKey
    },
    getMultibase(state) {
      return getMultibase(state.publicKey)
    },
    getWalletLD(state) {
      const authStore = useAuthStore()
      const profileStore = useProfileStore()
      const multibase = getMultibase(state.publicKey)

      return {
        '@context': ['https://w3id.org/wallet/v1'],
        'id': authStore.webId ?? profileStore.email,
        'type': 'SolanaAddress',
        'multibase': multibase,
        'name': String(state.type),
        'correlation': [authStore.webId, profileStore.email],
      }
    },
  },
})
