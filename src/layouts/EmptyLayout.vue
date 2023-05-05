<template>
  <QLayout view="hHr LpR lfr">
    <QHeader bordered class="bg-white text-primary" height-hint="98">
      <QToolbar>
        <ToolbarTitleComponent />
      </QToolbar>
    </QHeader>
    <QPageContainer>
      <RouterView />
    </QPageContainer>
  </QLayout>
</template>
<script lang="ts" setup>
import { QLayout, QHeader, QToolbar, QPageContainer } from 'quasar'
import { RouterView } from 'vue-router'
import ToolbarTitleComponent from 'components/ToolbarTitleComponent.vue'
</script>
