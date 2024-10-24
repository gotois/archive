<template>
  <div class="q-pa-lg">
    <div class="text-grey-8">{{
      new Intl.DateTimeFormat('ru', { weekday: 'short' }).format(props.date)
    }}</div>
    <div class="text-bold">{{ props.date.getDate() }}</div>
  </div>
</template>
<script lang="ts" setup>
import { PropType } from 'vue'

const props = defineProps({
  date: {
    type: Date as PropType<Date>,
    required: true,
    default: false,
  },
})
</script>
