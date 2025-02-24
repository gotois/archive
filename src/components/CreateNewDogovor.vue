<template>
  <QDialog
    v-model="creatingNewContract"
    :allow-focus-outside="false"
    :position="props.maximized ? 'top' : 'standard'"
    persistent
    :maximized="props.maximized"
    no-shake
    transition-show="slide-up"
    transition-hide="slide-down"
    @hide="emit('hide')"
  >
    <QCard
      style="max-width: 640px; min-width: 480px"
      :class="{
        'bg-white text-white': !$q.dark.isActive,
        'bg-dark text-white': $q.dark.isActive,
      }"
    >
      <QBar :dense="false" :dark="false" class="bg-grey-2">
        <QSpace />
        <QBtn v-close-popup flat color="dark" icon="close" />
      </QBar>
      <QScrollArea
        visible
        :style="{ height: props.maximized ? 'calc(100dvh - 32px)' : '520px' }"
      >
        <QCardSection v-if="contract" class="fit overflow-auto q-pt-none">
          <ContractFormComponent
            :contract="contract"
            :signing="signing"
            @create="emit('done')"
          />
        </QCardSection>
      </QScrollArea>
    </QCard>
  </QDialog>
</template>
<script lang="ts" setup>
import { ref, h, defineAsyncComponent, PropType } from 'vue'
import {
  useQuasar,
  QCard,
  QCardSection,
  QDialog,
  QScrollArea,
  QSpace,
  QBar,
  QBtn,
  QSkeleton,
} from 'quasar'
import type { VerifiableCredential } from '../types/models'

const $q = useQuasar()
const creatingNewContract = ref(true)

const props = defineProps({
  signing: {
    type: Boolean,
    default: false,
  },
  maximized: {
    type: Boolean,
    default: false,
  },
  contract: {
    type: Object as PropType<VerifiableCredential>,
    default: () => ({}),
  },
})

const emit = defineEmits(['done', 'hide'])

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
