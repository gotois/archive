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
      <p class="text-h4">
        {{ $t('tutorial.oidc.title') }}
      </p>
      <p class="text-caption">
        {{ $t('tutorial.oidc.caption') }}
      </p>
      <div
        class="text-body1"
        style="white-space: break-spaces"
        v-html="parse($t('tutorial.oidc.body'))"
      >
      </div>

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
            {{ $t('oidc.tutorialHint') }}
          </QTooltip>
        </OIDCIssuerComponent>
      </template>
    </QCard>
  </QPage>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useMeta, useQuasar, QBtn, QChip, QPage, QCard, QTooltip } from 'quasar'
import { storeToRefs } from 'pinia'
import usePodStore from 'stores/pod'
import OIDCIssuerComponent from 'components/OIDCIssuerComponent.vue'
import solidAuth from '../services/authService'
import { parse } from '../helpers/markdownHelper'

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
  $q.sessionStorage.remove('restorePreviousSession')
  $q.sessionStorage.remove('oidcIssuer')
  await tryLogin()
}

async function tryLogin(
  redirectUrl = window.location.origin +
    String(router.currentRoute.value.query.fullPath ?? ''),
) {
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

async function onOnlineAuthorize(oidcIssuer: string) {
  if (!oidcIssuer) {
    $q.notify({
      type: 'negative',
      message: $t('components.oidcIssuer.fail'),
    })
    const dialog = $q.dialog({
      message: $t('components.oidcIssuer.authorizeDialog.message'),
      cancel: true,
      persistent: true,
    })
    dialog.onOk(() => {
      alert('ok')
    })
    return
  }
  $q.loading.show()
  $q.sessionStorage.remove('connect')
  const redirectUrl = window.location.origin + window.location.pathname
  try {
    await solidAuth({
      redirectUrl: redirectUrl,
      oidcIssuer: oidcIssuer,
      restorePreviousSession: false,
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      color: 'negative',
      message: $t('components.oidcIssuer.authorizeDialog.fail'),
    })
  } finally {
    $q.loading.hide()
  }

  podStore.setOIDCIssuer(oidcIssuer)
}

useMeta(metaData)
</script>
