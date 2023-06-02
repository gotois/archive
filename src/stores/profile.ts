import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'
import useAuthStore from 'stores/auth'
import { getSolana } from '../services/phantomWalletService'
import { getEmailProperty } from '../helpers/schemaHelper'

interface State {
  consumer: string
  email: string
}

export default defineStore('profile', {
  state: (): State => ({
    consumer: LocalStorage.getItem('consumer') ?? '',
    email: LocalStorage.getItem('email') ?? '',
  }),
  actions: {
    consumerName(value: string) {
      const consumer = value.trim()
      LocalStorage.set('consumer', consumer)
      this.consumer = consumer
    },
    consumerEmail(value: string) {
      const email = value.trim()
      LocalStorage.set('email', email)
      this.email = email
    },
  },
  getters: {
    getWalletLD(state) {
      const authStore = useAuthStore()
      const solana = getSolana()
      if (!authStore.wallet) {
        /* eslint-disable */
        authStore.wallet = solana?.isConnected ? solana.publicKey.toBase58() : null
        /* eslint-enable */
      }

      return {
        '@context': ['https://w3id.org/wallet/v1'],
        'id': 'did:example', // todo заменить идентификатор
        // "controller": "did:example",
        'type': 'SolanaAddress',
        'multibase': authStore.wallet,
        /* eslint-disable */
        'name': solana?.isPhantom ? 'Phantom Wallet' : null,
        /* eslint-enable */
        'correlation': [authStore.webId, state.email],
      }
    },
    getPersonLD(state) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        'email': getEmailProperty(state.email),
        'name': state.consumer,
      }
    },
  },
})
