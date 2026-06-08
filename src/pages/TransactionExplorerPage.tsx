import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { Pagination } from "@/components/ui/Pagination";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Hash,
  DollarSign,
  Lock,
  Users,
  ChevronDown,
  ChevronRight,
  Map,
} from "lucide-react";
import { useApp } from '@/contexts/AppContext';
import { useSearch } from '@/hooks/useSearch';
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTransaction } from "@/hooks/useTransactions";

export const TransactionExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const txId = searchParams.get("tx") || "";

  // Use React Query hook - same pattern as HomePage
  const { data: rawData, isLoading, error: queryError } = useTransaction(txId);

  const { setSearchQuery } = useApp();
  const { search } = useSearch();

  const [txData, setTxData] = useState<any>(null);
  const [tokenTransfers, setTokenTransfers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"details" | "committed" | "quorums">(
    "details"
  );
  const [activeAssetTab, setActiveAssetTab] = useState<"rbt" | "ft" | "nft" | "sc" | null>(null);
  const [assetPage, setAssetPage] = useState(1);
  const ASSET_PAGE_SIZE = 10;
  const [committedTokens, setCommittedTokens] = useState<any[]>([]);
  const [quorums, setQuorums] = useState<any[]>([]);
  const [expandedQuorums, setExpandedQuorums] = useState<Set<number>>(new Set());
  const [quorumTokenPages, setQuorumTokenPages] = useState<Record<number, number>>({});
  const QUORUM_TOKEN_PAGE_SIZE = 10;
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
  address: any,
  desktopLength = 50,
  mobileLength = 8
): string => {
  const addr = typeof address === "string" ? address : String(address ?? "");
  if (!addr || addr === "N/A") return addr;

  const length = isMobile ? mobileLength : desktopLength;
  if (addr.length <= length * 2) return addr;

  return `${addr.slice(0, length)}...${addr.slice(-length)}`;
};

  // Transform data when rawData changes - same pattern as HomePage
  useEffect(() => {
    if (!rawData) return;

    
    const data : any  = rawData;
    // New API: tokens = { "rbt": ["id1","id2"], "ft": ["id3"] }  (values are arrays)
    // Old API: tokens = { "tokenId": { TTTokenTypeKey, TTBlockNumberKey, ... } } (values are objects)
    // Build a flat list of { tokenId, category } from whichever shape we get
    interface TokenEntry { tokenId: string; category: string; tokenData: any }
    const tokenEntries: TokenEntry[] = [];

    if (data.tokens && typeof data.tokens === "object" && !Array.isArray(data.tokens)) {
      for (const [key, value] of Object.entries(data.tokens as Record<string, any>)) {
        console.log("Processing token entry:", { key, value });
        if (value === null || value === undefined) continue; // skip null/empty token categories
        if (Array.isArray(value)) {
          // New format: key is the category, value is array of token objects or strings
          const keyLower = key.toLowerCase();
          const cat = keyLower === "smartcontract" ? "sc" : keyLower;
          for (const id of value) {
            if (id == null) continue;
            const tokenId = typeof id === "string" ? id : (id.tokenId || id.token_id || String(id));
            const tokenData = typeof id === "object" ? id : null;
            tokenEntries.push({ tokenId, category: cat, tokenData });
            console.log("Added token entry:", { tokenId, category: cat, tokenData });
          }
        } else {
          // Old format: key is the token ID, value is token metadata object
          tokenEntries.push({ tokenId: String(key), category: "", tokenData: value });
        }
      }
    } else if (Array.isArray(data.tokens)) {
      // Fallback: plain string array
      for (const id of data.tokens) {
        if (id != null) tokenEntries.push({ tokenId: String(id), category: "", tokenData: null });
      }
    }


    const s = data.status;
    const status =
      s === false || s === 0 || s === "false" || s === "failed" || s === "0"
        ? "failed"
        : "success";
      console.log("Raw data:", tokenEntries, data);
    const formattedTxData = {
      id: data.transaction_id || data.txn_id || "N/A",
      status,
      value: data.amount ? `${data.amount} RBT` : "N/A",
      timestamp: data.epoch
        ? new Date(data.epoch * 1000).toUTCString()
        : "N/A",
      blockId: data.transaction_id || data.block_hash || "N/A",
      from: data.initiator || data.sender_did || "N/A",
      to: data.owner || data.receiver_did || tokenEntries[0]?.tokenId || "N/A",
      toIsDID: !!(data.owner || data.receiver_did),
      tokens: tokenEntries.map(({ tokenId, tokenData }) => ({
        tokenId,
        type: tokenData?.TTTokenTypeKey,
        blockNumber: tokenData?.TTBlockNumberKey,
        previousBlockId: tokenData?.TTPreviousBlockIDKey,
      })),
      validators: (() => {
        const raw = data.quorums || data.validator_pledge_map;
        if (!raw) return [];
        const items: any[] = Array.isArray(raw) ? raw : Object.keys(raw);
        return items.map((q: any) => ({
          did: typeof q === "string" ? q : (q?.did || q?.DID || String(q)),
        }));
      })(),
    };

    // Determine category for a token based on type value and tokenId pattern
    const getTokenCategory = (tokenId: any, type: any): "rbt" | "ft" | "nft" | "sc" => {
      const id = String(tokenId || "");
      const typeStr = String(type || "").toLowerCase();
      if (typeStr === "ft" || typeStr === "3") return "ft";
      if (typeStr === "nft" || typeStr === "4") return "nft";
      if (typeStr === "sc" || typeStr === "5") return "sc";
      // Fall back to pattern matching on tokenId
      if (id.includes("_")) return "ft";
      if (id.startsWith("qem")) return "sc";
      return "rbt";
    };

    // Map token IDs to tokenTransfers structure with category
    const formattedTokenTransfers =
      tokenEntries.length > 0
        ? tokenEntries.map(({ tokenId: rawTokenId, category: rawCategory, tokenData }, index: number) => {
            const tokenId = String(rawTokenId || "");
            // Use pre-resolved category from the object key, fall back to pattern matching
            const category = rawCategory || getTokenCategory(tokenId, tokenData?.TTTokenTypeKey);
            // FT token format: {name}_{creatorDID}_{number}
            // ftName = {name}_{number}, ftCreatorDid = creatorDID (bafy... segment)
            const ftParts = tokenId.split('_');
            const didIdx = ftParts.findIndex((p: string) => p.startsWith('bafy'));
            const ftCreatorDid = didIdx !== -1 ? ftParts[didIdx] : '';
            const namePart = didIdx !== -1 ? ftParts.slice(0, didIdx).join('_') : tokenId;
            const numberPart = didIdx !== -1 ? ftParts.slice(didIdx + 1).join('_') : '';
            const ftName = numberPart ? `${namePart}_${numberPart}` : namePart;
            console.log("return token transfer entry:", { tokenId, category, ftName, ftCreatorDid, tokenData });
            const scFunction = tokenData?.function || tokenData?.method || tokenData?.contract_function || tokenData?.functionName || null;
            const scParams = tokenData?.params || tokenData?.parameters || tokenData?.contract_params || tokenData?.args || null;
            return {
              id: `transfer-${index + 1}`,
              tokenId,
              category,
              from: data.initiator || data.sender_did || "N/A",
              to: data.owner || data.receiver_did || "N/A",
              amount: data.amount ? data.amount.toString() : "N/A",
              tokenValue: tokenData?.tokenValue ?? tokenData?.token_value ?? null,
              status: "confirmed",
              blockNumber: tokenData?.TTBlockNumberKey ?? tokenData?.previousTransactionID ?? "N/A",
              previousTransactionID: tokenData?.previousTransactionID || null,
              ftName,
              ftCreatorDid,
              scFunction,
              scParams,
            };
          })
        : [];

    // Parse committed tokens
    const rawCommitted = data.committedTokens || data.committed_tokens || data.commited_tokens || [];
    const formattedCommitted = Array.isArray(rawCommitted)
      ? rawCommitted.map((ct: any, index: number) => ({
          id: `committed-${index}`,
          tokenId: ct.token_id || ct.tokenId || ct.TokenID || "N/A",
          tokenValue: ct.tokenValue ?? ct.token_value ?? null,
          role: ct.role || ct.Role || ct.token_role || "N/A",
          ownerDid: ct.owner_did || ct.ownerDid || ct.OwnerDID || "N/A",
        }))
      : typeof rawCommitted === "object"
      ? Object.entries(rawCommitted).map(([tokenId, info]: [string, any], index) => ({
          id: `committed-${index}`,
          tokenId,
          tokenValue: (info as any)?.tokenValue ?? (info as any)?.token_value ?? null,
          role: info?.role || info?.Role || info?.token_role || "N/A",
          ownerDid: info?.owner_did || info?.ownerDid || info?.OwnerDID || "N/A",
        }))
      : [];

    // Parse quorums
    const rawQuorums = data.quorums || [];
    const formattedQuorums = Array.isArray(rawQuorums)
      ? rawQuorums.map((q: any) => ({
          did: q.did || q.DID || "N/A",
          tokens: Array.isArray(q.tokens) ? q.tokens.map((t: any) => t.tokenId || t.token_id || String(t)) : [],
        }))
      : [];

    setTxData(formattedTxData);
    setTokenTransfers(formattedTokenTransfers);
    setCommittedTokens(formattedCommitted);
    setQuorums(formattedQuorums);

    // Auto-select the asset tab with the most tokens (using already-resolved categories)
    const allTabs = ["rbt", "ft", "nft", "sc"] as const;
    const tabCounts = Object.fromEntries(
      allTabs.map((tab) => [tab, formattedTokenTransfers.filter((t) => t.category === tab).length])
    ) as Record<string, number>;
    const dominant = allTabs.reduce((a, b) => (tabCounts[b] > tabCounts[a] ? b : a));
    setActiveAssetTab(tabCounts[dominant] > 0 ? dominant : "rbt");

  }, [rawData]);

  // Reset to page 1 whenever the active asset tab changes
  useEffect(() => {
    setAssetPage(1);
  }, [activeAssetTab]);

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
          <div className="flex items-center space-x-2 min-w-0">
            <span className="font-mono text-primary-600 dark:text-primary-400">
              {formatAddress(txData.id)}
            </span>
            <CopyButton text={txData.id} size="sm" />
            <button
              onClick={() => {
                // route to DAG and set the global search so DAG selects this txn
                setSearchQuery(txData.id);
                search(txData.id, 'transaction');
                navigate('/dag');
              }}
              title="View on GRAPH"
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-yellow-400 text-white border hover:bg-yellow-500 hover:border-yellow-600 transition-colors whitespace-nowrap"
            >
             Graph
            </button>
          </div>
        </div>
        {/* Desktop Layout: Same row */}
        <div className="hidden sm:flex items-center space-x-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          <span>Details for Transaction:</span>
          <div className="flex items-center space-x-2 min-w-0">
            <span className="font-mono text-primary-600 dark:text-primary-400 break-all">
              {txData.id}
            </span>
            <CopyButton text={txData.id} size="sm" />
            <button
              onClick={() => {
                setSearchQuery(txData.id);
                search(txData.id, 'transaction');
                navigate('/dag');
              }}
              title="View on GRAPH"
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-yellow-400 text-white border hover:bg-yellow-500 hover:border-yellow-600 transition-colors whitespace-nowrap"
            >
              View the GRAPH
            </button>
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
          <button
            onClick={() => setActiveTab("quorums")}
            className={`relative flex items-center space-x-1.5 sm:space-x-2 px-1 py-3 sm:py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === "quorums"
                ? "text-primary-600 dark:text-primary-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Quorums</span>
            {activeTab === "quorums" && (
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
                  <p className="text-gray-500 dark:text-gray-400">From:</p>
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-mono text-primary-600 dark:text-primary-400 cursor-pointer hover:text-primary-700 dark:hover:text-primary-300 ${isMobile ? "" : "break-all"}`}
                      onClick={() => navigate(`/did-explorer?did=${txData.from}`)}
                    >
                      {isMobile ? formatAddress(txData.from) : txData.from}
                    </p>
                    <div className="flex-shrink-0"><CopyButton text={txData.from} size="sm" /></div>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">To:</p>
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-mono text-primary-600 dark:text-primary-400 cursor-pointer hover:text-primary-700 dark:hover:text-primary-300 ${isMobile ? "" : "break-all"}`}
                      onClick={() => txData.toIsDID
                        ? navigate(`/did-explorer?did=${txData.to}`)
                        : navigate(`/token-explorer?token=${encodeURIComponent(txData.to)}`)
                      }
                    >
                      {isMobile ? (txData.toIsDID ? formatAddress(txData.to) : txData.to) : txData.to}
                    </p>
                    <div className="flex-shrink-0"><CopyButton text={txData.to} size="sm" /></div>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-gray-500 dark:text-gray-400">Timestamp:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {txData.timestamp}
                  </p>
                </div>
              </div>
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
            {/* <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th> */}
            <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Token ID</th>
            <th className="text-left py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
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
              {/* <td className="py-3 pr-4">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 whitespace-nowrap">
                  {ct.role}
                </span>
              </td> */}
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
                <span className="font-medium text-gray-900 dark:text-white text-xs">
                  {ct.tokenValue != null ? `${ct.tokenValue} RBT` : "—"}
                </span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
)}
        {activeTab === "quorums" && (
          quorums.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No quorums in this transaction.
            </p>
          ) : (
            <div className="space-y-2">
              {quorums.map((q: any, index: number) => {
                const isExpanded = expandedQuorums.has(index);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    {/* Quorum row */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <Tooltip content={q.did} position="top">
                          <span
                            className="font-mono text-sm text-primary-600 dark:text-primary-400 cursor-pointer hover:underline truncate"
                            onClick={() => navigate(`/did-explorer?did=${q.did}`)}
                          >
                            {formatAddress(q.did, 20, 8)}
                          </span>
                        </Tooltip>
                        <CopyButton text={q.did} size="sm" />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                        {q.tokens.length} token{q.tokens.length !== 1 ? "s" : ""} staked
                      </span>
                      <button
                        onClick={() => {
                          setExpandedQuorums((prev) => {
                            const next = new Set(prev);
                            if (next.has(index)) {
                              next.delete(index);
                              setQuorumTokenPages(p => { const n = { ...p }; delete n[index]; return n; });
                            } else {
                              next.add(index);
                            }
                            return next;
                          });
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
                      >
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        <span>Staked Tokens</span>
                      </button>
                    </div>
                    {/* Expanded token list */}
                    {isExpanded && (() => {
                      const qPage = quorumTokenPages[index] ?? 1;
                      const qTotalPages = Math.ceil(q.tokens.length / QUORUM_TOKEN_PAGE_SIZE);
                      const qPagedTokens = q.tokens.slice((qPage - 1) * QUORUM_TOKEN_PAGE_SIZE, qPage * QUORUM_TOKEN_PAGE_SIZE);
                      return (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {qPagedTokens.map((tokenId: string, tIdx: number) => (
                              <div key={tIdx} className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-900">
                                <span className="w-5 text-xs text-gray-400 dark:text-gray-500 font-mono">{(qPage - 1) * QUORUM_TOKEN_PAGE_SIZE + tIdx + 1}.</span>
                                <Tooltip content={tokenId} position="top">
                                  <span
                                    className="font-mono text-xs text-primary-600 dark:text-primary-400 cursor-pointer hover:underline"
                                    onClick={() => navigate(`/token-explorer?token=${encodeURIComponent(tokenId)}`)}
                                  >
                                    {tokenId}
                                  </span>
                                </Tooltip>
                                <CopyButton text={tokenId} size="sm" />
                              </div>
                            ))}
                          </div>
                          <div className="px-6 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                            <Pagination
                              currentPage={qPage}
                              totalPages={qTotalPages}
                              onPageChange={(p) => setQuorumTokenPages(prev => ({ ...prev, [index]: p }))}
                              totalItems={q.tokens.length}
                              itemsPerPage={QUORUM_TOKEN_PAGE_SIZE}
                            />
                          </div>
                        </motion.div>
                      );
                    })()}
                  </motion.div>
                );
              })}
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
          const sortedTabs = [...allTabs].sort((a, b) => counts[b] - counts[a]);
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
            const totalPages = Math.ceil(filtered.length / ASSET_PAGE_SIZE);
            const paginated = filtered.slice((assetPage - 1) * ASSET_PAGE_SIZE, assetPage * ASSET_PAGE_SIZE);
            const paginationBar = (
              <Pagination
                currentPage={assetPage}
                totalPages={totalPages}
                onPageChange={setAssetPage}
                totalItems={filtered.length}
                itemsPerPage={ASSET_PAGE_SIZE}
                className="mt-4"
              />
            );

            if (filtered.length === 0) {
              return (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
                  No {activeAssetTab?.toUpperCase()} assets in this transaction.
                </p>
              );
            }

            // RBT tab
            if (activeAssetTab === "rbt") {
              if (isMobile) {
                return (
                  <>
                    <div className="space-y-3">
                      {paginated.map((transfer: any, index: number) => (
                        <motion.div
                          key={transfer.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                          onClick={() => navigate(`/rbt-explorer?token=${encodeURIComponent(transfer.tokenId)}`)}
                          className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 p-4 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors space-y-2"
                        >
                          <div>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">RBT ID</p>
                            <div className="flex items-center gap-1.5">
                              <Tooltip content={transfer.tokenId} position="top">
                                <span className="text-sm font-mono text-secondary-900 dark:text-white truncate">{formatAddress(transfer.tokenId)}</span>
                              </Tooltip>
                              <CopyButton text={transfer.tokenId} size="sm" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Value</p>
                            <span className="text-sm font-semibold text-secondary-900 dark:text-white">
                              {transfer.tokenValue != null ? `${transfer.tokenValue} RBT` : "—"}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Prev Txn</p>
                            {transfer.previousTransactionID ? (
                              <div className="flex items-center gap-1.5">
                                <Tooltip content={transfer.previousTransactionID} position="top">
                                  <span
                                    className="text-sm font-mono text-primary-600 dark:text-primary-400 truncate cursor-pointer hover:underline"
                                    onClick={(e) => { e.stopPropagation(); navigate(`/transaction-explorer?tx=${encodeURIComponent(transfer.previousTransactionID)}`); }}
                                  >
                                    {formatAddress(transfer.previousTransactionID)}
                                  </span>
                                </Tooltip>
                                <CopyButton text={transfer.previousTransactionID} size="sm" />
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-gray-600">—</span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    {paginationBar}
                  </>
                );
              }
              return (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-full">RBT ID</th>
                          <th className="text-right py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Value</th>
                          <th className="text-left py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Prev Txn</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {paginated.map((transfer: any, index: number) => (
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
                                    className="font-mono text-xs text-gray-900 dark:text-white cursor-pointer hover:underline"
                                    onClick={() => navigate(`/rbt-explorer?token=${encodeURIComponent(transfer.tokenId)}`)}
                                  >
                                    {formatAddress(transfer.tokenId)}
                                  </span>
                                </Tooltip>
                                <CopyButton text={transfer.tokenId} size="sm" />
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-right whitespace-nowrap">
                              <span className="font-medium text-gray-900 dark:text-white text-xs">
                                {transfer.tokenValue != null ? `${transfer.tokenValue} RBT` : "—"}
                              </span>
                            </td>
                            <td className="py-3 text-right whitespace-nowrap">
                              {transfer.previousTransactionID ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <Tooltip content={transfer.previousTransactionID} position="top">
                                    <span
                                      className="font-mono text-xs text-primary-600 dark:text-primary-400 cursor-pointer hover:underline"
                                      onClick={() => navigate(`/transaction-explorer?tx=${encodeURIComponent(transfer.previousTransactionID)}`)}
                                    >
                                      {formatAddress(transfer.previousTransactionID)}
                                    </span>
                                  </Tooltip>
                                  <CopyButton text={transfer.previousTransactionID} size="sm" />
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-600">—</span>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {paginationBar}
                </>
              );
            }

            // FT tab
            if (activeAssetTab === "ft") {
              if (isMobile) {
                return (
                  <>
                    <div className="space-y-3">
                      {paginated.map((transfer: any, index: number) => (
                        <motion.div
                          key={transfer.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                          onClick={() => navigate(`/ft-explorer?token=${encodeURIComponent(transfer.tokenId)}`)}
                          className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 p-4 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors space-y-2"
                        >
                          <div>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">FT ID</p>
                            <span className="text-sm font-medium text-secondary-900 dark:text-white">{transfer.ftName}</span>
                          </div>
                          <div>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Creator</p>
                            <div className="flex items-center gap-1.5">
                              <Tooltip content={transfer.ftCreatorDid} position="top">
                                <span
                                  className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate cursor-pointer hover:text-primary-600"
                                  onClick={(e) => { e.stopPropagation(); navigate(`/did-explorer?did=${encodeURIComponent(transfer.ftCreatorDid)}`); }}
                                >
                                  {formatAddress(transfer.ftCreatorDid)}
                                </span>
                              </Tooltip>
                              <CopyButton text={transfer.ftCreatorDid} size="sm" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Prev Txn</p>
                            {transfer.previousTransactionID ? (
                              <div className="flex items-center gap-1.5">
                                <Tooltip content={transfer.previousTransactionID} position="top">
                                  <span
                                    className="text-sm font-mono text-primary-600 dark:text-primary-400 truncate cursor-pointer hover:underline"
                                    onClick={(e) => { e.stopPropagation(); navigate(`/transaction-explorer?tx=${encodeURIComponent(transfer.previousTransactionID)}`); }}
                                  >
                                    {formatAddress(transfer.previousTransactionID)}
                                  </span>
                                </Tooltip>
                                <CopyButton text={transfer.previousTransactionID} size="sm" />
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-gray-600">—</span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    {paginationBar}
                  </>
                );
              }
              return (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">FT ID</th>
                          <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Creator</th>
                          <th className="text-left py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prev Txn</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {paginated.map((transfer: any, index: number) => (
                          <motion.tr
                            key={transfer.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="py-3 pr-4">
                              <span
                                className="font-medium text-gray-900 dark:text-white cursor-pointer hover:underline text-xs"
                                onClick={() => navigate(`/ft-explorer?token=${encodeURIComponent(transfer.tokenId)}`)}
                              >
                                {transfer.ftName}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-1.5">
                                <Tooltip content={transfer.ftCreatorDid} position="top">
                                  <span
                                    className="font-mono text-xs text-gray-900 dark:text-white cursor-pointer hover:underline"
                                    onClick={() => navigate(`/did-explorer?did=${encodeURIComponent(transfer.ftCreatorDid)}`)}
                                  >
                                    {formatAddress(transfer.ftCreatorDid)}
                                  </span>
                                </Tooltip>
                                <CopyButton text={transfer.ftCreatorDid} size="sm" />
                              </div>
                            </td>
                            <td className="py-3">
                              {transfer.previousTransactionID ? (
                                <div className="flex items-center gap-1.5">
                                  <Tooltip content={transfer.previousTransactionID} position="top">
                                    <span
                                      className="font-mono text-xs text-primary-600 dark:text-primary-400 cursor-pointer hover:underline"
                                      onClick={() => navigate(`/transaction-explorer?tx=${encodeURIComponent(transfer.previousTransactionID)}`)}
                                    >
                                      {formatAddress(transfer.previousTransactionID)}
                                    </span>
                                  </Tooltip>
                                  <CopyButton text={transfer.previousTransactionID} size="sm" />
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-600">—</span>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {paginationBar}
                </>
              );
            }

            // SC tab
            if (activeAssetTab === "sc") {
              if (isMobile) {
                return (
                  <>
                    <div className="space-y-3">
                      {paginated.map((transfer: any, index: number) => (
                        <motion.div
                          key={transfer.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                          onClick={() => navigate(`/sc-token-explorer?token=${encodeURIComponent(transfer.tokenId)}`)}
                          className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 p-4 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors space-y-2"
                        >
                          <div>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Token ID</p>
                            <div className="flex items-center gap-1.5">
                              <Tooltip content={transfer.tokenId} position="top">
                                <span className="text-sm font-mono text-secondary-900 dark:text-white truncate">{formatAddress(transfer.tokenId)}</span>
                              </Tooltip>
                              <CopyButton text={transfer.tokenId} size="sm" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Change</p>
                            {transfer.scFunction ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                                  {transfer.scFunction}()
                                </span>
                                {transfer.scParams && (
                                  <Tooltip content={typeof transfer.scParams === "object" ? JSON.stringify(transfer.scParams) : String(transfer.scParams)} position="top">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all cursor-default">
                                      {typeof transfer.scParams === "object" ? JSON.stringify(transfer.scParams) : String(transfer.scParams)}
                                    </p>
                                  </Tooltip>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-gray-600">—</span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    {paginationBar}
                  </>
                );
              }
              return (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Token ID</th>
                          <th className="text-left py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {paginated.map((transfer: any, index: number) => (
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
                                    className="font-mono text-xs text-gray-900 dark:text-white cursor-pointer hover:underline"
                                    onClick={() => navigate(`/sc-token-explorer?token=${encodeURIComponent(transfer.tokenId)}`)}
                                  >
                                    {formatAddress(transfer.tokenId)}
                                  </span>
                                </Tooltip>
                                <CopyButton text={transfer.tokenId} size="sm" />
                              </div>
                            </td>
                            <td className="py-3">
                              {transfer.scFunction ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                                    {transfer.scFunction}()
                                  </span>
                                  {transfer.scParams && (
                                    <Tooltip content={typeof transfer.scParams === "object" ? JSON.stringify(transfer.scParams) : String(transfer.scParams)} position="top">
                                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate max-w-[240px] cursor-default">
                                        {typeof transfer.scParams === "object" ? JSON.stringify(transfer.scParams) : String(transfer.scParams)}
                                      </p>
                                    </Tooltip>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-600">—</span>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {paginationBar}
                </>
              );
            }

            // NFT tab (fallback)
            if (isMobile) {
              return (
                <>
                  <div className="space-y-3">
                    {paginated.map((transfer: any, index: number) => (
                      <motion.div
                        key={transfer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        onClick={() => navigate(`/nft-explorer?token=${encodeURIComponent(transfer.tokenId)}`)}
                        className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 p-4 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                      >
                        <div>
                          <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Token ID</p>
                          <div className="flex items-center gap-1.5">
                            <Tooltip content={transfer.tokenId} position="top">
                              <span className="text-sm font-mono text-secondary-900 dark:text-white truncate">{formatAddress(transfer.tokenId)}</span>
                            </Tooltip>
                            <CopyButton text={transfer.tokenId} size="sm" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {paginationBar}
                </>
              );
            }
            return (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Token ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {paginated.map((transfer: any, index: number) => (
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
                                  className="font-mono text-xs text-gray-900 dark:text-white cursor-pointer hover:underline"
                                  onClick={() => navigate(`/nft-explorer?token=${encodeURIComponent(transfer.tokenId)}`)}
                                >
                                  {formatAddress(transfer.tokenId)}
                                </span>
                              </Tooltip>
                              <CopyButton text={transfer.tokenId} size="sm" />
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {paginationBar}
              </>
            );
          })()}
        </motion.div>
      </Card>
    </motion.div>
  );
};
