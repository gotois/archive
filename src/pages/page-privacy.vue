<template>
  <q-page>
    <q-scroll-area visible class="absolute-full fit q-pl-md q-pr-md">
      <privacy-component class="bg-white text-black-9 overflow-auto" />
    </q-scroll-area>
  </q-page>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue'
import { useMeta } from 'quasar'

const PrivacyComponent = defineAsyncComponent(
  () => import('components/PrivacyComponent.vue'),
)
const metaData = {
  'title': 'Пользовательское соглашение',
  'og:title': 'Пользовательское соглашение',
}

useMeta(metaData)
</script>
