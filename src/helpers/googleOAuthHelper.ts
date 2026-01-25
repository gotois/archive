// https://developers.google.com/identity/gsi/web/reference/html-reference

export const GOOGLE_OAUTH_CLIENT_ID = process.env.google_client_id
export const GOOGLE_REDIRECT_URI = process.env.google_redirect_uri

export type GoogleHandlerResponse = {
  clientId: string
  client_id: string
  credential: string
  select_by: string
}

export const GOOGLE_OAUTH_LINK =
  'https://accounts.google.com/o/oauth2/v2/auth?client_id=' +
  GOOGLE_OAUTH_CLIENT_ID +
  '&redirect_uri=' +
  encodeURIComponent(GOOGLE_REDIRECT_URI) +
  '&response_type=code&scope=' +
  encodeURIComponent('https://www.googleapis.com/auth/calendar') +
  '&access_type=' +
  'offline' +
  '&prompt=' +
  'consent'

export function loadGoogleSignIn(lang: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const googleid = document.createElement('script')
    googleid.setAttribute(
      'src',
      'https://accounts.google.com/gsi/client?hl=' + lang.replace(/-.+/, ''),
    )
    googleid.defer = true
    document.head.appendChild(googleid)
    googleid.onerror = () => {
      reject(new Error('Cannot load Google Sign In'))
    }
    googleid.onload = () => {
      resolve(true)
    }
  })
}

export async function googleSignInitialize(
  callback: (data: unknown) => void,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    window.handleCredentialResponse = callback
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    window.google.accounts.id.initialize({
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      auto_select: true,
      cancel_on_tap_outside: true,
      callback: callback,
      ux_mode: 'popup',
      itp_support: true,
      context: 'signin',
    })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    window.google.accounts.id.prompt((notification: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      if (notification.isSkippedMoment()) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        reject('Continue with another identity provider.')
        return
      }
      resolve(true)
    })
  })
}
