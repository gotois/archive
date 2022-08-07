<template>
  <router-view />
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import {useMeta} from 'quasar'

const metaData = {
  meta: {
    keywords: { name: 'keywords', content: 'Ваша база договоров' },
    equiv: { 'http-equiv': 'Content-Type', content: 'text/html; charset=UTF-8' },
  },
  noscript: {
    default: 'This is content for browsers with no JS (or disabled JS)'
  },
}

export default defineComponent({
  name: 'App',
  setup () {
    useMeta(metaData)
  },
})
</script>
