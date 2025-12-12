import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Activity, Users, Shield, Coins, DollarSign, Clock, Circle, Square, Hexagon, Image, Info, BarChart3 } from 'lucide-react';
import { NetworkMetrics } from '@/types';
import { useMetrics } from '@/hooks/useMetrics';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  loading?: boolean;
  tooltip?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color,
  loading = false,
  tooltip,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top');
  const [tooltipCoords, setTooltipCoords] = useState({ x: 0, y: 0 });
  const iconRef = useRef<HTMLDivElement>(null);
  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-5 lg:p-6"
      >
        {loading ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ) : (
          <>
            {/* Label with info icon */}
            <div className="flex items-center space-x-2 mb-2 md:mb-3">
              <span className="text-sm md:text-sm font-medium text-gray-700 dark:text-gray-300">
                {title}
              </span>
              {tooltip && (
                <div className="relative">
                  <div
                    ref={iconRef}
                    className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center cursor-help hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    onMouseEnter={() => {
                      setShowTooltip(true);
                    }}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <Info className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" />
                  </div>

                  {/* Tooltip */}
                  {showTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50"
                      style={{
                        left: '50%',
                        transform: 'translateX(-50%)',
                        maxWidth: 'min(16rem, calc(100vw - 2rem))'
                      }}
                    >
                      <div className="text-center break-words">
                        {tooltip}
                      </div>
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Large value - Responsive sizing */}
            <div className="text-2xl md:text-3xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </div>

            {/* Price change indicator */}
            {change && (
              <div className={`flex items-center space-x-1 mt-2 ${
                changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
                changeType === 'negative' ? 'text-red-600 dark:text-red-400' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {changeType === 'positive' && <TrendingUp className="w-4 h-4" />}
                {changeType === 'negative' && <TrendingDown className="w-4 h-4" />}
                <span className="text-sm font-medium">{change}</span>
              </div>
            )}
          </>
        )}
      </motion.div>
    </Card>
  );
};

interface MetricsDashboardProps {
  className?: string;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ className = '' }) => {
  const { data: metrics, isLoading, error } = useMetrics();
  const mockMetrics: NetworkMetrics = {
    totalTransactions: 1234567,
    // totalValueSettled: 45200000,
    totalDIDs: 89432,
    // activeValidators: 1247,
    // totalPledge: 45200000,
    // averageBlockTime: 2.3,
    // networkHealth: 99.8,
    totalRBT: 1250000,
    totalFT: 45600,
    totalNFT: 23400,
    totalSmartContracts: 890,
    // totalAssets: 1250000 + 45600 + 23400 + 890,
    marketCap: 2850000000, // $2.85B market cap
    rbtPrice: 2.28, // $2.28 per RBT
    // rbtPriceChange2h: 3.45, // +3.45% change in 2h
  };

  const getMetricsData = (data: any): NetworkMetrics => {
    if (data?.data) {
      return data.data;
    }
    return data;
  };

  const currentMetrics = getMetricsData(metrics) || mockMetrics;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(num);
  };

  const formatLargeCurrency = (num: number): string => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(1)}B`;
    }
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toFixed(0)}`;
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const formatPriceChange = (change: number): { text: string; isPositive: boolean } => {
    const isPositive = change >= 0;
    const sign = isPositive ? '+' : '';
    return {
      text: `${sign}${change.toFixed(2)}%`,
      isPositive
    };
  };

  const metricsData = [
    // {
    //   title: 'Market Cap',
    //   value: formatLargeCurrency(currentMetrics.marketCap || 2850000000),
    //   icon: DollarSign,
    //   color: 'text-green-600',
    //   tooltip: 'Market capitalization represents the total value of all Rubix tokens in circulation, calculated by multiplying the current price by the total supply.',
    // },

    {
      title: 'Total RBT',
      value: formatNumber(currentMetrics.totalRBT || 1250000),
      icon: Circle,
      color: 'text-primary-600',
      tooltip: 'Rubix Base Token (RBT) is the native cryptocurrency of the Rubix network, used for transaction fees, staking, and governance.',
    },
    {
      title: 'Total FT',
      value: formatNumber(currentMetrics.totalFT || 45600),
      icon: Square,
      color: 'text-tertiary-600',
      tooltip: 'Fungible Tokens (FT) are digital assets that are interchangeable and identical, representing standardized units of value.',
    },
    {
      title: 'Smart Contracts',
      value: formatNumber(currentMetrics.totalSmartContracts || 890),
      icon: Hexagon,
      color: 'text-primary-600',
      tooltip: 'Smart contracts are self-executing programs deployed on the blockchain that automatically execute when predefined conditions are met.',
    },
    {
      title: 'Total NFT',
      value: formatNumber(currentMetrics.totalNFT || 23400),
      icon: Image,
      color: 'text-pink-600',
      tooltip: 'Non-Fungible Tokens (NFT) are unique digital assets that represent ownership of specific items, art, or collectibles.',
    },
        {
      title: 'Max Supply',
      value: formatNumber(currentMetrics.maxSupply || 23400),
      icon: Image,
      color: 'text-pink-600',
      tooltip: 'Non-Fungible Tokens (NFT) are unique digital assets that represent ownership of specific items, art, or collectibles.',
    },
        {
      title: 'Total Supply',
      value: formatNumber(currentMetrics.totalSupply || 23400),
      icon: Image,
      color: 'text-pink-600',
      tooltip: 'Non-Fungible Tokens (NFT) are unique digital assets that represent ownership of specific items, art, or collectibles.',
    },
         {
      title: 'RBT Price',
      value: formatNumber(currentMetrics.rbtPrice || 23400),
      icon: Image,
      color: 'text-pink-600',
      tooltip: 'Non-Fungible Tokens (NFT) are unique digital assets that represent ownership of specific items, art, or collectibles.',
    },
         {
      title: 'Circulating Supply',
      value: formatNumber(currentMetrics.circulatingSupply || 23400),
      icon: Image,
      color: 'text-pink-600',
      tooltip: 'Non-Fungible Tokens (NFT) are unique digital assets that represent ownership of specific items, art, or collectibles.',
    },

  ];

  if (error) {
    return (
      <div className={`${className}`}>
        <Card className="text-center py-8">
          <div className="text-red-500 mb-2">
            <Activity className="w-8 h-8 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Failed to load metrics
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Unable to fetch network metrics. Please try again later.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${className} px-4 sm:px-6 lg:px-8`}>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {metricsData.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <MetricCard
              title={metric.title}
              value={metric.value}
              // change={metric.change?.text}
              // changeType={metric.change?.isPositive ? 'positive' : 'negative'}
              icon={metric.icon}
              color={metric.color}
              loading={isLoading}
              tooltip={metric.tooltip}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export type { MetricsDashboardProps };
