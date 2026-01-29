import { useQuasar } from 'quasar'
import { boot } from 'quasar/wrappers'
import { useRouter } from 'vue-router'
import { EVENTS } from '@inrupt/solid-client-authn-core'
import { getDefaultSession } from '@inrupt/solid-client-authn-browser'
import useAuthStore from 'stores/auth'
import usePodStore from 'stores/pod'
import useProfileStore from 'stores/profile'

export default boot(() => {
  const $q = useQuasar()
  const router = useRouter()

  const podStore = usePodStore()
  const profileStore = useProfileStore()
  const authStore = useAuthStore()

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
})
