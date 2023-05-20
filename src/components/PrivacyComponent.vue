<template>
  <div v-html="html"></div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import { ref } from 'vue'
import { marked } from 'marked'

marked.use({
  gfm: true,
})

const html = ref('')

onMounted(async () => {
  const response = await fetch('docs/privacy.md')
  const md = await response.text()
  html.value = marked.parse(md)
})
</script>
