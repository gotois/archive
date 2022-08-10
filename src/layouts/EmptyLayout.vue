<template>
  <q-layout view="hHr LpR lfr">
    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

function main() {
  return {
  }
}

export default defineComponent({
  name: 'EmptyLayout',
  setup() {
    return main()
  },
})
</script>
