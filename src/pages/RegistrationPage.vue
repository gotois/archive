<template>
  <QPage
    :class="{
      'bg-transparent': $q.dark.isActive,
      'bg-grey-1': !$q.dark.isActive,
    }"
  >
    <QScrollArea ref="scroll" visible class="absolute-full fit">
      <QStepper
        ref="stepper"
        v-model.number="step"
        color="primary"
        flat
        alternative-labels
        contracted
        :header-class="isTMA ? 'hidden' : ''"
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
            <QExpansionItem
              :label="$t('tutorial.safety.title')"
              :caption="$t('tutorial.safety.caption')"
              icon="safety_divider"
              :dense="$q.platform.is.desktop"
              :dense-toggle="$q.platform.is.desktop"
            >
              <QCard>
                <QCardSection>
                  <div
                    class="text-body1"
                    style="white-space: break-spaces"
                    v-html="parse($t('tutorial.safety.body'))"
                  >
                  </div>
                </QCardSection>
              </QCard>
            </QExpansionItem>
          </QList>
          <p class="text-caption no-margin text-weight-light">
            {{ $t('tutorial.welcome.hint') }}
          </p>
          <QStepperNavigation v-if="!isTMA">
            <SelectRegistration @select="registrationCallback" />
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
          <OIDCIssuerComponent @on-complete="onOnlineAuthorize">
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
    <QDialog
      v-model="creatingNewContract"
      :allow-focus-outside="false"
      position="standard"
      persistent
      no-shake
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <QCard
        style="max-width: 640px"
        :class="{
          'bg-white text-white': !$q.dark.isActive,
          'bg-dark text-white': $q.dark.isActive,
        }"
      >
        <QCardSection class="fit overflow-auto">
          <ContractFormComponent
            v-if="dogovor"
            :dogovor="dogovor"
            :signing="false"
            @on-create="onCreateContract"
          />
        </QCardSection>
      </QCard>
    </QDialog>
  </QPage>
</template>
<script lang="ts" setup>
import { defineAsyncComponent, onBeforeMount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  exportFile,
  QCard,
  QCardSection,
  QDialog,
  QExpansionItem,
  QIcon,
  QList,
  QPage,
  QScrollArea,
  QSpace,
  QStep,
  QStepper,
  QStepperNavigation,
  QTooltip,
  useMeta,
  useQuasar,
} from 'quasar'
import { storeToRefs } from 'pinia'
import {
  mainButton,
  sendData,
  requestContact,
  popup,
  hapticFeedbackNotificationOccurred,
} from '@telegram-apps/sdk'
import { WebId } from '@inrupt/solid-client'
import useAuthStore, { demoUserWebId } from 'stores/auth'
import useTutorialStore from 'stores/tutorial'
import useContractStore from 'stores/contract'
import useProfileStore from 'stores/profile'
import usePodStore from 'stores/pod'
import useWalletStore from 'stores/wallet'
import pkg from '../../package.json'
import { isTMA } from '../helpers/twaHelper'
import { ROUTE_NAMES, STEP } from '../router/routes'
import { parse } from '../helpers/markdownHelper'
import solidAuth from '../services/authService'
import { keyPair } from '../services/databaseService'
import Dogovor from '../services/contractGeneratorService'

const SelectRegistration = defineAsyncComponent(
  () => import('components/SelectRegistration.vue'),
)
const OIDCIssuerComponent = defineAsyncComponent(
  () => import('components/OIDCIssuerComponent.vue'),
)
const IdComponent = defineAsyncComponent(
  () => import('components/IdComponent.vue'),
)
const ContractFormComponent = defineAsyncComponent(
  () => import('components/ContractFormComponent.vue'),
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
const creatingNewContract = ref(false)
const dogovor = ref<InstanceType<typeof Dogovor> | null>(null)

const { isLoggedIn } = storeToRefs(authStore)
const { did, consumer, phone, email } = storeToRefs(profileStore)

watch(
  () => step.value,
  (value) => {
    setMeta(value)
  },
)

async function registrationCallback(cb: () => Promise<boolean>) {
  try {
    const hasNext = await cb()
    if (hasNext) {
      stepper.value.next()
      return
    } else {
      $q.notify({
        type: 'negative',
        message: 'Cannot register',
      })
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: error.message as string,
    })
  }
}

function setMeta(value: number) {
  switch (value as STEP) {
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

function onCreateContract() {
  function end() {
    tutorialStore.tutorialComplete(true)
    exportKeyPair()
    void router.push({
      name: ROUTE_NAMES.ARCHIVE,
    })
  }

  if (!isLoggedIn.value) {
    end()
    return
  }

  const dialog = $q.dialog({
    message: $t('database.pod.sync'),
    cancel: true,
    persistent: true,
  })
  dialog
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .onOk(async () => {
      const links = await podStore.getContractsLink()
      for (const link of links) {
        const message = 'refreshing ' + link
        const newDogovor = await Dogovor.fromUrl(link)
        dialog.update({ message: message })
        await contractStore.insertContract(newDogovor.presentation)
      }
      end()
    })
    .onDismiss(() => {
      end()
    })
}

async function onOnlineAuthorize(oidcIssuer: string) {
  if (!oidcIssuer) {
    const dialog = $q.dialog({
      message: $t('components.oidcIssuer.authorizeDialog.message'),
      cancel: true,
      persistent: true,
    })
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

async function mintPrivacyContract() {
  const response = await fetch(window.location.origin + '/docs/agreement.md')
  const contentType = response.headers.get('content-type')

  if (contentType.startsWith('text/markdown')) {
    const { createContractPDF } = await import('../services/pdfGenerator')
    const md = await response.text()
    const html = parse(md)
    const file = await createContractPDF(html)

    const dogovor = Dogovor.mintContract({
      agent: {
        type: 'Organization',
        name: consumer.value,
        email: email.value,
      },
      participant: {
        sameAs: 'http://gotointeractive.com/profile/card#me' as WebId, // todo пока просто заглушка
        name: pkg.author.name,
        email: pkg.author.email,
        url: pkg.author.url,
      },
      instrument: {
        name: $t('pages.privacy.title'),
        description: `${pkg.productName}: ${pkg.description} v${pkg.version}`,
      },
      files: [
        {
          contentUrl: URL.createObjectURL(file),
          encodingFormat: file.type,
          caption: file.name,
        },
      ],
    })

    return dogovor
  } else {
    throw new Error('Unknown content type')
  }
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
    if (isLoggedIn.value) {
      await podStore.initPod()
    }
    profileStore.consumerName(consumer.value)
    profileStore.consumerEmail(email.value)
    profileStore.consumerPhone(phone.value)
    await profileStore.setAvatar(email.value)

    if (isLoggedIn.value) {
      await podStore.setProfileFOAF()
      // todo сохранять KeyPair DID на SOLiD
      // ...
    }

    dogovor.value = await mintPrivacyContract()
    creatingNewContract.value = true
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

async function mainClickFn() {
  if (mainButton.isLoaderVisible()) {
    return
  }
  mainButton.setParams({
    isLoaderVisible: true,
  })
  if (requestContact.isSupported()) {
    const requestedContact = await requestContact()
    await authStore.registration(requestedContact)
    tutorialStore.tutorialComplete(true)

    if (hapticFeedbackNotificationOccurred.isAvailable()) {
      hapticFeedbackNotificationOccurred('success')
    }

    sendData(
      JSON.stringify({
        type: 'registration',
        data: authStore.jwt,
      }),
    )
  } else {
    throw new Error('RequestContact is not supported')
  }
  mainButton.setParams({
    isLoaderVisible: false,
  })
}

setMeta(step.value)

onBeforeMount(() => {
  if (isTMA) {
    mainButton.mount()
    mainButton.setParams({
      backgroundColor: '#000000',
      hasShineEffect: true,
      isEnabled: true,
      isVisible: true,
      text: $t('navigation.register'),
      textColor: '#ffffff',
    })
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    mainButton.onClick(async () => {
      try {
        await mainClickFn()
      } catch (error) {
        console.error(error)
        if (popup.isSupported()) {
          await popup.open({
            title: 'RequestContact ERROR',
            message: error.message as string,
          })
        } else {
          $q.notify({
            type: 'negative',
            message: error.message as string,
          })
        }
      }
    })
  }
})

onMounted(() => {
  const { query } = router.currentRoute.value

  // Если пользователь отменил вход через WebId, возвращаем его на страницу подтверждения
  if (isLoggedIn.value && query.error === 'access_denied') {
    step.value = STEP.FINAL
  }
  if (isLoggedIn.value) {
    step.value = STEP.FINAL
  }
  if (
    step.value === Number(STEP.FINAL) &&
    walletStore.getMultibase?.length === 0
  ) {
    $q.loading.hide()
  } else if (isLoggedIn.value && query.code && query.state) {
    step.value = STEP.FINAL
  }
})
</script>
