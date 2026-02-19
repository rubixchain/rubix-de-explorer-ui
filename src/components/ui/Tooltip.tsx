import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowOffset, setArrowOffset] = useState(0);
  const timeoutRef = useRef<any>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipNodeRef = useRef<HTMLDivElement | null>(null);

  const computeAndApply = useCallback((tooltipEl: HTMLDivElement) => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const pad = 8;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + 8;
        left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + scrollX + 8;
        break;
    }

    const viewportWidth = window.innerWidth;
    let offset = 0;

    if (left < pad) {
      offset = left - pad;
      left = pad;
    } else if (left + tooltipRect.width > viewportWidth - pad) {
      const newLeft = viewportWidth - pad - tooltipRect.width;
      offset = left - newLeft;
      left = newLeft;
    }

    setArrowOffset(offset);
    setTooltipStyle({
      position: 'absolute',
      zIndex: 9999,
      pointerEvents: 'none',
      top,
      left,
      opacity: 1,
    });
  }, [position]);

  // Callback ref: fires when the tooltip DOM node mounts/unmounts
  const tooltipCallbackRef = useCallback((node: HTMLDivElement | null) => {
    tooltipNodeRef.current = node;
    if (node) {
      // Use rAF to let the browser finish layout before measuring
      requestAnimationFrame(() => {
        computeAndApply(node);
      });
    }
  }, [computeAndApply]);

  const [shouldRender, setShouldRender] = useState(false);

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Reset style so the tooltip starts invisible at default position
      setTooltipStyle({
        position: 'absolute',
        zIndex: 9999,
        pointerEvents: 'none',
        top: -9999,
        left: -9999,
        opacity: 0,
      });
      setIsVisible(true);
      setShouldRender(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
    setShouldRender(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getArrowStyle = (): React.CSSProperties => {
    if (position === 'top' || position === 'bottom') {
      return { left: `calc(50% + ${arrowOffset}px)`, transform: 'translateX(-50%)' };
    }
    return {};
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full border-l-transparent border-r-transparent border-b-transparent border-t-gray-900 dark:border-t-gray-100';
      case 'bottom':
        return 'bottom-full border-l-transparent border-r-transparent border-t-transparent border-b-gray-900 dark:border-b-gray-100';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900 dark:border-l-gray-100';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900 dark:border-r-gray-100';
      default:
        return 'top-full border-l-transparent border-r-transparent border-b-transparent border-t-gray-900 dark:border-t-gray-100';
    }
  };

  return (
    <div
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && shouldRender && createPortal(
        <div
          ref={tooltipCallbackRef}
          style={tooltipStyle}
          className="px-3 py-2 text-xs font-mono bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg shadow-lg whitespace-nowrap transition-opacity duration-75"
          role="tooltip"
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}
            style={getArrowStyle()}
          />
        </div>,
        document.body
      )}
    </div>
  );
};

export type { TooltipProps };
