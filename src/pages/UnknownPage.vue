<template>
  <div
    class="fullscreen bg-info text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div style="font-size: 30vh">
        {{ $t('pages.unknown.title') }}
      </div>
      <div class="text-h2" style="opacity: 0.4">
        {{ $t('pages.unknown.description') }}
      </div>
      <QBtn
        class="q-mt-xl"
        color="accent"
        square
        glossy
        push
        unelevated
        :to="{ name: 'archive', query: { page: 1 } }"
        :label="$t('pages.unknown.submit')"
        no-caps
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useMeta, QBtn } from 'quasar'
import { useI18n } from 'vue-i18n'

const $t = useI18n().t

const metaData = {
  'title': $t('pages.unknown.seo.title'),
  'og:title': $t('pages.unknown.seo.title'),
}

useMeta(metaData)
</script>
