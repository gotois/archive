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
          dense
          class="full-height"
          @click="loadPrevWeek"
        />
        <QVirtualScroll
          ref="virtualScroll"
          v-slot="{ item, index }"
          class="date-area"
          :items="weeks"
          :item-size="MAX_SIZE"
          virtual-scroll-horizontal
        >
          <DayCalendar
            :key="index"
            v-ripple
            style="width: 45px"
            class="cursor-pointer q-pa-md day-calendar relative-position non-selectable flex items-center justify-center"
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
          dense
          class="full-height"
          @click="loadNextWeek"
        />
      </template>
    </ScheduleXCalendar>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
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
import { formatToCalendarDate, isCurrentDate } from '../helpers/calendarHelper'
import '@schedule-x/theme-default/dist/index.css'
import useCalendarStore from 'stores/calendar'

const $q = useQuasar()
const i18n = useI18n()
const calendarControls = createCalendarControlsPlugin()
const eventsServicePlugin = createEventsServicePlugin()
const eventModal = createEventModalPlugin()
const calendarStore = useCalendarStore()
const $t = i18n.t

const currentDate = new Date()
const MAX_SIZE = 7
const CALENDAR_WEEK_NUM = 7

const metaData = {
  'title': $t('pages.calendar.title'),
  'og:title': $t('pages.calendar.title'),
}

const virtualScroll = ref(null)
const controlDate = ref(formatToCalendarDate(currentDate))
const weeks = ref(loadWeek(currentDate))

const calendarApp = createCalendar({
  selectedDate: formatToCalendarDate(currentDate),
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

      await calendarStore.loadCalendar(new Date(range.start))
      eventsServicePlugin.set(calendarStore.events)
    },
    async onRender(): void {
      await calendarStore.loadCalendar(currentDate)
      eventsServicePlugin.set(calendarStore.events)

      const currentIndexDay = weeks.value.findIndex((elem) =>
        isCurrentDate(elem),
      )
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      virtualScroll.value.scrollTo(currentIndexDay)
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

function selectDay(item: Date) {
  const day = formatToCalendarDate(item)
  calendarControls.setDate(day)
}

useMeta(metaData)
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
::-webkit-scrollbar {
  background: transparent;
}
</style>
<style lang="scss">
.sx-vue-calendar-wrapper {
  height: 100dvh;
}
.sx__week-grid__date-axis {
  display: none;
}
.sx__calendar-header {
  padding: 0;
}
</style>
