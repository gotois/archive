<template>
  <div>
    <div class="text-grey-8">
      {{
        new Intl.DateTimeFormat(i18n.locale, { weekday: 'short' }).format(
          props.date,
        )
      }}
    </div>
    <div class="text-bold text-center text-white">
      {{ props.date.getDate() }}
    </div>
  </div>
</template>
<script lang="ts" setup>
import { PropType } from 'vue'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

const props = defineProps({
  date: {
    type: Date as PropType<Date>,
    required: true,
    default: false,
  },
})
</script>
