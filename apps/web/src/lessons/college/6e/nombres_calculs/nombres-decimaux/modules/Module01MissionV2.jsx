import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles, Search, Lightbulb } from 'lucide-react';
import { ContentModule, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback, ValidateButton, ChoiceGrid } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 V2 — « Pourquoi les nombres décimaux ? » (2026-08-23, redesign 2026-08-23)
 *
 * Rôle pédagogique : CRÉER LE BESOIN avant d'enseigner la technique.
 *
 * L'élève doit ressentir que les nombres entiers sont insuffisants pour
 * décrire certaines quantités réelles, AVANT que le concept de nombre
 * décimal lui soit présenté.
 *
 * Ce module N'ENSEIGNE PAS :
 *   - les dixièmes, les centièmes
 *   - la moitié / 0,5
 *   - la construction de 0,3 / 0,7 / 1,2
 *   - la valeur de position
 *   - pourquoi 0,5 ≠ 5
 *   - la décomposition unités + dixièmes
 *
 * Progression (6 scènes) — INCHANGÉE par le redesign visuel ci-dessous :
 *   1. Situation réelle — une mesure entre 3 et 4
 *   2. Les entiers ne suffisent pas — 3 trop court, 4 trop long
 *   3. L'espace entre 3 et 4 se découpe — moment AHA, apparition de 3,7
 *   4. Exemples réels — longueur, contenance, prix
 *   5. Première rencontre — le nombre 3,7 présenté seul
 *   6. Mission suivante — curiosité vers le module 2
 *
 * Passe de redesign : seule la présentation change (typographie, hiérarchie,
 * espacement, lisibilité des SVG). Logique, état, contrat ContentModule et
 * séquence pédagogique restent strictement identiques.
 */

/* ══════════════════════════════════════════════════════════════════════
   PETIT SYSTÈME DE DESIGN LOCAL — hiérarchie visuelle réutilisée par
   chaque scène. Composants purement présentationnels, aucune logique.
   ══════════════════════════════════════════════════════════════════════ */

/** Étiquette courte au-dessus d'un bloc majeur (« OBSERVE », « DÉCOUVERTE »…). Sobre, pas sur chaque paragraphe. */
function SectionLabel({ icon: Icon, tone = 'slate', children }) {
  const TONE = {
    slate: 'text-slate-500',
    indigo: 'text-indigo-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
  };
  return (
    <div className={`flex items-center gap-2 font-space font-bold text-xs uppercase tracking-widest ${TONE[tone]}`}>
      {Icon && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />}
      {children}
    </div>
  );
}

/** Cadre visuel pour un SVG pédagogique : scène claire, air pour respirer. */
function VisualStage({ tone = 'indigo', children }) {
  const TONE = {
    indigo: 'bg-indigo-50 border-indigo-100',
    emerald: 'bg-emerald-50 border-emerald-100',
    slate: 'bg-slate-50 border-slate-200',
  };
  return (
    <div className={`rounded-2xl border-2 p-4 sm:p-6 ${TONE[tone]}`}>
      <div className="w-full max-w-xl mx-auto">{children}</div>
    </div>
  );
}

/**
 * Bloc question — le point d'interaction principal de chaque scène. Se
 * distingue nettement du texte de contexte qui le précède : fond, icône,
 * texte large et gras.
 */
function QuestionBlock({ eyebrow = 'À toi de réfléchir', children }) {
  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 p-4 sm:p-5 space-y-2.5">
      <SectionLabel icon={Lightbulb} tone="indigo">{eyebrow}</SectionLabel>
      <p className="text-lg sm:text-xl font-space font-bold text-slate-900 leading-snug">{children}</p>
    </div>
  );
}

/**
 * Choix larges et lisibles. ChoiceGrid (common/components/LessonUI.jsx)
 * reste la source de vérité pour l'état sélectionné/correct/incorrect et
 * pour la logique d'interaction — cette fonction ne fait qu'agrandir le
 * CONTENU affiché dans chaque bouton via `renderOption`, sans toucher au
 * composant partagé (utilisé par toutes les leçons de la plateforme).
 */
const bigOption = (opt) => <span className="text-base sm:text-lg font-semibold">{opt}</span>;

/** Bandeau de découverte — la récompense visuelle à la fin d'une scène. */
function DiscoveryCard({ label = 'Découverte', children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-slate-900 text-white p-5 sm:p-6 text-center space-y-2"
    >
      <div className="flex items-center justify-center gap-2 font-space font-bold text-xs uppercase tracking-widest text-amber-300">
        <Sparkles className="w-4 h-4" aria-hidden="true" />
        {label}
      </div>
      {children}
    </motion.div>
  );
}

/** Prose de contexte, avant la question — corps de texte confortable, jamais en mono. */
function SceneIntro({ children }) {
  return <p className="text-base sm:text-lg leading-7 text-slate-700">{children}</p>;
}

/* ══════════════════════════════════════════════════════════════════════
   COMPOSANTS SVG INLINE — viewBox agrandi, libellés plus grands et mieux
   espacés pour rester lisibles sans zoom, du mobile au desktop.
   ══════════════════════════════════════════════════════════════════════ */

/**
 * RulerSVG — règle horizontale SVG avec point de mesure animé.
 *
 * @param {number}  value   valeur de la mesure (ex: 3.7)
 * @param {boolean} animate jouer l'animation automatique au montage
 * @param {number}  min     valeur gauche (défaut: 3)
 * @param {number}  max     valeur droite (défaut: 4)
 */
function RulerSVG({ value = 3.7, animate: shouldAnimate = true, min = 3, max = 4 }) {
  const prefersReduced = useReducedMotion();
  const W = 360;
  const H = 130;
  const PAD = 34;
  const rulerY = 74;
  const tickH = 16;
  const smallTickH = 8;
  const totalRange = max - min;
  const ratio = (value - min) / totalRange;
  const pointX = PAD + ratio * (W - 2 * PAD);

  // Animated x position of the indicator
  const [animX, setAnimX] = useState(prefersReduced ? pointX : PAD);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!shouldAnimate || prefersReduced) {
      setAnimX(pointX);
      return;
    }
    // Use a simple timed animation via setTimeout-based easing
    const duration = 1800;
    const startTime = performance.now();
    const startX = PAD;
    const endX = pointX;

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimX(startX + eased * (endX - startX));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    // Small delay before starting
    const timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(step);
    }, 400);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pointX, shouldAnimate, prefersReduced]);

  // Ticks every 0.1 between min and max
  const ticks = [];
  const steps = Math.round(totalRange * 10);
  for (let i = 0; i <= steps; i++) {
    const v = min + i * 0.1;
    const x = PAD + (i / steps) * (W - 2 * PAD);
    const isMajor = i % 10 === 0;
    const isMid = i % 5 === 0;
    ticks.push({ x, v, isMajor, isMid });
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      aria-label={`Règle graduée de ${min} m à ${max} m. Le point de mesure se trouve à ${value} m.`}
      role="img"
      className="mx-auto block w-full"
    >
      {/* Ruler body */}
      <rect x={PAD - 4} y={rulerY - 8} width={W - 2 * PAD + 8} height={26}
        rx={5} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={2} />

      {/* Tick marks */}
      {ticks.map(({ x, v, isMajor, isMid }) => (
        <g key={v}>
          <line
            x1={x} y1={rulerY - (isMajor ? tickH : isMid ? 10 : smallTickH)}
            x2={x} y2={rulerY}
            stroke={isMajor ? '#475569' : '#94a3b8'}
            strokeWidth={isMajor ? 2.5 : 1.5}
          />
          {isMajor && (
            <text x={x} y={rulerY - tickH - 8}
              textAnchor="middle" fontSize={18} fontFamily="'JetBrains Mono', monospace"
              fill="#1e293b" fontWeight="800">
              {v} m
            </text>
          )}
        </g>
      ))}

      {/* Animated measurement indicator */}
      <g>
        {/* Dashed drop line */}
        <line
          x1={animX} y1={rulerY - 2}
          x2={animX} y2={H - 18}
          stroke="#6366f1" strokeWidth={2} strokeDasharray="4 3"
        />
        {/* Triangle pointer */}
        <polygon
          points={`${animX},${rulerY - 4} ${animX - 7},${rulerY - 17} ${animX + 7},${rulerY - 17}`}
          fill="#6366f1"
        />
        {/* Label bubble */}
        <rect x={animX - 30} y={H - 20} width={60} height={20}
          rx={10} fill="#6366f1" />
        <text x={animX} y={H - 6}
          textAnchor="middle" fontSize={13} fontFamily="'JetBrains Mono', monospace"
          fill="white" fontWeight="800">
          {animX < pointX - 2 ? '…' : `${value} m`}
        </text>
      </g>

      {/* Zone shading between min and max labels */}
      <rect x={PAD} y={rulerY - 3} width={animX - PAD} height={6}
        fill="#6366f1" opacity={0.25} rx={3} />
    </svg>
  );
}

/**
 * IntegerComparisonSVG — montre visuellement « 3 trop court, 4 trop long ».
 */
function IntegerComparisonSVG() {
  return (
    <svg
      viewBox="0 0 360 150"
      width="100%"
      className="mx-auto block w-full"
      aria-label="Comparaison visuelle : 3 m est trop court, 4 m est trop long, la mesure réelle est entre les deux"
      role="img"
    >
      {/* Base axis */}
      <line x1={24} y1={75} x2={336} y2={75} stroke="#e2e8f0" strokeWidth={2} />

      {/* 3 m bar — too short */}
      <rect x={24} y={54} width={158} height={20} rx={5} fill="#fca5a5" opacity={0.75} />
      <text x={24} y={44} fontSize={16} fill="#dc2626" fontFamily="'JetBrains Mono', monospace" fontWeight="800">3 m</text>
      <text x={192} y={68} fontSize={13} fill="#dc2626" fontFamily="ui-sans-serif, system-ui" fontWeight="600">trop court</text>
      <line x1={186} y1={54} x2={186} y2={73} stroke="#dc2626" strokeWidth={2.5} strokeDasharray="4 3" />

      {/* 4 m bar — too long */}
      <rect x={24} y={82} width={210} height={20} rx={5} fill="#fbbf24" opacity={0.75} />
      <text x={24} y={122} fontSize={16} fill="#b45309" fontFamily="'JetBrains Mono', monospace" fontWeight="800">4 m</text>
      <text x={240} y={96} fontSize={13} fill="#b45309" fontFamily="ui-sans-serif, system-ui" fontWeight="600">trop long</text>
      <line x1={234} y1={82} x2={234} y2={101} stroke="#b45309" strokeWidth={2.5} strokeDasharray="4 3" />

      {/* Real measure indicator */}
      <circle cx={204} cy={75} r={8} fill="#6366f1" stroke="#fff" strokeWidth={2.5} />
      <text x={204} y={30} textAnchor="middle" fontSize={13} fill="#4f46e5"
        fontFamily="ui-sans-serif, system-ui" fontWeight="700">
        mesure réelle
      </text>
      <line x1={204} y1={35} x2={204} y2={67} stroke="#6366f1" strokeWidth={2} />

      {/* Bounds labels */}
      <text x={24} y={140} fontSize={14} fill="#475569" fontFamily="'JetBrains Mono', monospace" fontWeight="700">3</text>
      <text x={336} y={140} textAnchor="end" fontSize={14} fill="#475569" fontFamily="'JetBrains Mono', monospace" fontWeight="700">4</text>
      <line x1={24} y1={75} x2={24} y2={135} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" />
      <line x1={336} y1={75} x2={336} y2={135} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" />
    </svg>
  );
}

/**
 * NumberLineSVG — droite numérique de 3 à 4 avec divisions animées.
 *
 * @param {number}  divisions  nombre de petites divisions (10)
 * @param {number}  highlight  quelle graduation mettre en évidence (7)
 * @param {boolean} showLabel  afficher le label numérique sur le point
 */
function NumberLineSVG({ divisions = 10, highlight = 7, showLabel = false }) {
  const prefersReduced = useReducedMotion();
  const [phase, setPhase] = useState(0);
  // phase 0 = axe seul / phase 1 = ticks apparaissent / phase 2 = point highlight

  useEffect(() => {
    if (prefersReduced) { setPhase(2); return; }
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [prefersReduced]);

  const W = 360;
  const H = 130;
  const PAD = 36;
  const axisY = 58;
  const innerW = W - 2 * PAD;
  const highlightX = PAD + (highlight / divisions) * innerW;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      className="mx-auto block w-full"
      aria-label={`Droite numérique de 3 à 4, découpée en ${divisions} parts, avec un point à la ${highlight}e graduation`}
      role="img"
    >
      {/* Main axis line */}
      <line x1={PAD} y1={axisY} x2={W - PAD} y2={axisY} stroke="#475569" strokeWidth={3} strokeLinecap="round" />
      {/* Arrow head */}
      <polygon points={`${W - PAD},${axisY} ${W - PAD - 9},${axisY - 5} ${W - PAD - 9},${axisY + 5}`} fill="#475569" />

      {/* Major ticks — 3 and 4 */}
      {[{ val: 3, x: PAD }, { val: 4, x: W - PAD }].map(({ val, x }) => (
        <g key={val}>
          <line x1={x} y1={axisY - 13} x2={x} y2={axisY + 13} stroke="#1e293b" strokeWidth={2.5} />
          <text x={x} y={axisY + 32} textAnchor="middle" fontSize={18}
            fill="#1e293b" fontFamily="'JetBrains Mono', monospace" fontWeight="800">{val}</text>
        </g>
      ))}

      {/* Small ticks — animated in */}
      {phase >= 1 && Array.from({ length: divisions - 1 }, (_, i) => {
        const idx = i + 1;
        const x = PAD + (idx / divisions) * innerW;
        return (
          <motion.line
            key={idx}
            x1={x} y1={axisY - 6} x2={x} y2={axisY + 6}
            stroke="#94a3b8" strokeWidth={2}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: prefersReduced ? 0 : idx * 0.04 }}
          />
        );
      })}

      {/* Highlighted point */}
      {phase >= 2 && (
        <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
          style={{ transformOrigin: `${highlightX}px ${axisY}px` }}>
          <circle cx={highlightX} cy={axisY} r={9} fill="#6366f1" stroke="#fff" strokeWidth={2.5} />
          {showLabel && (
            <>
              <line x1={highlightX} y1={axisY - 11} x2={highlightX} y2={axisY - 30}
                stroke="#6366f1" strokeWidth={2} />
              <rect x={highlightX - 26} y={axisY - 52} width={52} height={22}
                rx={11} fill="#6366f1" />
              <text x={highlightX} y={axisY - 36} textAnchor="middle" fontSize={15}
                fill="white" fontFamily="'JetBrains Mono', monospace" fontWeight="800">3,7</text>
            </>
          )}
        </motion.g>
      )}
    </svg>
  );
}

/**
 * BottleSVG — bouteille transparente SVG avec niveau de liquide animé.
 *
 * @param {number}  level   entre 0 et 1 (ex: 0.5 pour la moitié)
 * @param {boolean} animate jouer l'animation de remplissage
 */
function BottleSVG({ level = 0.5, animate: shouldAnimate = true }) {
  const prefersReduced = useReducedMotion();
  const BH = 120; // bottle inner height in SVG units
  const targetFill = level * BH;
  const [fill, setFill] = useState(prefersReduced || !shouldAnimate ? targetFill : 0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!shouldAnimate || prefersReduced) { setFill(targetFill); return; }
    const duration = 1600;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2);
      setFill(eased * targetFill);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    const t = setTimeout(() => { rafRef.current = requestAnimationFrame(step); }, 500);
    return () => { clearTimeout(t); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [targetFill, shouldAnimate, prefersReduced]);

  const W = 108;
  const H = 200;
  const bottleTop = 30;
  const neckH = 22;
  const bodyTop = bottleTop + neckH;
  const bodyH = BH;
  const liquidTop = bodyTop + (bodyH - fill);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="108" height="200"
      className="mx-auto block"
      aria-label={`Bouteille contenant ${level * 2} L sur 2 L`} role="img">
      {/* Bottle outline */}
      <rect x={38} y={bottleTop} width={32} height={neckH} rx={5}
        fill="none" stroke="#94a3b8" strokeWidth={2.5} />
      <rect x={20} y={bodyTop} width={68} height={bodyH} rx={10}
        fill="#f8fafc" stroke="#94a3b8" strokeWidth={2.5} />

      {/* Liquid */}
      <clipPath id="bottleClip">
        <rect x={20} y={bodyTop} width={68} height={bodyH} rx={10} />
      </clipPath>
      <rect x={20} y={liquidTop} width={68}
        height={fill} fill="#38bdf8" opacity={0.65} clipPath="url(#bottleClip)" />

      {/* Level markers */}
      <line x1={12} y1={bodyTop + bodyH * 0.5} x2={92} y2={bodyTop + bodyH * 0.5}
        stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="4 3" />
      <line x1={12} y1={bodyTop} x2={20} y2={bodyTop}
        stroke="#94a3b8" strokeWidth={2.5} />
      <line x1={12} y1={bodyTop + bodyH} x2={20} y2={bodyTop + bodyH}
        stroke="#94a3b8" strokeWidth={2.5} />

      {/* Labels */}
      <text x={10} y={bodyTop + 5} textAnchor="end" fontSize={13}
        fill="#64748b" fontFamily="'JetBrains Mono', monospace" fontWeight="700">2 L</text>
      <text x={10} y={bodyTop + bodyH * 0.5 + 5} textAnchor="end" fontSize={13}
        fill="#0284c7" fontFamily="'JetBrains Mono', monospace" fontWeight="700">1,5 L</text>
      <text x={10} y={bodyTop + bodyH + 5} textAnchor="end" fontSize={13}
        fill="#64748b" fontFamily="'JetBrains Mono', monospace" fontWeight="700">1 L</text>
    </svg>
  );
}

/**
 * PriceSVG — étiquette de prix entre deux valeurs entières.
 */
function PriceSVG({ value = 2.5, min = 2, max = 3 }) {
  const W = 240;
  const H = 120;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="240" height="120"
      className="mx-auto block"
      aria-label={`Étiquette de prix : ${value} € est entre ${min} € et ${max} €`} role="img">
      {/* Tag shape */}
      <path d="M 24 24 L 190 24 L 214 60 L 190 96 L 24 96 Z"
        fill="#fef9c3" stroke="#f59e0b" strokeWidth={2.5} />
      <circle cx={42} cy={60} r={6} fill="#f59e0b" />

      {/* Price value */}
      <text x={128} y={68} textAnchor="middle" fontSize={26}
        fill="#92400e" fontFamily="'JetBrains Mono', monospace" fontWeight="800">
        {value.toFixed(2)} €
      </text>

      {/* Between markers */}
      <text x={12} y={H - 6} fontSize={13} fill="#78716c" fontFamily="'JetBrains Mono', monospace" fontWeight="700">
        {min} €
      </text>
      <text x={W - 12} y={H - 6} textAnchor="end" fontSize={13} fill="#78716c" fontFamily="'JetBrains Mono', monospace" fontWeight="700">
        {max} €
      </text>
      <line x1={28} y1={H - 10} x2={W - 28} y2={H - 10}
        stroke="#e7e5e4" strokeWidth={1.5} />
      <circle cx={W / 2} cy={H - 10} r={4} fill="#f59e0b" />
    </svg>
  );
}

/**
 * BridgeArrowSVG — flèche 3 → 3,7 → ? pour la scène de transition.
 */
function BridgeArrowSVG() {
  return (
    <svg viewBox="0 0 320 64" width="100%" className="mx-auto block w-full max-w-sm" aria-hidden="true">
      {/* 3 */}
      <rect x={8} y={16} width={46} height={32} rx={8} fill="#e2e8f0" />
      <text x={31} y={38} textAnchor="middle" fontSize={18}
        fill="#1e293b" fontFamily="'JetBrains Mono', monospace" fontWeight="800">3</text>
      {/* Arrow */}
      <line x1={58} y1={32} x2={100} y2={32} stroke="#94a3b8" strokeWidth={2.5} />
      <polygon points="100,32 90,26 90,38" fill="#94a3b8" />
      {/* 3,7 */}
      <rect x={104} y={10} width={64} height={44} rx={10} fill="#6366f1" />
      <text x={136} y={38} textAnchor="middle" fontSize={20}
        fill="white" fontFamily="'JetBrains Mono', monospace" fontWeight="800">3,7</text>
      {/* Arrow */}
      <line x1={172} y1={32} x2={214} y2={32} stroke="#94a3b8" strokeWidth={2.5} />
      <polygon points="214,32 204,26 204,38" fill="#94a3b8" />
      {/* ? */}
      <rect x={218} y={16} width={46} height={32} rx={8}
        fill="none" stroke="#94a3b8" strokeWidth={2.5} strokeDasharray="5 3" />
      <text x={241} y={38} textAnchor="middle" fontSize={20}
        fill="#94a3b8" fontFamily="'JetBrains Mono', monospace" fontWeight="800">?</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SCÈNE 1 — Un problème de tous les jours
   ══════════════════════════════════════════════════════════════════════ */
function Scene1Ruler({ solved, onSolved, react }) {
  const [q1, setQ1] = useState(null); // null | true | false
  const [q2, setQ2] = useState(null);
  const done = q1 !== null && q2 !== null;

  const handleQ1 = (i) => {
    if (q1 !== null) return;
    const correct = i === 1; // Non
    setQ1(i);
    react(correct);
    if (q2 !== null && correct) onSolved();
  };

  const handleQ2 = (i) => {
    if (q2 !== null) return;
    const correct = i === 1; // Non
    setQ2(i);
    react(correct);
    if (q1 !== null) onSolved();
  };

  return (
    <div className="space-y-6">
      <SceneIntro>
        Un élève mesure une planche de bois. Regarde l'instrument de mesure ci-dessous.
      </SceneIntro>

      <div className="space-y-2">
        <SectionLabel icon={Search} tone="indigo">Observe</SectionLabel>
        <VisualStage tone="indigo">
          <RulerSVG value={3.7} animate min={3} max={4} />
        </VisualStage>
      </div>

      {/* Q1 */}
      <div className="space-y-3">
        <QuestionBlock>
          La longueur est-elle exactement <span className="font-mono text-indigo-700">3 m</span> ?
        </QuestionBlock>
        <ChoiceGrid
          options={['Oui', 'Non']}
          selected={q1}
          onSelect={handleQ1}
          revealed={q1 !== null || solved}
          correctIndex={1}
          cols={2}
          disabled={solved || q1 !== null}
          renderOption={bigOption}
        />
        {(q1 !== null || solved) && (
          <Feedback tone={(q1 ?? 1) === 1 ? 'ok' : 'ko'}>
            <p className="text-base leading-7">
              Non. Le point de mesure <strong>dépasse 3 m</strong> — la planche est plus longue que 3 m.
            </p>
          </Feedback>
        )}
      </div>

      {/* Q2 — appears after Q1 answered */}
      <AnimatePresence>
        {(q1 !== null || solved) && (
          <motion.div
            key="q2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <QuestionBlock>
              Est-elle exactement <span className="font-mono text-indigo-700">4 m</span> ?
            </QuestionBlock>
            <ChoiceGrid
              options={['Oui', 'Non']}
              selected={q2}
              onSelect={handleQ2}
              revealed={q2 !== null || solved}
              correctIndex={1}
              cols={2}
              disabled={solved || q2 !== null}
              renderOption={bigOption}
            />
            {(q2 !== null || solved) && (
              <Feedback tone={(q2 ?? 1) === 1 ? 'ok' : 'ko'}>
                <p className="text-base leading-7">
                  Non. Le point de mesure <strong>n'atteint pas 4 m</strong> — la planche est plus courte que 4 m.
                </p>
              </Feedback>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conclusion */}
      <AnimatePresence>
        {(done || solved) && (
          <DiscoveryCard label="La mesure se situe">
            <div className="font-mono font-extrabold text-xl sm:text-2xl tracking-wide">
              3 m &nbsp;&lt;&nbsp; mesure réelle &nbsp;&lt;&nbsp; 4 m
            </div>
          </DiscoveryCard>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SCÈNE 2 — Les entiers ne suffisent pas
   ══════════════════════════════════════════════════════════════════════ */
function Scene2Integers({ solved, onSolved, react }) {
  const [picked, setPicked] = useState(null);
  const OPTIONS = [
    'Oui, 3 m suffit',
    'Oui, 4 m suffit',
    'Non, la mesure est entre deux nombres entiers',
    'On ne peut pas mesurer cette longueur',
  ];
  const CORRECT = 2;

  return (
    <div className="space-y-6">
      <SceneIntro>
        Si tu donnes comme réponse <strong className="font-mono text-slate-900">3 m</strong>, tu es <em>en dessous</em>.
        Si tu donnes <strong className="font-mono text-slate-900">4 m</strong>, tu es <em>au-dessus</em>.
      </SceneIntro>

      {/* Visual comparison */}
      <div className="space-y-2">
        <SectionLabel icon={Search} tone="indigo">Observe</SectionLabel>
        <VisualStage tone="slate">
          <IntegerComparisonSVG />
        </VisualStage>
      </div>

      <div className="space-y-3">
        <QuestionBlock>
          Peut-on écrire cette mesure <strong>exactement</strong> avec un nombre entier ?
        </QuestionBlock>

        <ChoiceGrid
          options={OPTIONS}
          selected={picked}
          onSelect={(i) => {
            setPicked(i);
            const ok = i === CORRECT;
            react(ok);
            onSolved();
          }}
          revealed={picked !== null || solved}
          correctIndex={CORRECT}
          cols={1}
          disabled={solved || picked !== null}
          renderOption={bigOption}
        />

        {(picked !== null || solved) && (
          <Feedback tone={(picked ?? CORRECT) === CORRECT ? 'ok' : 'ko'}>
            <div className="text-base leading-7 space-y-1">
              {(picked ?? CORRECT) !== CORRECT && (
                <p>Bonne réponse : <strong>{OPTIONS[CORRECT]}</strong>.</p>
              )}
              <p>
                <strong>3 est trop petit</strong> et <strong>4 est trop grand</strong>. Aucun nombre entier ne
                permet d'écrire exactement cette mesure. Il nous faut une écriture plus précise.
              </p>
            </div>
          </Feedback>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SCÈNE 3 — L'espace entre 3 et 4 se découpe (moment AHA)
   ══════════════════════════════════════════════════════════════════════ */
function Scene3AHA({ solved, onSolved, react }) {
  const [picked, setPicked] = useState(null);
  const [showDecimal, setShowDecimal] = useState(solved);
  const OPTIONS = ['5', '8', '10', '12'];
  const CORRECT = 2;

  const handleAnswer = (i) => {
    setPicked(i);
    const ok = i === CORRECT;
    react(ok);
    setTimeout(() => {
      setShowDecimal(true);
      onSolved();
    }, ok ? 800 : 1600);
  };

  return (
    <div className="space-y-6">
      <SceneIntro>
        Et si on <strong>découpait l'espace</strong> entre 3 et 4 en petites parts égales ?
        Regarde l'animation ci-dessous.
      </SceneIntro>

      {/* Number line with animated divisions */}
      <div className="space-y-2">
        <SectionLabel icon={Search} tone="emerald">Observe</SectionLabel>
        <VisualStage tone="emerald">
          <NumberLineSVG divisions={10} highlight={7} showLabel={showDecimal} />
        </VisualStage>
      </div>

      <div className="space-y-3">
        <QuestionBlock>Combien de petites parts séparent 3 et 4 ?</QuestionBlock>

        <ChoiceGrid
          options={OPTIONS}
          selected={picked}
          onSelect={handleAnswer}
          revealed={picked !== null || solved}
          correctIndex={CORRECT}
          cols={2}
          disabled={solved || picked !== null}
          renderOption={bigOption}
        />

        {(picked !== null || solved) && (
          <Feedback tone={(picked ?? CORRECT) === CORRECT ? 'ok' : 'ko'}>
            <div className="text-base leading-7 space-y-1">
              {(picked ?? CORRECT) !== CORRECT && <p>Bonne réponse : <strong>10 parts</strong>.</p>}
              <p>
                L'espace entre 3 et 4 a été découpé en <strong>10 parts égales</strong>. Le point de mesure
                se trouve à la <strong>7ᵉ</strong> graduation.
              </p>
            </div>
          </Feedback>
        )}
      </div>

      {/* Decimal reveal — le sommet pédagogique de la scène : le plus grand
          contraste visuel du module, en dehors de la Scène 5. */}
      <AnimatePresence>
        {(showDecimal || solved) && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="space-y-3"
          >
            <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 text-center space-y-3">
              <SectionLabel icon={Sparkles} tone="amber">
                <span className="text-amber-300">Pour écrire précisément cette quantité</span>
              </SectionLabel>
              <div className="font-mono font-extrabold text-6xl sm:text-7xl text-amber-300 tracking-wide">
                3,7
              </div>
              <div className="font-mono text-base sm:text-lg text-slate-300">
                3 ───────── <span className="text-amber-300">●</span> ───────── 4
              </div>
            </div>
            <Feedback tone="info">
              <p className="text-base leading-7">
                On appelle cette écriture un <strong>nombre décimal</strong>. Il permet d'exprimer précisément
                une quantité située entre deux nombres entiers.
              </p>
            </Feedback>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SCÈNE 4 — Les nombres décimaux dans la vraie vie
   ══════════════════════════════════════════════════════════════════════ */

const REAL_LIFE_CARDS = [
  {
    id: 'length',
    emoji: '📏',
    label: 'Longueur',
    value: '3,7 m',
    between: '3 m et 4 m',
    explanation:
      'Une planche peut mesurer 3,7 m : ni exactement 3 m, ni exactement 4 m. Le nombre décimal donne la mesure précise.',
    color: 'bg-indigo-50 border-indigo-200',
    valueColor: 'text-indigo-700',
    svg: (
      <div className="flex flex-col items-center gap-1">
        <RulerSVG value={3.7} animate min={3} max={4} />
      </div>
    ),
  },
  {
    id: 'volume',
    emoji: '🧴',
    label: 'Contenance',
    value: '1,5 L',
    between: '1 L et 2 L',
    explanation:
      '1 L est trop peu précis et 2 L est trop grand. Le nombre décimal 1,5 L indique exactement la quantité réelle dans la bouteille.',
    color: 'bg-sky-50 border-sky-200',
    valueColor: 'text-sky-700',
    svg: (
      <div className="flex justify-center">
        <BottleSVG level={0.5} animate />
      </div>
    ),
  },
  {
    id: 'price',
    emoji: '🏷️',
    label: 'Prix',
    value: '2,50 €',
    between: '2 € et 3 €',
    explanation:
      'Dans la vraie vie, les prix ne tombent pas toujours sur un nombre entier. 2,50 € est entre 2 € et 3 €.',
    color: 'bg-amber-50 border-amber-200',
    valueColor: 'text-amber-700',
    svg: (
      <div className="flex justify-center">
        <PriceSVG value={2.5} min={2} max={3} />
      </div>
    ),
  },
];

function Scene4RealLife({ solved, onSolved, react }) {
  const [openCard, setOpenCard] = useState(null);
  const [visited, setVisited] = useState(new Set(solved ? ['length', 'volume', 'price'] : []));
  const [picked, setPicked] = useState(null);
  const allVisited = REAL_LIFE_CARDS.every((c) => visited.has(c.id));
  const OPTIONS = [
    'Faire des exercices de maths',
    'Exprimer des quantités réelles entre deux nombres entiers',
    'Compter uniquement des objets entiers',
    'Remplacer tous les nombres entiers',
  ];
  const CORRECT = 1;

  const handleCardClick = (id) => {
    setOpenCard((prev) => (prev === id ? null : id));
    setVisited((v) => new Set([...v, id]));
  };

  return (
    <div className="space-y-6">
      <SceneIntro>
        Les nombres décimaux ne servent pas uniquement aux exercices de maths. Touche chaque situation pour
        découvrir comment ils apparaissent dans la vraie vie.
      </SceneIntro>

      {/* Cards gallery */}
      <div className="grid grid-cols-1 gap-3">
        {REAL_LIFE_CARDS.map((card) => {
          const isOpen = openCard === card.id;
          const wasVisited = visited.has(card.id);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardClick(card.id)}
              aria-expanded={isOpen}
              aria-label={`${card.label} — ${card.value}`}
              className={`w-full text-left rounded-2xl border-2 p-4 sm:p-5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-h-[64px] ${card.color} ${
                isOpen ? 'shadow-md' : 'hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl shrink-0" aria-hidden="true">{card.emoji}</span>
                  <div>
                    <div className="font-space font-bold text-slate-600 text-sm">{card.label}</div>
                    <div className={`font-mono font-extrabold text-2xl sm:text-3xl ${card.valueColor}`}>{card.value}</div>
                    <div className="text-sm text-slate-500">entre {card.between}</div>
                  </div>
                </div>
                <div className="text-slate-400 text-lg shrink-0" aria-hidden="true">
                  {wasVisited ? '✓' : '→'}
                </div>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    key="detail"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-3">
                      {card.svg}
                      <p className="text-base leading-7 text-slate-700">{card.explanation}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      {/* Question after visiting all cards */}
      <AnimatePresence>
        {(allVisited || solved) && (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <QuestionBlock>D'après ce que tu viens de voir, les nombres décimaux servent à…</QuestionBlock>
            <ChoiceGrid
              options={OPTIONS}
              selected={picked}
              onSelect={(i) => {
                setPicked(i);
                const ok = i === CORRECT;
                react(ok);
                onSolved();
              }}
              revealed={picked !== null || solved}
              correctIndex={CORRECT}
              cols={1}
              disabled={solved || picked !== null}
              renderOption={bigOption}
            />
            {(picked !== null || solved) && (
              <Feedback tone={(picked ?? CORRECT) === CORRECT ? 'ok' : 'ko'}>
                <div className="text-base leading-7 space-y-1">
                  {(picked ?? CORRECT) !== CORRECT && <p>Bonne réponse : <strong>{OPTIONS[CORRECT]}</strong>.</p>}
                  <p>
                    Partout — longueur, contenance, prix — on a le même besoin : exprimer une quantité{' '}
                    <strong>entre deux nombres entiers</strong>.
                  </p>
                </div>
              </Feedback>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!allVisited && !solved && (
        <p className="text-sm text-slate-400 text-center">
          Explore les {REAL_LIFE_CARDS.length} situations pour continuer.
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SCÈNE 5 — Première rencontre avec 3,7
   ══════════════════════════════════════════════════════════════════════ */
function Scene5FirstMeeting({ solved, onSolved, react }) {
  const [picked, setPicked] = useState(null);
  const OPTIONS = [
    'Je ne sais pas encore, mais je veux découvrir',
    "C'est exactement la même chose que 37",
    '37 est plus petit que 3,7',
  ];
  const CORRECT = 0;

  return (
    <div className="space-y-6">
      {/* Big decimal reveal — le héros visuel de tout le module */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-8 sm:p-10 text-center space-y-4 shadow-lg"
      >
        <div className="text-3xl" aria-hidden="true">✨</div>
        <div className="font-space font-bold text-xs uppercase tracking-widest text-indigo-200">
          Nombre décimal
        </div>
        <div className="font-mono font-extrabold text-7xl sm:text-8xl tracking-wide">
          3,7
        </div>
        <div className="font-mono text-base sm:text-lg text-indigo-100">
          3 ─────── <span className="text-white text-xl">●</span> ─────── 4
        </div>
      </motion.div>

      <p className="text-lg leading-7 text-slate-800 text-center">
        <strong className="font-mono">3,7</strong> est un nombre décimal : il permet d'exprimer précisément
        une quantité située entre <strong className="font-mono">3</strong> et <strong className="font-mono">4</strong>.
      </p>

      {/* Curiosity question */}
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 space-y-3.5">
        <SectionLabel icon={Lightbulb} tone="amber">À toi de réfléchir</SectionLabel>
        <p className="text-lg sm:text-xl font-space font-bold text-amber-950 leading-snug">
          Mais pourquoi écrit-on <span className="font-mono">3,7</span> et pas simplement <span className="font-mono">37</span> ?
        </p>
        <ChoiceGrid
          options={OPTIONS}
          selected={picked}
          onSelect={(i) => {
            setPicked(i);
            react(i === CORRECT);
            onSolved();
          }}
          revealed={picked !== null || solved}
          correctIndex={CORRECT}
          cols={1}
          disabled={solved || picked !== null}
          renderOption={bigOption}
        />
        {(picked !== null || solved) && (
          <Feedback tone="ok">
            <p className="text-base leading-7">
              Exactement ! C'est <strong>la question du prochain module</strong>. Tu vas découvrir ce qui se
              cache derrière la virgule.
            </p>
          </Feedback>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SCÈNE 6 — Mission suivante (transition)
   ══════════════════════════════════════════════════════════════════════ */
function Scene6NextMission({ solved, onSolved }) {
  return (
    <div className="space-y-7">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="space-y-5"
      >
        <div className="text-center space-y-1.5">
          <div className="text-3xl" aria-hidden="true">✓</div>
          <p className="text-lg sm:text-xl font-space font-bold text-slate-900">
            Tu as compris pourquoi les nombres décimaux existent.
          </p>
        </div>

        {/* Arrow SVG */}
        <div className="py-2 flex justify-center">
          <BridgeArrowSVG />
        </div>

        <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-5 sm:p-6 space-y-2 text-center">
          <SectionLabel tone="slate">
            <span className="mx-auto">Dans le module suivant</span>
          </SectionLabel>
          <p className="text-base sm:text-lg leading-7 text-slate-800">
            Tu vas <strong>ouvrir l'unité</strong> et découvrir ce qui se cache derrière la virgule dans un
            nombre décimal.
          </p>
        </div>
      </motion.div>

      {!solved && (
        <div className="flex justify-center">
          <ValidateButton onClick={() => onSolved()} tone="indigo">
            <span className="flex items-center gap-2 text-base px-1">
              J'ai compris
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </span>
          </ValidateButton>
        </div>
      )}
      {solved && (
        <Feedback tone="ok">
          <p className="text-base leading-7">Bien joué ! Le module suivant est maintenant débloqué.</p>
        </Feedback>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   EXPORT PRINCIPAL
   ══════════════════════════════════════════════════════════════════════ */
export default function Module01Mission() {
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);
  const [s4, setS4] = useState(false);
  const [s5, setS5] = useState(false);
  const [s6, setS6] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Pourquoi les nombres décimaux ?"
      moduleSubtitle="Découvre pourquoi les nombres entiers ne suffisent pas."
      estimatedTime="7 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Pourquoi avons-nous besoin des nombres décimaux ?',
        body: (
          <p className="text-base leading-7">
            Quand tu mesures une planche, achètes quelque chose ou lis une étiquette,
            les quantités ne tombent pas toujours sur un nombre entier.
            Tu vas découvrir <strong className="text-white">pourquoi</strong> on a
            inventé les nombres décimaux — avant de voir comment ils fonctionnent.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Un problème de tous les jours',
          subtitle: 'Une mesure coincée entre 3 m et 4 m',
          done: s1,
          content: (kit) => <Scene1Ruler solved={s1} onSolved={() => setS1(true)} react={kit.react} />,
        },
        {
          num: 2,
          title: 'Les entiers ne suffisent pas',
          subtitle: '3 trop court, 4 trop long',
          done: s2,
          content: (kit) => <Scene2Integers solved={s2} onSolved={() => setS2(true)} react={kit.react} />,
        },
        {
          num: 3,
          title: 'Ce qui se passe entre 3 et 4',
          subtitle: 'Découverte du nombre décimal',
          done: s3,
          content: (kit) => <Scene3AHA solved={s3} onSolved={() => setS3(true)} react={kit.react} />,
        },
        {
          num: 4,
          title: 'Dans la vraie vie',
          subtitle: 'Une planche, une bouteille, une étiquette de prix',
          done: s4,
          content: (kit) => <Scene4RealLife solved={s4} onSolved={() => setS4(true)} react={kit.react} />,
        },
        {
          num: 5,
          title: 'Première rencontre',
          subtitle: 'Le nombre 3,7',
          done: s5,
          content: (kit) => (
            <div className="space-y-6">
              <Scene5FirstMeeting solved={s5} onSolved={() => setS5(true)} react={kit.react} />
              {/* L'élève vient de rencontrer 3,7 et de dire pourquoi ce n'est
                  pas 37 : la connaissance du module se pose ici. */}
              {s5 && (
                <KnowledgeBrick
                  id="entre-deux-entiers"
                  variant="new"
                  lead="Voilà ce que tu viens de découvrir, en une phrase."
                />
              )}
            </div>
          ),
        },
        {
          num: 6,
          title: 'Mission suivante',
          subtitle: 'Ce qui se cache derrière la virgule',
          done: s6,
          content: () => <Scene6NextMission solved={s6} onSolved={() => setS6(true)} />,
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Tu sais pourquoi les nombres décimaux existent. Au module
          suivant, tu prends les ciseaux et tu ouvres l'unité toi-même.
        </KnowledgeSnapshot>
      }
    />
  );
}
