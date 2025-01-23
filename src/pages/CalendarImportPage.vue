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
            <QBtn label="Sync" @click="syncGoogleCalendar" />
            <QBtn label="Reset" @click="googleCode = null" />
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
import useContractStore from 'stores/contract'
import GoogleOAuth from 'components/GoogleOAuth.vue'
import rpc from '../helpers/rpc'
import {
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_LINK,
} from '../helpers/googleOAuthHelper'

const contractStore = useContractStore()
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
  await secretaryStore.ping()
  const events = await rpc('get-calendar-google', {
    code: googleCode.value,
    username: googleEmail.value,
  })
  // TODO после записи нужно сбрасывать queryString чтобы код не сохранялся
  // ...
  alert('WIP...')
  // TODO WIP настроить чтобы данные из caldav записывались в локальное хранилище
  console.log('WIP...', events)
  /* eslint-disable */
  // fixme
  const calendarEvents = events.credentialSubject.object.map((event: unknown) => {
    console.log('event', event)
    return event
    // return {
    //   id: event.id,
    //   start: date.formatDate(event.startTime, 'YYYY-MM-DD HH:mm'),
    //   end: event.endTime ? date.formatDate(event.endTime, 'YYYY-MM-DD HH:mm') : null,
    //   title: event.name,
    //   calendarId: 'google',
    //   description: event.description,
    //   // attaches // todo поддержать
    //   // tag: contract.tag, // todo поддержать
    //   organizer: {
    //     type: event.actor.type,
    //     email: event.actor.email,
    //   },
    //   // participant: event.target, // todo поддержать
    //   location: event.location,
    //   link: event.url,
    // }
  })
  console.log('calendarEvents', calendarEvents)
  for (const calendarEvent of calendarEvents) {
    await contractStore.insertContract({
      context: context,
      resolver: verifiedCredential.id,
      organizer: {
          type: calendarEvent.actor.type,
          email: calendarEvent.actor.email,
          name: verifiedCredential.credentialSubject.actor.name,
          url: verifiedCredential.credentialSubject.actor.url,
        },
        name: verifiedCredential.credentialSubject.object.name,
        description: verifiedCredential.credentialSubject.object.summary,
        issuanceDate: new Date(verifiedCredential.issuanceDate),
        issuer: verifiedCredential.issuer,
        participant: [
          {
            type: verifiedCredential.credentialSubject.target.type,
            name: verifiedCredential.credentialSubject.target.name,
            email: verifiedCredential.credentialSubject.target.email,
            telephone: verifiedCredential.credentialSubject.target.telephone,
            url: verifiedCredential.credentialSubject.target.url,
          },
        ],
        startTime: new Date(verifiedCredential.credentialSubject.startTime),
        endTime: verifiedCredential.credentialSubject.endTime
          ? new Date(verifiedCredential.credentialSubject.endTime)
          : null,
        type: Array.from(verifiedCredential.type),
        proof: {
          ...verifiedCredential.proof,
        },
        tag: Array.from(verifiedCredential.credentialSubject.object?.tag ?? []),
        attachment:
          verifiedCredential.credentialSubject.object.attachment?.map(
            (attach) => ({
              type: attach.type,
              name: attach.name,
              mediaType: attach.mediaType,
              url: attach.url,
            }),
          ) ?? [],
    })
  }
  /* eslint-enable */
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
