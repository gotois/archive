import { requestText } from '../http'

export interface PodProfile {
  webId: string
  resourceRootUrl: string
  email: string | null
  avatar: string | null
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(import.meta.env.server + path, {
    ...init,
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<T>
}

export const podApi = {
  initialize: () =>
    requestJson<{ resourceRootUrl: string }>('/pod', { method: 'POST' }),
  getProfile: () => requestJson<PodProfile>('/pod/profile'),
  updateProfile: (profile: { email: string | null; avatar: string | null }) =>
    requestJson<PodProfile>('/pod/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    }),
  getContracts: () => requestJson<{ links: string[] }>('/pod/contracts'),
  deleteContracts: async () => {
    await requestText(import.meta.env.server + '/pod/contracts', {
      method: 'DELETE',
      credentials: 'include',
    })
  },
  updateCalendar: async (ical: string) => {
    await requestText(import.meta.env.server + '/pod/calendar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ical }),
      credentials: 'include',
    })
  },
}
