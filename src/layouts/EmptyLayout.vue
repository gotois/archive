<template>
  <QLayout view="hHr LpR lfr">
    <QHeader
      v-if="!isTMA"
      bordered
      class="text-primary bg-transparent"
      height-hint="98"
    >
      <AndroidBarComponent v-if="isTWA" />
      <QToolbar>
        <QBtn
          v-if="$route.name !== ROUTE_NAMES.TUTORIAL"
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
import { isTWA, isTMA } from '../helpers/twaHelper'
import { ROUTE_NAMES } from '../router/routes'

const AndroidBarComponent = defineAsyncComponent(
  () => import('components/AndroidBarComponent.vue'),
)
</script>
<style lang="scss">
:root {
  touch-action: pan-x pan-y;
}
</style>
