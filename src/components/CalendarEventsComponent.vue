<template>
  <QDate
    v-model="model"
    :events="events"
    :options="options"
    default-view="Calendar"
    first-day-of-week="1"
    event-color="primary"
    color="secondary"
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

function fillDates(dates: { start: number; end?: number }[]) {
  const res = new Set()
  for (let i = 0; i < dates.length; i++) {
    if (dates[i].start && dates[i].end) {
      const from = new Date(dates[i].start)
      const until = new Date(dates[i].end)
      const duration = Math.abs(
        date.getDateDiff(
          from,
          date.getMinDate(date.endOfDate(from, 'month'), until),
        ),
      )
      for (let j = 0; j < duration; j++) {
        const newDate = date.addToDate(from, { days: j })
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
  options.value = fillDates(contractDates)
  events.value = contractDates.map(({ start }) => start)
}

onMounted(async () => {
  await updateEvents({
    year: model.value.getFullYear(),
    month: model.value.getMonth() + 1,
  })
})
</script>
