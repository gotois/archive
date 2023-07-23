<template>
  <QPage>
    <QScrollArea visible class="absolute-full fit q-pl-md q-pr-md">
      <PrivacyComponent
        class="overflow-auto"
        :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-black'"
      />
    </QScrollArea>
  </QPage>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMeta, QScrollArea, QPage } from 'quasar'

const $t = useI18n().t

const PrivacyComponent = defineAsyncComponent(
  () => import('components/PrivacyComponent.vue'),
)
const metaData = {
  'title': $t('pages.privacy.title'),
  'og:title': $t('pages.privacy.title'),
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
