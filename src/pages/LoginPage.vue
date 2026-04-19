<template>
  <QPage
    class="flex flex-center column"
    :class="{
      'bg-dark': $q.dark.isActive,
      'bg-grey-1': !$q.dark.isActive,
    }"
  >
    <QScrollArea
      visible
      ref="scroll"
      class="absolute-full fit"
      :content-style="contentStyle"
      :content-active-style="contentStyle"
    >
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
          />
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
                  />
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
                  />
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
                  />
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
                  />
                </QCardSection>
              </QCard>
            </QExpansionItem>
          </QList>
          <p class="text-caption no-margin text-weight-light">
            {{ $t('tutorial.welcome.hint') }}
          </p>

          <QForm
            ref="nameForm"
            class="q-gutter-md"
            autocapitalize="off"
            autocomplete="off"
            :autofocus="$q.platform.is.desktop"
            greedy
            @submit="onAccept"
          >
            <QStepperNavigation class="no-margin q-pt-md q-pl-md">
              <QBtn
                color="accent"
                type="submit"
                :label="$t('tutorial.data.submit')"
                :class="{
                  'full-width': !$q.platform.is.desktop,
                }"
                :loading="$q.loading.isActive"
                icon-right="app_registration"
              />
            </QStepperNavigation>
          </QForm>
        </QStep>
        <QStep
          :name="STEP.FINAL"
          :title="$t('tutorial.data.title')"
          done-color="positive"
          icon="assignment"
          class="q-pb-md"
          :done="step >= STEP.FINAL"
        >
          <p class="text-body1">
            {{ $t('tutorial.data.body') }}
          </p>
          <QSpace class="q-pa-xs" />

          <QCard
            flat
            square
            bordered
            class="q-pa-md"
            style="width: 400px"
            :class="{
              'full-width': $q.platform.is.mobile,
            }"
          >
            <p class="text-h4">
              {{ $t('tutorial.oidc.title') }}
            </p>
            <p class="text-caption">
              {{ $t('tutorial.oidc.caption') }}
            </p>
            <div
              class="text-body1"
              style="white-space: break-spaces"
              v-html="parse($t('tutorial.oidc.body'))"
            />

            <template v-if="getOidcIssuer">
              <QChip
                class="full-width q-pl-none"
                color="transparent"
                :label="$t('login.oidcIssuer', { oidcIssuer: getOidcIssuer })"
                removable
                @remove="onRemove"
              />
              <QBtn
                color="accent"
                :label="$t('login.authentication')"
                :disable="$q.loading.isActive"
                :loading="$q.loading.isActive"
                square
                glossy
                push
                unelevated
                no-caps
                class="full-width"
                @click="onLogin"
              />
            </template>
            <template v-else>
              <OIDCIssuerComponent
                :label="$t('components.oidcIssuer.label')"
                @on-complete="onOnlineAuthorize"
              >
                <QTooltip>
                  {{ $t('components.oidcIssuer.input') }}
                  {{ $t('oidc.tutorialHint') }}
                </QTooltip>
              </OIDCIssuerComponent>
            </template>
          </QCard>
        </QStep>
      </QStepper>
    </QScrollArea>
  </QPage>
</template>
<script lang="ts" setup>
import { ref, watch, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  useMeta,
  useQuasar,
  LocalStorage,
  SessionStorage,
  QBtn,
  QChip,
  QPage,
  QCard,
  QTooltip,
  QScrollArea,
  QCardSection,
  QExpansionItem,
  QIcon,
  QList,
  QSpace,
  QStep,
  QStepper,
  QStepperNavigation,
  QForm,
} from 'quasar'
import { storeToRefs } from 'pinia'
import usePodStore from 'stores/pod'
import useAuthStore from 'stores/auth'
import useProfileStore from 'stores/profile'
import OIDCIssuerComponent from 'components/OIDCIssuerComponent.vue'
import {
  getDefaultSession,
  handleIncomingRedirect,
  login,
} from '@inrupt/solid-client-authn-browser'
import { parse } from '../helpers/markdownHelper'
import { EVENTS } from '@inrupt/solid-client-authn-core'
import { isTMA } from '../composables/detector'
import pkg from '../../package.json'
import { STEP } from '../router/routes'
import type { VerifiableCredential } from '../types/models'
import {
  mainButton,
  popup,
  requestContact,
  hapticFeedbackNotificationOccurred,
} from '@telegram-apps/sdk'

const $t = useI18n().t
const $q = useQuasar()
const router = useRouter()
const podStore = usePodStore()
const profileStore = useProfileStore()
const authStore = useAuthStore()

const stepParam = 'step'

const { getOidcIssuer } = storeToRefs(podStore)

const contentStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const TOKEN_TYPE = 'DPoP'

const scroll = ref<InstanceType<typeof QScrollArea> | null>(null)
const stepper = ref<InstanceType<typeof QStepper> | null>(null)
const step = ref(getCurrentStep() ?? STEP.WELCOME)

const { phone, email } = storeToRefs(profileStore)

watch(
  () => step.value,
  (value) => {
    console.log('step', value)
    setMeta(value)
  },
)

function setMeta(value: number) {
  switch (value as STEP) {
    case STEP.WELCOME: {
      useMeta({
        'title': $t('pages.tutorial.welcome.title'),
        'og:title': $t('pages.tutorial.welcome.title'),
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

const events = getDefaultSession().events

// eslint-disable-next-line @typescript-eslint/no-misused-promises
events.on(EVENTS.SESSION_RESTORED, async (urlString: string) => {
  const url = new URL(urlString)
  $q.sessionStorage.remove('connect')
  try {
    authStore.openIdHandleIncoming()
    await podStore.setResourceRootUrl()
    await router.push({
      path: url.pathname,
      replace: true,
    })
  } catch (e) {
    console.error(e)
  } finally {
    $q.loading.hide()
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
events.on(EVENTS.LOGIN, async () => {
  authStore.openIdHandleIncoming()
  try {
    await podStore.setResourceRootUrl()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Login Failed',
    })
    $q.loading.show()
    return
  } finally {
    $q.sessionStorage.remove('connect')
  }
  try {
    const { email, avatar } = await podStore.getProfileFOAF()
    if (email) {
      profileStore.consumerEmail(email)
    }
    if (avatar) {
      profileStore.consumerImg(avatar)
    }
  } catch (error) {
    console.error(error)
  } finally {
    $q.sessionStorage.set('restorePreviousSession', true)
  }
})

events.on(EVENTS.LOGOUT, () => {
  $q.sessionStorage.remove('connect')
  $q.sessionStorage.remove('restorePreviousSession')
})

events.on(EVENTS.ERROR, (error) => {
  console.error('Login error:', error)
})

interface AuthData {
  redirectUrl?: string
  oidcIssuer?: string
  restorePreviousSession?: boolean
}

async function solidAuth({
  redirectUrl = window.location.href,
  oidcIssuer = LocalStorage.getItem('oidcIssuer'),
  restorePreviousSession,
}: AuthData) {
  if (!oidcIssuer) {
    throw new Error('oidcIssuer empty')
  }
  if (!navigator.onLine) {
    return Promise.reject(new Error('Not onLine'))
  }
  let currentConnect = Number(SessionStorage.getItem('connect')) ?? 0
  SessionStorage.set('connect', ++currentConnect)
  if (currentConnect > 3) {
    return Promise.reject(
      new Error('Cannot connect: ' + String(currentConnect)),
    )
  }
  const defaultSession = getDefaultSession().info
  const sessionInfo = await handleIncomingRedirect({
    restorePreviousSession,
  })
  LocalStorage.set('oidcIssuer', oidcIssuer)
  if (!sessionInfo) {
    return login({
      oidcIssuer,
      tokenType: TOKEN_TYPE,
    })
  }
  const expiresDate = sessionInfo.expirationDate
  const nowDate = new Date()
  const isExpirationAlive =
    (sessionInfo.expirationDate && expiresDate.valueOf() < nowDate.valueOf()) ??
    false
  if (
    sessionInfo.isLoggedIn ||
    isExpirationAlive ||
    defaultSession.sessionId === sessionInfo.sessionId
  ) {
    console.warn('Session alive')
    window.location.href = window.location.origin
    return
  }
  return login({
    oidcIssuer,
    tokenType: TOKEN_TYPE,
  })
}

function onRemove() {
  podStore.removeOIDCIssuer()
}

async function onLogin() {
  $q.sessionStorage.remove('connect')
  $q.sessionStorage.remove('restorePreviousSession')
  $q.sessionStorage.remove('oidcIssuer')
  await tryLogin()
}

async function tryLogin() {
  try {
    $q.loading.show({
      message: $t('components.oidcIssuer.processing'),
      boxClass: $q.dark.isActive
        ? 'bg-black text-white'
        : 'bg-grey-2 text-grey-9',
      spinnerColor: 'primary',
    })
    await solidAuth({
      redirectUrl: window.location.href,
      oidcIssuer: getOidcIssuer.value,
      restorePreviousSession: false,
    })
  } catch (error) {
    console.error(error)
    $q.sessionStorage.remove('restorePreviousSession')

    $q.notify({
      message: String(error.message),
      type: 'error',
      timeout: 99999999999,
      multiLine: true,
      progress: false,
      color: 'negative',
      position: 'bottom',
      actions: [
        {
          label: 'Try again',
          handler() {
            // void Router.replace(to.fullPath)
          },
        },
        {
          icon: 'close',
        },
      ],
    })
  } finally {
    $q.loading.hide()
  }
}

async function onOnlineAuthorize(oidcIssuer: string) {
  if (!oidcIssuer) {
    $q.notify({
      type: 'negative',
      message: $t('components.oidcIssuer.fail'),
    })
    const dialog = $q.dialog({
      message: $t('components.oidcIssuer.authorizeDialog.message'),
      cancel: true,
      persistent: true,
    })
    dialog.onOk(() => {
      alert('ok')
    })
    return
  }
  $q.loading.show()
  $q.sessionStorage.remove('connect')
  const redirectUrl = window.location.origin + window.location.pathname
  try {
    await solidAuth({
      redirectUrl: redirectUrl,
      oidcIssuer: oidcIssuer,
      restorePreviousSession: false,
    })
    await podStore.initPod()
    await podStore.setProfileFOAF()
  } catch (error) {
    console.error(error)
    $q.notify({
      color: 'negative',
      message: $t('components.oidcIssuer.authorizeDialog.fail'),
    })
  } finally {
    $q.loading.hide()
  }

  podStore.setOIDCIssuer(oidcIssuer)
}

function onAccept() {
  stepper.value.next()
}

async function onStep(step: STEP) {
  await router.push({
    query: {
      ...router.currentRoute.value.query,
      step: step,
    },
    replace: true,
  })
  scroll.value.setScrollPosition('vertical', step * 30, 100)
}

function getCurrentStep() {
  const searchParams = new URLSearchParams(window.location.search)

  if (searchParams.get(stepParam)) {
    return Number(searchParams.get(stepParam))
  }
}

async function onMainButtonClick() {
  if (mainButton.isLoaderVisible()) {
    return
  }
  try {
    mainButton.setParams({
      isLoaderVisible: true,
    })
    if (!requestContact.isSupported()) {
      throw new Error('RequestContact is not supported')
    }
    const requestedContact = await requestContact()

    if (hapticFeedbackNotificationOccurred.isAvailable()) {
      hapticFeedbackNotificationOccurred('success')
    }

    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  } catch (error: Error | unknown) {
    console.error(error)

    if (hapticFeedbackNotificationOccurred.isAvailable()) {
      hapticFeedbackNotificationOccurred('error')
    }

    if (popup.isSupported()) {
      await popup.show({
        title: 'RequestContact ERROR',
        message: error.message as string,
      })
    } else {
      $q.notify({
        type: 'negative',
        message: error.message as string,
      })
    }
  } finally {
    mainButton.setParams({
      isLoaderVisible: false,
    })
  }
}

function createTMAMainButton() {
  mainButton.mount()
  mainButton.setParams({
    backgroundColor: '#000000',
    hasShineEffect: true,
    isEnabled: true,
    isVisible: true,
    isLoaderVisible: false,
    text: $t('navigation.register'),
    textColor: '#ffffff',
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  mainButton.onClick(onMainButtonClick)
}

onBeforeMount(() => {
  if (isTMA.value) {
    createTMAMainButton()
  }
  setMeta(step.value)
})
</script>
