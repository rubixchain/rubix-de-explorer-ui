import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/common/SearchBar';
import { 
  Search, 
  User, 
  Coins, 
  Hash, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  Zap,
  AlertCircle
} from 'lucide-react';
import { DID, Token, Transaction, Block } from '@/types';
import { useSearch } from '@/hooks/useSearch';
import { useApp } from '@/contexts/AppContext';

interface SearchResultsProps {
  query: string;
  type?: string;
  className?: string;
}

interface SearchResultItem {
  id: string;
  type: 'did' | 'token' | 'transaction' | 'block';
  title: string;
  subtitle: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  data: any;
  timestamp?: string;
  status?: string;
}

const generateMockDIDResult = (query: string): DID => ({
  id: query,
  address: `0x${Math.random().toString(16).substr(2, 40)}`,
  tokenBalances: [
    { tokenId: 'RBT', tokenType: 'RBT', balance: 1250, value: 1250 },
    { tokenId: 'FT_001', tokenType: 'FT', balance: 500, value: 250 },
    { tokenId: 'NFT_001', tokenType: 'NFT', balance: 1, value: 100 },
  ],
  totalValue: 1600,
  transactionCount: 45,
  pledgedTokens: [
    { tokenId: 'RBT', amount: 100, validatorId: 'validator_1', pledgedAt: new Date().toISOString() },
  ],
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
});

const generateMockTokenResult = (query: string): Token => ({
  id: query,
  type: 'RBT',
  owner: `did:rubix:${Math.random().toString(36).substr(2, 9)}`,
  deployer: `did:rubix:${Math.random().toString(36).substr(2, 9)}`,
  state: 'active',
  blockHeight: 1234567,
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  transactionHistory: [],
});

const generateMockTransactionResult = (query: string): Transaction => ({
  id: query,
  type: 'transfer',
  sender: `did:rubix:${Math.random().toString(36).substr(2, 9)}`,
  receiver: `did:rubix:${Math.random().toString(36).substr(2, 9)}`,
  amount: 1250,
  blockHeight: 1234567,
  timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  status: 'confirmed',
  validators: [],
  gasUsed: 21000,
  gasPrice: 0.0001,
});

const generateMockBlockResult = (query: string): Block => ({
  height: parseInt(query) || 1234567,
  hash: `0x${Math.random().toString(16).substr(2, 64)}`,
  timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  transactionCount: 15,
  validator: `did:rubix:validator_${Math.random().toString(36).substr(2, 9)}`,
  size: 500000,
  gasUsed: 1500000,
  gasLimit: 30000000,
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
    case 'active':
      return 'text-tertiary-600 bg-tertiary-100 dark:bg-tertiary-900/20';
    case 'pending':
      return 'text-primary-600 bg-primary-100 dark:bg-primary-900/20';
    case 'failed':
    case 'inactive':
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

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  type,
  className = '',
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { search, searchResults: hookResults, isLoading: hookLoading } = useSearch();
  const { setSearchQuery } = useApp();

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      setTimeout(() => {
        const results = generateSearchResults(query, type);
        setSearchResults(results);
        setIsLoading(false);
      }, 1000);
    }
  }, [query, type]);

  const generateSearchResults = (searchQuery: string, searchType?: string): SearchResultItem[] => {
    const results: SearchResultItem[] = [];

    if (searchQuery.startsWith('did:') || searchType === 'did') {
      const did = generateMockDIDResult(searchQuery);
      results.push({
        id: did.id,
        type: 'did',
        title: did.id,
        subtitle: `${did.tokenBalances.length} tokens • ${did.totalValue} RBT total value`,
        description: `Created ${formatTimeAgo(did.createdAt)} • Last activity ${formatTimeAgo(did.lastActivity)}`,
        icon: User,
        data: did,
        timestamp: did.lastActivity,
        status: 'active',
      });
    }

    if (searchQuery.startsWith('0x') || searchType === 'token') {
      const token = generateMockTokenResult(searchQuery);
      results.push({
        id: token.id,
        type: 'token',
        title: formatAddress(token.id),
        subtitle: `${token.type} Token • ${token.state}`,
        description: `Owner: ${formatAddress(token.owner)} • Block: #${token.blockHeight}`,
        icon: Coins,
        data: token,
        timestamp: token.createdAt,
        status: token.state,
      });
    }

    if (searchQuery.startsWith('tx:') || searchQuery.startsWith('0x') && searchQuery.length > 40 || searchType === 'transaction') {
      const transaction = generateMockTransactionResult(searchQuery);
      results.push({
        id: transaction.id,
        type: 'transaction',
        title: formatAddress(transaction.id),
        subtitle: `${transaction.type} • ${transaction.amount} RBT`,
        description: `From: ${formatAddress(transaction.sender)} • To: ${formatAddress(transaction.receiver)}`,
        icon: getTransactionIcon(transaction.type),
        data: transaction,
        timestamp: transaction.timestamp,
        status: transaction.status,
      });
    }

    if (/^\d+$/.test(searchQuery) || searchType === 'block') {
      const block = generateMockBlockResult(searchQuery);
      results.push({
        id: block.height.toString(),
        type: 'block',
        title: `Block #${block.height.toLocaleString()}`,
        subtitle: `${block.transactionCount} transactions • ${formatTimeAgo(block.timestamp)}`,
        description: `Hash: ${formatAddress(block.hash)} • Validator: ${formatAddress(block.validator)}`,
        icon: Hash,
        data: block,
        timestamp: block.timestamp,
        status: 'confirmed',
      });
    }

    if (results.length === 0) {
      const did = generateMockDIDResult(`did:rubix:${searchQuery}`);
      results.push({
        id: did.id,
        type: 'did',
        title: did.id,
        subtitle: `${did.tokenBalances.length} tokens • ${did.totalValue} RBT total value`,
        description: `Created ${formatTimeAgo(did.createdAt)} • Last activity ${formatTimeAgo(did.lastActivity)}`,
        icon: User,
        data: did,
        timestamp: did.lastActivity,
        status: 'active',
      });

      const transaction = generateMockTransactionResult(`tx:${searchQuery}`);
      results.push({
        id: transaction.id,
        type: 'transaction',
        title: formatAddress(transaction.id),
        subtitle: `${transaction.type} • ${transaction.amount} RBT`,
        description: `From: ${formatAddress(transaction.sender)} • To: ${formatAddress(transaction.receiver)}`,
        icon: getTransactionIcon(transaction.type),
        data: transaction,
        timestamp: transaction.timestamp,
        status: transaction.status,
      });
    }

    return results;
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleNewSearch = (newQuery: string, newType?: string) => {
    setSearchQuery(newQuery);
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="w-full max-w-7xl mx-auto mb-8">
          <SearchBar
            onSearch={handleNewSearch}
            size="lg"
            showSuggestions={true}
          />
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Search Bar */}
      <div className="w-full max-w-7xl mx-auto mb-6 sm:mb-8">
        <SearchBar
          onSearch={handleNewSearch}
          size="lg"
          showSuggestions={true}
        />
      </div>

      {/* Search Query Display */}
      <motion.div
        className="text-center mb-6 sm:mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-heading dark:text-white mb-2">
          Search Results
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
        </p>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card hover className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className="p-2 sm:p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex-shrink-0">
                        <result.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-heading dark:text-white truncate">
                            {result.title}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit ${getStatusColor(result.status || 'active')}`}>
                            {result.status}
                          </span>
                        </div>
                        
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">
                          {result.subtitle}
                        </p>
                        
                        {result.description && (
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3">
                            {result.description}
                          </p>
                        )}
                        
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{result.timestamp ? formatTimeAgo(result.timestamp) : 'Unknown'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="capitalize">{result.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end space-x-2 sm:ml-4">
                      <button
                        onClick={() => copyToClipboard(result.id, result.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {copiedId === result.id ? (
                          <Check className="w-4 h-4 text-tertiary-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">View</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="text-center py-8 sm:py-12">
              <div className="text-gray-400 mb-4">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 px-4">
                We couldn't find any results for "{query}". Try searching with a different term.
              </p>
              <div className="text-xs sm:text-sm text-gray-400 px-4">
                <p>Try searching for:</p>
                <ul className="mt-2 space-y-1">
                  <li>• DID addresses (e.g., did:rubix:example)</li>
                  <li>• Token IDs (e.g., 0x1234...5678)</li>
                  <li>• Transaction hashes (e.g., tx:abc123...def456)</li>
                  <li>• Block numbers (e.g., 1234567)</li>
                </ul>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export type { SearchResultsProps };
