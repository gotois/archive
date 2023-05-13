import { date } from 'quasar'

export function isDateNotOk(value: Date) {
  return Number.isNaN(Date.parse(String(value)))
}

// Специальный формат для календаря Quasar
export function formatDate(x: Date): string {
  return date.formatDate(x, 'YYYY/MM/DD')
}

export const formatterDate = new Intl.DateTimeFormat('ru', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})
