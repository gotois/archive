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
          <QInput
            v-if="!hasPhantomWallet"
            v-model.trim="walletPrivateKey"
            :label="$t('wallet.label')"
            :type="isPwd ? 'password' : 'text'"
            :hint="$t('wallet.hint')"
            :maxlength="88"
            name="wallet"
            autocomplete="off"
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
          <QStepperNavigation>
            <QBtn
              v-if="hasPhantomWallet"
              color="accent"
              icon="wallet"
              :label="$t('tutorial.wallet.ok')"
              @click="tryToLoginPhantomWallet"
            />
            <template v-else>
              <QSelect
                v-model="solanaClusterApiURL"
                :options="solanaClusters"
                :prefix="prefix"
                label="Solana Cluster"
                popup-content-class="q-pt-sm"
                new-value-mode="add-unique"
                input-debounce="50"
                name="contractType"
                autocomplete="on"
                spellcheck="false"
                color="secondary"
                :hide-bottom-space="!$q.platform.is.desktop"
                use-input
                hide-selected
                fill-input
                rounded
                outlined
                square
                @update:model-value="setSolanaClusterApiUrl"
                @new-value="setSolanaClusterApiUrl"
              >
                <template #prepend>
                  <QIcon name="web" />
                </template>
              </QSelect>
              <QBtn
                :disable="
                  walletPrivateKey.length === 0 ||
                  solanaClusterApiURL.length === 0
                "
                color="accent"
                :label="$t('tutorial.wallet.ok')"
                class="q-mt-md"
                :class="{
                  'full-width': !$q.platform.is.desktop,
                }"
                @click="onWalletComplete"
              />
            </template>
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
              <QBtn
                color="accent"
                label="Сгенерировать ключ"
                :class="{
                  'full-width': !$q.platform.is.desktop,
                }"
                @click="onGenerateKeyPair"
              >
                <QTooltip>Сгенерировать новый ключ</QTooltip>
              </QBtn>
              <QFile
                v-model="keyPairFile"
                color="accent"
                filled
                accept=".json"
                label="Импортировать файл ключа"
                :class="{
                  'full-width': !$q.platform.is.desktop,
                }"
                @update:model-value="onLoadKeyPairFile"
              >
                <template #prepend>
                  <QIcon name="cloud_upload" @click.stop.prevent />
                </template>
                <QTooltip>Импортировать существующий ключ</QTooltip>
              </QFile>
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
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
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
  QFile,
  QSpace,
  QStep,
  QStepper,
  QStepperNavigation,
  QTooltip,
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
const solanaClusterApiURL = ref('')
const solanaClusters = ref(
  [
    clusterApiUrl('devnet'),
    clusterApiUrl('testnet'),
    clusterApiUrl('mainnet-beta'),
  ].map((url) => {
    return url.replace(prefix.value, '').replace(/\/$/, '')
  }),
)
const walletPublicKey = ref('')
const did = ref('')
const keyPairFile = ref<File>(null)
const walletType = ref<WalletType>(WalletType.Unknown)
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
        'title': `Добро пожаловать в сервис "${pkg.productName}"`,
        'og:title': `Добро пожаловать в сервис "${pkg.productName}"`,
      })
      break
    }
    case STEP.INFO: {
      useMeta({
        'title': 'Как работает наш сервис',
        'og:title': 'Как работает наш сервис',
      })
      break
    }
    case STEP.AGREEMENT: {
      useMeta({
        'title': 'Пользовательское соглашение',
        'og:title': 'Пользовательское соглашение',
      })
      break
    }
    case STEP.FINAL: {
      useMeta({
        'title': 'Договор на использование',
        'og:title': 'Договор на использование',
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
    const confirmMessage =
      'Ваши договоры не будут сохраняться на сервере SOLiD. Вы не сможете создавать токены ваших документов. Продолжить?'
    const dialog = $q.dialog({
      message: confirmMessage,
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
      message: 'Произошла ошибка входа через OIDC',
    })
  } finally {
    $q.loading.hide()
  }
}

function setSolanaClusterApiUrl(value: string) {
  solanaClusterApiURL.value = value
}

async function onWalletComplete() {
  $q.loading.show()
  try {
    await walletStore.setKeypare({
      privateKey: walletPrivateKey.value,
      publicKey: walletPublicKey.value,
      type: walletType.value,
      clusterApiUrl: prefix.value + solanaClusterApiURL.value,
    })
    stepper.value.next()
  } catch (error) {
    console.error(error)
    $q.notify({
      color: 'negative',
      message: 'Произошла ошибка привязки крипто кошелька',
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

function onLoadKeyPairFile(file: File) {
  const reader = new FileReader()
  reader.addEventListener(
    'load',
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async () => {
      try {
        const key = JSON.parse(reader.result as string) as DIDTable
        await keyPair.setKeyPair({
          id: key.id,
          controller: key.controller,
          type: key.type,
          publicKeyMultibase: key.publicKeyMultibase,
          privateKeyMultibase: key.privateKeyMultibase,
        })
        did.value = key.id
      } catch (error) {
        console.error(error)
        $q.notify({
          type: 'negative',
          message: 'Произошла ошибка чтения файла',
        })
      }
    },
    false,
  )
  reader.readAsText(file)
}

// example: did:gic:<SolanaPubKey>
function getResolver() {
  return `did:gic:${walletStore.publicKey.toString()}`
}

async function onGenerateKeyPair() {
  const resolver = getResolver()
  const key = await keyPair.generateNewKeyPair(resolver)
  await keyPair.setKeyPair(key)
  did.value = key.id
}

function exportKeyPair() {
  const dialog = $q.dialog({
    message: 'Вы хотите сохранить файл ключа локально?',
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
          message: 'Ключи сгенерированы и хранятся в памяти Вашего устройства.',
        })
      } else {
        $q.notify({
          type: 'warning',
          message: 'Ваш ключ не удалось сохранить локально на устройстве.',
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
      instrument_name: 'Пользовательское соглашение',
      instrument_description: `${pkg.productName}: ${pkg.description} v.${pkg.version}`,
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
      message: 'Что-то пошло не так: ' + String(error.message),
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
