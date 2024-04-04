// Configuration for your app
// https://v2.quasar.dev/quasar-cli/quasar-conf-js

/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const { configure } = require('quasar/wrappers')
const pkg = require('./package.json')

module.exports = configure((ctx) => {
  if (ctx.dev) {
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

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli/boot-files
    boot: ['i18n', 'addressbar-color'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {
      env: {
        google_client_id: process.env.GOOGLE_CLIENT_ID,
        server: process.env.SERVER_RPC2,
        server_basic_auth_user: process.env.SERVER_RPC2_USERNAME,
        server_basic_auth_pass: process.env.SERVER_RPC2_PASSWORD,
      },
      target: {
        browser: 'esnext',
      },
      modulePreload: {
        polyfill: false,
      },
      cssCodeSplit: false,
      lib: 'es',
      reportCompressedSize: false,
      vueRouterMode: 'history',
      publicPath: '/',
      rebuildCache: true, // rebuilds Vite/linter/etc cache on startup
      rtl: false, // https://v2.quasar.dev/options/rtl-support
      showProgress: true,
      gzip: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
    devServer: {
      https: false,
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
      workboxOptions: {},
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
