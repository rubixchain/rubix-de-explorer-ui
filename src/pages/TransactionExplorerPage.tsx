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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTransaction } from "@/hooks/useTransactions";

export const TransactionExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const txId = searchParams.get("tx") || "";

  // Use React Query hook - same pattern as HomePage
  const { data: rawData, isLoading, error: queryError } = useTransaction(txId);

  const [txData, setTxData] = useState<any>(null);
  const [tokenTransfers, setTokenTransfers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"details" | "validators">(
    "details"
  );
  const [expandedValidator, setExpandedValidator] = useState<number | null>(
    null
  );

  // Generate dummy token data for each validator
  const generateDummyTokens = (validatorIndex: number) => {
    const tokenCount = Math.floor(Math.random() * 5) + 3; // 3-7 tokens per validator
    return Array.from({ length: tokenCount }, (_, i) => ({
      id: `token-${validatorIndex}-${i}`,
      tokenId: `${Math.random().toString(36).substr(2, 8)}...${Math.random()
        .toString(36)
        .substr(2, 8)}`,
    }));
  };

  const toggleValidator = (index: number) => {
    // If clicking the same validator, collapse it. Otherwise, open the new one and close others
    setExpandedValidator((prev) => (prev === index ? null : index));
  };

  // Helper function to format addresses
  const formatAddress = (address: string, length: number = 8): string => {
    if (!address || address === "N/A") return address;
    if (address.length <= length * 2) return address;
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  };

  // Transform data when rawData changes - same pattern as HomePage
  useEffect(() => {
    if (!rawData) return;

    const data = rawData;
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
      id: data.txn_id || "N/A",
      status: "confirmed",
      confirmations: 120,
      type: mapTxnType(data.txn_type || ""),
      value: data.amount ? `${data.amount} RBT` : "N/A",
      valueUSD: "N/A",
      timestamp: data.epoch
        ? new Date(data.epoch * 1000).toUTCString()
        : "N/A",
      blockId: data.block_hash || "N/A",
      from: data.sender_did || "N/A",
      to: data.receiver_did || "N/A",
      tokens: data.tokens
        ? Object.entries(data.tokens).map(
            ([tokenId, tokenData]: [string, any]) => ({
              tokenId,
              type: tokenData.TTTokenTypeKey,
              blockNumber: tokenData.TTBlockNumberKey,
              previousBlockId: tokenData.TTPreviousBlockIDKey,
            })
          )
        : [],
      validators: data.validator_pledge_map
        ? Object.entries(data.validator_pledge_map).map(
            ([validatorDid, pledgeArray]) => {
              const pledges = (pledgeArray as any[]).map((entry: any) => ({
                token: entry["8-1"],
              }));
              return {
                validator: validatorDid,
                pledgedTokens: pledges,
              };
            }
          )
        : [],
    };

    // Map token IDs to tokenTransfers structure
    const formattedTokenTransfers =
      tokenIds.length > 0
        ? tokenIds.map((tokenId: string, index: number) => ({
            id: `transfer-${index + 1}`,
            tokenId,
            tokenName: `Token ${tokenId.slice(0, 8)}...`, // Truncate tokenId for display
            tokenType: "RBT", // Default to RBT as token type is not used
            from: data.sender_did || "N/A",
            to: data.receiver_did || "N/A",
            amount: data.amount ? data.amount.toString() : "N/A", // Use 'N/A' if amount is null
            amountUSD: "N/A",
            timestamp: "2 minutes ago", // No specific timestamp per token, using default
            status: "confirmed",
          }))
        : [];

    setTxData(formattedTxData);
    setTokenTransfers(formattedTokenTransfers);
    
  }, [rawData]);

  // Use React Query states - same pattern as HomePage
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
          Transaction Explorer
        </h1>
        {/* Mobile Layout: Separate rows */}
        <div className="block sm:hidden">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Details for Transaction:
          </div>
          <div className="flex items-center space-x-2">
            <Tooltip content={txData.id} position="top">
              <span className="font-mono text-primary-600 dark:text-primary-400 cursor-pointer">
                {formatAddress(txData.id, 8)}
              </span>
            </Tooltip>
            <CopyButton text={txData.id} size="sm" />
          </div>
        </div>
        {/* Desktop Layout: Same row */}
        <div className="hidden sm:flex items-center space-x-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          <span>Details for Transaction:</span>
          <div className="flex items-center space-x-2">
            <Tooltip content={txData.id} position="top">
              <span className="font-mono text-primary-600 dark:text-primary-400 cursor-pointer">
                {formatAddress(txData.id, 12)}
              </span>
            </Tooltip>
            <CopyButton text={txData.id} size="sm" />
          </div>
        </div>
      </div>
      {/* Tabbed Content */}
      <Card className="p-4 sm:p-6">
        {/* Tab Navigation */}
        <div className="flex flex-row space-x-2 sm:space-x-4 md:space-x-8 border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("details")}
            className={`relative flex items-center space-x-1.5 sm:space-x-2 px-1 py-3 sm:py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === "details"
                ? "text-primary-600 dark:text-primary-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Hash className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Transaction Details</span>
              <span className="sm:hidden">Details</span>
            </span>
            {activeTab === "details" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("validators")}
            className={`relative flex items-center space-x-1.5 sm:space-x-2 px-1 py-3 sm:py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === "validators"
                ? "text-primary-600 dark:text-primary-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Validator Information</span>
              <span className="sm:hidden">Validators</span>
            </span>
            {activeTab === "validators" && (
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
                    <Tooltip content={txData.id} position="top">
                      <p className="font-mono text-gray-900 dark:text-white cursor-pointer">
                        {formatAddress(txData.id, 8)}
                      </p>
                    </Tooltip>
                    <CopyButton text={txData.id} size="sm" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Type:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {txData.type}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Amount:</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {txData.value}
                    </p>
                    {txData.valueUSD !== "N/A" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        {txData.valueUSD}
                      </span>
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
                  <p className="text-gray-500 dark:text-gray-400">From:</p>
                  <div className="flex items-center space-x-2">
                    <Tooltip content={txData.from} position="top">
                      <p
                        className="font-mono text-primary-600 dark:text-primary-400 cursor-pointer"
                        onClick={() =>
                          navigate(`/did-explorer?did=${txData.from}`)
                        }
                      >
                        {formatAddress(txData.from, 8)}
                      </p>
                    </Tooltip>
                    <CopyButton text={txData.from} size="sm" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">To:</p>
                  <div className="flex items-center space-x-2">
                    <Tooltip content={txData.to} position="top">
                      <p
                        className="font-mono text-primary-600 dark:text-primary-400 cursor-pointer"
                        onClick={() =>
                          navigate(`/did-explorer?did=${txData.to}`)
                        }
                      >
                        {formatAddress(txData.to, 8)}
                      </p>
                    </Tooltip>
                    <CopyButton text={txData.to} size="sm" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Block Hash:
                  </p>
                  <Tooltip content={txData.blockId} position="top">
                    <p className="font-medium text-gray-900 dark:text-white cursor-pointer">
                      {formatAddress(txData.blockId, 8)}
                    </p>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}
{activeTab === "validators" && (
  <div className="space-y-3">
    {txData.validators && txData.validators.length > 0 ? (
      txData.validators.map((validator: any, index: number) => {
        const isExpanded = expandedValidator === index;
        const pledgedTokens = validator.pledgedTokens || [];

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors overflow-hidden"
          >
            {/* Validator Header - Clickable to expand/collapse */}
            <div
              onClick={() => toggleValidator(index)}
              className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-400 text-xs sm:text-sm font-bold">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap hidden sm:inline">
                    Validator Address:
                  </p>
                 
                    <p
                      className="font-mono text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 cursor-pointer truncate flex-1"
                      // onClick={(e) => {
                      //   e.stopPropagation();
                      //   navigate(
                      //     `/did-explorer?did=${validator.validator}`
                      //   );
                      // }}
                    >
                      {formatAddress(validator.validator, 6)}
                    </p>
                  <div
                    className="flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CopyButton text={validator.validator} size="sm" />
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Expandable Token List */}
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="p-3 sm:p-4">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                    Pledged Tokens ({pledgedTokens.length})
                  </h4>
                  {pledgedTokens.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 sm:pr-2">
                      {pledgedTokens.map((pledge: any, tokenIndex: number) => (
                        <div
                          key={pledge.token}
                          className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                     
                    
                            <span 
                              className="font-mono text-xs sm:text-sm text-primary-600 dark:text-primary-400 flex-1"
                            //   onClick={() => 
                            //     navigate(`/token-explorer?token=${pledge.token}`)
                            // }
                            >
                              {pledge.token}
                            </span>
                          {/* <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              Amount: {pledge.pledgeAmount}
                            </span>
                            <CopyButton
                              text={pledge.token}
                              size="sm"
                            />
                          </div> */}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      No pledged tokens found for this validator.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })
    ) : (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        No validators found for this transaction.
      </p>
    )}
  </div>
)}
        </motion.div>
      </Card>

      {/* Tokens Section - Separate from tabs */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center space-x-2 mb-4 sm:mb-6">
          <DollarSign className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-lg sm:text-xl font-bold text-heading dark:text-white">
            Tokens
          </h2>
        </div>
        <div>
          {tokenTransfers.length === 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No token transfers found for this transaction.
            </p>
          )}
          {/* Card View for All Resolutions */}
          <div className="space-y-3">
            {tokenTransfers.map((transfer: any, index: number) => (
              <motion.div
                key={transfer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() =>
                  navigate(
                    `/token-explorer?token=${encodeURIComponent(
                      transfer.tokenId
                    )}`
                  )
                }
                className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {/* <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transfer.tokenType === "RBT"
                            ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                            : transfer.tokenType === "FT"
                            ? "bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200"
                            : transfer.tokenType === "NFT"
                            ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                            : "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                        }`}
                      >
                        {transfer.tokenType}
                      </span> */}
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          transfer.status === "confirmed"
                            ? "bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200"
                            : "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                        }`}
                      >
                        {transfer.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tooltip content={transfer.tokenId} position="top">
                        <div className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer truncate flex-1">
                          {formatAddress(transfer.tokenId, 12)}
                        </div>
                      </Tooltip>
                      <div className="flex-shrink-0">
                        <CopyButton text={transfer.tokenId} size="sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">
                          From:
                        </p>
                        <div className="flex items-center gap-1.5">
                         
                            <p className="font-mono text-gray-900 dark:text-white cursor-pointer truncate">
                              {formatAddress(transfer.from, 8)}
                            </p>
                         
                          <div className="flex-shrink-0">
                            <CopyButton text={transfer.from} size="sm" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">
                          To:
                        </p>
                        <div className="flex items-center gap-1.5">
                         
                            <p className="font-mono text-gray-900 dark:text-white cursor-pointer truncate">
                              {formatAddress(transfer.to, 8)}
                            </p>
                          <div className="flex-shrink-0">
                            <CopyButton text={transfer.to} size="sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{transfer.timestamp}</div> */}
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-2 sm:ml-4">
                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-2 mb-1">
                        {/* <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-lg">
                              {transfer.amount}
                            </div> */}
                        {/* <div className="text-xs text-gray-500 dark:text-gray-400">
                          {transfer.tokenType}
                        </div> */}
                        {/* {transfer.amount && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                {transfer.amount}
                              </span>
                            )} */}
                      </div>
                    </div>
                    <div className="text-gray-400 dark:text-gray-500 text-xs">
                      →
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
