import { uid } from 'quasar'
import requestJsonRpc2 from 'request-json-rpc2'
import useSecretaryStore from 'stores/secretary'

interface Request {
  url: string
  body: {
    id: string
    method: string
    params: unknown
  }
  jwt?: string
  auth?: {
    user: string
    pass: string
  }
}

export default async function (method: string, params = {}) {
  const secretaryStore = useSecretaryStore()

  if (!secretaryStore.available) {
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
  } as Request
  if (secretaryStore.jwt) {
    request.jwt = secretaryStore.jwt
  } else {
    request.auth = {
      user: secretaryStore.login,
      pass: secretaryStore.password,
    }
  }
  const { result, error } = await requestJsonRpc2(request)
  if (result) {
    return result as unknown
  }
  throw error
}
