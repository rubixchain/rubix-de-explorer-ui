export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL ,
  SEARCH: '/search',
  TRANSACTIONS: '/transactions',
  TOKENS: '/tokens',
  DIDS: '/dids',
  VALIDATORS: '/validators',
  BLOCKS: '/blocks',
  METRICS: '/metrics',
} as const;

export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || true;

export const CHAINS = {
  MAINNET: {
    id: 'mainnet',
    name: 'Rubix Mainnet',
    rpcUrl: 'https://mainnet.rubix.network',
    explorerUrl: 'https://explorer.rubix.network',
    nativeCurrency: {
      name: 'Rubix Token',
      symbol: 'RBT',
      decimals: 18,
    },
  },
  TESTNET: {
    id: 'testnet',
    name: 'Rubix Testnet',
    rpcUrl: 'https://testnet.rubix.network',
    explorerUrl: 'https://testnet-explorer.rubix.network',
    nativeCurrency: {
      name: 'Test Rubix Token',
      symbol: 'TRBT',
      decimals: 18,
    },
  },
} as const;

export const TOKEN_TYPES = {
  RBT: 'RBT',
  FT: 'FT',
  NFT: 'NFT',
  SC: 'SC',
} as const;

export const TRANSACTION_TYPES = {
  TRANSFER: 'transfer',
  MINT: 'mint',
  BURN: 'burn',
  PLEDGE: 'pledge',
  UNPLEDGE: 'unpledge',
  DEPLOY: 'deploy',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
} as const;

export const VALIDATOR_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
} as const;

export const UI_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    MAX_QUERY_LENGTH: 100,
    DEBOUNCE_DELAY: 300,
  },
  ANIMATION: {
    DURATION_FAST: 150,
    DURATION_NORMAL: 300,
    DURATION_SLOW: 500,
  },
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
} as const;

export const COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  SECONDARY: {
    50: '#f8fafc',
    100: '#f1f5f9',
    500: '#64748b',
    700: '#334155',
    900: '#0f172a',
  },
  SUCCESS: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  },
  WARNING: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },
  ERROR: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },
  INFO: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
  },
} as const;

export const SOCIAL_LINKS = {
  GITHUB: 'https://github.com/rubix-network',
  TELEGRAM: 'https://t.me/rubixnetwork',
  TWITTER: 'https://twitter.com/rubixnetwork',
  MEDIUM: 'https://medium.com/@rubixnetwork',
  DISCORD: 'https://discord.gg/rubixnetwork',
} as const;

export const STORAGE_KEYS = {
  SEARCH_HISTORY: 'rubix-explorer-search-history',
  FAVORITES: 'rubix-explorer-favorites',
  SETTINGS: 'rubix-explorer-settings',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SEARCH_ERROR: 'Search failed. Please try again.',
  LOADING_ERROR: 'Failed to load data. Please refresh the page.',
  INVALID_ADDRESS: 'Invalid address format.',
  INVALID_TRANSACTION_ID: 'Invalid transaction ID format.',
  INVALID_BLOCK_HEIGHT: 'Invalid block height.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;

export const SUCCESS_MESSAGES = {
  SEARCH_SUCCESS: 'Search completed successfully.',
  DATA_LOADED: 'Data loaded successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
  FAVORITE_ADDED: 'Added to favorites.',
  FAVORITE_REMOVED: 'Removed from favorites.',
} as const;

export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export const CHART_CONFIG = {
  COLORS: {
    PRIMARY: '#3b82f6',
    SECONDARY: '#64748b',
    SUCCESS: '#22c55e',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#3b82f6',
  },
  ANIMATION: {
    DURATION: 1000,
    EASING: 'easeInOutQuart',
  },
  RESPONSIVE: true,
  MAINTAIN_ASPECT_RATIO: false,
} as const;

export const TIME_FORMATS = {
  FULL: 'YYYY-MM-DD HH:mm:ss',
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  RELATIVE: 'relative',
} as const;

export const NUMBER_FORMATS = {
  CURRENCY: {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  },
  PERCENTAGE: {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  },
  DECIMAL: {
    minimumFractionDigits: 0,
    maximumFractionDigits: 18,
  },
} as const;
