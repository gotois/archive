<template>
  <RouterView />
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
import { RouterView } from 'vue-router'
import { useMeta, useQuasar } from 'quasar'
import { EVENTS } from '@inrupt/solid-client-authn-core'
import { getDefaultSession } from '@inrupt/solid-client-authn-browser/src/defaultSession'
import { useRouter } from 'vue-router'
import usePodStore from 'stores/pod'
import useAuthStore from 'stores/auth'
import useProfileStore from 'stores/profile'

const $q = useQuasar()
const router = useRouter()
const podStore = usePodStore()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const events = getDefaultSession().events

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
  if (!profileStore.getConsumer) {
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
