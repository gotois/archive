import { getContractsInRange } from '@/entities/contract'
import { taskToCalendarEvent } from '../lib/calendarHelper'
import type { CalendarEventExternal } from './types'

export async function getCalendarContracts({
  from,
  to,
  timeZone,
}: {
  from: Date
  to: Date
  timeZone: string
}): Promise<CalendarEventExternal[]> {
  const contracts = await getContractsInRange({ from, to })
  return contracts.map((contract) => taskToCalendarEvent(contract, timeZone))
}
