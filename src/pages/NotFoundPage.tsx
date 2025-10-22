import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        className="text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 404 Illustration */}
        <motion.div
          className="text-8xl font-bold text-primary-600"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          404
        </motion.div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-heading dark:text-white">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button variant="primary" size="md">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Button variant="ghost" size="md" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
