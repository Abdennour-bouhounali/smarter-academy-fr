import React, { useEffect } from 'react';
import { Mafs, Coordinates, Plot, Point } from "mafs";
import "mafs/core.css";
import "mafs/font.css";

const GRAPH_HEIGHT = 260; // px — must match the container height in Hero.jsx

export default function MafsGraph({ a, b, onLoad }) {
  // Mafs is synchronous and renders instantly via React.
  // We trigger the onLoad callback immediately to clear the loading state in Hero.
  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  return (
    <div style={{ width: '100%', height: `${GRAPH_HEIGHT}px` }} className="bg-white">
      <Mafs 
        height={GRAPH_HEIGHT}
        viewBox={{ x: [-6, 6], y: [-6, 6] }} 
        pan={true} 
        zoom={true}
      >
        <Coordinates.Cartesian 
          xAxis={{ lines: 1, labels: (n) => (n !== 0 ? n : "") }} 
          yAxis={{ lines: 1, labels: (n) => (n !== 0 ? n : "") }} 
        />
        
        {/* The line f(x) = a*x + b */}
        <Plot.OfX y={(x) => a * x + b} color="#10b981" weight={4} />

        {/* Y-intercept B = (0, b) */}
        <Point x={0} y={b} color="#f59e0b" />

        {/* Slope point P = (2, 2a + b) */}
        <Point x={2} y={a * 2 + b} color="#3b82f6" />
      </Mafs>
    </div>
  );
}
