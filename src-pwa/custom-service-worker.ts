// eslint-disable-next-line no-undef
declare const self: ServiceWorkerGlobalScope & typeof globalThis

import { clientsClaim } from 'workbox-core'
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
self.skipWaiting()
clientsClaim()

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST)

cleanupOutdatedCaches()

if (process.env.PWA_FALLBACK_HTML) {
  precacheAndRoute([
    {
      url: process.env.PWA_FALLBACK_HTML,
      revision: null,
    },
  ])
}

// Non-SSR fallback to index.html
// Production SSR fallback to offline.html (except for dev)
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(
      createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML),
      {
        denylist: [/sw\.js$/, /workbox-(.)*\.js$/],
      },
    ),
  )
}

interface PushPayload {
  title?: string
  body?: string
  icon?: string
  badge?: string
  tag?: string
  url?: string
}

self.addEventListener('push', (event: PushEvent) => {
  let data: PushPayload
  try {
    data = (event.data?.json() as PushPayload) ?? {}
  } catch {
    data = { body: event.data?.text() ?? '' }
  }

  const title = data.title ?? 'Secretary'
  const options: NotificationOptions = {
    body: data.body ?? '',
    icon: data.icon ?? '/icons/icon-192x192.png',
    badge: data.badge ?? '/icons/icon-128x128.png',
    tag: data.tag ?? 'secretary-push',
    data: { url: data.url ?? '/' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()

  const targetUrl = (event.notification.data?.url as string | undefined) ?? '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            void client.focus()
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
            void (client as any).navigate(targetUrl)
            return
          }
        }
        return self.clients.openWindow(targetUrl)
      }),
  )
})

