<template>
  <QPage
    :class="{
      'bg-transparent': $q.dark.isActive,
      'bg-grey-1': !$q.dark.isActive,
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
        <ScheduleXCalendar :calendar-app="calendarApp">
          <template #dateGridEvent="{ calendarEvent }">
            <CalendarEventCard
              class="fit"
              :title="calendarEvent.title"
              :start="new Date(calendarEvent.start)"
              :end="new Date(calendarEvent.end)"
              :location="calendarEvent.location"
              :attaches="calendarEvent.attaches"
              :description="calendarEvent.description"
              @on-edit="onEdit(calendarEvent)"
              @on-remove="onRemove(calendarEvent)"
            />
          </template>
          <template #timeGridEvent="{ calendarEvent }">
            <CalendarEventCard
              class="fit"
              :title="calendarEvent.title"
              :start="new Date(calendarEvent.start)"
              :end="new Date(calendarEvent.end)"
              :location="calendarEvent.location"
              :attaches="calendarEvent.attaches"
              :description="calendarEvent.description"
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
      </QPullToRefresh>
    </QScrollArea>
  </QPage>
</template>
<script lang="ts" setup>
import { ref, defineAsyncComponent, onBeforeMount } from 'vue'
import {
  useQuasar,
  useMeta,
  QVirtualScroll,
  QScrollArea,
  QPage,
  QBtn,
  QPullToRefresh,
} from 'quasar'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ScheduleXCalendar } from '@schedule-x/vue'
import { viewDay, createCalendar, createViewDay } from '@schedule-x/calendar'
import { createCurrentTimePlugin } from '@schedule-x/current-time'
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { createScrollControllerPlugin } from '@schedule-x/scroll-controller'
import DayCalendar from 'components/DayCalendar.vue'
import CalendarEventCard from 'components/CalendarEventCard.vue'
import useCalendarStore from 'stores/calendar'
import useLangStore from 'stores/lang'
import { formatToCalendarDate, isCurrentDate } from '../helpers/calendarHelper'
import { ROUTE_NAMES } from '../router/routes'
import '@schedule-x/theme-shadcn/dist/index.css'
import useAuthStore from 'stores/auth'
import useContractStore from 'stores/contract'
import { FormatContract } from '../types/models'

const authStore = useAuthStore()
const contractStore = useContractStore()
const { isLoggedIn } = storeToRefs(authStore)

function onRefresh(done: () => void) {
  console.log('aaa')
  // await updateContracts(router.currentRoute.value.query)
  done()
}

const CALENDAR_WEEK_NUM = 7
const INITIAL_SCROLL = '06:30'

const $q = useQuasar()
const router = useRouter()
const i18n = useI18n()
const langStore = useLangStore()
const calendarStore = useCalendarStore()
const calendarControls = createCalendarControlsPlugin()
const eventsServicePlugin = createEventsServicePlugin()
const scrollController = createScrollControllerPlugin({
  initialScroll: INITIAL_SCROLL,
})
const $t = i18n.t
const scrollAreaRef = ref<InstanceType<typeof QScrollArea> | null>(null)

const metaData = {
  'title': $t('pages.calendar.title'),
  'og:title': $t('pages.calendar.title'),
}

const weeks = ref<Date[]>([])
const virtualScroll = ref(null)
const selectedDay = ref(null)

const calendarApp = createCalendar({
  theme: 'shadcn',
  selectedDate:
    (router.currentRoute.value.query.date as string) ??
    formatToCalendarDate(new Date()),
  locale: langStore.language,
  defaultView: viewDay.name,
  firstDayOfWeek: 1,
  isDark: $q.dark.isActive,
  views: [createViewDay()],
  events: calendarStore.events,
  plugins: [
    createCurrentTimePlugin({
      fullWeekWidth: false,
    }),
    calendarControls,
    eventsServicePlugin,
    scrollController,
  ],
  isResponsive: false,
  callbacks: {
    async onRangeUpdate(range): void {
      const date = formatToCalendarDate(new Date(range.start)) // todo - это должно браться из router.currentRoute.value.query
      await router.push({
        name: ROUTE_NAMES.CALENDAR,
        query: {
          date: date,
        },
      })
      selectedDay.value = date
    },
    async onRender(): void {
      const currentDate = getCurrentDateRoute()
      const day = new Date(currentDate)
      await loadWeek(day)

      const currentIndexDay = weeks.value.findIndex((elem) =>
        isCurrentDate(elem),
      )
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      virtualScroll.value.scrollTo(currentIndexDay)
    },
  },
})

async function loadWeek(now: Date) {
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
  try {
    await calendarStore.loadCalendar(dates.at(0), dates.at(-1))
    eventsServicePlugin.set(calendarStore.events)
  } catch (error) {
    console.error(error)
  }

  weeks.value = dates
}

async function loadPrevWeek() {
  const currentDate = getCurrentDateRoute()
  const day = new Date(currentDate)
  day.setDate(day.getDate() - CALENDAR_WEEK_NUM)
  await loadWeek(day)
}

function getCurrentDateRoute() {
  return (
    (router.currentRoute.value.query.date as string) ??
    formatToCalendarDate(new Date())
  )
}

async function loadNextWeek() {
  const currentDate = getCurrentDateRoute()
  const day = new Date(currentDate)
  day.setDate(day.getDate() + CALENDAR_WEEK_NUM)
  await loadWeek(day)
}

function selectDay(item: Date) {
  const day = formatToCalendarDate(item)
  calendarControls.setDate(day)

  /* todo - нужно при селекте дня обновлять роутер например так:
  $q.loading.show()
  await router.push({
    name: router.currentRoute.value.name,
    query: {
      page: page,
      name: router.currentRoute.value.query?.name,
    },
  })
  $q.loading.hide()
  */
}

async function removeContract(item: FormatContract) {
  try {
    await contractStore.removeContract({
      contract: item,
      usePod: isLoggedIn.value,
    })
    scrollAreaRef.value.setScrollPosition('vertical', 0, 150)
    $q.notify({
      type: 'positive',
      message: $t('contract.removeDialog.success', {
        name: item.instrument.name,
      }),
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: $t('contract.removeDialog.fail'),
    })
  }
}

function onRemove(item: FormatContract) {
  $q.notify({
    message:
      !isLoggedIn.value && item.sameAs
        ? $t('contract.removeDialog.message')
        : $t('contract.removeDialog.isLoginMessage'),
    type: 'negative',
    position: 'center',
    group: false,
    multiLine: true,
    textColor: 'white',
    timeout: 7500,
    attrs: {
      role: 'alertdialog',
    },
    actions: [
      {
        icon: 'check_circle',
        label: $t('contract.removeDialog.ok'),
        color: 'white',
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async handler() {
          await removeContract(item)
        },
      },
      {
        icon: 'cancel',
        label: $t('contract.removeDialog.cancel'),
        color: 'white',
      },
    ],
  })
}

function onEdit(item: FormatContract) {
  const dialog = $q.dialog({
    message: $t('contract.editDialog.message'),
    prompt: {
      model: '',
      type: 'text',
    },
    cancel: true,
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  dialog.onOk(async (/*value: string*/) => {
    try {
      // item.instrument.description = value
      await editContract(item)
      $q.notify({
        type: 'positive',
        message: $t('contract.editDialog.success'),
      })
    } catch (error) {
      console.error(error)
      $q.notify({
        color: 'negative',
        message: $t('contract.editDialog.fail'),
      })
    }
  })
}

async function editContract(item: FormatContract) {
  await contractStore.editContract(item)

  if (isLoggedIn.value) {
    // todo - поддержать обновление на Pod и в Секретаре
    // import usePodStore from 'stores/pod'
    // const podStore = usePodStore()
    // await podStore.updateIntoPod(item)
  }
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
  /* todo - сделать проверку, что если нет текущего дня, то мы его добавляем напримере:
  if (!router.currentRoute.value.query.page) {
    router.currentRoute.value.query.page = '1'
  }
   */
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
