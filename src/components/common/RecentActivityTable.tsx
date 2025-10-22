import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { Tooltip } from '@/components/ui/Tooltip';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  ArrowUpRight,
  Plus,
  Minus,
  Zap,
  Hash,
  User,
  Coins
} from 'lucide-react';
import { Transaction, Block, DID, Token } from '@/types';
import { useTransactions } from '@/hooks/useTransactions';

interface ActivityItem {
  id: string;
  type: 'transaction' | 'block' | 'did' | 'token';
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  data: any;
}

interface RecentActivityTableProps {
  className?: string;
  type?: 'transactions' | 'blocks' | 'holders' | 'tokens';
  limit?: number;
  showPagination?: boolean;
}

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

const generateMockBlocks = (count: number): Block[] => {
  return Array.from({ length: count }, (_, i) => ({
    height: 1234567 - i,
    hash: `0x${Math.random().toString(16).substr(2, 64)}`,
    timestamp: new Date(Date.now() - i * 2000).toISOString(),
    transactionCount: Math.floor(Math.random() * 100) + 1,
    validator: `did:rubix:validator_${Math.random().toString(36).substr(2, 9)}`,
    size: Math.floor(Math.random() * 1000000) + 100000,
    gasUsed: Math.floor(Math.random() * 30000000) + 1000000,
    gasLimit: 30000000,
  }));
};

const generateMockDIDs = (count: number): DID[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `did:rubix:${Math.random().toString(36).substr(2, 9)}`,
    address: `0x${Math.random().toString(16).substr(2, 40)}`,
    tokenBalances: [],
    totalValue: Math.floor(Math.random() * 100000) + 1000,
    transactionCount: Math.floor(Math.random() * 1000) + 1,
    pledgedTokens: [],
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    lastActivity: new Date(Date.now() - i * 3600000).toISOString(),
  }));
};

const generateMockTokens = (count: number): Token[] => {
  const types: Array<'RBT' | 'FT' | 'NFT' | 'SC'> = ['RBT', 'FT', 'NFT', 'SC'];
  const states: Array<'active' | 'inactive' | 'pending'> = ['active', 'inactive', 'pending'];

  return Array.from({ length: count }, (_, i) => ({
    id: `0x${Math.random().toString(16).substr(2, 40)}`,
    type: types[Math.floor(Math.random() * types.length)],
    owner: `did:rubix:${Math.random().toString(36).substr(2, 9)}`,
    deployer: `did:rubix:${Math.random().toString(36).substr(2, 9)}`,
    state: states[Math.floor(Math.random() * states.length)],
    blockHeight: 1234567 - i,
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    transactionHistory: [],
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
      return 'text-tertiary-600 bg-tertiary-100 dark:bg-tertiary-900/20';
    case 'pending':
      return 'text-primary-600 bg-primary-100 dark:bg-primary-900/20';
    case 'failed':
      return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    default:
      return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/20';
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

const renderMobileTransactionCard = (transaction: Transaction) => {
  const Icon = getTransactionIcon(transaction.type);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-primary-100 dark:bg-primary-900/20 rounded">
            <Icon className="w-3 h-3 text-primary-600" />
          </div>
          <div className="flex items-center space-x-2">
            <Tooltip content={transaction.id} position="top">
              <span className="text-xs font-mono text-gray-600 dark:text-gray-400 cursor-pointer">
                {formatAddress(transaction.id, 6)}
              </span>
            </Tooltip>
            <CopyButton text={transaction.id} size="sm" />
          </div>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
          {transaction.status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {transaction.amount.toLocaleString()} RBT
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTimeAgo(transaction.timestamp)}
          </span>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div className="flex items-center space-x-2">
            <span>From:</span>
            <Tooltip content={transaction.sender} position="top">
              <span className="font-mono cursor-pointer">{formatAddress(transaction.sender, 6)}</span>
            </Tooltip>
            <CopyButton text={transaction.sender} size="sm" />
          </div>
          <div className="flex items-center space-x-2">
            <span>To:</span>
            <Tooltip content={transaction.receiver} position="top">
              <span className="font-mono cursor-pointer">{formatAddress(transaction.receiver, 6)}</span>
            </Tooltip>
            <CopyButton text={transaction.receiver} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

const renderMobileBlockCard = (block: Block) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-primary-100 dark:bg-primary-900/20 rounded">
            <Hash className="w-3 h-3 text-primary-600" />
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            #{block.height.toLocaleString()}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatTimeAgo(block.timestamp)}
        </span>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Transactions:</span>
            <span className="ml-1 font-medium">{block.transactionCount}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Size:</span>
            <span className="ml-1 font-medium">{(block.size / 1024).toFixed(1)} KB</span>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div>Hash: {formatAddress(block.hash, 6)}</div>
          <div>Validator: {formatAddress(block.validator, 6)}</div>
        </div>
      </div>
    </div>
  );
};

const renderMobileHolderCard = (holder: any) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-primary-100 dark:bg-primary-900/20 rounded">
            <User className="w-3 h-3 text-primary-600" />
          </div>
          <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
            {formatAddress(holder.id, 6)}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatTimeAgo(holder.lastActivity)}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {holder.totalValue.toLocaleString()} RBT
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {holder.transactionCount} transactions
          </span>
        </div>
      </div>
    </div>
  );
};

const renderMobileTokenCard = (token: any) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-primary-100 dark:bg-primary-900/20 rounded">
            <Coins className="w-3 h-3 text-primary-600" />
          </div>
          <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
            {formatAddress(token.id, 6)}
          </span>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(token.state)}`}>
          {token.state}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {token.type} Token
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Block #{token.blockHeight}
          </span>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div>Owner: {formatAddress(token.owner, 6)}</div>
          <div>Deployer: {formatAddress(token.deployer, 6)}</div>
        </div>
      </div>
    </div>
  );
};

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({
  className = '',
  type = 'transactions',
  limit = 10,
  showPagination = true,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const mockData = useMemo(() => {
    switch (type) {
      case 'transactions':
        return generateMockTransactions(limit);
      case 'blocks':
        return generateMockBlocks(limit);
      case 'holders':
        return generateMockDIDs(limit);
      case 'tokens':
        return generateMockTokens(limit);
      default:
        return generateMockTransactions(limit);
    }
  }, [type, limit]);

  const totalPages = Math.ceil(mockData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = mockData.slice(startIndex, endIndex);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const renderTransactionRow = (transaction: Transaction) => {
    const Icon = getTransactionIcon(transaction.type);

    return (
      <motion.tr
        key={transaction.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-outline-200 dark:border-outline-700 hover:bg-secondary-50 dark:hover:bg-secondary-800/50"
      >
        <td className="px-4 lg:px-6 py-4">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="p-1.5 lg:p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <Icon className="w-3 h-3 lg:w-4 lg:h-4 text-primary-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <Tooltip content={transaction.id} position="top">
                  <div className="font-mono text-xs lg:text-sm text-secondary-900 dark:text-white truncate cursor-pointer">
                    {formatAddress(transaction.id, 6)}
                  </div>
                </Tooltip>
                <CopyButton text={transaction.id} size="sm" />
              </div>
              <div className="text-xs text-secondary-500 dark:text-secondary-400 capitalize">
                {transaction.type}
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 lg:px-6 py-4">
          <div className="text-xs lg:text-sm text-secondary-900 dark:text-white">
            {transaction.amount.toLocaleString()} RBT
          </div>
        </td>
        <td className="px-4 lg:px-6 py-4 hidden lg:table-cell">
          <div className="flex items-center space-x-2">
            <Tooltip content={transaction.sender} position="top">
              <div className="font-mono text-xs lg:text-sm text-secondary-600 dark:text-secondary-400 cursor-pointer">
                {formatAddress(transaction.sender, 6)}
              </div>
            </Tooltip>
            <CopyButton text={transaction.sender} size="sm" />
          </div>
        </td>
        <td className="px-4 lg:px-6 py-4 hidden lg:table-cell">
          <div className="flex items-center space-x-2">
            <Tooltip content={transaction.receiver} position="top">
              <div className="font-mono text-xs lg:text-sm text-secondary-600 dark:text-secondary-400 cursor-pointer">
                {formatAddress(transaction.receiver, 6)}
              </div>
            </Tooltip>
            <CopyButton text={transaction.receiver} size="sm" />
          </div>
        </td>
        <td className="px-4 lg:px-6 py-4">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
            {transaction.status}
          </span>
        </td>
        <td className="px-4 lg:px-6 py-4">
          <div className="text-xs lg:text-sm text-secondary-500 dark:text-secondary-400">
            {formatTimeAgo(transaction.timestamp)}
          </div>
        </td>
        <td className="px-4 lg:px-6 py-4">
          <div className="flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => copyToClipboard(transaction.id, transaction.id)}
              className="p-1 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300"
            >
              {copiedId === transaction.id ? (
                <Check className="w-3 h-3 lg:w-4 lg:h-4 text-tertiary-500" />
              ) : (
                <Copy className="w-3 h-3 lg:w-4 lg:h-4" />
              )}
            </button>
            <button className="p-1 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300">
              <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>
          </div>
        </td>
      </motion.tr>
    );
  };

  const renderBlockRow = (block: Block) => {
    return (
      <motion.tr
        key={block.height}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-outline-200 dark:border-outline-700 hover:bg-secondary-50 dark:hover:bg-secondary-800/50"
      >
        <td className="px-4 lg:px-6 py-4">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="p-1.5 lg:p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <Hash className="w-3 h-3 lg:w-4 lg:h-4 text-primary-600" />
            </div>
            <div>
              <div className="font-mono text-xs lg:text-sm text-secondary-900 dark:text-white">
                #{block.height.toLocaleString()}
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 lg:px-6 py-4 hidden lg:table-cell">
          <div className="font-mono text-xs lg:text-sm text-secondary-600 dark:text-secondary-400">
            {formatAddress(block.hash, 6)}
          </div>
        </td>
        <td className="px-4 lg:px-6 py-4">
          <div className="text-xs lg:text-sm text-secondary-900 dark:text-white">
            {block.transactionCount.toLocaleString()}
          </div>
        </td>
        <td className="px-4 lg:px-6 py-4 hidden lg:table-cell">
          <div className="text-xs lg:text-sm text-secondary-900 dark:text-white">
            {(block.size / 1024).toFixed(1)} KB
          </div>
        </td>
        <td className="px-4 lg:px-6 py-4 hidden lg:table-cell">
          <div className="font-mono text-xs lg:text-sm text-secondary-600 dark:text-secondary-400">
            {formatAddress(block.validator, 6)}
          </div>
        </td>
        <td className="px-4 lg:px-6 py-4">
          <div className="text-xs lg:text-sm text-secondary-500 dark:text-secondary-400">
            {formatTimeAgo(block.timestamp)}
          </div>
        </td>
        <td className="px-4 lg:px-6 py-4">
          <div className="flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => copyToClipboard(block.hash, block.hash)}
              className="p-1 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300"
            >
              {copiedId === block.hash ? (
                <Check className="w-3 h-3 lg:w-4 lg:h-4 text-tertiary-500" />
              ) : (
                <Copy className="w-3 h-3 lg:w-4 lg:h-4" />
              )}
            </button>
            <button className="p-1 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300">
              <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>
          </div>
        </td>
      </motion.tr>
    );
  };

  const getTableHeaders = () => {
    switch (type) {
      case 'transactions':
        return [
          { label: 'Transaction', mobile: true },
          { label: 'Amount', mobile: true },
          { label: 'From', mobile: false },
          { label: 'To', mobile: false },
          { label: 'Status', mobile: true },
          { label: 'Time', mobile: true },
          { label: 'Actions', mobile: true }
        ];
      case 'blocks':
        return [
          { label: 'Block', mobile: true },
          { label: 'Hash', mobile: false },
          { label: 'Transactions', mobile: true },
          { label: 'Size', mobile: false },
          { label: 'Validator', mobile: false },
          { label: 'Time', mobile: true },
          { label: 'Actions', mobile: true }
        ];
      case 'holders':
        return [
          { label: 'DID', mobile: true },
          { label: 'Address', mobile: false },
          { label: 'Balance', mobile: true },
          { label: 'Tokens', mobile: false },
          { label: 'Activity', mobile: true },
          { label: 'Time', mobile: true },
          { label: 'Actions', mobile: true }
        ];
      case 'tokens':
        return [
          { label: 'Token', mobile: true },
          { label: 'Type', mobile: true },
          { label: 'Owner', mobile: false },
          { label: 'State', mobile: true },
          { label: 'Block', mobile: false },
          { label: 'Time', mobile: true },
          { label: 'Actions', mobile: true }
        ];
      default:
        return [
          { label: 'Item', mobile: true },
          { label: 'Details', mobile: true },
          { label: 'Info', mobile: false },
          { label: 'Status', mobile: true },
          { label: 'Time', mobile: true },
          { label: 'Actions', mobile: true }
        ];
    }
  };

  const renderRow = (item: any, index: number) => {
    switch (type) {
      case 'transactions':
        return renderTransactionRow(item);
      case 'blocks':
        return renderBlockRow(item);
      default:
        return (
          <motion.tr
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-outline-200 dark:border-outline-700 hover:bg-secondary-50 dark:hover:bg-secondary-800/50"
          >
            <td className="px-6 py-4 text-sm text-secondary-900 dark:text-white">
              {JSON.stringify(item).slice(0, 50)}...
            </td>
          </motion.tr>
        );
    }
  };

  return (
    <Card className={`${className}`}>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <h3 className="text-lg sm:text-xl font-semibold text-heading dark:text-white">
            Recent {type.charAt(0).toUpperCase() + type.slice(1)}
          </h3>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            View All
          </Button>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-3">
          {currentData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              {type === 'transactions' && renderMobileTransactionCard(item as Transaction)}
              {type === 'blocks' && renderMobileBlockCard(item as Block)}
              {type === 'holders' && renderMobileHolderCard(item)}
              {type === 'tokens' && renderMobileTokenCard(item)}
            </motion.div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-outline-200 dark:border-outline-700">
                {getTableHeaders().map((header, index) => (
                  <th
                    key={index}
                    className={`px-4 lg:px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider whitespace-nowrap ${!header.mobile ? 'hidden lg:table-cell' : ''
                      }`}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentData.map((item, index) => renderRow(item, index))}
            </tbody>
          </table>
        </div>

        {showPagination && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 space-y-3 sm:space-y-0">
            <div className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 text-center sm:text-left">
              Showing {startIndex + 1} to {Math.min(endIndex, mockData.length)} of {mockData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="text-xs sm:text-sm"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-6 h-6 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export type { RecentActivityTableProps };
