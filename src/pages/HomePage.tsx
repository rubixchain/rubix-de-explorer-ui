import React from 'react';
import { motion } from 'framer-motion';
import { MetricsDashboard } from '@/components/common/MetricsDashboard';
import { DataExplorer } from '@/components/common/DataExplorer';

export const HomePage: React.FC = () => {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 space-y-8 md:space-y-10 lg:space-y-12">
        {/* Hero Section */}
        <motion.div
          className="text-center py-8 md:py-4 lg:py-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-4 md:space-y-5 lg:space-y-6 px-4 sm:px-6 lg:px-8">
            {/* Title - Mobile: 3xl, iPad: 5xl, Desktop: 6xl */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-heading drop-shadow-lg leading-tight">
              Rubix Explorer
            </h1>

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
