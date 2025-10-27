import React from 'react';
import { motion } from 'framer-motion';
import { MetricsDashboard } from '@/components/common/MetricsDashboard';
import { DataExplorer } from '@/components/common/DataExplorer';

export const HomePage: React.FC = () => {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 space-y-6 sm:space-y-8">
        <motion.div
          className="text-center space-y-6 sm:space-y-8 py-8 sm:py-12 lg:py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-heading drop-shadow-lg">
            Rubix Explorer
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-secondary-600 max-w-4xl mx-auto px-4 drop-shadow-md">
            Comprehensive blockchain explorer for the Rubix ecosystem. Explore transactions, tokens, DIDs, and network metrics with real-time insights.
          </p>
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
