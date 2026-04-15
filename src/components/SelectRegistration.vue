<template>
  <template v-if="isTMA"></template>
</template>
<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  mainButton,
  popup,
  requestContact,
  hapticFeedbackNotificationOccurred,
} from '@telegram-apps/sdk'
import {
  useQuasar,
} from 'quasar'
import { isTMA } from '../composables/detector'

const emit = defineEmits(['authed', 'registered'])

const $q = useQuasar()
const i18n = useI18n()
const $t = i18n.t

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
