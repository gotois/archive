import { uid } from 'quasar'
import { defineStore } from 'pinia'
import requestJsonRpc2 from 'request-json-rpc2'
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

const authStore = useAuthStore()

interface Store {
  available: boolean
  events: CalendarEventExternal[]
}

function makeRequest(method: string, params = {}) {
  const request = {
    url: process.env.server + '/rpc',
    body: {
      jsonrpc: '2.0',
      id: uid(),
      method,
      params,
    },
  }
  if (authStore.jwt) {
    request.jwt = authStore.jwt
  } else {
    request.auth = {
      user: authStore.login,
      pass: authStore.password,
    }
  }
  return request
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
    async getOfferta() {
      return await requestJsonRpc2(makeRequest('offerta'))
    },
    async calendar(object: ActivityObjectNote[] | ActivityObjectLink[]) {
      if (!this.available) {
        throw new Error('Server Unavailable')
      }
      const { error, result } = await requestJsonRpc2(
        makeRequest('add-calendar', {
          '@context': 'https://www.w3.org/ns/activitystreams',
          'type': 'Activity',
          'object': object,
        }),
      )
      if (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
        throw new Error(error.message)
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
      return JSON.parse(result.data) as Calendar
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
      }
      const request = {
        url: process.env.server + '/rpc',
        body: {
          jsonrpc: '2.0',
          id: uid(),
          method: 'get-calendar',
          params: activity,
        },
      }
      if (authStore.jwt) {
        request.jwt = authStore.jwt
      } else {
        request.auth = {
          user: authStore.login,
          pass: authStore.password,
        }
      }
      /* todo - восстановить RPC
      const { error, result } = await requestJsonRpc2(request)
      if (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
        throw new Error(error.message)
      }
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
