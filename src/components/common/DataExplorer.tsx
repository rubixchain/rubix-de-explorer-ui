import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { CopyButton } from "@/components/ui/CopyButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { TabSwitcher, TabType } from "./TabSwitcher";
import { TransactionsGraph } from "@/components/charts/TransactionsGraph";
import { RecentActivityTable } from "./RecentActivityTable";
import {
  useSCTxns,
  useTransactions,
} from "@/hooks/useTransactions";
import { useDIDs } from "@/hooks/useDIDs";
import { Search } from "lucide-react";
import { useTokens, useFTList, useFTSuggestions, useFTTopHolders, useRBTSuggestions, useRBTInfo, useFTInfo } from "@/hooks/useTokens";
import { useIsMobile, useFormatAddress } from "@/hooks/useFormatAddress";



interface DataExplorerProps {
  className?: string;
}
interface Quorum {
  id: string;
  name: string;
  validators: number;
  threshold: number;
  status: "active" | "standby" | "inactive";
  lastActivity: string;
}

const mockTransactions = [
  {
    id: "0x6789...0123",
    type: "Transfer",
    from: "0xmmmm...nnnn",
    to: "0xoooo...pppp",
    value: "6,200.95 RBT",
    timestamp: "52 minutes ago",
    status: "confirmed",
  },
];

const mockHolders = [
  {
    address:
      "0x44441234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    tokenCount: 1,
    percentage: "0.6%",
    rank: 20,
    transactions: 90,
  },
];

const mockTokens = [
  {
    id: "RBT-001",
    name: "Rubix Token",
    symbol: "RBT",
    valueInRBT: "1,250.50",
    type: "RBT",
  },
];


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
  const { data, isLoading, error } = useTransactions(paramsTxn) as any 

  useEffect(() => {
    if (data?.data?.transactions) {
      
      setTransactions(data.data.transactions);
    }
  }, [data]);

  // Compute total pages from totalCount returned by API
  const totalPages = Math.ceil((data?.data?.count || 0) / itemsPerPage);

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
                <span className="text-sm font-semibold text-secondary-900 dark:text-white whitespace-nowrap">
                  {tx.value}
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
              <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700 min-w-[1000px]">
                <div className="flex px-4 md:px-6 py-3 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider gap-3 md:gap-4">
                  <div className="flex-1 min-w-[200px]">Transaction</div>
                  <div className="flex-1 min-w-[200px]">Initiator</div>
                  <div className="flex-1 min-w-[200px]">Owner</div>
                  <div className="w-32 md:w-40 flex-shrink-0">Time</div>
                  <div className="w-28 md:w-32 flex-shrink-0 text-right">Amount</div>
                </div>
              </div>
              <div className="divide-y divide-outline-200 dark:divide-outline-700 min-w-[1000px]">
                {transactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onTransactionClick(tx.id)}
                    className="flex px-4 md:px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer gap-3 md:gap-4"
                  >
                    <div className="flex-1 min-w-[200px] flex items-center">
                      <div className="flex items-center gap-1.5 w-full min-w-0">
                        <Tooltip content={tx.id} position="top">
                          <div className="text-sm font-medium text-secondary-900 dark:text-white truncate">{formatAddress(tx.id)}</div>
                        </Tooltip>
                        <div className="flex-shrink-0"><CopyButton text={tx.id} size="sm" /></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-[200px] flex items-center">
                      <div className="flex items-center gap-1.5 w-full min-w-0">
                        <Tooltip content={tx.from} position="top">
                          <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate">{formatAddress(tx.from)}</span>
                        </Tooltip>
                        <div className="flex-shrink-0"><CopyButton text={tx.from} size="sm" /></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-[200px] flex items-center">
                      <div className="flex items-center gap-1.5 w-full min-w-0">
                        <Tooltip content={tx.to} position="top">
                          <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate">{formatAddress(tx.to)}</span>
                        </Tooltip>
                        <div className="flex-shrink-0"><CopyButton text={tx.to} size="sm" /></div>
                      </div>
                    </div>
                    <div className="w-32 md:w-40 flex-shrink-0 flex items-center">
                      <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200">
                        {tx.timestamp}
                      </span>
                    </div>
                    <div className="w-28 md:w-32 flex-shrink-0 text-right flex items-center justify-end">
                      <div className="text-sm font-semibold text-secondary-900 dark:text-white whitespace-nowrap">{tx.value}</div>
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
  const holders: any[] = Array.isArray(rbtData) ? rbtData : (rbtData?.holders || []);
  const rbtTotalPages = Math.ceil((rbtData?.count || holders.length || 0) / itemsPerPage);

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
                    className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{s.ft_name}</span>
                    <span className="text-xs text-gray-400 font-mono truncate max-w-[120px] ml-2">
                      {s.creator_did.slice(0, 10)}…
                    </span>
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
          totalItems={rbtData?.holders_response?.count || 0}
          itemsPerPage={itemsPerPage}
          className="mt-6"
        />
      )}
      {holderType === "ft" && activeFtName && ftTotalPages > 1 && (
        <Pagination
          currentPage={ftPage}
          totalPages={ftTotalPages}
          onPageChange={setFtPage}
          totalItems={ftData?.count || 0}
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
  // API returns []Token (flat array) — fields: token_id, token_value, token_status, did, transaction_id
  const rbtTokens = Array.isArray(rbtData) ? rbtData : (rbtData?.tokens || []);
  const rbtTotalPages = Math.ceil((rbtData?.count || rbtTokens.length || 0) / itemsPerPage);

  // FT group list — API returns []FTGroup with fields: ftName, count, creatorDID
  const ftParams = { page: ftPage, limit: itemsPerPage };
  const { data: ftData, isLoading: ftLoading } = useFTList(ftParams) as any;
  const ftTokens = Array.isArray(ftData) ? ftData : (ftData?.ft_list || ftData?.fts || []);
  const ftTotalPages = Math.ceil((ftData?.count || ftTokens.length || 0) / itemsPerPage);

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

  const formatEpoch = (epoch: number) => {
    if (!epoch) return "—";
    const ts = epoch < 1e12 ? epoch * 1000 : epoch;
    return new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  if (tokenType === "rbt" && rbtLoading && !activeRbtToken) return <div className="text-sm text-gray-500 py-4">Loading tokens...</div>;
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
                    className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{s.ft_name}</span>
                    <span className="text-xs text-gray-400 font-mono truncate max-w-[120px] ml-2">{s.creator_did.slice(0, 10)}…</span>
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
                  <div>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">Token ID</p>
                    <div className="flex items-center gap-1.5">
                      <Tooltip content={(rbtInfoData as any).token_id} position="top">
                        <span className="text-sm font-mono font-medium text-secondary-900 dark:text-white truncate">{formatAddress((rbtInfoData as any).token_id)}</span>
                      </Tooltip>
                      <CopyButton text={(rbtInfoData as any).token_id} size="sm" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">Owner</p>
                    <div className="flex items-center gap-1.5">
                      <Tooltip content={(rbtInfoData as any).owner_did} position="top">
                        <span className="text-sm font-mono text-secondary-700 dark:text-secondary-300 truncate">{formatAddress((rbtInfoData as any).owner_did)}</span>
                      </Tooltip>
                      <CopyButton text={(rbtInfoData as any).owner_did} size="sm" />
                    </div>
                  </div>
                  <div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">Creator DID</p>
                    <div className="flex items-center gap-1.5">
                      <Tooltip content={(ftInfoData as any).creator_did} position="top">
                        <span className="text-sm font-mono text-secondary-700 dark:text-secondary-300 truncate">{formatAddress((ftInfoData as any).creator_did)}</span>
                      </Tooltip>
                      <CopyButton text={(ftInfoData as any).creator_did} size="sm" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">FT Value</p>
                    <span className="text-sm font-semibold text-secondary-900 dark:text-white">{(ftInfoData as any).ft_value ?? "—"}</span>
                  </div>
                  <div>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">Total Amount</p>
                    <span className="text-sm font-semibold text-secondary-900 dark:text-white">
                      {typeof (ftInfoData as any).total_amount === "number" ? (ftInfoData as any).total_amount.toLocaleString() : "—"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">Created</p>
                    <span className="text-sm font-semibold text-secondary-900 dark:text-white">{formatEpoch((ftInfoData as any).created_time)}</span>
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
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Owner</p>
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
              totalItems={rbtData?.count || rbtTokens.length || 0}
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
              totalItems={ftData?.count || 0}
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
  onTransactionClick: (transactionId: string) => void;
}> = ({ currentPage, itemsPerPage, onPageChange, onTransactionClick }) => {
  const paramsTxn = { page: currentPage, limit: itemsPerPage };

  const { data, isLoading, error } = useSCTxns(paramsTxn) as any 

  // Calculate total pages from API response — handle both flat array and wrapped response
  const scBlocks = Array.isArray(data) ? data : (data?.sc_blocks || []);
  const totalPages = Math.ceil((data?.count || scBlocks.length || 0) / itemsPerPage);

const formatAddress = (address: string, length: number = 14): string => {
  if (!address || address === "N/A") return address;
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};
  const isMobile = useIsMobile();
  return (
    <div className="w-full">
      {/* Mobile: vertical card list */}
      {isMobile ? (
        <div className="space-y-3">
          {scBlocks.map((tx: any, index: any) => (
            <motion.div
              key={tx.block_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onTransactionClick(tx.block_id)}
              className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 p-4 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors space-y-2"
            >
              <div>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Block ID</p>
                <div className="flex items-center gap-1.5">
                  <Tooltip content={tx.block_id} position="top">
                    <span className="text-sm font-medium text-secondary-900 dark:text-white font-mono truncate">{formatAddress(tx.block_id)}</span>
                  </Tooltip>
                </div>
              </div>
              <div>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Contract ID</p>
                <div className="flex items-center gap-1.5">
                  <Tooltip content={tx.contract_id} position="top">
                    <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate">{formatAddress(tx.contract_id)}</span>
                  </Tooltip>
                  <CopyButton text={tx.contract_id} size="sm" />
                </div>
              </div>
              <div>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Deployer</p>
                <div className="flex items-center gap-1.5">
                  <Tooltip content={tx.owner_did} position="top">
                    <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate">{tx.owner_did && tx.owner_did !== "N/A" ? formatAddress(tx.owner_did) : "N/A"}</span>
                  </Tooltip>
                  {tx.owner_did && tx.owner_did !== "N/A" && <CopyButton text={tx.owner_did} size="sm" />}
                </div>
              </div>
              <div>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Executor</p>
                <div className="flex items-center gap-1.5">
                  <Tooltip content={tx.executor_did} position="top">
                    <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate">{tx.executor_did && tx.executor_did !== "N/A" ? formatAddress(tx.executor_did) : "N/A"}</span>
                  </Tooltip>
                  {tx.executor_did && tx.executor_did !== "N/A" && <CopyButton text={tx.executor_did} size="sm" />}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
      <div className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 overflow-hidden">
        {/* Desktop table */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Table Header */}
            <div className="border-b border-outline-200 dark:border-outline-700">
              <div className="flex px-4 md:px-6 py-3 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider gap-3 md:gap-4 bg-secondary-50 dark:bg-secondary-800">
                <div className="flex-1 min-w-[200px]">Block Id</div>
                <div className="flex-1 min-w-[200px]">Contract Id</div>
                <div className="flex-1 min-w-[200px]">Deployer</div>
                <div className="flex-1 min-w-[200px]">Executor</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-outline-200 dark:divide-outline-700">
              {scBlocks.map((tx: any, index: any) => (
                <motion.div
                  key={tx.block_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onTransactionClick(tx.block_id)}
                  className="flex px-4 md:px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer gap-3 md:gap-4"
                >
                  {/* Serial Number Column */}
                  {/* <div className="w-16 md:w-20 flex-shrink-0 flex items-center">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 dark:text-primary-400 text-xs font-semibold">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </span>
                    </div>
                  </div> */}

                  {/* Block Id Column - Flexible */}
                  <div className="flex-1 min-w-[200px] flex items-center">
                    <Tooltip content={tx.block_id} position="top">
                      <div className="text-sm font-medium text-secondary-900 dark:text-white cursor-pointer truncate">
                        {formatAddress(tx.block_id)}
                      </div>
                    </Tooltip>
                  </div>

                  {/* Contract Id Column - Flexible */}
                  <div className="flex-1 min-w-[200px] flex items-center">
                    <div className="flex items-center gap-1.5 w-full min-w-0">
                      <Tooltip content={tx.contract_id} position="top">
                        <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 cursor-pointer truncate">
                          {formatAddress(tx.contract_id)}
                        </span>
                      </Tooltip>
                      <div className="flex-shrink-0">
                        <CopyButton text={tx.contract_id} size="sm" />
                      </div>
                    </div>
                  </div>

                  {/* Deployer Column - Flexible */}
                  <div className="flex-1 min-w-[200px] flex items-center">
                    {tx.owner_did && tx.owner_did !== "N/A" ? (
                      <div className="flex items-center gap-1.5 w-full min-w-0">
                        <Tooltip content={tx.owner_did} position="top">
                          <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 cursor-pointer truncate">
                            {formatAddress(tx.owner_did)}
                          </span>
                        </Tooltip>
                        <div className="flex-shrink-0">
                          <CopyButton text={tx.owner_did} size="sm" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400">
                        N/A
                      </span>
                    )}
                  </div>

                  {/* Executor Column - Flexible */}
                  <div className="flex-1 min-w-[200px] flex items-center">
                    {tx.executor_did && tx.executor_did !== "N/A" ? (
                      <div className="flex items-center gap-1.5 w-full min-w-0">
                        <Tooltip content={tx.executor_did} position="top">
                          <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 cursor-pointer truncate">
                            {formatAddress(tx.executor_did)}
                          </span>
                        </Tooltip>
                        <div className="flex-shrink-0">
                          <CopyButton text={tx.executor_did} size="sm" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400">
                        N/A
                      </span>
                    )}
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
        totalItems={data?.count || 0}
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
  const isMobile = useIsMobile();


const formatAddress = (
  address: string,
  desktopLength = 20,
  mobileLength = 8
): string => {
  if (!address || address === "N/A") return address;

  const length = isMobile ? mobileLength : desktopLength;
  if (address.length <= length * 2) return address;

  return `${address.slice(0, length)}...${address.slice(-length)}`;
};



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

  //have to create another route for this
  const handleSCTransactionClick = (transactionId: string) => {
    navigate(
      `/sc-transaction-explorer?tx=${encodeURIComponent(transactionId)}`
    );
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
            onTransactionClick={handleSCTransactionClick} // need to add the page for the burnt block and sc block
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
      <div className="p-6 w-full">
        {/* Header with Tab Switcher */}
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
              Rubix Explorer
            </h2>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
              {`Viewing ${activeTab} data`}
            </p>
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
