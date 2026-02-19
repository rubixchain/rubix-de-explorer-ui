import React from 'react';
import { motion } from 'framer-motion';
import { MetricsDashboard } from '@/components/common/MetricsDashboard';
import { DataExplorer } from '@/components/common/DataExplorer';

export const HomePage: React.FC = () => {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 space-y-8 md:space-y-10 lg:space-y-12">
      
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
