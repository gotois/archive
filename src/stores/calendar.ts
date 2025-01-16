import { defineStore } from 'pinia'
import {
  // convertIcalToEvent,
  convertSchemaPodToEvent,
} from '../helpers/calendarHelper'
import useContractStore from 'stores/contract'
import { CalendarEventExternal } from '../types/models'
// import rpc from '../helpers/rpc'

interface Store {
  events: CalendarEventExternal[]
}

export default defineStore('calendar', {
  state: (): Store => ({
    events: [],
  }),
  actions: {
    // todo Локально загружаем календарь - нужно придумать что загружать можно как из локалки, так и через Секретаря
    async loadCalendar(startDate: Date, endDate?: Date) {
      /* todo - восстановить RPC
      const result = await rpc('get-calendar', {
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
      // this.events = calendar.map((icalEvent) => convertIcalToEvent(icalEvent))
      */
      const contractStore = useContractStore()
      console.log(
        'загружать не все контракты, а только те что находятся в диапазоне startDate и endDate',
        startDate,
        endDate,
      )
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
