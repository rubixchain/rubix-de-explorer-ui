import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { CopyButton } from '@/components/ui/CopyButton';
import { Info, ArrowLeft, Coins } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const DIDExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const did = searchParams.get('did') || '';

  const [loading, setLoading] = useState(true);
  const [didData, setDidData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'holdings' | 'transactions'>('holdings');
  const [currentPage, setCurrentPage] = useState(1);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const itemsPerPage = 5;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchDIDData = async (page = 1, limit = itemsPerPage) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/getdidinfo?did=${did}&page=${page}&limit=${limit}`);
      const data = await res.json();
      setDidData(data);
    } catch (err) {
      console.error('Error fetching DID data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (did) fetchDIDData(currentPage);
  }, [did, currentPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!didData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">No data found for this DID</p>
      </div>
    );
  }

  const totalPages = Math.ceil(didData.count / itemsPerPage);

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
        </div>

        {/* Tab Content */}
        {activeTab === 'holdings' && (
          <div className="space-y-3">
            {didData.rbts && didData.rbts.length > 0 ? (
              didData.rbts.map((token: any) => (
                <div
                  key={token.rbt_id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100"
                >
                  <div>
                    <p className="text-sm font-medium">{token.rbt_id}</p>
                  </div>
                  <div className="font-semibold">{token.token_value} RBT</div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center">No tokens found</p>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={didData.count}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </Card>
    </motion.div>
  );
};
