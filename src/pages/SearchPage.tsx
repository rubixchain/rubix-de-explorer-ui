import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SearchResults } from '@/components/search/SearchResults';
import { DIDDetails } from '@/components/search/DIDDetails';
import { TokenDetails } from '@/components/search/TokenDetails';
import { TransactionDetails } from '@/components/search/TransactionDetails';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Search,
  User,
  Coins,
  Hash,
  ArrowRight,
  Filter,
  X
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'did' | 'token' | 'transaction' | 'block'>('all');
  const [showTips, setShowTips] = useState(false);

  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  const detailType = searchParams.get('detail') || '';

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      setSearchType(type as any);
    }
  }, [query, type]);

  const searchTypes = [
    { value: 'all', label: 'All', icon: Search },
    { value: 'did', label: 'DIDs', icon: User },
    { value: 'token', label: 'Tokens', icon: Coins },
    { value: 'transaction', label: 'Transactions', icon: Hash },
    { value: 'block', label: 'Blocks', icon: Hash },
  ];

  const handleSearch = (query: string) => {
    setSearchParams({ q: query, type: searchType });
  };

  const handleTypeChange = (newType: string) => {
    setSearchType(newType as any);
    if (query) {
      setSearchParams({ q: query, type: newType });
    }
  };

  useEffect(() => {
    if (!query) {
      navigate('/');
    }
  }, [query, navigate]);

  const renderContent = () => {
    if (detailType && query) {
      switch (detailType) {
        case 'did':
          return <DIDDetails didId={query} />;
        case 'token':
          return <TokenDetails tokenId={query} />;
        case 'transaction':
          return <TransactionDetails transactionId={query} />;
        default:
          return <SearchResults query={query} type={type} />;
      }
    } else if (query) {
      return <SearchResults query={query} type={type} />;
    } else {
      return null; // Will redirect to home
    }
  };

  const renderSearchInterface = () => (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Search Header */}
      <motion.div
        className="text-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-heading dark:text-white">
          Search Rubix Network
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Find DIDs, tokens, transactions, and blocks across the Rubix ecosystem
        </p>
      </motion.div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="p-6">
          <div className="space-y-6">
            {/* Search Type Filter */}
            <div className="flex flex-wrap gap-2">
              {searchTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => handleTypeChange(type.value)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${searchType === type.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Search Tips Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center"
      >
        <Button
          variant="outline"
          size="md"
          onClick={() => setShowTips(!showTips)}
          className="flex items-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>{showTips ? 'Hide' : 'Show'} Search Tips</span>
        </Button>
      </motion.div>

      {/* Search Tips */}
      {showTips && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-heading">
                Search Tips
              </h2>
              <button
                onClick={() => setShowTips(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>DID Search</span>
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  Search for Decentralized Identifiers to view:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Token balances and total value</li>
                  <li>• Transaction history</li>
                  <li>• Pledged tokens and validator participation</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <Coins className="w-4 h-4" />
                  <span>Token Search</span>
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  Search for tokens (RBT/FT/NFT/SC) to view:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Current owner and deployer</li>
                  <li>• Token state and block height</li>
                  <li>• Transaction chain and history</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <Hash className="w-4 h-4" />
                  <span>Transaction Search</span>
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  Search for transactions to view:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Sender and receiver details</li>
                  <li>• Transaction type and amount</li>
                  <li>• Validator participation and timing</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <Hash className="w-4 h-4" />
                  <span>Block Search</span>
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  Search for blocks to view:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Block height and hash</li>
                  <li>• Transaction count and validator</li>
                  <li>• Gas usage and timing</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {renderContent()}
    </div>
  );
};
