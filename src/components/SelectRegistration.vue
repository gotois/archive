<template>
  <TelegramLogin
    v-if="isPWA"
    mode="callback"
    :telegram-login="TELEGRAM_BOT_NAME"
    size="large"
    radius="0"
    @callback="telegramSign"
  />
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
    <QBtnGroup v-if="!$q.loading.isActive" class="q-pa-md" flat>
      <QBtn
        style="height: 40px"
        class="full-width"
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
        <div class="text-h6">Your Login with Password</div>
      </QCardSection>
      <QCardSection class="q-pt-none">
        <QInput
          v-model.trim="login"
          label="Login"
          type="text"
          :maxlength="32"
          :hide-bottom-space="!$q.platform.is.desktop"
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
          color="secondary"
          autocomplete="off"
          outlined
        >
        </QInput>
      </QCardSection>
      <QCardActions align="right" class="text-secondary">
        <QBtn v-close-popup label="Cancel" />
        <QBtn label="Submit" @click="submitForm" />
      </QCardActions>
    </QCard>
  </QDialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { telegramLoginTemp as TelegramLogin } from 'vue3-telegram-login'
import {
  useQuasar,
  QTooltip,
  QBtn,
  QBtnGroup,
  QBtnDropdown,
  QInput,
  QDialog,
  QCard,
  QCardActions,
  QCardSection,
} from 'quasar'
import useProfileStore from 'stores/profile'
import useSecretaryStore from 'stores/secretary'
import { TELEGRAM_BOT_NAME } from '../services/telegram'
import { isPWA } from '../composables/detector'
import type { TelegramUser } from '../types/models'

const emit = defineEmits(['authed'])

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
  const vc = await secretaryStore.authWithLoginAndPassword(
    login.value,
    password.value,
  )
  emit('authed', vc)
}

async function telegramSign(user: TelegramUser = process.env.demo_user) {
  try {
    await profileStore.setNetworkUser()
  } catch {
    // ignore
  }
  try {
    const vc = await secretaryStore.registration(user)
    emit('authed', vc)
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Registration Failed. Please try later.',
    })
  }
}
</script>
