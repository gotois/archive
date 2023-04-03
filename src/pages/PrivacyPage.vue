<template>
  <QPage>
    <QScrollArea visible class="absolute-full fit q-pl-md q-pr-md">
      <PrivacyComponent class="bg-white text-black-9 overflow-auto" />
    </QScrollArea>
  </QPage>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue'
import { useMeta, QScrollArea, QPage } from 'quasar'

const PrivacyComponent = defineAsyncComponent(
  () => import('components/PrivacyComponent.vue'),
)
const metaData = {
  'title': 'Пользовательское соглашение',
  'og:title': 'Пользовательское соглашение',
}

useMeta(metaData)
</script>
