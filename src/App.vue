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
import { RouterView } from 'vue-router'
import { useMeta, useQuasar } from 'quasar'
import { EVENTS } from '@inrupt/solid-client-authn-core'
import { getDefaultSession } from '@inrupt/solid-client-authn-browser/src/defaultSession'
import { useRouter } from 'vue-router'
import usePodStore from 'stores/pod'
import useAuthStore from 'stores/auth'
import useProfileStore from 'stores/profile'
import pkg from '../package.json'
import twaMinifest from '../twa-manifest.json'
import { isTWA } from './helpers/twaHelper'

const $q = useQuasar()
const router = useRouter()
const podStore = usePodStore()
const authStore = useAuthStore()
const profileStore = useProfileStore()
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
    default: '<strong>Включите JavaScript для запуска приложения.</strong>',
  },
  link: {
    opensearch: {
      rel: 'search',
      type: 'application/opensearchdescription+xml',
      title: 'Поиск по архиву договоров',
      href: pkg.homepage + 'opensearch.xml',
    },
  },
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
events.on(EVENTS.SESSION_RESTORED, async (urlString) => {
  $q.sessionStorage.remove('connect')
  const url = new URL(urlString)
  authStore.openIdHandleIncoming()
  await podStore.setResourceRootUrl()
  await router.push({
    path: url.pathname,
    replace: true,
  })
  $q.loading.hide()
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
events.on(EVENTS.LOGIN, async () => {
  authStore.openIdHandleIncoming()
  await podStore.setResourceRootUrl()
  const { name } = profileStore.getPersonLD
  if (!name) {
    const profileName = await podStore.getProfileName()
    profileStore.consumerName(profileName)
  }
  $q.sessionStorage.remove('connect')
  $q.sessionStorage.set('restorePreviousSession', true)
})

events.on(EVENTS.LOGOUT, () => {
  $q.sessionStorage.remove('connect')
  $q.sessionStorage.remove('restorePreviousSession')
})

events.on(EVENTS.ERROR, (error) => {
  console.error('Login error:', error)
})

useMeta(metaData)
</script>
