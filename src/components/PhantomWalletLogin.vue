<template>
  <QBtn
    v-if="hasPhantomWallet"
    color="accent"
    icon="wallet"
    :label="$t('tutorial.wallet.ok')"
    @click="tryToLoginPhantomWallet"
  />
  <template v-else>
    <QBtn
      size="md"
      class="q-ml-auto q-mr-auto q-mt-none full-width q-mb-md"
      :class="{
        'full-width': !$q.platform.is.desktop,
      }"
      round
      :dense="$q.platform.is.desktop"
      color="accent"
      square
      :label="$t('wallet.open')"
      icon="wallet"
      @click="showDialog = true"
    />
    <QDialog v-model="showDialog" square persistent>
      <QCard flat class="q-pa-md">
        <QForm v-if="!hasPhantomWallet" greedy @submit="onWalletComplete">
          <QInput
            v-model.trim="walletPrivateKey"
            :label="$t('wallet.label')"
            :type="isPwd ? 'password' : 'text'"
            :hint="$t('wallet.hint')"
            :maxlength="88"
            :hide-bottom-space="!$q.platform.is.desktop"
            color="secondary"
            name="wallet"
            autocomplete="off"
            autofocus
            outlined
          >
            <template #prepend>
              <QIcon name="key" />
            </template>
            <template #append>
              <QIcon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer q-mr-md"
                @click="isPwd = !isPwd"
              />
            </template>
          </QInput>
          <QSelect
            v-model="solanaClusterApiURL"
            :options="solanaClusters"
            :prefix="prefix"
            :label="'Solana Cluster'"
            :hide-bottom-space="!$q.platform.is.desktop"
            :behavior="$q.platform.is.ios ? 'dialog' : 'menu'"
            new-value-mode="add-unique"
            name="contractType"
            spellcheck="false"
            color="secondary"
            options-selected-class="text-secondary"
            class="q-mt-md q-mb-md"
            use-input
            hide-dropdown-icon
            hide-selected
            fill-input
            map-options
            outlined
            square
            @update:model-value="setSolanaClusterApiUrl"
            @new-value="setSolanaClusterApiUrl"
          >
            <template #prepend>
              <QIcon name="web" />
            </template>
            <template #option="{ itemProps, opt }">
              <QItem v-bind="itemProps">
                <QItemSection>
                  <QItemLabel>{{ opt.label }}</QItemLabel>
                  <QItemLabel caption>{{ opt.description }}</QItemLabel>
                </QItemSection>
              </QItem>
            </template>
          </QSelect>
          <QBtn
            :color="
              walletPrivateKey.length === 0 || solanaClusterApiURL.length === 0
                ? 'secondary'
                : 'accent'
            "
            :label="
              walletPrivateKey.length === 0 || solanaClusterApiURL.length === 0
                ? $t('tutorial.wallet.skip')
                : $t('tutorial.wallet.ok')
            "
            :class="{
              'full-width': !$q.platform.is.desktop,
            }"
            @click="
              walletPrivateKey.length === 0 || solanaClusterApiURL.length === 0
                ? $emit('skip')
                : onWalletComplete()
            "
          />
        </QForm>
      </QCard>
    </QDialog>
  </template>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue'
import {
  useQuasar,
  QBtn,
  QForm,
  QSelect,
  QCard,
  QInput,
  QIcon,
  QDialog,
  QItem,
  QItemSection,
  QItemLabel,
  openURL,
} from 'quasar'
import { useI18n } from 'vue-i18n'
import { clusterApiUrl } from '@solana/web3.js'
import useWalletStore from 'stores/wallet'
import { getSolana } from '../services/phantomWalletService'
import { WalletType } from '../types/models'

const emit = defineEmits(['skip', 'complete'])

const $t = useI18n().t
const walletStore = useWalletStore()
const $q = useQuasar()

const hasPhantomWallet = computed(() => Reflect.has(window, 'phantom'))

const showDialog = ref(false)
const prefix = ref('https://')
const walletPrivateKey = ref('')
const solanaClusters = ref(
  [
    {
      label: clusterApiUrl('mainnet-beta'),
      description: 'Mainnet',
    },
    {
      label: clusterApiUrl('devnet'),
      description: 'Devnet',
    },
    {
      label: clusterApiUrl('testnet'),
      description: 'Testnet',
    },
  ].map((scope) => ({
    ...scope,
    label: scope.label.replace(prefix.value, '').replace(/\/$/, ''),
  })),
)
const solanaClusterApiURL = ref(solanaClusters.value[0].label)
const walletPublicKey = ref('')
const isPwd = ref(true)

function setSolanaClusterApiUrl(value: string) {
  solanaClusterApiURL.value = value
}

function closeDialog() {
  showDialog.value = false
}

async function tryToLoginPhantomWallet() {
  const solana = getSolana()
  if (!solana) {
    return openURL('https://phantom.app', undefined, {
      noopener: true,
      noreferrer: true,
    })
  }
  /* eslint-disable */
  if (solana.isConnected) {
    await walletStore.setKeypare({
      publicKey: solana.publicKey.toBase58(),
      type: WalletType.Phantom,
    })
  } else {
    const { publicKey } = await solana.connect({ onlyIfTrusted: false })
    await walletStore.setKeypare({
      publicKey: publicKey.toBase58(),
      type: WalletType.Phantom,
    })
  }
  /* eslint-enable */
  closeDialog()
  emit('complete')
}

async function onWalletComplete() {
  $q.loading.show()
  try {
    await walletStore.setKeypare({
      privateKey: walletPrivateKey.value,
      publicKey: walletPublicKey.value,
      type: WalletType.Secret,
      clusterApiUrl: prefix.value + solanaClusterApiURL.value,
    })
    closeDialog()
    emit('complete')
  } catch (error) {
    console.error(error)
    $q.notify({
      color: 'negative',
      message: $t('wallet.fail'),
    })
  } finally {
    $q.loading.hide()
  }
}
</script>
