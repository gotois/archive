import { defineStore } from 'pinia'
import useSecretaryStore from 'stores/secretary'
import useGeoStore from 'stores/geo'
import { isTMA } from '../composables/detector'
import type {
  CalendarEventExternal,
} from '../types/models'

interface Store {
  events: CalendarEventExternal[]
}

export default defineStore('calendar', {
  state: (): Store => ({
    events: [],
  }),
})
