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
      v-if="webId"
      :hint="$t('tutorial.data.hint')"
      :hide-hint="Boolean(webId)"
      :model-value="webId"
      color="secondary"
      :dense="$q.platform.is.desktop"
      readonly
      hide-bottom-space
    />
    <KeypairComponent v-else @key="uploadKey" />
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
      hide-bottom-space
      :filled="!Boolean(email)"
      :label="$t('consumer.email')"
      square
      outlined
      no-error-icon
    >
      <template #before>
        <GoogleOAuth
          v-if="GOOGLE_OAUTH_CLIENT_ID"
          @callback="handleCredentialResponse"
        />
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
        :label="$t('tutorial.data.submit')"
        :class="{
          'full-width': !$q.platform.is.desktop,
        }"
        :loading="$q.loading.isActive"
        icon-right="app_registration"
      />
    </QStepperNavigation>
  </QForm>
</template>
<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue'
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
import GoogleOAuth from 'components/GoogleOAuth.vue'
import { DIDTable } from '../types/models'
import { GOOGLE_OAUTH_CLIENT_ID } from '../helpers/googleOAuthHelper'

const KeypairComponent = defineAsyncComponent(
  () => import('components/KeypairComponent.vue'),
)

const emit = defineEmits(['complete'])
const $q = useQuasar()
const i18n = useI18n()
const $t = i18n.t
const profileStore = useProfileStore()

const { webId, getPersonLD, email } = storeToRefs(profileStore)

const consumerValid = computed(() => {
  return Boolean(
    getPersonLD.value.name.length > 3 &&
      patterns.testPattern.email(email.value) &&
      webId.value,
  )
})

function handleCredentialResponse(res: { email: string }) {
  profileStore.consumerEmail(res.email)
  email.value = res.email
}

function uploadKey(key: DIDTable) {
  console.log(key)
}
</script>
