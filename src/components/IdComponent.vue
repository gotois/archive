<template>
  <QForm
    ref="nameForm"
    class="q-gutter-md"
    autocapitalize="off"
    autocomplete="off"
    :autofocus="$q.platform.is.desktop"
    greedy
    @submit="emit('complete')"
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
      v-model.trim="email"
      name="email"
      type="email"
      color="secondary"
      :rules="['email']"
      :error-message="$t('consumer.emailRules')"
      autocomplete="off"
      :clearable="true"
      :fill-mask="true"
      :dense="$q.platform.is.desktop"
      lazy-rules
      :hide-bottom-space="!email"
      :filled="Boolean(email)"
      :label="$t('consumer.email')"
      square
      outlined
      no-error-icon
    >
      <template #before>
        <template v-if="GOOGLE_OAUTH_CLIENT_ID">
          <div
            id="g_id_onload"
            :data-client_id="GOOGLE_OAUTH_CLIENT_ID"
            data-use_fedcm_for_prompt="true"
            data-context="signin"
            data-ux_mode="popup"
            data-callback="handleCredentialResponse"
            data-width="200"
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
            data-width="200"
            data-size="large"
            data-logo_alignment="left"
          >
          </div>
        </template>
      </template>
      <template #prepend>
        <QIcon name="email" />
      </template>
    </QInput>
    <!-- todo заменить на vue3-q-tel-input
    <QInput
      v-model.trim="phone"
      name="tel"
      type="tel"
      color="secondary"
      :error-message="$t('consumer.phoneRules')"
      autocomplete="off"
      :clearable="true"
      :fill-mask="true"
      stack-label
      :dense="$q.platform.is.desktop"
      :hide-bottom-space="!phone"
      :filled="Boolean(phone)"
      :label="$t('consumer.phone')"
      square
      outlined
      no-error-icon
    >
      <template #prepend>
        <QIcon name="phone" />
      </template>
    </QInput-->
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
import { computed, defineAsyncComponent, onMounted } from 'vue'
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
import useLangStore from 'stores/lang'
import { parseJwt } from '../helpers/dataHelper'
import { DIDTable } from '../types/models'
import {
  googleSignInitialize,
  loadGoogleSignIn,
  GOOGLE_OAUTH_CLIENT_ID,
  GoogleHandlerResponse,
} from '../helpers/googleOAuthHelper'

const KeypairComponent = defineAsyncComponent(
  () => import('components/KeypairComponent.vue'),
)

const emit = defineEmits(['complete'])
const $q = useQuasar()
const i18n = useI18n()
const $t = i18n.t
const profileStore = useProfileStore()
const langStore = useLangStore()

const { did, getPersonLD, email } = storeToRefs(profileStore)

const consumerValid = computed(() => {
  return Boolean(
    getPersonLD.value.name.length > 3 &&
      patterns.testPattern.email(email.value) &&
      did.value,
  )
})

function handleCredentialResponse(response: GoogleHandlerResponse) {
  const res = parseJwt(response.credential)
  profileStore.consumerEmail(res.email)
  email.value = res.email
}

function onKeyDID(key: DIDTable) {
  profileStore.consumerDID(key.id)
}

onMounted(async () => {
  if (navigator.onLine) {
    $q.loading.show()
    try {
      await loadGoogleSignIn(langStore.language)
      await googleSignInitialize(handleCredentialResponse)
    } catch (error) {
      console.error(error)
    } finally {
      $q.loading.hide()
    }
  }
})
</script>
