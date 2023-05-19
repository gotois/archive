<template>
  <QPage
    class="flex flex-center column"
    :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'"
  >
    <p class="text-caption text-center">
      {{ $t('auth.caption') }}
    </p>
    <OTPComponent
      ref="otp"
      autofocus
      :disabled="otpDisabled"
      @on-complete="onHandleComplete"
    />
  </QPage>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useMeta, useQuasar, QPage } from 'quasar'
import { useRouter } from 'vue-router'
import OTPComponent from 'components/OTPComponent.vue'
import useAuthStore from 'stores/auth'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

const metaData = {
  'title': 'Авторизация',
  'og:title': 'Авторизация',
}

const otp = ref<InstanceType<typeof OTPComponent> | null>(null)
const otpDisabled = ref(false)

async function onHandleComplete(value: string) {
  const timeout = 2000
  await authStore.validate(value)
  if (authStore.pinIsLoggedIn) {
    await authStore.setCode(value)
    const dismiss = $q.notify({
      message: 'Пожалуйста, подождите...',
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
    $q.notify({
      color: 'negative',
      message: 'Неверный ключ',
      progress: true,
      timeout: timeout,
    })
    setTimeout(() => {
      otpDisabled.value = false
      otp.value.clear()
    }, timeout)
  }
}

useMeta(metaData)
</script>
