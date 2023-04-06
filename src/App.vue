<template>
  <router-view />
</template>
<script lang="ts" setup>
import { useMeta, Loading, LocalStorage } from 'quasar'
import { onLogin, onSessionRestore } from '@inrupt/solid-client-authn-browser'
import { preFetch } from 'quasar/wrappers'
import usePodStore from 'stores/pod'
import useAuthStore from 'stores/auth'
import { useRouter } from 'vue-router'

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

onSessionRestore(async (urlString) => {
  const url = new URL(urlString)
  await authStore.openIdHandleIncoming()
  await podStore.setResourceRootUrl()
  await router.push({ path: url.pathname, replace: true })
  Loading.hide()
})

onLogin(async () => {
  await authStore.openIdHandleIncoming()
  await podStore.setResourceRootUrl()
  LocalStorage.set('restorePreviousSession', true)
})

useMeta(metaData)
void preFetch(async () => {
  await authStore.openIdHandleIncoming()
})()
</script>
