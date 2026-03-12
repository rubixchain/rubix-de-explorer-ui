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
  Lock,
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
  const [activeTab, setActiveTab] = useState<"details" | "validators" | "committed">(
    "details"
  );
  const [activeAssetTab, setActiveAssetTab] = useState<"rbt" | "ft" | "nft" | "sc">("rbt");
  const [committedTokens, setCommittedTokens] = useState<any[]>([]);
  const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)"); // Tailwind sm
    const listener = () => setIsMobile(media.matches);

    listener(); // initial check
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return isMobile;
};

const isMobile = useIsMobile();

const formatAddress = (
  address: string,
  desktopLength = 50,
  mobileLength = 8
): string => {
  if (!address || address === "N/A") return address;

  const length = isMobile ? mobileLength : desktopLength;
  if (address.length <= length * 2) return address;

  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

  // Transform data when rawData changes - same pattern as HomePage
  useEffect(() => {
    if (!rawData) return;

    
    const data : any  = rawData;
    // Handle tokens as an object, using only keys
    const tokenIds =
      data.tokens && typeof data.tokens === "object"
        ? Object.keys(data.tokens)
        : [];

    const rawStatus = (data.status || "").toString().toLowerCase();
    const status = rawStatus === "failed" || rawStatus === "false" || rawStatus === "0"
      ? "failed"
      : "success";

    const formattedTxData = {
      id: data.txn_id || "N/A",
      status,
      value: data.amount ? `${data.amount} RBT` : "N/A",
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
              return {
                did: validatorDid,
              };
            }
          )
        : [],
    };

    // Determine category for a token based on type value and tokenId pattern
    const getTokenCategory = (tokenId: string, type: any): "rbt" | "ft" | "nft" | "sc" => {
      const typeStr = String(type || "").toLowerCase();
      if (typeStr === "ft" || typeStr === "3") return "ft";
      if (typeStr === "nft" || typeStr === "4") return "nft";
      if (typeStr === "sc" || typeStr === "5") return "sc";
      // Fall back to pattern matching on tokenId
      if (tokenId.includes("_")) return "ft";
      if (tokenId.startsWith("qem")) return "sc";
      return "rbt";
    };

    // Map token IDs to tokenTransfers structure with category
    const formattedTokenTransfers =
      tokenIds.length > 0
        ? tokenIds.map((tokenId: string, index: number) => {
            const tokenData = data.tokens?.[tokenId];
            const category = getTokenCategory(tokenId, tokenData?.TTTokenTypeKey);
            // For FTs: parse name and creator from tokenId (format: creatorDID_ftName)
            const underscoreIdx = tokenId.lastIndexOf("_");
            const ftName = underscoreIdx !== -1 ? tokenId.slice(underscoreIdx + 1) : tokenId;
            const ftCreatorDid = underscoreIdx !== -1 ? tokenId.slice(0, underscoreIdx) : (data.sender_did || "N/A");
            return {
              id: `transfer-${index + 1}`,
              tokenId,
              category,
              from: data.sender_did || "N/A",
              to: data.receiver_did || "N/A",
              amount: data.amount ? data.amount.toString() : "N/A",
              status: "confirmed",
              blockNumber: tokenData?.TTBlockNumberKey ?? "N/A",
              ftName,
              ftCreatorDid,
            };
          })
        : [];

    // Parse committed tokens
    const rawCommitted = data.committed_tokens || data.commited_tokens || [];
    const formattedCommitted = Array.isArray(rawCommitted)
      ? rawCommitted.map((ct: any, index: number) => ({
          id: `committed-${index}`,
          tokenId: ct.token_id || ct.tokenId || ct.TokenID || "N/A",
          role: ct.role || ct.Role || ct.token_role || "N/A",
          ownerDid: ct.owner_did || ct.ownerDid || ct.OwnerDID || "N/A",
        }))
      : typeof rawCommitted === "object"
      ? Object.entries(rawCommitted).map(([tokenId, info]: [string, any], index) => ({
          id: `committed-${index}`,
          tokenId,
          role: info?.role || info?.Role || info?.token_role || "N/A",
          ownerDid: info?.owner_did || info?.ownerDid || info?.OwnerDID || "N/A",
        }))
      : [];

    setTxData(formattedTxData);
    setTokenTransfers(formattedTokenTransfers);
    setCommittedTokens(formattedCommitted);

    // Auto-select first non-empty asset tab
    const allTabs = ["rbt", "ft", "nft", "sc"] as const;
    const firstNonEmpty = allTabs.find((tab) => {
      const getCategory = (tokenId: string, type: any): string => {
        const typeStr = String(type || "").toLowerCase();
        if (typeStr === "ft" || typeStr === "3") return "ft";
        if (typeStr === "nft" || typeStr === "4") return "nft";
        if (typeStr === "sc" || typeStr === "5") return "sc";
        if (tokenId.includes("_")) return "ft";
        if (tokenId.startsWith("qem")) return "sc";
        return "rbt";
      };
      const count = tokenIds.filter((id: string) => {
        const tokenData = data.tokens?.[id];
        return getCategory(id, tokenData?.TTTokenTypeKey) === tab;
      }).length;
      return count > 0;
    });
    if (firstNonEmpty) setActiveAssetTab(firstNonEmpty);

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
                {formatAddress(txData.id)}
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
                {formatAddress(txData.id)}
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
          <button
            onClick={() => setActiveTab("committed")}
            className={`relative flex items-center space-x-1.5 sm:space-x-2 px-1 py-3 sm:py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === "committed"
                ? "text-primary-600 dark:text-primary-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Lock className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Committed Tokens</span>
              <span className="sm:hidden">Committed</span>
            </span>
            {activeTab === "committed" && (
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
                        {formatAddress(txData.id)}
                      </p>
                    </Tooltip>
                    <CopyButton text={txData.id} size="sm" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Status:</p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    txData.status === "success"
                      ? "bg-tertiary-100 text-tertiary-700 dark:bg-tertiary-900/30 dark:text-tertiary-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {txData.status === "success"
                      ? <CheckCircle className="w-3 h-3" />
                      : <XCircle className="w-3 h-3" />}
                    {txData.status === "success" ? "Success" : "Failed"}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Amount:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {txData.value}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Timestamp:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {txData.timestamp}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Initiator:</p>
                  <div className="flex items-center space-x-2">
                    <Tooltip content={txData.to} position="top">
                      <p
                        className="font-mono text-primary-600 dark:text-primary-400 cursor-pointer"
                        onClick={() => navigate(`/did-explorer?did=${txData.to}`)}
                      >
                        {formatAddress(txData.to)}
                      </p>
                    </Tooltip>
                    <CopyButton text={txData.to} size="sm" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Owner:</p>
                  <div className="flex items-center space-x-2">
                    <Tooltip content={txData.from} position="top">
                      <p
                        className="font-mono text-primary-600 dark:text-primary-400 cursor-pointer"
                        onClick={() => navigate(`/did-explorer?did=${txData.from}`)}
                      >
                        {formatAddress(txData.from)}
                      </p>
                    </Tooltip>
                    <CopyButton text={txData.from} size="sm" />
                  </div>
                </div>
              </div>
            </div>
          )}
{activeTab === "validators" && (
  <div className="space-y-3">
    {txData.validators && txData.validators.length > 0 ? (
      txData.validators.map((validator: any, index: number) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
        >
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <span className="text-primary-600 dark:text-primary-400 text-xs sm:text-sm font-bold">
                {index + 1}
              </span>
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap hidden sm:inline">
                Validator DID:
              </p>
              <Tooltip content={validator.did} position="top">
                <p
                  className="font-mono text-xs sm:text-sm text-primary-600 dark:text-primary-400 truncate flex-1 cursor-pointer"
                  onClick={() => navigate(`/did-explorer?did=${validator.did}`)}
                >
                  {formatAddress(validator.did)}
                </p>
              </Tooltip>
              <div className="flex-shrink-0">
                <CopyButton text={validator.did} size="sm" />
              </div>
            </div>
          </div>
        </motion.div>
      ))
    ) : (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        No validators found for this transaction.
      </p>
    )}
  </div>
)}
{activeTab === "committed" && (
  committedTokens.length === 0 ? (
    <p className="text-sm text-gray-600 dark:text-gray-400">
      No committed tokens in this transaction.
    </p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
            <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Token ID</th>
            <th className="text-left py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owner DID</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {committedTokens.map((ct: any, index: number) => (
            <motion.tr
              key={ct.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="py-3 pr-4">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 whitespace-nowrap">
                  {ct.role}
                </span>
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-1.5">
                  <Tooltip content={ct.tokenId} position="top">
                    <span
                      className="font-mono text-xs text-primary-600 dark:text-primary-400 cursor-pointer"
                      onClick={() => navigate(`/token-explorer?token=${encodeURIComponent(ct.tokenId)}`)}
                    >
                      {formatAddress(ct.tokenId)}
                    </span>
                  </Tooltip>
                  <CopyButton text={ct.tokenId} size="sm" />
                </div>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-1.5">
                  <Tooltip content={ct.ownerDid} position="top">
                    <span
                      className="font-mono text-xs text-primary-600 dark:text-primary-400 cursor-pointer"
                      onClick={() => navigate(`/did-explorer?did=${encodeURIComponent(ct.ownerDid)}`)}
                    >
                      {formatAddress(ct.ownerDid)}
                    </span>
                  </Tooltip>
                  <CopyButton text={ct.ownerDid} size="sm" />
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
)}
        </motion.div>
      </Card>

      {/* Assets Section - Tabbed by type */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center space-x-2 mb-4 sm:mb-6">
          <DollarSign className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-lg sm:text-xl font-bold text-heading dark:text-white">
            Assets
          </h2>
        </div>

        {/* Asset Type Tabs - non-empty first, empty after */}
        {(() => {
          const allTabs = ["rbt", "ft", "nft", "sc"] as const;
          const labels: Record<string, string> = { rbt: "RBTs", ft: "FTs", nft: "NFTs", sc: "SC" };
          const counts = Object.fromEntries(
            allTabs.map((tab) => [tab, tokenTransfers.filter((t) => t.category === tab).length])
          );
          const sortedTabs = [
            ...allTabs.filter((tab) => counts[tab] > 0),
            ...allTabs.filter((tab) => counts[tab] === 0),
          ];
          return (
            <div className="flex space-x-1 sm:space-x-2 border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6 overflow-x-auto">
              {sortedTabs.map((tab) => {
                const count = counts[tab];
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveAssetTab(tab)}
                    className={`relative flex items-center space-x-1.5 px-3 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeAssetTab === tab
                        ? "text-primary-600 dark:text-primary-400"
                        : count === 0
                        ? "text-gray-400 dark:text-gray-600"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <span>{labels[tab]}</span>
                    {count > 0 && (
                      <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                        activeAssetTab === tab
                          ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}>
                        {count}
                      </span>
                    )}
                    {activeAssetTab === tab && (
                      <motion.div
                        layoutId="activeAssetTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* Asset List */}
        <motion.div
          key={activeAssetTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {(() => {
            const filtered = tokenTransfers.filter((t) => t.category === activeAssetTab);
            if (filtered.length === 0) {
              return (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
                  No {activeAssetTab.toUpperCase()} assets in this transaction.
                </p>
              );
            }

            // RBT tab: show RBT ID and Value
            if (activeAssetTab === "rbt") {
              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">RBT ID</th>
                        <th className="text-left py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filtered.map((transfer: any, index: number) => (
                        <motion.tr
                          key={transfer.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-1.5">
                              <Tooltip content={transfer.tokenId} position="top">
                                <span
                                  className="font-mono text-xs text-primary-600 dark:text-primary-400 cursor-pointer"
                                  onClick={() => navigate(`/token-explorer?token=${encodeURIComponent(transfer.tokenId)}`)}
                                >
                                  {formatAddress(transfer.tokenId)}
                                </span>
                              </Tooltip>
                              <CopyButton text={transfer.tokenId} size="sm" />
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="font-medium text-gray-900 dark:text-white text-xs">
                              1 RBT
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }

            // FT tab: show FT Name, Creator DID, Amount
            if (activeAssetTab === "ft") {
              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">FT Name</th>
                        <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Creator</th>
                        <th className="text-left py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filtered.map((transfer: any, index: number) => (
                        <motion.tr
                          key={transfer.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="py-3 pr-4">
                            <span
                              className="font-medium text-primary-600 dark:text-primary-400 cursor-pointer hover:underline text-xs"
                              onClick={() => navigate(`/token-explorer?token=${encodeURIComponent(transfer.tokenId)}`)}
                            >
                              {transfer.ftName}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-1.5">
                              <Tooltip content={transfer.ftCreatorDid} position="top">
                                <span
                                  className="font-mono text-xs text-primary-600 dark:text-primary-400 cursor-pointer"
                                  onClick={() => navigate(`/did-explorer?did=${encodeURIComponent(transfer.ftCreatorDid)}`)}
                                >
                                  {formatAddress(transfer.ftCreatorDid)}
                                </span>
                              </Tooltip>
                              <CopyButton text={transfer.ftCreatorDid} size="sm" />
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="font-medium text-gray-900 dark:text-white text-xs">
                              {transfer.amount}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }

            // NFT / SC tab: generic token ID list
            return (
              <div className="space-y-3">
                {filtered.map((transfer: any, index: number) => (
                  <motion.div
                    key={transfer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() =>
                      activeAssetTab === "sc"
                        ? navigate(`/sc-transaction-explorer?tx=${encodeURIComponent(transfer.tokenId)}`)
                        : navigate(`/token-explorer?token=${encodeURIComponent(transfer.tokenId)}`)
                    }
                    className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Tooltip content={transfer.tokenId} position="top">
                        <span className="text-sm font-medium font-mono text-gray-900 dark:text-white cursor-pointer truncate">
                          {formatAddress(transfer.tokenId)}
                        </span>
                      </Tooltip>
                      <div className="flex-shrink-0">
                        <CopyButton text={transfer.tokenId} size="sm" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            );
          })()}
        </motion.div>
      </Card>
    </motion.div>
  );
};
