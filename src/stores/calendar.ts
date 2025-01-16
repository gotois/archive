import { defineStore } from 'pinia'
import {
  convertIcalToEvent,
  convertSchemaPodToEvent,
} from '../helpers/calendarHelper'
import useContractStore from 'stores/contract'
import { CalendarEventExternal } from '../types/models'
import rpc from '../helpers/rpc'

interface Store {
  events: CalendarEventExternal[]
}

export default defineStore('calendar', {
  state: (): Store => ({
    events: [],
  }),
  actions: {
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
