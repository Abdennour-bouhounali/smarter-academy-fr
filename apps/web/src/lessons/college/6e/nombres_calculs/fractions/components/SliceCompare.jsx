import React from 'react';
import { motion } from 'framer-motion';
import { PIZZA_R, slicePath, polarToCartesian } from './fractionUtils';

/**
 * SliceCompare — Wow Moment #2. Two slices are placed on top of each other,
 * sharing one edge, so their angular size can be compared visually through
 * transparency: same angle → the wedges coincide exactly; different angle →
 * one sticks out past the other. This is the geometry → quantity bridge —
 * there is no numeric readout until the student has looked at the overlap.
 */
export default function SliceCompare({ spanA, spanB, colorA = '#2563eb', colorB = '#e11d48', size = 220 }) {
  const wedgeA = slicePath(0, 0, PIZZA_R, 0, spanA);
  const wedgeB = slicePath(0, 0, PIZZA_R, 0, spanB);
  const bigger = Math.max(spanA, spanB);
  const labelPosA = polarToCartesian(0, 0, PIZZA_R * 0.62, spanA / 2);
  const labelPosB = polarToCartesian(0, 0, PIZZA_R * 0.88, spanB / 2);

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={`Comparaison superposée : ${Math.round(spanA)}° contre ${Math.round(spanB)}°`}>
      <g transform="translate(100 100)">
        <circle r={PIZZA_R + 2} fill="none" stroke="#e2e8f0" strokeWidth={2} strokeDasharray="3 4" />
        <motion.path
          d={wedgeA}
          fill={colorA}
          fillOpacity={0.5}
          stroke={colorA}
          strokeWidth={2.5}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.path
          d={wedgeB}
          fill={colorB}
          fillOpacity={0.5}
          stroke={colorB}
          strokeWidth={2.5}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        />
        <text x={labelPosA.x} y={labelPosA.y} textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize={9} fontWeight="700" fill="#0f172a">
          {Math.round(spanA)}°
        </text>
        <text x={labelPosB.x} y={labelPosB.y} textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize={9} fontWeight="700" fill="#0f172a">
          {Math.round(spanB)}°
        </text>
      </g>
    </svg>
  );
}
