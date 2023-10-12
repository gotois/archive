<template>
  &nbsp;<!-- hack: empty symbol needs for open -->
  <QDate
    v-model="model"
    :default-view="!range ? 'Calendar' : 'Months'"
    class="fullscreen full-width full-height"
    :range="range"
    color="primary"
    :first-day-of-week="locale === 'ru' ? 1 : null"
    :locale="calendarLocale"
    :options="options"
    today-btn
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

const $t = useI18n().t
const { locale } = useI18n()

interface Range {
  day: number
  month: number
  year: number
}

const model = ref(new Date())
const rangeStart = ref<Range>(null)
const calendarLocale = ref<unknown>(
  locale.value === 'ru'
    ? {
        days: $t('calendar.days').split('_'),
        daysShort: $t('calendar.daysShort').split('_'),
        months: $t('calendar.months').split('_'),
        monthsShort: $t('calendar.monthsShort').split('_'),
      }
    : null,
)

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
