import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Coins, 
  User, 
  Activity, 
  Hash, 
  Copy, 
  Check, 
  ExternalLink,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  Zap,
  Shield,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Token, Transaction } from '@/types';

interface TokenDetailsProps {
  tokenId: string;
  className?: string;
}

const generateMockTokenData = (id: string): Token => ({
  id,
  type: 'RBT',
  owner: `did:rubix:${Math.random().toString(36).substr(2, 9)}`,
  deployer: `did:rubix:${Math.random().toString(36).substr(2, 9)}`,
  state: 'active',
  blockHeight: 1234567,
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  transactionHistory: [],
  metadata: {
    name: 'Rubix Token',
    symbol: 'RBT',
    description: 'The native token of the Rubix ecosystem',
    image: '/images/rbt-token.png',
  },
});

const generateMockTokenTransactions = (count: number): Transaction[] => {
  const types: Array<'transfer' | 'mint' | 'burn' | 'pledge' | 'unpledge' | 'deploy'> = 
    ['transfer', 'mint', 'burn', 'pledge', 'unpledge', 'deploy'];
  const statuses: Array<'pending' | 'confirmed' | 'failed'> = 
    ['pending', 'confirmed', 'failed'];

  return Array.from({ length: count }, (_, i) => ({
    id: `tx_${Date.now()}_${i}`,
    type: types[Math.floor(Math.random() * types.length)],
    sender: `did:rubix:${Math.random().toString(36).substr(2, 9)}`,
    receiver: `did:rubix:${Math.random().toString(36).substr(2, 9)}`,
    amount: Math.floor(Math.random() * 10000) + 100,
    tokenId: 'RBT',
    blockHeight: 1234567 - i,
    timestamp: new Date(Date.now() - i * 60000).toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    validators: [],
    gasUsed: Math.floor(Math.random() * 21000) + 21000,
    gasPrice: Math.random() * 0.001 + 0.0001,
  }));
};

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'transfer':
      return ArrowUpRight;
    case 'mint':
      return Plus;
    case 'burn':
      return Minus;
    case 'pledge':
    case 'unpledge':
      return Zap;
    case 'deploy':
      return ExternalLink;
    default:
      return ArrowUpRight;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
    case 'active':
      return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    case 'failed':
    case 'inactive':
      return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  }
};

const getTokenTypeColor = (type: string) => {
  switch (type) {
    case 'RBT':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    case 'FT':
      return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    case 'NFT':
      return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
    case 'SC':
      return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  }
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const formatAddress = (address: string, length: number = 8): string => {
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const TokenDetails: React.FC<TokenDetailsProps> = ({
  tokenId,
  className = '',
}) => {
  const [token, setToken] = useState<Token | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setToken(generateMockTokenData(tokenId));
      setTransactions(generateMockTokenTransactions(10));
      setIsLoading(false);
    }, 1000);
  }, [tokenId]);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="space-y-6">
          <Card className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className={`${className}`}>
        <Card className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Coins className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Token not found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            The token "{tokenId}" could not be found.
          </p>
        </Card>
      </div>
    );
  }

  const totalSupply = 1000000;
  const circulatingSupply = 750000;
  const marketCap = 1250000;
  const priceChange24h = 5.2;

  return (
    <div className={`${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-4 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                  <Coins className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold text-heading dark:text-white">
                      {token.metadata?.name || 'Unknown Token'}
                    </h1>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTokenTypeColor(token.type)}`}>
                      {token.type}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(token.state)}`}>
                      {token.state}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Hash className="w-4 h-4" />
                      <span>{formatAddress(token.id)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Created {formatTimeAgo(token.createdAt)}</span>
                    </div>
                  </div>
                  {token.metadata?.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {token.metadata.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(token.id, 'token-id')}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {copiedId === 'token-id' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Chain
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Token Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg w-fit mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatCurrency(marketCap)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Market Cap</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg w-fit mx-auto mb-3">
                <Coins className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {totalSupply.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Supply</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg w-fit mx-auto mb-3">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {circulatingSupply.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Circulating</div>
            </Card>

            <Card className="p-6 text-center">
              <div className={`p-3 rounded-lg w-fit mx-auto mb-3 ${priceChange24h >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                {priceChange24h >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div className={`text-2xl font-bold mb-1 ${priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">24h Change</div>
            </Card>
          </div>
        </motion.div>

        {/* Token Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-heading dark:text-white mb-4">
              Token Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Token ID</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                      {formatAddress(token.id)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(token.id, 'token-id-copy')}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {copiedId === 'token-id-copy' ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Type</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTokenTypeColor(token.type)}`}>
                    {token.type}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">State</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(token.state)}`}>
                    {token.state}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Block Height</span>
                  <span className="font-mono text-sm text-gray-900 dark:text-white">
                    #{token.blockHeight.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Owner</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                      {formatAddress(token.owner)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(token.owner, 'owner-copy')}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {copiedId === 'owner-copy' ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Deployer</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                      {formatAddress(token.deployer)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(token.deployer, 'deployer-copy')}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {copiedId === 'deployer-copy' ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Created</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatTimeAgo(token.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Transactions
              </h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {transactions.map((transaction, index) => {
                const Icon = getTransactionIcon(transaction.type);
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                        <Icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="font-mono text-sm text-gray-900 dark:text-white">
                          {formatAddress(transaction.id)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {transaction.type} • {formatTimeAgo(transaction.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {transaction.amount.toLocaleString()} {token.type}
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export type { TokenDetailsProps };
