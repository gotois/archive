import { defineStore } from 'pinia'
import type { CalendarEventExternal } from '../types/models'

interface Store {
  events: CalendarEventExternal[]
}

export default defineStore('calendar', {
  state: (): Store => ({
    events: [],
  }),
})
