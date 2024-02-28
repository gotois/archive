import { uid } from 'quasar'

export default async function (text: string) {
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
      method: 'generate-event',
      params: {
        content: text,
        type: 'plain/text',
      },
      id: uid(),
    }),
    headers: headers,
    method: 'POST',
  })
  return (await response.json()) as {
    name: string
    description: string | null
    location: string | null
    startDate: string | null
    endDate: string | null
    inLanguage: {
      name: string
    }
    organizer: {
      name: string
      email: string | null
      telephone: string | null
      url: string | null
    }
  }
}
