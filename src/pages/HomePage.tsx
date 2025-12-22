import React from 'react';
import { motion } from 'framer-motion';
import { MetricsDashboard } from '@/components/common/MetricsDashboard';
import { DataExplorer } from '@/components/common/DataExplorer';

export const HomePage: React.FC = () => {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 space-y-1 md:space-y-1 lg:space-y-8">
        {/* Hero Section */}
        <motion.div
          className="text-center py-1 md:py-1 lg:py-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-1 md:space-y-1 lg:space-y-1 px-4 sm:px-6 lg:px-8">
            {/* Title - Mobile: 3xl, iPad: 5xl, Desktop: 6xl */}
            {/* <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-heading drop-shadow-lg leading-tight">
              Rubix Explorer
            </h1> */}

            {/* Description - Mobile: base, iPad: lg, Desktop: xl */}
           
          </div>
        </motion.div>
      
      <MetricsDashboard />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <DataExplorer />
      </motion.div>

      </div>
    </div>
  );
};
