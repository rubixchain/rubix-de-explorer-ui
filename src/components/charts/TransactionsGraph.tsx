import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, ChevronDown } from 'lucide-react';
import { TimeSeriesData } from '@/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TransactionsGraphProps {
  className?: string;
  data?: TimeSeriesData[];
  loading?: boolean;
}

type TimeFilter = '1h' | '24h' | '7d' | '30d';

const timeFilters: { label: string; value: TimeFilter }[] = [
  { label: '1H', value: '1h' },
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
];

const generateRubixData = (period: TimeFilter) => {
  const now = new Date();
  const data: any[] = [];
  
  let points: number;
  let interval: number;
  let timeFormat: Intl.DateTimeFormatOptions;
  
  switch (period) {
    case '1h':
      points = 6;
      interval = 10 * 60 * 1000; // 10 minute intervals for 1 hour
      timeFormat = { hour: '2-digit', minute: '2-digit' };
      break;
    case '24h':
      points = 24;
      interval = 60 * 60 * 1000; // 1 hour intervals for 24 hours
      timeFormat = { hour: '2-digit', minute: '2-digit' };
      break;
    case '7d':
      points = 7;
      interval = 24 * 60 * 60 * 1000; // 1 day intervals for 7 days
      timeFormat = { month: 'short', day: 'numeric' };
      break;
    case '30d':
      points = 30;
      interval = 24 * 60 * 60 * 1000; // 1 day intervals for 30 days
      timeFormat = { month: 'short', day: 'numeric' };
      break;
    default:
      points = 24;
      interval = 60 * 60 * 1000;
      timeFormat = { hour: '2-digit', minute: '2-digit' };
  }
  
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * interval);
    const baseValue = 20 + Math.random() * 80;
    const trend = Math.sin(i / points * Math.PI) * 20;
    const noise = (Math.random() - 0.5) * 10;
    
    const transactionCount = Math.max(0, Math.round(baseValue + trend + noise)); // Transaction count
    
    data.push({
      timestamp: timestamp.toISOString(),
      time: timestamp.toLocaleString([], timeFormat),
      value: transactionCount,
    });
  }
  
  return data;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(data.timestamp).toLocaleString()}
        </p>
        <p className="text-lg font-semibold text-heading dark:text-white">
          {data.value.toLocaleString()} Transactions
        </p>
      </div>
    );
  }
  return null;
};

const formatChartData = (data: any[], period: TimeFilter) => {
  let timeFormat: Intl.DateTimeFormatOptions;
  
  switch (period) {
    case '1h':
      timeFormat = { hour: '2-digit', minute: '2-digit' };
      break;
    case '24h':
      timeFormat = { hour: '2-digit', minute: '2-digit' };
      break;
    case '7d':
      timeFormat = { month: 'short', day: 'numeric' };
      break;
    case '30d':
      timeFormat = { month: 'short', day: 'numeric' };
      break;
    default:
      timeFormat = { hour: '2-digit', minute: '2-digit' };
  }
  
  return data.map((item, index) => ({
    ...item,
    index,
    formattedTime: new Date(item.timestamp).toLocaleString([], timeFormat),
  }));
};

export const TransactionsGraph: React.FC<TransactionsGraphProps> = ({
  className = '',
  data: propData,
  loading = false,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>('24h');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Check initial size
    handleResize();

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const chartData = useMemo(() => {
    const data = propData || generateRubixData(selectedFilter);
    return formatChartData(data, selectedFilter);
  }, [propData, selectedFilter]);

  const currentData = chartData[chartData.length - 1];
  const previousData = chartData[chartData.length - 2];
  const currentValue = currentData?.value || 0;
  const previousValue = previousData?.value || 0;
  const change = currentValue - previousValue;
  const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return Math.round(value).toString();
  };

  if (loading) {
    return (
      <Card className={`${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
            </div>
            <div className="flex space-x-2">
              {timeFilters.map((filter) => (
                <div
                  key={filter.value}
                  className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12"
                />
              ))}
            </div>
          </div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-heading dark:text-white mb-2">
              Transactions Count
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {formatValue(currentValue)}
              </div>
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                change >= 0 ? 'text-tertiary-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`w-4 h-4 ${change < 0 ? 'rotate-180' : ''}`} />
                <span>{Math.abs(changePercent).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          
          {/* Time filters */}
          <div className="flex flex-wrap gap-2">
            {/* Desktop: Show buttons */}
            <div className="hidden sm:flex flex-wrap gap-2">
              {timeFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={selectedFilter === filter.value ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.value)}
                  className="min-w-[3rem] text-sm"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            
            {/* Mobile: Show dropdown */}
            <div className="sm:hidden relative" ref={dropdownRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 min-w-[4rem] text-sm"
              >
                <span>{timeFilters.find(f => f.value === selectedFilter)?.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 w-full min-w-[120px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                  >
                    {timeFilters.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => {
                          setSelectedFilter(filter.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors duration-150 ${
                          selectedFilter === filter.value
                            ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                            : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Chart */}
        <motion.div
          key={selectedFilter}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative w-full h-64 sm:h-80 overflow-hidden"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 10,
              }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                className="dark:stroke-gray-700"
              />
              <XAxis 
                dataKey="time"
                stroke="#6b7280"
                fontSize={isMobile ? 8 : 10}
                className="dark:stroke-gray-400"
                tickLine={false}
                axisLine={false}
                interval={isMobile ? 
                  (selectedFilter === '1h' ? 1 : 
                   selectedFilter === '24h' ? 2 : 
                   selectedFilter === '7d' ? 1 : 
                   selectedFilter === '30d' ? 2 : 1) : 
                  (selectedFilter === '24h' ? 0 : selectedFilter === '30d' ? 2 : 0)
                }
                tickFormatter={(value) => {
                  if (isMobile) {
                    if (selectedFilter === '1h') {
                      return value; // Show full time (e.g., "14:30")
                    } else if (selectedFilter === '24h') {
                      return value; // Show full time (e.g., "14:30")
                    } else if (selectedFilter === '7d') {
                      return value.split(' ')[0]; // Show only date part (e.g., "Sep 28")
                    } else if (selectedFilter === '30d') {
                      return value.split(' ')[0]; // Show only date part (e.g., "Sep 28")
                    }
                  }
                  return value;
                }}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? 'end' : 'middle'}
                height={isMobile ? 60 : 30}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={10}
                className="dark:stroke-gray-400"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorValue)"
                dot={false}
                activeDot={{ r: 4, fill: '#10b981' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Stats */}
        <div className="mt-4 sm:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatValue(Math.max(...chartData.map(d => d.value)))}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Peak Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-lg font-bold text-primary-600 dark:text-primary-400">
              {formatValue(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length)}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Avg Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-lg font-bold text-primary-600 dark:text-primary-400">
              {formatValue(Math.min(...chartData.map(d => d.value)))}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Min Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400">
              {formatValue(chartData.reduce((sum, d) => sum + d.value, 0))}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Transactions</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export type { TransactionsGraphProps };
