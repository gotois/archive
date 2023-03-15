<template>
  <div class="fullscreen bg-info text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">
        {{ $t('error404.title') }}
      </div>
      <div class="text-h2" style="opacity:.4">
        {{ $t('error404.description') }}
      </div>
      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="info"
        :to="{ name: 'archive', query: { page: 1 } }"
        :label="$t('error404.submit')"
        unelevated
        no-caps
        push
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useMeta} from 'quasar'

const metaData = {
  title: 'Страница не найдена',
  'og:title': 'Страница не найдена',
}

useMeta(metaData)
</script>
