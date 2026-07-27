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
          v-if="$route.name !== ROUTE_NAMES.LOGIN"
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
import ToolbarTitleComponent from '@/shared/ui/ToolbarTitleComponent.vue'
import { isTWA, isTMA } from '@/shared/lib/detector'
import { ROUTE_NAMES } from '@/shared/config/routes'
import { useAppMeta } from '@/app/useAppMeta'

const router = useRouter()
useAppMeta()

const AndroidBarComponent = defineAsyncComponent(
  () => import('@/shared/ui/AndroidBarComponent.vue'),
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
