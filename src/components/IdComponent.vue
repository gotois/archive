<template>
  <template v-if="useGoogleId">
    <div
      id="g_id_onload"
      :data-client_id="googleClientId"
      data-context="signin"
      data-ux_mode="popup"
      data-callback="handleCredentialResponse"
      data-auto_prompt="false"
    >
    </div>
    <div
      class="g_id_signin"
      data-type="standard"
      data-shape="rectangular"
      :data-theme="$q.dark.isActive ? 'filled_black' : 'outline'"
      data-text="signin_with"
      data-ux_mode="popup"
      data-width="400px"
      data-size="large"
      data-logo_alignment="left"
    >
    </div>
  </template>
  <QForm
    v-else
    ref="nameForm"
    class="q-gutter-md q-mt-md"
    autocapitalize="off"
    autocomplete="off"
    autofocus
    greedy
    @submit="$emit('finish')"
  >
    <QInput
      v-model.trim="consumer"
      :label="$t('consumer.type')"
      :rules="[(val) => val && val.length > 3]"
      name="consumer"
      type="text"
      autocomplete="on"
      autofocus
      :error-message="$t('consumer.rules')"
      outlined
      no-error-icon
      @focus="(e) => e.target.scrollIntoView()"
    >
      <template #prepend>
        <QIcon name="face" />
      </template>
    </QInput>
    <QInput
      v-model.trim="email"
      :label="$t('consumer.email')"
      name="email"
      type="email"
      :rules="['email']"
      :error-message="$t('consumer.emailRules')"
      autocomplete="off"
      lazy-rules
      no-error-icon
      outlined
    >
      <template #prepend>
        <QIcon name="email" />
      </template>
    </QInput>
    <QStepperNavigation class="q-pa-md no-margin">
      <QBtn
        color="accent"
        type="submit"
        square
        :disable="!consumerValid"
        :label="$t('tutorial.data.ok')"
        :class="{
          'full-width': !$q.platform.is.desktop,
        }"
        :dense="$q.platform.is.desktop"
        :loading="$q.loading.isActive"
        icon="login"
      />
      <PodImporter v-if="isLoggedIn" class="q-ml-md" />
    </QStepperNavigation>
  </QForm>
</template>
<script lang="ts" setup>
import { ref, defineAsyncComponent, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useQuasar,
  QBtn,
  QForm,
  QIcon,
  QInput,
  QStepperNavigation,
  patterns,
} from 'quasar'
import { storeToRefs } from 'pinia'
import useProfileStore from 'stores/profile'
import useAuthStore from 'stores/auth'
import { isTWA } from '../helpers/twaHelper'
import { parseJwt } from '../helpers/dataHelper'

const PodImporter = defineAsyncComponent(
  () => import('components/PodImporter.vue'),
)

const emit = defineEmits(['finish'])
const $q = useQuasar()
const locale = useI18n().locale
const profileStore = useProfileStore()
const authStore = useAuthStore()

const useGoogleId = ref(false)
const { consumer, email } = storeToRefs(profileStore)
const { isLoggedIn } = storeToRefs(authStore)

const googleClientId = computed(() => process.env.google_client_id)
const consumerValid = computed(() => {
  return Boolean(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    consumer.value.length > 3 && patterns.testPattern.email(email.value),
  )
})

function handleCredentialResponse(response: { credential: string }) {
  const value = parseJwt(response.credential) as { name: string; email: string }
  consumer.value = value.name
  email.value = value.email
  emit('finish')
}

function loadGoogleId(): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const lang = locale.value.replace(/-.+/, '')
    const googleid = document.createElement('script')
    googleid.setAttribute(
      'src',
      'https://accounts.google.com/gsi/client?hl=' + lang,
    )
    googleid.defer = true
    document.head.appendChild(googleid)
    googleid.onerror = () => {
      reject()
    }
    googleid.onload = () => {
      resolve(window.google)
    }
  })
}

// https://developers.google.com/identity/gsi/web/reference/html-reference
async function googleIdInit() {
  const google = await loadGoogleId()
  window.handleCredentialResponse = handleCredentialResponse
  useGoogleId.value = true
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  google.accounts.id.initialize({
    client_id: googleClientId.value,
    auto_select: true,
    cancel_on_tap_outside: true,
    callback: handleCredentialResponse,
    ux_mode: 'popup',
    itp_support: true,
    context: 'signin',
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  google.accounts.id.prompt((notification: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      // continue with another identity provider.
      useGoogleId.value = false
      return false
    }
    return true
  })
}

onMounted(async () => {
  if (navigator.onLine && googleClientId.value && isTWA) {
    $q.loading.show()
    await googleIdInit()
    $q.loading.hide()
  }
})
</script>
