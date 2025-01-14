<template>
  <TelegramLogin
    v-if="isProductionApp"
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
    <QBtnGroup class="q-pa-md" flat>
      <QBtn
        v-if="!$q.loading.isActive"
        style="height: 40px"
        class="full-width"
        square
        flat
        label="Demo"
        @click="emit('select', demoSign)"
      >
        <QTooltip>Demo Sign</QTooltip>
      </QBtn>
    </QBtnGroup>
  </QBtnDropdown>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { telegramLoginTemp as TelegramLogin } from 'vue3-telegram-login'
import { useQuasar, QTooltip, QBtn, QBtnGroup, QBtnDropdown } from 'quasar'
import useProfileStore from 'stores/profile'
import useSecretaryStore from 'stores/secretary'
import { TELEGRAM_BOT_NAME } from '../services/telegram'
import { TelegramUser } from '../types/models'
import { isProductionApp } from '../helpers/googlePlayHelper'

const emit = defineEmits(['authed'])

const $q = useQuasar()
const i18n = useI18n()
const $t = i18n.t
const profileStore = useProfileStore()
const secretaryStore = useSecretaryStore()

async function telegramSign(user: TelegramUser) {
  try {
    await profileStore.setNetworkUser()
  } catch {
    // ignore
  }
  try {
    await secretaryStore.registration(user)
    emit('authed')
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Registration Failed. Please try later.',
    })
  }
}
</script>
