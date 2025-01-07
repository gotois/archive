import { uid } from 'quasar'
import { defineStore } from 'pinia'
import requestJsonRpc2 from 'request-json-rpc2'
import useAuthStore from 'stores/auth'
import {
  ActivityObjectNote,
  ActivityObjectLink,
  Calendar,
  CalendarEventExternal,
} from '../types/models'

const authStore = useAuthStore()

interface Store {
  messages: string[]
}

export default defineStore('chat', {
  state: (): Store => ({
    messages: [],
  }),
  actions: {
    async send(message: string) {
      console.log('message', message)
      this.messages.push(message)
      try {
        const request = {
          url: process.env.server + '/rpc',
          body: {
            jsonrpc: '2.0',
            id: uid(),
            method: 'chat',
            params: {
              '@context': ['https://www.w3.org/ns/activitystreams'],
              'type': 'Collection',
              'totalItems': 0,
              'items': [
                {
                  '@context': 'https://www.w3.org/ns/activitystreams',
                  'type': 'Activity',
                  'object': {
                    type: 'Note',
                    content: message,
                    mediaType: 'text/plain',
                  },
                  // instrument: instrument(message),
                  // actor: group(message.channel_post.chat),
                  // origin: origin(message),
                  // startTime: time(message.channel_post.date),
                  // endTime: time(now),
                },
              ],
            },
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
        const { error, result } = await requestJsonRpc2(request)
        if (error) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
          throw new Error(error.message)
        }
        console.log('result', result)
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        console.warn('GIC Server: ', error.message)
      }
    },
  },
})
