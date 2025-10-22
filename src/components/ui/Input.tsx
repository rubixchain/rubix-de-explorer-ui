import React from 'react';
import { InputProps } from '@/types';
import { motion } from 'framer-motion';

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  className = '',
}) => {
  const baseClasses = 'input';
  
  const errorClasses = error ? 'border-error-500 focus:ring-error-500' : '';
  
  const classes = `${baseClasses} ${errorClasses} ${className}`;

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={classes}
      />
      {error && (
        <motion.p
          className="mt-1 text-sm text-error-500"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export type { InputProps };
