<template>
  <QLayout view="hHr LpR lfr">
    <QHeader bordered class="text-primary bg-transparent" height-hint="98">
      <AndroidBarComponent v-if="isTWA" />
      <QToolbar>
        <QBtn
          v-if="$route.name !== 'tutorial'"
          round
          flat
          color="primary"
          icon="arrow_back"
          to="/"
        />
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
import { QLayout, QHeader, QToolbar, QPageContainer, QBtn } from 'quasar'
import { RouterView } from 'vue-router'
import ToolbarTitleComponent from 'components/ToolbarTitleComponent.vue'
import { isTWA } from '../helpers/twaHelper'

const AndroidBarComponent = defineAsyncComponent(
  () => import('components/AndroidBarComponent.vue'),
)
</script>
