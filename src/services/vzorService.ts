import { uid } from 'quasar'

export default async function (text: string) {
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
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
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
