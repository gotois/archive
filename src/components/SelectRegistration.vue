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
import useAuthStore from 'stores/auth'
import { demoUserWebId } from 'stores/auth'
import { keyPair } from '../services/databaseService'
import { TELEGRAM_BOT_NAME } from '../services/telegram'
import { TelegramUser } from '../types/models'
import { isProductionApp } from '../helpers/googlePlayHelper'

const emit = defineEmits(['select'])

const $q = useQuasar()
const i18n = useI18n()
const $t = i18n.t
const profileStore = useProfileStore()
const authStore = useAuthStore()

async function demoSign() {
  try {
    await profileStore.setNetworkUser()
  } catch {
    // ignore
  }

  const key = await keyPair.generateNewKeyPair(demoUserWebId)
  await keyPair.setKeyPair(key)
  profileStore.consumerPhone('+1234567890')
  profileStore.consumerDID(key.id)
  authStore.webId = demoUserWebId
  authStore.setLoginAndPassword('demo', 'demo')
  return true
}

async function telegramSign(user: TelegramUser) {
  try {
    await profileStore.setNetworkUser()
  } catch {
    // ignore
  }
  emit('select', async () => {
    try {
      await authStore.registration(user)
      // fixme - устаревшее, теперь данные берутся из сервера
      // но нужно поддержать на сервере чтобы данные брались такого вида first_name + last_name
      // const name = user.first_name ?? '' + ' ' + user.last_name ?? ''
      // profileStore.consumerName(name)
      return true
    } catch (error) {
      return false
    }
  })
}
</script>
