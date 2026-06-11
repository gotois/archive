import { uid } from 'quasar'
import jsonRpc from 'request-json-rpc2'
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

  const request = {
    url: process.env.secretary + '/rpc',
    body: {
      jsonrpc: '2.0',
      id: uid(),
      method,
      params,
    },
  } as Request<T>

  const geoStore = useGeoStore()
  const headers = {} as Record<string, string>
  if (geoStore.geolocation) {
    headers.geolocation = geoStore.geolocation
  }
  if (secretaryStore.auth) {
    headers['Authorization'] = secretaryStore.auth
  } else {
    request.credentials = 'include'
  }
  request.headers = headers

  const response = await jsonRpc(request)
  if (response.error) {
    throw response.error
  }
  return response.result
}
