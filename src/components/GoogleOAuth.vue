<template>
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
<script lang="ts" setup>
import { onMounted } from 'vue'
import {
  googleSignInitialize,
  loadGoogleSignIn,
  GOOGLE_OAUTH_CLIENT_ID,
  GoogleHandlerResponse,
} from '../helpers/googleOAuthHelper'
import useLangStore from 'stores/lang'
import { parseJwt } from '../helpers/dataHelper'

const langStore = useLangStore()

const emit = defineEmits(['callback'])

function handleCredentialResponse(response: GoogleHandlerResponse) {
  const res = parseJwt(response.credential)
  emit('callback', res)
}

onMounted(async () => {
  try {
    await loadGoogleSignIn(langStore.language)
    await googleSignInitialize(handleCredentialResponse)
  } catch (error) {
    console.error(error)
  }
})
</script>
