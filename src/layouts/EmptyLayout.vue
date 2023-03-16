<template>
  <q-layout view="hHr LpR lfr">
    <q-header bordered class="bg-white text-primary" height-hint="98">
      <q-toolbar>
        <q-toolbar-title class="text-black-9 text-center">
          {{ $t('header.title') }}
          <q-badge outline rounded align="top" color="accent">
            {{ $t('navigation.version') }}{{ version }}
          </q-badge>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import pkg from '../../package.json'

const version = ref(pkg.version)
</script>
