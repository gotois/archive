<template>
  <CalendarEventView :task-id="taskId" />
</template>

<script setup lang="ts">
import CalendarEventView from '@/widgets/calendar-event-view'

defineProps<{ taskId: string }>()
</script>
