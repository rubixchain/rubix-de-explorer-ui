import React, { useRef, useEffect } from 'react';
import createGlobe from 'cobe';

interface GlobeProps {
  className?: string;
  config?: any;
}

export const Globe: React.FC<GlobeProps> = ({ className = '', config = {} }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600,
      height: 600,
      phi: 0,
      theta: 0,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 4,
      baseColor: [0.1, 0.1, 0.2],
      markerColor: [0.2, 0.8, 1],
      glowColor: [0.2, 0.8, 1],
      markers: [
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.0060], size: 0.05 },
        { location: [51.5074, -0.1278], size: 0.04 },
        { location: [35.6762, 139.6503], size: 0.04 },
        { location: [55.7558, 37.6176], size: 0.03 },
        { location: [-33.9249, 18.4241], size: 0.03 },
        { location: [-22.9068, -43.1729], size: 0.03 },
        { location: [1.3521, 103.8198], size: 0.04 },
      ],
      onRender: (state) => {
        state.phi = 0.3;
      },
      ...config,
    });

    return () => {
      globe.destroy();
    };
  }, [config]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
