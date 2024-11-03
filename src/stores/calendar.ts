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
    async loadCalendar(start: Date) {
      const calendar = await loadCalendar(start)
      this.events = calendar.map((ical) => convertIcalToEvent(ical))
    },
  },
})
