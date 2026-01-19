import { date } from 'quasar'
import { Temporal } from '@js-temporal/polyfill'

export function isDateNotOk(value: Date) {
  return Number.isNaN(Date.parse(String(value)))
}

// Специальный формат для календаря Quasar
export function formatDate(x: Date): string {
  return date.formatDate(x, 'YYYY/MM/DD')
}

export function convertTemporalToDate(temporal: Temporal.ZonedDateTime) {
  return new Date(
    temporal
      .toPlainDateTime()
      .toZonedDateTime(Temporal.Now.timeZoneId()).epochMilliseconds,
  )
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
