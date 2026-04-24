import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { CopyButton } from "@/components/ui/CopyButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { TabSwitcher, TabType } from "./TabSwitcher";
import {
  useSCTxns,
  useTransactions,
} from "@/hooks/useTransactions";
import { useDIDs } from "@/hooks/useDIDs";
import { Search } from "lucide-react";
import { useTokens, useFTList, useFTSuggestions, useFTTopHolders, useRBTSuggestions, useRBTInfo, useFTInfo } from "@/hooks/useTokens";
import { useIsMobile, useFormatAddress } from "@/hooks/useFormatAddress";
import { BanterLoader } from "@/components/ui/BanterLoader";
import { TOKEN_STATUS } from "@/constants";



interface DataExplorerProps {
  className?: string;
}


//  const TransactionsListView = () => {
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [loading, setLoading] = useState(true);

//   if (loading) {
//     return (
//       <div>
//         <Skeleton className="h-8 w-full mb-2" />
//         <Skeleton className="h-8 w-full mb-2" />
//         <Skeleton className="h-8 w-full mb-2" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-2">
//       {transactions.map((txn) => (
//         <Card key={txn.block_hash} className="p-4">
//           <div className="flex justify-between">
//             <span>Sender: {txn.sender_did}</span>
//             <span>Receiver: {txn.receiver_did}</span>
//           </div>
//           <div className="flex justify-between mt-2">
//             <span>Type: <Badge>{txn.txn_type}</Badge></span>
//             <span>Amount: {txn.amount}</span>
//           </div>
//           <div className="mt-2 text-sm text-gray-500">Timestamp: {txn.timestamp}</div>
//         </Card>
//       ))}
//     </div>
//   );
// };


interface TransactionsListViewProps {
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onTransactionClick: (transactionId: string) => void;
}

const TransactionsListView: React.FC<TransactionsListViewProps> = ({
  currentPage,
  itemsPerPage,
  onPageChange,
  onTransactionClick,
}) => {
  const isMobile = useIsMobile();
  const [transactions, setTransactions] = useState<any[]>([]);
  const paramsTxn = { page: currentPage, limit: itemsPerPage };
  const formatAddress = (address: string, length: number = 8): string => {
  if (!address || address === "N/A") return address;
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

  // Fetch transactions for current page
  const { data, isLoading: txnLoading } = useTransactions(paramsTxn) as any;

  useEffect(() => {
    if (data?.data?.transactions) {
      
      setTransactions(data.data.transactions);
    }
  }, [data]);

  // Use total_pages from API response directly
  const totalPages = data?.data?.totalPages ?? Math.ceil((data?.data?.count || 0) / itemsPerPage);

  if (txnLoading) return <BanterLoader label="Loading Transactions" />;

  return (
    <div className="w-full">
      {/* Mobile: vertical card list */}
      {isMobile ? (
        <div className="space-y-3">
          {transactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onTransactionClick(tx.id)}
              className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 p-4 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors space-y-2"
            >
              <div className="min-w-0">
                <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Transaction</p>
                <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                  <Tooltip content={tx.id} position="top">
                    <span className="text-sm font-medium text-secondary-900 dark:text-white font-mono block truncate min-w-0">{formatAddress(tx.id)}</span>
                  </Tooltip>
                  <div className="flex-shrink-0"><CopyButton text={tx.id} size="sm" /></div>
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">From</p>
                <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                  <Tooltip content={tx.from} position="top">
                    <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 block truncate min-w-0">{formatAddress(tx.from)}</span>
                  </Tooltip>
                  <div className="flex-shrink-0"><CopyButton text={tx.from} size="sm" /></div>
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">To</p>
                <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                  <Tooltip content={tx.to} position="top">
                    <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 block truncate min-w-0">{formatAddress(tx.to)}</span>
                  </Tooltip>
                  <div className="flex-shrink-0"><CopyButton text={tx.to} size="sm" /></div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200 whitespace-nowrap">
                    {tx.timestamp}
                  </span>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${
                    tx.status === "success"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {tx.status === "success" ? "Success" : "Failed"}
                  </span>
                </div>
                <span className="text-sm font-semibold text-secondary-900 dark:text-white whitespace-nowrap">
                  {tx.amount != null ? `${tx.amount} RBT` : "—"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 overflow-hidden">
          {/* Desktop table */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700 min-w-[700px]">
                <div className="flex px-4 md:px-6 py-3 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider gap-3 md:gap-4">
                  <div className="flex-1 min-w-0">Transaction</div>
                  <div className="flex-1 min-w-0">From</div>
                  <div className="flex-1 min-w-0">To</div>
                  <div className="w-32 md:w-40 flex-shrink-0">Time</div>
                  <div className="w-24 flex-shrink-0 text-center">Status</div>
                  <div className="w-28 md:w-32 flex-shrink-0 text-right">Amount (RBT)</div>
                </div>
              </div>
              <div className="divide-y divide-outline-200 dark:divide-outline-700 min-w-[700px]">
                {transactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onTransactionClick(tx.id)}
                    className="flex px-4 md:px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer gap-3 md:gap-4"
                  >
                    <div className="flex-1 min-w-0 flex items-center overflow-hidden">
                      <div className="flex items-center gap-1.5 w-full min-w-0 overflow-hidden">
                        <Tooltip content={tx.id} position="top">
                          <div className="text-sm font-medium text-secondary-900 dark:text-white truncate min-w-0">{formatAddress(tx.id)}</div>
                        </Tooltip>
                        <div className="flex-shrink-0"><CopyButton text={tx.id} size="sm" /></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center overflow-hidden">
                      <div className="flex items-center gap-1.5 w-full min-w-0 overflow-hidden">
                        <Tooltip content={tx.from} position="top">
                          <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 block truncate min-w-0">{formatAddress(tx.from)}</span>
                        </Tooltip>
                        <div className="flex-shrink-0"><CopyButton text={tx.from} size="sm" /></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center overflow-hidden">
                      <div className="flex items-center gap-1.5 w-full min-w-0 overflow-hidden">
                        <Tooltip content={tx.to} position="top">
                          <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 block truncate min-w-0">{formatAddress(tx.to)}</span>
                        </Tooltip>
                        <div className="flex-shrink-0"><CopyButton text={tx.to} size="sm" /></div>
                      </div>
                    </div>
                    <div className="w-32 md:w-40 flex-shrink-0 flex items-center">
                      <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200">
                        {tx.timestamp}
                      </span>
                    </div>
                    <div className="w-24 flex-shrink-0 flex items-center justify-center">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${
                        tx.status === "success"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {tx.status === "success" ? "Success" : "Failed"}
                      </span>
                    </div>
                    <div className="w-28 md:w-32 flex-shrink-0 text-right flex items-center justify-end">
                      <div className="text-sm font-semibold text-secondary-900 dark:text-white whitespace-nowrap">{tx.amount != null ? `${tx.amount} RBT` : "—"}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={data?.data?.count || 0}
        itemsPerPage={itemsPerPage}
        className="mt-6"
      />
    </div>
  );
};


const HoldersListView: React.FC<{
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onHolderClick: (holderAddress: string) => void;
}> = ({ currentPage, itemsPerPage, onPageChange, onHolderClick }) => {
  const formatAddress = useFormatAddress(50, 8);
  const isMobile = useIsMobile();

  const [holderType, setHolderType] = useState<"rbt" | "ft">("rbt");
  const [ftSearchInput, setFtSearchInput] = useState("");
  const [activeFtName, setActiveFtName] = useState("");
  const [activeCreatorDid, setActiveCreatorDid] = useState("");
  const [ftPage, setFtPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: ftSuggestions = [] } = useFTSuggestions(ftSearchInput, 10) as { data: Array<{ ft_name: string; creator_did: string }> };

  // RBT holders — API returns []DIDBalance with fields: did, balance, asset_type, token_name, last_update
  const paramsTxn = { page: currentPage, limit: itemsPerPage };
  const { data: rbtData } = useDIDs(paramsTxn) as any;
  const holders: any[] = Array.isArray(rbtData) ? rbtData : (rbtData?.data || rbtData?.holders || []);
  const rbtTotalPages = rbtData?.total_pages ?? Math.ceil((rbtData?.total || rbtData?.count || holders.length || 0) / itemsPerPage);

  // FT top holders (requires both ftName + creatorDID from suggestion selection)
  const { data: ftData, isLoading: ftLoading } = useFTTopHolders(
    { ftName: activeFtName, creatorDID: activeCreatorDid, page: ftPage, limit: itemsPerPage },
    holderType === "ft" && !!activeFtName && !!activeCreatorDid
  ) as any;

  const ftHolders: any[] = ftData?.holders || [];
  const ftTotalPages = Math.ceil((ftData?.total_count || 0) / itemsPerPage);

  const handleFtSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setFtPage(1);
    setActiveFtName(ftSearchInput.trim());
  };

  const handleSuggestionSelect = (ftName: string, creatorDid: string) => {
    setFtSearchInput(ftName);
    setActiveFtName(ftName);
    setActiveCreatorDid(creatorDid);
    setFtPage(1);
    setShowSuggestions(false);
  };

  return (
    <div className="w-full space-y-4">
      {/* RBT / FT Filter */}
      <div className="flex items-center gap-2">
        {(["rbt", "ft"] as const).map((type) => (
          <button
            key={type}
            onClick={() => { setHolderType(type); onPageChange(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              holderType === type
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {type === "rbt" ? "RBTs" : "FTs"}
          </button>
        ))}
      </div>

      {/* FT name search bar with autocomplete */}
      {holderType === "ft" && (
        <form onSubmit={handleFtSearch} className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={ftSearchInput}
              onChange={(e) => { setFtSearchInput(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search by FT name..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {showSuggestions && ftSuggestions.length > 0 && (
              <ul className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                {ftSuggestions.map((s, i) => (
                  <li
                    key={`${s.ft_name}-${i}`}
                    onMouseDown={() => handleSuggestionSelect(s.ft_name, s.creator_did)}
                    className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white min-w-0 truncate flex-1">{s.ft_name}</span>
                    <Tooltip content={s.creator_did} position="top">
                      <span className="text-xs text-gray-400 font-mono whitespace-nowrap flex-shrink-0 cursor-default">
                        {s.creator_did.slice(0, 8)}…{s.creator_did.slice(-6)}
                      </span>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="submit"
            disabled={!ftSearchInput.trim()}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Search
          </button>
        </form>
      )}

      {holderType === "rbt" && (
        isMobile ? (
          <div className="space-y-3">
            {holders.filter((h) => h.did !== '').map((holder, index) => (
              <motion.div
                key={holder.did || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onHolderClick(holder.did)}
                className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 p-4 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors space-y-2"
              >
                <div>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Address</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-secondary-900 dark:text-white font-mono truncate">{formatAddress(holder.did)}</span>
                    <CopyButton text={holder.did} size="sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Balance</p>
                  <span className="text-sm font-semibold text-secondary-900 dark:text-white">{holder.balance}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[450px]">
                <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
                  <div className="flex px-4 md:px-6 py-3 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider gap-3 md:gap-6">
                    <div className="min-w-[180px] md:flex-1 md:min-w-[300px]">Address</div>
                    <div className="w-24 md:w-32 lg:w-40 flex-shrink-0 text-right">Balance</div>
                  </div>
                </div>
                <div className="divide-y divide-outline-200 dark:divide-outline-700">
                  {holders.filter((h) => h.did !== '').map((holder, index) => (
                    <motion.div
                      key={holder.did || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onHolderClick(holder.did)}
                      className="flex px-4 md:px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer gap-3 md:gap-6"
                    >
                      <div className="min-w-[180px] md:flex-1 md:min-w-[300px] flex items-center">
                        <div className="flex items-center gap-1.5 w-full min-w-0">
                          <div className="text-sm font-medium text-secondary-900 dark:text-white font-mono cursor-pointer truncate">{formatAddress(holder.did)}</div>
                          <div className="flex-shrink-0"><CopyButton text={holder.did} size="sm" /></div>
                        </div>
                      </div>
                      <div className="w-24 md:w-32 lg:w-40 flex-shrink-0 flex items-center justify-end">
                        <div className="text-sm font-semibold text-secondary-900 dark:text-white whitespace-nowrap">{holder.balance}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {holderType === "ft" && activeFtName && (
        ftLoading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-4">Loading FT holders...</div>
        ) : ftHolders.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-4">No holders found for "{activeFtName}".</div>
        ) : isMobile ? (
          <div className="space-y-3">
            {ftHolders.map((holder: any, index: number) => (
              <motion.div
                key={holder.did || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onHolderClick(holder.did)}
                className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 p-4 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors space-y-2"
              >
                <div>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Address</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-secondary-900 dark:text-white font-mono truncate">{formatAddress(holder.did)}</span>
                    <CopyButton text={holder.did} size="sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">FT Balance</p>
                  <span className="text-sm font-semibold text-secondary-900 dark:text-white">{holder.token_count ?? "—"}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
                  <div className="flex px-4 md:px-6 py-3 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider gap-3 md:gap-6">
                    <div className="min-w-[180px] md:flex-1 md:min-w-[300px]">Address</div>
                    <div className="w-32 md:w-40 flex-shrink-0 text-right">FT Balance</div>
                  </div>
                </div>
                <div className="divide-y divide-outline-200 dark:divide-outline-700">
                  {ftHolders.map((holder: any, index: number) => (
                    <motion.div
                      key={holder.did || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onHolderClick(holder.did)}
                      className="flex px-4 md:px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer gap-3 md:gap-6"
                    >
                      <div className="min-w-[180px] md:flex-1 md:min-w-[300px] flex items-center">
                        <div className="flex items-center gap-1.5 w-full min-w-0">
                          <div className="text-sm font-medium text-secondary-900 dark:text-white font-mono cursor-pointer truncate">{formatAddress(holder.did)}</div>
                          <div className="flex-shrink-0"><CopyButton text={holder.did} size="sm" /></div>
                        </div>
                      </div>
                      <div className="w-32 md:w-40 flex-shrink-0 flex items-center justify-end">
                        <div className="text-sm font-semibold text-secondary-900 dark:text-white whitespace-nowrap">{holder.token_count ?? "—"}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {holderType === "ft" && !activeFtName && (
        <div className="text-sm text-gray-500 dark:text-gray-400 py-4">
          Enter an FT name above and press Search to see holders.
        </div>
      )}

      {/* Pagination */}
      {holderType === "rbt" && (
        <Pagination
          currentPage={currentPage}
          totalPages={rbtTotalPages || 1}
          onPageChange={onPageChange}
          totalItems={rbtData?.total || 1}
          itemsPerPage={itemsPerPage}
          className="mt-6"
        />
      )}
      {holderType === "ft" && activeFtName && ftTotalPages > 1 && (
        <Pagination
          currentPage={ftPage}
          totalPages={ftTotalPages}
          onPageChange={setFtPage}
          totalItems={ftData?.count || 1}
          itemsPerPage={itemsPerPage}
          className="mt-6"
        />
      )}
    </div>
  );
};


const TokensListView: React.FC<{
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onTokenClick: (tokenId: string) => void;
}> = ({ currentPage, itemsPerPage, onPageChange, onTokenClick }) => {
  const formatAddress = useFormatAddress(50, 8);
  const isMobile = useIsMobile();
  const [tokenType, setTokenType] = useState<"rbt" | "ft">("rbt");
  const [ftPage, setFtPage] = useState(1);

  // RBT search state
  const [rbtSearchInput, setRbtSearchInput] = useState("");
  const [activeRbtToken, setActiveRbtToken] = useState("");
  const [showRbtSuggestions, setShowRbtSuggestions] = useState(false);

  // FT search state
  const [ftSearchInput, setFtSearchInput] = useState("");
  const [activeFtName, setActiveFtName] = useState("");
  const [activeFtCreator, setActiveFtCreator] = useState("");
  const [showFtSuggestions, setShowFtSuggestions] = useState(false);

  // RBT tokens list
  const rbtParams = { page: currentPage, limit: itemsPerPage };
  const { data: rbtData, isLoading: rbtLoading, error: rbtError } = useTokens(rbtParams) as any;
  const rbtTokens = Array.isArray(rbtData) ? rbtData : (rbtData?.data || rbtData?.tokens || []);
  const rbtTotalPages = rbtData?.total_pages ?? Math.ceil((rbtData?.total || rbtData?.count || rbtTokens.length || 0) / itemsPerPage);

  // FT group list — API returns { data: []FTGroup, total, total_pages }
  const ftParams = { page: ftPage, limit: itemsPerPage };
  const { data: ftData, isLoading: ftLoading } = useFTList(ftParams) as any;
  const ftTokens = Array.isArray(ftData) ? ftData : (ftData?.data || ftData?.ft_list || ftData?.fts || []);
  const ftTotalPages = ftData?.total_pages ?? Math.ceil((ftData?.total || ftData?.count || ftTokens.length || 0) / itemsPerPage);

  // RBT search suggestions
  const { data: rbtSuggestions = [] } = useRBTSuggestions(rbtSearchInput, 10) as { data: Array<{ token_id: string }> };

  // RBT info for selected token
  const { data: rbtInfoData, isLoading: rbtInfoLoading } = useRBTInfo(activeRbtToken, !!activeRbtToken);

  // FT search suggestions
  const { data: ftSuggestions = [] } = useFTSuggestions(ftSearchInput, 10) as { data: Array<{ ft_name: string; creator_did: string }> };

  // FT detail info for selected FT
  const { data: ftInfoData, isLoading: ftInfoLoading } = useFTInfo(activeFtName, activeFtCreator, !!activeFtName && !!activeFtCreator);

  const handleRbtSuggestionSelect = (tokenId: string) => {
    setRbtSearchInput(tokenId);
    setActiveRbtToken(tokenId);
    setShowRbtSuggestions(false);
  };

  const handleFtSuggestionSelect = (ftName: string, creatorDid: string) => {
    setFtSearchInput(ftName);
    setActiveFtName(ftName);
    setActiveFtCreator(creatorDid);
    setShowFtSuggestions(false);
  };

  if (tokenType === "rbt" && rbtLoading && !activeRbtToken) return <BanterLoader label="Loading Tokens" />;
  if (tokenType === "ft" && ftLoading && !activeFtName) return <BanterLoader label="Loading Tokens" />;
  if (tokenType === "rbt" && rbtError && !activeRbtToken) return <div className="text-sm text-red-500 py-4">Error loading tokens</div>;

  return (
    <div className="w-full space-y-4">
      {/* RBT / FT Filter */}
      <div className="flex items-center gap-2">
        {(["rbt", "ft"] as const).map((type) => (
          <button
            key={type}
            onClick={() => { setTokenType(type); onPageChange(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tokenType === type
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {type === "rbt" ? "RBTs" : "FTs"}
          </button>
        ))}
      </div>

      {/* RBT search bar */}
      {tokenType === "rbt" && (
        <div className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={rbtSearchInput}
              onChange={(e) => { setRbtSearchInput(e.target.value); setShowRbtSuggestions(true); if (!e.target.value) setActiveRbtToken(""); }}
              onFocus={() => setShowRbtSuggestions(true)}
              onBlur={() => setTimeout(() => setShowRbtSuggestions(false), 150)}
              placeholder="Search by token ID..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {showRbtSuggestions && rbtSuggestions.length > 0 && (
              <ul className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                {rbtSuggestions.map((s, i) => (
                  <li
                    key={`${s.token_id}-${i}`}
                    onMouseDown={() => handleRbtSuggestionSelect(s.token_id)}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors font-mono text-gray-900 dark:text-white truncate"
                  >
                    {s.token_id}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {activeRbtToken && (
            <button
              onClick={() => { setRbtSearchInput(""); setActiveRbtToken(""); }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* FT search bar */}
      {tokenType === "ft" && (
        <div className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={ftSearchInput}
              onChange={(e) => { setFtSearchInput(e.target.value); setShowFtSuggestions(true); if (!e.target.value) { setActiveFtName(""); setActiveFtCreator(""); } }}
              onFocus={() => setShowFtSuggestions(true)}
              onBlur={() => setTimeout(() => setShowFtSuggestions(false), 150)}
              placeholder="Search by FT name..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {showFtSuggestions && ftSuggestions.length > 0 && (
              <ul className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                {ftSuggestions.map((s, i) => (
                  <li
                    key={`${s.ft_name}-${i}`}
                    onMouseDown={() => handleFtSuggestionSelect(s.ft_name, s.creator_did)}
                    className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white min-w-0 truncate flex-1">{s.ft_name}</span>
                    <Tooltip content={s.creator_did} position="top">
                      <span className="text-xs text-gray-400 font-mono whitespace-nowrap flex-shrink-0 cursor-default">
                        {s.creator_did.slice(0, 8)}…{s.creator_did.slice(-6)}
                      </span>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {activeFtName && (
            <button
              onClick={() => { setFtSearchInput(""); setActiveFtName(""); setActiveFtCreator(""); }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* RBT detail card */}
      {tokenType === "rbt" && activeRbtToken && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg p-4 space-y-3"
          >
            {rbtInfoLoading ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">Loading token info...</div>
            ) : rbtInfoData ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">RBT Token</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">Token ID</p>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Tooltip content={(rbtInfoData as any).token_id} position="top">
                        <span className="text-sm font-mono font-medium text-secondary-900 dark:text-white truncate block">{formatAddress((rbtInfoData as any).token_id)}</span>
                      </Tooltip>
                      <div className="flex-shrink-0"><CopyButton text={(rbtInfoData as any).token_id} size="sm" /></div>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">Owner</p>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Tooltip content={(rbtInfoData as any).owner_did} position="top">
                        <span className="text-sm font-mono text-secondary-700 dark:text-secondary-300 truncate block">{formatAddress((rbtInfoData as any).owner_did)}</span>
                      </Tooltip>
                      <div className="flex-shrink-0"><CopyButton text={(rbtInfoData as any).owner_did} size="sm" /></div>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">Value</p>
                    <span className="text-sm font-semibold text-secondary-900 dark:text-white">{(rbtInfoData as any).token_value} RBT</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">No data found for this token.</div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* FT detail card */}
      {tokenType === "ft" && activeFtName && activeFtCreator && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg p-4 space-y-3"
          >
            {ftInfoLoading ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">Loading FT info...</div>
            ) : ftInfoData ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">FT Token</span>
                  <span className="text-sm font-bold text-secondary-900 dark:text-white">{(ftInfoData as any).ft_name}</span>
                </div>
                <div className="flex items-start gap-6">
                  {/* Creator — left, full DID — hidden on mobile */}
                  <div className="flex-1 min-w-0 hidden sm:block">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">Creator</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-mono text-secondary-700 dark:text-secondary-300 break-all">{(ftInfoData as any).creator_did}</span>
                      <div className="flex-shrink-0"><CopyButton text={(ftInfoData as any).creator_did} size="sm" /></div>
                    </div>
                  </div>
                  {/* Stats — right, single row */}
                  <div className="flex items-start gap-6 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">FT Value</p>
                      <span className="text-sm font-semibold text-secondary-900 dark:text-white">{(ftInfoData as any).ft_value ?? "—"}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">Total Amount</p>
                      <span className="text-sm font-semibold text-secondary-900 dark:text-white">
                        {typeof (ftInfoData as any).total_amount === "number" ? (ftInfoData as any).total_amount.toLocaleString() : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">No data found for this FT.</div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {tokenType === "rbt" && (
        <>
          {rbtTokens.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">No tokens available.</div>
          ) : isMobile ? (
            <div className="space-y-3">
              {rbtTokens.map((token: any, index: number) => (
                <motion.div
                  key={token.token_id || `token-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onTokenClick(token.token_id)}
                  className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 p-4 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors space-y-2"
                >
                  <div>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Token</p>
                    <div className="flex items-center gap-1.5">
                      <Tooltip content={token.token_id} position="top">
                        <span className="text-sm font-medium text-secondary-900 dark:text-white font-mono truncate">{formatAddress(token.token_id)}</span>
                      </Tooltip>
                      <CopyButton text={token.token_id} size="sm" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Executor</p>
                    <div className="flex items-center gap-1.5">
                      <Tooltip content={token.did} position="top">
                        <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate">{formatAddress(token.did)}</span>
                      </Tooltip>
                      <CopyButton text={token.did} size="sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Amount</p>
                    <span className="text-sm font-semibold text-secondary-900 dark:text-white whitespace-nowrap">{token.token_value} RBT</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 overflow-hidden">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="border-b border-outline-200 dark:border-outline-700">
                    <div className="flex px-4 md:px-6 py-3 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider gap-3 md:gap-4 bg-secondary-50 dark:bg-secondary-800">
                      <div className="flex-1 min-w-[200px]">Token</div>
                      <div className="w-24 md:w-32 lg:w-40 flex-shrink-0">Amount in RBT</div>
                      <div className="flex-1 min-w-[160px]">Owner</div>
                    </div>
                  </div>
                  <div className="divide-y divide-outline-200 dark:divide-outline-700">
                    {rbtTokens.map((token: any, index: number) => (
                      <motion.div
                        key={token.token_id || `token-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onTokenClick(token.token_id)}
                        className="flex px-4 md:px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer gap-3 md:gap-4"
                      >
                        <div className="flex-1 min-w-[200px] flex items-center">
                          <div className="flex items-center gap-1.5 w-full min-w-0">
                            <Tooltip content={token.token_id} position="top">
                              <div className="text-sm font-medium text-secondary-900 dark:text-white truncate">{formatAddress(token.token_id)}</div>
                            </Tooltip>
                            <div className="flex-shrink-0"><CopyButton text={token.token_id} size="sm" /></div>
                          </div>
                        </div>
                        <div className="w-24 md:w-32 lg:w-40 flex-shrink-0 flex items-center">
                          <span className="text-sm font-semibold text-secondary-900 dark:text-white whitespace-nowrap">{token.token_value} RBT</span>
                        </div>
                        <div className="flex-1 min-w-[160px] flex items-center">
                          <div className="flex items-center gap-1.5 w-full min-w-0">
                            <Tooltip content={token.did} position="top">
                              <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate">{formatAddress(token.did)}</span>
                            </Tooltip>
                            <div className="flex-shrink-0"><CopyButton text={token.did} size="sm" /></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {rbtTotalPages > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={rbtTotalPages}
              onPageChange={onPageChange}
              totalItems={rbtData?.total || rbtData?.count || rbtTokens.length || 0}
              itemsPerPage={itemsPerPage}
              className="mt-6"
            />
          )}
        </>
      )}

      {tokenType === "ft" && (
        <>
          {ftLoading ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 py-4">Loading FTs...</div>
          ) : ftTokens.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 py-4">No FTs available.</div>
          ) : isMobile ? (
            <div className="space-y-3">
              {ftTokens.map((ft: any, index: number) => (
                <motion.div
                  key={ft.ftName || ft.ft_name || `ft-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 p-4 space-y-2"
                >
                  <div>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">FT Name</p>
                    <span className="text-sm font-medium text-secondary-900 dark:text-white font-mono">{ft.ftName || ft.ft_name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Minted</p>
                    <span className="text-sm font-semibold text-secondary-900 dark:text-white">
                      {typeof ft.count === "number" ? ft.count.toLocaleString() : ft.count ?? "—"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 overflow-hidden">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="border-b border-outline-200 dark:border-outline-700">
                    <div className="flex px-4 md:px-6 py-3 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider gap-3 md:gap-4 bg-secondary-50 dark:bg-secondary-800">
                      <div className="flex-1 min-w-[200px]">FT Name</div>
                      <div className="w-28 md:w-36 flex-shrink-0 text-right">Minted</div>
                    </div>
                  </div>
                  <div className="divide-y divide-outline-200 dark:divide-outline-700">
                    {ftTokens.map((ft: any, index: number) => (
                      <motion.div
                        key={ft.ftName || ft.ft_name || `ft-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex px-4 md:px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors gap-3 md:gap-4"
                      >
                        <div className="flex-1 min-w-[200px] flex items-center">
                          <span className="text-sm font-medium text-secondary-900 dark:text-white font-mono">{ft.ftName || ft.ft_name || "—"}</span>
                        </div>
                        <div className="w-28 md:w-36 flex-shrink-0 flex items-center justify-end">
                          <span className="text-sm font-semibold text-secondary-900 dark:text-white whitespace-nowrap">
                            {typeof ft.count === "number" ? ft.count.toLocaleString() : ft.count ?? "—"}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {ftTotalPages > 1 && (
            <Pagination
              currentPage={ftPage}
              totalPages={ftTotalPages}
              onPageChange={setFtPage}
              totalItems={ftData?.total || ftData?.count || 0}
              itemsPerPage={itemsPerPage}
              className="mt-6"
            />
          )}
        </>
      )}
    </div>
  );
};


const SCBlocksList: React.FC<{
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, itemsPerPage, onPageChange }) => {
  const navigate = useNavigate();
  const paramsTxn = { page: currentPage, limit: itemsPerPage };
  const { data, isLoading } = useSCTxns(paramsTxn) as any;
  const isMobile = useIsMobile();

  // Handle both flat array and wrapped { data: [], total_pages, total } shapes
  const scList: any[] = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (data?.sc_blocks || []));
  const totalPages = data?.total_pages ?? Math.ceil((data?.total || data?.count || scList.length || 0) / itemsPerPage);

  const fmt = (address: string, length = 14): string => {
    if (!address || address === "N/A") return address || "—";
    if (address.length <= length * 2) return address;
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  };

  if (isLoading) return <BanterLoader label="Loading Smart Contracts" />;

  if (!scList.length) return (
    <p className="text-sm text-secondary-500 dark:text-secondary-400 py-4">No smart contracts found.</p>
  );

  return (
    <div className="w-full">
      {isMobile ? (
        <div className="space-y-3">
          {scList.map((sc: any, index: number) => (
            <motion.div
              key={sc.token_id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/sc-token-explorer?token=${encodeURIComponent(sc.token_id)}`)}
              className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 p-4 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Token ID</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.token_status === 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : sc.token_status === 8 || sc.token_status === 9 || sc.token_status === 15 ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                  {TOKEN_STATUS[sc.token_status as number] ?? `Unknown (${sc.token_status})`}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Tooltip content={sc.token_id} position="top">
                  <span className="text-sm font-medium text-secondary-900 dark:text-white font-mono truncate">{fmt(sc.token_id, 8)}</span>
                </Tooltip>
                <CopyButton text= {sc.token_id} size="sm" />
              </div>
              <div>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Deployer</p>
                <div className="flex items-center gap-1.5">
                  <Tooltip content={sc.deployer} position="top">
                    <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate cursor-pointer hover:text-primary-600"
                      onClick={(e) => { e.stopPropagation(); navigate(`/did-explorer?did=${sc.deployer}`); }}>
                      {fmt(sc.deployer, 8)}
                    </span>
                  </Tooltip>
                  {sc.deployer && <CopyButton text={sc.deployer} size="sm" />}
                </div>
              </div>
              <div>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Executor</p>
                <div className="flex items-center gap-1.5">
                  <Tooltip content={sc.did} position="top">
                    <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate cursor-pointer hover:text-primary-600"
                      onClick={(e) => { e.stopPropagation(); navigate(`/did-explorer?did=${sc.did}`); }}>
                      {fmt(sc.did, 8)}
                    </span>
                  </Tooltip>
                  {sc.did && <CopyButton text={sc.did} size="sm" />}
                </div>
              </div>
              <div>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Latest Txn</p>
                <div className="flex items-center gap-1.5">
                  <Tooltip content={sc.transaction_id} position="top">
                    <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate cursor-pointer hover:text-primary-600"
                      onClick={(e) => { e.stopPropagation(); navigate(`/transaction-explorer?tx=${sc.transaction_id}`); }}>
                      {fmt(sc.transaction_id, 8)}
                    </span>
                  </Tooltip>
                  {sc.transaction_id && <CopyButton text={sc.transaction_id} size="sm" />}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 overflow-hidden">
          {/* Header */}
          <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
            <div className="flex px-4 md:px-6 py-3 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider gap-4">
              <div className="flex-1 min-w-0">SC ID</div>
              <div className="flex-1 min-w-0">Latest Txn</div>
              <div className="flex-1 min-w-0">Executor</div>
              <div className="flex-1 min-w-0">Deployer</div>
              {/* <div className="w-20 flex-shrink-0">Status</div> */}
            </div>
          </div>
          {/* Rows */}
          <div className="divide-y divide-outline-200 dark:divide-outline-700">
            {scList.map((sc: any, index: number) => (
              <motion.div
                key={sc.token_id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/sc-token-explorer?token=${encodeURIComponent(sc.token_id)}`)}
                className="flex px-4 md:px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer gap-4"
              >
                {/* Token ID */}
                <div className="flex-1 min-w-0 flex items-center gap-1.5">
                  <Tooltip content={sc.token_id} position="top">
                    <span className="text-sm font-medium text-secondary-900 dark:text-white font-mono truncate block">{fmt(sc.token_id)}</span>
                  </Tooltip>
                  <div className="flex-shrink-0"><CopyButton text={sc.token_id} size="sm" /></div>
                </div>
                {/* Latest Txn */}
                <div className="flex-1 min-w-0 flex items-center gap-1.5">
                  <Tooltip content={sc.transaction_id} position="top">
                    <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate block cursor-pointer hover:text-primary-600"
                      onClick={(e) => { e.stopPropagation(); navigate(`/transaction-explorer?tx=${sc.transaction_id}`); }}>
                      {fmt(sc.transaction_id)}
                    </span>
                  </Tooltip>
                  {sc.transaction_id && <div className="flex-shrink-0"><CopyButton text={sc.transaction_id} size="sm" /></div>}
                </div>

                      {/* Owner */}
                <div className="flex-1 min-w-0 flex items-center gap-1.5">
                  <Tooltip content={sc.did} position="top">
                    <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate block cursor-pointer hover:text-primary-600"
                      onClick={(e) => { e.stopPropagation(); navigate(`/did-explorer?did=${sc.did}`); }}>
                      {fmt(sc.did)}
                    </span>
                  </Tooltip>
                  {sc.did && <div className="flex-shrink-0"><CopyButton text={sc.did} size="sm" /></div>}
                </div>
                {/* Deployer */}
                <div className="flex-1 min-w-0 flex items-center gap-1.5">
                  <Tooltip content={sc.deployer} position="top">
                    <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate block cursor-pointer hover:text-primary-600"
                      onClick={(e) => { e.stopPropagation(); navigate(`/did-explorer?did=${sc.deployer}`); }}>
                      {fmt(sc.deployer)}
                    </span>
                  </Tooltip>
                  {sc.deployer && <div className="flex-shrink-0"><CopyButton text={sc.deployer} size="sm" /></div>}
                </div>
          

                {/* Status */}
                {/* <div className="w-20 flex-shrink-0 flex items-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${sc.token_status === 1 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                    {sc.token_status === 1 ? "Active" : "Inactive"}
                  </span>
                </div> */}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={data?.count || scList.length}
        itemsPerPage={itemsPerPage}
        className="mt-6"
      />
    </div>
  );
};




export const DataExplorer: React.FC<DataExplorerProps> = ({
  className = "",
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>(
    () => (sessionStorage.getItem("dataExplorerTab") as TabType) || "transactions"
  );




  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    sessionStorage.setItem("dataExplorerTab", tab);
  };

  const handleTransactionClick = (transactionId: string) => {
    navigate(`/transaction-explorer?tx=${encodeURIComponent(transactionId)}`);
  };

  const handleHolderClick = (holderAddress: string) => {
    navigate(`/did-explorer?did=${encodeURIComponent(holderAddress)}`);
  };

  const handleTokenClick = (tokenId: string) => {
    navigate(`/token-explorer?token=${encodeURIComponent(tokenId)}`);
  };

  const renderContent = () => {
    // if (viewMode === "graph") {
    //   return (
    //     <div className="w-full">
    //       <div className="mb-4 sm:mb-6">
    //         <h3 className="text-base sm:text-lg font-semibold text-secondary-900 dark:text-white mb-2">
    //           Value Settled (RBT) -{" "}
    //           {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View
    //         </h3>
    //         <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400">
    //           Economic activity visualization for the Rubix ecosystem
    //         </p>
    //       </div>
    //       <div className="w-full overflow-hidden">
    //         <TransactionsGraph className="w-full" />
    //       </div>
    //     </div>
    //   );
    // }

    // if (viewMode === 'quorums') {
    //   return (<QuorumsListView />);
    // }

    switch (activeTab) {
      case "transactions":
        return (
          <TransactionsListView
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onTransactionClick={handleTransactionClick}
          />
        );
      case "holders":
        return (
          <HoldersListView
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onHolderClick={handleHolderClick}
          />
        );
      case "tokens":
        return (
          <TokensListView
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onTokenClick={handleTokenClick}
          />
        );
      case "scblocks":
        return (
          <SCBlocksList
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        );
      default:
        return (
          <TransactionsListView
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onTransactionClick={handleTransactionClick}
          />
        );
    }
  };

  return (
    <Card className={`${className}`}>
      <div className="p-2 pt-0 w-full">
        {/* Header with Tab Switcher */}
        <div className="mb-6">
          <div className="mb-4">
            {/* <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
              Rubix Explorer
            </h2> */}
            {/* <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
              {`Viewing ${activeTab} data`}
            </p> */}
          </div>

          <TabSwitcher
            activeTab={activeTab}
            onTabChange={handleTabChange}
            showCounts={true}
          />
        </div>

        {/* Content */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
};

export type { DataExplorerProps };
