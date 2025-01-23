<template>
  <QPage
    :class="{
      'bg-transparent': $q.dark.isActive,
      'bg-grey-1': !$q.dark.isActive,
    }"
  >
    <QScrollArea visible class="absolute-full fit q-pl-md q-pr-md">
      <template v-if="activated">
        <QBtn
          type="button"
          round
          :dense="$q.platform.is.desktop"
          color="negative"
          icon="remove"
          :label="$t('settings.otp.removeCode')"
          @click="onOTPChange('')"
        />
      </template>
      <template v-else>
        <QBtn
          type="button"
          :dense="$q.platform.is.desktop"
          square
          ripple
          stretch
          icon="key"
          color="secondary"
          :label="$t('settings.otp.addCode')"
          @click="openOTPDialog"
        />
        <QDialog v-model="showOTPDialog" position="bottom" square>
          <QCard flat class="q-pa-md">
            <QCardSection>
              <p>{{ $t('settings.otp.description') }}</p>
              <QImg
                :src="authUriQR"
                alt="QR"
                fit="none"
                height="250px"
                class="cursor-pointer"
                decoding="async"
                fetchpriority="high"
                @click="open(authUri)"
              />
              <QSpace class="q-pa-xs" />
              <QOtp
                v-if="showOTPDialog"
                ref="otp"
                :outlined="!$q.screen.xs"
                :dense="$q.platform.is.desktop"
                :num="TFA_LENGTH"
                :rules="[otpRule]"
                square
                :autofocus="$q.platform.is.desktop"
                :input-styles="{ width: '32px' }"
                field-classes="q-ml-xs q-mr-xs"
                style="width: fit-content"
                class="q-ml-auto q-mr-auto"
                @change="onOTPChange"
                @complete="onOTPHandleComplete"
              />
            </QCardSection>
          </QCard>
        </QDialog>
      </template>
    </QScrollArea>
  </QPage>
</template>
<script lang="ts" setup>
import { ref, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useQuasar,
  QBtn,
  QDialog,
  QImg,
  QCard,
  QCardSection,
  QScrollArea,
  QPage,
} from 'quasar'
import useAuthStore from 'stores/auth'
import useTFAStore from 'stores/tfa'
import { open } from '../helpers/urlHelper'
import { createQR } from '../helpers/qrHelper'

import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const tfaStore = useTFAStore()
const QOtp = defineAsyncComponent(
  () => import('quasar-app-extension-q-otp/src/component/QOtp.vue'),
)
const otp = ref<InstanceType<typeof QOtp> | null>(null)
const authUriQR = ref('')
const authUri = ref('')
const TFA_LENGTH = 6

const { activated } = storeToRefs(tfaStore)
const showOTPDialog = ref(false)

const $q = useQuasar()
const $t = useI18n().t

function otpRule(token: string) {
  if (token.length === TFA_LENGTH) {
    return tfaStore.verify(token) || 'TFA Error'
  }
  return true
}

function onOTPChange(value: string) {
  if (!activated.value || value.length) {
    return
  }
  const dialog = $q.dialog({
    message: $t('components.otp.pinDialog.message'),
    cancel: true,
    persistent: true,
  })
  dialog.onOk(() => {
    try {
      tfaStore.deactivate2fa()
      authStore.removeAuthValue()
      $q.notify({
        type: 'positive',
        message: $t('components.otp.pinDialog.success'),
      })
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: $t('components.otp.pinDialog.fail'),
      })
    }
  })
  showOTPDialog.value = false
}

function onOTPHandleComplete(token: string) {
  if (!tfaStore.verify(token)) {
    return
  }
  const dialog = $q.dialog({
    message: $t('components.otp.saveDialog.message'),
    cancel: true,
    persistent: true,
  })
  dialog.onOk(() => {
    try {
      tfaStore.activate2fa()
      authStore.setTryAuthValue()
      $q.notify({
        type: 'positive',
        message: $t('components.otp.saveDialog.success'),
      })
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: $t('components.otp.saveDialog.fail'),
      })
    }
  })
  showOTPDialog.value = false
}

async function openOTPDialog() {
  const authURI = tfaStore.generate()
  authUri.value = authURI
  authUriQR.value = await createQR(authURI)
  showOTPDialog.value = true
}
</script>
