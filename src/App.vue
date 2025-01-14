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
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterView } from 'vue-router'
import { useMeta, useQuasar } from 'quasar'
import { init, viewport } from '@telegram-apps/sdk'
import { EVENTS } from '@inrupt/solid-client-authn-core'
import { getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { useRouter } from 'vue-router'
import usePodStore from 'stores/pod'
import useAuthStore from 'stores/auth'
import useProfileStore from 'stores/profile'
import useWalletStore from 'stores/wallet'
import useSecretaryStore from 'stores/secretary'
import { getSolana } from './services/phantomWalletService'
import { WalletType } from './types/models'
import { isTWA, isTMA } from './helpers/twaHelper'
import pkg from '../package.json'
import twaMinifest from '../twa-manifest.json'

const $t = useI18n().t
const $q = useQuasar()
const router = useRouter()
const podStore = usePodStore()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const walletStore = useWalletStore()
const secretaryStore = useSecretaryStore()
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

if (isTMA) {
  init()
  viewport.expand()
} else {
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
}

onMounted(async () => {
  if (isTMA) {
    try {
      await secretaryStore.authorizationByTg()
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: error.message as string,
      })
    }
  }
})

useMeta(metaData)
</script>
