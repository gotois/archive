<template>
  <div>
    <div
      :class="{
        'text-grey-8': $q.dark.isActive,
        'text-black-8': !$q.dark.isActive,
      }"
    >
      {{
        new Intl.DateTimeFormat(i18n.locale, { weekday: 'short' }).format(
          props.date,
        )
      }}
    </div>
    <div
      class="text-bold text-center"
      :class="{
        'text-white': $q.dark.isActive,
        'text-black': !$q.dark.isActive,
      }"
    >
      {{ props.date.getDate() }}
    </div>
  </div>
</template>
<script lang="ts" setup>
import { PropType } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const i18n = useI18n()

const props = defineProps({
  date: {
    type: Date as PropType<Date>,
    required: true,
    default: false,
  },
})
</script>
