import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { CopyButton } from '@/components/ui/CopyButton';
import { Tooltip } from '@/components/ui/Tooltip';
import { TabSwitcher, TabType } from './TabSwitcher';
import { TransactionsGraph } from '@/components/charts/TransactionsGraph';
import { RecentActivityTable } from './RecentActivityTable';
import { useTransactions } from '@/hooks/useTransactions';
import { useDIDs } from '@/hooks/useDIDs';
import { useTokens } from '@/hooks/useTokens';

interface DataExplorerProps {
  className?: string;
}

const formatAddress = (address: string, length: number = 6): string => {
  if (address == null) return "";
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

const mockTransactions = [
  {
    id: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    type: 'Transfer',
    from: '0xabcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    to: '0xijkl1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    value: '1,250.50 RBT',
    timestamp: '2 minutes ago',
    status: 'confirmed'
  },
  {
    id: '0x2345678901bcdef012345678901bcdef012345678901bcdef012345678901bcdef0',
    type: 'Mint',
    from: '0xqrst1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    to: '0xyzaa1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    value: '500.00 RBT',
    timestamp: '5 minutes ago',
    status: 'confirmed'
  },
  {
    id: '0x3456789012cdef0123456789012cdef0123456789012cdef0123456789012cdef01',
    type: 'Burn',
    from: '0xdddd1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    to: '0xffff1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    value: '750.25 RBT',
    timestamp: '8 minutes ago',
    status: 'pending'
  },
  {
    id: '0x4567890123def01234567890123def01234567890123def01234567890123def0123',
    type: 'Transfer',
    from: '0xaaaa1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    to: '0xcccc1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    value: '2,100.75 RBT',
    timestamp: '12 minutes ago',
    status: 'confirmed'
  },
  {
    id: '0x5678901234ef012345678901234ef012345678901234ef012345678901234ef01234',
    type: 'Mint',
    from: '0xeeee1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    to: '0xgggg1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    value: '850.00 RBT',
    timestamp: '15 minutes ago',
    status: 'confirmed'
  },
  {
    id: '0x6789012345f0123456789012345f0123456789012345f0123456789012345f012345',
    type: 'Burn',
    from: '0xiiii1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    to: '0xkkkk1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    value: '1,500.30 RBT',
    timestamp: '18 minutes ago',
    status: 'pending'
  },
  {
    id: '0x78901234560123456789012345601234567890123456012345678901234560123456',
    type: 'Transfer',
    from: '0xmmmm1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    to: '0xoooo1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    value: '3,200.45 RBT',
    timestamp: '22 minutes ago',
    status: 'confirmed'
  },
  {
    id: '0x89012345671234567890123456712345678901234567123456789012345671234567',
    type: 'Mint',
    from: '0xqqqq1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    to: '0xssss1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    value: '950.80 RBT',
    timestamp: '25 minutes ago',
    status: 'confirmed'
  },
  {
    id: '0x90123456782345678901234567823456789012345678234567890123456782345678',
    type: 'Burn',
    from: '0xuuuu1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    to: '0xwwww1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    value: '1,800.60 RBT',
    timestamp: '28 minutes ago',
    status: 'confirmed'
  },
  {
    id: '0x01234567893456789012345678934567890123456789345678901234567893456789',
    type: 'Transfer',
    from: '0xyyyy1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    to: '0x11111234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    value: '4,500.90 RBT',
    timestamp: '32 minutes ago',
    status: 'confirmed'
  },
  {
    id: '0x1234...5678',
    type: 'Mint',
    from: '0x3333...4444',
    to: '0x5555...6666',
    value: '1,100.25 RBT',
    timestamp: '35 minutes ago',
    status: 'pending'
  },
  {
    id: '0x2345...6789',
    type: 'Burn',
    from: '0x7777...8888',
    to: '0x9999...0000',
    value: '2,300.15 RBT',
    timestamp: '38 minutes ago',
    status: 'confirmed'
  },
  {
    id: '0x3456...7890',
    type: 'Transfer',
    from: '0xaaaa...bbbb',
    to: '0xcccc...dddd',
    value: '5,750.40 RBT',
    timestamp: '42 minutes ago',
    status: 'confirmed'
  },
  {
    id: '0x4567...8901',
    type: 'Mint',
    from: '0xeeee...ffff',
    to: '0xgggg...hhhh',
    value: '1,350.70 RBT',
    timestamp: '45 minutes ago',
    status: 'confirmed'
  },
  {
    id: '0x5678...9012',
    type: 'Burn',
    from: '0xiiii...jjjj',
    to: '0xkkkk...llll',
    value: '2,800.85 RBT',
    timestamp: '48 minutes ago',
    status: 'pending'
  },
  {
    id: '0x6789...0123',
    type: 'Transfer',
    from: '0xmmmm...nnnn',
    to: '0xoooo...pppp',
    value: '6,200.95 RBT',
    timestamp: '52 minutes ago',
    status: 'confirmed'
  },
  {
    id: '0x7890...1234',
    type: 'Mint',
    from: '0xqqqq...rrrr',
    to: '0xssss...tttt',
    value: '1,650.35 RBT',
    timestamp: '55 minutes ago',
    status: 'confirmed'
  },
  {
    id: '0x8901...2345',
    type: 'Burn',
    from: '0xuuuu...vvvv',
    to: '0xwwww...xxxx',
    value: '3,100.50 RBT',
    timestamp: '58 minutes ago',
    status: 'confirmed'
  },
  {
    id: '0x9012...3456',
    type: 'Transfer',
    from: '0xyyyy...zzzz',
    to: '0x1111...2222',
    value: '7,500.25 RBT',
    timestamp: '1 hour ago',
    status: 'confirmed'
  },
  {
    id: '0x0123...4567',
    type: 'Mint',
    from: '0x3333...4444',
    to: '0x5555...6666',
    value: '2,200.80 RBT',
    timestamp: '1 hour 5 minutes ago',
    status: 'pending'
  }
];


const mockHolders = [
  {
    address: '0x11111234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 15,
    percentage: '12.5%',
    rank: 1,
    transactions: 1247
  },
  {
    address: '0x33331234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 8,
    percentage: '7.3%',
    rank: 2,
    transactions: 892
  },
  {
    address: '0x55551234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 5,
    percentage: '4.6%',
    rank: 3,
    transactions: 634
  },
  {
    address: '0x77771234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 4,
    percentage: '3.4%',
    rank: 4,
    transactions: 521
  },
  {
    address: '0x99991234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 3,
    percentage: '3.1%',
    rank: 5,
    transactions: 478
  },
  {
    address: '0xaaaa1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 3,
    percentage: '2.6%',
    rank: 6,
    transactions: 412
  },
  {
    address: '0xcccc1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 2,
    percentage: '2.4%',
    rank: 7,
    transactions: 389
  },
  {
    address: '0xeeee1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 2,
    percentage: '2.2%',
    rank: 8,
    transactions: 356
  },
  {
    address: '0xgggg1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 2,
    percentage: '2.0%',
    rank: 9,
    transactions: 323
  },
  {
    address: '0xiiii1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 2,
    percentage: '1.8%',
    rank: 10,
    transactions: 290
  },
  {
    address: '0xkkkk1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 1,
    percentage: '1.6%',
    rank: 11,
    transactions: 267
  },
  {
    address: '0xmmmm1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 1,
    percentage: '1.5%',
    rank: 12,
    transactions: 244
  },
  {
    address: '0xoooo1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 1,
    percentage: '1.4%',
    rank: 13,
    transactions: 221
  },
  {
    address: '0xqqqq1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 1,
    percentage: '1.2%',
    rank: 14,
    transactions: 198
  },
  {
    address: '0xssss1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 1,
    percentage: '1.1%',
    rank: 15,
    transactions: 175
  },
  {
    address: '0xuuuu1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 1,
    percentage: '1.0%',
    rank: 16,
    transactions: 152
  },
  {
    address: '0xwwww1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 1,
    percentage: '0.9%',
    rank: 17,
    transactions: 129
  },
  {
    address: '0xyyyy1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 1,
    percentage: '0.8%',
    rank: 18,
    transactions: 116
  },
  {
    address: '0x11111234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 1,
    percentage: '0.7%',
    rank: 19,
    transactions: 103
  },
  {
    address: '0x44441234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenCount: 1,
    percentage: '0.6%',
    rank: 20,
    transactions: 90
  }
];

const mockTokens = [
  {
    id: 'RBT-001',
    name: 'Rubix Token',
    symbol: 'RBT',
    valueInRBT: '1,250.50',
    type: 'RBT'
  },
  {
    id: 'FT-002',
    name: 'Custom Token',
    symbol: 'CTK',
    valueInRBT: '500.00',
    type: 'FT'
  },
  {
    id: 'NFT-003',
    name: 'Digital Art #1',
    symbol: 'ART',
    valueInRBT: '750.25',
    type: 'NFT'
  },
  {
    id: 'SC-004',
    name: 'Smart Contract V1',
    symbol: 'SCV1',
    valueInRBT: '2,100.75',
    type: 'SC'
  },
  {
    id: 'FT-005',
    name: 'Utility Token',
    symbol: 'UTK',
    valueInRBT: '850.00',
    type: 'FT'
  },
  {
    id: 'NFT-006',
    name: 'Collectible #1',
    symbol: 'COL1',
    valueInRBT: '1,500.30',
    type: 'NFT'
  },
  {
    id: 'RBT-007',
    name: 'Rubix Token V2',
    symbol: 'RBT2',
    valueInRBT: '3,200.45',
    type: 'RBT'
  },
  {
    id: 'FT-008',
    name: 'Governance Token',
    symbol: 'GOV',
    valueInRBT: '950.80',
    type: 'FT'
  },
  {
    id: 'NFT-009',
    name: 'Rare Artwork',
    symbol: 'RARE',
    valueInRBT: '1,800.60',
    type: 'NFT'
  },
  {
    id: 'SC-010',
    name: 'DeFi Protocol',
    symbol: 'DEFI',
    valueInRBT: '4,500.90',
    type: 'SC'
  },
  {
    id: 'FT-011',
    name: 'Staking Token',
    symbol: 'STAKE',
    valueInRBT: '1,100.25',
    type: 'FT'
  },
  {
    id: 'NFT-012',
    name: 'Gaming Asset',
    symbol: 'GAME',
    valueInRBT: '2,300.15',
    type: 'NFT'
  },
  {
    id: 'RBT-013',
    name: 'Rubix Token V3',
    symbol: 'RBT3',
    valueInRBT: '5,750.40',
    type: 'RBT'
  },
  {
    id: 'FT-014',
    name: 'Reward Token',
    symbol: 'REW',
    valueInRBT: '1,350.70',
    type: 'FT'
  },
  {
    id: 'NFT-015',
    name: 'Virtual Land',
    symbol: 'LAND',
    valueInRBT: '2,800.85',
    type: 'NFT'
  },
  {
    id: 'SC-016',
    name: 'NFT Marketplace',
    symbol: 'MARKET',
    valueInRBT: '6,200.95',
    type: 'SC'
  },
  {
    id: 'FT-017',
    name: 'Liquidity Token',
    symbol: 'LIQ',
    valueInRBT: '1,650.35',
    type: 'FT'
  },
  {
    id: 'NFT-018',
    name: 'Music NFT',
    symbol: 'MUSIC',
    valueInRBT: '3,100.50',
    type: 'NFT'
  },
  {
    id: 'RBT-019',
    name: 'Rubix Token V4',
    symbol: 'RBT4',
    valueInRBT: '7,500.25',
    type: 'RBT'
  },
  {
    id: 'FT-020',
    name: 'Community Token',
    symbol: 'COMM',
    valueInRBT: '2,200.80',
    type: 'FT'
  }
];

const mockQuorums = [
  {
    id: 'Q-001',
    name: 'Main Validator Quorum',
    validators: 15,
    threshold: 10,
    status: 'active',
    lastActivity: '2 minutes ago'
  },
  {
    id: 'Q-002',
    name: 'Backup Quorum',
    validators: 8,
    threshold: 6,
    status: 'standby',
    lastActivity: '1 hour ago'
  },
  {
    id: 'Q-003',
    name: 'Emergency Quorum',
    validators: 5,
    threshold: 3,
    status: 'inactive',
    lastActivity: '1 day ago'
  }
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

const TransactionsListView: React.FC<{
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onTransactionClick: (transactionId: string) => void;
}> = ({ currentPage, itemsPerPage, onPageChange, onTransactionClick }) => {
  
  const [transactions, setTransactions] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const paramsTxn = {"page" : currentPage, "limit" : itemsPerPage };
  const { data, isLoading, error } = useTransactions(paramsTxn);

  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage; 
  let paginatedTransactions = [];


  if (data){
   paginatedTransactions = (data!.data).slice(startIndex, endIndex);
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
              <div className="w-56 flex-shrink-0">Transaction</div>
              <div className="w-24 flex-shrink-0">Type</div>
              <div className="w-56 flex-shrink-0">From</div>
              <div className="w-56 flex-shrink-0">To</div>
              <div className="w-36 flex-shrink-0 text-right">Value</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-outline-200 dark:divide-outline-700">
            {paginatedTransactions.map((tx : any , index : any) => (
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
                  <span className={`inline-flex px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap ${tx.status === 'confirmed'
                    ? 'bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200'
                    : 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                    }`}>
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
          {/* Table Header */}
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

          {/* Table Body */}
          <div className="divide-y divide-outline-200 dark:divide-outline-700">
            {paginatedTransactions.map((tx : any, index : any ) => (
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
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${tx.status === 'confirmed'
                    ? 'bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200'
                    : 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                    }`}>
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
        totalItems={mockTransactions.length}
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
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(mockHolders.length / itemsPerPage);
  const [dids, setDids] = useState<any>([]);
  const {data, isLoading, error} = useDIDs();


    let paginatedHolders : any = [];
    if(data) {
    paginatedHolders = data.holders_response.slice(startIndex, endIndex);
    }
  

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700">
        {/* Mobile Table View with Horizontal Scroll */}
        <div className="block lg:hidden overflow-x-auto">
          {/* Table Header */}
          <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
            <div className="flex px-6 py-4 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider min-w-[800px] gap-6">
              {/* <div className="w-16 flex-shrink-0">Rank</div> */}
              <div className="w-64 flex-shrink-0">Address</div>
              <div className="w-32 flex-shrink-0">Token Count</div>
   
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-outline-200 dark:divide-outline-700">
            {paginatedHolders.map((holder :any , index : any) => (
              <motion.div
                key={holder.owner_did}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onHolderClick(holder.owner_did)}
                className="flex px-6 py-5 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer min-w-[800px] gap-6"
              >
                {/* <div className="w-16 flex-shrink-0 flex items-center">
                  <span className="text-sm font-semibold text-secondary-900 dark:text-white">
                    #{holder.rank}
                  </span>
                </div> */}
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
                <div className="w-32 flex-shrink-0 flex items-center">
                  <div className="text-sm font-semibold text-secondary-900 dark:text-white">
                    {holder.tokenCount}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          {/* Table Header */}
          <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
            <div className="grid grid-cols-11 gap-4 px-6 py-3 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
              {/* <div className="col-span-1">Rank</div> */}
              <div className="col-span-4">Address</div>
              <div className="col-span-2">Token Count</div>
              {/* <div className="col-span-2">Percentage</div> */}
              {/* <div className="col-span-2">Transactions</div> */}
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-outline-200 dark:divide-outline-700">
            {paginatedHolders.map((holder : any, index : any) => (
              <motion.div
                key={holder.owner_did}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onHolderClick(holder.owner_did)}
                className="grid grid-cols-11 gap-4 px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer"
              >
                <div className="col-span-4">
                  <div className="flex items-center space-x-2">
                    <Tooltip content={holder.owner_did} position="top">
                      <div className="text-sm font-medium text-secondary-900 dark:text-white font-mono cursor-pointer">
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

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={mockHolders.length}
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
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(mockTokens.length / itemsPerPage);
  const {data, isLoading, error} = useTokens();
  let paginatedTokens : any = [];

  useEffect(() => {
  }, [data]);

  if(data){
     paginatedTokens = data.slice(startIndex, endIndex);

  }

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700">
        {/* Mobile Table View with Horizontal Scroll */}
        <div className="block lg:hidden overflow-x-auto">
          {/* Table Header */}
          <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
            <div className="flex px-6 py-4 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider min-w-[800px] gap-6">
              <div className="w-64 flex-shrink-0">Token</div>
              <div className="w-24 flex-shrink-0">Type</div>
              <div className="w-24 flex-shrink-0">Symbol</div>
              <div className="w-32 flex-shrink-0">Value in RBT</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-outline-200 dark:divide-outline-700">
            {paginatedTokens.map((token:any, index:any) => (
              <motion.div
                key={token.rbt_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onTokenClick(token.rbt_id)}
                className="flex px-6 py-5 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer min-w-[800px] gap-6"
              >
                <div className="w-64 flex-shrink-0">
                  <div className="flex items-center space-x-4">
                    {/* <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${token.type === 'RBT'
                      ? 'bg-primary-100 dark:bg-primary-900'
                      : token.type === 'FT'
                        ? 'bg-tertiary-100 dark:bg-tertiary-900'
                        : token.type === 'NFT'
                          ? 'bg-primary-100 dark:bg-primary-900'
                          : 'bg-primary-100 dark:bg-primary-900'
                      }`}>
                      <span className={`text-xs font-semibold ${token.type === 'RBT'
                        ? 'text-primary-600 dark:text-primary-400'
                        : token.type === 'FT'
                          ? 'text-tertiary-600 dark:text-tertiary-400'
                          : token.type === 'NFT'
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-primary-600 dark:text-primary-400'
                        }`}>
                        {token.type.charAt(0)}
                      </span>
                    </div> */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                        {token.rbt_id}
                      </div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
                        {token.owner_did}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-24 flex-shrink-0 flex items-center">
                  {/* <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${token.type === 'RBT'
                    ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                    : token.type === 'FT'
                      ? 'bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200'
                      : token.type === 'NFT'
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                        : 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                    }`}>
                    {token.type}
                  </span> */}
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

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          {/* Table Header */}
          <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
            <div className="grid grid-cols-10 gap-4 px-6 py-3 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
              <div className="col-span-4">Token</div>
              <div className="col-span-2">Value in Rbt</div>
              <div className="col-span-2">Owner</div>
              
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-outline-200 dark:divide-outline-700">
            {paginatedTokens.map((token:any, index:any) => (
              <motion.div
                key={token.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onTokenClick(token.id)}
                className="grid grid-cols-10 gap-4 px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer"
              >
                <div className="col-span-4">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="text-sm font-medium text-secondary-900 dark:text-white">
                        {token.rbt_id}
                      </div>
                    </div>
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
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={mockTokens.length}
        itemsPerPage={itemsPerPage}
        className="mt-6"
      />
    </div>
  );
};

const QuorumsListView: React.FC = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
      Validator Quorums
    </h3>
    <div className="space-y-3">
      {mockQuorums.map((quorum, index) => (
        <motion.div
          key={quorum.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400">
                {quorum.id}
              </span>
              <span className="font-semibold text-secondary-900 dark:text-white">
                {quorum.name}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${quorum.status === 'active'
                ? 'bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200'
                : quorum.status === 'standby'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                {quorum.status}
              </span>
            </div>
            <div className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
              {quorum.validators} validators • {quorum.threshold} threshold • {quorum.lastActivity}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export const DataExplorer: React.FC<DataExplorerProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('transactions');
  const [viewMode, setViewMode] = useState<'list' | 'graph' | 'quorums'>('list');
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

  const handleHolderClick = (holderAddress: string) => {
    navigate(`/did-explorer?did=${encodeURIComponent(holderAddress)}`);
  };

  const handleTokenClick = (tokenId: string) => {
    navigate(`/token-explorer?token=${encodeURIComponent(tokenId)}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderContent = () => {
    if (viewMode === 'graph') {
      return (
        <div className="w-full">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-secondary-900 dark:text-white mb-2">
              Value Settled (RBT) - {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View
            </h3>
            <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400">
              Economic activity visualization for the Rubix ecosystem
            </p>
          </div>
          <div className="w-full overflow-hidden">
            <TransactionsGraph className="w-full" />
          </div>
        </div>
      );
    }

    if (viewMode === 'quorums') {
      return <QuorumsListView />;
    }


    switch (activeTab) {
      case 'transactions':
        return (
          <TransactionsListView
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onTransactionClick={handleTransactionClick}
          />
        );
      case 'holders':
        return (
          <HoldersListView
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onHolderClick={handleHolderClick}
          />
        );
      case 'tokens':
        return (
          <TokensListView
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onTokenClick={handleTokenClick}
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
                {viewMode === 'list' && `Viewing ${activeTab} data`}
                {viewMode === 'graph' && `Chart view for ${activeTab}`}
                {viewMode === 'quorums' && `Validator quorums overview`}
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
                  className={`w-4 h-4 text-secondary-600 dark:text-secondary-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                      { value: 'list', label: 'List' },
                      { value: 'graph', label: 'Graph' },
                      { value: 'quorums', label: 'Quorums' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setViewMode(option.value as 'list' | 'graph' | 'quorums');
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-6 py-4 text-sm font-medium transition-colors duration-150 ${viewMode === option.value
                          ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                          : 'text-secondary-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
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
                {viewMode === 'list' && `Viewing ${activeTab} data`}
                {viewMode === 'graph' && `Chart view for ${activeTab}`}
                {viewMode === 'quorums' && `Validator quorums overview`}
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
                  className={`w-4 h-4 text-secondary-600 dark:text-secondary-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                      { value: 'list', label: 'List' },
                      { value: 'graph', label: 'Graph' },
                      { value: 'quorums', label: 'Quorums' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setViewMode(option.value as 'list' | 'graph' | 'quorums');
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-6 py-4 text-sm font-medium transition-colors duration-150 ${viewMode === option.value
                          ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                          : 'text-secondary-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
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
          {viewMode === 'list' && (
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
