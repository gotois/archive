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
          color="primary"
          icon="arrow_back"
          class="absolute"
          round
          flat
          unelevated
          @click="clickBack"
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
  SessionStorage,
  QLayout,
  QHeader,
  QToolbar,
  QPageContainer,
  QBtn,
  QTooltip,
} from 'quasar'
import { useRouter, RouterView } from 'vue-router'
import ToolbarTitleComponent from 'components/ToolbarTitleComponent.vue'
import { isTWA, isTMA } from '../composables/detector'
import { ROUTE_NAMES } from '../router/routes'

const router = useRouter()

const AndroidBarComponent = defineAsyncComponent(
  () => import('components/AndroidBarComponent.vue'),
)

async function clickBack() {
  SessionStorage.removeItem('restorePreviousSession')
  await router.push({
    name: ROUTE_NAMES.ROOT,
  })
}
</script>
<style lang="scss">
:root {
  touch-action: pan-x pan-y;
}
</style>
