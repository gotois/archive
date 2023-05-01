<template>
  <h1>Login page</h1>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import { SessionStorage } from 'quasar'
import { useRouter } from 'vue-router'
import solidAuth from '../services/authHelper'

const router = useRouter()

async function login() {
  try {
    await solidAuth({})
    await router.push({
      path: '/',
    })
  } catch (e) {
    console.error(e)
    SessionStorage.remove('restorePreviousSession')
  }
}

onMounted(async () => {
  await login()
})
</script>
