<template>
  <QPage
    :class="{
      'bg-transparent': $q.dark.isActive,
      'bg-white': !$q.dark.isActive,
    }"
    :style="{
      'max-width': $q.platform.is.desktop ? '720px' : 'auto',
    }"
  >
    <QScrollArea
      ref="scrollAreaRef"
      :visible="$q.platform.is.desktop"
      :delay="500"
      class="absolute-full fit"
    >
      <QPullToRefresh class="absolute-full fit" @refresh="onRefresh">
        <ScheduleXCalendar v-if="calendarApp" :calendar-app="calendarApp">
          <template #dateGridEvent="{ calendarEvent }">
            <CalendarEventCard
              class="fit"
              :event-id="String(calendarEvent.id)"
              :title="calendarEvent.title"
              :description="calendarEvent.description"
              :start="calendarEvent.start"
              :end="calendarEvent.end"
              :location="calendarEvent.location"
              :attaches="calendarEvent.attaches"
              :tag="calendarEvent.tag"
              :organizer="calendarEvent.organizer"
              :participant="calendarEvent.participant"
              :link="calendarEvent.link"
              @remove="onRemove"
            />
          </template>
          <template #timeGridEvent="{ calendarEvent }">
            <CalendarEventCard
              class="fit"
              horizontal
              :event-id="String(calendarEvent.id)"
              :title="calendarEvent.title"
              :description="calendarEvent.description"
              :start="calendarEvent.start"
              :end="calendarEvent.end"
              :location="calendarEvent.location"
              :attaches="calendarEvent.attaches"
              :tag="calendarEvent.tag"
              :organizer="calendarEvent.organizer"
              :participant="calendarEvent.participant"
              :link="calendarEvent.link"
              @remove="onRemove"
            />
          </template>
          <template #headerContent>
            <div
              class="flex full-width full-height items-center justify-between shadow-4 no-wrap"
              :class="{
                'bg-white': !$q.dark.isActive,
                'bg-dark': $q.dark.isActive,
              }"
            >
              <QBtn
                icon="arrow_left"
                flat
                fab
                square
                :dense="$q.platform.is.desktop"
                :color="$q.dark.isActive ? 'light' : 'dark'"
                @click="loadPrevWeek"
              />
              <QVirtualScroll
                ref="virtualScroll"
                v-slot="{ item, index }"
                class="q-mt-xs q-mb-xs"
                :items="weeks"
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
                fab
                square
                :dense="$q.platform.is.desktop"
                :color="$q.dark.isActive ? 'light' : 'dark'"
                @click="loadNextWeek"
              />
            </div>
          </template>
        </ScheduleXCalendar>
        <div v-else-if="!secretaryStore.available" class="flex justify-center">
          <h1
            class="text-primary text-uppercase text-center text-weight-light no-padding"
          >
            Secretary is not available
          </h1>
          <QBtn
            color="accent"
            square
            glossy
            push
            label="Reload page"
            @click="router.go(0)"
          />
        </div>
        <div v-else class="absolute-full flex flex-center">
          <QSpinner size="5em" />
        </div>
      </QPullToRefresh>
    </QScrollArea>
  </QPage>
</template>
<script lang="ts" setup>
import { ref, shallowRef, nextTick, onBeforeMount } from 'vue'
import {
  useQuasar,
  useMeta,
  QVirtualScroll,
  QScrollArea,
  QPage,
  QBtn,
  QPullToRefresh,
  QSpinner,
} from 'quasar'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ScheduleXCalendar } from '@schedule-x/vue'
import {
  viewDay,
  createCalendar,
  createViewDay,
  type CalendarApp,
} from '@schedule-x/calendar'
import { createIcalendarPlugin } from '@schedule-x/ical'
import { createCurrentTimePlugin } from '@schedule-x/current-time'
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { createScrollControllerPlugin } from '@schedule-x/scroll-controller'
import DayCalendar from 'components/DayCalendar.vue'
import CalendarEventCard from 'components/CalendarEventCard.vue'
import useContractStore from 'stores/contract'
import useLangStore from 'stores/lang'
import useSecretaryStore from 'stores/secretary'
import { formatToCalendarDate, isCurrentDate } from '../helpers/calendarHelper'
import { isTMA } from '../composables/detector'
// import { ROUTE_NAMES } from '../router/routes'
import '@schedule-x/theme-shadcn/dist/index.css'

const CALENDAR_WEEK_NUM = 7
const INITIAL_SCROLL = '06:30'

const $q = useQuasar()
const router = useRouter()
const i18n = useI18n()
const langStore = useLangStore()
const contractStore = useContractStore()
const secretaryStore = useSecretaryStore()
const calendarApp = shallowRef<CalendarApp>(null)
const calendarControls = createCalendarControlsPlugin()

const $t = i18n.t
const scrollAreaRef = ref<InstanceType<typeof QScrollArea> | null>(null)

const metaData = {
  'title': $t('pages.calendar.title'),
  'og:title': $t('pages.calendar.title'),
}

const weeks = ref<Date[]>([])
const virtualScroll = ref(null)
const selectedDay = ref(null)

async function onRefresh(done: () => void) {
  try {
    $q.loading.show()
    const ics = await contractStore.loadCalendar()
    calendarApp.value = createCalendarView(ics)
    done()
  } catch (error) {
    console.error(error)
    done()
  } finally {
    $q.loading.hide()
  }
}

function createCalendarView(ics: string): CalendarApp {
  const icalendarPlugin = createIcalendarPlugin({
    data: ics,
  })
  const eventsServicePlugin = createEventsServicePlugin()
  const scrollController = createScrollControllerPlugin({
    initialScroll: INITIAL_SCROLL,
  })

  return createCalendar({
    theme: 'shadcn',
    locale: langStore.language,
    defaultView: viewDay.name,
    firstDayOfWeek: 1,
    isDark: $q.dark.isActive,
    views: [createViewDay()],
    events: contractStore.events,
    plugins: [
      createCurrentTimePlugin({
        fullWeekWidth: false,
      }),
      icalendarPlugin,
      calendarControls,
      eventsServicePlugin,
      scrollController,
    ],
    isResponsive: false,
    callbacks: {
      onRangeUpdate(range): void {
        icalendarPlugin.between(range.start, range.end)

        /* todo - восстановить это если требуется
        const date = formatToCalendarDate(new Date(range.start)) // todo - это должно браться из router.currentRoute.value.query
        await router.push({
          name: ROUTE_NAMES.CALENDAR,
          query: {
            date: date,
          },
        })
        selectedDay.value = date
         */
      },
      async onRender(): void {
        const day = getCurrentDateRoute()
        loadWeek(day)
        const currentIndexDay = weeks.value.findIndex((elem) =>
          isCurrentDate(elem),
        )
        await nextTick()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        virtualScroll.value.scrollTo(currentIndexDay)
      },
    },
  })
}

function getCurrentDateRoute() {
  const instant = formatToCalendarDate(
    router.currentRoute.value.query.date as string,
  )
  return new Date(instant.toJSON())
}

function loadWeek(now: Date) {
  const startOfWeek = new Date(
    now.setDate(now.getDate() - ((now.getDay() + 6) % CALENDAR_WEEK_NUM)),
  )
  const endOfWeek = new Date(
    now.setDate(now.getDate() - now.getDay() + CALENDAR_WEEK_NUM),
  )
  const dates = []
  for (let d = startOfWeek; d <= endOfWeek; d.setDate(d.getDate() + 1)) {
    // для последнего дня недели устанавливаем крайнее значение времени
    if (d.getDay() === 0) {
      d.setHours(23, 59, 59, 999)
    }
    dates.push(new Date(d))
  }
  weeks.value = dates
}

function loadPrevWeek() {
  const [day] = weeks.value
  day.setDate(day.getDate() - CALENDAR_WEEK_NUM)
  loadWeek(day)
}

function loadNextWeek() {
  const [day] = weeks.value
  day.setDate(day.getDate() + CALENDAR_WEEK_NUM)
  loadWeek(day)
}

function selectDay(item: Date) {
  const instant = formatToCalendarDate(item)
  calendarControls.setDate(instant)

  /* todo - нужно при селекте дня обновлять роутер например так:
  await router.push({
    name: router.currentRoute.value.name,
    query: {
      page: page,
      name: router.currentRoute.value.query?.name,
    },
  })
  */
}

function onRemove() {
  scrollAreaRef.value.setScrollPosition('vertical', 0, 150)
  $q.notify({
    type: 'positive',
    message: $t('contract.removeDialog.success', {
      name: 'item.instrument.name',
    }),
  })
}

/* пример обработки роутероа
watch(
  () => router.currentRoute.value.query,
  (value) => {
    contractStore.contracts = [] // clear before load
    currentPage.value = String(value.page)
  },
)
// router.afterEach((to) => updateContracts(to.query))

async function updateContracts({
  page,
  name,
}: LocationQuery | { page: number; name: string }) {
  page = Number(page || 1)
  if (Number.isNaN(page)) {
    return
  }
  const offset = (page - 1) * LIMIT
  const query = String(name ?? '')

  switch (router.currentRoute.value.name) {
    case ROUTE_NAMES.SEARCH: {
      await contractStore.searchFromContracts({
        query,
        offset,
        limit: LIMIT,
      })
      break
    }
    case ROUTE_NAMES.FILTER: {
      await contractStore.filterFromContracts(query)
      break
    }
    default: {
      await contractStore.loadAllContracts({
        offset,
        limit: LIMIT,
      })
      break
    }
  }
  $q.loading.hide()
}
*/

onBeforeMount(async () => {
  if (!isTMA.value) {
    if (!secretaryStore.available) {
      return
    }
  }
  const ics = await contractStore.loadCalendar()
  calendarApp.value = createCalendarView(ics)
})

useMeta(metaData)
</script>
<style scoped>
::-webkit-scrollbar {
  height: 0;
  background: transparent;
}
</style>
<style lang="scss">
.sx-vue-calendar-wrapper {
  height: 100%;
  max-width: calc(100dvi - 1px);

  ::-webkit-scrollbar {
    height: 0;
    background: transparent;
  }
}
.sx__calendar {
  border: none;
}
.sx__week-grid__date-axis {
  display: none;
}
.sx__calendar-header {
  padding: 0;
}
.sx__date-grid-cell {
  height: clamp(80px, 1.25rem, 24px) !important;
}
</style>
