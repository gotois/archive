<template>
  <QPage :class="$q.dark.isActive ? 'bg-transparent' : 'bg-grey-1'">
    <QScrollArea ref="scroll" visible class="absolute-full fit">
      <QStepper
        ref="stepper"
        v-model.number="step"
        color="primary"
        flat
        alternative-labels
        contracted
        :swipeable="false"
        :animated="!$q.platform.is.desktop"
        :vertical="!$q.platform.is.desktop"
        class="q-pa-md q-card--bordered q-ml-auto q-mr-auto q-mt-md q-mb-md"
        :class="{
          'no-margin': $q.platform.is.mobile,
          'no-padding': $q.platform.is.mobile,
        }"
        :style="{
          'max-width': $q.platform.is.desktop ? '720px' : 'auto',
        }"
        :transition-next="$q.platform.is.desktop ? 'slide-left' : 'slide-down'"
        @update:model-value="onStep"
      >
        <QStep
          :name="STEP.WELCOME"
          :title="$t('tutorial.welcome.title')"
          icon="create_new_folder"
          done-color="positive"
          :done="step > STEP.WELCOME"
        >
          <QIcon
            class="flex q-ml-auto q-mr-auto q-ma-md bg-white rounded-borders"
            name="img:/icons/safari-pinned-tab.svg"
            size="128px"
          />
          <p v-show="$q.platform.is.desktop" class="text-h4 text-center">
            {{ $t('tutorial.welcome.title') }}
          </p>
          <div
            class="text-body1"
            style="white-space: break-spaces"
            v-html="parse($t('tutorial.welcome.body'))"
          ></div>
          <QStepperNavigation>
            <QBtn
              color="secondary"
              :label="$t('tutorial.welcome.ok')"
              :class="{
                'full-width': !$q.platform.is.desktop,
              }"
              @click="$refs.stepper.next()"
            />
          </QStepperNavigation>
        </QStep>
        <QStep
          :name="STEP.INFO"
          :title="$t('tutorial.info.title')"
          icon="create_new_folder"
          done-color="positive"
          :done="step > STEP.INFO"
        >
          <p v-show="$q.platform.is.desktop" class="text-h4">
            {{ $t('tutorial.info.title') }}
          </p>
          <div
            class="text-body1"
            style="white-space: break-spaces"
            v-html="parse($t('tutorial.info.body'))"
          ></div>
          <QStepperNavigation>
            <QBtn
              color="secondary"
              :label="$t('tutorial.info.ok')"
              :class="{
                'full-width': !$q.platform.is.desktop,
              }"
              @click="$refs.stepper.next()"
            />
          </QStepperNavigation>
        </QStep>
        <QStep
          :name="STEP.AGREEMENT"
          :title="$t('tutorial.agreement.title')"
          :caption="$t('tutorial.agreement.caption')"
          icon="article"
          done-color="positive"
          :done="step > STEP.AGREEMENT"
        >
          <p v-show="$q.platform.is.desktop" class="text-h4">
            {{ $t('tutorial.agreement.title') }}
          </p>
          <div
            class="text-body1"
            style="white-space: break-spaces"
            v-html="parse($t('tutorial.agreement.body'))"
          >
          </div>
          <QStepperNavigation>
            <QBtn
              color="secondary"
              :label="$t('tutorial.agreement.ok')"
              :class="{
                'full-width': !$q.platform.is.desktop,
              }"
              @click="$refs.stepper.next()"
            />
          </QStepperNavigation>
        </QStep>
        <QStep
          :name="STEP.WALLET"
          :title="$t('tutorial.wallet.title')"
          :caption="$t('tutorial.wallet.caption')"
          done-color="positive"
          icon="assignment"
          class="q-pb-md"
          :done="step > STEP.WALLET"
        >
          <p v-show="$q.platform.is.desktop" class="text-h4">
            {{ $t('tutorial.wallet.title') }}
          </p>
          <div
            class="text-body1"
            style="white-space: break-spaces"
            v-html="parse($t('tutorial.wallet.body'))"
          >
          </div>
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
              rounded
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
          </QForm>
          <QStepperNavigation>
            <QBtn
              v-if="hasPhantomWallet"
              color="accent"
              icon="wallet"
              :label="$t('tutorial.wallet.ok')"
              @click="tryToLoginPhantomWallet"
            />
            <QBtn
              v-else
              :disable="
                walletPrivateKey.length === 0 ||
                solanaClusterApiURL.length === 0
              "
              color="accent"
              :label="$t('tutorial.wallet.ok')"
              :class="{
                'full-width': !$q.platform.is.desktop,
              }"
              @click="onWalletComplete"
            />
            <QBtn
              color="secondary"
              :label="$t('tutorial.wallet.skip')"
              class="q-ml-md"
              :class="{
                'full-width': !$q.platform.is.desktop,
              }"
              @click="onSkipWallet"
            />
          </QStepperNavigation>
        </QStep>
        <QStep
          :name="STEP.CRYPTO"
          :title="$t('tutorial.crypto.title')"
          :caption="$t('tutorial.crypto.caption')"
          icon="article"
          done-color="positive"
          :done="step > STEP.CRYPTO"
        >
          <p v-show="$q.platform.is.desktop" class="text-h4">
            {{ $t('tutorial.crypto.title') }}
          </p>
          <div
            class="text-body1"
            style="white-space: break-spaces"
            v-html="parse($t('tutorial.crypto.body'))"
          >
          </div>
          <QInput v-if="did" :model-value="did" readonly />
          <QStepperNavigation>
            <template v-if="!did">
              <KeypairComponent @on-key="(key: DIDTable) => (did = key.id)" />
            </template>
            <template v-else>
              <QBtn
                color="secondary"
                :label="$t('tutorial.crypto.ok')"
                :class="{
                  'full-width': !$q.platform.is.desktop,
                }"
                @click="exportKeyPair"
              />
            </template>
          </QStepperNavigation>
        </QStep>
        <QStep
          :name="STEP.OIDC"
          :title="$t('tutorial.oidc.title')"
          :caption="$t('tutorial.oidc.caption')"
          done-color="positive"
          icon="assignment"
          class="q-pb-md"
          :done="step > STEP.OIDC"
        >
          <p v-show="$q.platform.is.desktop" class="text-h4">
            {{ $t('tutorial.oidc.title') }}
          </p>
          <div
            class="text-body1"
            style="white-space: break-spaces"
            v-html="parse($t('tutorial.oidc.body'))"
          >
          </div>
          <OIDCIssuerComponent
            :label="$t('oidc.label')"
            @on-complete="onOnlineAuthorize"
          >
            <QTooltip>{{ $t('oidc.tutorialHint') }}</QTooltip>
          </OIDCIssuerComponent>
        </QStep>
        <QStep
          :name="STEP.FINAL"
          :title="$t('tutorial.data.title')"
          done-color="positive"
          icon="assignment"
          class="q-pb-md"
          :done="step > STEP.FINAL"
        >
          <p v-show="$q.platform.is.desktop" class="text-h4">
            {{ $t('tutorial.data.title') }}
          </p>
          <p class="text-body1">{{ $t('tutorial.data.body') }}</p>
          <QSpace class="q-pa-xs" />
          <QForm
            ref="nameForm"
            class="q-gutter-md q-mt-md"
            autocapitalize="off"
            autocomplete="off"
            autofocus
            greedy
            @submit="onFinish"
          >
            <QInput
              v-model.trim="consumer"
              :label="$t('consumer.type')"
              :rules="[(val) => val && val.length > 0]"
              name="consumer"
              type="text"
              autocomplete="on"
              autofocus
              :error-message="$t('consumer.rules')"
              clearable
              outlined
              no-error-icon
              @focus="(e) => e.target.scrollIntoView()"
            >
              <template #prepend>
                <QIcon name="face" />
              </template>
            </QInput>
            <QInput
              v-model.trim="email"
              :label="$t('consumer.email')"
              name="email"
              type="email"
              :rules="['email']"
              :error-message="$t('consumer.emailRules')"
              autocomplete="off"
              lazy-rules
              clearable
              no-error-icon
              outlined
            >
              <template #prepend>
                <QIcon name="email" />
              </template>
            </QInput>
            <QStepperNavigation class="q-pa-md no-margin">
              <QBtn
                color="accent"
                type="submit"
                square
                :disable="!consumerValid"
                :label="$t('tutorial.data.ok')"
                :class="{
                  'full-width': !$q.platform.is.desktop,
                }"
                :loading="$q.loading.isActive"
                icon="login"
              />
            </QStepperNavigation>
          </QForm>
        </QStep>
      </QStepper>
    </QScrollArea>
  </QPage>
</template>

<script lang="ts" setup>
import {
  computed,
  getCurrentInstance,
  defineAsyncComponent,
  onMounted,
  ref,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'
import {
  exportFile,
  openURL,
  QBtn,
  QForm,
  QIcon,
  QSelect,
  QInput,
  QPage,
  QScrollArea,
  QSpace,
  QStep,
  QStepper,
  QStepperNavigation,
  QTooltip,
  QItem,
  QItemSection,
  QItemLabel,
  useMeta,
  useQuasar,
} from 'quasar'
import { storeToRefs } from 'pinia'
import { clusterApiUrl } from '@solana/web3.js'
import useAuthStore from 'stores/auth'
import tutorialStore from 'stores/tutorial'
import useContractStore from 'stores/contract'
import useProfileStore from 'stores/profile'
import usePodStore from 'stores/pod'
import useWalletStore from 'stores/wallet'
import pkg from '../../package.json'
import { ROUTE_NAMES } from '../router/routes'
import { parse } from '../helpers/markdownHelper'
import { createContractPDF } from '../helpers/pdfHelper'
import { readFilesPromise } from '../helpers/fileHelper'
import solidAuth from '../services/authService'
import { WalletType } from '../services/cryptoService'
import { keyPair } from '../services/databaseService'
import { getSolana } from '../services/phantomWalletService'
import { DIDTable } from '../types/models'

const OIDCIssuerComponent = defineAsyncComponent(
  () => import('components/OIDCIssuerComponent.vue'),
)
const KeypairComponent = defineAsyncComponent(
  () => import('components/KeypairComponent.vue'),
)

// eslint-disable-next-line @typescript-eslint/unbound-method
const $t = getCurrentInstance().appContext.config.globalProperties.$t
const $q = useQuasar()
const router = useRouter()
const podStore = usePodStore()
const authStore = useAuthStore()
const contractStore = useContractStore()
const profileStore = useProfileStore()
const walletStore = useWalletStore()

enum STEP {
  WELCOME = 1,
  INFO = 2,
  AGREEMENT = 3,
  WALLET = 4,
  CRYPTO = 5,
  OIDC = 6,
  FINAL = 7,
}

const stepParam = 'step'

function getCurrentStep() {
  const searchParams = new URLSearchParams(window.location.search)

  if (searchParams.get(stepParam)) {
    return Number(searchParams.get(stepParam))
  }
}

const scroll = ref<InstanceType<typeof QScrollArea> | null>(null)
const stepper = ref<InstanceType<typeof QStepper> | null>(null)
const step = ref(getCurrentStep() ?? STEP.WELCOME)
const consumer = ref('')
const email = ref('')
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
const did = ref('')
const isPwd = ref(true)
const { isLoggedIn } = storeToRefs(authStore)
const hasPhantomWallet = computed(() => Reflect.has(window, 'phantom'))
const consumerValid = computed(() => {
  return Boolean(consumer.value.length && email.value.length)
})

watch(
  () => step.value,
  (value) => {
    setMeta(value)
  },
)

function setMeta(value: number) {
  switch (value) {
    case STEP.WELCOME: {
      useMeta({
        'title': $t('pages.tutorial.welcome.title'),
        'og:title': $t('pages.tutorial.welcome.title'),
      })
      break
    }
    case STEP.INFO: {
      useMeta({
        'title': $t('pages.tutorial.info.title'),
        'og:title': $t('pages.tutorial.info.title'),
      })
      break
    }
    case STEP.AGREEMENT: {
      useMeta({
        'title': $t('pages.tutorial.agreement.title'),
        'og:title': $t('pages.tutorial.agreement.title'),
      })
      break
    }
    case STEP.WALLET: {
      useMeta({
        'title': $t('pages.tutorial.wallet.title'),
        'og:title': $t('pages.tutorial.wallet.title'),
      })
      break
    }
    case STEP.CRYPTO: {
      useMeta({
        'title': $t('pages.tutorial.crypto.title'),
        'og:title': $t('pages.tutorial.crypto.title'),
      })
      break
    }
    case STEP.OIDC: {
      useMeta({
        'title': $t('pages.tutorial.oidc.title'),
        'og:title': $t('pages.tutorial.oidc.title'),
      })
      break
    }
    case STEP.FINAL: {
      useMeta({
        'title': $t('pages.tutorial.final.title'),
        'og:title': $t('pages.tutorial.final.title'),
      })
      break
    }
    default: {
      useMeta({
        'title': pkg.productName,
        'og:title': pkg.productName,
      })
      break
    }
  }
}

async function onOnlineAuthorize(oidcIssuer: string) {
  if (!oidcIssuer) {
    const dialog = $q.dialog({
      message: $t('components.oidcIssuer.authorizeDialog.message'),
      cancel: true,
      persistent: true,
    })
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    dialog.onOk(() => {
      stepper.value.next()
    })
    return
  }

  $q.loading.show()
  $q.sessionStorage.remove('connect')
  const redirectUrl =
    window.location.origin +
    window.location.pathname +
    `?${stepParam}=` +
    String(step.value)
  try {
    await solidAuth({
      redirectUrl: redirectUrl,
      oidcIssuer: oidcIssuer,
      restorePreviousSession: false,
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      color: 'negative',
      message: $t('components.oidcIssuer.authorizeDialog.fail'),
    })
  } finally {
    $q.loading.hide()
  }
}

function setSolanaClusterApiUrl(value: string) {
  solanaClusterApiURL.value = value
}

function onSkipWallet() {
  const dialog = $q.dialog({
    message: $t('wallet.skipDialog.message'),
    cancel: true,
    persistent: true,
  })
  dialog.onOk(() => {
    stepper.value.next()
  })
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
    stepper.value.next()
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
  stepper.value.next()
}

function exportKeyPair() {
  const dialog = $q.dialog({
    message: $t('components.keypair.export.dialog.message'),
    cancel: true,
    persistent: true,
  })
  dialog.onDismiss(() => {
    stepper.value.next()
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  dialog.onOk(async () => {
    const keysJSON = await keyPair.prepareKeyPair()
    if (keysJSON) {
      const status = exportFile('keys.json', keysJSON)
      if (status) {
        $q.notify({
          type: 'positive',
          message: $t('components.keypair.export.dialog.success'),
        })
      } else {
        $q.notify({
          type: 'warning',
          message: $t('components.keypair.export.dialog.fail'),
        })
      }
    }
  })
}

async function onFinish() {
  $q.loading.show()

  if (!authStore.webId) {
    authStore.webId = 'did:gic:demo'
  }

  try {
    const response = await fetch('docs/privacy.md')
    const md = await response.text()
    const html = parse(md)
    const pdfFile = await createContractPDF(html)
    const contractPDF = await readFilesPromise([pdfFile])
    const newContract = {
      agent_name: consumer.value,
      agent_email: email.value,
      participant_name: pkg.author.name,
      participant_email: pkg.author.email,
      instrument_name: $t('pages.privacy.title'),
      instrument_description: `${pkg.productName}: ${pkg.description} v${pkg.version}`,
      startTime: new Date(),
      images: contractPDF,
    }
    if (isLoggedIn.value) {
      await podStore.initPod()
    }
    await contractStore.addContract({
      contractData: newContract,
      usePod: isLoggedIn.value,
    })
    profileStore.consumerName(consumer.value)
    profileStore.consumerEmail(email.value)
    profileStore.consumerDID(did.value)
    await profileStore.setAvatar(email.value)
    tutorialStore().tutorialComplete()
    await router.push({
      name: ROUTE_NAMES.FILTER,
      query: {
        name: newContract.instrument_name,
        page: 1,
      },
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'error',
      color: 'negative',
      message: String(error.message),
      position: 'center',
      progress: false,
      timeout: 99999999999,
    })
  } finally {
    $q.loading.hide()
  }
}

async function onStep(step: number) {
  await router.push({
    query: {
      ...router.currentRoute.value.query,
      step: step,
    },
    replace: true,
  })
  scroll.value.setScrollPosition('vertical', step * 30, 100)
}

setMeta(step.value)

onMounted(() => {
  const { query } = router.currentRoute.value

  // Если пользователь отменил вход через WebId, возвращаем его на страницу подтверждения
  if (query.error === 'access_denied') {
    step.value = STEP.FINAL
  }
  if (isLoggedIn.value) {
    step.value = STEP.FINAL
  }
  if (step.value > STEP.WALLET && walletStore.getMultibase?.length === 0) {
    step.value = STEP.WALLET
  }
})
</script>
