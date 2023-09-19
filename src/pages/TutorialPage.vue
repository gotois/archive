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
          <QList class="q-mb-md">
            <QExpansionItem
              :label="$t('tutorial.info.title')"
              icon="create_new_folder"
              :dense="$q.platform.is.desktop"
              :dense-toggle="$q.platform.is.desktop"
            >
              <QCard>
                <QCardSection>
                  <div
                    class="text-body1"
                    style="white-space: break-spaces"
                    v-html="parse($t('tutorial.info.body'))"
                  ></div>
                </QCardSection>
              </QCard>
            </QExpansionItem>
            <QExpansionItem
              :label="$t('tutorial.agreement.title')"
              :caption="$t('tutorial.agreement.caption')"
              icon="article"
              :dense="$q.platform.is.desktop"
              :dense-toggle="$q.platform.is.desktop"
            >
              <QCard>
                <QCardSection>
                  <div
                    class="text-body1"
                    style="white-space: break-spaces"
                    v-html="parse($t('tutorial.agreement.body'))"
                  >
                  </div>
                </QCardSection>
              </QCard>
            </QExpansionItem>
            <QExpansionItem
              :label="$t('tutorial.wallet.title')"
              :caption="$t('tutorial.wallet.caption')"
              icon="wallet"
              :dense="$q.platform.is.desktop"
              :dense-toggle="$q.platform.is.desktop"
            >
              <QCard>
                <QCardSection>
                  <div
                    class="text-body1"
                    style="white-space: break-spaces"
                    v-html="parse($t('tutorial.wallet.body'))"
                  >
                  </div>
                </QCardSection>
              </QCard>
            </QExpansionItem>
          </QList>
          <QStepperNavigation>
            <QBtn
              :label="$t('tutorial.welcome.ok')"
              color="accent"
              @click="pricing = true"
            />
            <QDialog
              v-model="pricing"
              persistent
              maximized
              transition-show="slide-up"
              transition-hide="slide-down"
            >
              <QCard
                class="overflow-hidden-y q-pb-lg"
                :class="{
                  'bg-grey-4 text-white': !$q.dark.isActive,
                  'bg-dark text-white': $q.dark.isActive,
                }"
              >
                <QBar>
                  <QSpace />
                  <QBtn v-close-popup dense flat icon="close" />
                </QBar>
                <QCardSection class="full-height overflow-hidden-y">
                  <PricingComponent
                    @demo="onDemoSign"
                    @free="stepper.next()"
                    @premium="onPremium"
                    @vip="onContactSale"
                  />
                </QCardSection>
              </QCard>
            </QDialog>
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
          <IdComponent @finish="onFinish" />
        </QStep>
      </QStepper>
    </QScrollArea>
  </QPage>
</template>
<script lang="ts" setup>
import { defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  exportFile,
  useMeta,
  useQuasar,
  QIcon,
  QCard,
  QCardSection,
  QPage,
  QScrollArea,
  QSpace,
  QStep,
  QStepper,
  QStepperNavigation,
  QTooltip,
  QList,
  QExpansionItem,
  QBtn,
  QDialog,
  QBar,
} from 'quasar'
import { storeToRefs } from 'pinia'
import useAuthStore from 'stores/auth'
import { demoUserWebId } from 'stores/auth'
import useTutorialStore from 'stores/tutorial'
import useContractStore from 'stores/contract'
import useProfileStore from 'stores/profile'
import usePodStore from 'stores/pod'
import useWalletStore from 'stores/wallet'
import pkg from '../../package.json'
import { ROUTE_NAMES } from '../router/routes'
import { parse } from '../helpers/markdownHelper'
import solidAuth from '../services/authService'
import { keyPair } from '../services/databaseService'
import { mintContract } from '../services/contractGeneratorService'
import { Credential } from '../types/models'

const PricingComponent = defineAsyncComponent(
  () => import('components/PricingComponent.vue'),
)

const OIDCIssuerComponent = defineAsyncComponent(
  () => import('components/OIDCIssuerComponent.vue'),
)

const IdComponent = defineAsyncComponent(
  () => import('components/IdComponent.vue'),
)

const $t = useI18n().t
const $q = useQuasar()
const router = useRouter()
const podStore = usePodStore()
const authStore = useAuthStore()
const contractStore = useContractStore()
const profileStore = useProfileStore()
const walletStore = useWalletStore()
const tutorialStore = useTutorialStore()

enum STEP {
  WELCOME = 1,
  OIDC = 2,
  FINAL = 3,
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
const pricing = ref(false)

const { isLoggedIn } = storeToRefs(authStore)
const { did, consumer, email } = storeToRefs(profileStore)

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
    dialog.onOk(async () => {
      await onDemoSign()
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

function importContractsFromPod() {
  const dialog = $q.dialog({
    message: $t('database.pod.sync'),
    cancel: true,
    persistent: true,
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  dialog.onOk(async () => {
    const links = await podStore.getContractsLink()
    for (const id of links) {
      const credential: Credential = await podStore.getContract(id)
      dialog.update({
        message: credential.credentialSubject.instrument.name,
      })
      await contractStore.insertContract(credential)
    }
  })
}

function exportKeyPair() {
  const dialog = $q.dialog({
    message: $t('components.keypair.export.dialog.message'),
    cancel: true,
    persistent: true,
  })
  dialog.onDismiss(() => {})
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

async function onDemoSign() {
  const key = await keyPair.generateNewKeyPair(demoUserWebId)
  await keyPair.setKeyPair(key)
  profileStore.consumerName('Test User')
  profileStore.consumerEmail('tester@gotointeractive.com')
  profileStore.consumerDID(key.id)
  authStore.webId = demoUserWebId
  tutorialStore.tutorialComplete()
  await router.push({
    name: ROUTE_NAMES.CREATE,
  })
}

async function onFinish() {
  $q.loading.show()

  if (!authStore.webId) {
    authStore.webId = demoUserWebId
  }

  try {
    if (!did.value) {
      throw new Error('DID empty')
    }
    exportKeyPair()
    if (isLoggedIn.value) {
      await podStore.initPod()
    }
    profileStore.consumerName(consumer.value)
    profileStore.consumerEmail(email.value)
    await profileStore.setAvatar(email.value)

    if (isLoggedIn.value) {
      await podStore.setProfileFOAF()
      importContractsFromPod()
      // fixme - сохранять KeyPair DID на SOLID
      // ...
    }

    const contractPDF = await mintContract({
      url: window.location.origin + '/docs/privacy.md',
      agentLegal: Number(true), // todo - перенести в схему объекта agent
      agent: {
        name: consumer.value,
        email: email.value,
      },
      participant: {
        name: pkg.author.name,
        email: pkg.author.email,
        url: pkg.author.url,
      },
      instrument: {
        name: $t('pages.privacy.title'),
        description: `${pkg.productName}: ${pkg.description} v${pkg.version}`,
      },
    })
    tutorialStore.tutorialComplete()
    await router.push({
      name: ROUTE_NAMES.CREATE,
      query: contractPDF,
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'error',
      color: 'negative',
      message: String(error.message),
      position: 'bottom',
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

function onPremium() {
  alert('Premium is under construction')
}

function onContactSale() {
  alert('Contact Sale is under construction')
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
  if (
    step.value === Number(STEP.FINAL) &&
    walletStore.getMultibase?.length === 0
  ) {
    step.value = STEP.WELCOME
  } else if (isLoggedIn.value && query.code && query.state) {
    step.value = STEP.FINAL
  }
})
</script>
