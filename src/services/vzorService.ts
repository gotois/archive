import { uid } from 'quasar'

export default async function (
  method: string,
  params: { content: string; type?: string },
) {
  if (!process.env.server) {
    throw new Error('Unknown JSON-RPC2 server url')
  }
  const headers = new Headers()
  headers.append('Accept', 'application/json')
  headers.append('Content-Type', 'application/json')
  if (process.env.server_basic_auth) {
    headers.set('Authorization', process.env.server_basic_auth)
  }
  const response = await fetch(process.env.server, {
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: uid(),
    }),
    headers: headers,
    method: 'POST',
    signal: AbortSignal.timeout(15000),
  })
  return response.json()
}
