import React, { useState, useRef, useEffect } from "react";
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
import { useDIDs, useFTHolders } from "@/hooks/useDIDs";
import { Search } from "lucide-react";
import { useTokens, useFTList } from "@/hooks/useTokens";
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
  const [ftPage, setFtPage] = useState(1);

  // RBT holders
  const paramsTxn = { page: currentPage, limit: itemsPerPage };
  const { data: rbtData } = useDIDs(paramsTxn) as any;
  const [holders, setHolders] = useState<any[]>([]);
  const rbtTotalPages = Math.ceil((rbtData?.holders_response?.count || 0) / itemsPerPage);

  useEffect(() => {
    if (rbtData?.holders_response?.holders_response) {
      setHolders(rbtData.holders_response.holders_response);
    } else {
      setHolders([]);
    }
  }, [rbtData]);

  // FT holders
  const { data: ftData, isLoading: ftLoading } = useFTHolders(
    { ft_name: activeFtName, page: ftPage, limit: itemsPerPage },
    holderType === "ft"
  ) as any;

  const ftHolders: any[] = ftData?.holders || ftData?.ft_holders || [];
  const ftTotalPages = Math.ceil((ftData?.count || 0) / itemsPerPage);

  const handleFtSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFtPage(1);
    setActiveFtName(ftSearchInput.trim());
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

      {/* FT name search bar */}
      {holderType === "ft" && (
        <form onSubmit={handleFtSearch} className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={ftSearchInput}
              onChange={(e) => setFtSearchInput(e.target.value)}
              placeholder="Search by FT name (e.g. mytoken_ft)..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
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
            {holders.filter((h) => h.owner_did !== '').map((holder, index) => (
              <motion.div
                key={holder.owner_did}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onHolderClick(holder.owner_did)}
                className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 p-4 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors space-y-2"
              >
                <div>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Address</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-secondary-900 dark:text-white font-mono truncate">{formatAddress(holder.owner_did)}</span>
                    <CopyButton text={holder.owner_did} size="sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Balance</p>
                  <span className="text-sm font-semibold text-secondary-900 dark:text-white">{holder.token_count}</span>
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
                  {holders.filter((h) => h.owner_did !== '').map((holder, index) => (
                    <motion.div
                      key={holder.owner_did}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onHolderClick(holder.owner_did)}
                      className="flex px-4 md:px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer gap-3 md:gap-6"
                    >
                      <div className="min-w-[180px] md:flex-1 md:min-w-[300px] flex items-center">
                        <div className="flex items-center gap-1.5 w-full min-w-0">
                          <div className="text-sm font-medium text-secondary-900 dark:text-white font-mono cursor-pointer truncate">{formatAddress(holder.owner_did)}</div>
                          <div className="flex-shrink-0"><CopyButton text={holder.owner_did} size="sm" /></div>
                        </div>
                      </div>
                      <div className="w-24 md:w-32 lg:w-40 flex-shrink-0 flex items-center justify-end">
                        <div className="text-sm font-semibold text-secondary-900 dark:text-white whitespace-nowrap">{holder.token_count}</div>
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
                key={holder.owner_did || holder.did || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onHolderClick(holder.owner_did || holder.did)}
                className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 p-4 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors space-y-2"
              >
                <div>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Address</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-secondary-900 dark:text-white font-mono truncate">{formatAddress(holder.owner_did || holder.did)}</span>
                    <CopyButton text={holder.owner_did || holder.did} size="sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">FT Balance</p>
                  <span className="text-sm font-semibold text-secondary-900 dark:text-white">{holder.ft_count ?? holder.balance ?? holder.token_count ?? "—"}</span>
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
                      key={holder.owner_did || holder.did || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onHolderClick(holder.owner_did || holder.did)}
                      className="flex px-4 md:px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer gap-3 md:gap-6"
                    >
                      <div className="min-w-[180px] md:flex-1 md:min-w-[300px] flex items-center">
                        <div className="flex items-center gap-1.5 w-full min-w-0">
                          <div className="text-sm font-medium text-secondary-900 dark:text-white font-mono cursor-pointer truncate">{formatAddress(holder.owner_did || holder.did)}</div>
                          <div className="flex-shrink-0"><CopyButton text={holder.owner_did || holder.did} size="sm" /></div>
                        </div>
                      </div>
                      <div className="w-32 md:w-40 flex-shrink-0 flex items-center justify-end">
                        <div className="text-sm font-semibold text-secondary-900 dark:text-white whitespace-nowrap">{holder.ft_count ?? holder.balance ?? holder.token_count ?? "—"}</div>
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

  // RBT tokens
  const rbtParams = { page: currentPage, limit: itemsPerPage };
  const { data: rbtData, isLoading: rbtLoading, error: rbtError } = useTokens(rbtParams) as any;
  const rbtTokens = rbtData?.tokens || [];
  const rbtTotalPages = Math.ceil((rbtData?.count || 0) / itemsPerPage);

  // FT list
  const ftParams = { page: ftPage, limit: itemsPerPage };
  const { data: ftData, isLoading: ftLoading } = useFTList(ftParams) as any;
  const ftTokens = ftData?.ft_list || ftData?.fts || ftData?.tokens || [];
  const ftTotalPages = Math.ceil((ftData?.count || 0) / itemsPerPage);

  if (tokenType === "rbt" && rbtLoading) return <div className="text-sm text-gray-500 py-4">Loading tokens...</div>;
  if (tokenType === "rbt" && rbtError) return <div className="text-sm text-red-500 py-4">Error loading tokens</div>;

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
                      <Tooltip content={token.owner_did} position="top">
                        <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate">{formatAddress(token.owner_did)}</span>
                      </Tooltip>
                      <CopyButton text={token.owner_did} size="sm" />
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
                            <Tooltip content={token.owner_did} position="top">
                              <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate">{formatAddress(token.owner_did)}</span>
                            </Tooltip>
                            <div className="flex-shrink-0"><CopyButton text={token.owner_did} size="sm" /></div>
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
              totalItems={rbtData?.count || 0}
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
                  key={ft.ft_name || ft.name || `ft-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 p-4 space-y-2"
                >
                  <div>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">FT Name</p>
                    <span className="text-sm font-medium text-secondary-900 dark:text-white font-mono">{ft.ft_name || ft.name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Minted</p>
                    <span className="text-sm font-semibold text-secondary-900 dark:text-white">
                      {typeof (ft.minted ?? ft.total_minted ?? ft.count) === "number"
                        ? (ft.minted ?? ft.total_minted ?? ft.count).toLocaleString()
                        : ft.minted ?? ft.total_minted ?? ft.count ?? "—"}
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
                        key={ft.ft_name || ft.name || `ft-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex px-4 md:px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors gap-3 md:gap-4"
                      >
                        <div className="flex-1 min-w-[200px] flex items-center">
                          <span className="text-sm font-medium text-secondary-900 dark:text-white font-mono">{ft.ft_name || ft.name || "—"}</span>
                        </div>
                        <div className="w-28 md:w-36 flex-shrink-0 flex items-center justify-end">
                          <span className="text-sm font-semibold text-secondary-900 dark:text-white whitespace-nowrap">
                            {typeof (ft.minted ?? ft.total_minted ?? ft.count) === "number"
                              ? (ft.minted ?? ft.total_minted ?? ft.count).toLocaleString()
                              : ft.minted ?? ft.total_minted ?? ft.count ?? "—"}
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

  // Calculate total pages from API response
  const scBlocks = data?.sc_blocks || [];
  const totalPages = Math.ceil((data?.count || 0) / itemsPerPage);

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
  const [activeTab, setActiveTab] = useState<TabType>("transactions");
  const [viewMode, setViewMode] = useState<"list">(
    "list"
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          {/* Mobile Layout: Title with Dropdown Icon on the right */}
          <div className="block sm:hidden mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
                  Rubix Explorer
                </h2>
                <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
                  {viewMode === "list" && `Viewing ${activeTab} data`}
                  {/* {viewMode === "graph" && `Chart view for ${activeTab}`}
                  {viewMode === "quorums" && `Validator quorums overview`} */}
                </p>
              </div>

              {/* View Mode Dropdown Icon */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-secondary-900 dark:text-white font-semibold p-2 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <svg
                    className={`w-4 h-4 text-secondary-600 dark:text-secondary-400 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-1 w-[160px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                    >
                      {[
                        { value: "list", label: "List" },
                        // { value: "graph", label: "Graph" },
                        // { value: "quorums", label: "Quorums" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setViewMode(
                              option.value as "list"
                            );
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-6 py-4 text-sm font-medium transition-colors duration-150 ${
                            viewMode === option.value
                              ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                              : "text-secondary-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Desktop Layout: Title/Description and Dropdown side by side */}
          <div className="hidden sm:flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
                Rubix Explorer
              </h2>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
                {viewMode === "list" && `Viewing ${activeTab} data`}
                {/* {viewMode === "graph" && `Chart view for ${activeTab}`}
                {viewMode === "quorums" && `Validator quorums overview`} */}
              </p>
            </div>

            {/* View Mode Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center sm:justify-between bg-gray-100 dark:bg-gray-800 text-secondary-900 dark:text-white font-semibold py-3 px-3 sm:px-6 sm:pr-10 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 sm:min-w-[160px]"
              >
                <span className="capitalize max-sm:hidden">{viewMode}</span>
                <svg
                  className={`w-5 h-5 sm:w-4 sm:h-4 text-secondary-600 dark:text-secondary-400 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 w-full min-w-[160px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                  >
                    {[
                      { value: "list", label: "List" },
                      // { value: "graph", label: "Graph" },
                      // { value: "quorums", label: "Quorums" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setViewMode(
                            option.value as "list"
                          );
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-6 py-4 text-sm font-medium transition-colors duration-150 ${
                          viewMode === option.value
                            ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                            : "text-secondary-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Tab Switcher - only show when in list mode */}
          {viewMode === "list" && (
            <TabSwitcher
              activeTab={activeTab}
              onTabChange={handleTabChange}
              showCounts={true}
            />
          )}
        </div>

        {/* Content */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${viewMode}`}
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
