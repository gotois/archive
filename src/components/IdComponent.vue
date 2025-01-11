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
    :autofocus="$q.platform.is.desktop"
    greedy
    @submit="emit('finish')"
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
      v-model.trim="getPersonLD.email"
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
    <QInput
      v-model.trim="getPersonLD.telephone"
      color="secondary"
      type="tel"
      mask="### ### ####"
      :fill-mask="true"
      outlined
      :clearable="true"
      stack-label
      :hide-hint="!$q.platform.is.desktop"
      :hide-bottom-space="!getPersonLD.telephone"
      :label="$t('consumer.phone')"
      :error-message="$t('consumer.phoneRules')"
      name="tel"
      autocomplete="on"
    >
      <template #prepend>
        <QIcon name="phone" />
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
import useLangStore from 'stores/lang'
import { isTWA } from '../helpers/twaHelper'
import { parseJwt } from '../helpers/dataHelper'
import { DIDTable } from '../types/models'
import { googleIdInit, googleClientId } from '../helpers/googleOAuthHelper'

const KeypairComponent = defineAsyncComponent(
  () => import('components/KeypairComponent.vue'),
)

const emit = defineEmits(['finish'])
const $q = useQuasar()
const i18n = useI18n()
const $t = i18n.t
const profileStore = useProfileStore()
const langStore = useLangStore()

const useGoogleId = ref(false)
const { did, getPersonLD, email } = storeToRefs(profileStore)

const consumerValid = computed(() => {
  return Boolean(
    getPersonLD.value.name.length > 3 &&
      patterns.testPattern.email(email.value) &&
      did.value,
  )
})

function handleCredentialResponse(response: { credential: string }) {
  const value = parseJwt(response.credential)
  email.value = value.email
  emit('finish')
}

function onKeyDID(key: DIDTable) {
  profileStore.consumerDID(key.id)
}

onMounted(async () => {
  if (navigator.onLine && isTWA) {
    $q.loading.show()
    try {
      useGoogleId.value = true
      await googleIdInit(langStore.language, handleCredentialResponse)
    } catch (error) {
      console.error(error)
    } finally {
      $q.loading.hide()
    }
  }
})
</script>
