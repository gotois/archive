<template>
  <q-layout view="hHr LpR lfr">
    <q-header bordered class="bg-white text-primary" height-hint="98">
      <q-toolbar>
        <q-toolbar-title class="text-black-9 text-center">
          {{ $t('header.title') }}
          <q-badge outline align="top" color="orange">
            {{ $t('navigation.version')}}{{ version }}
          </q-badge>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {version} from '../../package.json'

function main() {
  return {
    version,
  }
}

export default defineComponent({
  name: 'EmptyLayout',
  setup() {
    return main()
  },
})
</script>
