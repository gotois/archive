<template>
  <TelegramLogin
    v-if="isPWA"
    mode="callback"
    :telegram-login="TELEGRAM_BOT_NAME"
    size="large"
    radius="0"
    @callback="telegramSign"
  />
  <template v-else-if="isTMA"></template>
  <QBtnDropdown
    v-else
    :label="$t('tutorial.welcome.ok')"
    color="accent"
    square
    auto-close
    stretch
    :class="{
      'full-width': !$q.platform.is.desktop,
    }"
  >
    <QBtnGroup
      v-if="!$q.loading.isActive"
      class="q-pa-md"
      :flat="$q.platform.is.mobile"
    >
      <QBtn
        style="height: 40px"
        square
        flat
        label="Demo"
        @click="telegramSign()"
      >
        <QTooltip>Demo Sign</QTooltip>
      </QBtn>
      <QBtn
        style="height: 40px"
        class="full-width"
        square
        flat
        label="Login with Password"
        @click="openLoginPasswordSign()"
      >
        <QTooltip>Login/Password Sign</QTooltip>
      </QBtn>
    </QBtnGroup>
  </QBtnDropdown>
  <QDialog v-model="loginPasswordDialog" persistent>
    <QCard style="min-width: 350px">
      <QCardSection>
        <div class="text-h6">Auth with Login and Password</div>
      </QCardSection>
      <QForm @submit="submitForm">
        <QCardSection class="q-pt-none">
          <QInput
            v-model.trim="login"
            label="Login"
            type="text"
            :maxlength="32"
            :hide-bottom-space="!$q.platform.is.desktop"
            :rules="[(val) => !!val || 'Login is required']"
            lazy-rules
            color="secondary"
            autocomplete="off"
            outlined
            autofocus
          >
          </QInput>
          <QInput
            v-model.trim="password"
            label="Password"
            type="password"
            :maxlength="32"
            :hide-bottom-space="!$q.platform.is.desktop"
            :rules="[(val) => !!val || 'Password is required']"
            lazy-rules
            color="secondary"
            autocomplete="off"
            outlined
          >
          </QInput>
        </QCardSection>
        <QCardActions align="right" class="text-secondary">
          <QBtn v-close-popup outline label="Cancel" />
          <QBtn label="Submit" color="primary" type="submit" />
        </QCardActions>
      </QForm>
    </QCard>
  </QDialog>
</template>
<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { telegramLoginTemp as TelegramLogin } from 'vue3-telegram-login'
import {
  mainButton,
  popup,
  sendData,
  requestContact,
  hapticFeedbackNotificationOccurred,
} from '@telegram-apps/sdk'
import {
  useQuasar,
  QTooltip,
  QBtn,
  QBtnGroup,
  QBtnDropdown,
  QInput,
  QForm,
  QDialog,
  QCard,
  QCardActions,
  QCardSection,
} from 'quasar'
import useProfileStore from 'stores/profile'
import useSecretaryStore from 'stores/secretary'
import { TELEGRAM_BOT_NAME } from '../services/telegram'
import { isPWA, isTMA } from '../composables/detector'
import type { VerifiableCredential, TelegramUser } from '../types/models'

const emit = defineEmits(['authed', 'registered'])

const $q = useQuasar()
const i18n = useI18n()
const $t = i18n.t
const profileStore = useProfileStore()
const secretaryStore = useSecretaryStore()

const loginPasswordDialog = ref(false)
const login = ref('')
const password = ref('')

function openLoginPasswordSign() {
  loginPasswordDialog.value = true
}

async function submitForm() {
  try {
    await secretaryStore.authWithLoginAndPassword(login.value, password.value)
    emit('authed')
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Registration Failed. Please try later.',
    })
  }
}

async function telegramSign(user: TelegramUser = process.env.demo_user) {
  try {
    await profileStore.setNetworkUser()
  } catch {
    // ignore
  }
  try {
    const response = await secretaryStore.registration(user)
    const vc = (await response.json()) as VerifiableCredential

    emit('registered', vc)
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Registration Failed. Please try later.',
    })
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
    const response = await secretaryStore.registration(requestedContact)

    const jwt = response.headers.get('Authorization')
    const token = {
      type: 'jwt',
      data: jwt,
    }

    if (hapticFeedbackNotificationOccurred.isAvailable()) {
      hapticFeedbackNotificationOccurred('success')
    }

    sendData(JSON.stringify(token))
    emit('authed')
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
})
</script>
