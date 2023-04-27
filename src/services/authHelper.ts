import { LocalStorage } from 'quasar'
import {
  getDefaultSession,
  handleIncomingRedirect,
  login,
} from '@inrupt/solid-client-authn-browser'

const CLIENT_NAME = 'Contracts'

export default async ({
  redirectUrl = window.location.href,
  oidcIssuer = LocalStorage.getItem('oidcIssuer'),
  restorePreviousSession = false,
}: {
  redirectUrl?: string
  oidcIssuer?: string
  restorePreviousSession?: boolean
}) => {
  if (!oidcIssuer) {
    throw new Error('oidcIssuer empty')
  }
  if (!navigator.onLine) {
    return Promise.reject('Not onLine')
  }
  const defaultSession = getDefaultSession().info
  const sessionInfo = await handleIncomingRedirect({
    restorePreviousSession,
  })
  LocalStorage.set('oidcIssuer', oidcIssuer)
  if (!sessionInfo) {
    return login({
      oidcIssuer,
      redirectUrl,
      clientName: CLIENT_NAME,
    })
  }
  const expiresDate = sessionInfo.expirationDate
  const nowDate = new Date()
  const isExpirationAlive =
    (sessionInfo.expirationDate && expiresDate.valueOf() < nowDate.valueOf()) ??
    false
  if (
    sessionInfo.isLoggedIn ||
    isExpirationAlive ||
    defaultSession.sessionId === sessionInfo.sessionId
  ) {
    return Promise.resolve('ok')
  }
  return login({
    oidcIssuer,
    redirectUrl,
    clientName: CLIENT_NAME,
  })
}
