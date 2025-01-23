import { uid } from 'quasar'
import requestJsonRpc2, {
  JSONRPCResponseError,
  JSONRPCResponseOk,
} from 'request-json-rpc2'
import useSecretaryStore from 'stores/secretary'

type RequestParams<T> = T extends object ? T : string[]
type AuthParams = {
  user: string
  pass: string
}

type Request<T> = {
  url: string
  body: {
    id: string
    method: string
    params: RequestParams<T>
  }
  jwt?: string
  auth?: AuthParams
}

export default async function <T>(
  method: string,
  params: RequestParams<T> = {} as RequestParams<T>,
) {
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
  } as Request<T>
  if (secretaryStore.jwt) {
    request.jwt = secretaryStore.jwt
  } else if (secretaryStore.login && secretaryStore.password) {
    request.auth = {
      user: secretaryStore.login,
      pass: secretaryStore.password,
    }
  } else {
    throw new Error('Auth Unavailable')
  }
  const { result, error } = (await requestJsonRpc2(request)) as unknown as {
    error: JSONRPCResponseError
    result: JSONRPCResponseOk
  }
  if (result) {
    return result
  }
  throw error
}
