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

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const otp = ref(null)
const otpDisabled = ref(false)

async function onHandleComplete(value: string) {
  const timeout = 2000
  const codeValid = await authStore.checkCode(value)
  if (codeValid) {
    await authStore.setCode(value)
    const prevPath = String(router.currentRoute.value.query.fullPath)
    await router.replace(
      prevPath || {
        name: 'archive',
      },
    )
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
