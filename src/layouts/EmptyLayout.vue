<template>
  <QLayout view="hHr LpR lfr">
    <QHeader bordered class="bg-white text-primary" height-hint="98">
      <AndroidBarComponent v-if="isTWA && $q.platform.is.android" />
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
import { defineAsyncComponent } from 'vue'
import { QLayout, QHeader, QToolbar, QPageContainer } from 'quasar'
import { RouterView } from 'vue-router'
import ToolbarTitleComponent from 'components/ToolbarTitleComponent.vue'

const isTWA = document.referrer.includes('android-app://')

const AndroidBarComponent = defineAsyncComponent(
  () => import('components/AndroidBarComponent.vue'),
)
</script>
