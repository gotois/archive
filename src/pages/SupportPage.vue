<template>
  <QPage class="full-height">
    <iframe
      v-if="!$q.platform.is.android"
      :src="router.currentRoute.value.query.url"
      width="100%"
      height="100%"
      class="absolute-top absolute-bottom fit"
      frameborder="0"
      marginheight="0"
      marginwidth="0"
    >
      Loading…
    </iframe>
  </QPage>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMeta, useQuasar, QPage } from 'quasar'
import { useRouter } from 'vue-router'
import { isTWA } from '../helpers/twaHelper'
import { open } from '../helpers/urlHelper'
import { applicationURL } from '../helpers/googlePlayHelper'

const $t = useI18n().t
const router = useRouter()
const $q = useQuasar()

// todo - исправить мета данные
const metaData = {
  'title': $t('pages.create.title'),
  'og:title': $t('pages.create.title'),
}

onMounted(() => {
  if (isTWA) {
    open(applicationURL)
    return router.push({
      name: 'archive',
    })
  }
})

useMeta(metaData)
</script>
