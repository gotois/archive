<template>
  &nbsp;<!-- hack: empty symbol needs for open -->
  <QDate
    v-model="model"
    :default-view="!range ? 'Calendar' : 'Months'"
    class="fullscreen full-width full-height"
    :range="range"
    :first-day-of-week="locale === 'ru' ? 1 : null"
    :locale="calendarLocale"
    :options="limitOptionsFn"
    minimal
    today-btn
    @update:model-value="$emit('select', model)"
  >
    <div class="row items-center justify-end">
      <QBtn v-close-popup :label="$t('duration.close')" color="primary" flat />
    </div>
  </QDate>
</template>
<script lang="ts" setup>
import { ref, PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { QBtn, QDate, date } from 'quasar'

const $t = useI18n().t
const { locale } = useI18n()

const model = ref(new Date())
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

defineEmits(['select'])
defineProps({
  range: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
})

function limitOptionsFn(dateStr: string) {
  return dateStr <= date.formatDate(new Date(), 'YYYY/MM/DD')
}
</script>
