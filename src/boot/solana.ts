import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { boot } from 'quasar/wrappers'
import useWalletStore from 'stores/wallet'
import { getSolana } from '../services/phantomWalletService'
import { WalletType } from '../types/models'

export default boot(() => {
  const walletStore = useWalletStore()
  const solana = getSolana()
  const $q = useQuasar()
  const $t = useI18n().t

  if (solana) {
    solana.on('connect', (/*publicKey*/) => {
      console.warn('connected to phantom account')
    })
    solana.on('disconnect', () => {
      console.warn('Phantom disconnect')
      $q.notify({
        type: 'warning',
        message: $t('wallet.disconnected'),
      })
    })
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    solana.on('accountChanged', async (publicKey: string) => {
      console.warn('accountChanged')
      await walletStore.setKeypare({
        publicKey: publicKey,
        type: WalletType.Phantom,
      })
      $q.notify({
        type: 'warning',
        message: $t('wallet.accountChanged'),
      })
    })
  }
})
