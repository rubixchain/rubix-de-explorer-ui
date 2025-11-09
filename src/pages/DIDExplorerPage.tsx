import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { CopyButton } from "@/components/ui/CopyButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { Info, ArrowLeft, Coins } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const DIDExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const did = searchParams.get("did") || "";

  const [loading, setLoading] = useState(true);
  const [didData, setDidData] = useState<any>(null);
  const [ftData, setFTData] = useState<any>(null); // for fungible tokens
  const [activeTab, setActiveTab] = useState<"holdings" | "ftholdings">(
    "holdings"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const itemsPerPage = 5;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Helper function to format long addresses
  const formatAddress = (address: string, length: number = 8): string => {
    if (!address || address === "N/A") return address;
    if (address.length <= length * 2) return address;
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  };

  // Fetch DID base info + RBTs
  const fetchDIDData = async (page = 1, limit = itemsPerPage) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/getdidinfo?did=${did}&page=${page}&limit=${limit}`
      );
      const data = await res.json();
      setDidData(data);
      console.log("tt", data);
    } catch (err) {
      console.error("Error fetching DID data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch FT holdings
  const fetchFTData = async (page = 1, limit = itemsPerPage) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/ftholdings?did=${did}&page=${page}&limit=${limit}`
      );
      const data = await res.json();
      console.log("tst", data.ft_info);
      setFTData(data.ft_info);
    } catch (err) {
      console.error("Error fetching FT data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch RBT holdings initially
  useEffect(() => {
    if (did) fetchDIDData(currentPage);
  }, [did, currentPage]);

  // Fetch FT holdings when tab is switched to "ftholdings"
  useEffect(() => {
    if (activeTab === "ftholdings" && did) {
      fetchFTData(currentPage);
    }
  }, [activeTab, did, currentPage]);

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
