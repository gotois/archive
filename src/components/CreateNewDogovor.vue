<template>
  <QDialog
    v-model="creatingNewContract"
    :allow-focus-outside="false"
    position="top"
    persistent
    maximized
    no-shake
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <QCard
      style="max-width: 640px"
      :class="{
        'bg-white text-white': !$q.dark.isActive,
        'bg-dark text-white': $q.dark.isActive,
      }"
    >
      <QBar :dense="false" :dark="false" class="bg-grey-2">
        <QSpace />
        <QBtn v-close-popup flat color="dark" icon="close" />
      </QBar>
      <QScrollArea visible style="height: calc(100dvh - 32px)">
        <QCardSection v-if="dogovor" class="fit overflow-auto q-pt-none">
          <ContractFormComponent
            :dogovor="dogovor"
            :signing="signing"
            @on-create="$emit('on-create')"
          />
        </QCardSection>
      </QScrollArea>
    </QCard>
  </QDialog>
</template>
<script lang="ts" setup>
import { ref, h, defineAsyncComponent, PropType } from 'vue'
import {
  QCard,
  QCardSection,
  QDialog,
  QScrollArea,
  QSpace,
  QBar,
  QBtn,
  QSkeleton,
} from 'quasar'
import Dogovor from '../services/contractGeneratorService'

const creatingNewContract = ref(true)

defineProps({
  signing: {
    type: Boolean,
    default: false,
  },
  dogovor: {
    type: Object as PropType<Dogovor>,
    default: () => ({}),
  },
})

const ContractFormComponent = defineAsyncComponent({
  loader: () => import('components/ContractFormComponent.vue'),
  delay: 0,
  loadingComponent: h(QSkeleton, {
    style: {
      'height': '460px',
      'max-width': '720px',
    },
  }),
})
</script>
