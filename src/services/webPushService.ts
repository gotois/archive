async function getVapidPublicKey(): Promise<string> {
  const response = await fetch(process.env.server + '/actor/vapid')
  const { publicKey } = (await response.json()) as { publicKey: string }
  return publicKey
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)))
}

async function getOrCreateSubscription(): Promise<PushSubscription> {
  const registration: ServiceWorkerRegistration =
    await navigator.serviceWorker.ready

  const existing = await registration.pushManager.getSubscription()
  if (existing) {
    return existing
  }

  const publicKey = await getVapidPublicKey()
  return Promise.race([
    registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }),
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              'subscribe timed out — check FCM connectivity',
            ),
          ),
        3000,
      ),
    ),
  ])
}

export async function sendSubscriptionToServer(subscription: PushSubscription) {
  const response = await fetch(process.env.server + '/web/push/subscribe', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      ...subscription.toJSON(),
      userAgent: navigator.userAgent,
    }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error('Unable to send subscription')
  }
  return await response.json()
}

export async function requestWebPushPermission(): Promise<void> {
  if (!('PushManager' in window)) {
    throw new Error('WebPush: not supported in this context')
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('WebPush: permission denied')
  }

  await silentResubscribe()
}

export async function silentResubscribe(): Promise<void> {
  if (!navigator.serviceWorker || Notification.permission !== 'granted') {
    throw new Error('WebPush: not supported in this context')
  }
  const subscription = await getOrCreateSubscription()
  await sendSubscriptionToServer(subscription)
}
