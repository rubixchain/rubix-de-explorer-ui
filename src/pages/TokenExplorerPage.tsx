import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { CopyButton } from "@/components/ui/CopyButton";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  ArrowLeft,
  Coins,
  DollarSign,
  TrendingUp,
  Activity,
  PartyPopper,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Mock data for token information

interface TokenInfo {
  tokenId: string;
  type: "RBT" | "FT" | "SC" | "NFT" | "UNKNOWN";
  // RBT-specific
  id?: string;
  owner_did?: string;
  block_height?: string;
  token_value?: number;
  name?: string;
  symbol?: string;
  supply?: string;
  txn_id?: string;
  creator_did?: string;
  // …any common fields
}

// src/mock/tokenChain.ts
export interface TokenBlock {
  block_hash: string;
  owner_did: string;
  block_type: string;
  epoch: string;
}

export const mockTokenChain: TokenBlock[] = [
  {
    block_hash:
      "TCBlockHashKey_6c4b62ddb06a926c1f9812e260af10383bf8d07745208846092ea115e79ef70a",
    owner_did: "bafybmia5ty2ji23kmxefgz3zbkxkmekzu3o42ox7wpl577hhso44r67cta",
    block_type: "transfer",
    epoch: "172832",
  },
  {
    block_hash:
      "TCBlockHashKey_7a8d45a22b4a926c1f9812e260af10383bf8d07745208846092ea115e79ef71b",
    owner_did: "bafybmig77hou3amcyy3rdlwqj5qetll3yghc6m2c3hw4xut7dpabcrqsu",
    block_type: "mint",
    epoch: "172832",
  },
  {
    block_hash:
      "TCBlockHashKey_8d9a61c8a2c9b59a3f0f0912e260af10383bf8d07745208846092ea115e79ef7aa",
    owner_did: "bafybmia9lmz8y23kmxefgz3zbkxkmekzu3o42ox7wpl577hhso44r67cbx",
    block_type: "transfer",
    epoch: "172832",
  },
  {
    block_hash:
      "TCBlockHashKey_9f4c72ddb06a926c1f9812e260af10383bf8d07745208846092ea115e79ef72c",
    owner_did: "bafybmib77hou3amcyy3rdlwqj5qetll3yghc6m2c3hw4xut7dpabcrqsk",
    block_type: "burn",
    epoch: "172822",
  },
];

const MOCK_TOKEN_INFO = {
  name: "Rubix Token",
  symbol: "RBT",
  type: "RBT",
  supply: "1,000,000",
  holders: 1250,
  owner: "0x1111...2222",
  deployer: "0x3333...4444",
  blockHeight: 1234567,
  deployDate: "2023-01-15",
  lastActivity: "2 hours ago",
  totalValue: "$1,250,000",
  price: "$1.25",
  marketCap: "$1,250,000",
};

// Mock data for token transactions
const MOCK_TOKEN_TRANSACTIONS = [
  {
    id: "0x1234...5678",
    type: "Transfer",
    from: "0xaaaa...bbbb",
    to: "0xcccc...dddd",
    amount: "1,250.50 RBT",
    timestamp: "2 hours ago",
    status: "confirmed",
  },
  {
    id: "0x2345...6789",
    type: "Mint",
    from: "0xeeee...ffff",
    to: "0xgggg...hhhh",
    amount: "500.00 RBT",
    timestamp: "5 hours ago",
    status: "confirmed",
  },
];

export const TokenExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenId = searchParams.get("token") || "";
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>(
    MOCK_TOKEN_TRANSACTIONS
  );
  const [error, setError] = useState<Boolean>(false);
  const [activeTab, setActiveTab] = useState<"transactions">("transactions");
  const [tokenChainData, setTokenChainData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const normalizeToken = (raw: any, tokenId: string): TokenInfo => {
    const base = { tokenId, type: "UNKNOWN" as const };
    const payload = raw.rbt_info ?? raw.ft_info ?? raw.sc_info ?? raw.nft_info;

    if (!payload) return base;

    const type = raw.type.toUpperCase() as "RBT" | "FT" | "SC" | "NFT";

    if (type === "RBT") {
      return {
        ...base,
        type,
        id: payload.rbt_id,
        owner_did: payload.owner_did,
        block_height: payload.block_height,
        token_value: payload.token_value,
      };
    }

    if (type === "FT") {
      return {
        ...base,
        type,
        name: payload.ft_name,
        block_height: payload.block_height,
        creator_did: payload.creator_did,
        token_value: payload.token_value,
        owner_did: payload.owner_did,
        txn_id: payload.txn_id,
      };
    }

    if (type === "SC") {
      return {
        ...base,
        type,
        name: payload.contract_id,
        creator_did: payload.deployer_did,
        txn_id: payload.txn_id,
      };
    }

    if (type === "NFT") {
      return {
        ...base,
        type,
        id: payload.nft_id,
        token_value: payload.token_value,
        owner_did: payload.owner_did,
        txn_id: payload.txn_id,
      };
    }

    return base;
  };
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  useEffect(() => {
    const fetchTokenData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/search?id=${tokenId}`
        );

        if (!response.ok) {
          setError(true);
        }

        const raw = await response.json();
        // ---- NORMALISE ----
        const tokenInfo = normalizeToken(raw, tokenId);
        setTokenData(raw);
        const tokenChainResp = await fetch(
          `${API_BASE_URL}/token-chain?token_id=${tokenId}`
        );
        if (!tokenChainResp.ok) throw new Error("Failed to fetch token chain");

        const tokenChainJson = await tokenChainResp.json();
   
        setTokenChainData(tokenChainJson.TokenChainData);

        setTransactions(raw.transactions ?? MOCK_TOKEN_TRANSACTIONS);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    ("");

    // setTimeout(() => setTokenChainData(mockTokenChain), 300);

    if (tokenId) fetchTokenData();
  }, [tokenId]);


  if (loading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Token Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The requested token could not be found.
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

  if (!tokenChainData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Token Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The requested token could not be found.
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
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-heading dark:text-white mb-2">
          Token Explorer
        </h1>
        <div className="flex items-center space-x-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 break-all">
          <span>Details for Token:</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-primary-600 dark:text-primary-400">
              {tokenData.id}
            </span>
            <CopyButton text={tokenData.id} size="sm" />
          </div>
        </div>
      </div>

      {/* Token Info */}
      {/* <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
            tokenData.type === 'RBT' ? 'bg-primary-100 dark:bg-primary-900' :
            tokenData.type === 'FT' ? 'bg-tertiary-100 dark:bg-tertiary-900' :
            tokenData.type === 'NFT' ? 'bg-primary-100 dark:bg-primary-900' :
            'bg-primary-100 dark:bg-primary-900'
          }`}>
            <span className={`text-lg sm:text-xl font-bold ${
              tokenData.type === 'RBT' ? 'text-primary-600 dark:text-primary-400' :
              tokenData.type === 'FT' ? 'text-tertiary-600 dark:text-tertiary-400' :
              tokenData.type === 'NFT' ? 'text-primary-600 dark:text-primary-400' :
              'text-primary-600 dark:text-primary-400'
            }`}>
             
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-heading dark:text-white truncate">{tokenData.name} ({tokenData.symbol})</h2>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              tokenData.type === 'RBT' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' :
              tokenData.type === 'FT' ? 'bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200' :
              tokenData.type === 'NFT' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' :
              'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
            }`}>
              {tokenData.type}
            </span>
          </div>
        </div>
      </Card> */}

      {/* Token Details */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-heading dark:text-white mb-4">
          Token Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {tokenData.type === "RBT" && (
            <>
              <div>
                <p className="text-gray-500 dark:text-gray-400">RBT ID:</p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-gray-900 dark:text-white">
                    {tokenData.id}
                  </p>
                  <CopyButton text={tokenData.id!} size="sm" />
                </div>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Owner DID:</p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-gray-900 dark:text-white">
                    {tokenData.data.owner_did}
                  </p>
                  <CopyButton text={tokenData.data.owner_did!} size="sm" />
                </div>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Block Height:
                </p>
                <p className="font-mono text-gray-900 dark:text-white">
                  {tokenData.data.block_height}
                </p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Token Value:</p>
                <p className="font-mono text-gray-900 dark:text-white">
                  {tokenData.data.token_value}
                </p>
              </div>
            </>
          )}

          {/* ----- FT ----- */}
          {tokenData.type === "FT" && (
            <>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Name:</p>
                <p className="font-mono text-gray-900 dark:text-white">
                  {tokenData.data.ft_name}
                </p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Type:</p>
                <p className="font-mono text-gray-900 dark:text-white">FT</p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Creator DID:</p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-gray-900 dark:text-white">
                    {tokenData.data.creator_did}
                  </p>
                  <CopyButton text={tokenData.data.creator_did!} size="sm" />
                </div>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Owner DID:</p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-gray-900 dark:text-white">
                    {tokenData.data.owner_did}
                  </p>
                  <CopyButton text={tokenData.data.owner_did!} size="sm" />
                </div>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Token Value:</p>
                <p className="font-mono text-gray-900 dark:text-white">
                  {tokenData.data.token_value}
                </p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Transaction ID:
                </p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-gray-900 dark:text-white">
                    {tokenData.data.block_id}
                  </p>
                  <CopyButton text={tokenData.data.block_id!} size="sm" />
                </div>
              </div>
            </>
          )}

          {/* ----- SC (Smart Contract) ----- */}
          {tokenData.type === "SC" && (
            <>
              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Contract ID / Name:
                </p>
                <p className="font-mono text-gray-900 dark:text-white">
                  {tokenData.data.name}
                </p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Deployer DID:
                </p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-gray-900 dark:text-white">
                    {tokenData.data.creator_did}
                  </p>
                  <CopyButton text={tokenData.data.creator_did!} size="sm" />
                </div>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Transaction ID:
                </p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-gray-900 dark:text-white">
                    {tokenData.data.txn_id}
                  </p>
                  <CopyButton text={tokenData.data.txn_id!} size="sm" />
                </div>
              </div>
            </>
          )}

          {/* ----- NFT ----- */}
          {tokenData.type === "NFT" && (
            <>
              <div>
                <p className="text-gray-500 dark:text-gray-400">NFT ID:</p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-gray-900 dark:text-white">
                    {tokenData.id}
                  </p>
                  <CopyButton text={tokenData.id!} size="sm" />
                </div>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Owner DID:</p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-gray-900 dark:text-white">
                    {tokenData.data.owner_did}
                  </p>
                  <CopyButton text={tokenData.data.owner_did!} size="sm" />
                </div>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Token Value:</p>
                <p className="font-mono text-gray-900 dark:text-white">
                  {tokenData.data.token_value}
                </p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Transaction ID:
                </p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-gray-900 dark:text-white">
                    {tokenData.data.txn_id}
                  </p>
                  <CopyButton text={tokenData.data.txn_id!} size="sm" />
                </div>
              </div>
            </>
          )}

          {/* ----- UNKNOWN ----- */}
          {tokenData.type === "UNKNOWN" && (
            <div className="col-span-2">
              <p className="text-gray-500 dark:text-gray-400">
                No detailed information available for this token type.
              </p>
            </div>
          )}
        </div>
      </Card>

      {tokenChainData && tokenChainData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-heading dark:text-white mb-6 flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Token Chain History</span>
          </h3>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              {/* Token Blocks */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}

                className="space-y-4"
              >
                {tokenChainData
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((block: any, index: number) => {
                    // Determine if this is a genesis block or transaction block
                    const isGenesisBlock =
                      block.TCGenesisBlockKey &&
                      Object.keys(block.TCGenesisBlockKey).length > 0;
                    const hasTransInfo = block.TCTransInfoKey;
                    const hasEpoch = block.TCEpoch;

                    return (
                      <motion.div
                        key={block.TCBlockHashKey || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          const transType = block.TCTransTypeKey;
                          if (transType === "02" || transType === 2) {
                            navigate(
                              `/transaction-explorer?tx=${block.TCTransInfoKey.TITIDKey}`
                            );
                          } else if (transType === "08" || transType === 8 || transType === 13 || transType === "13" ) {
                            navigate(
                              `/burnt-transaction-explorer?tx=${block.TCBlockHashKey}`
                            );
                          } else if (transType === "09" || transType === 9 || transType === "10" || transType === 10) {
                            navigate(
                              `/sc-transaction-explorer?tx=${block.TCBlockHashKey}`
                            );
                          }
                        }}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors cursor-pointer"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {/* Block Hash */}
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">
                              Block Hash
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm text-gray-900 dark:text-white truncate">
                                {block.TCBlockHashKey}
                              </span>
                              <CopyButton
                                text={block.TCBlockHashKey}
                                size="sm"
                              />
                            </div>
                          </div>

                          {/* Owner DID */}
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">
                              Owner DID
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm text-gray-900 dark:text-white truncate">
                                {block.TCTokenOwnerKey}
                              </span>
                              <CopyButton
                                text={block.TCTokenOwnerKey}
                                size="sm"
                              />
                            </div>
                          </div>

                                <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">
                              Block Type
                             </p>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm text-gray-900 dark:text-white truncate">
                                {block.TCTransTypeKey}
                              </span>
                            </div>
                          </div>

                          {/* Token Value & Type/Epoch */}
                          {/* <div className="flex items-center justify-between lg:justify-start lg:space-x-6"> */}
                          {/* {block.TCTokenValueKey !== undefined && (
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                                Token Value
                              </p>
                              <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                                {block.TCTokenValueKey}
                              </span>
                            </div>
                          )} */}

                          {/* {hasEpoch && (
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                                Epoch
                              </p>
                              <span className="font-mono text-sm text-gray-900 dark:text-white">
                                {block.TCEpoch}
                              </span>
                            </div>
                          )} */}

                          {/* {block.TCTransTypeKey && (
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                                Type
                              </p>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                block.TCTransTypeKey === "05" 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : block.TCTransTypeKey === "01" || block.TCTransTypeKey === 1
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : block.TCTransTypeKey === "02" || block.TCTransTypeKey === 2
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              }`}>
                                {block.TCTransTypeKey === "05" ? "Genesis" :
                                 block.TCTransTypeKey === "01" || block.TCTransTypeKey === 1 ? "Transfer" :
                                 block.TCTransTypeKey === "02" || block.TCTransTypeKey === 2 ? "Burn" :
                                 block.TCTransTypeKey === "03" || block.TCTransTypeKey === 3 ? "Smart Contract" :
                                 "Transaction"}
                              </span>
                            </div>
                          )} */}

                          {/* {isGenesisBlock && !block.TCTransTypeKey && (
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                                Type
                              </p>
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Genesis Block
                              </span>
                            </div>
                          )} */}
                          {/* </div> */}
                        </div>

                        {/* Transaction Info Comment */}
                      </motion.div>
                    );
                  })}
              </motion.div>

              {tokenChainData.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(tokenChainData.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                  totalItems={tokenChainData.length}
                  itemsPerPage={itemsPerPage}
                  className="mt-6"
                />
              )}
            </div>
          </motion.div>
        </Card>
      )}
    </motion.div>
  );
};
