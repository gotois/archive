// Configuration for your app
// https://v2.quasar.dev/quasar-cli/quasar-conf-js

/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { configure } = require('quasar/wrappers')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require('./package.json')

module.exports = configure((ctx) => {
  if (ctx.dev) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('dotenv').config()
  }
  return {
    eslint: {
      fix: !ctx.prod,
      warnings: ctx.prod,
      errors: ctx.prod,
    },

    // https://v2.quasar.dev/quasar-cli/supporting-ts
    supportTS: {
      tsCheckerConfig: {
        eslint: {
          enabled: true,
          files: './src/**/*.{ts,js,vue}',
        },
      },
    },

    // https://v2.quasar.dev/quasar-cli/prefetch-feature
    preFetch: true,

    // https://v2.quasar.dev/quasar-cli/boot-files
    // eslint-disable-next-line
    boot: [
      'i18n',
      'addressbar-color',
      'health',
      'tg-mini-app',
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {
      env: {
        server: process.env.SERVER_HOST,
        telegram_bot_name: process.env.TELEGRAM_BOT_NAME,
        google_client_id: process.env.GOOGLE_CLIENT_ID,
        google_redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        vapid_public_key: process.env.VAPID_PUBLIC_KEY,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        demo_user: !ctx.prod && JSON.parse(process.env.TELEGRAM_TEST_USER),
      },
      target: {
        browser: 'esnext',
      },
      modulePreload: {
        polyfill: false,
      },
      cssCodeSplit: false,
      lib: 'es',
      reportCompressedSize: ctx.prod,
      vueRouterMode: 'history',
      publicPath: '/',
      rebuildCache: true, // rebuilds Vite/linter/etc cache on startup
      rtl: false, // https://v2.quasar.dev/options/rtl-support
      showProgress: true,
      gzip: true,
      // analyze: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
    devServer: {
      https: {
        key: 'certs/localhost-key.pem',
        cert: 'certs/localhost.pem',
      },
      host: 'localhost',
      port: 8080,
      open: true, // opens browser window automatically
    },

    // https://v2.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
    framework: {
      config: {
        dark: 'auto',
        notify: {
          /* look at QuasarConfOptions from the API card */
        },
      },

      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'ru', // Quasar language pack

      // Quasar plugins
      plugins: [
        'Notify',
        'BottomSheet',
        'Loading',
        'Dialog',
        'Meta',
        'LocalStorage',
        'SessionStorage',
      ],
    },

    // https://v2.quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'injectManifest',
      workboxOptions: {
        globPatterns: ['**/*.{js,css,html,png,svg}'],
      },
      manifest: {
        name: pkg.productName,
        short_name: pkg.productName,
        description: pkg.description,
        start_url: '.',
        display: 'standalone',
        orientation: 'portrait',
        // lang: 'ru',
        dir: 'auto',
        scope: '/',
        iarc_rating_id: 'e84b072d-71b3-4d3e-86ae-31a8ce4e53b7',
        categories: ['productivity'],
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        url_handlers: [
          {
            origin: 'https://archive.gotointeractive.com',
          },
        ],
      },
      metaVariables: {
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'default',
        appleTouchIcon120: 'icons/apple-icon-120x120.png',
        appleTouchIcon180: 'icons/apple-icon-180x180.png',
        appleTouchIcon152: 'icons/apple-icon-152x152.png',
        appleTouchIcon167: 'icons/apple-icon-167x167.png',
        appleSafariPinnedTab: 'icons/safari-pinned-tab.svg',
        msapplicationTileImage: 'icons/ms-icon-144x144.png',
        msapplicationTileColor: '#000000',
      },
      sourceFiles: {
        pwaRegisterServiceWorker: 'src-pwa/register-service-worker',
        pwaServiceWorker: 'src-pwa/custom-service-worker',
        pwaManifestFile: 'src-pwa/manifest.json',
      },
    },
  }
})
