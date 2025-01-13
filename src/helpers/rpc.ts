import { uid } from 'quasar'
import requestJsonRpc2 from 'request-json-rpc2'
import useAuthStore from 'stores/auth'
import useCalendarStore from 'stores/calendar'

export default async function (method: string, params = {}) {
  const authStore = useAuthStore()
  const calendarStore = useCalendarStore()

  if (!calendarStore.available) {
    throw new Error('Server Unavailable')
  }
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
  const { result, error } = await requestJsonRpc2(request)
  if (result) {
    return result as unknown
  }
  throw error
}
