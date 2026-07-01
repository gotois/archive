<template>
  <div>
    <QCard
      flat
      square
      :style="{
        paddingLeft: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
        paddingRight: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
      }"
    >
      <QCardSection>
        <div class="text-h6">GOOGLE CALENDAR</div>
      </QCardSection>
      <QCardSection horizontal>
        <template v-if="true">
          <template v-if="googleCode && consumerValid">
            <QBtn
              label="Sync"
              @click="syncGoogleCalendar"
            />
            <QBtn
              label="Reset"
              @click="googleCode = null"
            />
          </template>
          <QBtn
            v-else
            dense
            :href="GOOGLE_OAUTH_LINK"
            label="Open Google Calendar"
          />
        </template>
        <QInput
          v-model.trim="googleEmail"
          readonly
          class="block"
          name="email"
          type="email"
          color="secondary"
          :rules="['email']"
          :error-message="$t('consumer.emailRules')"
          autocomplete="off"
          :clearable="false"
          :fill-mask="true"
          :dense="$q.platform.is.desktop"
          lazy-rules
          hide-bottom-space
          :filled="!Boolean(googleEmail)"
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
      </QCardSection>
    </QCard>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'
import { QBtn, QCard, QCardSection, QIcon, QInput, patterns } from 'quasar'
import useSecretaryStore from 'stores/secretary'
import GoogleOAuth from 'components/GoogleOAuth.vue'
import {
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_LINK,
} from '../helpers/googleOAuthHelper'

const secretaryStore = useSecretaryStore()

const googleCode = ref<string>(null)
const googleEmail = ref<string>(null)
const consumerValid = computed(() => {
  return Boolean(patterns.testPattern.email(googleEmail.value))
})

async function syncGoogleCalendar() {
  if (!consumerValid.value) {
    console.warn('Invalid email')
    return
  }
  const headers = new Headers({
    'Content-Type': 'application/json',
  })
  if (secretaryStore.auth) {
    headers.set('Authorization', secretaryStore.auth)
  }
  const response = await fetch(import.meta.env.server + '/calendar/google', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      code: googleCode.value,
      username: googleEmail.value,
    }),
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('Failed to import Google Calendar')
  }
  const events = await response.json()
  // TODO: заменить этот прототип импорта на типизированный mapper. Сейчас берётся `event`,
  // а ниже сохраняются поля из постороннего `verifiedCredential`; импорт либо падает,
  // либо создаёт данные не из ответа Google.
  // TODO после записи нужно сбрасывать queryString чтобы код не сохранялся
  // ...
  alert('WIP...')
  // TODO WIP настроить чтобы данные из caldav записывались в локальное хранилище
  console.log('WIP...', events)
}

function handleCredentialResponse(res: { email: string }) {
  googleEmail.value = res.email
}

onMounted(() => {
  const searchParams = new URLSearchParams(window.location.search)
  const code = searchParams.get('code')
  if (code?.length) {
    console.log('OAuth code', code)
    googleCode.value = code
  }
})
</script>
