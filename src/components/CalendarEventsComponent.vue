<template>
  <QDate
    v-model="model"
    :events="events"
    :options="options"
    default-view="Calendar"
    first-day-of-week="1"
    event-color="secondary"
    color="primary"
    minimal
    landscape
    @navigation="updateEvents"
    @update:model-value="selectDate"
  >
  </QDate>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { QDate, date } from 'quasar'
import useContractStore from 'stores/contract'

const emit = defineEmits(['select'])
const contractStore = useContractStore()

const events = ref([])
const options = ref([])
const model = ref(new Date())

let contractDates = []

function selectDate(date: string) {
  const filtered = contractDates
    .filter(({ start, end }) => {
      return start >= date || date <= end
    })
    .map(({ id }) => {
      return id as number
    })
  emit('select', filtered)
}

function fillDates(
  dates: { start: number; end?: number }[],
  year: number,
  month: number,
) {
  const res = new Set()
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

async function updateEvents({ year, month }: { year: number; month: number }) {
  const buildDate = date.buildDate({ year: year, month: month })
  const startOfMonth = date.startOfDate(buildDate, 'month')
  const endOfMonth = date.endOfDate(buildDate, 'month')
  contractDates = await contractStore.getCalendarContracts({
    from: startOfMonth,
    to: endOfMonth,
  })
  options.value = fillDates(contractDates, year, month)
  events.value = contractDates.map(({ start }) => start)
}

onMounted(async () => {
  await updateEvents({
    year: model.value.getFullYear(),
    month: model.value.getMonth() + 1,
  })
})
</script>
