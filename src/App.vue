<template>
  <router-view />
</template>
<script lang="ts">
import useAuth from 'stores/auth'
export default {
  preFetch() {
    const authStore = useAuth()
    authStore.openIdHandleIncoming()
  },
}
</script>
<script lang="ts" setup>
import { useMeta, Loading, SessionStorage } from 'quasar'
import { EVENTS, events } from '@inrupt/solid-client-authn-browser'
import { useRouter } from 'vue-router'
import usePodStore from 'stores/pod'
import useAuthStore from 'stores/auth'

const router = useRouter()
const podStore = usePodStore()
const authStore = useAuthStore()

const metaData = {
  meta: {
    keywords: { name: 'keywords', content: 'Ваша база договоров' },
    equiv: {
      'http-equiv': 'Content-Type',
      'content': 'text/html; charset=UTF-8',
    },
  },
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
events().on(EVENTS.SESSION_RESTORED, async (urlString) => {
  SessionStorage.remove('connect')
  const url = new URL(urlString)
  authStore.openIdHandleIncoming()
  await podStore.setResourceRootUrl()
  await router.push({
    path: url.pathname,
    replace: true,
  })
  Loading.hide()
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
events().on(EVENTS.LOGIN, async () => {
  authStore.openIdHandleIncoming()
  await podStore.setResourceRootUrl()
  SessionStorage.remove('connect')
  SessionStorage.set('restorePreviousSession', true)
})

events().on(EVENTS.LOGOUT, () => {
  SessionStorage.remove('connect')
  SessionStorage.remove('restorePreviousSession')
})

events().on(EVENTS.ERROR, (error) => {
  console.log('authn error: ', error)
})

useMeta(metaData)
</script>
