import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import { Tooltip } from '@/components/ui/Tooltip';
import { ArrowLeft, CheckCircle, Clock, XCircle, Hash, User, DollarSign, Users } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Mock data for block transaction
const MOCK_BLOCK_TX_DATA = {
  status: 'confirmed',
  confirmations: 120,
  type: 'Block',
  value: 'Block Data',
  valueUSD: 'N/A',
  timestamp: '2024-07-20 14:30:00 UTC',
  from: 'Block Miner',
  to: 'Block Recipients',
  validators: [
    { address: '0xvalid1234567890abcdef1234567890abcdef12' },
    { address: '0xvalid2234567890abcdef1234567890abcdef23' },
    { address: '0xvalid3234567890abcdef1234567890abcdef34' },
    { address: '0xvalid4234567890abcdef1234567890abcdef45' },
    { address: '0xvalid5234567890abcdef1234567890abcdef56' }
  ],
  quorums: [
    'bafybmiead43d5symqvjyxwogcbdi24gw7vmuqsxrtruifz5uorybuaawqu',
    'bafybmiesxlfbioha62vgmvevbpzxh25gtyad2s4d3llk3ecmrdetlhn7ti',
    'bafybmia7rgxngqmrkzaw7auqepw5744fchmas6nhtv63hlgjwspmzgk7oe',
    'bafybmiafbhj6p5z437vlq3wedh6blaof6fuhucpor2hw35pmcjt24dvocq',
    'bafybmibijjloo6n3c4kcouv26rsfnw26lodh7qcwfvodkuh52y2pwiw6xm',
    'bafybmicappp4bqb4euqqqvj5wgi2kcgviwttx46r5sf2izkqbh3ftzswv4'
  ]
};

// Mock data for regular transaction
const MOCK_REGULAR_TX_DATA = {
  status: 'confirmed',
  confirmations: 120,
  type: 'Transfer',
  value: '1,250.50 RBT',
  valueUSD: '$2,851.14',
  timestamp: '2024-07-20 14:30:00 UTC',
  blockId: 1234567,
  from: '0xabcd...efgh',
  to: '0xijkl...mnop',
  validators: [
    { address: '0xvalid1234567890abcdef1234567890abcdef12' },
    { address: '0xvalid2234567890abcdef1234567890abcdef23' },
    { address: '0xvalid3234567890abcdef1234567890abcdef34' },
    { address: '0xvalid4234567890abcdef1234567890abcdef45' },
    { address: '0xvalid5234567890abcdef1234567890abcdef56' }
  ],
  quorums: [
    'bafybmiead43d5symqvjyxwogcbdi24gw7vmuqsxrtruifz5uorybuaawqu',
    'bafybmiesxlfbioha62vgmvevbpzxh25gtyad2s4d3llk3ecmrdetlhn7ti',
    'bafybmia7rgxngqmrkzaw7auqepw5744fchmas6nhtv63hlgjwspmzgk7oe',
    'bafybmiafbhj6p5z437vlq3wedh6blaof6fuhucpor2hw35pmcjt24dvocq',
    'bafybmibijjloo6n3c4kcouv26rsfnw26lodh7qcwfvodkuh52y2pwiw6xm',
    'bafybmicappp4bqb4euqqqvj5wgi2kcgviwttx46r5sf2izkqbh3ftzswv4'
  ]
};

// Mock data for token transfers
const MOCK_TOKEN_TRANSFERS = [
  {
    id: 'transfer-1',
    tokenId: 'RBT-001',
    tokenName: 'Rubix Base Token',
    tokenType: 'RBT',
    from: 'did:rubix:user001',
    to: 'did:rubix:user002',
    amount: '1,500.00',
    amountUSD: '$3,420.00',
    timestamp: '2 minutes ago',
    status: 'confirmed'
  },
  {
    id: 'transfer-2',
    tokenId: 'FT-002',
    tokenName: 'Custom Fungible Token',
    tokenType: 'FT',
    from: 'did:rubix:user001',
    to: 'did:rubix:user003',
    amount: '500.00',
    amountUSD: '$1,140.00',
    timestamp: '2 minutes ago',
    status: 'confirmed'
  },
  {
    id: 'transfer-3',
    tokenId: 'NFT-003',
    tokenName: 'Digital Art NFT',
    tokenType: 'NFT',
    from: 'did:rubix:user001',
    to: 'did:rubix:user004',
    amount: '1',
    amountUSD: '$2,280.00',
    timestamp: '2 minutes ago',
    status: 'confirmed'
  },
  {
    id: 'transfer-4',
    tokenId: 'SC-004',
    tokenName: 'Smart Contract Token',
    tokenType: 'SC',
    from: 'did:rubix:user001',
    to: 'did:rubix:user005',
    amount: '2,000.00',
    amountUSD: '$4,560.00',
    timestamp: '2 minutes ago',
    status: 'confirmed'
  }
];

export const TransactionExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const txId = searchParams.get('tx') || '';
  const blockId = searchParams.get('block') || '';
  const [loading, setLoading] = useState(true);
  const [txData, setTxData] = useState<any>(null);
  const [tokenTransfers, setTokenTransfers] = useState<any[]>(MOCK_TOKEN_TRANSFERS);
  const [activeTab, setActiveTab] = useState<'details' | 'transfers' | 'quorums' | 'validators'>('details');

  useEffect(() => {
    const fetchTransactionData = async () => {
      setLoading(true);
      setTimeout(() => {
        // Handle block search
        if (blockId) {
          setTxData({
            id: `Block #${blockId}`,
            blockId: parseInt(blockId),
            ...MOCK_BLOCK_TX_DATA
          });
          setTokenTransfers(MOCK_TOKEN_TRANSFERS);
        } else {
          // Handle transaction search
          setTxData({
            id: txId,
            ...MOCK_REGULAR_TX_DATA
          });
          setTokenTransfers(MOCK_TOKEN_TRANSFERS);
        }
        setLoading(false);
      }, 1000);
    };

    if (txId || blockId) {
      fetchTransactionData();
    }
  }, [txId, blockId]);

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

  if (!txData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Transaction Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The requested transaction could not be found.
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-tertiary-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-primary-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-tertiary-600 dark:text-tertiary-400';
      case 'pending': return 'text-primary-600 dark:text-primary-400';
      case 'failed': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

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
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-heading dark:text-white mb-2">Transaction Explorer</h1>
        {/* Mobile Layout: Separate rows */}
        <div className="block sm:hidden">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Details for Transaction:
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-primary-600 dark:text-primary-400 break-all">{txData.id}</span>
            <CopyButton text={txData.id} size="sm" />
          </div>
        </div>
        {/* Desktop Layout: Same row */}
        <div className="hidden sm:flex items-center space-x-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 break-all">
          <span>Details for Transaction:</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-primary-600 dark:text-primary-400">{txData.id}</span>
            <CopyButton text={txData.id} size="sm" />
          </div>
        </div>
      </div>


      {/* Tabbed Content */}
      <Card className="p-4 sm:p-6">
        {/* Tab Navigation */}
        <div className="flex flex-row space-x-4 sm:space-x-8 border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`relative flex items-center space-x-2 px-1 py-3 sm:py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === 'details'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Hash className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Transaction Details</span>
            {activeTab === 'details' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
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
            onClick={() => setActiveTab('transfers')}
            className={`relative flex items-center space-x-2 px-1 py-3 sm:py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === 'transfers'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Token Transfers</span>
            {activeTab === 'transfers' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
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
            onClick={() => setActiveTab('validators')}
            className={`relative flex items-center space-x-2 px-1 py-3 sm:py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === 'validators'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Validator Information</span>
            {activeTab === 'validators' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
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
            onClick={() => setActiveTab('quorums')}
            className={`relative flex items-center space-x-2 px-1 py-3 sm:py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === 'quorums'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Quorum List</span>
            {activeTab === 'quorums' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
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
          {activeTab === 'details' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Transaction Hash:</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-mono text-gray-900 dark:text-white break-all">{txData.id}</p>
                    <CopyButton text={txData.id} size="sm" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Type:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{txData.type}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Value:</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 dark:text-white">{txData.value}</p>
                    {txData.valueUSD !== 'N/A' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        {txData.valueUSD}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Timestamp:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{txData.timestamp}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">From:</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-mono text-primary-600 dark:text-primary-400 break-all">{txData.from}</p>
                    <CopyButton text={txData.from} size="sm" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">To:</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-mono text-primary-600 dark:text-primary-400 break-all">{txData.to}</p>
                    <CopyButton text={txData.to} size="sm" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Block Id:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{txData.blockId.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transfers' && (
            <div>
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Multiple Token Transfers in Single Transaction
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This transaction involves {tokenTransfers.length} different token transfers across the Rubix ecosystem. Click on any token to view its details.
                </p>
              </div>
              
              {/* Mobile Table View with Horizontal Scroll */}
              <div className="block lg:hidden overflow-x-auto">
                {/* Table Header */}
                <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
                  <div className="flex px-6 py-4 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider min-w-[1000px] gap-6">
                    <div className="w-64 flex-shrink-0">Token</div>
                    <div className="w-24 flex-shrink-0">Type</div>
                    <div className="w-48 flex-shrink-0">From</div>
                    <div className="w-48 flex-shrink-0">To</div>
                    <div className="w-32 flex-shrink-0">Amount</div>
                    <div className="w-24 flex-shrink-0">Status</div>
                    <div className="w-32 flex-shrink-0">Time</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-outline-200 dark:divide-outline-700">
                  {tokenTransfers.map((transfer: any, index: number) => (
                    <motion.div
                      key={transfer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/token-explorer?token=${encodeURIComponent(transfer.tokenId)}`)}
                      className="flex px-6 py-5 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer min-w-[1000px] gap-6"
                    >
                      <div className="w-64 flex-shrink-0">
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${transfer.tokenType === 'RBT'
                            ? 'bg-primary-100 dark:bg-primary-900'
                            : transfer.tokenType === 'FT'
                              ? 'bg-tertiary-100 dark:bg-tertiary-900'
                              : transfer.tokenType === 'NFT'
                                ? 'bg-primary-100 dark:bg-primary-900'
                                : 'bg-primary-100 dark:bg-primary-900'
                            }`}>
                            <span className={`text-xs font-semibold ${transfer.tokenType === 'RBT'
                              ? 'text-primary-600 dark:text-primary-400'
                              : transfer.tokenType === 'FT'
                                ? 'text-tertiary-600 dark:text-tertiary-400'
                                : transfer.tokenType === 'NFT'
                                  ? 'text-primary-600 dark:text-primary-400'
                                  : 'text-primary-600 dark:text-primary-400'
                              }`}>
                              {transfer.tokenType.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {transfer.tokenName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {transfer.tokenId}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-24 flex-shrink-0 flex items-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${transfer.tokenType === 'RBT'
                          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                          : transfer.tokenType === 'FT'
                            ? 'bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200'
                            : transfer.tokenType === 'NFT'
                              ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                              : 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                          }`}>
                          {transfer.tokenType}
                        </span>
                      </div>
                      <div className="w-48 flex-shrink-0">
                        <div className="flex items-center space-x-2">
                          <Tooltip content={transfer.from} position="top">
                            <span className="text-sm font-mono text-gray-600 dark:text-gray-400 cursor-pointer truncate">
                              {transfer.from}
                            </span>
                          </Tooltip>
                          <CopyButton text={transfer.from} size="sm" />
                        </div>
                      </div>
                      <div className="w-48 flex-shrink-0">
                        <div className="flex items-center space-x-2">
                          <Tooltip content={transfer.to} position="top">
                            <span className="text-sm font-mono text-gray-600 dark:text-gray-400 cursor-pointer truncate">
                              {transfer.to}
                            </span>
                          </Tooltip>
                          <CopyButton text={transfer.to} size="sm" />
                        </div>
                      </div>
                      <div className="w-32 flex-shrink-0 flex items-center">
                        <div className="flex items-center space-x-1">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            {transfer.amount}
                          </div>
                          {transfer.amountUSD && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                              {transfer.amountUSD}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-24 flex-shrink-0 flex items-center">
                        <span className={`inline-flex px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap ${
                          transfer.status === 'confirmed' 
                            ? 'bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200'
                            : 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                        }`}>
                          {transfer.status}
                        </span>
                      </div>
                      <div className="w-32 flex-shrink-0 flex items-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transfer.timestamp}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Desktop Card View */}
              <div className="hidden lg:block space-y-3">
                {tokenTransfers.map((transfer: any, index: number) => (
                  <motion.div
                    key={transfer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/token-explorer?token=${encodeURIComponent(transfer.tokenId)}`)}
                    className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-3 sm:space-y-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            transfer.tokenType === 'RBT' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' :
                            transfer.tokenType === 'FT' ? 'bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200' :
                            transfer.tokenType === 'NFT' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' :
                            'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                          }`}>
                            {transfer.tokenType}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            transfer.status === 'confirmed' 
                              ? 'bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200'
                              : 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                          }`}>
                            {transfer.status}
                          </span>
                        </div>
                        
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2 truncate">
                          {transfer.tokenId}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">From:</p>
                            <p className="font-mono text-gray-900 dark:text-white break-all">{transfer.from}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">To:</p>
                            <p className="font-mono text-gray-900 dark:text-white break-all">{transfer.to}</p>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {transfer.timestamp}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end space-x-2 sm:ml-4">
                        <div className="text-right">
                          <div className="flex items-center justify-end space-x-2 mb-1">
                            <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-lg">
                              {transfer.amount}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {transfer.tokenType}
                            </div>
                            {transfer.amountUSD && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                {transfer.amountUSD}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-gray-400 dark:text-gray-500 text-xs">
                          →
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'validators' && (
            <div className="space-y-3">
              {txData.validators && txData.validators.map((validator: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 text-sm font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center space-x-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Validator Address:</p>
                      <p className="font-mono text-sm text-gray-900 dark:text-white break-all flex-1">{validator.address}</p>
                      <CopyButton text={validator.address} size="sm" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'quorums' && (
            <div className="space-y-3">
              {txData.quorums && txData.quorums.map((quorumId: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 text-sm font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center space-x-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Quorum ID:</p>
                      <p className="font-mono text-sm text-gray-900 dark:text-white break-all flex-1">{quorumId}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
};