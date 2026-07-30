<template>
  <QDate
    v-model="model"
    :events="events"
    :options="options"
    class="no-box-shadow"
    :default-view="props.defaultView"
    :first-day-of-week="langStore.isRussian ? 1 : null"
    :locale="calendarLocale"
    event-color="secondary"
    color="primary"
    minimal
    square
    @navigation="updateEvents"
    @update:model-value="selectDate"
  />
</template>
<script lang="ts" setup>
import { ref, computed, onMounted, PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { QDate, date } from 'quasar'
import useLangStore from '@/shared/model/lang'
import useGeoStore from '@/shared/model/geo'
import { getCalendarContracts } from '../model/getCalendarContracts'
import type { ContractDate } from '@/entities/contract'
import type { NavigationDate } from '../model/types'

const i18n = useI18n()
const langStore = useLangStore()
const geoStore = useGeoStore()
const $t = i18n.t

const emit = defineEmits(['select'])
const props = defineProps({
  defaultView: {
    type: String as PropType<'Calendar' | 'Months' | 'Years'>,
    default: 'Calendar',
  },
})

const events = ref<string[]>([])
const options = ref<string[]>([])
const model = ref(new Date())

const calendarLocale = computed(() => {
  return langStore.isRussian
    ? {
        days: $t('calendar.days').split('_'),
        daysShort: $t('calendar.daysShort').split('_'),
        months: $t('calendar.months').split('_'),
        monthsShort: $t('calendar.monthsShort').split('_'),
        firstDayOfWeek: 1,
        format24h: true,
      }
    : null
})

let contractDates: ContractDate[] = []
let latestRequest = 0

function selectDate(date: string) {
  emit('select', date)
}

function fillDates(dates: ContractDate[], { month, year }: NavigationDate) {
  const res = new Set<string>()
  for (let i = 0; i < dates.length; i++) {
    if (dates[i].start && dates[i].end) {
      const start = new Date(dates[i].start)
      const end = new Date(dates[i].end)
      const current =
        start.getFullYear() === year && start.getMonth() + 1 === month
          ? start
          : date.startOfDate(date.buildDate({ year, month }), 'month')
      const duration = Math.abs(
        date.getDateDiff(
          current,
          date.getMinDate(date.endOfDate(current, 'month'), end),
        ),
      )
      const currentDate = current.getDate()
      for (let j = currentDate; j <= currentDate + duration; j++) {
        const newDate = date.buildDate({
          year: year,
          month: month,
          days: j,
        })
        res.add(date.formatDate(newDate, 'YYYY/MM/DD'))
      }
    } else if (dates[i].start) {
      res.add(dates[i].start)
    }
  }
  return Array.from(res)
}

async function updateEvents(navigationDate: NavigationDate) {
  const request = ++latestRequest
  const buildDate = date.buildDate(navigationDate)
  const startOfMonth = date.startOfDate(buildDate, 'month')
  const endOfMonth = date.endOfDate(buildDate, 'month')
  const loadedContractDates = (
    await getCalendarContracts({
      from: startOfMonth,
      to: endOfMonth,
      timeZone: geoStore.timeZone,
    })
  )
    .filter((contract) => typeof contract.id === 'number')
    .map((contract) => ({
      id: contract.id as number,
      start: contract.start,
      end: contract.end,
    }))
  if (request !== latestRequest) {
    return
  }
  contractDates = loadedContractDates
  options.value = fillDates(contractDates, navigationDate)
  events.value = contractDates.map(({ start }) => start)
}

onMounted(async () => {
  await updateEvents({
    year: model.value.getFullYear(),
    month: model.value.getMonth() + 1,
  })
})
</script>
