import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PIZZA_CX, PIZZA_CY, PIZZA_R,
  polarToCartesian, slicePath, arcPath, bisector,
  seededRandom, angleSpan,
} from './fractionUtils';

/**
 * PizzaSVG — the mathematical object at the center of the Fraction Lab.
 *
 * For N slices described by `angles` (an array of {start, end} in degrees,
 * 0° = top, clockwise), every visual — the wedge shape, the selection hit
 * area, the crust/topping decoration, the lift-apart animation, the label —
 * is derived from that same angle data. Nothing about what the student sees
 * is independent of the mathematical state.
 *
 * Equal partitions and unequal (deliberately "bad") partitions use the exact
 * same rendering path — the geometry is what makes a partition look correct
 * or not, never a special-cased "equal mode".
 *
 * Freeform cutting (dragging cut points) is NOT handled here: a caller that
 * needs draggable handles renders them via the `overlay` prop, sharing the
 * same PIZZA_CX/CY/R coordinate space and the `angleFromPoint` helper — this
 * component stays focused on "given angles, render + let the student select".
 */

const TONE = {
  rose: { fill: '#fb7185', fillSoft: 'rgba(244,63,94,0.32)', stroke: '#e11d48' },
  emerald: { fill: '#34d399', fillSoft: 'rgba(16,185,129,0.32)', stroke: '#059669' },
  blue: { fill: '#60a5fa', fillSoft: 'rgba(59,130,246,0.32)', stroke: '#2563eb' },
  amber: { fill: '#fbbf24', fillSoft: 'rgba(245,158,11,0.32)', stroke: '#b45309' },
  indigo: { fill: '#818cf8', fillSoft: 'rgba(99,102,241,0.32)', stroke: '#4338ca' },
  violet: { fill: '#c084fc', fillSoft: 'rgba(168,85,247,0.32)', stroke: '#7e22ce' },
};

const DOUGH = '#f3d9a0';
const CRUST = '#d79a45';
const SAUCE = '#d64545';
const CHEESE = '#fbdd7e';
const PEPPERONI = '#b23a2f';

function Toppings({ index, start, end, seed }) {
  const rand = useMemo(() => seededRandom(seed * 977 + index * 131 + 7), [seed, index]);
  const span = end - start;
  const count = span >= 45 ? 4 : span >= 25 ? 2 : span >= 12 ? 1 : 0;
  const items = [];
  for (let k = 0; k < count; k++) {
    const margin = Math.min(span * 0.22, 9);
    const a = start + margin + rand() * (span - margin * 2);
    const r = PIZZA_R * (0.28 + rand() * 0.42);
    const p = polarToCartesian(0, 0, r, a);
    items.push({ x: p.x, y: p.y, s: 4.2 + rand() * 1.6 });
  }
  return (
    <>
      {items.map((it, i) => (
        <circle key={i} cx={it.x} cy={it.y} r={it.s} fill={PEPPERONI} stroke="#7a2620" strokeWidth={0.5} />
      ))}
    </>
  );
}

function Slice({
  index, start, end, total, seed,
  selected, interactive, onToggle, disabled,
  liftDx, liftDy, dimmed, labelMode, toneKey, ariaLabel, showCutLines, pulse,
}) {
  const t = TONE[toneKey] || TONE.rose;
  const mid = bisector(start, end);
  const wedge = slicePath(0, 0, PIZZA_R, start, end);
  const crustArc = arcPath(0, 0, PIZZA_R - 3, start, end);
  const sauceWedge = slicePath(0, 0, PIZZA_R * 0.86, start, end);
  const cheeseWedge = slicePath(0, 0, PIZZA_R * 0.8, start, end);
  const labelPos = polarToCartesian(0, 0, PIZZA_R * 0.6, mid);

  const handleKey = (e) => {
    if (!interactive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle(index);
    }
  };

  return (
    <motion.g
      initial={false}
      animate={{ x: liftDx, y: liftDy, opacity: dimmed ? 0.32 : 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      <path d={wedge} fill={DOUGH} stroke="none" />
      <path d={sauceWedge} fill={SAUCE} opacity={0.85} stroke="none" />
      <path d={cheeseWedge} fill={CHEESE} opacity={0.92} stroke="none" />
      <Toppings index={index} start={start} end={end} seed={seed} />
      <path d={crustArc} fill="none" stroke={CRUST} strokeWidth={7} strokeLinecap="round" />

      {/* Hit area + selection tint + cut-line strokes — the mathematical layer */}
      <path
        d={wedge}
        fill={selected ? t.fillSoft : 'transparent'}
        strokeWidth={selected ? 3 : 2}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive && !disabled ? 0 : undefined}
        aria-pressed={interactive ? selected : undefined}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        onClick={interactive && !disabled ? () => onToggle(index) : undefined}
        onKeyDown={interactive && !disabled ? handleKey : undefined}
        className={
          interactive && !disabled
            ? 'outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900'
            : undefined
        }
        style={{
          cursor: interactive && !disabled ? 'pointer' : 'default',
          stroke: selected ? t.stroke : showCutLines ? '#ffffff' : 'transparent',
        }}
      />
      {pulse && (
        <motion.path
          d={wedge}
          fill="none"
          stroke={t.stroke}
          strokeWidth={4}
          initial={{ opacity: 0.9 }}
          animate={{ opacity: [0.9, 0.1, 0.9] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
      )}
      {labelMode !== 'none' && (
        <g pointerEvents="none">
          <circle cx={labelPos.x} cy={labelPos.y} r={10} fill="#1e293b" opacity={0.82} />
          <text
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={labelMode === 'angle' ? 7.5 : 10}
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="700"
            fill="#ffffff"
          >
            {labelMode === 'angle' ? `${Math.round(angleSpan({ start, end }))}°` : index + 1}
          </text>
        </g>
      )}
    </motion.g>
  );
}

export default function PizzaSVG({
  angles,
  selected = [],
  onToggle = null,
  lifted = null,
  liftDistance = 9,
  dimmed = null,
  labels = 'none',
  size = 300,
  seed = 1,
  tone = 'rose',
  disabled = false,
  ariaLabel,
  showCutLines = true,
  pulseIndices = null,
  overlay = null,
  className = '',
}) {
  const n = angles.length;
  const selSet = useMemo(() => new Set(selected), [selected]);
  const dimSet = useMemo(() => new Set(dimmed || []), [dimmed]);
  const pulseSet = useMemo(() => new Set(pulseIndices || []), [pulseIndices]);

  const isWholeCircle = n === 1 && Math.abs(angleSpan(angles[0]) - 360) < 0.01;

  const liftFor = (i) => {
    if (!lifted) return { x: 0, y: 0 };
    const on = lifted === 'all' || (lifted === 'selected' ? selSet.has(i) : Array.isArray(lifted) && lifted.includes(i));
    if (!on) return { x: 0, y: 0 };
    const mid = bisector(angles[i].start, angles[i].end);
    const p = polarToCartesian(0, 0, liftDistance, mid);
    return { x: p.x, y: p.y };
  };

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="group"
      aria-label={ariaLabel ? undefined : `Pizza partagée en ${n} part${n > 1 ? 's' : ''}`}
    >
      <g transform={`translate(${PIZZA_CX} ${PIZZA_CY})`}>
        <circle r={PIZZA_R + 4} fill="#00000014" cy={2.5} />
        {isWholeCircle ? (
          <>
            <circle r={PIZZA_R} fill={DOUGH} />
            <circle r={PIZZA_R * 0.86} fill={SAUCE} opacity={0.85} />
            <circle r={PIZZA_R * 0.8} fill={CHEESE} opacity={0.92} />
            <Toppings index={0} start={0} end={360} seed={seed} />
            <circle r={PIZZA_R - 3} fill="none" stroke={CRUST} strokeWidth={7} />
            <circle
              r={PIZZA_R}
              fill={selSet.has(0) ? (TONE[tone] || TONE.rose).fillSoft : 'transparent'}
              stroke={selSet.has(0) ? (TONE[tone] || TONE.rose).stroke : 'transparent'}
              strokeWidth={3}
              role={onToggle ? 'button' : undefined}
              tabIndex={onToggle && !disabled ? 0 : undefined}
              aria-pressed={onToggle ? selSet.has(0) : undefined}
              aria-label={typeof ariaLabel === 'function' ? ariaLabel(0, 1) : ariaLabel}
              onClick={onToggle && !disabled ? () => onToggle(0) : undefined}
              onKeyDown={
                onToggle && !disabled
                  ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(0); } }
                  : undefined
              }
              style={{ cursor: onToggle && !disabled ? 'pointer' : 'default' }}
            />
          </>
        ) : (
          angles.map((a, i) => (
            <Slice
              key={i}
              index={i}
              start={a.start}
              end={a.end}
              total={n}
              seed={seed}
              selected={selSet.has(i)}
              interactive={!!onToggle}
              onToggle={onToggle}
              disabled={disabled}
              liftDx={liftFor(i).x}
              liftDy={liftFor(i).y}
              dimmed={dimSet.has(i)}
              labelMode={labels}
              toneKey={tone}
              ariaLabel={typeof ariaLabel === 'function' ? ariaLabel(i, n) : ariaLabel}
              showCutLines={showCutLines}
              pulse={pulseSet.has(i)}
            />
          ))
        )}
        {overlay}
      </g>
    </svg>
  );
}

export { TONE };
