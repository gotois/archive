<template>
  <QLayout view="hHr LpR lfr">
    <QHeader bordered class="bg-white text-primary" height-hint="98">
      <QToolbar>
        <QToolbarTitle class="text-black-9 text-center">
          {{ $t('header.title') }}
        </QToolbarTitle>
      </QToolbar>
    </QHeader>
    <QPageContainer>
      <RouterView />
    </QPageContainer>
  </QLayout>
</template>
<script lang="ts" setup>
import {
  QLayout,
  QHeader,
  QToolbar,
  QToolbarTitle,
  QPageContainer,
} from 'quasar'
import { RouterView } from 'vue-router'
</script>
