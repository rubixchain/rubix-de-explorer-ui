import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Hash,
  User,
  DollarSign,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useBurntTransaction } from "@/hooks/useTransactions";

export const BurntTransactionExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const txId = searchParams.get("tx") || "";

  // Use React Query hook - same pattern as HomePage and other pages
  const { data: rawData, isLoading, error: queryError } = useBurntTransaction(txId);

  const [txData, setTxData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"details">("details");

  // Helper function to format long addresses
  const formatAddress = (address: string, length: number = 8): string => {
    if (!address || address === "N/A") return address;
    if (address.length <= length * 2) return address;
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  };

  // Transform data when rawData changes - same pattern as other pages
  useEffect(() => {
    if (!rawData) return;

    const data : any = rawData;
    const mapTxnType = (type: string): string => {
      switch (type) {
        case "02":
          return "Transfer";
        default:
          return "Unknown";
      }
    };

    // Handle tokens as an object, using only keys
    const tokenIds =
      data.tokens && typeof data.tokens === "object"
        ? Object.keys(data.tokens)
        : [];
    if (!Array.isArray(tokenIds)) {
      console.warn(
        "Tokens field does not contain valid keys:",
        data.tokens
      );
    }

    const formattedTxData = {
      block_hash: data.block_hash || "N/A",
      status: "confirmed",
      type: data.txn_type || "",
      timestamp: data.epoch || "N/A",
      owner_did: data.owner_did || "N/A",
      tokens: data.tokens,
      child_tokens: Array.isArray(data.child_tokens)
        ? data.child_tokens
        : [],
    };

    setTxData(formattedTxData);
  }, [rawData]);

  // Use React Query states - same pattern as other pages
  if (isLoading) {
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

  if (queryError || !txData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {queryError ? "Error Loading Transaction" : "Transaction Not Found"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {queryError ? "An error occurred while fetching transaction data" : "The requested transaction could not be found."}
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-tertiary-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-primary-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-tertiary-600 dark:text-tertiary-400";
      case "pending":
        return "text-primary-600 dark:text-primary-400";
      case "failed":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
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
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-heading dark:text-white mb-2">
          Burnt Block Explorer
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          <span className="mb-2 sm:mb-0">Details for Burnt Block:</span>
          <div className="flex items-center gap-2">
            <Tooltip content={txData.block_hash} position="top">
              <span className="font-mono text-primary-600 dark:text-primary-400 truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-none">
                {formatAddress(txData.block_hash, 12)}
              </span>
            </Tooltip>
            <div className="flex-shrink-0">
              <CopyButton text={txData.block_hash} size="sm" />
            </div>
          </div>
        </div>
      </div>
      {/* Tabbed Content */}
      <Card className="p-4 sm:p-6">
        {/* Tab Navigation */}
        <div className="flex flex-row space-x-4 sm:space-x-8 border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
          <button
            onClick={() => setActiveTab("details")}
            className={`relative flex items-center space-x-2 px-1 py-3 sm:py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === "details"
                ? "text-primary-600 dark:text-primary-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Hash className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Burnt Block Details</span>
            {activeTab === "details" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
          {activeTab === "details" && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Transaction Hash:
                  </p>
                  <div className="flex items-center gap-2">
                    <Tooltip content={txData.block_hash} position="top">
                      <p className="font-mono text-gray-900 dark:text-white truncate">
                        {formatAddress(txData.block_hash, 8)}
                      </p>
                    </Tooltip>
                    <div className="flex-shrink-0">
                      <CopyButton text={txData.block_hash} size="sm" />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Type:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {txData.type}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Timestamp:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {txData.timestamp}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">Owner:</p>
                  <div className="flex items-center gap-2">
                    <Tooltip content={txData.owner_did} position="top">
                      <p className="font-mono text-primary-600 dark:text-primary-400 truncate cursor-pointer hover:text-primary-700"
                         onClick={() => navigate(`/did-explorer?did=${txData.owner_did}`)}>
                        {formatAddress(txData.owner_did, 8)}
                      </p>
                    </Tooltip>
                    <div className="flex-shrink-0">
                      <CopyButton text={txData.owner_did} size="sm" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      Burnt Token
                    </p>
                    <div className="flex items-center gap-2">
                      <Tooltip content={txData.tokens ? Object.keys(txData.tokens).toLocaleString() : "N/A"} position="top">
                        <p className="font-medium text-gray-900 dark:text-white truncate cursor-pointer hover:text-primary-600"
                           onClick={() => navigate(`/token-explorer?token=${Object.keys(txData.tokens).toLocaleString()}`)}>
                          {txData.tokens
                            ? formatAddress(Object.keys(txData.tokens).toLocaleString(), 8)
                            : "N/A"}
                        </p>
                      </Tooltip>
                      {txData.tokens && (
                        <div className="flex-shrink-0">
                          <CopyButton text={Object.keys(txData.tokens).toLocaleString()} size="sm" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {txData.child_tokens && txData.child_tokens.length > 0 && (
            <div className="sm:col-span-2 mt-4">
              <p className="text-gray-500 dark:text-gray-400 mb-3">Minted Tokens:</p>
              <div className="flex flex-wrap gap-2">
                {txData.child_tokens.map((tokenId: string, idx: number) => (
                  <div
                    key={idx}
                    className="group flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 rounded-lg
                   hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400
                   border border-transparent hover:border-primary-300 dark:hover:border-primary-700
                   transition-all duration-200 shadow-sm max-w-full"
                  >
                    <Tooltip content={tokenId} position="top">
                      <p
                        className="font-mono text-sm truncate max-w-[150px] sm:max-w-[200px] cursor-pointer"
                        onClick={() => navigate(`/token-explorer?token=${tokenId}`)}
                      >
                        {formatAddress(tokenId, 8)}
                      </p>
                    </Tooltip>
                    <div className="flex-shrink-0 flex items-center gap-1">
                      <CopyButton text={tokenId} size="sm" />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-500 transition-colors cursor-pointer"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        onClick={() => navigate(`/token-explorer?token=${tokenId}`)}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
};
