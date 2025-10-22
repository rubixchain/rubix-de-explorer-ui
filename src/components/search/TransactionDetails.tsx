import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Hash, 
  Activity, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  Zap,
  Shield,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Transaction, Validator } from '@/types';

interface TransactionDetailsProps {
  transactionId: string;
  className?: string;
}

const generateMockTransactionData = (id: string): Transaction => ({
  id,
  type: 'transfer',
  sender: `did:rubix:${Math.random().toString(36).substr(2, 9)}`,
  receiver: `did:rubix:${Math.random().toString(36).substr(2, 9)}`,
  amount: 1250,
  tokenId: 'RBT',
  blockHeight: 1234567,
  timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  status: 'confirmed',
  validators: [
    {
      id: 'validator_1',
      address: `did:rubix:validator_${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      totalPledge: 10000,
      pledgeCount: 50,
      lastActivity: new Date().toISOString(),
      uptime: 99.8,
    },
    {
      id: 'validator_2',
      address: `did:rubix:validator_${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      totalPledge: 8000,
      pledgeCount: 40,
      lastActivity: new Date().toISOString(),
      uptime: 99.5,
    },
  ],
  gasUsed: 21000,
  gasPrice: 0.0001,
});

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

const getTypeColor = (type: string) => {
  switch (type) {
    case 'transfer':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    case 'mint':
      return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    case 'burn':
      return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    case 'pledge':
    case 'unpledge':
      return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
    case 'deploy':
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
    maximumFractionDigits: 6,
  }).format(amount);
};

const formatGasPrice = (gasPrice: number): string => {
  return `${gasPrice.toFixed(6)} RBT`;
};

const formatGasUsed = (gasUsed: number): string => {
  return gasUsed.toLocaleString();
};

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transactionId,
  className = '',
}) => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setTransaction(generateMockTransactionData(transactionId));
      setIsLoading(false);
    }, 1000);
  }, [transactionId]);

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

  if (!transaction) {
    return (
      <div className={`${className}`}>
        <Card className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Hash className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Transaction not found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            The transaction "{transactionId}" could not be found.
          </p>
        </Card>
      </div>
    );
  }

  const Icon = getTransactionIcon(transaction.type);
  const totalGasCost = (transaction.gasUsed || 0) * (transaction.gasPrice || 0);

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
                  <Icon className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold text-heading dark:text-white">
                      {formatAddress(transaction.id)}
                    </h1>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                      {transaction.type}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Hash className="w-4 h-4" />
                      <span>Block #{transaction.blockHeight.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeAgo(transaction.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(transaction.id, 'tx-id')}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {copiedId === 'tx-id' ? (
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

        {/* Transaction Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg w-fit mx-auto mb-3">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {transaction.amount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {transaction.tokenId || 'RBT'} Amount
              </div>
            </Card>

            <Card className="p-6 text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg w-fit mx-auto mb-3">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatGasUsed(transaction.gasUsed || 0)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Gas Used</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg w-fit mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatGasPrice(totalGasCost)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Gas Cost</div>
            </Card>
          </div>
        </motion.div>

        {/* Transaction Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-heading dark:text-white mb-4">
              Transaction Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Transaction Hash</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                      {formatAddress(transaction.id)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(transaction.id, 'tx-hash-copy')}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {copiedId === 'tx-hash-copy' ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Type</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                    {transaction.type}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Block Height</span>
                  <span className="font-mono text-sm text-gray-900 dark:text-white">
                    #{transaction.blockHeight.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Timestamp</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(transaction.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Gas Price</span>
                  <span className="font-mono text-sm text-gray-900 dark:text-white">
                    {formatGasPrice(transaction.gasPrice || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Gas Limit</span>
                  <span className="font-mono text-sm text-gray-900 dark:text-white">
                    {(transaction.gasUsed || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Gas Used</span>
                  <span className="font-mono text-sm text-gray-900 dark:text-white">
                    {formatGasUsed(transaction.gasUsed || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Gas Efficiency</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {(((transaction.gasUsed || 0) / 21000) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Sender and Receiver */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-heading dark:text-white mb-4">
              Transaction Flow
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">From</div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <ArrowDownLeft className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-mono text-sm text-gray-900 dark:text-white">
                      {formatAddress(transaction.sender)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Sender</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-2 mx-8">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-full">
                  <ArrowRight className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {transaction.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.tokenId || 'RBT'}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">To</div>
                <div className="flex items-center justify-end space-x-3">
                  <div>
                    <div className="font-mono text-sm text-gray-900 dark:text-white">
                      {formatAddress(transaction.receiver)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Receiver</div>
                  </div>
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Validators */}
        {transaction.validators && transaction.validators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-heading dark:text-white mb-4">
                Validators ({transaction.validators.length})
              </h2>
              <div className="space-y-3">
                {transaction.validators.map((validator, index) => (
                  <div
                    key={validator.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <Shield className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-mono text-sm text-gray-900 dark:text-white">
                          {formatAddress(validator.address)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {validator.totalPledge.toLocaleString()} RBT pledged
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {validator.uptime}% uptime
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(validator.status)}`}>
                        {validator.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export type { TransactionDetailsProps };
