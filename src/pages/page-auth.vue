<template>
  <div class="fullscreen bg-white flex flex-center column">
    <p class="text-caption text-center">
      {{ $t('auth.caption') }}
    </p>
    <v-otp-input
      ref="otpInput"
      :value="pin"
      input-classes="otp-input"
      separator="-"
      :num-inputs="4"
      :is-disabled="otpDisabled"
      :should-auto-focus="true"
      :is-input-num="true"
      :conditional-class="['first', '', '', 'last']"
      :placeholder="['', '', '', '']"
      @on-complete="onHandleComplete"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useMeta, useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import VOtpInput from 'vue3-otp-input'
import { useStore } from '../store'

const $q = useQuasar()
const router = useRouter()
const store = useStore()

const timeout = 2000
const metaData = {
  'title': 'Авторизация',
  'og:title': 'Авторизация',
}

const otpDisabled = ref(false)
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const otpInput = ref(null)
const pin = ref('')

function clearOTP() {
  otpDisabled.value = false
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  otpInput.value.clearInput()
  document
    .querySelectorAll('.otp-input')
    .forEach((element) => (element as HTMLElement).blur())
}

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
    setTimeout(() => clearOTP(), timeout)
  }
}

useMeta(metaData)
</script>
