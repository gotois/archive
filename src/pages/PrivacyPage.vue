<template>
  <QPage>
    <QScrollArea visible class="absolute-full fit q-pl-md q-pr-md">
      <PrivacyComponent class="bg-transparent text-primary overflow-auto" />
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
<style scoped>
::v-deep(h1) {
  font-size: large;
  line-height: 1rem;
}
::v-deep(h2) {
  font-size: larger;
  line-height: 1rem;
}
::v-deep(h3) {
  font-size: medium;
  line-height: 1rem;
}
</style>
