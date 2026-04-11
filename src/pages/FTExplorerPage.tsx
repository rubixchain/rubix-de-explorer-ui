import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { CopyButton } from "@/components/ui/CopyButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { useFormatAddress, useIsMobile } from "@/hooks/useFormatAddress";
import { ArrowLeft, Activity } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTokenDetails, useTokenChain } from "@/hooks/useTokens";

function formatRelativeTime(epoch: number): string {
  const now = Date.now();
  const diffMs = now - epoch * 1000;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return `${diffSec} seconds ago`;
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
  if (diffMonth < 12) return `${diffMonth} month${diffMonth !== 1 ? "s" : ""} ago`;
  return `${diffYear} year${diffYear !== 1 ? "s" : ""} ago`;
}

export const FTExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenId = searchParams.get("token") || "";
  const formatAddress = useFormatAddress(20, 8);
  const isMobile = useIsMobile();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: rawTokenData, isLoading, error } = useTokenDetails(tokenId);
  const { data: tokenChainData, isLoading: isLoadingChain } = useTokenChain(tokenId);

  const tokenData: any = rawTokenData;
  const d = tokenData?.data ?? tokenData;

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

  if (error || !tokenData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Token Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error ? "An error occurred while fetching token data" : "The requested token could not be found."}
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
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-heading dark:text-white mb-2">
          FT Token Explorer
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          <span className="mb-2 sm:mb-0">Details for Token:</span>
          <div className="flex items-center gap-2">
            <Tooltip content={tokenId} position="top">
              <span className="font-mono text-primary-600 dark:text-primary-400 inline-block truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-none">
                {formatAddress(tokenId)}
              </span>
            </Tooltip>
            <div className="flex-shrink-0">
              <CopyButton text={tokenId} size="sm" />
            </div>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold text-heading dark:text-white mb-4">
          Token Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Asset Type */}
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">Asset Type:</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              FT
            </span>
          </div>

          {/* Token ID */}
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">Token ID:</p>
            <div className="flex items-center gap-2">
              <Tooltip content={d?.token_id || tokenId} position="top">
                <p className="font-mono text-gray-900 dark:text-white truncate">
                  {formatAddress(d?.token_id || tokenId)}
                </p>
              </Tooltip>
              <div className="flex-shrink-0">
                <CopyButton text={d?.token_id || tokenId} size="sm" />
              </div>
            </div>
          </div>

          {/* Owner */}
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">Owner:</p>
            <div className="flex items-center gap-2">
              <Tooltip content={d?.did} position="top">
                <p
                  className="font-mono text-gray-900 dark:text-white truncate cursor-pointer hover:text-primary-600"
                  onClick={() => navigate(`/did-explorer?did=${d?.did}`)}
                >
                  {formatAddress(d?.did)}
                </p>
              </Tooltip>
              <div className="flex-shrink-0">
                <CopyButton text={d?.did} size="sm" />
              </div>
            </div>
          </div>

          {/* Token Value */}
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">Token Value:</p>
            <p className="font-mono text-gray-900 dark:text-white">
              {d?.token_value}
            </p>
          </div>

          {/* Transaction ID */}
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">Transaction ID:</p>
            <div className="flex items-center gap-2">
              <Tooltip content={d?.transaction_id} position="top">
                <p
                  className="font-mono text-gray-900 dark:text-white truncate cursor-pointer hover:text-primary-600"
                  onClick={() => navigate(`/transaction-explorer?tx=${d?.transaction_id}`)}
                >
                  {formatAddress(d?.transaction_id)}
                </p>
              </Tooltip>
              <div className="flex-shrink-0">
                <CopyButton text={d?.transaction_id} size="sm" />
              </div>
            </div>
          </div>

          {/* Creator */}
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">Creator:</p>
            <div className="flex items-center gap-2">
              <Tooltip content={d?.deployer} position="top">
                <p
                  className="font-mono text-gray-900 dark:text-white truncate cursor-pointer hover:text-primary-600"
                  onClick={() => navigate(`/did-explorer?did=${d?.deployer}`)}
                >
                  {formatAddress(d?.deployer)}
                </p>
              </Tooltip>
              <div className="flex-shrink-0">
                <CopyButton text={d?.deployer} size="sm" />
              </div>
            </div>
          </div>

          {/* Created At */}
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">Created At:</p>
            <p className="font-mono text-gray-900 dark:text-white">
              {d?.created_at ? new Date(d.created_at).toUTCString() : "N/A"}
            </p>
          </div>
        </div>
      </Card>

      {/* Token Chain Section */}
      {isLoadingChain && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-heading dark:text-white mb-6 flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Token Chain History</span>
          </h3>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </Card>
      )}

      {tokenChainData && tokenChainData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-heading dark:text-white mb-6 flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Token Chain History</span>
          </h3>

          {isMobile ? (
            <div className="space-y-3">
              {tokenChainData
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((block: any, index: number) => (
                  <motion.div
                    key={block.transaction_id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/transaction-explorer?tx=${block.transaction_id}`)}
                    className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 p-4 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors space-y-2"
                  >
                    <div>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">Transaction</p>
                      <div className="flex items-center gap-1.5">
                        <Tooltip content={block.transaction_id} position="top">
                          <span className="text-sm font-medium text-secondary-900 dark:text-white font-mono truncate">{formatAddress(block.transaction_id)}</span>
                        </Tooltip>
                        <CopyButton text={block.transaction_id} size="sm" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">From</p>
                      <div className="flex items-center gap-1.5">
                        <Tooltip content={block.initiator} position="top">
                          <span
                            className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate cursor-pointer hover:text-primary-600"
                            onClick={(e) => { e.stopPropagation(); navigate(`/did-explorer?did=${block.initiator}`); }}
                          >{formatAddress(block.initiator)}</span>
                        </Tooltip>
                        <CopyButton text={block.initiator} size="sm" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-0.5">To</p>
                      <div className="flex items-center gap-1.5">
                        <Tooltip content={block.owner} position="top">
                          <span
                            className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate cursor-pointer hover:text-primary-600"
                            onClick={(e) => { e.stopPropagation(); navigate(`/did-explorer?did=${block.owner}`); }}
                          >{formatAddress(block.owner)}</span>
                        </Tooltip>
                        <CopyButton text={block.owner} size="sm" />
                      </div>
                    </div>
                    <div className="pt-1">
                      <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200 whitespace-nowrap">
                        {block.epoch ? formatRelativeTime(block.epoch) : "N/A"}
                      </span>
                    </div>
                  </motion.div>
                ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-secondary-900 rounded-lg border border-outline-200 dark:border-outline-700 overflow-hidden">
              <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-outline-200 dark:border-outline-700">
                <div className="flex px-4 md:px-6 py-3 text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider gap-3 md:gap-4">
                  <div className="flex-1 min-w-0">Transaction</div>
                  <div className="flex-1 min-w-0">From</div>
                  <div className="flex-1 min-w-0">To</div>
                  <div className="w-32 flex-shrink-0">Time</div>
                </div>
              </div>
              <div className="divide-y divide-outline-200 dark:divide-outline-700">
                {tokenChainData
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((block: any, index: number) => (
                    <motion.div
                      key={block.transaction_id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/transaction-explorer?tx=${block.transaction_id}`)}
                      className="flex px-4 md:px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer gap-3 md:gap-4"
                    >
                      <div className="flex-1 min-w-0 flex items-center">
                        <div className="flex items-center gap-1.5 min-w-0 w-full">
                          <Tooltip content={block.transaction_id} position="top">
                            <span className="text-sm font-medium text-secondary-900 dark:text-white font-mono truncate block">{formatAddress(block.transaction_id)}</span>
                          </Tooltip>
                          <div className="flex-shrink-0"><CopyButton text={block.transaction_id} size="sm" /></div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex items-center">
                        <div className="flex items-center gap-1.5 min-w-0 w-full">
                          <Tooltip content={block.initiator} position="top">
                            <span
                              className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate block cursor-pointer hover:text-primary-600"
                              onClick={(e) => { e.stopPropagation(); navigate(`/did-explorer?did=${block.initiator}`); }}
                            >{formatAddress(block.initiator)}</span>
                          </Tooltip>
                          <div className="flex-shrink-0"><CopyButton text={block.initiator} size="sm" /></div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex items-center">
                        <div className="flex items-center gap-1.5 min-w-0 w-full">
                          <Tooltip content={block.owner} position="top">
                            <span
                              className="text-sm font-mono text-secondary-600 dark:text-secondary-400 truncate block cursor-pointer hover:text-primary-600"
                              onClick={(e) => { e.stopPropagation(); navigate(`/did-explorer?did=${block.owner}`); }}
                            >{formatAddress(block.owner)}</span>
                          </Tooltip>
                          <div className="flex-shrink-0"><CopyButton text={block.owner} size="sm" /></div>
                        </div>
                      </div>
                      <div className="w-32 flex-shrink-0 flex items-center">
                        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200">
                          {block.epoch ? formatRelativeTime(block.epoch) : "N/A"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}

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
        </Card>
      )}
    </motion.div>
  );
};
