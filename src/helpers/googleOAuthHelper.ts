// https://developers.google.com/identity/gsi/web/reference/html-reference

function loadGoogleId(lang: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const googleid = document.createElement('script')
    googleid.setAttribute(
      'src',
      'https://accounts.google.com/gsi/client?hl=' + lang,
    )
    googleid.defer = true
    document.head.appendChild(googleid)
    googleid.onerror = () => {
      reject()
    }
    googleid.onload = () => {
      resolve(window.google)
    }
  })
}

export async function googleIdInit(
  lang: string,
  callback: (data: unknown) => void,
) {
  const google = await loadGoogleId(lang.replace(/-.+/, ''))
  window.handleCredentialResponse = callback
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  google.accounts.id.initialize({
    client_id: googleClientId,
    auto_select: true,
    cancel_on_tap_outside: true,
    callback: callback,
    ux_mode: 'popup',
    itp_support: true,
    context: 'signin',
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  google.accounts.id.prompt((notification: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      console.log('continue with another identity provider.')
      return false
    }
    return true
  })
}

export const googleClientId = process.env.google_client_id
