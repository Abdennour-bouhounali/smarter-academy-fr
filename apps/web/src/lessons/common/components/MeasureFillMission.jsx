import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, AlertTriangle, ArrowRight, Lightbulb, Plus, Minus, Play } from 'lucide-react';
import { formatDec } from '@smarter-academy/core';

/**
 * MeasureFillMission — station de mesure des contenances.
 *
 * L'élève construit une quantité exacte en remplissant des mesures
 * (béchers transparents, taille proportionnelle à leur contenance) et en
 * les versant dans un réservoir gradué ; un robinet au pied du réservoir
 * permet d'en retirer une mesure. Tout passe par le geste :
 *
 *   action → la mesure se remplit → elle s'incline au-dessus du bord →
 *   le filet coule → le niveau monte (ou baisse par le robinet) → la
 *   surface ondule et se calme → SEULEMENT ALORS le nombre change.
 *
 * Props :
 *  - challenges : [{ id, targetMl, tankMl, unit, displayUnit?, tools: [{ id, ml, label }],
 *                    allowRemove?, solution?: [{ toolId, type: 'add'|'remove' }], rule? }]
 *  - mode       : 'free' (défis) | 'repeat' (une seule mesure répétée : 10 petites → 1 grande)
 *  - onChallengeSuccess(index), onAllCompleted()
 *  - react(isCorrect) : son/série du lesson kit (optionnel)
 *  - solved : revisite d'un module déjà complété → état final, sans commandes
 *
 * Aucune physique réelle : transitions CSS/SVG + framer-motion, légères sur
 * mobile ; `prefers-reduced-motion` raccourcit chaque phase sans changer la
 * logique (le nombre ne change qu'à la fin du geste).
 */

const UNIT_ML = { L: 1000, dL: 100, cL: 10, mL: 1 };
const UNIT_ORDER = ['L', 'dL', 'cL', 'mL'];
export const fmtQty = (ml, unit) => `${formatDec(ml / UNIT_ML[unit])} ${unit}`;

function conversionLine(ml, unit) {
  const smaller = UNIT_ORDER.slice(UNIT_ORDER.indexOf(unit) + 1);
  if (unit === 'mL') {
    const alts = ['cL', 'dL'].filter((u) => Number.isInteger((ml / UNIT_ML[u]) * 10));
    return [fmtQty(ml, 'mL'), ...alts.map((u) => fmtQty(ml, u))].join(' = ');
  }
  return [fmtQty(ml, unit), ...smaller.map((u) => fmtQty(ml, u))].join(' = ');
}

function scaleFor(tankMl) {
  if (tankMl >= 1000) return { major: 100, minor: 50, unit: 'dL', top: '1 L' };
  if (tankMl >= 100) return { major: 10, minor: 5, unit: 'cL', top: '1 dL' };
  return { major: 1, minor: 0, unit: 'mL', top: '1 cL' };
}

/* ── Géométrie du réservoir (viewBox) ─────────────────────────────── */
const T = { W: 344, H: 436, x0: 88, x1: 250, top: 36, bottom: 392, wall: 3 };
const INNER_TOP = T.top + 16;
const INNER_BOTTOM = T.bottom - 8;
const levelY = (ml, tankMl) => INNER_BOTTOM - (Math.max(0, ml) / tankMl) * (INNER_BOTTOM - INNER_TOP);
const POUR_X = T.x0 + 76; // où le filet tombe (le bec verseur vient se poser juste au-dessus)
const TAP = { x: T.x1 + 2, y: T.bottom - 30 }; // robinet

/* ── Le réservoir gradué ──────────────────────────────────────────── */
function Tank({ tankMl, visualMl, targetMl, targetLabel, stream, ripple, success, allowRemove, reduced, rimRef, tapRef, ariaLabel }) {
  const uid = useId();
  const scale = scaleFor(tankMl);
  const yLiquid = levelY(visualMl, tankMl);
  const yTarget = levelY(targetMl, tankMl);
  const n = Math.round(tankMl / scale.major);
  const ticks = [];
  for (let i = 1; i <= n; i += 1) ticks.push({ ml: i * scale.major, major: true, label: i === n ? scale.top : `${i} ${scale.unit}` });
  if (scale.minor) for (let ml = scale.minor; ml < tankMl; ml += scale.major) ticks.push({ ml, major: false });

  const move = reduced ? { duration: 0.15 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] };
  const targetColor = success ? '#10b981' : '#f59e0b';

  return (
    <div className="relative w-[min(100%,360px)] mx-auto lg:mx-0 select-none">
      {/* ancres géométriques pour le déplacement des mesures */}
      <div ref={rimRef} aria-hidden="true" className="absolute w-px h-px" style={{ left: `${(POUR_X / T.W) * 100}%`, top: `${((T.top - 30) / T.H) * 100}%` }} />
      <div ref={tapRef} aria-hidden="true" className="absolute w-px h-px" style={{ left: `${((TAP.x + 18) / T.W) * 100}%`, top: `${((TAP.y + 96) / T.H) * 100}%` }} />

      <svg viewBox={`0 0 ${T.W} ${T.H}`} className="w-full h-auto overflow-visible" role="img" aria-label={ariaLabel}>
        <defs>
          <clipPath id={`${uid}-inner`}>
            <path d={`M${T.x0 + T.wall},${T.top - 4} L${T.x0 + T.wall},${T.bottom - 16} Q${T.x0 + T.wall},${T.bottom - 3} ${T.x0 + 16},${T.bottom - 3} L${T.x1 - 16},${T.bottom - 3} Q${T.x1 - T.wall},${T.bottom - 3} ${T.x1 - T.wall},${T.bottom - 16} L${T.x1 - T.wall},${T.top - 4} Z`} />
          </clipPath>
          <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="0.55" stopColor="#f0f9ff" stopOpacity="0.25" />
            <stop offset="1" stopColor="#e2e8f0" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id={`${uid}-water`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7dd3fc" stopOpacity="0.85" />
            <stop offset="0.45" stopColor="#38bdf8" stopOpacity="0.88" />
            <stop offset="1" stopColor="#0369a1" stopOpacity="0.92" />
          </linearGradient>
          <linearGradient id={`${uid}-stream`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bae6fd" stopOpacity="0.9" />
            <stop offset="1" stopColor="#0ea5e9" stopOpacity="0.7" />
          </linearGradient>
          <filter id={`${uid}-glow`} x="-20%" y="-200%" width="140%" height="500%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ombre portée + socle */}
        <ellipse cx={(T.x0 + T.x1) / 2} cy={T.bottom + 14} rx={(T.x1 - T.x0) / 2 + 10} ry="9" fill="#0f172a" opacity="0.08" />
        <rect x={T.x0 - 10} y={T.bottom - 2} width={T.x1 - T.x0 + 20} height="12" rx="6" fill="#cbd5e1" />
        <rect x={T.x0 - 10} y={T.bottom - 2} width={T.x1 - T.x0 + 20} height="5" rx="2.5" fill="#e2e8f0" />

        {/* corps de verre (ouvert en haut) */}
        <path
          d={`M${T.x0},${T.top} L${T.x0},${T.bottom - 16} Q${T.x0},${T.bottom} ${T.x0 + 16},${T.bottom} L${T.x1 - 16},${T.bottom} Q${T.x1},${T.bottom} ${T.x1},${T.bottom - 16} L${T.x1},${T.top}`}
          fill={`url(#${uid}-glass)`}
          stroke="#94a3b8"
          strokeWidth={T.wall}
          strokeLinecap="round"
        />
        {/* bord supérieur (ouverture) */}
        <line x1={T.x0 - 5} y1={T.top} x2={T.x0 + 6} y2={T.top} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        <line x1={T.x1 - 6} y1={T.top} x2={T.x1 + 5} y2={T.top} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

        {/* liquide */}
        <g clipPath={`url(#${uid}-inner)`}>
          <motion.g initial={false} animate={{ y: yLiquid }} transition={move}>
            <rect x={T.x0} y="0" width={T.x1 - T.x0} height={T.H} fill={`url(#${uid}-water)`} />
            {/* ménisque : surface légèrement ondulée, dérive lente (désactivée en reduced motion) */}
            <motion.g initial={false} animate={{ scaleY: ripple ? 2.2 : 1, opacity: visualMl > 0 ? 1 : 0 }} transition={{ duration: 0.35 }} style={{ originY: '0px' }}>
              <g className={reduced ? '' : 'mfm-wave'}>
                <path
                  d={`M${T.x0 - 80},0 ${Array.from({ length: 8 }, (_, i) => `q10,-3 20,0 t20,0`).join(' ')} V14 H${T.x0 - 80} Z`}
                  fill="#0c4a6e"
                  opacity="0.35"
                />
                <path
                  d={`M${T.x0 - 80},1 ${Array.from({ length: 8 }, () => `q10,-3 20,0 t20,0`).join(' ')}`}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  opacity="0.55"
                />
              </g>
            </motion.g>
          </motion.g>
          {/* reflet vertical */}
          <rect x={T.x0 + 8} y={T.top} width="9" height={T.bottom - T.top} rx="4" fill="#ffffff" opacity="0.28" />
        </g>

        {/* filet d'eau (remplissage) */}
        <AnimatePresence>
          {stream === 'add' && (
            <motion.g key="stream-add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <motion.rect x={POUR_X - 4} y={T.top - 30} width="8" rx="4" fill={`url(#${uid}-stream)`} initial={false} animate={{ height: Math.max(8, yLiquid - (T.top - 30)) }} transition={move} />
              <motion.line className={reduced ? '' : 'mfm-flow'} x1={POUR_X} y1={T.top - 28} x2={POUR_X} initial={false} animate={{ y2: yLiquid }} transition={move} stroke="#ffffff" strokeWidth="2" strokeDasharray="5 9" opacity="0.7" strokeLinecap="round" />
              {[0, 1, 2].map((i) => (
                <motion.circle key={i} cx={POUR_X + (i - 1) * 9} r="2.6" fill="#7dd3fc" initial={{ cy: yLiquid - 6, opacity: 0.9 }} animate={{ cy: yLiquid - 26 - i * 6, opacity: 0 }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.18, ease: 'easeOut' }} />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* robinet de vidage + filet (vidage) */}
        {allowRemove && (
          <g>
            <rect x={TAP.x} y={TAP.y} width="22" height="10" rx="3" fill="#94a3b8" />
            <rect x={TAP.x + 14} y={TAP.y + 8} width="8" height="14" rx="2" fill="#64748b" />
            <rect x={TAP.x + 6} y={TAP.y - 8} width="6" height="10" rx="2" fill={stream === 'remove' ? '#0ea5e9' : '#475569'} />
          </g>
        )}
        <AnimatePresence>
          {stream === 'remove' && (
            <motion.g key="stream-remove" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <rect x={TAP.x + 15} y={TAP.y + 20} width="6" height="96" rx="3" fill={`url(#${uid}-stream)`} />
              <line className={reduced ? '' : 'mfm-flow'} x1={TAP.x + 18} y1={TAP.y + 22} x2={TAP.x + 18} y2={TAP.y + 112} stroke="#ffffff" strokeWidth="2" strokeDasharray="5 9" opacity="0.7" strokeLinecap="round" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* graduations */}
        {ticks.map((t) => {
          const y = levelY(t.ml, tankMl);
          return (
            <g key={t.ml}>
              <line x1={t.major ? T.x0 - 22 : T.x0 - 12} y1={y} x2={T.x0 + 10} y2={y} stroke={t.major ? '#64748b' : '#cbd5e1'} strokeWidth={t.major ? 2 : 1.5} />
              {t.major && (
                <text x={T.x0 - 27} y={y + 4} textAnchor="end" fontSize="12" fontWeight="700" fill="#475569" fontFamily="'JetBrains Mono', monospace">
                  {t.label}
                </text>
              )}
            </g>
          );
        })}

        {/* ligne objectif */}
        <g filter={success ? `url(#${uid}-glow)` : undefined}>
          <motion.line x1={T.x0 - 4} x2={T.x1 + 4} y1={yTarget} y2={yTarget} stroke={targetColor} strokeWidth="3" strokeDasharray={success ? '0' : '8 6'} strokeLinecap="round" initial={false} animate={{ opacity: success ? [1, 0.4, 1] : 1 }} transition={{ duration: 0.9, repeat: success ? 2 : 0 }} />
        </g>
        <g transform={`translate(${T.x1 + 12}, ${yTarget - 13})`}>
          <rect width={34 + targetLabel.length * 8.4} height="26" rx="8" fill={targetColor} />
          <text x="9" y="18" fontSize="13" fill="#ffffff">{success ? '✓' : '🎯'}</text>
          <text x="28" y="18" fontSize="12.5" fontWeight="800" fill="#ffffff" fontFamily="'JetBrains Mono', monospace">{targetLabel}</text>
        </g>
      </svg>

      <style>{`
        @keyframes mfm-wave { from { transform: translateX(0); } to { transform: translateX(-40px); } }
        .mfm-wave { animation: mfm-wave 2.4s linear infinite; }
        @keyframes mfm-flow { to { stroke-dashoffset: -28; } }
        .mfm-flow { animation: mfm-flow 0.45s linear infinite; }
      `}</style>
    </div>
  );
}

/* ── Une mesure (bécher) ──────────────────────────────────────────── */
const CUP = { W: 100, H: 124 };
// Géométrie physique de la mesure, en fractions de sa boîte (viewBox 100×124) :
// le bec verseur est dessiné en haut à DROITE (pointe en (92, 7)).
const CUP_SPOUT_X = 0.92;
const CUP_SPOUT_Y = 7 / CUP.H;
const CUP_MOUTH_X = 0.5;
const CUP_MOUTH_Y = 0.1;
// Pour verser par un bec situé à droite, la mesure bascule dans le sens
// HORAIRE autour du bec : le bec devient le point le plus bas du bord, le
// corps se relève à gauche, et l'eau tombe verticalement depuis le bec.
const POUR_ROTATION = 62;
const POUR_PIVOT = `${CUP_SPOUT_X * 100}% ${CUP_SPOUT_Y * 100}%`;
const MOUTH_PIVOT = `${CUP_MOUTH_X * 100}% ${CUP_MOUTH_Y * 100}%`;
function Cup({ tool, scale, liquidPct, active, dim, base = 132 }) {
  const uid = useId();
  const h = Math.round(base * scale);
  const w = Math.round((CUP.W / CUP.H) * h);
  const bodyTop = 14;
  const bodyBottom = 112;
  const yL = bodyBottom - liquidPct * (bodyBottom - bodyTop - 6);
  const gradN = 5;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${CUP.W} ${CUP.H}`} className="overflow-visible" aria-hidden="true">
      <defs>
        <clipPath id={`${uid}-c`}>
          <path d={`M18,${bodyTop} L24,${bodyBottom - 2} Q25,${bodyBottom + 4} 31,${bodyBottom + 4} L69,${bodyBottom + 4} Q75,${bodyBottom + 4} 76,${bodyBottom - 2} L82,${bodyTop} Z`} />
        </clipPath>
        <linearGradient id={`${uid}-w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" stopOpacity="0.85" />
          <stop offset="1" stopColor="#0284c7" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy={bodyBottom + 9} rx="34" ry="5" fill="#0f172a" opacity={dim ? 0.03 : 0.08} />
      {/* liquide */}
      <g clipPath={`url(#${uid}-c)`}>
        <motion.rect x="0" width={CUP.W} height={CUP.H} initial={false} animate={{ y: yL }} transition={{ duration: 0.3, ease: 'easeOut' }} fill={`url(#${uid}-w)`} />
        <motion.rect x="0" width={CUP.W} height="3" initial={false} animate={{ y: yL }} transition={{ duration: 0.3, ease: 'easeOut' }} fill="#e0f2fe" opacity="0.8" />
      </g>
      {/* verre */}
      <path d={`M16,${bodyTop} L23,${bodyBottom} Q24,${bodyBottom + 6} 30,${bodyBottom + 6} L70,${bodyBottom + 6} Q76,${bodyBottom + 6} 77,${bodyBottom} L84,${bodyTop}`} fill="#f8fafc" fillOpacity="0.35" stroke={active ? '#0ea5e9' : '#94a3b8'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="24" y={bodyTop + 8} width="6" height={bodyBottom - bodyTop - 22} rx="3" fill="#ffffff" opacity="0.45" />
      {/* bec verseur */}
      <path d={`M84,${bodyTop} L92,${bodyTop - 7}`} stroke={active ? '#0ea5e9' : '#94a3b8'} strokeWidth="3" strokeLinecap="round" />
      {/* graduations propres à la mesure */}
      {Array.from({ length: gradN }, (_, i) => {
        const frac = (i + 1) / gradN;
        const y = bodyBottom - frac * (bodyBottom - bodyTop - 6);
        return <line key={i} x1="62" y1={y} x2={frac === 1 ? 80 : 72} y2={y} stroke="#64748b" strokeWidth={frac === 1 ? 2 : 1.2} opacity="0.8" />;
      })}
      <text x="50" y={bodyTop - 2 - 12} textAnchor="middle" fontSize="15" fontWeight="800" fill="#1e293b" fontFamily="'JetBrains Mono', monospace">{tool.label}</text>
    </svg>
  );
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** true sous 640 px : mesures plus petites, HUD sous la scène. */
function useNarrow() {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const on = (e) => setNarrow(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return narrow;
}

/* ── Le composant ─────────────────────────────────────────────────── */
export default function MeasureFillMission({ challenges, mode = 'free', onChallengeSuccess, onAllCompleted, react, solved = false }) {
  const reduced = useReducedMotion();
  const narrow = useNarrow();
  const cupBase = narrow ? 96 : 132;
  const D = reduced ? { fill: 80, move: 70, tilt: 60, pour: 160, ret: 80 } : { fill: 260, move: 280, tilt: 220, pour: 520, ret: 240 };

  const [idx, setIdx] = useState(solved ? challenges.length - 1 : 0);
  const ch = challenges[idx];
  const unit = ch.displayUnit ?? ch.unit;
  const maxToolMl = useMemo(() => Math.max(...ch.tools.map((t) => t.ml)), [ch]);

  const [currentMl, setCurrentMl] = useState(solved ? ch.targetMl : 0); // valeur « mathématique » (HUD)
  const [visualMl, setVisualMl] = useState(solved ? ch.targetMl : 0); // niveau dessiné
  const [history, setHistory] = useState([]);
  const [active, setActive] = useState(null); // { toolId, type, phase, dx, dy }
  const [ripple, setRipple] = useState(false);
  const [success, setSuccess] = useState(solved);
  const [done, setDone] = useState(solved ? challenges.length : 0);
  const [showSolution, setShowSolution] = useState(false);
  const busy = active !== null;
  const cupScale = (tool) => 0.45 + 0.55 * Math.sqrt(tool.ml / maxToolMl);

  const toolRefs = useRef({});
  const sceneRef = useRef(null);
  const tankRef = useRef(null);
  const rimRef = useRef(null);
  const tapRef = useRef(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true; // StrictMode (dev) monte → démonte → remonte : on réarme à chaque montage
    return () => { alive.current = false; };
  }, []);

  const overshoot = !busy && currentMl > ch.targetMl;
  const actions = history.length;

  /* une action = une séquence physique complète ; le nombre ne change qu'à la fin */
  async function act(tool, type) {
    if (busy || success) return;
    const next = type === 'add' ? currentMl + tool.ml : Math.max(0, currentMl - tool.ml);
    const toolEl = toolRefs.current[tool.id];
    const anchor = (type === 'add' ? rimRef : tapRef).current;
    const scene = sceneRef.current?.getBoundingClientRect();
    let dx = 0; let dy = 0; let hover = 0; let start = { left: 0, top: 0, w: 0, h: 0 };
    if (toolEl && anchor && scene) {
      const a = anchor.getBoundingClientRect();
      const t = toolEl.getBoundingClientRect();
      start = { left: t.left - scene.left, top: t.top - scene.top, w: t.width, h: t.height };
      if (type === 'add') {
        // le bec verseur vient se poser exactement sur le départ du filet (même constantes que le pivot)
        dx = a.left - (t.left + t.width * CUP_SPOUT_X);
        dy = a.top - (t.top + t.height * CUP_SPOUT_Y);
        hover = t.height * 0.85; // pose d'approche : droite, au-dessus du réservoir, avant de basculer
      } else {
        // en vidage, l'ouverture de la mesure vient sous la fin du filet du robinet
        dx = a.left - (t.left + t.width * CUP_MOUTH_X);
        dy = a.top - (t.top + t.height * CUP_MOUTH_Y);
      }
    }
    setActive({ toolId: tool.id, type, phase: 'fill', dx, dy, hover, start });
    // Sur mobile les mesures sont sous le réservoir : on ramène le réservoir
    // dans l'écran pour que le geste se voie (pas un auto-scroll d'étape —
    // c'est l'action elle-même qu'on suit des yeux).
    const tankEl = tankRef.current;
    if (tankEl && window.innerWidth < 1024) {
      const r = tankEl.getBoundingClientRect();
      if (r.top < 80 || r.bottom > window.innerHeight) {
        // scrollTo explicite (scrollIntoView « smooth » est annulé sous émulation tactile)
        const top = window.scrollY + r.top - Math.max(0, (window.innerHeight - r.height) / 2);
        requestAnimationFrame(() => window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' }));
      }
    }
    await wait(D.fill);
    if (!alive.current) return;
    if (type === 'add') {
      // 1. la mesure vole, droite, jusqu'au-dessus du réservoir
      setActive((s) => s && { ...s, phase: 'move' });
      await wait(D.move);
      if (!alive.current) return;
      // 2. elle bascule autour de son bec, qui vient se poser sur le départ du filet
      setActive((s) => s && { ...s, phase: 'tilt' });
      await wait(D.tilt);
      if (!alive.current) return;
    }
    setActive((s) => s && { ...s, phase: 'pour' });
    setVisualMl(next);
    setRipple(true);
    await wait(D.pour);
    if (!alive.current) return;
    setActive((s) => s && { ...s, phase: 'return' });
    setRipple(false);
    await wait(D.ret);
    if (!alive.current) return;
    setActive(null);
    setCurrentMl(next);
    setHistory((h) => [...h, { type, tool }]);
    if (next === ch.targetMl) {
      setSuccess(true);
      setDone((d) => Math.max(d, idx + 1));
      react?.(true);
      onChallengeSuccess?.(idx);
    }
  }

  async function playSolution() {
    if (busy || !ch.solution) return;
    setShowSolution(true);
    // on repart d'un réservoir vide, puis on rejoue la solution geste par geste
    setHistory([]);
    setCurrentMl(0);
    setVisualMl(0);
    await wait(reduced ? 100 : 400);
    for (const step of ch.solution) {
      const tool = ch.tools.find((t) => t.id === step.toolId);
      // eslint-disable-next-line no-await-in-loop
      await actRef.current(tool, step.type);
      // eslint-disable-next-line no-await-in-loop
      await wait(reduced ? 60 : 200);
    }
  }
  // `act` lit currentMl : on garde toujours la dernière version.
  const actRef = useRef(act);
  actRef.current = act;

  function nextChallenge() {
    if (idx < challenges.length - 1) {
      setIdx(idx + 1);
      setCurrentMl(0); setVisualMl(0); setHistory([]); setSuccess(false); setShowSolution(false); setActive(null);
    } else {
      onAllCompleted?.();
    }
  }

  /* ── rendu ── */
  const label = (ml) => fmtQty(ml, unit);
  const mathLine = history.length
    ? `${history.map((h, i) => `${i === 0 ? (h.type === 'remove' ? '− ' : '') : h.type === 'add' ? ' + ' : ' − '}${h.tool.label}`).join('')} = ${label(currentMl)}`
    : null;
  const repeatCount = mode === 'repeat' ? history.filter((h) => h.type === 'add').length : 0;

  const cupLiquid = (tool) => {
    if (!active || active.toolId !== tool.id) return 0;
    if (active.type === 'add') return active.phase === 'pour' || active.phase === 'return' ? 0 : 1;
    return active.phase === 'pour' ? 1 : 0;
  };
  // Poses explicites de la mesure (pivot = bec verseur, voir POUR_PIVOT) :
  //  fill   : droite, sur l'étagère
  //  move   : droite, en approche au-dessus du réservoir (bec au-dessus du point de chute)
  //  tilt   : bascule horaire autour du bec, qui descend sur le départ du filet
  //  pour   : même pose, le filet coule
  //  return : redressement + retour à l'étagère, en un seul mouvement
  const cupMotion = (tool) => {
    if (!active || active.toolId !== tool.id) return { x: 0, y: 0, rotate: 0, scale: 1 };
    if (active.type === 'add') {
      if (active.phase === 'fill') return { x: 0, y: -6, rotate: 0, scale: 1.04 };
      if (active.phase === 'move') return { x: active.dx, y: active.dy - active.hover, rotate: 0, scale: 1 };
      if (active.phase === 'tilt' || active.phase === 'pour') return { x: active.dx, y: active.dy, rotate: POUR_ROTATION, scale: 1 };
      return { x: 0, y: 0, rotate: 0, scale: 1 };
    }
    if (active.phase === 'return') return { x: 0, y: 0, rotate: 0, scale: 1 };
    return { x: active.dx, y: active.dy, rotate: 0, scale: 1 };
  };

  const tankLabel = `Réservoir : ${label(currentMl)} sur un objectif de ${label(ch.targetMl)}`;

  return (
    <div ref={sceneRef} className="relative rounded-3xl border border-slate-200 bg-gradient-to-b from-sky-50/70 via-white to-slate-50 p-4 sm:p-6 shadow-sm">
      {/* bandeau : défi + objectif */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400">
          {mode === 'repeat' ? 'Station de mesure' : `Défi ${idx + 1} / ${challenges.length}`}
          {done > idx && <span className="ml-2 text-emerald-600">✓</span>}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border-2 border-amber-300 px-3.5 py-1.5">
          <span aria-hidden="true">🎯</span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">Objectif</span>
          <span className="font-mono font-extrabold text-lg text-amber-800 tabular-nums">{fmtQty(ch.targetMl, ch.unit)}</span>
        </div>
      </div>

      <div className="grid grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,1fr)_14rem] gap-2 sm:gap-6 items-start">
        {/* COLONNE DES MESURES — à côté du réservoir, au même niveau */}
        <div className="w-full">
          <div className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider sm:tracking-widest text-slate-400 mb-3 text-center leading-tight">
            {mode === 'repeat' ? 'Ta mesure' : 'Tes mesures'}
          </div>
          <div className="flex flex-col items-center gap-4">
            {ch.tools.map((tool) => {
              const s = cupScale(tool);
              const isActive = active?.toolId === tool.id;
              const canAdd = !busy && !success && currentMl + tool.ml <= ch.tankMl;
              const canRemove = !busy && !success && currentMl - tool.ml >= 0;
              return (
                <div key={tool.id} className="flex flex-col items-center gap-1.5 w-full">
                  <div className="flex items-end justify-center">
                    <div ref={(el) => { toolRefs.current[tool.id] = el; }} style={{ visibility: isActive ? 'hidden' : 'visible' }}>
                      <Cup tool={tool} scale={s} liquidPct={0} active={false} dim={busy && !isActive} base={cupBase} />
                    </div>
                  </div>
                  {/* étagère */}
                  <div className="h-1.5 w-[calc(100%-4px)] max-w-[140px] rounded-full bg-slate-200" aria-hidden="true" />
                  {!solved && (
                    <div className="flex flex-col gap-1.5 w-full max-w-[140px] min-w-[84px]">
                      <button
                        type="button"
                        onClick={() => act(tool, 'add')}
                        disabled={!canAdd}
                        aria-label={`Remplir la mesure de ${tool.label} et la verser dans le réservoir`}
                        className="inline-flex items-center justify-center gap-1 min-h-[44px] px-2 rounded-xl bg-sky-600 text-white font-mono text-xs font-bold shadow-sm hover:bg-sky-700 disabled:opacity-35 disabled:hover:bg-sky-600 active:scale-[0.98] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                      >
                        <Plus className="w-4 h-4 shrink-0" aria-hidden="true" /> Remplir
                      </button>
                      {ch.allowRemove && (
                        <button
                          type="button"
                          onClick={() => act(tool, 'remove')}
                          disabled={!canRemove}
                          aria-label={`Vider ${tool.label} du réservoir par le robinet`}
                          className="inline-flex items-center justify-center gap-1 min-h-[44px] px-2 rounded-xl bg-white border-2 border-rose-300 text-rose-700 font-mono text-xs font-bold hover:border-rose-500 disabled:opacity-35 disabled:hover:border-rose-300 active:scale-[0.98] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                        >
                          <Minus className="w-4 h-4 shrink-0" aria-hidden="true" /> Vider
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RÉSERVOIR */}
        <div ref={tankRef} className="min-w-0 pt-6">
          <Tank
            tankMl={ch.tankMl}
            visualMl={visualMl}
            targetMl={ch.targetMl}
            targetLabel={fmtQty(ch.targetMl, ch.unit)}
            stream={active?.phase === 'pour' ? active.type : null}
            ripple={ripple}
            success={success}
            allowRemove={!!ch.allowRemove}
            reduced={reduced}
            rimRef={rimRef}
            tapRef={tapRef}
            ariaLabel={tankLabel}
          />
        </div>

        {/* HUD : quantité actuelle, historique — à droite sur desktop, sous la scène sinon */}
        <div className="col-span-2 lg:col-span-1 w-full space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Quantité actuelle</div>
            <div className="font-mono font-extrabold text-3xl text-slate-800 tabular-nums mt-1 min-h-[40px]" aria-live="polite">
              {busy ? <span className="text-base font-bold text-sky-600">Versement en cours…</span> : label(currentMl)}
            </div>
            {mode === 'repeat' && !busy && (
              <div className="text-xs font-mono text-slate-500 mt-1">{repeatCount} × {ch.tools[0].label}</div>
            )}
          </div>

          {history.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Tes gestes</div>
              <div className="flex flex-wrap gap-1.5">
                {mode === 'repeat' ? (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-sky-100 text-sky-800 px-2 py-1 font-mono text-xs font-bold">🟦 +{ch.tools[0].label} × {repeatCount}</span>
                ) : (
                  history.map((h, i) => (
                    <span key={i} className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-xs font-bold ${h.type === 'add' ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'}`}>
                      {h.type === 'add' ? '🟦 +' : '🟥 −'}{h.tool.label}
                    </span>
                  ))
                )}
                {!busy && <span className="inline-flex items-center rounded-lg bg-slate-100 text-slate-700 px-2 py-1 font-mono text-xs font-bold">= {label(currentMl)}{success ? ' ✓' : ''}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* clone volant de la mesure active : hors de tout overflow, au-dessus du réservoir */}
      {active && (() => {
        const tool = ch.tools.find((t) => t.id === active.toolId);
        if (!tool) return null;
        return (
          <div className="absolute inset-0 pointer-events-none z-30" aria-hidden="true">
            <motion.div
              style={{ position: 'absolute', left: active.start.left, top: active.start.top, width: active.start.w, height: active.start.h, transformOrigin: active.type === 'add' ? POUR_PIVOT : MOUTH_PIVOT }}
              initial={{ x: 0, y: 0, rotate: 0, scale: 1 }}
              animate={cupMotion(tool)}
              transition={{ duration: (active.phase === 'tilt' ? D.tilt : active.phase === 'return' ? D.ret : D.move) / 1000, ease: [0.22, 1, 0.36, 1] }}
            >
              <Cup tool={tool} scale={cupScale(tool)} liquidPct={cupLiquid(tool)} active base={cupBase} />
            </motion.div>
          </div>
        );
      })()}

      {/* retours */}
      <div className="mt-4 space-y-3">
        <AnimatePresence mode="wait">
          {success && (
            <motion.div key="ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 space-y-3">
              <div className="flex items-center gap-2 font-space font-bold text-emerald-800">
                <Check className="w-5 h-5 shrink-0" aria-hidden="true" /> Exactement {fmtQty(ch.targetMl, ch.unit)} !
              </div>
              <div className="font-mono text-sm sm:text-base font-bold text-emerald-900 bg-white/70 rounded-xl px-3 py-2 tabular-nums break-words">
                {mode === 'repeat'
                  ? `${repeatCount} × ${ch.tools[0].label} = ${fmtQty(ch.targetMl, ch.unit)}`
                  : mathLine}
              </div>
              <div className="font-mono text-sm text-emerald-800 tabular-nums">{ch.rule ?? conversionLine(ch.targetMl, ch.unit)}</div>
              {!solved && (idx < challenges.length - 1 || onAllCompleted) && done <= idx + 1 && (
                <button type="button" onClick={nextChallenge} className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
                  {idx < challenges.length - 1 ? 'Défi suivant' : 'Terminer la mission'} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </motion.div>
          )}
          {overshoot && !success && (
            <motion.div key="over" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <div className="font-bold">Tu as dépassé l'objectif : {label(currentMl)} au lieu de {fmtQty(ch.targetMl, ch.unit)}.</div>
                <div className="mt-0.5">{ch.allowRemove ? 'Tu peux vider une partie du contenu par le robinet, avec une des mesures.' : 'Le niveau est au-dessus de la ligne : regarde de combien, et retiens cette mesure pour la prochaine fois.'}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* jamais bloquant : un indice puis la solution jouée sous ses yeux */}
        {!success && !solved && ch.solution && actions >= 6 && (
          <div className="flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                Indice :{' '}
                <span className="font-mono font-bold">
                  {ch.solution.map((s, i) => `${i === 0 ? (s.type === 'remove' ? '− ' : '') : s.type === 'add' ? ' + ' : ' − '}${ch.tools.find((t) => t.id === s.toolId)?.label}`).join('')}
                </span>
              </span>
            </div>
            {actions >= 10 && !showSolution && (
              <button type="button" onClick={playSolution} disabled={busy} className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-xl bg-white border-2 border-sky-300 text-sky-800 font-mono text-xs font-bold hover:border-sky-500 disabled:opacity-40">
                <Play className="w-3.5 h-3.5" aria-hidden="true" /> Me montrer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
