<template>
  &nbsp;<!-- hack for open -->
  <QDate
    v-model="model"
    :default-view="!range ? 'Calendar' : 'Months'"
    class="fullscreen full-width full-height"
    first-day-of-week="1"
    :range="range"
    minimal
    today-btn
    :options="limitOptionsFn"
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

const model = ref(new Date())

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
