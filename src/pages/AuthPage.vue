<template>
  <QPage
    class="flex flex-center column"
    :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'"
  >
    <p class="text-caption text-center">
      {{ $t('pages.auth.caption') }}
    </p>
    <QOtp
      ref="otp"
      :num="6"
      :dense="$q.platform.is.desktop"
      :disabled="otpDisabled"
      class="flex-center"
      field-classes="q-ml-xs q-mr-xs"
      separator="-"
      outlined
      autofocus
      @complete="onHandleComplete"
    />
  </QPage>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMeta, useQuasar, QPage } from 'quasar'
import { useRouter } from 'vue-router'
import QOtp from 'quasar-app-extension-q-otp/src/component/QOtp.vue'
import useAuthStore from 'stores/auth'
import useTFAStore from 'stores/tfa'

const $t = useI18n().t
const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const tfaStore = useTFAStore()

const metaData = {
  'title': 'pages.auth.title',
  'og:title': 'pages.auth.title',
}

const otp = ref<InstanceType<typeof QOtp> | null>(null)
const otpDisabled = ref(false)

async function onHandleComplete(value: string) {
  const timeout = 2000
  if (tfaStore.verify(value)) {
    authStore.pinIsLoggedIn = true
    const dismiss = $q.notify({
      message: $t('components.otp.processing'),
      timeout: 2000,
      spinner: true,
    })
    await router.push({
      path: String(router.currentRoute.value.query.fullPath ?? '/'),
      query: router.currentRoute.value.query,
      replace: true,
    })
    dismiss()
  } else {
    otpDisabled.value = true
    otp.value.blur()
    $q.notify({
      color: 'negative',
      message: $t('components.otp.fail'),
      progress: true,
      timeout: timeout,
    })
    setTimeout(() => {
      otpDisabled.value = false
      otp.value.clear()
      otp.value.focus()
    }, timeout)
  }
}

useMeta(metaData)
</script>
