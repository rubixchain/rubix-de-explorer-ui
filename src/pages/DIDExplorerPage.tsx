import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { CopyButton } from "@/components/ui/CopyButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { Info, ArrowLeft, Coins } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDIDInfo, useFTHoldings } from "@/hooks/useDIDs";

export const DIDExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const did = searchParams.get("did") || "";

  const [activeTab, setActiveTab] = useState<"holdings" | "ftholdings">(
    "holdings"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const itemsPerPage = 5;

  // Use React Query hooks - same pattern as HomePage and TransactionExplorerPage
  const { data: didData, isLoading: isLoadingDID, error: didError } = useDIDInfo(did, currentPage, itemsPerPage) as any 
  const { data: ftData, isLoading: isLoadingFT, error: ftError } = useFTHoldings(
    did,
    currentPage,
    itemsPerPage,
    activeTab === "ftholdings" // Only fetch when FT tab is active
  ) as any ;

  const loading = activeTab === "holdings" ? isLoadingDID : isLoadingFT ; 

  // Helper function to format long addresses
  const formatAddress = (address: string, length: number = 8): string => {
    if (!address || address === "N/A") return address;
    if (address.length <= length * 2) return address;
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  };

  // Use React Query states - same pattern as other pages
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

  if (didError || ftError || !didData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {didError || ftError ? "Error Loading DID" : "DID Not Found"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {didError || ftError ? "An error occurred while fetching DID data" : "No data found for this DID"}
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const totalPages =
    activeTab === "holdings"
      ? Math.ceil(didData.count / itemsPerPage)
      : ftData && Array.isArray(ftData)
      ? Math.ceil(ftData.length / itemsPerPage)
      : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:space-y-8 p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* DID Info */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-2">DID Explorer</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-sm text-gray-600">
          <span className="mb-2 sm:mb-0">Details for DID:</span>
          <div className="flex items-center gap-2">
            <Tooltip content={didData.did.did} position="top">
              <span className="font-mono text-primary-600 truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-none">
                {formatAddress(didData.did.did, 12)}
              </span>
            </Tooltip>
            <div className="flex-shrink-0">
              <CopyButton text={didData.did.did} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <p className="text-xs sm:text-sm text-gray-500">Total RBTs</p>
              <Info className="w-3 h-3 text-gray-500" />
            </div>
            <p className="text-lg sm:text-2xl font-bold">
              {didData.did.total_rbts} RBT
            </p>
          </div>
        </Card>
        <Card className="p-4 sm:p-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <p className="text-xs sm:text-sm text-gray-500">Total FTs</p>
              <Info className="w-3 h-3 text-gray-500" />
            </div>
            <p className="text-lg sm:text-2xl font-bold">
              {didData.did.total_fts}
            </p>
          </div>
        </Card>
        <Card className="p-4 sm:p-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <p className="text-xs sm:text-sm text-gray-500">Total NFTs</p>
              <Info className="w-3 h-3 text-gray-500" />
            </div>
            <p className="text-lg sm:text-2xl font-bold">
              {didData.did.total_nfts}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="p-4 sm:p-6">
        <div className="flex space-x-4 border-b border-gray-200 mb-4">
          <button
            onClick={() => {
              setActiveTab("holdings");
              setCurrentPage(1);
            }}
            className={`px-1 py-2 text-sm font-medium ${
              activeTab === "holdings"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-600"
            }`}
          >
            <Coins className="w-4 h-4 inline mr-1" /> Token Holdings
          </button>

          <button
            onClick={() => {
              setActiveTab("ftholdings");
              setCurrentPage(1);
            }}
            className={`px-1 py-2 text-sm font-medium ${
              activeTab === "ftholdings"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-600"
            }`}
          >
            <Coins className="w-4 h-4 inline mr-1" /> FT Holdings
          </button>
        </div>

        {/* RBT Holdings */}
        {activeTab === "holdings" && (
          <div className="space-y-3">
            {didData.rbts && didData.rbts.length > 0 ? (
              didData.rbts.map((token: any) => (
                <div
                  key={token.rbt_id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Tooltip content={token.rbt_id} position="top">
                      <p
                        className="text-sm font-medium truncate cursor-pointer hover:text-primary-600"
                        onClick={() => navigate(`/token-explorer?token=${token.rbt_id}`)}
                      >
                        {formatAddress(token.rbt_id, 12)}
                      </p>
                    </Tooltip>
                    <div className="flex-shrink-0">
                      <CopyButton text={token.rbt_id} size="sm" />
                    </div>
                  </div>
                  <div className="font-semibold text-sm sm:text-base whitespace-nowrap">
                    {token.token_value} RBT
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center">
                No RBT tokens found
              </p>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={didData.count}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}

        {/* FT Holdings */}
        {activeTab === "ftholdings" && (
          <div className="space-y-3">
         {ftData && Array.isArray(ftData) && ftData.length > 0 ? (
  ftData
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    .map((ft: any) => (
      <div
        key={ft.ft_id}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 gap-3"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium mb-2">{ft.ft_name || "Unnamed Token"}</p>
          <div className="flex items-center gap-2">
            <Tooltip content={ft.ft_id} position="top">
              <p
                className="text-xs text-gray-500 truncate cursor-pointer hover:text-primary-600"
                onClick={() => navigate(`/token-explorer?token=${ft.ft_id}`)}
              >
                {formatAddress(ft.ft_id, 12)}
              </p>
            </Tooltip>
            <div className="flex-shrink-0">
              <CopyButton text={ft.ft_id} size="sm" />
            </div>
          </div>
        </div>
        <div className="font-semibold text-sm sm:text-base whitespace-nowrap">
          {isNaN(Number(ft.token_value)) ? "0" : Number(ft.token_value)} FT
        </div>
      </div>
    ))
) : (
  <p className="text-gray-500 text-sm text-center">No FT tokens found</p>
)}
            {ftData && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={ftData.length}
                itemsPerPage={5}
              />
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
};
