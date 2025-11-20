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
import { useSCTransaction } from "@/hooks/useTransactions";

export const SCTransactionExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const txId = searchParams.get("tx") || "";

  // Use React Query hook - same pattern as HomePage and other pages
  const { data: rawData, isLoading, error: queryError } = useSCTransaction(txId);

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

    const data : any  = rawData;
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
      id: data.block_id || "N/A",
      contract_id: data.contract_id || "N/A",
      status: "confirmed",
      confirmations: 120,
      type: mapTxnType(data.txn_type || ""),
      timestamp: data.epoch || "N/A",
      blockId: data.block_hash || "N/A",
      executor_did: data.executor_did || "N/A",
      owner_did: data.owner_did || "N/A",
      block_height: data.block_height,
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
          Smart Contract Explorer
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          <span className="mb-2 sm:mb-0">Details for Smart contract:</span>
          <div className="flex items-center gap-2">
            <Tooltip content={txData.id} position="top">
              <span className="font-mono text-primary-600 dark:text-primary-400 truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-none">
                {formatAddress(txData.id, 12)}
              </span>
            </Tooltip>
            <div className="flex-shrink-0">
              <CopyButton text={txData.id} size="sm" />
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
            <span className="text-xs sm:text-sm">Transaction Details</span>
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
                    <Tooltip content={txData.id} position="top">
                      <p className="font-mono text-gray-900 dark:text-white truncate">
                        {formatAddress(txData.id, 8)}
                      </p>
                    </Tooltip>
                    {txData.id !== 'N/A' && (
                      <div className="flex-shrink-0">
                        <CopyButton text={txData.id} size="sm" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Contract ID
                  </p>
                  <div className="flex items-center gap-2">
                    <Tooltip content={txData.contract_id} position="top">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {formatAddress(txData.contract_id, 8)}
                      </p>
                    </Tooltip>
                    {txData.contract_id !== 'N/A' && (
                      <div className="flex-shrink-0">
                        <CopyButton text={txData.contract_id} size="sm" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Timestamp:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {txData.timestamp}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">Executor :</p>
                  <div className="flex items-center gap-2">
                    <Tooltip content={txData.executor_did} position="top">
                      <p className={`font-mono text-primary-600 dark:text-primary-400 truncate ${txData.executor_did !== 'N/A' ? 'cursor-pointer hover:text-primary-700' : ''}`}
                         onClick={() => txData.executor_did !== 'N/A' && navigate(`/did-explorer?did=${txData.executor_did}`)}>
                        {formatAddress(txData.executor_did, 8)}
                      </p>
                    </Tooltip>
                    {txData.executor_did !== 'N/A' && (
                      <div className="flex-shrink-0">
                        <CopyButton text={txData.executor_did} size="sm" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">Deployer :</p>
                  <div className="flex items-center gap-2">
                    <Tooltip content={txData.owner_did} position="top">
                      <p className={`font-mono text-primary-600 dark:text-primary-400 truncate ${txData.owner_did !== 'N/A' ? 'cursor-pointer hover:text-primary-700' : ''}`}
                         onClick={() => txData.owner_did !== 'N/A' && navigate(`/did-explorer?did=${txData.owner_did}`)}>
                        {formatAddress(txData.owner_did, 8)}
                      </p>
                    </Tooltip>
                    {txData.owner_did !== 'N/A' && (
                      <div className="flex-shrink-0">
                        <CopyButton text={txData.owner_did} size="sm" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Block Height:
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {txData.block_height}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
};
