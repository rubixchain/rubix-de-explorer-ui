import React, { useState } from 'react';
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

const PageBtn: React.FC<{ page: number; active: boolean; onClick: () => void }> = ({ page, active, onClick }) => (
  <motion.button
    onClick={onClick}
    className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
      active
        ? 'bg-primary-600 text-white'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
    }`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {page}
  </motion.button>
);

const Dots = () => (
  <div className="px-1 py-2">
    <MoreHorizontal className="w-4 h-4 text-gray-400" />
  </div>
);

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showInfo = true,
  totalItems,
  itemsPerPage = 10,
}) => {
  const [jumpValue, setJumpValue] = useState('');

  const handleJump = () => {
    const page = parseInt(jumpValue, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
    setJumpValue('');
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);

  // Whether to show left dots (pages between 1 and current are hidden)
  const showLeftDots  = currentPage > 2;
  // Whether to show right dots (pages between current and last are hidden)
  const showRightDots = currentPage < totalPages - 1;
  // Show current page as its own button only when it's not 1 or totalPages
  const showCurrent   = currentPage !== 1 && currentPage !== totalPages;

  const jumpInput = (
    <input
      type="number"
      min={1}
      max={totalPages}
      value={jumpValue}
      onChange={e => setJumpValue(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter') handleJump(); }}
      placeholder="Go to"
      className="w-14 px-2 py-1.5 text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );

  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 ${className}`}>
      {/* Info */}
      {showInfo && !!totalItems && (
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center space-x-1">
        {/* Previous */}
        <motion.button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center space-x-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
            currentPage === 1
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
          whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
        >
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </motion.button>

        {/* Page 1 */}
        <PageBtn page={1} active={currentPage === 1} onClick={() => onPageChange(1)} />

        {/* Left dots */}
        {showLeftDots && <Dots />}

        {/* Current page (middle) */}
        {showCurrent && <PageBtn page={currentPage} active onClick={() => {}} />}

        {/* Jump input — always in the middle */}
        {jumpInput}

        {/* Right dots */}
        {showRightDots && <Dots />}

        {/* Last page */}
        {totalPages > 1 && (
          <PageBtn page={totalPages} active={currentPage === totalPages} onClick={() => onPageChange(totalPages)} />
        )}

        {/* Next */}
        <motion.button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center space-x-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
            currentPage === totalPages
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
          whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
        >
          <span>Next</span>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </motion.button>
      </div>
    </div>
  );
};

export type { PaginationProps };
