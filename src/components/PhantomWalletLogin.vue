<template>
  <QBtn
    v-if="hasPhantomWallet"
    color="accent"
    :icon="icon"
    :class="contentClass"
    :label="label"
    @click="tryToLoginPhantomWallet"
  />
  <template v-else>
    <QBtn
      size="md"
      class="q-pl-md q-pr-md q-ml-auto q-mr-auto q-mt-none q-mb-md"
      :class="contentClass"
      :label="label"
      :dense="$q.platform.is.desktop"
      color="accent"
      square
      :icon="icon"
      @click="showDialog = true"
    >
      <QTooltip>
        {{ $t('wallet.open') }}
      </QTooltip>
    </QBtn>
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
            @new-value="onNewSolanaClusterApiUrl"
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
import { ref, computed, PropType } from 'vue'
import {
  VueClassProp,
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
  QTooltip,
  QItemLabel,
  openURL,
} from 'quasar'
import { useI18n } from 'vue-i18n'
import { clusterApiUrl } from '@solana/web3.js'
import useWalletStore from 'stores/wallet'
import { getSolana } from '../services/phantomWalletService'
import { WalletType } from '../types/models'

const emit = defineEmits(['skip', 'complete'])
defineProps({
  icon: {
    type: undefined as PropType<string | undefined>,
    default: undefined,
  },
  label: {
    type: String as PropType<string>,
    required: false,
    default: '',
  },
  contentClass: {
    type: undefined as PropType<VueClassProp>,
    required: false,
    default: undefined,
  },
})

const $t = useI18n().t
const $q = useQuasar()
const walletStore = useWalletStore()

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

function onNewSolanaClusterApiUrl(
  value: string,
  done: (value: unknown, format: string) => void,
) {
  solanaClusters.value.unshift({
    label: value,
    description: 'Usernet',
  })
  done(
    {
      label: value,
      description: 'user-mode',
    },
    'add-unique',
  )
}

function setSolanaClusterApiUrl(value: { description: string; label: string }) {
  solanaClusterApiURL.value = value.label
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
  let publicKey = ''
  /* eslint-disable */
  if (solana.isConnected) {
    publicKey = solana.publicKey.toBase58()
    /* eslint-enable */
  } else {
    try {
      /* eslint-disable */
      const result = await solana.connect({ onlyIfTrusted: false })
      publicKey = result.publicKey.toBase58()
      /* eslint-enable */
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: error.message as string,
      })
      return
    }
  }
  await walletStore.setKeypare({
    publicKey,
    type: WalletType.Phantom,
  })
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
