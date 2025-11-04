import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { CopyButton } from "@/components/ui/CopyButton";
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
                ? "text-blue-600 border-b-2 border-blue-600"
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
                ? "text-blue-600 border-b-2 border-blue-600"
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
                  onClick={() =>
                    navigate(`/token-explorer?token=${token.rbt_id}`)
                  }
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100"
                >
                  <p className="text-sm font-medium">{token.rbt_id}</p>
                  <div className="font-semibold">{token.token_value} RBT</div>
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
        onClick={() => navigate(`/ft-explorer?ft=${ft.ft_id}`)}
        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100"
      >
        <div>
          <p className="text-sm font-medium">{ft.ft_name || "Unnamed Token"}</p>
          <p className="text-xs text-gray-500 break-all">{ft.ft_id}</p>
        </div>
        <div className="font-semibold">
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
