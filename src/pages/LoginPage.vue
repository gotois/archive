<template>
  <QPage class="flex column q-ma-md">
    <template v-if="getOidcIssuer">
      <p>{{ $t('login.oidcIssuer', { oidcIssuer: getOidcIssuer }) }}</p>
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
    </template>
    <template v-else>
      <p>{{ $t('login.oidcIssuerInput') }}</p>
      <OIDCIssuerComponent @on-complete="onOnlineAuthorize" />
    </template>
  </QPage>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Loading, SessionStorage, QBtn, QPage } from 'quasar'
import usePodStore from 'stores/pod'
import OIDCIssuerComponent from 'components/OIDCIssuerComponent.vue'
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
    Loading.hide()
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (getOidcIssuer.value) {
    Loading.show({
      message: 'Идет авторизация. Пожалуйста, подождите...',
      boxClass: 'bg-grey-2 text-grey-9',
      spinnerColor: 'primary',
    })
    await tryLogin()
  }
})

function onOnlineAuthorize(oidcIssuer: string) {
  podStore.setOIDCIssuer(oidcIssuer)
}
</script>
