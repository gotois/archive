<template>
  <div>
    <div>
      <a :href="googleOAuthLink">Open Google Calendar</a>
    </div>
    <QBtn label="Google calendar Sync" @click="syncGoogleCalendar" />
  </div>
</template>
<script lang="ts" setup>
import { LocalStorage, QBtn } from 'quasar'

const GOOGLE_OAUTH_CLIENT_ID = process.env.google_client_id
const GOOGLE_REDIRECT_URI = process.env.google_redirect_uri

const googleOAuthLink =
  'https://accounts.google.com/o/oauth2/v2/auth?client_id=' +
  GOOGLE_OAUTH_CLIENT_ID +
  '&redirect_uri=' +
  encodeURIComponent(GOOGLE_REDIRECT_URI) +
  '&response_type=code&scope=' +
  encodeURIComponent('https://www.googleapis.com/auth/calendar') +
  '&access_type=offline&prompt=consent'

// todo перенсти это на сервер Секретаря
async function getOauthToken(code: string) {
  const clientSecret = '4pKDv4cysrJjh_lrVp6rJhqT'
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code: code,
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      client_secret: clientSecret,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })
  return await response.json()
}

// TODO делать запрос к секретарю через JRPC-2 чтобы получать события от секретаря
async function syncGoogleCalendar() {
  const searchParams = new URLSearchParams(window.location.search)
  const code = searchParams.get('code')
  console.log('OAuth code', code)
  if (code?.length) {
    const data = (await getOauthToken(code)) as {
      expires_in: number
      refresh_token: string
    }
    console.log('OAuth data:', data)
    if (data.refresh_token) {
      LocalStorage.setItem('refresh_token', data.refresh_token)
    }
  }
}
</script>
