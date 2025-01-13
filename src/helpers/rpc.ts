import { uid } from 'quasar'
import requestJsonRpc2 from 'request-json-rpc2'
import useAuthStore from 'stores/auth'

export default async function (method: string, params = {}) {
  const authStore = useAuthStore()
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
  return await requestJsonRpc2(request)
}
