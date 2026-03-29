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
import {
  useMeta,
  useQuasar,
  LocalStorage,
  SessionStorage,
  QBtn,
  QChip,
  QPage,
  QCard,
  QTooltip,
} from 'quasar'
import { storeToRefs } from 'pinia'
import usePodStore from 'stores/pod'
import useAuthStore from 'stores/auth'
import useProfileStore from 'stores/profile'
import OIDCIssuerComponent from 'components/OIDCIssuerComponent.vue'
import {
  getDefaultSession,
  handleIncomingRedirect,
  login,
} from '@inrupt/solid-client-authn-browser'
import { parse } from '../helpers/markdownHelper'
import { EVENTS } from '@inrupt/solid-client-authn-core'

const $t = useI18n().t
const $q = useQuasar()
const router = useRouter()
const podStore = usePodStore()
const profileStore = useProfileStore()
const authStore = useAuthStore()

const { getOidcIssuer } = storeToRefs(podStore)

const metaData = {
  'title': $t('pages.create.title'),
  'og:title': $t('pages.create.title'),
}

const TOKEN_TYPE = 'DPoP'

const events = getDefaultSession().events

// eslint-disable-next-line @typescript-eslint/no-misused-promises
events.on(EVENTS.SESSION_RESTORED, async (urlString: string) => {
  const url = new URL(urlString)
  $q.sessionStorage.remove('connect')
  try {
    authStore.openIdHandleIncoming()
    await podStore.setResourceRootUrl()
    await router.push({
      path: url.pathname,
      replace: true,
    })
  } catch (e) {
    console.error(e)
  } finally {
    $q.loading.hide()
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
events.on(EVENTS.LOGIN, async () => {
  authStore.openIdHandleIncoming()
  try {
    await podStore.setResourceRootUrl()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Login Failed',
    })
    $q.loading.show()
    return
  } finally {
    $q.sessionStorage.remove('connect')
  }
  try {
    const { email, avatar } = await podStore.getProfileFOAF()
    if (email) {
      profileStore.consumerEmail(email)
    }
    if (avatar) {
      profileStore.consumerImg(avatar)
    }
  } catch (error) {
    console.error(error)
  } finally {
    $q.sessionStorage.set('restorePreviousSession', true)
  }
})

events.on(EVENTS.LOGOUT, () => {
  $q.sessionStorage.remove('connect')
  $q.sessionStorage.remove('restorePreviousSession')
})

events.on(EVENTS.ERROR, (error) => {
  console.error('Login error:', error)
})

interface AuthData {
  redirectUrl?: string
  oidcIssuer?: string
  restorePreviousSession?: boolean
}

async function solidAuth({
  redirectUrl = window.location.href,
  oidcIssuer = LocalStorage.getItem('oidcIssuer'),
  restorePreviousSession,
}: AuthData) {
  if (!oidcIssuer) {
    throw new Error('oidcIssuer empty')
  }
  if (!navigator.onLine) {
    return Promise.reject(new Error('Not onLine'))
  }
  let currentConnect = Number(SessionStorage.getItem('connect')) ?? 0
  SessionStorage.set('connect', ++currentConnect)
  if (currentConnect > 3) {
    return Promise.reject(
      new Error('Cannot connect: ' + String(currentConnect)),
    )
  }
  const defaultSession = getDefaultSession().info
  const sessionInfo = await handleIncomingRedirect({
    restorePreviousSession,
  })
  LocalStorage.set('oidcIssuer', oidcIssuer)
  if (!sessionInfo) {
    return login({
      oidcIssuer,
      tokenType: TOKEN_TYPE,
    })
  }
  const expiresDate = sessionInfo.expirationDate
  const nowDate = new Date()
  const isExpirationAlive =
    (sessionInfo.expirationDate && expiresDate.valueOf() < nowDate.valueOf()) ??
    false
  if (
    sessionInfo.isLoggedIn ||
    isExpirationAlive ||
    defaultSession.sessionId === sessionInfo.sessionId
  ) {
    console.warn('Session alive')
    window.location.href = window.location.origin
    return
  }
  return login({
    oidcIssuer,
    tokenType: TOKEN_TYPE,
  })
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

async function tryLogin() {
  try {
    $q.loading.show({
      message: $t('components.oidcIssuer.processing'),
      boxClass: $q.dark.isActive
        ? 'bg-black text-white'
        : 'bg-grey-2 text-grey-9',
      spinnerColor: 'primary',
    })
    await solidAuth({
      redirectUrl: window.location.href,
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
    await podStore.initPod()
    await podStore.setProfileFOAF()
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
