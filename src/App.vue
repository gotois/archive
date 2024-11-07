<template>
  <RouterView />
</template>
<script lang="ts">
import useAuth from 'stores/auth'
export default {
  preFetch() {
    const authStore = useAuth()
    if (authStore.tryAuth) {
      authStore.openIdHandleIncoming()
    }
  },
}
</script>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { RouterView } from 'vue-router'
import { useMeta, useQuasar } from 'quasar'
import { EVENTS } from '@inrupt/solid-client-authn-core'
import { getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { useRouter } from 'vue-router'
import usePodStore from 'stores/pod'
import useAuthStore from 'stores/auth'
import useProfileStore from 'stores/profile'
import useWalletStore from 'stores/wallet'
import useTutorialStore from 'stores/tutorial'
import { ROUTE_NAMES } from './router/routes'
import { getSolana } from './services/phantomWalletService'
import { WalletType } from './types/models'
import { isTWA } from './helpers/twaHelper'
import { viewport } from '@telegram-apps/sdk-vue'
import pkg from '../package.json'
import twaMinifest from '../twa-manifest.json'

const $t = useI18n().t
const $q = useQuasar()
const router = useRouter()
const podStore = usePodStore()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const walletStore = useWalletStore()
const tutorialStore = useTutorialStore()
const events = getDefaultSession().events

const webSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  'url': pkg.homepage,
  'thumbnailUrl': twaMinifest.iconUrl,
  'version': pkg.version,
  'creator': {
    '@type': 'Organization',
    ...pkg.author,
  },
  'publisher': pkg.author.name,
  'license': 'https://github.com/gotois/archive/blob/master/LICENSE',
  'potentialAction': {
    '@type': 'SearchAction',
    'target': pkg.homepage + 'search?name={query_string}',
    'query-input': 'required name=query_string',
  },
}
const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'url': pkg.author.url,
  'logo': 'https://avatars.githubusercontent.com/u/16117425',
  'location': {
    '@type': 'VirtualLocation',
    'url': 'https://app.aragon.org/#/daos/ethereum/gic.dao.eth',
  },
  'sameAs': ['https://github.com/gotois'],
  'founder': {
    '@type': 'Person',
    ...pkg.contributors[0],
  },
}
const metaData = {
  titleTemplate: (title: string) =>
    isTWA ? title : `${title} - archive.gotointeractive.com`,
  meta: {
    'keywords': { name: 'keywords', content: pkg.keywords.join(', ') },
    'equiv': {
      'http-equiv': 'Content-Type',
      'content': 'text/html; charset=UTF-8',
    },
    'theme-color': {
      name: 'theme-color',
      content: '#ffffff',
      media: '(prefers-color-scheme: light)',
    },
    'referrer': {
      name: 'referrer',
      content:
        window.location.hostname === 'localhost'
          ? 'no-referrer-when-downgrade'
          : 'strict-origin',
    },
  },
  script: {
    webSite: {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(webSite),
    },
    organization: {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(organization),
    },
  },
  noscript: {
    default: `<strong>${$t('navigation.noscript')}</strong>`,
  },
  link: {
    opensearch: {
      rel: 'search',
      type: 'application/opensearchdescription+xml',
      title: $t('opensearch.title'),
      href: pkg.homepage + 'opensearch.xml',
    },
  },
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
events.on(EVENTS.SESSION_RESTORED, async (urlString) => {
  const url = new URL(urlString)
  $q.sessionStorage.remove('connect')
  authStore.openIdHandleIncoming()
  try {
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
    const { name, email, avatar } = await podStore.getProfileFOAF()
    if (name) {
      profileStore.consumerName(name)
    }
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

const solana = getSolana()
if (solana) {
  solana.on('connect', (/*publicKey*/) => {
    console.warn('connected to phantom account')
  })
  solana.on('disconnect', () => {
    console.warn('Phantom disconnect')
    $q.notify({
      type: 'warning',
      message: $t('wallet.disconnected'),
    })
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  solana.on('accountChanged', async (publicKey: string) => {
    console.warn('accountChanged')
    await walletStore.setKeypare({
      publicKey: publicKey,
      type: WalletType.Phantom,
    })
    $q.notify({
      type: 'warning',
      message: $t('wallet.accountChanged'),
    })
  })
}

async function myAuth(): Promise<void> {
  // Считаем что вне нативного Telegram WebApp мы находимся в Telegram WebApp
  // Иначе проверяем все как следует
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (window?.Telegram?.WebApp?.platform === 'unknown') {
    authStore.hasTelegramWebApp = true
    $q.sessionStorage.set('telegramWebApp', true)
  } else {
    viewport.expand()
    await authStore.tgWebAppAuth()
  }
  tutorialStore.tutorialComplete(true)
  $q.loading.hide()
  return router.push({
    name: ROUTE_NAMES.CALENDAR,
  })
}

// check if Telegram Web Apps
// http://localhost:8080/?view=telegram
if (window.location.search.includes('view=telegram')) {
  $q.loading.show()

  if (window.Telegram) {
    myAuth()
      .then(() => {})
      .catch((error) => console.error(error))
  } else {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://telegram.org/js/telegram-web-app.js'
    script.onload = () => {
      myAuth()
        .then(() => {})
        .catch((error) => console.error(error))
    }
    script.onerror = () => {
      $q.notify({
        type: 'negative',
        message: 'WebApp script failed',
      })
      $q.loading.hide()
    }
    document.head.appendChild(script)
  }
}

useMeta(metaData)
</script>
