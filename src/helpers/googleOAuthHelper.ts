// https://developers.google.com/identity/gsi/web/reference/html-reference

export const GOOGLE_OAUTH_CLIENT_ID = process.env.google_client_id

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
      reject()
    }
    googleid.onload = () => {
      resolve(true)
    }
  })
}

export async function googleSignInitialize(callback: (data: unknown) => void): Promise<boolean> {
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
      console.log('notification', notification)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      if (notification.isSkippedMoment()) {
        reject('Continue with another identity provider.')
        return
      }
      resolve(true)
    })
  })
}
