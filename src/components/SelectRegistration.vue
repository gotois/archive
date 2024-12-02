<template>
  <QBtnDropdown
    :label="$t('tutorial.welcome.ok')"
    color="accent"
    square
    auto-close
    stretch
    :class="{
      'full-width': !$q.platform.is.desktop,
    }"
    @click="getClientInfo"
  >
    <QBtnGroup class="q-pa-md" flat>
      <QBtn
        v-if="!$q.loading.isActive"
        style="height: 40px"
        class="full-width"
        square
        flat
        label="Demo"
        @click="$emit('select', demoSign)"
      >
        <QTooltip>Demo sign</QTooltip>
      </QBtn>
      <TelegramLogin
        mode="callback"
        :telegram-login="TELEGRAM_BOT_NAME"
        size="large"
        radius="0"
        @callback="telegramSign"
      />
    </QBtnGroup>
  </QBtnDropdown>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { telegramLoginTemp as TelegramLogin } from 'vue3-telegram-login'
import { useQuasar, QTooltip, QBtn, QBtnGroup, QBtnDropdown } from 'quasar'
import useProfileStore from 'stores/profile'
import useAuthStore from 'stores/auth'
import { demoUserWebId } from 'stores/auth'
import { keyPair } from '../services/databaseService'
import { TELEGRAM_BOT_NAME } from '../services/telegram'
import { getCloudflareInfo } from '../services/cloudflare'
import { TelegramUser } from '../types/models'

defineEmits(['select'])

const $q = useQuasar()
const i18n = useI18n()
const $t = i18n.t
const profileStore = useProfileStore()
const authStore = useAuthStore()

const location = ref('')

async function getClientInfo() {
  if (location.value !== '') {
    return
  }
  $q.loading.show()
  try {
    const { loc } = await getCloudflareInfo()
    location.value = loc
  } catch (e) {
    console.error(e)
  } finally {
    $q.loading.hide()
  }
}

async function demoSign() {
  const key = await keyPair.generateNewKeyPair(demoUserWebId)
  await keyPair.setKeyPair(key)
  profileStore.consumerPhone('+1234567890')
  profileStore.consumerDID(key.id)
  authStore.webId = demoUserWebId
  authStore.setLoginAndPassword('demo', 'demo')
  return true
}

async function telegramSign(user: TelegramUser) {
  await authStore.registration(user)
  const name = user.first_name ?? '' + ' ' + user.last_name ?? ''
  profileStore.consumerName(name)
  return true
}
</script>
