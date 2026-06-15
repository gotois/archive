declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined
    VUE_ROUTER_BASE: string | undefined
  }
}

interface ImportMetaEnv {
  readonly [key: string]: string | boolean | undefined
  readonly secretary: string
  readonly server: string
  readonly telegram_bot_name: string
  readonly google_client_id: string
  readonly google_redirect_uri: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
