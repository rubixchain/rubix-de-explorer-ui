import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { CopyButton } from "@/components/ui/CopyButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { ArrowLeft, Coins, ArrowRightLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDIDInfo, useFTHoldings } from "@/hooks/useDIDs";
import { useTransactionsByDID } from "@/hooks/useTransactions";

/* -----------------------------------------
   Hook: Detect Mobile Screen
------------------------------------------ */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)"); // Tailwind sm
    const listener = () => setIsMobile(media.matches);

    listener(); // initial
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return isMobile;
};

export const DIDExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const did = searchParams.get("did") || "";

  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState<"ftholdings" | "transactions">(
    "ftholdings"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: didData, error: didError } =
    useDIDInfo(did, currentPage, itemsPerPage) as any;

  const { data: ftData, isLoading: isLoadingFT, error: ftError } =
    useFTHoldings(did, currentPage, itemsPerPage, activeTab === "ftholdings") as any;

const { data: txnData, isLoading: isLoadingTxn } =
    useTransactionsByDID(did, { page: currentPage, limit: itemsPerPage }) as any;

  const relativeTime = (epoch: number): string => {
    const diffSec = Math.floor(Date.now() / 1000) - epoch;
    if (diffSec < 60) return "just now";
    if (diffSec < 3600) { const m = Math.floor(diffSec / 60); return `${m} ${m === 1 ? "minute" : "minutes"} ago`; }
    if (diffSec < 86400) { const h = Math.floor(diffSec / 3600); return `${h} ${h === 1 ? "hour" : "hours"} ago`; }
    if (diffSec < 2592000) { const d = Math.floor(diffSec / 86400); return `${d} ${d === 1 ? "day" : "days"} ago`; }
    if (diffSec < 31536000) { const mo = Math.floor(diffSec / 2592000); return `${mo} ${mo === 1 ? "month" : "months"} ago`; }
    const y = Math.floor(diffSec / 31536000); return `${y} ${y === 1 ? "year" : "years"} ago`;
  };

  // Normalize new /api/get-txns-by-did response → shape expected by the UI
  const rawTxns: any[] = Array.isArray(txnData) ? txnData : (txnData?.data ?? []);
  const transactions = rawTxns.map((tx: any) => {
    const count = [
      ...(tx.tokens?.rbt ?? []),
      ...(tx.tokens?.ft ?? []),
      ...(tx.tokens?.nft ?? []),
      ...(tx.tokens?.smartContract ?? []),
    ].length;
    return {
      id: tx.transaction_id,
      from: tx.initiator,
      to: tx.owner,
      timestamp: tx.epoch ? relativeTime(tx.epoch) : tx.created_at ?? "—",
      value: `${count} ${count === 1 ? "token" : "tokens"}`,
    };
  });

  const loading = activeTab === "ftholdings" ? isLoadingFT : false;

  /* -----------------------------------------
     Helper: Responsive Address Formatter
  ------------------------------------------ */
  const formatAddress = (
    address: string,
    desktopLength = 30,
    mobileLength = 6
  ): string => {
    if (!address || address === "N/A") return address;

    const length = isMobile ? mobileLength : desktopLength;
    if (address.length <= length * 2) return address;

    return `${address.slice(0, length)}...${address.slice(-length)}`;
  };

  /* -----------------------------------------
     Loading State
  ------------------------------------------ */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" />
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  /* -----------------------------------------
     Error State
  ------------------------------------------ */
  if (didError || !didData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading DID</h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const totalPages =
    activeTab === "ftholdings"
      ? Math.ceil((didData?.ft?.length || 0) / itemsPerPage)
      : Math.ceil((rawTxns.length === itemsPerPage ? currentPage * itemsPerPage + 1 : rawTxns.length + (currentPage - 1) * itemsPerPage) / itemsPerPage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4 sm:p-6"
    >
      {/* Header */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>

      {/* DID Info */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">DID Explorer</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Tooltip content={didData.did.did}>
            <span className="font-mono text-primary-600 truncate max-w-[70vw]">
              {formatAddress(didData.did.did, 50, 8)}
            </span>
          </Tooltip>
          <CopyButton text={didData.did.did} size="sm" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          ["RBT Balance", didData.did.total_rbts],
          ["FT Balance",  didData.did.total_fts],
          ["NFTs",        didData.did.total_nfts],
          ["SC Deployed",   didData.did.total_scs],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className="text-xl font-bold text-heading dark:text-white">{value ?? 0}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Card className="p-4">
        {/* Tab Nav */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
          {([
            { key: "ftholdings",   label: "FT Holdings",    icon: <Coins className="w-4 h-4" /> },
            { key: "transactions", label: "Transactions",   icon: <ArrowRightLeft className="w-4 h-4" /> },
          ] as const).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setCurrentPage(1); }}
              className={`relative flex items-center gap-1.5 pb-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === key
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {icon}
              {label}
              {activeTab === key && (
                <motion.div
                  layoutId="didActiveTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* FT Holdings tab */}
        {activeTab === "ftholdings" && (
          <>
            {(!didData.ft || didData.ft.length === 0) ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No FT holdings found.</p>
            ) : (
              <div className="space-y-2">
                {didData.ft.map((entry: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 flex-shrink-0">FT</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{entry.token_name || "—"}</span>
                      {entry.creator_did && (
                        <Tooltip content={entry.creator_did}>
                          <span
                            className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate cursor-pointer hover:text-primary-600 hidden sm:block"
                            onClick={() => navigate(`/did-explorer?did=${entry.creator_did}`)}
                          >
                            {formatAddress(entry.creator_did, 12, 6)}
                          </span>
                        </Tooltip>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap flex-shrink-0">
                      {entry.balance ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Transactions tab */}
        {activeTab === "transactions" && (
          <>
            {isLoadingTxn ? (
              <div className="text-sm text-secondary-500 dark:text-secondary-400 py-4">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="text-sm text-secondary-500 dark:text-secondary-400 py-4">No transactions found for this DID.</div>
            ) : isMobile ? (
              /* Mobile: vertical cards */
              <div className="space-y-3">
                {transactions.map((tx: any, index: number) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/transaction-explorer?tx=${encodeURIComponent(tx.id)}`)}
                    className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 p-4 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors space-y-2"
                  >
                    <div>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Transaction</p>
                      <div className="flex items-center gap-1.5">
                        <Tooltip content={tx.id} position="top">
                          <span className="text-sm font-medium text-secondary-900 dark:text-white font-mono truncate">{formatAddress(tx.id)}</span>
                        </Tooltip>
                        <CopyButton text={tx.id} size="sm" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Initiator</p>
                      <div className="flex items-center gap-1.5">
                        <Tooltip content={tx.from} position="top">
                          <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate">{formatAddress(tx.from)}</span>
                        </Tooltip>
                        <CopyButton text={tx.from} size="sm" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Owner</p>
                      <div className="flex items-center gap-1.5">
                        <Tooltip content={tx.to} position="top">
                          <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate">{formatAddress(tx.to)}</span>
                        </Tooltip>
                        <CopyButton text={tx.to} size="sm" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200 whitespace-nowrap">
                        {tx.timestamp}
                      </span>
                      <span className="text-sm font-semibold text-secondary-900 dark:text-white whitespace-nowrap">{tx.value}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Desktop: table */
              <div className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 overflow-hidden">
                <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
                  <div className="flex px-4 md:px-6 py-3 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider gap-3 md:gap-4">
                    <div className="flex-1 min-w-0">Transaction</div>
                    <div className="flex-1 min-w-0">Initiator</div>
                    <div className="flex-1 min-w-0">Owner</div>
                    <div className="w-32 flex-shrink-0">Time</div>
                    <div className="w-24 flex-shrink-0 text-right">Amount</div>
                  </div>
                </div>
                <div className="divide-y divide-outline-200 dark:divide-outline-700">
                  {transactions.map((tx: any, index: number) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/transaction-explorer?tx=${encodeURIComponent(tx.id)}`)}
                      className="flex px-4 md:px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer gap-3 md:gap-4"
                    >
                      <div className="flex-1 min-w-0 flex items-center">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Tooltip content={tx.id} position="top">
                            <div className="text-sm font-mono text-secondary-900 dark:text-white truncate">{formatAddress(tx.id, 8, 8)}</div>
                          </Tooltip>
                          <div className="flex-shrink-0"><CopyButton text={tx.id} size="sm" /></div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex items-center">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Tooltip content={tx.from} position="top">
                            <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate">{formatAddress(tx.from, 8, 8)}</span>
                          </Tooltip>
                          <div className="flex-shrink-0"><CopyButton text={tx.from} size="sm" /></div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex items-center">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Tooltip content={tx.to} position="top">
                            <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate">{formatAddress(tx.to, 8, 8)}</span>
                          </Tooltip>
                          <div className="flex-shrink-0"><CopyButton text={tx.to} size="sm" /></div>
                        </div>
                      </div>
                      <div className="w-32 flex-shrink-0 flex items-center">
                        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200">
                          {tx.timestamp}
                        </span>
                      </div>
                      <div className="w-24 flex-shrink-0 flex items-center justify-end">
                        <div className="text-sm font-semibold text-secondary-900 dark:text-white whitespace-nowrap">{tx.value}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={rawTxns.length + (currentPage - 1) * itemsPerPage}
              itemsPerPage={itemsPerPage}
              className="mt-6"
            />
          </>
        )}
      </Card>
    </motion.div>
  );
};
