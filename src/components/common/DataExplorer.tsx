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
  useBurntTxn,
  useSCTxns,
  useTransactions,
} from "@/hooks/useTransactions";
import { useDIDs } from "@/hooks/useDIDs";
import { useTokens } from "@/hooks/useTokens";

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
const formatAddress = (address: string, length: number = 6): string => {
  if (address == null) return "N/A";
  if (address == "") return "N/A";
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

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
  const [transactions, setTransactions] = useState<any[]>([]);
  const paramsTxn = { page: currentPage, limit: itemsPerPage };

  // Fetch transactions for current page
  const { data, isLoading, error } = useTransactions(paramsTxn);

  useEffect(() => {
    if (data?.data) {
      setTransactions(data.data);
    }
  }, [data]);

  // Compute total pages from totalCount returned by API
  const totalPages = Math.ceil((data?.data.count || 0) / itemsPerPage);

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700">
        {/* Mobile Table View */}
        <div className="block lg:hidden overflow-x-auto">
          <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
            <div className="flex px-6 py-4 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider min-w-[1100px] gap-6">
              <div className="w-56 flex-shrink-0">Transaction</div>
              <div className="w-24 flex-shrink-0">Type</div>
              <div className="w-56 flex-shrink-0">From</div>
              <div className="w-56 flex-shrink-0">To</div>
              <div className="w-36 flex-shrink-0 text-right">Value</div>
            </div>
          </div>
          <div className="divide-y divide-outline-200 dark:divide-outline-700">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onTransactionClick(tx.id)}
                className="flex px-6 py-5 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer min-w-[1100px] gap-6"
              >
                <div className="w-56 flex-shrink-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 text-xs font-semibold">
                        {tx.type.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Tooltip content={tx.id} position="top">
                          <div className="text-sm font-medium text-secondary-900 dark:text-white cursor-pointer truncate">
                            {formatAddress(tx.id, 8)}
                          </div>
                        </Tooltip>
                        <CopyButton text={tx.id} size="sm" />
                      </div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                        {tx.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-24 flex-shrink-0 flex items-center">
                  <span className="text-sm text-secondary-900 dark:text-white">
                    {tx.type}
                  </span>
                </div>
                <div className="w-56 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <Tooltip content={tx.from} position="top">
                      <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 cursor-pointer truncate">
                        {formatAddress(tx.from, 8)}
                      </span>
                    </Tooltip>
                    <CopyButton text={tx.from} size="sm" />
                  </div>
                </div>
                <div className="w-56 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <Tooltip content={tx.to} position="top">
                      <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 cursor-pointer truncate">
                        {formatAddress(tx.to, 8)}
                      </span>
                    </Tooltip>
                    <CopyButton text={tx.to} size="sm" />
                  </div>
                </div>
                <div className="w-28 flex-shrink-0 flex items-center">
                  <span
                    className={`inline-flex px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap ${
                      tx.status === "confirmed"
                        ? "bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200"
                        : "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
                <div className="w-36 flex-shrink-0 text-right flex items-center justify-end">
                  <div className="text-sm font-semibold text-secondary-900 dark:text-white">
                    {tx.value}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
              <div className="col-span-3">Transaction</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-3">From</div>
              <div className="col-span-2">To</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Value</div>
            </div>
          </div>
          <div className="divide-y divide-outline-200 dark:divide-outline-700">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onTransactionClick(tx.id)}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer"
              >
                <div className="col-span-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 text-xs font-semibold">
                        {tx.type.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Tooltip content={tx.id} position="top">
                          <div className="text-sm font-medium text-secondary-900 dark:text-white cursor-pointer">
                            {formatAddress(tx.id, 8)}
                          </div>
                        </Tooltip>
                        <CopyButton text={tx.id} size="sm" />
                      </div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400">
                        {tx.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-secondary-900 dark:text-white">
                    {tx.type}
                  </span>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center space-x-2">
                    <Tooltip content={tx.from} position="top">
                      <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 cursor-pointer">
                        {formatAddress(tx.from, 8)}
                      </span>
                    </Tooltip>
                    <CopyButton text={tx.from} size="sm" />
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <Tooltip content={tx.to} position="top">
                      <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 cursor-pointer">
                        {formatAddress(tx.to, 8)}
                      </span>
                    </Tooltip>
                    <CopyButton text={tx.to} size="sm" />
                  </div>
                </div>
                <div className="col-span-1">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      tx.status === "confirmed"
                        ? "bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200"
                        : "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <div className="text-sm font-semibold text-secondary-900 dark:text-white">
                    {tx.value}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={data?.data.count || 0}
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
  const paramsTxn = { page: currentPage, limit: itemsPerPage };

  const { data, isLoading, error } = useDIDs(paramsTxn);
  const [holders, setHolders] = useState<any[]>([]);

  // ✅ Move totalPages outside useEffect and add optional chaining
  const totalPages = Math.ceil((data?.holders_response?.count || 0) / itemsPerPage);

  useEffect(() => {
    if (data?.holders_response?.holders_response) { // ✅ Add optional chaining
      setHolders(data.holders_response.holders_response);
    } else {
      setHolders([]);
    }
  }, [data]);

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700">
        {/* Mobile Table View */}
        <div className="block lg:hidden overflow-x-auto">
          {/* Table Header */}
          <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
            <div className="flex px-6 py-4 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider min-w-[800px] gap-6">
              <div className="w-64 flex-shrink-0">Address</div>
              <div className="w-32 flex-shrink-0">Token Count</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-outline-200 dark:divide-outline-700">
            {holders.map((holder, index) => (
              <motion.div
                key={holder.owner_did}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onHolderClick(holder.owner_did)}
                className="flex px-6 py-5 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer min-w-[800px] gap-6"
              >
                <div className="w-64 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <Tooltip content={holder.owner_did} position="top">
                      <div className="text-sm font-medium text-secondary-900 dark:text-white font-mono cursor-pointer truncate">
                        {formatAddress(holder.owner_did, 8)}
                      </div>
                    </Tooltip>
                    <CopyButton text={holder.owner_did} size="sm" />
                  </div>
                </div>
                <div className="w-32 flex-shrink-0 flex items-center">
                  <div className="text-sm font-semibold text-secondary-900 dark:text-white">
                    {holder.token_count}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
            <div className="grid grid-cols-6 gap-4 px-6 py-3 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
              <div className="col-span-4">Address</div>
              <div className="col-span-2">Token Count</div>
            </div>
          </div>

          <div className="divide-y divide-outline-200 dark:divide-outline-700">
            {holders.map((holder, index) => (
              <motion.div
                key={holder.owner_did}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onHolderClick(holder.owner_did)}
                className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer"
              >
                <div className="col-span-4">
                  <div className="flex items-center space-x-2">
                    <Tooltip content={holder.owner_did} position="top">
                      <div className="text-sm font-medium text-secondary-900 dark:text-white font-mono cursor-pointer truncate">
                        {formatAddress(holder.owner_did, 8)}
                      </div>
                    </Tooltip>
                    <CopyButton text={holder.owner_did} size="sm" />
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm font-semibold text-secondary-900 dark:text-white">
                    {holder.token_count}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination - ✅ Fixed to use calculated totalPages */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages || 1} // ✅ Use calculated totalPages with fallback
        onPageChange={onPageChange}
        totalItems={data?.holders_response?.count || 0} // ✅ Add optional chaining
        itemsPerPage={itemsPerPage}
        className="mt-6"
      />
    </div>
  );
};


const TokensListView: React.FC<{
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onTokenClick: (tokenId: string) => void;
}> = ({ currentPage, itemsPerPage, onPageChange, onTokenClick }) => {
  const params = { page: currentPage, limit: itemsPerPage };
  const { data, isLoading, error } = useTokens(params);

  // State for total pages
  const [totalPages, setTotalPages] = React.useState(0);

  // Update total pages when data changes
  useEffect(() => {
    if (data?.count) {
      setTotalPages(Math.ceil(data.count / itemsPerPage));
    } else {
      setTotalPages(0);
    }
  }, [data, itemsPerPage]);

  if (isLoading) return <div>Loading tokens...</div>;
  if (error) return <div>Error loading tokens</div>;

  const tokens = data?.tokens || [];

  if (!tokens.length) {
    return <div>No tokens available.</div>;
  }

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700">
        {/* Mobile Table */}
        <div className="block lg:hidden overflow-x-auto">
          <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
            <div className="flex px-6 py-4 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider min-w-[800px] gap-6">
              <div className="w-64 flex-shrink-0">Token</div>
              <div className="w-24 flex-shrink-0">Type</div>
              <div className="w-24 flex-shrink-0">Symbol</div>
              <div className="w-32 flex-shrink-0">Value in RBT</div>
            </div>
          </div>

          <div className="divide-y divide-outline-200 dark:divide-outline-700">
            {tokens.map((token: any, index: number) => (
              <motion.div
                key={token.rbt_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onTokenClick(token.token_id)}
                className="flex px-6 py-5 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer min-w-[800px] gap-6"
              >
                <div className="w-64 flex-shrink-0">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                        {token.token_id}
                      </div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
                        {token.owner_did}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-24 flex-shrink-0 flex items-center">
                  <span className="text-sm font-medium text-secondary-900 dark:text-white">
                    {token.token_value}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
            <div className="grid grid-cols-10 gap-4 px-6 py-3 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
              <div className="col-span-4">Token</div>
              <div className="col-span-2">Value in Rbt</div>
              <div className="col-span-2">Owner</div>
            </div>
          </div>

          <div className="divide-y divide-outline-200 dark:divide-outline-700">
            {tokens.map((token: any, index: number) => (
              <motion.div
                key={token.rbt_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onTokenClick(token.token_id)}
                className="grid grid-cols-10 gap-4 px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer"
              >
                <div className="col-span-4">
                  <div className="text-sm font-medium text-secondary-900 dark:text-white">
                    {token.token_id}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm font-semibold text-secondary-900 dark:text-white">
                    {token.token_value} RBT
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-medium text-secondary-900 dark:text-white">
                    {token.owner_did}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={data.count}
          itemsPerPage={itemsPerPage}
          className="mt-6"
        />
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
  const { data, isLoading, error } = useSCTxns(paramsTxn);
  const [transactions, setTransactions] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  let paginatedTransactions = [];

  if (data) {
    paginatedTransactions = data!.sc_blocks.slice(startIndex, endIndex);
  }

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [data]);

  const totalPages = Math.ceil(mockTransactions.length / itemsPerPage);

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700">
        {/* Mobile Table View with Horizontal Scroll */}
        <div className="block lg:hidden overflow-x-auto">
          {/* Table Header */}
          <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
            <div className="flex px-6 py-4 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider min-w-[1100px] gap-6">
              <div className="w-56 flex-shrink-0">Block Id</div>
              <div className="w-56 flex-shrink-0">Contract Id</div>

              <div className="w-24 flex-shrink-0">Deployer</div>
              <div className="w-56 flex-shrink-0">Executor</div>
              {/* <div className="w-56 flex-shrink-0">Epoch</div> */}
              {/* <div className="w-36 flex-shrink-0 text-right">BlockHeight</div> */}
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-outline-200 dark:divide-outline-700">
            {paginatedTransactions.map((tx: any, index: any) => (
              <motion.div
                key={tx.block_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onTransactionClick(tx.block_id)}
                className="flex px-6 py-5 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer min-w-[1100px] gap-6"
              >
                <div className="w-56 flex-shrink-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      {/* <span className="text-primary-600 dark:text-primary-400 text-xs font-semibold">
                        {tx.type.charAt(0)}
                      </span> */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Tooltip content={tx.block_id} position="top">
                          <div className="text-sm font-medium text-secondary-900 dark:text-white cursor-pointer truncate">
                            {formatAddress(tx.block_id, 8)}
                          </div>
                        </Tooltip>
                        <CopyButton text={tx.block_id} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-56 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <Tooltip content={tx.owner_did} position="top">
                      <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 cursor-pointer truncate">
                        {formatAddress(tx.owner_did, 8)}
                      </span>
                    </Tooltip>
                    <CopyButton text={tx.owner_did} size="sm" />
                  </div>
                </div>
                <div className="w-56 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <Tooltip content={tx.executor_did} position="top">
                      <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 cursor-pointer truncate">
                        {formatAddress(tx.executor_did, 8)}
                      </span>
                    </Tooltip>
                    <CopyButton text={tx.executor_did} size="sm" />
                  </div>
                </div>
                {/* <div className="w-28 flex-shrink-0 flex items-center">
                  <span
                    className={`inline-flex px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap ${
                      tx.status === "confirmed"
                        ? "bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200"
                        : "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                    }`}
                  >
                    {tx.status}
                  </span>
                </div> */}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          {/* Table Header */}
          <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
              <div className="col-span-3">Block Id</div>
              <div className="col-span-3">Contract Id</div>
              <div className="col-span-3">Deployer</div>
              <div className="col-span-2">Executor</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-outline-200 dark:divide-outline-700">
            {paginatedTransactions.map((tx: any, index: number) => (
              <motion.div
                key={tx.block_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onTransactionClick(tx.block_id)}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer"
              >
                {/* Block Id */}
                <div className="col-span-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      {/* Optional: <span className="text-primary-600 dark:text-primary-400 text-xs font-semibold">{tx.type.charAt(0)}</span> */}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Tooltip content={tx.block_id} position="top">
                          <div className="text-sm font-medium text-secondary-900 dark:text-white cursor-pointer">
                            {formatAddress(tx.block_id, 8)}
                          </div>
                        </Tooltip>
                        <CopyButton text={tx.block_id} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contract Id */}
                <div className="col-span-3">
                  <div className="flex items-center space-x-2">
                    <Tooltip content={tx.contract_id} position="top">
                      <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 cursor-pointer">
                        {formatAddress(tx.contract_id, 8)}
                      </span>
                    </Tooltip>
                    <CopyButton text={tx.contract_id} size="sm" />
                  </div>
                </div>

                {/* Deployer (from) */}
                <div className="col-span-3">
                  <div className="flex items-center space-x-2">
                    <Tooltip content={tx.owner_did} position="top">
                      <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 cursor-pointer">
                        {formatAddress(tx.owner_did, 8)}
                      </span>
                    </Tooltip>
                    <CopyButton text={tx.owner_did} size="sm" />
                  </div>
                </div>

                {/* Executor (to) */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <Tooltip content={tx.executor_did} position="top">
                      <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 cursor-pointer">
                        {formatAddress(tx.executor_did, 8)}
                      </span>
                    </Tooltip>
                    <CopyButton text={tx.executor_did} size="sm" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={mockTransactions.length}
        itemsPerPage={itemsPerPage}
        className="mt-6"
      />
    </div>
  );
};

interface BurntBlockListProps {
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onTransactionClick: (transactionId: string) => void;
}

const BurntBlockList: React.FC<BurntBlockListProps> = ({
  currentPage,
  itemsPerPage,
  onPageChange,
  onTransactionClick,
}) => {
  const paramsTxn = { page: currentPage, limit: itemsPerPage };
  const { data, isLoading, error } = useBurntTxn(paramsTxn);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Update transactions when API data changes
  useEffect(() => {
    if (data?.burntblocks) {
      setTransactions(data.burntblocks);
    }
  }, [data]);

  const epochToGMT = (epoch: number): string => {
  if (epoch < 1e12) epoch *= 1000; // convert seconds → milliseconds
  const date = new Date(epoch);
  return date.toUTCString();
};

const timeAgo = (epoch: number): string => {
  if (epoch < 1e12) epoch *= 1000; // convert seconds → ms
  const now = Date.now();
  const diff = Math.floor((now - epoch) / 1000); // in seconds

  const units = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const unit of units) {
    const value = Math.floor(diff / unit.seconds);
    if (value >= 1) {
      return `${value} ${unit.label}${value > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
};


  // Compute total pages from backend totalCount
  const totalPages = Math.ceil((data?.count || 1) / itemsPerPage);

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700">
        {/* Mobile Table View */}
        <div className="block lg:hidden overflow-x-auto">
          {/* Table Header */}
          <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
            <div className="flex px-6 py-4 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider min-w-[1100px] gap-6">
              <div className="w-56 flex-shrink-0">Block Hash</div>
              <div className="w-56 flex-shrink-0">Owner DID</div>
              <div className="w-24 flex-shrink-0">Epoch</div>
              <div className="w-24 flex-shrink-0">Burnt Token</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-outline-200 dark:divide-outline-700">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.block_hash}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onTransactionClick(tx.block_hash)}
                className="flex px-6 py-5 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer min-w-[1100px] gap-6"
              >
                <div className="w-56 flex-shrink-0">
                  <Tooltip content={tx.block_hash} position="top">
                    <div className="text-sm font-medium text-secondary-900 dark:text-white cursor-pointer truncate">
                      {formatAddress(tx.block_hash, 8)}
                    </div>
                  </Tooltip>
                  <CopyButton text={tx.block_hash} size="sm" />
                </div>

                <div className="w-56 flex-shrink-0">
                  <Tooltip content={tx.owner_did} position="top">
                    <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 cursor-pointer truncate">
                      {formatAddress(tx.owner_did, 8)}
                    </span>
                  </Tooltip>
                  <CopyButton text={tx.owner_did} size="sm" />
                </div>

                <div className="w-56 flex-shrink-0">
                  <Tooltip content={tx.epoch} position="top">
                    <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 cursor-pointer truncate">
                      {timeAgo(tx.epoch)}
                    </span>
                  </Tooltip>
                </div>

                <div className="w-56 flex-shrink-0">
                  <Tooltip
                    content={tx.tokens ? Object.keys(tx.tokens).toString() : "N/A"}
                    position="top"
                  >
                    <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 cursor-pointer truncate">
                      {tx.tokens
                        ? formatAddress(Object.keys(tx.tokens).toLocaleString(), 8)
                        : "N/A"}
                    </span>
                  </Tooltip>
                  <CopyButton
                    text={tx.tokens ? Object.keys(tx.tokens).toLocaleString() : "N/A"}
                    size="sm"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
              <div className="col-span-3">Block Hash</div>
              <div className="col-span-3">Owner DID</div>
              <div className="col-span-3">Epoch</div>
              <div className="col-span-3">Burnt Token</div>
            </div>
          </div>

          <div className="divide-y divide-outline-200 dark:divide-outline-700">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.block_hash}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onTransactionClick(tx.block_hash)}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer"
              >
                <div className="col-span-3">
                  <Tooltip content={tx.block_hash} position="top">
                    <div className="text-sm font-medium text-secondary-900 dark:text-white cursor-pointer truncate">
                      {formatAddress(tx.block_hash, 8)}
                    </div>
                  </Tooltip>
                  <CopyButton text={tx.block_hash} size="sm" />
                </div>

                <div className="col-span-3">
                  <Tooltip content={tx.owner_did} position="top">
                    <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 cursor-pointer truncate">
                      {formatAddress(tx.owner_did, 8)}
                    </span>
                  </Tooltip>
                  <CopyButton text={tx.owner_did} size="sm" />
                </div>

                <div className="col-span-3">
                  <Tooltip content={tx.epoch} position="top">
                    <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 cursor-pointer truncate">
                     {timeAgo(tx.epoch)}
                    </span>
                  </Tooltip>
                </div>

                <div className="col-span-3">
                  <Tooltip
                    content={tx.tokens ? Object.keys(tx.tokens).toString() : "N/A"}
                    position="top"
                  >
                    <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400 cursor-pointer truncate">
                      {tx.tokens
                        ? formatAddress(Object.keys(tx.tokens).toLocaleString(), 8)
                        : "N/A"}
                    </span>
                  </Tooltip>
                  <CopyButton
                    text={tx.tokens ? Object.keys(tx.tokens).toLocaleString() : "N/A"}
                    size="sm"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

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

  const handleBurntTransactionClick = (transactionId: string) => {
    navigate(
      `/burnt-transaction-explorer?tx=${encodeURIComponent(transactionId)}`
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
      case "burntblocks":
        return (
          <BurntBlockList
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onTransactionClick={handleBurntTransactionClick}
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
          {/* Mobile Layout: Title and Description first, then Dropdown */}
          <div className="block sm:hidden mb-4">
            <div className="mb-4">
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
            <div className="relative w-full" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 text-secondary-900 dark:text-white font-semibold py-3 px-6 pr-10 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 w-full"
              >
                <span className="capitalize">{viewMode}</span>
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
                className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 text-secondary-900 dark:text-white font-semibold py-3 px-6 pr-10 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 min-w-[160px]"
              >
                <span className="capitalize">{viewMode}</span>
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
                    className="absolute top-full left-0 mt-1 w-full min-w-[160px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                  >
                    {[
                      { value: "list", label: "List" },
                      { value: "graph", label: "Graph" },
                      { value: "quorums", label: "Quorums" },
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
