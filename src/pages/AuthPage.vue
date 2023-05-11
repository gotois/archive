<template>
  <QPage class="bg-grey-1 flex flex-center column">
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
    $q.notify({
      color: 'positive',
      message: 'Пожалуйста, подождите...',
      spinner: true,
    })
    await router.push({
      name: router.currentRoute.value.name || 'archive',
      query: router.currentRoute.value.query,
      replace: true,
    })
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
      otp.value.clear()
    }, timeout)
  }
}

useMeta(metaData)
</script>
