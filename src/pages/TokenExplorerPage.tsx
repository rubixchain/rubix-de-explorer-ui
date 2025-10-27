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

  useEffect(() => {
    const fetchTokenData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://relay-texts-interior-blink.trycloudflare.com/api/search?id=${tokenId}`
        );
        if (!response.ok) throw new Error("Failed to fetch token data");

        const raw = await response.json();
        // ---- NORMALISE ----
        const tokenInfo = normalizeToken(raw, tokenId);
        // setTokenData(MOCK_TOKEN_INFO);

        const tokenChainResp = await fetch(
          `https://relay-texts-interior-blink.trycloudflare.com/api/get-token-chain?tokenID=${tokenId}`
        );
        if (!tokenChainResp.ok) throw new Error("Failed to fetch token chain");

        const tokenChainJson = await tokenChainResp.json();
        setTokenChainData(
          Array.isArray(tokenChainJson) ? tokenChainJson : [tokenChainJson]
        );
        // Transactions (fallback to mock)
        setTransactions(raw.transactions ?? MOCK_TOKEN_TRANSACTIONS);
        //  setTransactions(MOCK_TOKEN_TRANSACTIONS);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    setTimeout(() => setTokenChainData(mockTokenChain), 300);

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
              {tokenData.tokenId}
            </span>
            <CopyButton text={tokenData.rbt_id} size="sm" />
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
                    {tokenData.owner_did}
                  </p>
                  <CopyButton text={tokenData.owner_did!} size="sm" />
                </div>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Block Height:
                </p>
                <p className="font-mono text-gray-900 dark:text-white">
                  {tokenData.block_height}
                </p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Token Value:</p>
                <p className="font-mono text-gray-900 dark:text-white">
                  {tokenData.token_value}
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
                  {tokenData.name}
                </p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Creator DID:</p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-gray-900 dark:text-white">
                    {tokenData.creator_did}
                  </p>
                  <CopyButton text={tokenData.creator_did!} size="sm" />
                </div>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Owner DID:</p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-gray-900 dark:text-white">
                    {tokenData.owner_did}
                  </p>
                  <CopyButton text={tokenData.owner_did!} size="sm" />
                </div>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Block Height:
                </p>
                <p className="font-mono text-gray-900 dark:text-white">
                  {tokenData.block_height}
                </p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Token Value:</p>
                <p className="font-mono text-gray-900 dark:text-white">
                  {tokenData.token_value}
                </p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Transaction ID:
                </p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-gray-900 dark:text-white">
                    {tokenData.txn_id}
                  </p>
                  <CopyButton text={tokenData.txn_id!} size="sm" />
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
                  {tokenData.name}
                </p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Deployer DID:
                </p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-gray-900 dark:text-white">
                    {tokenData.creator_did}
                  </p>
                  <CopyButton text={tokenData.creator_did!} size="sm" />
                </div>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Transaction ID:
                </p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-gray-900 dark:text-white">
                    {tokenData.txn_id}
                  </p>
                  <CopyButton text={tokenData.txn_id!} size="sm" />
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
                    {tokenData.owner_did}
                  </p>
                  <CopyButton text={tokenData.owner_did!} size="sm" />
                </div>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Token Value:</p>
                <p className="font-mono text-gray-900 dark:text-white">
                  {tokenData.token_value}
                </p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Transaction ID:
                </p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-gray-900 dark:text-white">
                    {tokenData.txn_id}
                  </p>
                  <CopyButton text={tokenData.txn_id!} size="sm" />
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

      {/* Recent Transactions */}
      {tokenChainData && tokenChainData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-heading dark:text-white mb-6 flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Recent Transactions</span>
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
                className="space-y-3"
              >
                {tokenChainData
                  .slice(0, 10) // show latest 10 blocks
                  .map((block: any, index: number) => (
                    <motion.div
                      key={block.block_hash || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() =>
                        navigate(`/transaction-explorer?tx=${block.block_hash}`)
                      } // ✅ Added click navigation
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Block Hash
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
                              {block.block_hash}
                            </span>
                            <CopyButton text={block.block_hash} size="sm" />
                          </div>
                        </div>

                        <div className="mt-3 sm:mt-0">
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Owner DID
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
                              {block.owner_did}
                            </span>
                            <CopyButton text={block.owner_did} size="sm" />
                          </div>
                        </div>

                        <div className="mt-3 sm:mt-0">
                          {/* <p className="text-gray-500 dark:text-gray-400 text-sm">Block Type</p> */}
                          <span className="inline-flex px-3 py-1.5 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                            {block.block_type}
                          </span>
                          {block.epoch && (
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                              Epoch:{" "}
                              <span className="text-gray-900 dark:text-white font-mono">
                                {block.epoch}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </motion.div>

              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(transactions.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                totalItems={transactions.length}
                itemsPerPage={itemsPerPage}
                className="mt-6"
              />
            </div>
          </motion.div>
        </Card>
      )}
    </motion.div>
  );
};
