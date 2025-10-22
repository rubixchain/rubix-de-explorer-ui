import React from 'react';
import { ButtonProps } from '@/types';
import { motion } from 'framer-motion';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  className = '',
}) => {
  const baseClasses = 'btn';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
  };
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <motion.button
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.1 }}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export type { ButtonProps };
