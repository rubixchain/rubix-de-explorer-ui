import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Tooltip } from './Tooltip';

interface AutoTruncateAddressProps {
  address: string;
  className?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  fallbackLength?: number;
}

const formatAddress = (addr: string, length: number): string => {
  if (!addr || addr === 'N/A') return addr;
  if (addr.length <= length * 2) return addr;
  return `${addr.slice(0, length)}...${addr.slice(-length)}`;
};

/**
 * Dynamically detects overflow and truncates the address when it doesn't fit.
 * Shows full address when there's enough space, truncated when not.
 * Tooltip always shows the full address on hover.
 */
export const AutoTruncateAddress: React.FC<AutoTruncateAddressProps> = ({
  address,
  className = '',
  tooltipPosition = 'top',
  fallbackLength = 8,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  // Default to truncated to prevent any flash of overflow
  const [isTruncated, setIsTruncated] = useState(true);

  const checkOverflow = useCallback(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    // Compare the full text width against available container width
    const availableWidth = container.clientWidth;
    const textWidth = measure.scrollWidth;

    setIsTruncated(textWidth > availableWidth);
  }, []);

  useEffect(() => {
    checkOverflow();

    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkOverflow, address]);

  return (
    <Tooltip content={address} position={tooltipPosition}>
      <div ref={containerRef} className="min-w-0 overflow-hidden">
        {/* Hidden measurement span - always renders full text to measure its width */}
        <span
          ref={measureRef}
          className={`invisible absolute whitespace-nowrap ${className}`}
          aria-hidden="true"
        >
          {address}
        </span>
        {/* Visible text - truncated or full based on overflow detection */}
        <span className={`block truncate ${className}`}>
          {isTruncated ? formatAddress(address, fallbackLength) : address}
        </span>
      </div>
    </Tooltip>
  );
};
