<template>
  <QPage class="full-width full-height">
    <iframe
      v-if="!$q.platform.is.android"
      src="https://docs.google.com/forms/d/e/1FAIpQLSdVkv7OPOU2n20YKhl3sBwwhjAV_KuFqFncNNfnIgUTp3_8RA/viewform?embedded=true"
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
import { QPage, Platform, openURL } from 'quasar'
import { useRouter } from 'vue-router'
import twaManifest from '../../twa-manifest.json'

const { packageId } = twaManifest
const router = useRouter()

onMounted(() => {
  if (Platform.is.android) {
    openURL(
      'https://play.google.com/store/apps/details?id=' + packageId,
      null,
      {
        noopener: true,
        menubar: false,
        toolbar: false,
        noreferrer: true,
      },
    )
    return router.push({
      name: 'archive',
    })
  }
})
</script>
