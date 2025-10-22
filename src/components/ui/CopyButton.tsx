import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  copiedText?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  className = '',
  size = 'md',
  showText = false,
  copiedText = 'Copied!'
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  };

  return (
    <button
      onClick={copyToClipboard}
      className={`inline-flex items-center space-x-1 ${buttonSizeClasses[size]} text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors ${className}`}
      title={copied ? copiedText : `Copy ${text}`}
    >
      {copied ? (
        <Check className={`${sizeClasses[size]} text-green-500`} />
      ) : (
        <Copy className={sizeClasses[size]} />
      )}
      {showText && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {copied ? copiedText : 'Copy'}
        </span>
      )}
    </button>
  );
};

export type { CopyButtonProps };
