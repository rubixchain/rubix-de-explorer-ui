import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Hash, Users, Coins } from 'lucide-react';

export type TabType = 'transactions' | 'holders' | 'tokens';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface TabSwitcherProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  tabs?: Tab[];
  className?: string;
  showCounts?: boolean;
}

const defaultTabs: Tab[] = [
  {
    id: 'transactions',
    label: 'Transactions',
    icon: Activity,
    count: 1234567,
  },
  {
    id: 'holders',
    label: 'Holders',
    icon: Users,
    count: 89432,
  },
  {
    id: 'tokens',
    label: 'Tokens',
    icon: Coins,
    count: 45678,
  },
];

export const TabSwitcher: React.FC<TabSwitcherProps> = ({
  activeTab,
  onTabChange,
  tabs = defaultTabs,
  className = '',
  showCounts = true,
}) => {
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className={`${className}`}>
      <div className="flex space-x-1 sm:space-x-2 lg:space-x-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center space-x-1 px-2 py-2 sm:py-3 text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0
                ${isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Active underline */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}

              {/* Content */}
              <div className="relative flex items-center space-x-1">
                <Icon className="w-3 h-3" />
                <span className="text-xs">{tab.label}</span>
                {showCounts && tab.count && (
                  <span className={`
                    px-1.5 py-0.5 text-xs rounded-full
                    ${isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }
                  `}>
                    {formatCount(tab.count)}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export type { TabSwitcherProps };
