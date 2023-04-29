import { Notify } from 'quasar'
import { register } from 'register-service-worker'

// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  registrationOptions: { scope: './' },

  ready(/* registration */) {
    console.log('Service worker is active.')
  },
  registered(/* registration */) {
    console.log('Service worker has been registered.')
  },
  cached(/* registration */) {
    console.log('Content has been cached for offline use.')
  },
  updatefound(/* registration */) {
    Notify.create({
      spinner: true,
      message: 'New content is downloading',
      timeout: 2000,
    })
  },
  updated(registration) {
    Notify.create({
      message: 'New content is available',
      icon: 'announcement',
      actions: [
        {
          label: 'Refresh',
          color: 'white',
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          handler: async () => {
            await registration.unregister()
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.location.reload()
          },
        },
      ],
    })
  },
  offline() {
    Notify.create(
      'No internet connection found. App is running in offline mode.',
    )
  },
  error(err) {
    console.error('Error during service worker registration:', err)
  },
})
