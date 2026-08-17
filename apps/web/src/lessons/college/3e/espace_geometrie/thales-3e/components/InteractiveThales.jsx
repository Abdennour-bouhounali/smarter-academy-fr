import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * InteractiveThales — Interactive SVG figure for Thales Theorem
 * 
 * Props:
 * - config: 'standard', 'papillon', or 'both' (allows dragging k from -1 to 1)
 * - showLengths: boolean to show length labels
 * - highlight: 'none', 'small', 'large', 'ratio' (highlights corresponding sides)
 * - onKChange: callback when k changes
 */
export default function InteractiveThales({ 
  config = 'standard', 
  showLengths = false, 
  highlight = 'none',
  interactive = true,
  onKChange = () => {} 
}) {
  // Base triangle vertices. 
  // If config supports papillon, we center A vertically to give room for M and N to go upwards.
  const [A, setA] = useState({ x: 200, y: config !== 'standard' ? 120 : 50 });
  const [B, setB] = useState({ x: 80, y: 250 });
  const [C, setC] = useState({ x: 320, y: 250 });
  
  // k is the ratio AM/AB. 
  // k > 0 : standard configuration
  // k < 0 : papillon configuration
  const [k, setK] = useState(config === 'papillon' ? -0.5 : 0.6);
  
  const [draggedPoint, setDraggedPoint] = useState(null);
  const svgRef = useRef(null);

  // Derived points M and N based on k
  const M = { x: A.x + k * (B.x - A.x), y: A.y + k * (B.y - A.y) };
  const N = { x: A.x + k * (C.x - A.x), y: A.y + k * (C.y - A.y) };

  useEffect(() => {
    onKChange(k);
  }, [k, onKChange]);

  const handlePointerDown = (e, pointId) => {
    if (!interactive) return;
    e.target.setPointerCapture(e.pointerId);
    setDraggedPoint(pointId);
  };

  const handlePointerMove = (e) => {
    if (!draggedPoint || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const viewBoxX = 0;
    const viewBoxY = 0;
    const viewBoxWidth = 400;
    const viewBoxHeight = 300;
    
    // Convert screen coords to SVG viewBox coords
    const x = ((e.clientX - rect.left) / rect.width) * viewBoxWidth + viewBoxX;
    const y = ((e.clientY - rect.top) / rect.height) * viewBoxHeight + viewBoxY;
    
    // Clamp to viewBox
    const clampedX = Math.max(20, Math.min(380, x));
    const clampedY = Math.max(20, Math.min(280, y));

    if (draggedPoint === 'A') setA({ x: clampedX, y: clampedY });
    if (draggedPoint === 'B') setB({ x: clampedX, y: clampedY });
    if (draggedPoint === 'C') setC({ x: clampedX, y: clampedY });
    
    // If dragging M, we project the mouse position onto line AB to find new k
    if (draggedPoint === 'M') {
      const vAB = { x: B.x - A.x, y: B.y - A.y };
      const vAM = { x: clampedX - A.x, y: clampedY - A.y };
      
      const dot = vAM.x * vAB.x + vAM.y * vAB.y;
      const lenSq = vAB.x * vAB.x + vAB.y * vAB.y;
      
      let newK = dot / lenSq;
      
      // Limit k based on config
      if (config === 'standard') {
        newK = Math.max(0.1, Math.min(0.9, newK));
      } else if (config === 'papillon') {
        newK = Math.max(-0.9, Math.min(-0.1, newK));
      } else {
        newK = Math.max(-0.9, Math.min(0.9, newK));
      }
      
      setK(newK);
    }
  };

  const handlePointerUp = () => {
    setDraggedPoint(null);
  };

  // Helper to calculate distance
  const dist = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)).toFixed(1);

  // Helper to determine styling based on highlight mode
  const getLineStyle = (isSmallTriangle, isBase) => {
    if (highlight === 'none') return "stroke-slate-400 stroke-2";
    if (highlight === 'small' && isSmallTriangle) return "stroke-blue-500 stroke-[3px]";
    if (highlight === 'large' && !isSmallTriangle) return "stroke-emerald-500 stroke-[3px]";
    
    // For 'ratio' mode, we might highlight specific sides, this will be handled externally or via more specific props.
    // For now, default fallback:
    return "stroke-slate-300 stroke-2";
  };

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-xl border border-slate-200 shadow-inner">
      <svg
        ref={svgRef}
        viewBox="0 0 400 300"
        className="w-full max-w-lg touch-none select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Lines representing the infinite lines (AB) and (AC) if in papillon or both mode */}
        {config !== 'standard' && (
           <>
            <line x1={A.x - (B.x - A.x)*1.5} y1={A.y - (B.y - A.y)*1.5} x2={B.x + (B.x - A.x)*0.5} y2={B.y + (B.y - A.y)*0.5} className="stroke-slate-200 stroke-1 stroke-dasharray-4" />
            <line x1={A.x - (C.x - A.x)*1.5} y1={A.y - (C.y - A.y)*1.5} x2={C.x + (C.x - A.x)*0.5} y2={C.y + (C.y - A.y)*0.5} className="stroke-slate-200 stroke-1 stroke-dasharray-4" />
           </>
        )}

        {/* Large Triangle ABC */}
        <polygon 
          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} 
          className={`fill-emerald-50/50 transition-colors ${highlight === 'large' ? 'fill-emerald-100/80 stroke-emerald-500 stroke-[3px]' : 'stroke-slate-400 stroke-2'}`}
        />
        
        {/* Small Triangle AMN */}
        <polygon 
          points={`${A.x},${A.y} ${M.x},${M.y} ${N.x},${N.y}`} 
          className={`fill-blue-50/80 transition-colors ${highlight === 'small' ? 'fill-blue-100/80 stroke-blue-500 stroke-[3px]' : 'stroke-blue-400 stroke-2'}`}
        />

        {/* Parallel lines markings */}
        <line x1={M.x} y1={M.y} x2={N.x} y2={N.y} className={getLineStyle(true, true) + " stroke-rose-500 stroke-[3px]"} />
        <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} className={getLineStyle(false, true) + " stroke-rose-500 stroke-[3px]"} />
        
        {/* Decorative parallel arrows (if k > 0) */}
        {k > 0 && (
          <>
            <path d={`M ${(M.x+N.x)/2 - 5} ${(M.y+N.y)/2} L ${(M.x+N.x)/2 + 5} ${(M.y+N.y)/2}`} className="stroke-rose-600 stroke-2" markerEnd="url(#arrow)" />
            <path d={`M ${(B.x+C.x)/2 - 5} ${(B.y+C.y)/2} L ${(B.x+C.x)/2 + 5} ${(B.y+C.y)/2}`} className="stroke-rose-600 stroke-2" markerEnd="url(#arrow)" />
          </>
        )}

        {/* Labels for Vertices */}
        <text x={A.x} y={A.y - 10} className="fill-slate-800 font-bold text-sm text-center" textAnchor="middle">A</text>
        <text x={B.x - 10} y={B.y + 15} className="fill-slate-800 font-bold text-sm text-center" textAnchor="middle">B</text>
        <text x={C.x + 10} y={C.y + 15} className="fill-slate-800 font-bold text-sm text-center" textAnchor="middle">C</text>
        
        <text x={M.x - 15} y={M.y + 5} className="fill-blue-800 font-bold text-sm text-center" textAnchor="middle">M</text>
        <text x={N.x + 15} y={N.y + 5} className="fill-blue-800 font-bold text-sm text-center" textAnchor="middle">N</text>

        {/* Optional Lengths */}
        {showLengths && (
          <>
            <text x={(A.x + B.x)/2 - 20} y={(A.y + B.y)/2} className="fill-emerald-700 text-[10px] font-mono">{dist(A, B)}</text>
            <text x={(A.x + C.x)/2 + 5} y={(A.y + C.y)/2} className="fill-emerald-700 text-[10px] font-mono">{dist(A, C)}</text>
            
            <text x={(A.x + M.x)/2 - 20} y={(A.y + M.y)/2} className="fill-blue-700 text-[10px] font-mono font-bold">{dist(A, M)}</text>
            <text x={(A.x + N.x)/2 + 5} y={(A.y + N.y)/2} className="fill-blue-700 text-[10px] font-mono font-bold">{dist(A, N)}</text>
          </>
        )}

        {/* Draggable Points handles */}
        {interactive && (
          <>
            <circle cx={A.x} cy={A.y} r={15} fill="transparent" className="cursor-move" onPointerDown={(e) => handlePointerDown(e, 'A')} />
            <circle cx={A.x} cy={A.y} r={4} fill="#1e293b" className="pointer-events-none" />
            
            <circle cx={B.x} cy={B.y} r={15} fill="transparent" className="cursor-move" onPointerDown={(e) => handlePointerDown(e, 'B')} />
            <circle cx={B.x} cy={B.y} r={4} fill="#1e293b" className="pointer-events-none" />
            
            <circle cx={C.x} cy={C.y} r={15} fill="transparent" className="cursor-move" onPointerDown={(e) => handlePointerDown(e, 'C')} />
            <circle cx={C.x} cy={C.y} r={4} fill="#1e293b" className="pointer-events-none" />
            
            {/* M is special, dragging it changes k */}
            <circle cx={M.x} cy={M.y} r={20} fill="transparent" className="cursor-pointer" onPointerDown={(e) => handlePointerDown(e, 'M')} />
            <circle cx={M.x} cy={M.y} r={6} fill="#3b82f6" className="pointer-events-none stroke-white stroke-2" />
            
            <circle cx={N.x} cy={N.y} r={5} fill="#3b82f6" className="pointer-events-none stroke-white stroke-2" />
          </>
        )}
      </svg>
      
      {interactive && config === 'both' && (
        <div className="w-full max-w-sm mt-4 flex items-center gap-4">
          <span className="text-xs font-mono text-slate-500">Papillon</span>
          <input 
            type="range" 
            min="-0.9" max="0.9" step="0.05" 
            value={k} 
            onChange={(e) => setK(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-xs font-mono text-slate-500">Classique</span>
        </div>
      )}
      
      {interactive && (
        <p className="text-[10px] text-slate-400 mt-2 text-center">Déplacez les points A, B, C ou glissez M le long du segment.</p>
      )}
    </div>
  );
}
