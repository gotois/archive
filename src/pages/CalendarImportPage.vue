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
        <QBtn
          v-if="!googleCode"
          :href="googleOAuthLink"
          label="Open Google Calendar"
        />
        <template v-else>
          <QBtn label="Sync" @click="syncGoogleCalendar" />
          <QBtn label="Reset" @click="googleCode = null" />
        </template>
      </QCardSection>
    </QCard>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { QBtn, QCard, QCardSection } from 'quasar'
import rpc from '../helpers/rpc'
import useSecretaryStore from 'stores/secretary'

const secretaryStore = useSecretaryStore()

const googleCode = ref<string>(null)

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
    username: 'YOUR_EMAIL@gmail.com', // fixme поддержать пользователя из запроса
  })
  // TODO после записи нужно сбрасывать queryString чтобы код не сохранялся
  // ...
  // TODO WIP настроить чтобы данные из caldav записывались в локальное хранилище
  console.log('WIP...', events)
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
