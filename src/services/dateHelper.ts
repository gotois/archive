export function isDateNotOk(value: Date) {
  return Number.isNaN(Date.parse(String(value)))
}

export const formatterDate = new Intl.DateTimeFormat('ru', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})
