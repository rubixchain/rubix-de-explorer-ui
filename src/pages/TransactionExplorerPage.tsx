import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import { Tooltip } from '@/components/ui/Tooltip';
import { ArrowLeft, CheckCircle, Clock, XCircle, Hash, User, DollarSign } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const TransactionExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const txId = searchParams.get('tx') || '';
  const [loading, setLoading] = useState(true);
  const [txData, setTxData] = useState<any>(null);
  const [tokenTransfers, setTokenTransfers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'transfers' | 'validators'>('details');
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        if (!txId) {
          throw new Error('No transaction ID provided');
        }
        const response = await fetch(`${API_BASE_URL}/txnhash?hash=${txId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch transaction data: ${response.statusText}`);
        }
        const data = await response.json();
        const mapTxnType = (type: string): string => {
          switch (type) {
            case '02':
              return 'Transfer';
            default:
              return 'Unknown';
          }
        };

        // Handle tokens as an object, using only keys
        const tokenIds = data.tokens && typeof data.tokens === 'object' ? Object.keys(data.tokens) : [];
        if (!Array.isArray(tokenIds)) {
          console.warn('Tokens field does not contain valid keys:', data.tokens);
        }

        const formattedTxData = {
          id: data.txn_id || 'N/A',
          status: 'confirmed',
          confirmations: 120, 
          type: mapTxnType(data.txn_type || ''),
          value: data.amount ? `${data.amount} RBT` : 'N/A', // Use 'N/A' if amount is null
          valueUSD: 'N/A', 
          timestamp: data.epoch ? new Date(data.epoch * 1000).toUTCString() : 'N/A', // Convert epoch to UTC string
          blockId: data.block_hash || 'N/A',
          from: data.sender_did || 'N/A',
          to: data.receiver_did || 'N/A',
          validators: data.validator_pledge_map
            ? Object.keys(data.validator_pledge_map).map((address) => ({ address }))
            : [],
        };

        // Map token IDs to tokenTransfers structure
        const formattedTokenTransfers = tokenIds.length > 0
          ? tokenIds.map((tokenId: string, index: number) => ({
              id: `transfer-${index + 1}`,
              tokenId,
              tokenName: `Token ${tokenId.slice(0, 8)}...`, // Truncate tokenId for display
              tokenType: 'RBT', // Default to RBT as token type is not used
              from: data.sender_did || 'N/A',
              to: data.receiver_did || 'N/A',
              amount: data.amount ? data.amount.toString() : 'N/A', // Use 'N/A' if amount is null
              amountUSD: 'N/A', 
              timestamp: '2 minutes ago', // No specific timestamp per token, using default
              status: 'confirmed',
            }))
          : [];

        setTxData(formattedTxData);
        setTokenTransfers(formattedTokenTransfers);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching transaction data:', error);
        setError(error.message || 'An error occurred while fetching transaction data');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [txId]);

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

  if (error || !txData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error ? 'Error Loading Transaction' : 'Transaction Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The requested transaction could not be found.'}
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
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-tertiary-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-primary-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-tertiary-600 dark:text-tertiary-400';
      case 'pending':
        return 'text-primary-600 dark:text-primary-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
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
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Details for Transaction:</div>
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
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
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
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
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
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        </div>
        {/* Tab Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
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
                  <p className="font-medium text-gray-900 dark:text-white">{txData.blockId}</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'transfers' && (
            <div>
              {/* <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Multiple Token Transfers in Single Transaction
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This transaction involves {tokenTransfers.length} different token transfers across the Rubix ecosystem.
                  Click on any token to view its details.
                </p>
              </div> */}
              {tokenTransfers.length === 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">No token transfers found for this transaction.</p>
              )}
              {/* Mobile Table View with Horizontal Scroll */}
              <div className="block lg:hidden overflow-x-auto">
                <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
                  <div className="flex px-6 py-4 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider min-w-[1000px] gap-6">
                    <div className="w-64 flex-shrink-0">Token</div>
                    <div className="w-24 flex-shrink-0">Type</div>
                    <div className="w-48 flex-shrink-0">From</div>
                    <div className="w-48 flex-shrink-0">To</div>
                    {/* <div className="w-32 flex-shrink-0">Amount</div> */}
                    <div className="w-24 flex-shrink-0">Status</div>
                    {/* <div className="w-32 flex-shrink-0">Time</div> */}
                  </div>
                </div>
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
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              transfer.tokenType === 'RBT'
                                ? 'bg-primary-100 dark:bg-primary-900'
                                : transfer.tokenType === 'FT'
                                ? 'bg-tertiary-100 dark:bg-tertiary-900'
                                : transfer.tokenType === 'NFT'
                                ? 'bg-primary-100 dark:bg-primary-900'
                                : 'bg-primary-100 dark:bg-primary-900'
                            }`}
                          >
                            <span
                              className={`text-xs font-semibold ${
                                transfer.tokenType === 'RBT'
                                  ? 'text-primary-600 dark:text-primary-400'
                                  : transfer.tokenType === 'FT'
                                  ? 'text-tertiary-600 dark:text-tertiary-400'
                                  : transfer.tokenType === 'NFT'
                                  ? 'text-primary-600 dark:text-primary-400'
                                  : 'text-primary-600 dark:text-primary-400'
                              }`}
                            >
                              {transfer.tokenType.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {transfer.tokenName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{transfer.tokenId}</div>
                          </div>
                        </div>
                      </div>
                      <div className="w-24 flex-shrink-0 flex items-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            transfer.tokenType === 'RBT'
                              ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                              : transfer.tokenType === 'FT'
                              ? 'bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200'
                              : transfer.tokenType === 'NFT'
                              ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                              : 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                          }`}
                        >
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
                        {/* <div className="flex items-center space-x-1">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">{transfer.amount}</div>
                          {transfer.amount && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                              {transfer.amount}
                            </span>
                          )}
                        </div> */}
                      </div>
                      <div className="w-24 flex-shrink-0 flex items-center">
                        <span
                          className={`inline-flex px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap ${
                            transfer.status === 'confirmed'
                              ? 'bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200'
                              : 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                          }`}
                        >
                          {transfer.status}
                        </span>
                      </div>
                      {/* <div className="w-32 flex-shrink-0 flex items-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{transfer.timestamp}</div>
                      </div> */}
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
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              transfer.tokenType === 'RBT'
                                ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                                : transfer.tokenType === 'FT'
                                ? 'bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200'
                                : transfer.tokenType === 'NFT'
                                ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                                : 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                            }`}
                          >
                            {transfer.tokenType}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              transfer.status === 'confirmed'
                                ? 'bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200'
                                : 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                            }`}
                          >
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
                        {/* <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{transfer.timestamp}</div> */}
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-2 sm:ml-4">
                        <div className="text-right">
                          <div className="flex items-center justify-end space-x-2 mb-1">
                            {/* <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-lg">
                              {transfer.amount}
                            </div> */}
                            <div className="text-xs text-gray-500 dark:text-gray-400">{transfer.tokenType}</div>
                            {/* {transfer.amount && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                {transfer.amount}
                              </span>
                            )} */}
                          </div>
                        </div>
                        <div className="text-gray-400 dark:text-gray-500 text-xs">→</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'validators' && (
            <div className="space-y-3">
              {txData.validators && txData.validators.length > 0 ? (
                txData.validators.map((validator: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400 text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0 flex items-center space-x-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Validator Address:</p>
                        <p className="font-mono text-sm text-gray-900 dark:text-white break-all flex-1">
                          {validator.address}
                        </p>
                        <CopyButton text={validator.address} size="sm" />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">No validators found for this transaction.</p>
              )}
            </div>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
};