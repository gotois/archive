import { date } from 'quasar'

export function isDateNotOk(value: Date) {
  return Number.isNaN(Date.parse(String(value)))
}

// Специальный формат для календаря Quasar
export function formatDate(x: Date): string {
  return date.formatDate(x, 'YYYY/MM/DD')
}

export function convertTemporalToDate(temporal: Temporal.ZonedDateTime): Date {
  return new Date(temporal.epochMilliseconds)
}

// Специальный формат для календаря Google
export function formatIcal(x: Date): string {
  const utcDate = date.buildDate({
    year: x.getUTCFullYear(),
    month: x.getUTCMonth() + 1,
    date: x.getUTCDate(),
    hours: x.getUTCHours(),
    minutes: x.getUTCMinutes(),
    second: x.getUTCSeconds(),
  })
  return date.formatDate(utcDate, 'YYYYMMDDTHHmmss') + 'Z'
}

export function prettyDate(start: string, end?: string | null): string {
  const fmt = new Intl.DateTimeFormat('ru', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  if (!end) {
    return fmt.format(new Date(start))
  }
  return `${fmt.format(new Date(start))} — ${fmt.format(new Date(end))}`
}

export function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
