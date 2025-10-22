import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { CopyButton } from '@/components/ui/CopyButton';
import { Tooltip } from '@/components/ui/Tooltip';
import { ArrowLeft, User, Coins, Activity, Shield, Info } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Mock data for DID information
const MOCK_DID_INFO = {
  name: 'Rubix User',
  balance: '15,250.75 RBT',
  totalValue: '$45,750.25',
  transactionCount: 1247,
  pledgedTokens: '5,000 RBT',
  validatorStatus: 'Active',
  joinedDate: '2023-01-15',
  lastActivity: '2 hours ago',
};

// Mock data for token holdings
const MOCK_TOKENS = [
  { id: 'RBT-001', name: 'Rubix Token', balance: '15,250.75', type: 'RBT' },
  { id: 'FT-002', name: 'Custom Token', balance: '500.00', type: 'FT' },
  { id: 'NFT-003', name: 'Digital Art #1', balance: '1', type: 'NFT' },
  { id: 'SC-004', name: 'Smart Contract V1', balance: '1', type: 'SC' },
  { id: 'FT-005', name: 'Governance Token', balance: '2,500.00', type: 'FT' },
  { id: 'NFT-006', name: 'Collectible #2', balance: '1', type: 'NFT' },
  { id: 'RBT-007', name: 'Staking Rewards', balance: '3,750.25', type: 'RBT' },
  { id: 'SC-008', name: 'DeFi Protocol', balance: '1', type: 'SC' },
  { id: 'FT-009', name: 'Utility Token', balance: '1,200.00', type: 'FT' },
  { id: 'NFT-010', name: 'Gaming Asset #1', balance: '1', type: 'NFT' }
];

// Mock data for recent transactions
const MOCK_TRANSACTIONS = [
  {
    id: '0x1234...5678',
    type: 'Transfer',
    amount: '1,250.50 RBT',
    timestamp: '2 hours ago',
    status: 'confirmed'
  },
  {
    id: '0x2345...6789',
    type: 'Mint',
    amount: '500.00 RBT',
    timestamp: '5 hours ago',
    status: 'confirmed'
  },
  {
    id: '0x3456...7890',
    type: 'Burn',
    amount: '750.25 RBT',
    timestamp: '8 hours ago',
    status: 'confirmed'
  },
  {
    id: '0x4567...8901',
    type: 'Pledge',
    amount: '2,000.00 RBT',
    timestamp: '1 day ago',
    status: 'confirmed'
  },
  {
    id: '0x5678...9012',
    type: 'Transfer',
    amount: '300.75 RBT',
    timestamp: '2 days ago',
    status: 'confirmed'
  },
  {
    id: '0x6789...0123',
    type: 'Mint',
    amount: '1,500.00 RBT',
    timestamp: '3 days ago',
    status: 'confirmed'
  },
  {
    id: '0x7890...1234',
    type: 'Burn',
    amount: '200.50 RBT',
    timestamp: '4 days ago',
    status: 'confirmed'
  },
  {
    id: '0x8901...2345',
    type: 'Transfer',
    amount: '850.25 RBT',
    timestamp: '5 days ago',
    status: 'confirmed'
  }
];

export const DIDExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const did = searchParams.get('did') || '';
  const [loading, setLoading] = useState(true);
  const [didData, setDidData] = useState<any>(null);
  const [tokens, setTokens] = useState<any[]>(MOCK_TOKENS);
  const [recentTransactions, setRecentTransactions] = useState<any[]>(MOCK_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState<'holdings' | 'transactions'>('holdings');
  const [currentPage, setCurrentPage] = useState(1);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchDIDData = async () => {
      setLoading(true);
      setTimeout(() => {
        setDidData({
          did: did,
          ...MOCK_DID_INFO
        });
        setTokens(MOCK_TOKENS);
        setRecentTransactions(MOCK_TRANSACTIONS);
        setLoading(false);
      }, 1000);
    };

    if (did) {
      fetchDIDData();
    }
  }, [did]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!didData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            DID Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The requested DID could not be found.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 sm:space-y-8 p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-heading dark:text-white mb-2">DID Explorer</h1>
        {/* Mobile Layout: Separate rows */}
        <div className="block sm:hidden">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Details for DID:
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-primary-600 dark:text-primary-400 break-all">{didData.did}</span>
            <CopyButton text={didData.did} size="sm" />
          </div>
        </div>
        {/* Desktop Layout: Same row */}
        <div className="hidden sm:flex items-center space-x-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 break-all">
          <span>Details for DID:</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-primary-600 dark:text-primary-400">{didData.did}</span>
            <CopyButton text={didData.did} size="sm" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Balance</p>
              <div className="relative">
                <div
                  className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center cursor-help hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onMouseEnter={() => setShowTooltip('totalBalance')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <Info className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" />
                </div>

                {/* Tooltip */}
                {showTooltip === 'totalBalance' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50"
                    style={{
                      left: '50%',
                      transform: 'translateX(-50%)',
                      maxWidth: 'min(16rem, calc(100vw - 2rem))'
                    }}
                  >
                    <div className="text-center break-words">
                      Total balance in USD represents the dollar value of all token holdings for this DID, including RBT, FT, NFT, and Smart Contract tokens.
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                  </motion.div>
                )}
              </div>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{didData.totalValue}</p>
          </div>
        </Card>
        <Card className="p-4 sm:p-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
              <div className="relative">
                <div 
                  className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center cursor-help hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onMouseEnter={() => setShowTooltip('totalTransactions')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <Info className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" />
                </div>
                
                {/* Tooltip */}
                {showTooltip === 'totalTransactions' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50"
                    style={{
                      left: '50%',
                      transform: 'translateX(-50%)',
                      maxWidth: 'min(16rem, calc(100vw - 2rem))'
                    }}
                  >
                    <div className="text-center break-words">
                      Total number of transactions associated with this DID, including transfers, mints, burns, pledges, and other blockchain activities.
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                  </motion.div>
                )}
              </div>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{didData.transactionCount.toLocaleString()}</p>
          </div>
        </Card>
        <Card className="p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Tokens Holding</p>
              <div className="relative">
                <div
                  className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center cursor-help hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onMouseEnter={() => setShowTooltip('tokensHolding')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <Info className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" />
                </div>

                {/* Tooltip */}
                {showTooltip === 'tokensHolding' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50"
                    style={{
                      left: '50%',
                      transform: 'translateX(-50%)',
                      maxWidth: 'min(16rem, calc(100vw - 2rem))'
                    }}
                  >
                    <div className="text-center break-words">
                      Total number of RBT tokens held in this DID's wallet, including liquid balances and all available holdings.
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                  </motion.div>
                )}
              </div>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{didData.pledgedTokens}</p>
          </div>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Card className="p-4 sm:p-6">
        {/* Tab Navigation */}
        <div className="flex flex-row space-x-4 sm:space-x-8 border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
          <button
            onClick={() => {
              setActiveTab('holdings');
              setCurrentPage(1);
            }}
            className={`relative flex items-center space-x-2 px-1 py-3 sm:py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === 'holdings'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Token Holdings</span>
            {activeTab === 'holdings' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-blue-400"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('transactions');
              setCurrentPage(1);
            }}
            className={`relative flex items-center space-x-2 px-1 py-3 sm:py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === 'transactions'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Recent Transactions</span>
            {activeTab === 'transactions' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-blue-400"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'holdings' && (
            <div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
                Click on any token to view its details
              </div>
              {/* Mobile Table View with Horizontal Scroll */}
              <div className="block lg:hidden overflow-x-auto">
                {/* Table Header */}
                <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
                  <div className="flex px-6 py-4 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider min-w-[600px] gap-6">
                    <div className="w-64 flex-shrink-0">Token</div>
                    <div className="w-24 flex-shrink-0">Type</div>
                    <div className="w-32 flex-shrink-0">Balance</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-outline-200 dark:divide-outline-700">
                  {tokens
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((token: any, index: number) => (
                    <motion.div
                      key={token.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/token-explorer?token=${encodeURIComponent(token.id)}`)}
                      className="flex px-6 py-5 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer min-w-[600px] gap-6"
                    >
                      <div className="w-64 flex-shrink-0">
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            token.type === 'RBT' ? 'bg-primary-100 dark:bg-primary-900' :
                            token.type === 'FT' ? 'bg-tertiary-100 dark:bg-tertiary-900' :
                            token.type === 'NFT' ? 'bg-primary-100 dark:bg-primary-900' :
                            'bg-primary-100 dark:bg-primary-900'
                          }`}>
                            <span className={`text-xs font-semibold ${
                              token.type === 'RBT' ? 'text-primary-600 dark:text-primary-400' :
                              token.type === 'FT' ? 'text-tertiary-600 dark:text-tertiary-400' :
                              token.type === 'NFT' ? 'text-primary-600 dark:text-primary-400' :
                              'text-primary-600 dark:text-primary-400'
                            }`}>
                              {token.type.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{token.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{token.id}</div>
                          </div>
                        </div>
                      </div>
                      <div className="w-24 flex-shrink-0 flex items-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          token.type === 'RBT' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' :
                          token.type === 'FT' ? 'bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200' :
                          token.type === 'NFT' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' :
                          'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                        }`}>
                          {token.type}
                        </span>
                      </div>
                      <div className="w-32 flex-shrink-0 flex items-center">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                          {token.balance} {token.type}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Desktop Card View */}
              <div className="hidden lg:block space-y-3">
                {tokens
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((token: any, index: number) => (
                  <motion.div
                    key={token.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/token-explorer?token=${encodeURIComponent(token.id)}`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors space-y-2 sm:space-y-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                        token.type === 'RBT' ? 'bg-primary-100 dark:bg-primary-900' :
                        token.type === 'FT' ? 'bg-tertiary-100 dark:bg-tertiary-900' :
                        token.type === 'NFT' ? 'bg-primary-100 dark:bg-primary-900' :
                        'bg-primary-100 dark:bg-primary-900'
                      }`}>
                        <span className={`text-xs font-semibold ${
                          token.type === 'RBT' ? 'text-primary-600 dark:text-primary-400' :
                          token.type === 'FT' ? 'text-tertiary-600 dark:text-tertiary-400' :
                          token.type === 'NFT' ? 'text-primary-600 dark:text-primary-400' :
                          'text-primary-600 dark:text-primary-400'
                        }`}>
                          {token.type.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{token.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{token.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-2">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{token.balance} {token.type}</div>
                      <div className="text-gray-400 dark:text-gray-500 text-xs">
                        →
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(tokens.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                totalItems={tokens.length}
                itemsPerPage={itemsPerPage}
                className="mt-6"
              />
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
                Click on any transaction to view its details
              </div>
              {/* Mobile Table View with Horizontal Scroll */}
              <div className="block lg:hidden overflow-x-auto">
                {/* Table Header */}
                <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
                  <div className="flex px-6 py-4 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider min-w-[800px] gap-6">
                    <div className="w-48 flex-shrink-0">Transaction</div>
                    <div className="w-20 flex-shrink-0">Type</div>
                    <div className="w-32 flex-shrink-0">Amount</div>
                    <div className="w-24 flex-shrink-0">Status</div>
                    <div className="w-32 flex-shrink-0">Time</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-outline-200 dark:divide-outline-700">
                  {recentTransactions
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((tx: any, index: number) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/transaction-explorer?tx=${encodeURIComponent(tx.id)}`)}
                      className="flex px-6 py-5 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer min-w-[800px] gap-6"
                    >
                      <div className="w-48 flex-shrink-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                            <span className="text-primary-600 dark:text-primary-400 text-xs font-semibold">
                              {tx.type.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <Tooltip content={tx.id} position="top">
                                <div className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer truncate">
                                  {tx.id}
                                </div>
                              </Tooltip>
                              <CopyButton text={tx.id} size="sm" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-20 flex-shrink-0 flex items-center">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {tx.type}
                        </span>
                      </div>
                      <div className="w-32 flex-shrink-0 flex items-center">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                          {tx.amount}
                        </div>
                      </div>
                      <div className="w-24 flex-shrink-0 flex items-center">
                        <span className={`inline-flex px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap ${
                          tx.status === 'confirmed' 
                            ? 'bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200'
                            : 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                      <div className="w-32 flex-shrink-0 flex items-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {tx.timestamp}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Desktop Card View */}
              <div className="hidden lg:block space-y-3">
                {recentTransactions
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((tx: any, index: number) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/transaction-explorer?tx=${encodeURIComponent(tx.id)}`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors space-y-2 sm:space-y-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                        <span className="text-xs sm:text-sm font-mono text-gray-600 dark:text-gray-400 truncate">
                          {tx.id}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full w-fit ${
                          tx.status === 'confirmed' 
                            ? 'bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200'
                            : 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {tx.type} • {tx.timestamp}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-2">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                          {tx.amount}
                        </div>
                      </div>
                      <div className="text-gray-400 dark:text-gray-500 text-xs">
                        →
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(recentTransactions.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                totalItems={recentTransactions.length}
                itemsPerPage={itemsPerPage}
                className="mt-6"
              />
            </div>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
};
