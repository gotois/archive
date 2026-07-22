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
      <QPullToRefresh
        ref="pullToRefreshRef"
        class="calendar-pull-to-refresh absolute-full fit"
        scroll-target=".sx__view-container"
        @refresh="onRefresh"
      >
        <ScheduleXCalendar
          v-if="calendarApp && !calendarLoadError"
          :calendar-app="calendarApp"
        >
          <template #dateGridEvent="{ calendarEvent }">
            <CalendarEventCard
              class="fit"
              :event-id="String(calendarEvent.id)"
              :title="calendarEvent.title"
              :description="calendarEvent.description"
              :start="asZonedDateTime(calendarEvent.start)"
              :end="asZonedDateTime(calendarEvent.end)"
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
              :start="asZonedDateTime(calendarEvent.start)"
              :end="asZonedDateTime(calendarEvent.end)"
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
                  style="width: 44px"
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
        <div
          v-else-if="calendarLoadError"
          class="absolute-full column flex-center q-gutter-md"
          data-test="calendar-error"
        >
          <h1 class="text-negative text-center text-weight-light no-padding">
            {{ $t('pages.calendar.loadError') }}
          </h1>
          <QBtn
            color="accent"
            square
            glossy
            push
            :label="$t('pages.calendar.retry')"
            :loading="isFetching"
            :disable="isFetching"
            data-test="calendar-retry"
            @click="retryCalendarSubscription"
          />
        </div>
        <div
          v-else-if="isPending || isFetching"
          class="absolute-full flex flex-center"
        >
          <QSpinner size="5em" />
        </div>
        <div
          v-else
          class="absolute-full flex flex-center"
          data-test="calendar-empty"
        >
          <h1 class="text-primary text-center text-weight-light no-padding">
            {{ $t('pages.calendar.empty') }}
          </h1>
        </div>
      </QPullToRefresh>
    </QScrollArea>
  </QPage>
</template>
<script lang="ts" setup>
import { ref, shallowRef, nextTick, onBeforeMount, watch } from 'vue'
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
import useLangStore from 'stores/lang'
import useGeoStore from 'stores/geo'
import {
  formatToCalendarDate,
  getCalendarSubscriptionStatus,
  isCurrentDate,
} from '../helpers/calendarHelper'
// import { ROUTE_NAMES } from '@/router/routes'
import { isTMA } from '@/composables/detector'
import { useWebPush } from '@/composables/useWebPush'
import { useCalendarSubscriptionQuery } from '../queries/calendar.queries'
import '@schedule-x/theme-shadcn/dist/index.css'

const { permission, enable: enableWebPush } = useWebPush()

const CALENDAR_WEEK_NUM = 7

const $q = useQuasar()
const router = useRouter()
const i18n = useI18n()
const langStore = useLangStore()
const geoStore = useGeoStore()
const calendarApp = shallowRef<CalendarApp>(null)
const calendarLoadError = shallowRef<unknown>(null)
const calendarControls = createCalendarControlsPlugin()

function asZonedDateTime(
  value: Temporal.PlainDate | Temporal.ZonedDateTime,
): Temporal.ZonedDateTime {
  return value as Temporal.ZonedDateTime
}

const $t = i18n.t
const scrollAreaRef = ref<InstanceType<typeof QScrollArea> | null>(null)
const pullToRefreshRef = ref<InstanceType<typeof QPullToRefresh> | null>(null)

const metaData = {
  'title': $t('pages.calendar.title'),
  'og:title': $t('pages.calendar.title'),
}

const weeks = ref<Date[]>([])
const virtualScroll = ref(null)
const selectedDay = ref<string | null>(null)
const {
  data: calendarSubscription,
  isPending,
  isFetching,
  error: calendarSubscriptionError,
  refetch: refetchCalendarSubscription,
} = useCalendarSubscriptionQuery()

function setCalendarError(error: unknown) {
  console.error(error)
  calendarApp.value = null
  calendarLoadError.value = error
}

function applyCalendarSubscription(ics: string) {
  calendarApp.value = null
  calendarLoadError.value = null

  try {
    if (getCalendarSubscriptionStatus(ics) === 'ready') {
      calendarApp.value = createCalendarView(ics)
    }
  } catch (error) {
    setCalendarError(error)
  }
}

watch(
  calendarSubscription,
  (ics) => {
    if (ics) {
      applyCalendarSubscription(ics)
    }
  },
  { immediate: true },
)

watch(
  calendarSubscriptionError,
  (error) => {
    if (error) {
      setCalendarError(error)
    }
  },
  { immediate: true },
)

async function retryCalendarSubscription() {
  const result = await refetchCalendarSubscription()
  if (result.error) {
    setCalendarError(result.error)
    return
  }
  if (result.data !== undefined) {
    applyCalendarSubscription(result.data)
  }
}

async function onRefresh(done: () => void) {
  try {
    $q.loading.show()
    await retryCalendarSubscription()
  } finally {
    $q.loading.hide()
    done()
  }
}

function createCalendarView(ics: string): CalendarApp {
  const icalendarPlugin = createIcalendarPlugin({
    data: ics,
  })
  const eventsServicePlugin = createEventsServicePlugin()
  const initialScroll = Temporal.Now.plainTimeISO().toString({
    smallestUnit: 'minute',
  })
  const scrollController = createScrollControllerPlugin({
    initialScroll,
  })

  return createCalendar({
    theme: 'shadcn',
    locale: langStore.language,
    timezone: geoStore.timeZone,
    defaultView: viewDay.name,
    firstDayOfWeek: 1,
    isDark: $q.dark.isActive,
    views: [createViewDay()],
    events: [],
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
      async onRender(): Promise<void> {
        const day = getCurrentDateRoute()
        loadWeek(day)
        const currentIndexDay = weeks.value.findIndex((elem) =>
          isCurrentDate(elem),
        )
        await nextTick()
        pullToRefreshRef.value?.updateScrollTarget()
        if (currentIndexDay >= 0) {
          virtualScroll.value.scrollTo(currentIndexDay)
          scrollController.scrollTo(initialScroll)
        }
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
  selectedDay.value = instant.toString()
  calendarControls.setDate(instant as never)

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

onBeforeMount(() => {
  if (!isTMA && permission.value === 'default') {
    $q.notify({
      position: 'top-right',
      timeout: 0,
      message: $t('webPush.requestMessage'),
      actions: [
        {
          label: $t('webPush.enableButton'),
          color: 'white',
          handler: () => {
            void enableWebPush()
          },
        },
        {
          icon: 'close',
          color: 'white',
          round: true,
        },
      ],
    })
  }
})

useMeta(metaData)
</script>
<style lang="scss" scoped>
::-webkit-scrollbar {
  height: 0;
  background: transparent;
}
:deep(.sx-vue-calendar-wrapper) {
  height: 100%;
  max-width: calc(100dvi - 1px);

  ::-webkit-scrollbar {
    height: 0;
    background: transparent;
  }
}
:deep(.calendar-pull-to-refresh > .q-pull-to-refresh__content) {
  height: 100%;
}
:deep(.sx__calendar) {
  border: none;
}
:deep(.sx__week-grid__date-axis) {
  display: none;
}
:deep(.sx__calendar-header) {
  padding: 0;
}
:deep(.sx__date-grid-cell) {
  height: clamp(80px, 1.25rem, 24px) !important;
}
</style>
