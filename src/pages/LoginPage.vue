<template>
  <QPage class="flex column q-ma-md">
    <p>OIDC Issuer: {{ getOidcIssuer }}</p>
    <QBtn
      color="accent"
      label="Push to Login"
      :disable="loading"
      :loading="loading"
      square
      glossy
      push
      unelevated
      no-caps
      @click="onLogin"
    />
  </QPage>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Loading, SessionStorage, QBtn, QPage } from 'quasar'
import usePodStore from 'stores/pod'
import solidAuth from '../services/authHelper'

const podStore = usePodStore()

const loading = ref(false)
const { getOidcIssuer } = storeToRefs(podStore)

async function onLogin() {
  SessionStorage.remove('connect')
  await tryLogin()
}

async function tryLogin() {
  try {
    loading.value = true
    await solidAuth({
      redirectUrl: window.location.origin,
      oidcIssuer: getOidcIssuer.value,
      restorePreviousSession: false,
    })
  } catch (e) {
    console.error(e)
    SessionStorage.remove('restorePreviousSession')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  Loading.show()
  await tryLogin()
  Loading.hide()
})
</script>
