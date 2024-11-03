<template>
  <div>
    <ScheduleXCalendar :calendar-app="calendarApp">
      <template #timeGridEvent="{ calendarEvent }">
        <QCard flat :dark="!$q.dark.isActive">
          <QCardSection>
            <div
              class="flex justify-between items-center"
              :class="{
                'text-black': $q.dark.isActive,
                'text-white': !$q.dark.isActive,
              }"
            >
              <div class="text-subtitle2 text-bold">
                {{ calendarEvent.title }}
              </div>
              <div class="text-caption">
                {{ date.formatDate(new Date(calendarEvent.start), 'HH:MM') }}
                -
                {{ date.formatDate(new Date(calendarEvent.end), 'HH:MM') }}
              </div>
            </div>
            <div v-if="calendarEvent.location" class="ellipsis-2-lines">
              📍 {{ calendarEvent.location }}
            </div>
            <div v-if="calendarEvent.description" class="ellipsis-2-lines">
              {{ calendarEvent.description }}
            </div>
          </QCardSection>
        </QCard>
      </template>
      <template #headerContent>
        <QBtn
          icon="arrow_left"
          flat
          class="full-height"
          @click="loadPrevWeek"
        />
        <QVirtualScroll
          v-slot="{ item, index }"
          class="date-area"
          :items="weeks"
          :item-size="MAX_SIZE"
          virtual-scroll-horizontal
        >
          <DayCalendar
            :key="index"
            class="cursor-pointer q-pa-md day-calendar"
            :class="{
              'selected': isCurrentDate(item),
              'bg-amber': isCurrentDate(item, controlDate),
            }"
            :date="item"
            @click="selectDay(item)"
          />
        </QVirtualScroll>
        <QBtn
          icon="arrow_right"
          flat
          class="full-height"
          @click="loadNextWeek"
        />
      </template>
    </ScheduleXCalendar>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import {
  useQuasar,
  useMeta,
  QVirtualScroll,
  QBtn,
  QCard,
  QCardSection,
  date,
} from 'quasar'
import DayCalendar from 'components/DayCalendar.vue'
import { useI18n } from 'vue-i18n'
import { ScheduleXCalendar } from '@schedule-x/vue'
import { viewDay, createCalendar, createViewDay } from '@schedule-x/calendar'
import { createCurrentTimePlugin } from '@schedule-x/current-time'
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { convertIcalToEvent } from '../helpers/calendarHelper'
import { loadCalendar } from '../services/secretary'
import '@schedule-x/theme-default/dist/index.css'
// https://schedule-x.dev/docs/calendar/plugins/calendar-controls

const $q = useQuasar()
const i18n = useI18n()
const calendarControls = createCalendarControlsPlugin()
const eventsServicePlugin = createEventsServicePlugin()
const eventModal = createEventModalPlugin()
const $t = i18n.t

const currentDate = new Date()
const MAX_SIZE = 7
const CALENDAR_WEEK_NUM = 7

const metaData = {
  'title': $t('pages.calendar.title'),
  'og:title': $t('pages.calendar.title'),
}

const controlDate = ref(date.formatDate(currentDate, 'YYYY-MM-DD'))
const weeks = ref([])

const calendarApp = createCalendar({
  selectedDate: date.formatDate(currentDate, 'YYYY-MM-DD'),
  locale: i18n.locale.value,
  defaultView: viewDay.name,
  isDark: $q.dark.isActive,
  views: [createViewDay()],
  events: [],
  plugins: [
    createCurrentTimePlugin({
      fullWeekWidth: true,
    }),
    calendarControls,
    eventsServicePlugin,
    eventModal,
  ],
  callbacks: {
    async onRangeUpdate(range): void {
      controlDate.value = range.start
      const db = await loadCalendar(new Date(range.start))
      eventsServicePlugin.set(db.map((ical) => convertIcalToEvent(ical)))
    },
  },
})

function loadWeek(now: Date) {
  const startOfWeek = new Date(
    now.setDate(now.getDate() - ((now.getDay() + 6) % CALENDAR_WEEK_NUM)),
  )
  const endOfWeek = new Date(
    now.setDate(now.getDate() - now.getDay() + CALENDAR_WEEK_NUM),
  )

  const dates = []
  for (let d = startOfWeek; d <= endOfWeek; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d))
  }
  return dates
}

function loadPrevWeek() {
  currentDate.setDate(currentDate.getDate() - CALENDAR_WEEK_NUM)
  weeks.value = loadWeek(currentDate)
}

function loadNextWeek() {
  currentDate.setDate(currentDate.getDate() + CALENDAR_WEEK_NUM)
  weeks.value = loadWeek(currentDate)
}

const isCurrentDate = (elem: Date, now = new Date()) => {
  return date.isSameDate(elem, now, 'day')
}

function selectDay(item: Date) {
  const day = date.formatDate(item, 'YYYY-MM-DD')
  calendarControls.setDate(day)
}

useMeta(metaData)

onMounted(async () => {
  weeks.value = loadWeek(currentDate)
  const db = await loadCalendar(new Date())
  eventsServicePlugin.set(db.map((ical) => convertIcalToEvent(ical)))
})
</script>
<style lang="scss" scoped>
.day-calendar {
  border-radius: 12px;
  height: max-content;
}
.selected {
  background-color: #ed6d3b;
}
.date-area {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
<style lang="scss">
.sx-vue-calendar-wrapper {
  height: 100dvh;
}
.sx__week-grid__date-axis {
  display: none;
}
</style>
