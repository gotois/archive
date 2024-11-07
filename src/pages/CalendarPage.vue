<template>
  <div>
    <ScheduleXCalendar :calendar-app="calendarApp">
      <template #timeGridEvent="{ calendarEvent }">
        <QCard v-ripple flat :dark="!$q.dark.isActive">
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
        <div
          class="flex full-width full-height flex items-center justify-between shadow-4 no-wrap"
          :class="{
            'bg-light': !$q.dark.isActive,
            'bg-dark': $q.dark.isActive,
          }"
        >
          <QBtn
            icon="arrow_left"
            flat
            dense
            square
            :color="$q.dark.isActive ? 'light' : 'dark'"
            class="full-height"
            @click="loadPrevWeek"
          />
          <QVirtualScroll
            ref="virtualScroll"
            v-slot="{ item, index }"
            class="flex items-center q-mt-xs q-mb-xs"
            :items="weeks"
            :item-size="CALENDAR_WEEK_NUM"
            virtual-scroll-horizontal
          >
            <DayCalendar
              :key="index"
              style="width: 45px"
              class="cursor-pointer q-ml-xs q-mr-xs q-pa-md rounded-borders relative-position non-selectable flex items-center justify-center"
              :day="item"
              :selected-day="selectedDay"
              @click="selectDay(item)"
            />
          </QVirtualScroll>
          <QBtn
            icon="arrow_right"
            flat
            dense
            square
            :color="$q.dark.isActive ? 'light' : 'dark'"
            class="full-height"
            @click="loadNextWeek"
          />
        </div>
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
import { createScrollControllerPlugin } from '@schedule-x/scroll-controller'
import { formatToCalendarDate, isCurrentDate } from '../helpers/calendarHelper'
import '@schedule-x/theme-default/dist/index.css'
import useCalendarStore from 'stores/calendar'
import useLangStore from 'stores/lang'

const currentDate = new Date()
const CALENDAR_WEEK_NUM = 7
const INITIAL_SCROLL = '06:30'

const $q = useQuasar()
const i18n = useI18n()
const langStore = useLangStore()
const calendarStore = useCalendarStore()
const calendarControls = createCalendarControlsPlugin()
const eventsServicePlugin = createEventsServicePlugin()
const eventModal = createEventModalPlugin()
const scrollController = createScrollControllerPlugin({
  initialScroll: INITIAL_SCROLL,
})
const $t = i18n.t

const metaData = {
  'title': $t('pages.calendar.title'),
  'og:title': $t('pages.calendar.title'),
}

const virtualScroll = ref(null)
const selectedDay = ref<string>(formatToCalendarDate(currentDate))
const weeks = ref<Date[]>(loadWeek(currentDate))

const calendarApp = createCalendar({
  selectedDate: selectedDay.value,
  locale: langStore.language,
  defaultView: viewDay.name,
  isDark: $q.dark.isActive,
  views: [createViewDay()],
  events: calendarStore.events,
  plugins: [
    createCurrentTimePlugin({
      fullWeekWidth: false,
    }),
    calendarControls,
    eventsServicePlugin,
    eventModal,
    scrollController,
  ],
  callbacks: {
    async onRangeUpdate(range): void {
      selectedDay.value = range.start

      await calendarStore.loadCalendar(selectedDay.value)
      eventsServicePlugin.set(calendarStore.events)
    },
    async onRender(): void {
      await calendarStore.loadCalendar(selectedDay.value)
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
<style lang="scss">
.sx-vue-calendar-wrapper {
  height: calc(100dvh - 50px);
}
.sx__week-grid__date-axis {
  display: none;
}
.sx__calendar-header {
  padding: 0;
}
</style>
