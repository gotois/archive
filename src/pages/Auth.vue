<template>
  <div class="fullscreen bg-white flex flex-center column">
    <p class="text-caption text-center">Введите ключ</p>
    <v-otp-input
      ref="otpInput"
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

<script lang="ts">
import {defineComponent, ref} from 'vue'
import {QVueGlobals, useMeta, useQuasar} from 'quasar'
import VOtpInput from 'vue3-otp-input'
import {Store as VuexStore} from 'vuex'
import {Router, useRouter} from 'vue-router'
import {StateInterface, useStore} from '../store'

let $q: QVueGlobals
let store: VuexStore<StateInterface>
let router: Router

const timeout = 2000
const metaData = {
  title: 'Авторизация',
}

const otpDisabled = ref(false)
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const otpInput = ref(null)

function clearOTP() {
  otpDisabled.value = false
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  otpInput.value.clearInput()
  document.querySelectorAll('.otp-input').forEach((element) => {
    (element as HTMLElement).blur()
  })
}

async function onHandleComplete(value: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const codeValid = await store.dispatch('Auth/checkCode', value)
  if (codeValid) {
    await store.dispatch('Auth/setCode', value)
    const prevPath = String(router.currentRoute.value.query.fullPath)
    await router.replace(prevPath || {
      name: 'archive',
    })
  } else {
    otpDisabled.value = true
    $q.notify({
      color: 'negative',
      message: 'Неверный ключ',
      timeout: timeout,
    })
    setTimeout(() => clearOTP(), timeout)
  }
}

function main() {
  $q = useQuasar()
  router = useRouter()
  store = useStore()
  useMeta(metaData)

  return {
    otpDisabled,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    otpInput,
    onHandleComplete,
  }
}

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Auth',
  components: {
    VOtpInput,
  },
  setup() {
    return main()
  },
})
</script>
