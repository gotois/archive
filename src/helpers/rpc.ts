import { uid } from 'quasar'
import requestJsonRpc2, {
  JSONRPCErrorResponse,
  JSONRPCSuccessResponse,
} from 'request-json-rpc2'
import useSecretaryStore from 'stores/secretary'
import useGeoStore from 'stores/geo'

type RequestParams<T> = T extends object ? T : string[]

type Request<T> = {
  url: string
  body: {
    id: string
    method: string
    params: RequestParams<T>
  }
}

export default async function <T>(
  method: string,
  params: RequestParams<T> = {} as RequestParams<T>,
) {
  const secretaryStore = useSecretaryStore()
  if (!secretaryStore.available) {
    throw new Error('Server Unavailable')
  }
  const geoStore = useGeoStore()
  const headers = {} as Record<string, string>
  if (geoStore.geolocation) {
    headers.geolocation = geoStore.geolocation
  }
  if (secretaryStore.auth) {
    headers['Authorization'] = secretaryStore.auth
  }

  const request = {
    url: process.env.server + '/rpc',
    body: {
      jsonrpc: '2.0',
      id: uid(),
      method,
      params,
    },
    credentials: 'include',
    headers: headers,
  } as Request<T>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const response = (await requestJsonRpc2(request)) as {
    error?: JSONRPCErrorResponse
    result?: JSONRPCSuccessResponse
  }
  if (response.error) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw response.error
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return response.result
}
