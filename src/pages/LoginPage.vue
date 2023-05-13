<template>
  <QPage class="flex column flex-center q-ma-md">
    <QCard
      flat
      square
      bordered
      class="q-pa-md"
      style="width: 400px"
      :class="{
        'full-width': $q.platform.is.mobile,
      }"
    >
      <template v-if="getOidcIssuer">
        <QChip
          class="full-width q-pl-none"
          color="transparent"
          :label="$t('login.oidcIssuer', { oidcIssuer: getOidcIssuer })"
          removable
          @remove="onRemove"
        />
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
        <OIDCIssuerComponent label="Адрес URL" @on-complete="onOnlineAuthorize">
          <QTooltip>
            {{ $t('login.oidcIssuerInput') }}
          </QTooltip>
        </OIDCIssuerComponent>
      </template>
    </QCard>
  </QPage>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import {
  Loading,
  SessionStorage,
  QBtn,
  QChip,
  QPage,
  QCard,
  QTooltip,
} from 'quasar'
import usePodStore from 'stores/pod'
import OIDCIssuerComponent from 'components/OIDCIssuerComponent.vue'
import solidAuth from '../services/authService'

const podStore = usePodStore()

const { getOidcIssuer } = storeToRefs(podStore)

function onRemove() {
  podStore.removeOIDCIssuer()
}

async function onLogin() {
  SessionStorage.remove('connect')
  await tryLogin()
}

async function tryLogin() {
  try {
    Loading.show({
      message: 'Идет аутентификация. Пожалуйста, подождите...',
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

function onOnlineAuthorize(oidcIssuer: string) {
  if (!oidcIssuer) {
    window.alert('OIDC Issuer cannot be empty')
    return
  }
  podStore.setOIDCIssuer(oidcIssuer)
}

onMounted(async () => {
  if (getOidcIssuer.value) {
    await tryLogin()
  }
})
</script>
