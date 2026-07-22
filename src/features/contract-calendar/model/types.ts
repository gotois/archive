import type { Agent } from '@/shared/model/contact'
import type { Attachment } from '@/shared/model/media'

export interface Calendar {
  categories: string[]
  description: string | null
  start: string
  end: string | null
  location: string | null
  organizer: Agent
  participants: Agent[]
  summary: string
}

export interface CalendarEventExternal {
  id: number | string
  start: string
  end: string
  title?: string
  actor?: Agent
  participant?: Agent[]
  organizer?: Agent
  attaches?: Attachment[]
  tag?: string[]
  location?: string
  link?: string
  description?: string
  calendarId?: string
  _customContent?: {
    timeGrid?: string
    dateGrid?: string
    monthGrid?: string
    monthAgenda?: string
  }
}

export interface NavigationDate {
  year: number
  month: number
}
