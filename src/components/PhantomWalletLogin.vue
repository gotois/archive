<template>
  <QBtn
    v-if="hasPhantomWallet"
    :color="color"
    :text-color="textColor"
    :icon="icon"
    :class="contentClass"
    :label="label"
    @click="tryToLoginPhantomWallet"
  />
  <template v-else>
    <QBtn
      size="md"
      class="q-pl-md q-pr-md q-ml-auto q-mr-auto q-mt-none"
      :class="contentClass"
      :label="label"
      :dense="$q.platform.is.desktop"
      :color="color"
      :text-color="textColor"
      square
      :icon="icon"
      @click="showDialog = true"
    >
      <QTooltip>
        {{ $t('components.phantomWallet.open') }}
      </QTooltip>
    </QBtn>
    <QDialog v-model="showDialog" square persistent>
      <QCard class="q-pa-md">
        <QForm v-if="!hasPhantomWallet" greedy @submit="onWalletComplete">
          <QInput
            v-model.trim="walletPrivateKey"
            :label="$t('components.phantomWallet.label')"
            :type="isPwd ? 'password' : 'text'"
            :hint="$t('components.phantomWallet.hint')"
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
              <QBtn icon="info" flat no-wrap round class="no-padding">
                <QTooltip anchor="center left" self="center middle">
                  {{ $t('components.phantomWallet.info') }}
                </QTooltip>
              </QBtn>
            </template>
          </QInput>
          <QSelect
            v-model="solanaClusterApiURL"
            :options="solanaClusters"
            :prefix="prefix"
            :label="'Solana Cluster'"
            :hide-bottom-space="!$q.platform.is.desktop"
            :behavior="$q.platform.is.ios ? 'dialog' : 'menu'"
            color="secondary"
            name="contractType"
            spellcheck="false"
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
                ? $t('components.phantomWallet.skip')
                : $t('components.phantomWallet.ok')
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
} from 'quasar'
import { useI18n } from 'vue-i18n'
import { clusterApiUrl } from '@solana/web3.js'
import useWalletStore from 'stores/wallet'
import { getSolana } from '../services/phantomWalletService'
import { WalletType } from '../types/models'
import { open } from '../helpers/urlHelper'

const emit = defineEmits(['skip', 'complete', 'error'])
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
  color: {
    type: String as PropType<string>,
    required: false,
    default: 'secondary',
  },
  textColor: {
    type: String as PropType<string>,
    required: false,
    default: 'white',
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

function createSignInData() {
  const now: Date = new Date()
  const uri = window.location.href
  const currentUrl = new URL(uri)
  const domain = currentUrl.host
  const currentDateTime = now.toISOString()

  return {
    domain,
    statement:
      'Clicking Sign or Approve only means you have proved this wallet is owned by you. This request will not trigger any blockchain transaction or cost any gas fee.',
    version: '1',
    nonce: 'oBbLoEldZs',
    chainId: 'mainnet',
    issuedAt: currentDateTime,
    resources: ['https://archive.gotointeractive.com'],
  }
}

async function tryToLoginPhantomWallet() {
  const solana = getSolana()
  if (!solana) {
    return open('https://phantom.app')
  }
  const signInDate = createSignInData()
  let publicKey = ''
  /* eslint-disable */
  if (solana.isConnected) {
    publicKey = solana.publicKey.toBase58()
    /* eslint-enable */
  } else {
    try {
      /* eslint-disable */
      const loginData = await solana.signIn(signInDate)
      publicKey = loginData.address.toBase58()
      /* eslint-enable */
    } catch (error) {
      console.error(error)
      emit('error', error)
      return
    }
  }
  try {
    await walletStore.setKeypare({
      publicKey,
      type: WalletType.Phantom,
    })
    closeDialog()
    emit('complete')
  } catch (error) {
    console.error(error)
    emit('error', error)
  }
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
    emit('error', error)
  } finally {
    $q.loading.hide()
  }
}
</script>
