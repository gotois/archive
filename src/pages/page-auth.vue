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
import { useStore } from '../store'

const $q = useQuasar()
const router = useRouter()
const store = useStore()

const timeout = 2000
const metaData = {
  'title': 'Авторизация',
  'og:title': 'Авторизация',
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const otp = ref(null)
const otpDisabled = ref(false)

async function onHandleComplete(value: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const codeValid = await store.dispatch('Auth/checkCode', value)
  if (codeValid) {
    await store.dispatch('Auth/setCode', value)
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
