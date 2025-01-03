<template>
  <QVirtualScroll :items-fn="getItems" :items-size="limit" separator>
    <template
      #default="{ item, index }: { item: FormatContract; index: number }"
    >
      <TaskFull
        :key="index"
        :item="item"
        :class="{
          'q-mt-md': index > 0,
        }"
        :description="item.instrument.description"
        :title="item.instrument.name"
      />
    </template>
    <template v-if="paginationCount > 0" #after>
      <QSeparator class="q-ma-md" />
      <QPagination
        v-model.number="page"
        :max="paginationCount"
        :max-pages="$q.platform.is.desktop ? 10 : 5"
        :direction-links="paginationCount > 10"
        :boundary-links="$q.platform.is.desktop && paginationCount > 1"
        boundary-numbers
        ellipses
        flat
        active-design="outline"
        color="secondary"
        class="flex flex-center self-end q-mb-md"
        @update:model-value="$emit('onPaginate', page)"
      />
    </template>
  </QVirtualScroll>
</template>
<script lang="ts" setup>
import { PropType, ref, toRef, watch } from 'vue'
import { useQuasar, QSeparator, QPagination, QVirtualScroll } from 'quasar'
import TaskFull from 'components/TaskFull.vue'
import { FormatContract } from '../types/models'

const $q = useQuasar()

const props = defineProps({
  paginationCount: {
    type: Number as PropType<number>,
    required: true,
  },
  limit: {
    type: Number as PropType<number>,
    required: true,
  },
  page: {
    type: Number as PropType<number>,
    required: true,
  },
  contracts: {
    type: Array as PropType<FormatContract[]>,
    required: true,
  },
})
const emit = defineEmits(['onPaginate'])

const contracts = toRef(props, 'contracts', [])
const page = ref(props.page)

watch(
  () => props.page,
  (value) => {
    page.value = value
  },
)

function getItems(from: number, size: number): FormatContract[] {
  return contracts.value.slice(from, size)
}
</script>
