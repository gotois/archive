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
        <OIDCIssuerComponent
          :label="$t('components.oidcIssuer.label')"
          @on-complete="onOnlineAuthorize"
        >
          <QTooltip>
            {{ $t('components.oidcIssuer.input') }}
          </QTooltip>
        </OIDCIssuerComponent>
      </template>
    </QCard>
  </QPage>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useMeta, useQuasar, QBtn, QChip, QPage, QCard, QTooltip } from 'quasar'
import { storeToRefs } from 'pinia'
import usePodStore from 'stores/pod'
import OIDCIssuerComponent from 'components/OIDCIssuerComponent.vue'
import solidAuth from '../services/authService'

const $t = useI18n().t
const $q = useQuasar()
const router = useRouter()

const podStore = usePodStore()

const { getOidcIssuer } = storeToRefs(podStore)

const metaData = {
  'title': $t('pages.create.title'),
  'og:title': $t('pages.create.title'),
}

function onRemove() {
  podStore.removeOIDCIssuer()
}

async function onLogin() {
  $q.sessionStorage.remove('connect')
  await tryLogin()
}

async function tryLogin(redirectUrl = window.location.origin) {
  try {
    $q.loading.show({
      message: $t('components.oidcIssuer.processing'),
      boxClass: $q.dark.isActive
        ? 'bg-black text-white'
        : 'bg-grey-2 text-grey-9',
      spinnerColor: 'primary',
    })
    await solidAuth({
      redirectUrl,
      oidcIssuer: getOidcIssuer.value,
      restorePreviousSession: false,
    })
  } catch (error) {
    console.error(error)
    $q.sessionStorage.remove('restorePreviousSession')
  } finally {
    $q.loading.hide()
  }
}

function onOnlineAuthorize(oidcIssuer: string) {
  if (!oidcIssuer) {
    $q.notify({
      type: 'negative',
      message: $t('components.oidcIssuer.fail'),
    })
    return
  }
  podStore.setOIDCIssuer(oidcIssuer)
}

onMounted(async () => {
  if (getOidcIssuer.value) {
    await tryLogin(
      router.currentRoute.value.query.fullPath
        ? window.location.origin +
            String(router.currentRoute.value.query.fullPath)
        : null,
    )
  }
})

useMeta(metaData)
</script>
