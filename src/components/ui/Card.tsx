import React from 'react';
import { CardProps } from '@/types';
import { motion } from 'framer-motion';

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
}) => {
  const baseClasses = 'card';
  
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200' : '';

  const classes = `${baseClasses} ${paddingClasses[padding]} ${hoverClasses} ${className}`;

  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export type { CardProps };
