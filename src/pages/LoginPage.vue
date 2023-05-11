<template>
  <QPage class="flex column flex-center q-ma-md">
    <QCard flat square bordered class="q-pa-md" style="width: 400px">
      <template v-if="getOidcIssuer">
        <p>{{ $t('login.oidcIssuer', { oidcIssuer: getOidcIssuer }) }}</p>
        <QBtn
          color="accent"
          :label="$t('login.authentication')"
          :disable="$q.loading.isActive"
          :loading="$q.loading.isActive"
          square
          glossy
          push
          unelevated
          no-caps
          class="full-width"
          @click="onLogin"
        />
      </template>
      <template v-else>
        <p>{{ $t('login.oidcIssuerInput') }}</p>
        <OIDCIssuerComponent @on-complete="onOnlineAuthorize" />
      </template>
    </QCard>
  </QPage>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Loading, SessionStorage, QBtn, QPage, QCard } from 'quasar'
import usePodStore from 'stores/pod'
import OIDCIssuerComponent from 'components/OIDCIssuerComponent.vue'
import solidAuth from '../services/authHelper'

const podStore = usePodStore()

const { getOidcIssuer } = storeToRefs(podStore)

async function onLogin() {
  SessionStorage.remove('connect')
  await tryLogin()
}

async function tryLogin() {
  try {
    Loading.show({
      message: 'Идет авторизация. Пожалуйста, подождите...',
      boxClass: 'bg-grey-2 text-grey-9',
      spinnerColor: 'primary',
    })
    await solidAuth({
      redirectUrl: window.location.origin,
      oidcIssuer: getOidcIssuer.value,
      restorePreviousSession: false,
    })
  } catch (e) {
    console.error(e)
    SessionStorage.remove('restorePreviousSession')
  } finally {
    Loading.hide()
  }
}

onMounted(async () => {
  if (getOidcIssuer.value) {
    await tryLogin()
  }
})

function onOnlineAuthorize(oidcIssuer: string) {
  podStore.setOIDCIssuer(oidcIssuer)
}
</script>
