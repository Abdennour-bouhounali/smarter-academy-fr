import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PartitionShape — une unité (barre ou disque) partagée en parts.
 *
 * Deux modes :
 *   affichage    → shaded / cells fixent les parts coloriées (lecture)
 *   interactif   → onToggle rend chaque part cliquable (construction)
 *
 * `highlight` = 'numerator' | 'denominator' | null
 *   → affiche une annotation visuelle claire du nombre sur le dessin.
 */

const TONE = {
  emerald: { fill: '#10b981', soft: '#ecfdf5', border: '#6ee7b7', text: 'text-emerald-700' },
  sky:     { fill: '#0ea5e9', soft: '#f0f9ff', border: '#7dd3fc', text: 'text-sky-700' },
  violet:  { fill: '#8b5cf6', soft: '#f5f3ff', border: '#c4b5fd', text: 'text-violet-700' },
  amber:   { fill: '#f59e0b', soft: '#fffbeb', border: '#fcd34d', text: 'text-amber-700' },
  rose:    { fill: '#f43f5e', soft: '#fff1f2', border: '#fda4af', text: 'text-rose-700' },
};

export const PARTITION_TONE = TONE;

// Couleurs d'annotation
const NUM_COLOR  = '#ef4444'; // rouge — numérateur (parts prises)
const DEN_COLOR  = '#6366f1'; // indigo — dénominateur (toutes les parts)

function equalWeights(parts) {
  return Array.from({ length: parts }, () => 1);
}

/* ─── Forme barre (rectangle) ────────────────────────────────────── */
function BarShape({ parts, shaded, weights, isShaded, interactive, onToggle, tone, highlight, size }) {
  const w = weights || equalWeights(parts);
  const total = w.reduce((a, b) => a + b, 0);
  const heights = { sm: 'h-12', md: 'h-16 sm:h-20', lg: 'h-24 sm:h-28' };

  return (
    <div className="relative">
      <div
        className={`${heights[size] || heights.md} w-full rounded-xl border-2 overflow-hidden flex relative`}
        style={{ borderColor: highlight === 'denominator' ? DEN_COLOR : tone.border, borderWidth: highlight ? '3px' : '2px' }}
      >
        {Array.from({ length: parts }, (_, i) => {
          const on = isShaded(i);
          const isNumHi = highlight === 'numerator' && on;
          const isDenHi = highlight === 'denominator';

          const style = {
            flex: `0 0 ${(w[i] / total) * 100}%`,
            backgroundColor: on ? tone.fill : tone.soft,
            borderRight: i < parts - 1 ? '2px solid #94a3b8' : 'none',
            // numérateur : éclat lumineux sur les parts prises
            ...(isNumHi && { filter: 'brightness(1.1)' }),
            // dénominateur : légère teinte indigo sur les parts non prises
            ...(!on && isDenHi && { backgroundColor: '#e0e7ff' }),
          };

          if (!interactive) {
            return <motion.div key={i} initial={false} animate={{ opacity: 1 }} style={style} />;
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggle(i)}
              aria-pressed={on}
              aria-label={`Part ${i + 1} sur ${parts}`}
              className="transition-colors hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
              style={style}
            />
          );
        })}

        {/* ── Overlay Numérateur (Bordure globale de la zone coloriée) ── */}
        {highlight === 'numerator' && shaded > 0 && (
          <div
            className="absolute top-0 left-0 h-full pointer-events-none"
            style={{
              width: `${(shaded / parts) * 100}%`,
              border: `3px solid ${NUM_COLOR}`,
            }}
          />
        )}
      </div>

      {/* ── Annotations numérateur ─────────────────────────────────────── */}
      <AnimatePresence>
        {highlight === 'numerator' && shaded > 0 && (
          <motion.div
            key="num-label-bar"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute -top-8 left-0 flex justify-center"
            style={{ width: `${(shaded / parts) * 100}%` }}
          >
            <div
              className="font-black text-white rounded-full px-3 py-1 text-sm leading-none shadow-lg"
              style={{ background: NUM_COLOR }}
            >
              {shaded}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Annotations dénominateur ───────────────────────────────────── */}
      <AnimatePresence>
        {highlight === 'denominator' && (
          <motion.div
            key="den-label-bar"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-2 w-full flex justify-center"
          >
            <div
              className="font-black text-white rounded-full px-3 py-1 text-sm leading-none shadow-lg"
              style={{ background: DEN_COLOR }}
            >
              {parts} parts au total
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Part-count badges per-cell when denominator active ──────── */}
      <AnimatePresence>
        {highlight === 'denominator' && (
          <motion.div
            key="den-badges"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 flex pointer-events-none ${heights[size] || heights.md}`}
          >
            {Array.from({ length: parts }, (_, i) => (
              <div
                key={i}
                className="flex-1 flex items-center justify-center"
              >
                <span
                  className="text-[10px] font-black rounded-sm px-0.5 leading-none"
                  style={{ color: DEN_COLOR, background: 'rgba(255,255,255,0.75)' }}
                >
                  {i + 1}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Forme disque (camembert) ───────────────────────────────────── */
const R = 90;
const CX = 100;
const CY = 100;

function polarToCartesian(angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
}

function slicePath(startAngle, endAngle) {
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

/** Centroid d'un secteur angulaire pour y placer un label */
function sectorCentroid(startAngle, endAngle, r = 58) {
  const mid = (startAngle + endAngle) / 2;
  const a = ((mid - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

function CircleShape({ parts, shaded, weights, isShaded, interactive, onToggle, tone, highlight, size }) {
  const w = weights || equalWeights(parts);
  const total = w.reduce((a, b) => a + b, 0);
  const sizes = { sm: 'max-w-[140px]', md: 'max-w-[190px]', lg: 'max-w-[240px]' };

  let acc = 0;
  const slices = w.map((weight, i) => {
    const startAngle = (acc / total) * 360;
    acc += weight;
    const endAngle = (acc / total) * 360;
    const centroid = sectorCentroid(startAngle, endAngle);
    return { i, startAngle, endAngle, d: slicePath(startAngle, endAngle), centroid };
  });

  return (
    <div className={`mx-auto w-full ${sizes[size] || sizes.md}`}>
      <svg viewBox="0 0 200 200" className="w-full h-auto overflow-visible" role="img" aria-label={`Disque partagé en ${parts} parts égales`}>
        {/* fond */}
        <circle cx={CX} cy={CY} r={R} fill={tone.soft} stroke={highlight === 'denominator' ? DEN_COLOR : tone.border} strokeWidth={highlight ? 3 : 2} />

        {slices.map(({ i, d, centroid }) => {
          const on = isShaded(i);
          const isNumHi = highlight === 'numerator' && on;
          const isDenHi = highlight === 'denominator';

          const fillColor = on
            ? (isNumHi ? tone.fill : tone.fill)
            : (isDenHi ? '#e0e7ff' : 'transparent');

          const strokeColor = isDenHi ? DEN_COLOR : '#94a3b8';
          const strokeW = isDenHi ? 2.5 : 1.5;

          const common = { d, fill: fillColor, stroke: strokeColor, strokeWidth: strokeW };

          const slice = !interactive
            ? <path key={i} {...common} />
            : (
              <path
                key={i}
                {...common}
                onClick={() => onToggle(i)}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={`Part ${i + 1} sur ${parts}`}
                className="cursor-pointer transition-opacity hover:opacity-80 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(i); }
                }}
              />
            );

          return (
            <React.Fragment key={i}>
              {slice}
              {/* Numéro de chaque part quand dénominateur actif */}
              {isDenHi && (
                <text
                  x={centroid.x}
                  y={centroid.y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="900"
                  fill={DEN_COLOR}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {i + 1}
                </text>
              )}
            </React.Fragment>
          );
        })}

        {/* Bordure extérieure */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={highlight === 'denominator' ? DEN_COLOR : tone.border} strokeWidth={highlight ? 3 : 2} />

        {/* ── Overlay Numérateur (Bordure globale de la zone coloriée) ── */}
        {highlight === 'numerator' && shaded > 0 && (
          shaded === parts ? (
            <circle cx={CX} cy={CY} r={R} fill="none" stroke={NUM_COLOR} strokeWidth="3" pointerEvents="none" />
          ) : (
            <path
              d={slicePath(0, slices[shaded - 1].endAngle)}
              fill="none"
              stroke={NUM_COLOR}
              strokeWidth="3"
              pointerEvents="none"
            />
          )
        )}

        {/* ── Grand badge numérateur centré sur les parts prises ───── */}
        {highlight === 'numerator' && shaded > 0 && (() => {
          // Centroid de l'arc des parts prises (0 → shaded)
          const mid = sectorCentroid(0, (shaded / parts) * 360, 55);
          return (
            <>
              <circle cx={mid.x} cy={mid.y} r={14} fill={NUM_COLOR} />
              <text
                x={mid.x}
                y={mid.y + 5}
                textAnchor="middle"
                fontSize="15"
                fontWeight="900"
                fill="white"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {shaded}
              </text>
            </>
          );
        })()}

        {/* ── Badge dénominateur à l'extérieur du disque ─────────── */}
        {highlight === 'denominator' && (
          <>
            <circle cx={CX} cy={CY - R - 14} r={14} fill={DEN_COLOR} />
            <text
              x={CX}
              y={CY - R - 14 + 5}
              textAnchor="middle"
              fontSize="13"
              fontWeight="900"
              fill="white"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {parts}
            </text>
          </>
        )}
      </svg>

      {/* Légende sous le disque */}
      <AnimatePresence>
        {highlight === 'numerator' && (
          <motion.div
            key="num-legend"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1 text-center text-xs font-black"
            style={{ color: NUM_COLOR }}
          >
            {shaded} part{shaded > 1 ? 's' : ''} prise{shaded > 1 ? 's' : ''} = numérateur
          </motion.div>
        )}
        {highlight === 'denominator' && (
          <motion.div
            key="den-legend"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1 text-center text-xs font-black"
            style={{ color: DEN_COLOR }}
          >
            {parts} parts au total = dénominateur
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * @param {'bar'|'circle'} shape
 * @param {number} parts        nombre de parts égales (ignoré si weights fourni)
 * @param {number[]} [weights]  tailles relatives des parts (parts inégales)
 * @param {number} [shaded]     nombre de parts coloriées, en partant de 0
 * @param {number[]} [cells]    indices coloriés explicites — prioritaire sur shaded
 * @param {(i:number)=>void} [onToggle] rend le partage interactif
 * @param {'numerator'|'denominator'|null} [highlight] surligne le sens du nombre
 */
export default function PartitionShape({
  shape = 'bar',
  parts = 4,
  weights = null,
  shaded = 0,
  cells = null,
  onToggle,
  tone = 'emerald',
  size = 'md',
  highlight = null,
  caption,
}) {
  const t = TONE[tone] || TONE.emerald;
  const interactive = typeof onToggle === 'function';
  const isShaded = (i) => (cells ? cells.includes(i) : i < shaded);
  const shadedCount = cells ? cells.length : shaded;
  const Shape = shape === 'circle' ? CircleShape : BarShape;

  return (
    <div className="space-y-1.5">
      <div role={interactive ? 'group' : 'img'} aria-label={interactive ? undefined : caption}>
        <Shape
          parts={parts}
          shaded={shadedCount}
          weights={weights}
          isShaded={isShaded}
          interactive={interactive}
          onToggle={onToggle}
          tone={t}
          highlight={highlight}
          size={size}
        />
      </div>
      {caption && <p className={`text-xs font-mono text-center ${t.text}`}>{caption}</p>}
    </div>
  );
}
