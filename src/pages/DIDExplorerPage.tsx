import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { CopyButton } from '@/components/ui/CopyButton';
import { Tooltip } from '@/components/ui/Tooltip';
import { ArrowLeft, User, Coins, Activity, Shield, Info } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Mock data for recent transactions (unchanged as it wasn't specified in API data)
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
    timestamp: '82147483647 hours ago',
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
  // const [recentTransactions] = useState<any[]>(MOCK_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState<'holdings' | 'transactions'>('holdings');
  const [currentPage, setCurrentPage] = useState(1);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const getData = async () => {
      try {
        let BASE_API = 'https://relay-texts-interior-blink.trycloudflare.com/api/';
        const response = await fetch(`${BASE_API}/getdidinfo?did=${did}`);
        const didInfo = await response.json();
        setDidData(didInfo);
        setLoading(false);
      } catch (error) {
        console.error("error", error);
        setLoading(false);
      }
    };

    if (did) getData();
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
      className="space-y-6 sm:space-y-8 p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* DID Info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">DID Explorer</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600 break-all">
          <span>Details for DID:</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-blue-600">{didData.did.did}</span>
            <CopyButton text={didData.did.did} size="sm" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <p className="text-xs sm:text-sm text-gray-500">Total RBTs</p>
              <div
                className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center cursor-help"
                onMouseEnter={() => setShowTooltip('totalBalance')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Info className="w-2.5 h-2.5 text-gray-500" />
              </div>
              {showTooltip === 'totalBalance' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
                  Total RBT tokens held in this DID's wallet
                </div>
              )}
            </div>
            <p className="text-lg sm:text-2xl font-bold">{didData.did.total_rbts} RBT</p>
          </div>
        </Card>
        <Card className="p-4 sm:p-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <p className="text-xs sm:text-sm text-gray-500">Total FTs</p>
              <div
                className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center cursor-help"
                onMouseEnter={() => setShowTooltip('totalFTs')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Info className="w-2.5 h-2.5 text-gray-500" />
              </div>
              {showTooltip === 'totalFTs' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
                  Total Fungible Tokens held in this DID's wallet
                </div>
              )}
            </div>
            <p className="text-lg sm:text-2xl font-bold">{didData.did.total_fts}</p>
          </div>
        </Card>
        <Card className="p-4 sm:p-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <p className="text-xs sm:text-sm text-gray-500">Total NFTs</p>
              <div
                className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center cursor-help"
                onMouseEnter={() => setShowTooltip('totalNFTs')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Info className="w-2.5 h-2.5 text-gray-500" />
              </div>
              {showTooltip === 'totalNFTs' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
                  Total Non-Fungible Tokens held in this DID's wallet
                </div>
              )}
            </div>
            <p className="text-lg sm:text-2xl font-bold">{didData.did.total_nfts}</p>
          </div>
        </Card>
        <Card className="p-4 sm:p-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <p className="text-xs sm:text-sm text-gray-500">Total Smart Contracts</p>
              <div
                className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center cursor-help"
                onMouseEnter={() => setShowTooltip('totalSC')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Info className="w-2.5 h-2.5 text-gray-500" />
              </div>
              {showTooltip === 'totalSC' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
                  Total Smart Contracts associated with this DID
                </div>
              )}
            </div>
            <p className="text-lg sm:text-2xl font-bold">{didData.did.total_sc}</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="p-4 sm:p-6">
        <div className="flex space-x-4 border-b border-gray-200 mb-4">
          <button
            onClick={() => { setActiveTab('holdings'); setCurrentPage(1); }}
            className={`px-1 py-2 text-sm font-medium ${activeTab === 'holdings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          >
            <Coins className="w-4 h-4 inline mr-1" /> Token Holdings
          </button>
          <button
            onClick={() => { setActiveTab('transactions'); setCurrentPage(1); }}
            className={`px-1 py-2 text-sm font-medium ${activeTab === 'transactions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          >
            <Activity className="w-4 h-4 inline mr-1" /> Recent Transactions
          </button>
        </div>
        

        {/* Tab Content */}
        {activeTab === 'holdings' && (
          <div className="space-y-3">
            {didData.rbts
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((token: any) => (
                <div
                  key={token.rbt_id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100"
                >
                  <div>
                    <p className="text-sm font-medium"> {token.rbt_id}</p>
                    <p className="text-xs text-gray-500">ID: {token.rbt_id}</p>
                  </div>
                  <div className="font-semibold">{token.token_value} RBT</div>
                </div>
              ))
            }
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(didData.rbts.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={didData.rbts.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}

        {/* {activeTab === 'transactions' && (
          <div className="space-y-3">
            {recentTransactions
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((tx: any) => (
                <div
                  key={tx.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100"
                >
                  <div>
                    <p className="text-sm font-mono truncate">{tx.id}</p>
                    <p className="text-xs text-gray-500">Type: {tx.type}</p>
                    <p className="text-xs text-gray-500">Time: {tx.timestamp}</p>
                    <p className="text-xs text-gray-500">Status: {tx.status}</p>
                  </div>
                  <div className="font-semibold">{tx.amount}</div>
                </div>
              ))
            }
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(recentTransactions.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={recentTransactions.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )} */}
      </Card>
    </motion.div>
  );
};