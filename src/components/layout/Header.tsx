import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useSearch } from '@/hooks/useSearch';

const NetworkToggle: React.FC<{
  selected: string;
  onChange: (chain: string) => void;
  className?: string;
}> = ({ selected, onChange, className = '' }) => {
  const isMainnet = selected === 'mainnet';
  return (
    <div className={`flex items-center bg-gray-100 rounded-full p-0.5 gap-0.5 ${className}`}>
      <button
        onClick={() => onChange('mainnet')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
          isMainnet
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isMainnet ? 'bg-green-500' : 'bg-gray-400'}`} />
        Mainnet
      </button>
      <button
        onClick={() => onChange('testnet')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
          !isMainnet
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${!isMainnet ? 'bg-blue-500' : 'bg-gray-400'}`} />
        Testnet
      </button>
    </div>
  );
};

export const Header: React.FC = () => {
  const { state, setSearchQuery, setSelectedChain } = useApp();
  const navigate = useNavigate();
  const { search, isLoading } = useSearch();
  const [searchQuery, setSearchQueryState] = React.useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const clearSearch = () => {
    setSearchQueryState('');
    searchInputRef.current?.focus();
  };

  const performSearch = () => {
    const query = searchQuery.trim();
    if (query) {
      setSearchQuery(query);
      search(query);

      if (query.includes('_')) {
        navigate(`/token-explorer?token=${encodeURIComponent(query)}`);
      } else if (query.startsWith('bafy')) {
        navigate(`/did-explorer?did=${encodeURIComponent(query)}`);
      } else if (query.startsWith('qem')) {
        navigate(`/sc-transaction-explorer?tx=${encodeURIComponent(query)}`);
      } else if (query.startsWith('Qm')) {
        navigate(`/token-explorer?token=${encodeURIComponent(query)}`);
      } else {
        navigate(`/transaction-explorer?tx=${encodeURIComponent(query)}`);
      }
      searchInputRef.current?.blur();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
        setSearchQueryState('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-3">
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <img src="/rubix-icon.png" alt="Rubix Logo" className="h-6 w-auto" />
              <span className="text-sm font-semibold text-heading font-heading whitespace-nowrap">
                Rubix Explorer
              </span>
            </Link>
            <NetworkToggle selected={state.selectedChain} onChange={setSelectedChain} />
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="w-full">
            <div className="flex items-stretch border border-gray-200 rounded-full bg-gray-50 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all duration-200">
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQueryState(e.target.value)}
                  placeholder="Search DID, tokens, transactions..."
                  className="w-full pl-9 pr-8 py-2.5 bg-transparent border-none rounded-l-full text-sm placeholder-gray-500 focus:outline-none"
                />
                {isLoading ? (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                ) : (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-gray-400 text-xs">/</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={performSearch}
                disabled={isLoading || !searchQuery.trim()}
                className="px-4 py-2.5 bg-primary-600 text-white rounded-r-full hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium flex-shrink-0"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Tablet & Desktop Layout */}
        <div className="hidden md:flex items-center gap-3 lg:gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
            <img src="/rubix-icon.png" alt="Rubix Logo" className="h-7 lg:h-8 w-auto" />
            <span className="text-base lg:text-lg font-semibold text-heading font-heading whitespace-nowrap">
              Rubix Explorer
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-3xl lg:max-w-4xl mx-4 lg:mx-8">
            <div className="flex items-stretch border border-gray-200 rounded-full bg-gray-50 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all duration-200">
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQueryState(e.target.value)}
                  placeholder="Search DID, tokens, or transactions..."
                  className="w-full pl-9 lg:pl-11 pr-10 py-2 lg:py-2.5 bg-transparent border-none rounded-l-full text-sm placeholder-gray-500 focus:outline-none"
                />
                {isLoading ? (
                  <div className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={performSearch}
                disabled={isLoading || !searchQuery.trim()}
                className="px-4 lg:px-6 py-2 lg:py-2.5 bg-primary-600 text-white rounded-r-full hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium whitespace-nowrap flex-shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Network Toggle */}
          <NetworkToggle selected={state.selectedChain} onChange={setSelectedChain} className="flex-shrink-0" />
        </div>
      </div>
    </header>
  );
};
