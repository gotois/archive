<template>
  <QPage class="full-height">
    <iframe
      v-if="!$q.platform.is.android"
      :src="iframeURL"
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
import { useMeta, QPage } from 'quasar'
import { useRouter } from 'vue-router'
import { isTWA } from '../helpers/twaHelper'
import { open } from '../helpers/urlHelper'
import { applicationURL } from '../helpers/googlePlayHelper'

const iframeURL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdVkv7OPOU2n20YKhl3sBwwhjAV_KuFqFncNNfnIgUTp3_8RA/viewform?embedded=true'

const $t = useI18n().t
const router = useRouter()

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
