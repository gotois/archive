<template>
  <QCard v-ripple flat :dark="!$q.dark.isActive" bordered square>
    <QCardSection class="q-pa-xs justify-between items-center" horizontal>
      <div
        class="flex justify-between"
        :class="{
          'text-black': $q.dark.isActive,
          'text-white': !$q.dark.isActive,
        }"
      >
        <div class="text-subtitle2 text-bold">
          {{ title }}
        </div>
      </div>
      <div class="text-caption text-red">
        ⏰
        {{ date.formatDate(start, 'HH:mm') }}
        -
        {{ date.formatDate(end, 'HH:mm') }}
      </div>
      <div v-if="location" class="ellipsis-2-lines"> 📍 {{ location }} </div>
      <div v-if="description" class="ellipsis-2-lines">
        {{ description }}
      </div>
    </QCardSection>
    <q-popup-proxy>
      <TaskFull
        style="width: 640px"
        :title="title"
        :description="description"
        :attaches="attaches"
        :start-time="start"
        :end-time="end"
        :same-as="''"
        :location="null"
        :link="''"
        :email="''"
        :telephone="''"
        @on-remove="emit('onRemove')"
        @on-edit="emit('onEdit')"
      />
    </q-popup-proxy>
  </QCard>
</template>
<script lang="ts" setup>
import { PropType } from 'vue'
import { QCard, QCardSection, date, useQuasar } from 'quasar'
import TaskFull from 'components/TaskFull.vue'
import { FormatImageType } from '../types/models'

const $q = useQuasar()

const emit = defineEmits(['onRemove', 'onEdit'])

defineProps({
  title: {
    type: String as PropType<string>,
    required: true,
  },
  start: {
    type: Date as PropType<Date>,
    required: true,
  },
  end: {
    type: Date as PropType<Date>,
    required: true,
  },
  location: {
    type: String as PropType<string>,
    default: null,
  },
  description: {
    type: String as PropType<string>,
    default: null,
  },
  attaches: {
    type: Array as PropType<FormatImageType[]>,
    default: null,
  },
})
</script>
