<template>
  &nbsp;<!-- hack: empty symbol needs for open -->
  <QDate
    v-model="model"
    :default-view="!range ? 'Calendar' : 'Months'"
    class="fullscreen full-width full-height"
    :range="range"
    color="primary"
    :first-day-of-week="langStore.isRussian ? 1 : null"
    :locale="calendarLocale"
    :options="options"
    today-btn
    square
    @range-start="onRangeStart"
    @range-end="onRangeEnd"
    @update:model-value="range ? null : $emit('select', model)"
  >
    <div class="row items-center justify-end">
      <QBtn v-close-popup :label="$t('duration.close')" color="primary" flat />
    </div>
  </QDate>
</template>
<script lang="ts" setup>
import { ref, computed, PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { QBtn, QDate, date } from 'quasar'
import useLangStore from 'stores/lang'

const i18n = useI18n()
const langStore = useLangStore()
const $t = i18n.t

interface Range {
  day: number
  month: number
  year: number
}

const model = ref<Date>(new Date())
const rangeStart = ref<Range>(null)

const emit = defineEmits(['select'])
const props = defineProps({
  range: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
})
const options = computed(() => {
  if (props.range) {
    if (rangeStart.value) {
      return rangeOptionsFn
    }
  }
  return limitOptionsFn
})
const calendarLocale = computed(() => {
  return langStore.isRussian
    ? {
        days: $t('calendar.days').split('_'),
        daysShort: $t('calendar.daysShort').split('_'),
        months: $t('calendar.months').split('_'),
        monthsShort: $t('calendar.monthsShort').split('_'),
      }
    : null
})

function limitOptionsFn(dateStr: string) {
  return dateStr <= date.formatDate(new Date(), 'YYYY/MM/DD')
}

function rangeOptionsFn(dateStr: string) {
  const fromDate = date.buildDate(rangeStart.value)
  return dateStr >= date.formatDate(fromDate, 'YYYY/MM/DD')
}

function onRangeStart(value: Range) {
  const fromDate = date.buildDate(value)
  const diff = date.getDateDiff(fromDate, new Date())
  if (diff <= 0) {
    rangeStart.value = value
    return
  }
}
function onRangeEnd() {
  emit('select', model.value)
}
</script>
