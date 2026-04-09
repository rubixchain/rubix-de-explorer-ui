import React, { Suspense } from 'react';
import { useApp } from '@/contexts/AppContext';

// @ts-ignore — JSX component from dag/src, no type declarations
const DAGApp = React.lazy(() => import('../../dag/src/App.jsx'));

const DAGLoader: React.FC = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
    <div className="banter-loader" style={{ position: 'relative', width: 72, height: 72, marginBottom: 32 }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className={`banter-loader__box banter-box-${i + 1}`} />
      ))}
    </div>
    <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#000000', letterSpacing: 3 }}>Building Graph</p>
    <p className="text-[10px] mt-1.5" style={{ color: '#000000', opacity: 0.45 }}>Fetching network transactions…</p>
    <style>{`
      .banter-loader { position: relative; }
      .banter-loader__box {
        float: left; position: relative; width: 20px; height: 20px; margin-right: 6px;
      }
      .banter-loader__box::before {
        content: ""; position: absolute; left: 0; top: 0;
        width: 100%; height: 100%; background: #facc15;
      }
      .banter-loader__box:nth-child(3n) { margin-right: 0; margin-bottom: 6px; }
      .banter-loader__box:nth-child(1)::before,
      .banter-loader__box:nth-child(4)::before { margin-left: 26px; }
      .banter-loader__box:nth-child(3)::before { margin-top: 52px; }
      .banter-loader__box:last-child { margin-bottom: 0; }
      .banter-loader__box:nth-child(1) { animation: banterMoveBox-1 4s infinite; }
      .banter-loader__box:nth-child(2) { animation: banterMoveBox-2 4s infinite; }
      .banter-loader__box:nth-child(3) { animation: banterMoveBox-3 4s infinite; }
      .banter-loader__box:nth-child(4) { animation: banterMoveBox-4 4s infinite; }
      .banter-loader__box:nth-child(5) { animation: banterMoveBox-5 4s infinite; }
      .banter-loader__box:nth-child(6) { animation: banterMoveBox-6 4s infinite; }
      .banter-loader__box:nth-child(7) { animation: banterMoveBox-7 4s infinite; }
      .banter-loader__box:nth-child(8) { animation: banterMoveBox-8 4s infinite; }
      .banter-loader__box:nth-child(9) { animation: banterMoveBox-9 4s infinite; }
      @keyframes banterMoveBox-1 {
        9.09% { transform: translate(-26px,0); } 18.18% { transform: translate(0,0); }
        27.27% { transform: translate(0,0); } 36.36% { transform: translate(26px,0); }
        45.45% { transform: translate(26px,26px); } 54.55% { transform: translate(26px,26px); }
        63.64% { transform: translate(26px,26px); } 72.73% { transform: translate(26px,0); }
        81.82% { transform: translate(0,0); } 90.91% { transform: translate(-26px,0); }
        100% { transform: translate(0,0); }
      }
      @keyframes banterMoveBox-2 {
        9.09% { transform: translate(0,0); } 18.18% { transform: translate(26px,0); }
        27.27% { transform: translate(0,0); } 36.36% { transform: translate(26px,0); }
        45.45% { transform: translate(26px,26px); } 54.55% { transform: translate(26px,26px); }
        63.64% { transform: translate(26px,26px); } 72.73% { transform: translate(26px,26px); }
        81.82% { transform: translate(0,26px); } 90.91% { transform: translate(0,26px); }
        100% { transform: translate(0,0); }
      }
      @keyframes banterMoveBox-3 {
        9.09% { transform: translate(-26px,0); } 18.18% { transform: translate(-26px,0); }
        27.27% { transform: translate(0,0); } 36.36% { transform: translate(-26px,0); }
        45.45% { transform: translate(-26px,0); } 54.55% { transform: translate(-26px,0); }
        63.64% { transform: translate(-26px,0); } 72.73% { transform: translate(-26px,0); }
        81.82% { transform: translate(-26px,-26px); } 90.91% { transform: translate(0,-26px); }
        100% { transform: translate(0,0); }
      }
      @keyframes banterMoveBox-4 {
        9.09% { transform: translate(-26px,0); } 18.18% { transform: translate(-26px,0); }
        27.27% { transform: translate(-26px,-26px); } 36.36% { transform: translate(0,-26px); }
        45.45% { transform: translate(0,0); } 54.55% { transform: translate(0,-26px); }
        63.64% { transform: translate(0,-26px); } 72.73% { transform: translate(0,-26px); }
        81.82% { transform: translate(-26px,-26px); } 90.91% { transform: translate(-26px,0); }
        100% { transform: translate(0,0); }
      }
      @keyframes banterMoveBox-5 {
        9.09% { transform: translate(0,0); } 18.18% { transform: translate(0,0); }
        27.27% { transform: translate(0,0); } 36.36% { transform: translate(26px,0); }
        45.45% { transform: translate(26px,0); } 54.55% { transform: translate(26px,0); }
        63.64% { transform: translate(26px,0); } 72.73% { transform: translate(26px,0); }
        81.82% { transform: translate(26px,-26px); } 90.91% { transform: translate(0,-26px); }
        100% { transform: translate(0,0); }
      }
      @keyframes banterMoveBox-6 {
        9.09% { transform: translate(0,0); } 18.18% { transform: translate(-26px,0); }
        27.27% { transform: translate(-26px,0); } 36.36% { transform: translate(0,0); }
        45.45% { transform: translate(0,0); } 54.55% { transform: translate(0,0); }
        63.64% { transform: translate(0,0); } 72.73% { transform: translate(0,26px); }
        81.82% { transform: translate(-26px,26px); } 90.91% { transform: translate(-26px,0); }
        100% { transform: translate(0,0); }
      }
      @keyframes banterMoveBox-7 {
        9.09% { transform: translate(26px,0); } 18.18% { transform: translate(26px,0); }
        27.27% { transform: translate(26px,0); } 36.36% { transform: translate(0,0); }
        45.45% { transform: translate(0,-26px); } 54.55% { transform: translate(26px,-26px); }
        63.64% { transform: translate(0,-26px); } 72.73% { transform: translate(0,-26px); }
        81.82% { transform: translate(0,0); } 90.91% { transform: translate(26px,0); }
        100% { transform: translate(0,0); }
      }
      @keyframes banterMoveBox-8 {
        9.09% { transform: translate(0,0); } 18.18% { transform: translate(-26px,0); }
        27.27% { transform: translate(-26px,-26px); } 36.36% { transform: translate(0,-26px); }
        45.45% { transform: translate(0,-26px); } 54.55% { transform: translate(0,-26px); }
        63.64% { transform: translate(0,-26px); } 72.73% { transform: translate(0,-26px); }
        81.82% { transform: translate(26px,-26px); } 90.91% { transform: translate(26px,0); }
        100% { transform: translate(0,0); }
      }
      @keyframes banterMoveBox-9 {
        9.09% { transform: translate(-26px,0); } 18.18% { transform: translate(-26px,0); }
        27.27% { transform: translate(0,0); } 36.36% { transform: translate(-26px,0); }
        45.45% { transform: translate(0,0); } 54.55% { transform: translate(0,0); }
        63.64% { transform: translate(-26px,0); } 72.73% { transform: translate(-26px,0); }
        81.82% { transform: translate(-52px,0); } 90.91% { transform: translate(-26px,0); }
        100% { transform: translate(0,0); }
      }
    `}</style>
  </div>
);

export const DAGPage: React.FC = () => {
  const { state, setSearchQuery } = useApp();

  return (
    <div className="fixed inset-0 z-40 bg-white dark:bg-gray-950">
      <Suspense fallback={<DAGLoader />}>
        <DAGApp
          externalSearchQuery={state.searchQuery}
          onExternalSearchHandled={() => setSearchQuery('')}
        />
      </Suspense>
    </div>
  );
};
