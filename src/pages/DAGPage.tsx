import React from 'react';
// @ts-ignore — JSX component from dag/src, no type declarations
import DAGApp from '../../dag/src/App.jsx';

export const DAGPage: React.FC = () => {
  return (
    <div className="fixed inset-0 z-40 bg-white dark:bg-gray-950">
      <DAGApp />
    </div>
  );
};
