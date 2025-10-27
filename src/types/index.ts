export interface DID {
  id: string;
  address: string;
  tokenBalances: TokenBalance[];
  totalValue: number;
  transactionCount: number;
  pledgedTokens: PledgedToken[];
  createdAt: string;
  lastActivity: string;
}

export interface Token {
  id: string;
  type: 'RBT' | 'FT' | 'NFT' | 'SC';
  owner: string;
  deployer: string;
  state: 'active' | 'inactive' | 'pending';
  blockHeight: number;
  createdAt: string;
  transactionHistory: Transaction[];
  metadata?: TokenMetadata;
}

export interface TokenBalance {
  tokenId: string;
  tokenType: 'RBT' | 'FT' | 'NFT' | 'SC';
  balance: number;
  value: number;
}

export interface PledgedToken {
  tokenId: string;
  amount: number;
  validatorId: string;
  pledgedAt: string;
}

export interface Transaction {
  id: string;
  type: 'transfer' | 'mint' | 'burn' | 'pledge' | 'unpledge' | 'deploy';
  sender: string;
  receiver: string;
  amount: number;
  tokenId?: string;
  blockHeight: number;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  validators: Validator[];
  gasUsed?: number;
  gasPrice?: number;
}

export interface Validator {
  id: string;
  address: string;
  status: 'active' | 'inactive' | 'pending';
  totalPledge: number;
  pledgeCount: number;
  lastActivity: string;
  uptime: number;
}

export interface Block {
  height: number;
  hash: string;
  timestamp: string;
  transactionCount: number;
  validator: string;
  size: number;
  gasUsed: number;
  gasLimit: number;
}

export interface TokenMetadata {
  name?: string;
  symbol?: string;
  description?: string;
  image?: string;
  attributes?: Record<string, any>;
}

export interface NetworkMetrics {
  totalTransactions: number;
  // totalValueSettled: number;
  totalDIDs: number;
  // activeValidators: number;
  // totalPledge: number;
  // averageBlockTime: number;
  // networkHealth: number;
  totalRBT?: number;
  totalFT?: number;
  totalNFT?: number;
  totalSmartContracts?: number;
  // totalAssets?: number;
  marketCap?: number;
  rbtPrice?: number;
  // rbtPriceChange2h?: number;
  // averageTransactionSize?: number;
}

export interface SearchQuery {
  query: string;
  type: 'did' | 'token' | 'transaction' | 'block' | 'validator';
  filters?: SearchFilters;
}

export interface SearchFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  tokenType?: 'RBT' | 'FT' | 'NFT' | 'SC';
  status?: 'active' | 'inactive' | 'pending';
  minValue?: number;
  maxValue?: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AppState {
  searchQuery: string;
  selectedChain: string;
  isLoading: boolean;
  error: string | null;
}

export interface AppAction {
  type: 'SET_SEARCH_QUERY' | 'SET_SELECTED_CHAIN' | 'SET_LOADING' | 'SET_ERROR';
  payload: any;
}

export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  title: string;
  description?: string;
  requiresAuth?: boolean;
}

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}
