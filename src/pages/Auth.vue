<template>
  <div class="fullscreen bg-white flex flex-center">
    <v-otp-input
      input-classes="otp-input"
      separator="-"
      :num-inputs="4"
      :should-auto-focus="true"
      :is-input-num="true"
      :conditional-class="['first', '', '', 'last']"
      :placeholder="['', '', '', '']"
      @on-complete="handleOnComplete"
    />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {useMeta, LocalStorage} from 'quasar'
import VOtpInput from 'vue3-otp-input'
import {Store as VuexStore} from 'vuex'
import {Router, useRouter} from 'vue-router'
import {StateInterface, useStore} from '../store'

let store: VuexStore<StateInterface>
let router: Router

const metaData = {
  title: 'Авторизация',
}

async function handleOnComplete(value: string) {
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (value === LocalStorage.getItem('code')) {
    await store.dispatch('Auth/setCode', value)
    await router.push({
      name: 'archive',
    })
  }
}

function main() {
  router = useRouter()
  store = useStore()
  useMeta(metaData)

  return {
    handleOnComplete,
  }
}

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Auth',
  components: {
    VOtpInput,
  },
  setup () {
    return main()
  },
})
</script>
