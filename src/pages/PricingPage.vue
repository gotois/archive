<template>
  <QPage class="full-height">
    <PricingComponent />
  </QPage>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useMeta, QPage } from 'quasar'
import PricingComponent from 'components/PricingComponent.vue'

const $t = useI18n().t

const metaData = {
  'title': $t('pages.pricing.title'),
  'og:title': $t('pages.pricing.title'),
}

useMeta(metaData)
</script>
