export interface AuthenticatedSession {
  authenticated: true
  user: {
    webId: string
  }
}

export interface AuthenticationRequired {
  authenticated: false
  loginUrl: string
}

export async function getBackendSession(
  initData?: string,
): Promise<AuthenticatedSession | AuthenticationRequired> {
  const headers = new Headers()
  if (initData) {
    headers.set('Authorization', `TMA ${initData}`)
  }
  const response = await fetch(import.meta.env.server + '/session', {
    method: 'GET',
    headers,
    credentials: 'include',
  })

  if (response.status === 401) {
    const body = (await response.json()) as { loginUrl?: unknown }
    return {
      authenticated: false,
      loginUrl:
        typeof body.loginUrl === 'string'
          ? body.loginUrl
          : import.meta.env.server + '/login',
    }
  }
  if (!response.ok) {
    throw new Error(`Backend session failed: ${response.status}`)
  }
  return (await response.json()) as AuthenticatedSession
}

export async function deleteBackendSession(): Promise<void> {
  const response = await fetch(import.meta.env.server + '/session', {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error(`Backend logout failed: ${response.status}`)
  }
}

export function submitBackendLogin(
  oidcIssuer: string,
  initData?: string,
): void {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = import.meta.env.server + '/login'
  form.style.display = 'none'

  for (const [name, value] of Object.entries({ oidcIssuer, initData })) {
    if (value === undefined) {
      continue
    }
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.append(input)
  }
  document.body.append(form)
  form.submit()
}
