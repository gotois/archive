import { uid } from 'quasar'
import requestJsonRpc2 from 'request-json-rpc2'

interface Calendar {
  categories: string[]
  description: string | null
  start: string // like Date
  end: string | null // like Date
  location: string | null
  organizer: string | null // has name, email, telephone, url
  summary: string
}

export type ActivityObjectNote = {
  type: 'Note'
  content: string
  mediaType: string
}

export type ActivityObjectLink = {
  type: 'Link'
  href: string
}

type Activity = {
  '@context': string
  'type': string
  'object'?:
    | ActivityObjectNote
    | ActivityObjectNote[]
    | ActivityObjectLink
    | ActivityObjectLink[]
    | { type: 'Activity' }
  'startTime'?: string
}

function secretary(method: string, params: Activity) {
  if (!process.env.server) {
    throw new Error('Unknown JSON-RPC2 server url')
  }
  return requestJsonRpc2({
    url: process.env.server,
    body: {
      jsonrpc: '2.0',
      id: uid(),
      method,
      params,
    },
    auth: {
      user: process.env.server_basic_auth_user,
      pass: process.env.server_basic_auth_pass,
    },
  })
}

// Есть доступ к GIC
export async function ping() {
  try {
    const { result } = await secretary('ping', {
      '@context': 'https://www.w3.org/ns/activitystreams',
      'type': 'Activity',
      'startTime': new Date().toJSON(),
    })
    return Boolean(result)
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    console.warn('GIC Server: ', error.message)
    return false
  }
}

export async function generateCalendar(activity: Activity) {
  const { error, result } = await secretary('generate-calendar', activity)
  if (error) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
    throw new Error(error.message)
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return JSON.parse(result) as Calendar
}

export async function loadCalendar(startDate: string, endDate?: string): Promise<string> {
  const activity = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    'type': 'Offer',
    'actor': {
      type: 'Person',
      id: 'http://sally.example.org', // todo - поменять актора на имя пользователя
    },
    'object': {
      type: 'Activity',
      startTime: startDate,
      endTime: endDate,
    },
  }
  const { error, result } = await secretary('get-calendar', activity)
  if (error) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
    throw new Error(error.message)
  }
  return result
}
