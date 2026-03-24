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

  const [activeTab, setActiveTab] = useState<"holdings" | "ftholdings" | "transactions">(
    "holdings"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: didData, isLoading: isLoadingDID, error: didError } =
    useDIDInfo(did, currentPage, itemsPerPage) as any;

  const { data: ftData, isLoading: isLoadingFT, error: ftError } =
    useFTHoldings(
      did,
      currentPage,
      itemsPerPage,
      activeTab === "ftholdings"
    ) as any;

  const { data: txnData, isLoading: isLoadingTxn } =
    useTransactionsByDID(did, { page: currentPage, limit: itemsPerPage }) as any;

  const loading = activeTab === "holdings" ? isLoadingDID : activeTab === "ftholdings" ? isLoadingFT : false;

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
  if (didError || ftError || !didData) {
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
    activeTab === "holdings"
      ? Math.ceil((didData?.count || 0) / itemsPerPage)
      : activeTab === "ftholdings"
      ? Math.ceil((ftData?.length || 0) / itemsPerPage)
      : Math.ceil((txnData?.data?.count || 0) / itemsPerPage);

  const transactions = txnData?.data?.transactions || [];

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          ["Total RBTs", didData.did.total_rbts],
          ["Total FTs", didData.did.total_fts],
          ["Total NFTs", didData.did.total_nfts],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Card className="p-4">
        {/* Tab Nav */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
          {(["holdings", "ftholdings", "transactions"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              className={`relative flex items-center gap-1.5 pb-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab === "transactions" ? (
                <ArrowRightLeft className="w-4 h-4" />
              ) : (
                <Coins className="w-4 h-4" />
              )}
              {tab === "holdings" ? "Token Holdings" : tab === "ftholdings" ? "FT Holdings" : "Transactions"}
              {activeTab === tab && (
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

        {/* Holdings tab */}
        {activeTab !== "transactions" && (
          <>
            {(activeTab === "holdings" ? didData.rbts : ftData)?.map((item: any) => {
              const id = item.rbt_id || item.ft_id;
              return (
                <div
                  key={id}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 mb-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Tooltip content={id}>
                      <p
                        className="truncate text-sm font-mono cursor-pointer hover:text-primary-600"
                        onClick={() => navigate(`/token-explorer?token=${id}`)}
                      >
                        {formatAddress(id)}
                      </p>
                    </Tooltip>
                    <CopyButton text={id} size="sm" />
                  </div>
                  <p className="font-semibold text-sm whitespace-nowrap">
                    {item.token_value || 0} {item.rbt_id ? "RBT" : "FT"}
                  </p>
                </div>
              );
            })}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={activeTab === "holdings" ? didData?.count || 0 : ftData?.length || 0}
              itemsPerPage={itemsPerPage}
            />
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
              totalItems={txnData?.data?.count || 0}
              itemsPerPage={itemsPerPage}
              className="mt-6"
            />
          </>
        )}
      </Card>
    </motion.div>
  );
};
