/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL_MAINNET: string
  readonly VITE_API_BASE_URL_TESTNET: string
  readonly VITE_NODE_ENV: string
  readonly VITE_GOOGLE_ANALYTICS_ID: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_DEBUG_MODE: string
  readonly VITE_NETWORK: 'mainnet' | 'testnet'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
