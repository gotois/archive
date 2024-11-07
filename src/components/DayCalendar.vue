<template>
  <QBtn :color="color" square unelevated>
    <div
      :class="{
        'text-grey-9': !$q.dark.isActive,
        'text-black-8': $q.dark.isActive,
      }"
    >
      {{
        new Intl.DateTimeFormat(langStore.language, {
          weekday: 'short',
        }).format(props.day)
      }}
    </div>
    <div
      class="text-bold text-center"
      :class="{
        'text-grey-9': !$q.dark.isActive,
        'text-black-8': $q.dark.isActive,
      }"
    >
      {{ props.day.getDate() }}
    </div>
    <QTooltip anchor="bottom middle" self="bottom middle">
      {{ date.formatDate(props.day, 'YYYY-MM-DD') }}
    </QTooltip>
  </QBtn>
</template>
<script lang="ts" setup>
import { PropType, computed } from 'vue'
import { useQuasar, QBtn, QTooltip, date } from 'quasar'
import useLangStore from 'stores/lang'
import { isCurrentDate } from '../helpers/calendarHelper'

const $q = useQuasar()
const langStore = useLangStore()

const props = defineProps({
  day: {
    type: Date as PropType<Date>,
    required: true,
  },
  selectedDay: {
    type: String as PropType<string>,
    default: null,
  },
})

const color = computed(() => {
  const { day, selectedDay } = props
  if (isCurrentDate(day, selectedDay)) {
    return 'green-6'
  } else if (isCurrentDate(day)) {
    return $q.dark.isActive ? 'yellow-10' : 'yellow-9'
  }
  return 'transparent'
})
</script>
