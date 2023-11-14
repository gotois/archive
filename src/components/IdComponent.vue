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
    class="q-gutter-md"
    autocapitalize="off"
    autocomplete="off"
    autofocus
    greedy
    @submit="$emit('finish')"
  >
    <QInput
      v-if="did"
      :hint="$t('tutorial.data.hint')"
      :hide-hint="Boolean(did)"
      :model-value="did"
      color="secondary"
      :dense="$q.platform.is.desktop"
      readonly
      hide-bottom-space
    />
    <KeypairComponent v-else @on-key="onKeyDID" />
    <QInput
      v-model.trim="consumer"
      :label="$t('consumer.type')"
      :rules="[(val) => val && val.length > 3]"
      name="consumer"
      type="text"
      autocomplete="on"
      color="secondary"
      autofocus
      :error-message="$t('consumer.rules')"
      :dense="$q.platform.is.desktop"
      square
      hide-bottom-space
      filled
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
      color="secondary"
      :rules="['email']"
      :error-message="$t('consumer.emailRules')"
      autocomplete="off"
      :dense="$q.platform.is.desktop"
      lazy-rules
      hide-bottom-space
      square
      filled
      outlined
      no-error-icon
    >
      <template #prepend>
        <QIcon name="email" />
      </template>
    </QInput>
    <QStepperNavigation class="no-margin q-pt-md q-pl-md">
      <QBtn
        color="accent"
        type="submit"
        :disable="!consumerValid"
        :label="$t('tutorial.data.ok')"
        :class="{
          'full-width': !$q.platform.is.desktop,
        }"
        :loading="$q.loading.isActive"
        icon="login"
      />
    </QStepperNavigation>
  </QForm>
</template>
<script lang="ts" setup>
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
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
import { isTWA } from '../helpers/twaHelper'
import { parseJwt } from '../helpers/dataHelper'
import { DIDTable } from '../types/models'

const KeypairComponent = defineAsyncComponent(
  () => import('components/KeypairComponent.vue'),
)

const emit = defineEmits(['finish'])
const $q = useQuasar()
const { locale } = useI18n()
const $t = useI18n().t
const profileStore = useProfileStore()

const useGoogleId = ref(false)
const { did, consumer, email } = storeToRefs(profileStore)

const googleClientId = computed(() => process.env.google_client_id)
const consumerValid = computed(() => {
  return Boolean(
    consumer.value.length > 3 &&
      patterns.testPattern.email(email.value) &&
      did.value,
  )
})

function handleCredentialResponse(response: { credential: string }) {
  const value = parseJwt(response.credential) as { name: string; email: string }
  consumer.value = value.name
  email.value = value.email
  emit('finish')
}

function onKeyDID(key: DIDTable) {
  profileStore.consumerDID(key.id)
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
