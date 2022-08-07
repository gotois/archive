<template>
  <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
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
        text-color="blue"
        unelevated
        to="/"
        :label="$t('error404.submit')"
        no-caps
      />
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {useMeta} from 'quasar'

const metaData = {
  title: 'Страница не найдена',
}

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Error404',
  setup () {
    useMeta(metaData)
  },
})
</script>
