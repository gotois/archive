<template>
  <QLayout view="hHr LpR lfr">
    <QHeader bordered class="text-primary bg-transparent" height-hint="98">
      <AndroidBarComponent v-if="isTWA" />
      <QToolbar>
        <QBtn
          v-if="$route.name !== 'tutorial'"
          to="/"
          color="primary"
          icon="arrow_back"
          class="absolute"
          round
          flat
          unelevated
        >
          <QTooltip>{{ $t('navigation.back') }}</QTooltip>
        </QBtn>
        <ToolbarTitleComponent class="text-center" />
      </QToolbar>
    </QHeader>
    <QPageContainer>
      <RouterView />
    </QPageContainer>
  </QLayout>
</template>
<script lang="ts" setup>
import { defineAsyncComponent } from 'vue'
import {
  QLayout,
  QHeader,
  QToolbar,
  QPageContainer,
  QBtn,
  QTooltip,
} from 'quasar'
import { RouterView } from 'vue-router'
import ToolbarTitleComponent from 'components/ToolbarTitleComponent.vue'
import { isTWA } from '../helpers/twaHelper'

const AndroidBarComponent = defineAsyncComponent(
  () => import('components/AndroidBarComponent.vue'),
)
</script>
<style lang="scss">
:root {
  touch-action: pan-x pan-y;
}
</style>
