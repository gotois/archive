import { defineStore } from 'pinia'
import { loadCalendar } from '../services/secretary'
import { convertIcalToEvent } from '../helpers/calendarHelper'
import { CalendarEventExternal } from '../types/models'

interface Store {
  events: CalendarEventExternal[]
}

export default defineStore('calendar', {
  state: (): Store => ({
    events: [],
  }),
  actions: {
    async loadCalendar(day: string) {
      const calendar = await loadCalendar(day)
      this.events = calendar.map((icalEvent) => convertIcalToEvent(icalEvent))
    },
  },
})
