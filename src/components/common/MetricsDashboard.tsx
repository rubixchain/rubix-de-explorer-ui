import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { BanterLoader } from "@/components/ui/BanterLoader";
import { createPortal } from "react-dom";

import {
  TrendingUp,
  TrendingDown,
  Activity,
  Info,
} from "lucide-react";
import { NetworkMetrics } from "@/types";
import { useMetrics } from "@/hooks/useMetrics";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  loading?: boolean;
  tooltip?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = "neutral",
  loading = false,
  tooltip,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const isSmallTitle =
    title === "Circu. Supply" || title === "Total SC" || title === "Max Supply" || title === "Total Supply" || title === "RBT Price";

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-[70px] !p-2 overflow-visible">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="px-2 py-0 h-full flex flex-col"
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
            <div className="flex items-start space-x-2 mb-0 leading-tight min-w-0">
              <span
                className={`font-medium text-gray-700 dark:text-gray-300 truncate ${
                  isSmallTitle ? "text-xs" : "text-sm"
                }`}
              >
                {title}
              </span>
              {tooltip && (
                <div className="relative inline-flex self-start">
                  <div
                    ref={iconRef}
                    className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded-full
             flex items-center justify-center cursor-help
             hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    onMouseEnter={() => {
                      if (!iconRef.current) return;

                      const rect = iconRef.current.getBoundingClientRect();
                      const vw = window.innerWidth;
                      const vh = window.innerHeight;

                      const tooltipWidth = 260;
                      const tooltipHeight = 80;

                      // Vertical position (prefer bottom)
                      const top =
                        rect.bottom + tooltipHeight < vh
                          ? rect.bottom + 8
                          : rect.top - tooltipHeight - 8;

                      // Horizontal position (clamp to viewport)
                      let left = rect.left + rect.width / 2 - tooltipWidth / 2;
                      left = Math.max(8, Math.min(left, vw - tooltipWidth - 8));

                      setTooltipStyle({
                        position: "fixed",
                        top,
                        left,
                        width: tooltipWidth,
                        zIndex: 9999,
                      });

                      setShowTooltip(true);
                    }}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <Info className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" />
                  </div>

                  {/* Tooltip */}
                  {showTooltip &&
                    createPortal(
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        style={tooltipStyle}
                        className="p-3 text-xs rounded-lg shadow-lg
                 bg-gray-900 dark:bg-gray-700 text-white"
                      >
                        {tooltip}
                      </motion.div>,
                      document.body
                    )}
                </div>
              )}
            </div>

            {/* Large value - Responsive sizing */}
            <div
              className="font-bold text-gray-900 dark:text-white overflow-hidden text-lg"
              title={value}
            >
              {value}
            </div>

            {/* Price change indicator */}
            {change && (
              <div
                className={`flex items-center space-x-1 mt-2 ${
                  changeType === "positive"
                    ? "text-green-600 dark:text-green-400"
                    : changeType === "negative"
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {changeType === "positive" && (
                  <TrendingUp className="w-4 h-4" />
                )}
                {changeType === "negative" && (
                  <TrendingDown className="w-4 h-4" />
                )}
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

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  className = "",
}) => {
  const { data: metrics, isLoading, error } = useMetrics();
  const mockMetrics: NetworkMetrics = {
    circulating_supply: 0,
    total_supply: 0,
    ft_count: 0,
    nft_count: 0,
    sc_count: 0,
    rbt_price: 0,
    tvl: 0,
  };

  const getMetricsData = (data: any): NetworkMetrics => {
    if (data?.data) {
      return data.data;
    }
    return data;
  };

  const currentMetrics = getMetricsData(metrics) || mockMetrics;

  const formatNumber = (num: number): string => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });
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

  const metricsData = [
    {
      title: "RBT Price",
      value: `$${currentMetrics.rbt_price?.toFixed(2) ?? "0.00"}`,
      tooltip: "Price of a single RBT token in USD.",
    },
    {
      title: "Total Supply",
      value: formatNumber(currentMetrics.total_supply ?? 0),
      tooltip:
        "Total supply refers to the total amount of Rubix tokens that currently exist, including those in circulation and those held in reserve.",
    },
    {
      title: "Max Supply",
      value: formatNumber(51_400_000),
      tooltip:
        "Max supply refers to the maximum amount of Rubix tokens that will ever be created, as defined by the protocol.",
    },
    {
      title: "Circu. Supply",
      value: formatNumber(currentMetrics.circulating_supply ?? 0),
      tooltip:
        "Circulating supply refers to the total amount of Rubix tokens currently available and circulating in the market.",
    },
    {
      title: "Total FT",
      value: formatNumber(currentMetrics.ft_count ?? 0),
      tooltip:
        "Fungible Tokens (FT) are digital assets that are interchangeable and identical, representing standardized units of value.",
    },
    {
      title: "Total NFT",
      value: formatNumber(currentMetrics.nft_count ?? 0),
      tooltip:
        "Non-Fungible Tokens (NFT) are unique digital assets that represent ownership of specific items, art, or collectibles.",
    },
    {
      title: "Total SC",
      value: formatNumber(currentMetrics.sc_count ?? 0),
      tooltip:
        "it refers to the total number of smart contracts deployed on the chain . Smart contracts are self-executing programs deployed on the blockchain that automatically execute when predefined conditions are met.",
    },
    {
      title: "TVL",
      value: formatLargeCurrency(currentMetrics.tvl ?? 0),
      tooltip:
        "Total Value Locked (TVL) represents the total USD value of assets locked in the Rubix network.",
    },
  ];

  if (isLoading) {
    return (
      <div className={`${className} px-4 sm:px-6 lg:px-8`}>
        <BanterLoader label="Loading Metrics" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <Card className="text-center py-1">
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
        className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-8 gap-3 md:gap-5 lg:gap-6"
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
            {/* <div className="w-full max-w-[180px]"> */}

            <MetricCard
              title={metric.title}
              value={metric.value}
              loading={isLoading}
              tooltip={metric.tooltip}
            />
            {/* </div> */}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export type { MetricsDashboardProps };
