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
      <QCardSection>
        <template v-if="consumerValid">
          <QBtn
            v-if="!googleCode"
            :href="googleOAuthLink"
            label="Open Google Calendar"
          />
          <template v-else>
            <QBtn label="Sync" @click="syncGoogleCalendar" />
            <QBtn label="Reset" @click="googleCode = null" />
          </template>
        </template>
        <QInput
          v-model.trim="googleEmail"
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
import rpc from '../helpers/rpc'
import useSecretaryStore from 'stores/secretary'
import GoogleOAuth from 'components/GoogleOAuth.vue'
import { GOOGLE_OAUTH_CLIENT_ID } from '../helpers/googleOAuthHelper'

const secretaryStore = useSecretaryStore()

const googleCode = ref<string>(null)
const googleEmail = ref<string>(null)
const consumerValid = computed(() => {
  return Boolean(patterns.testPattern.email(googleEmail.value))
})

const googleOAuthLink =
  'https://accounts.google.com/o/oauth2/v2/auth?client_id=' +
  process.env.google_client_id +
  '&redirect_uri=' +
  encodeURIComponent(process.env.google_redirect_uri) +
  '&response_type=code&scope=' +
  encodeURIComponent('https://www.googleapis.com/auth/calendar') +
  '&access_type=offline&prompt=consent'

async function syncGoogleCalendar() {
  await secretaryStore.ping()
  const events = await rpc('get-calendar-google', {
    code: googleCode.value,
    username: googleEmail.value,
  })
  // TODO после записи нужно сбрасывать queryString чтобы код не сохранялся
  // ...
  // TODO WIP настроить чтобы данные из caldav записывались в локальное хранилище
  console.log('WIP...', events)
}

function handleCredentialResponse(res: { email: string }) {
  googleEmail.value = res.email
}

onMounted(() => {
  const searchParams = new URLSearchParams(window.location.search)
  const code = searchParams.get('code')
  console.log('OAuth code', code)
  if (code?.length) {
    googleCode.value = code
  }
})
</script>
