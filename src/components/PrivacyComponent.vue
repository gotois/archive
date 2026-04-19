<template>
  <div v-html="html" />
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import { ref } from 'vue'
import { parse } from '../helpers/markdownHelper'

const html = ref('')

onMounted(async () => {
  const response = await fetch('docs/privacy.md')
  const md = await response.text()
  html.value = parse(md)
})
</script>
