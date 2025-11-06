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

export const BurntTransactionExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const txId = searchParams.get("tx") || "";
  const [loading, setLoading] = useState(true);
  const [txData, setTxData] = useState<any>(null);
  const [tokenTransfers, setTokenTransfers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  //   const [activeTab, setActiveTab] = useState<'details' | 'transfers' | 'validators'>('details');
  const [activeTab, setActiveTab] = useState<"details">("details");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        if (!txId) {
          throw new Error("No transaction ID provided");
        }
        const response = await fetch(
          `${API_BASE_URL}/burnttxn-info?hash=${txId}`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch transaction data: ${response.statusText}`
          );
        }
        const data = await response.json();
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
          // confirmations: 120,
          type: data.txn_type || "",
          timestamp: new Date(data.epoch * 1000).toUTCString(), // Convert epoch to UTC string
          // blockId: data.block_hash || 'N/A',
          // executor_did: data.executor_did || 'N/A',
          owner_did: data.owner_did || "N/A",
          tokens: data.tokens,

          child_tokens: Array.isArray(data.child_tokens)
            ? data.child_tokens
            : [], // ✅ add this line

          // block_height : data.block_height
          //   validators: data.validator_pledge_map
          //     ? Object.keys(data.validator_pledge_map).map((address) => ({ address }))
          //     : [],
        };

        setTxData(formattedTxData);
        setError(null);
      } catch (error: any) {
        console.error("Error fetching transaction data:", error);
        setError(
          error.message || "An error occurred while fetching transaction data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [txId]);

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

  if (error || !txData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error ? "Error Loading Transaction" : "Transaction Not Found"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || "The requested transaction could not be found."}
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
        {/* Mobile Layout: Separate rows */}
        <div className="block sm:hidden">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Details for Burnt Block:
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-primary-600 dark:text-primary-400 break-all">
              {txData.id}
            </span>
            <CopyButton text={txData.id} size="sm" />
          </div>
        </div>
        {/* Desktop Layout: Same row */}
        <div className="hidden sm:flex items-center space-x-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 break-all">
          <span>Details for Burnt Block:</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-primary-600 dark:text-primary-400">
              {txData.block_hash}
            </span>
            <CopyButton text={txData.block_hash} size="sm" />
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
                  <p className="text-gray-500 dark:text-gray-400">
                    Transaction Hash:
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="font-mono text-gray-900 dark:text-white break-all">
                      {txData.block_hash}
                    </p>
                    <CopyButton text={txData.block_hash} size="sm" />
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
                  <p className="text-gray-500 dark:text-gray-400">Owner:</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-mono text-primary-600 dark:text-primary-400 break-all cursor-pointer"   onClick={() =>    
                       navigate(`/did-explorer?did=${txData.owner_did}`)}>
                      {txData.owner_did}
                    </p>
                    <CopyButton text={txData.owner_did} size="sm" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Burnt Token
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white cursor-pointer" 
                     onClick={() =>    
                       navigate(`/token-explorer?token=${Object.keys(txData.tokens).toLocaleString()}`)}
                    >
                      {txData.tokens
                        ? Object.keys(txData.tokens).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {txData.child_tokens && txData.child_tokens.length > 0 && (
            <div className="sm:col-span-2">
              <p className="text-gray-500 dark:text-gray-400">Minted Tokens:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {txData.child_tokens.map((tokenId: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => navigate(`/token-explorer?token=${tokenId}`)}
                    className="group flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg
                   hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 
                   border border-transparent hover:border-primary-300 dark:hover:border-primary-700
                   transition-all duration-200 cursor-pointer shadow-sm"
                  >
                    <p className="font-mono">{tokenId}</p>
                    <CopyButton text={tokenId} size="sm" />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-500 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
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
