import { getDefaultSession } from '@inrupt/solid-client-authn-browser'

export async function createBackendSession(): Promise<void> {
  const response = await getDefaultSession().fetch(
    import.meta.env.server + '/session',
    {
      method: 'POST',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(`Backend session failed: ${response.status}`)
  }
}
