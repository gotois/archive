<template>
  <ChatGPTCalendarView v-if="isChatGPT" />
  <ScheduleCalendarView v-else />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { isChatGPT } from '@/shared/lib/detector'
import ScheduleCalendarView from './ScheduleCalendarView.vue'

const ChatGPTCalendarView = defineAsyncComponent(() =>
  import('./ChatGPTCalendarView.vue').then(
    ({ default: component }) => component,
  ),
)
</script>
