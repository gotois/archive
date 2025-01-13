import { defineStore } from 'pinia'
import {
  convertIcalToEvent,
  convertSchemaPodToEvent,
} from '../helpers/calendarHelper'
import useContractStore from 'stores/contract'
import useAuthStore from 'stores/auth'
import {
  ActivityObjectNote,
  ActivityObjectLink,
  Calendar,
  CalendarEventExternal,
} from '../types/models'
import rpc from '../helpers/rpc'

interface Store {
  available: boolean
  events: CalendarEventExternal[]
}

export default defineStore('calendar', {
  state: (): Store => ({
    events: [],
    available: false,
  }),
  actions: {
    async ping() {
      if (!process.env.server) {
        console.warn('Unknown server url')
        this.available = false
        return
      }
      const authStore = useAuthStore()
      try {
        const response = await fetch(process.env.server + '/ping', {
          method: 'GET',
          headers: {
            'Content-Type': 'text/plain',
            'Authorization': authStore.basicAuth,
          },
        })
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        this.available = Boolean(await response.text())
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        console.warn('GIC Server: ', error.message)
        this.available = false
      }
    },
    getOfferta() {
      return rpc('offerta')
    },
    async generate(object: ActivityObjectNote[] | ActivityObjectLink[]) {
      const result = await rpc('generate-calendar', {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'type': 'Activity',
        'object': object,
      })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
      return result
    },
    async loadCalendar(startDate: Date, endDate?: Date) {
      const activity = {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'type': 'Offer',
        'object': {
          type: 'Activity',
          startTime: startDate,
          endTime: endDate,
        },
      })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
      const calendar = result.data as string[]
       */
      // this.events = calendar.map((icalEvent) => convertIcalToEvent(icalEvent))

      // todo Локально загружаем календарь - нужно придумать что загружать можно как из локалки, так и через Секретаря
      const contractStore = useContractStore()
      await contractStore.loadAllContracts({
        offset: 0,
        limit: 5,
      })
      this.events = contractStore.contracts.map((contract) =>
        convertSchemaPodToEvent(contract),
      )
      console.log('this.events', this.events)
    },
  },
})
