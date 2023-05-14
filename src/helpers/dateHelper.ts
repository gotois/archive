import { date } from 'quasar'

export function isDateNotOk(value: Date) {
  return Number.isNaN(Date.parse(String(value)))
}

// Специальный формат для календаря Quasar
export function formatDate(x: Date): string {
  return date.formatDate(x, 'YYYY/MM/DD')
}

// Специальный формат для календаря Google
export function formatIcal(x: Date): string {
  const timezone = Math.floor(x.getTimezoneOffset()) / 60
  const buildDate = date.buildDate({
    year: x.getFullYear(),
    date: x.getDate(),
    hours: x.getHours() + timezone,
    minutes: x.getMinutes(),
    second: x.getSeconds(),
  })
  return date.formatDate(buildDate, 'YYYYMMDDTHHmmss') + '00Z'
}

export const formatterDate = new Intl.DateTimeFormat('ru', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})
