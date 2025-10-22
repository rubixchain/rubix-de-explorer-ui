import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showInfo = true,
  totalItems,
  itemsPerPage = 10,
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);

  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 ${className}`}>
      {/* Info */}
      {showInfo && totalItems && (
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <motion.button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            flex items-center space-x-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors
            ${currentPage === 1
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
          whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
          whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
        >
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </motion.button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <div key={`dots-${index}`} className="px-2 py-2">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <motion.button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`
                  px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors
                  ${isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {pageNumber}
              </motion.button>
            );
          })}
        </div>

        {/* Next Button */}
        <motion.button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            flex items-center space-x-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors
            ${currentPage === totalPages
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
          whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
          whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </motion.button>
      </div>
    </div>
  );
};

export type { PaginationProps };
