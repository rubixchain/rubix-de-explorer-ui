import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  User, 
  Coins, 
  Activity, 
  Shield, 
  Copy, 
  Check, 
  ExternalLink,
  TrendingUp,
  Clock,
  Hash,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  Zap
} from 'lucide-react';
import { DID, TokenBalance, PledgedToken, Transaction } from '@/types';

interface DIDDetailsProps {
  didId: string;
  className?: string;
}

const generateMockDIDData = (id: string): DID => ({
  id,
  address: `0x${Math.random().toString(16).substr(2, 40)}`,
  tokenBalances: [
    { tokenId: 'RBT', tokenType: 'RBT', balance: 1250, value: 1250 },
    { tokenId: 'FT_001', tokenType: 'FT', balance: 500, value: 250 },
    { tokenId: 'NFT_001', tokenType: 'NFT', balance: 1, value: 100 },
    { tokenId: 'SC_001', tokenType: 'SC', balance: 1, value: 50 },
  ],
  totalValue: 1650,
  transactionCount: 45,
  pledgedTokens: [
    { tokenId: 'RBT', amount: 100, validatorId: 'validator_1', pledgedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    { tokenId: 'RBT', amount: 50, validatorId: 'validator_2', pledgedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  ],
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
});

const generateMockTransactions = (count: number): Transaction[] => {
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
      return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    case 'failed':
      return 'text-red-600 bg-red-100 dark:bg-red-900/20';
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

export const DIDDetails: React.FC<DIDDetailsProps> = ({
  didId,
  className = '',
}) => {
  const [did, setDID] = useState<DID | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setDID(generateMockDIDData(didId));
      setTransactions(generateMockTransactions(10));
      setIsLoading(false);
    }, 1000);
  }, [didId]);

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

  if (!did) {
    return (
      <div className={`${className}`}>
        <Card className="text-center py-12">
          <div className="text-red-500 mb-4">
            <User className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            DID not found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            The DID "{didId}" could not be found.
          </p>
        </Card>
      </div>
    );
  }

  const totalPledged = did.pledgedTokens.reduce((sum, token) => sum + token.amount, 0);

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
                  <User className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-heading dark:text-white mb-2">
                    {did.id}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Hash className="w-4 h-4" />
                      <span>{formatAddress(did.address)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Created {formatTimeAgo(did.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(did.id, 'did-id')}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {copiedId === 'did-id' ? (
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

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg w-fit mx-auto mb-3">
                <Coins className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatCurrency(did.totalValue)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Value</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg w-fit mx-auto mb-3">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {did.transactionCount}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Transactions</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg w-fit mx-auto mb-3">
                <Coins className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {did.tokenBalances.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Token Types</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg w-fit mx-auto mb-3">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {totalPledged}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Pledged RBT</div>
            </Card>
          </div>
        </motion.div>

        {/* Token Balances */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-heading dark:text-white mb-4">
              Token Balances
            </h2>
            <div className="space-y-3">
              {did.tokenBalances.map((balance, index) => (
                <div
                  key={balance.tokenId}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                      <Coins className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {balance.tokenId}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {balance.tokenType} Token
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {balance.balance.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(balance.value)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Pledged Tokens */}
        {did.pledgedTokens.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-heading dark:text-white mb-4">
                Pledged Tokens
              </h2>
              <div className="space-y-3">
                {did.pledgedTokens.map((pledge, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <Shield className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {pledge.amount} RBT
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Validator: {formatAddress(pledge.validatorId)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Pledged {formatTimeAgo(pledge.pledgedAt)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
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
                        {transaction.amount.toLocaleString()} RBT
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

export type { DIDDetailsProps };
