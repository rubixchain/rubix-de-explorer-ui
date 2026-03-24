import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top - 8;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + 8;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - 8;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + 8;
        break;
    }

    setCoords({ top, left });
  }, [position]);

  // Clamp tooltip within viewport after it renders (runs before paint)
  useLayoutEffect(() => {
    if (!isVisible || !tooltipRef.current) return;
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let { top, left } = coords;

    if (tooltipRect.right > vw - margin) {
      left -= tooltipRect.right - (vw - margin);
    }
    if (tooltipRect.left < margin) {
      left += margin - tooltipRect.left;
    }
    if (tooltipRect.bottom > vh - margin) {
      top -= tooltipRect.bottom - (vh - margin);
    }
    if (tooltipRect.top < margin) {
      top += margin - tooltipRect.top;
    }

    if (top !== coords.top || left !== coords.left) {
      setCoords({ top, left });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const showTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const id: any = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const getTransformStyle = (): React.CSSProperties => {
    switch (position) {
      case 'top':
        return { transform: 'translate(-50%, -100%)' };
      case 'bottom':
        return { transform: 'translate(-50%, 0)' };
      case 'left':
        return { transform: 'translate(-100%, -50%)' };
      case 'right':
        return { transform: 'translate(0, -50%)' };
      default:
        return { transform: 'translate(-50%, -100%)' };
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900 dark:border-t-gray-100';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900 dark:border-b-gray-100';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900 dark:border-l-gray-100';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900 dark:border-r-gray-100';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900 dark:border-t-gray-100';
    }
  };

  return (
    <div
      ref={triggerRef}
      className={`relative min-w-0 ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            zIndex: 9999,
            pointerEvents: 'none',
            ...getTransformStyle(),
          }}
          className="px-3 py-2 text-xs font-mono bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg shadow-lg max-w-xs break-all"
          role="tooltip"
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}
          />
        </div>,
        document.body
      )}
    </div>
  );
};

export type { TooltipProps };
