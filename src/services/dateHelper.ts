export function isDateNotOk(value: Date) {
  return Number.isNaN(Date.parse(String(value)))
}

export function formatDate(date: Date): string {
  return date.toJSON().substring(0, 10).replace(/-/g, '/')
}

export const formatterDate = new Intl.DateTimeFormat('ru', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})
