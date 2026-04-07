import React from 'react';
import { useApp } from '@/contexts/AppContext';
// @ts-ignore — JSX component from dag/src, no type declarations
import DAGApp from '../../dag/src/App.jsx';

export const DAGPage: React.FC = () => {
  const { state, setSearchQuery } = useApp();

  return (
    <div className="fixed inset-0 z-40 bg-white dark:bg-gray-950">
      <DAGApp
        externalSearchQuery={state.searchQuery}
        onExternalSearchHandled={() => setSearchQuery('')}
      />
    </div>
  );
};
