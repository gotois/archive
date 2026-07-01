import { date } from 'quasar'

export function isDateNotOk(value: Date) {
  return Number.isNaN(Date.parse(String(value)))
}

// Специальный формат для календаря Quasar
export function formatDate(x: Date): string {
  return date.formatDate(x, 'YYYY/MM/DD')
}

export function convertTemporalToDate(temporal: {
  toPlainDateTime?: () => unknown
  toString: () => string
}) {
  if (!temporal.toPlainDateTime) {
    return new Date(temporal.toString())
  }
  return new Date(temporal.toString())
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
