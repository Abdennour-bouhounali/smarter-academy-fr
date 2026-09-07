import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useDragValue from '../../../../../common/manip6e/useDragValue';
import { formatDec, roundTo } from './decimalUtils';

/**
 * MeasureLab — la règle qu'on DÉCOUPE, et le repère qu'on DÉPLACE.
 *
 * Activity: attraper le repère de mesure entre deux entiers et le glisser ;
 *   puis donner un coup de ciseaux qui coupe l'intervalle en dix, puis en
 *   cent — et voir la mesure gagner une décimale à chaque coupe.
 * Mathematical objective: entre deux entiers il y a de la place, et cette
 *   place se nomme en découpant l'unité en dix, puis chaque part en dix.
 * Student action: un glisser (ou les flèches du clavier) sur le repère
 *   lui-même — jamais un `<input type="range">` sous la figure, jamais un
 *   bouton `+` / `−`. Le pas du geste EST la finesse du découpage.
 * Controlled variable: la position du repère, c'est-à-dire la mesure. La
 *   finesse de découpe est la seconde variable, et une seule bouge à la fois
 *   (§8 : on découpe, puis on glisse).
 * Mathematical state: `value` (la mesure) et `cuts` (0, 1 ou 2 coups de
 *   ciseaux). La graduation, le pas du geste, l'arrondi affiché, la position
 *   du repère et le texte lu en dérivent tous (CLAUDE.md §8).
 * Visual consequence: la règle se subdivise sous les yeux et le repère se
 *   recale sur la nouvelle graduation, immédiatement, sans clic de validation.
 * Expected observation: sans coupe, la mesure ne peut être QUE 3 ou 4 — deux
 *   réponses fausses. Un coup de ciseaux, et « 3,7 » devient dicible ; deux
 *   coups, et « 3,75 » aussi.
 * Misconception targeted: « après 3 vient 4, il n'y a rien entre » — le repère
 *   se pose visiblement entre les deux et n'a pourtant aucun nom tant que
 *   l'unité n'est pas coupée.
 * Formalization: AUCUNE ici. Les mots « dixième », « centième », « fraction
 *   décimale », « virgule » appartiennent aux modules 2, 3 et 4 : ce composant
 *   ne dit que « parts » et « coupe ».
 * Scaffolding: rien ne se fige ; on recoupe, on recolle, on reglisse à volonté.
 *
 * Sécurité d'affichage (§17bis) : la mesure lue vit dans le DOM sous la
 * figure, jamais dans un <text> SVG — elle ne peut donc chevaucher aucune
 * graduation, quel que soit le nombre de décimales. Les seuls <text> du SVG
 * sont les deux bornes entières, aux extrémités, à position fixe. La règle est
 * un SVG à `viewBox` fixe et `width: 100%` : elle rétrécit à 375 px au lieu de
 * déborder.
 */

const W = 320;
const H = 96;
const PAD = 26;
const RULE_Y = 52;

/** Le pas du geste EST la finesse du découpage : 1, puis 0,1, puis 0,01. */
export const stepFor = (cuts) => [1, 0.1, 0.01][Math.min(cuts, 2)];

/** Le nombre de graduations tracées entre les deux bornes. */
export const divisionsFor = (cuts) => [1, 10, 100][Math.min(cuts, 2)];

export default function MeasureLab({
  value,
  onValue,
  cuts,
  onCut,
  min = 3,
  max = 4,
  unit = 'm',
  objectLabel = 'la planche',
  maxCuts = 2,
}) {
  // Quelle prise a le focus : sert à dessiner l'anneau sur la pastille VISIBLE
  // plutôt que le contour noir du navigateur sur la zone de captation de 44 px.
  const [focused, setFocused] = useState(false);

  const step = stepFor(cuts);
  const divisions = divisionsFor(cuts);
  const toX = (v) => PAD + ((v - min) / (max - min)) * (W - 2 * PAD);

  const drag = useDragValue({
    value,
    onChange: (v) => onValue(roundTo(v, 4)),
    min,
    max,
    step,
    ariaLabel: `Repère de mesure sur ${objectLabel}`,
    valueText: (v) => `${formatDec(v)} ${unit}`,
  });

  // Les graduations. Une seule boucle : impossible que le dessin et la
  // mathématique divergent (§5).
  const ticks = Array.from({ length: divisions + 1 }, (_, i) => {
    const v = roundTo(min + (i * (max - min)) / divisions, 4);
    // Sur cent divisions, on n'épaissit qu'un trait sur dix : le reste
    // resterait illisible et se toucherait.
    const major = divisions === 100 ? i % 10 === 0 : true;
    return { v, x: toX(v), major };
  });

  return (
    <div className="space-y-3">
      {/* ── La règle ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          className="block select-none"
          role="img"
          aria-label={`Règle graduée de ${min} à ${max} ${unit}, découpée en ${divisions} part${divisions > 1 ? 's' : ''}`}
          {...drag.frameProps}
        >
          {/* le corps de la règle */}
          <rect x={PAD} y={RULE_Y} width={W - 2 * PAD} height={20} rx={3} fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />

          {ticks.map((t) => (
            <line
              key={t.v}
              x1={t.x} x2={t.x}
              y1={RULE_Y} y2={RULE_Y + (t.major ? 20 : 9)}
              stroke={t.major ? '#b45309' : '#fcd34d'}
              strokeWidth={t.v === min || t.v === max ? 2 : 1}
            />
          ))}

          {/* Les deux bornes entières : les seuls textes du dessin, aux
              extrémités, donc jamais en collision avec quoi que ce soit. */}
          <text x={toX(min)} y={RULE_Y + 36} textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569">{min}</text>
          <text x={toX(max)} y={RULE_Y + 36} textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569">{max}</text>

          {/* L'objet mesuré : sa longueur EST la valeur. */}
          <rect x={PAD} y={RULE_Y - 22} width={Math.max(0, toX(value) - PAD)} height={14} rx={2} fill="#38bdf8" opacity="0.85" />

          {/* Le repère saisissable. C'est lui qu'on attrape — pas un curseur
              posé sous la figure. Zone de prise généreuse (44 px de haut). */}
          <g
            {...drag.handleProps}
            {...drag.a11yProps}
            style={{ ...drag.handleProps.style, outline: 'none' }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          >
            <rect x={toX(value) - 22} y={RULE_Y - 30} width={44} height={44} fill="transparent" />
            <line x1={toX(value)} x2={toX(value)} y1={RULE_Y - 26} y2={RULE_Y + 22} stroke="#0369a1" strokeWidth="2.5" />
            {/* L'anneau de focus, sur la pastille VISIBLE : rayon 13 autour d'une
                pastille de 7,5 posée à y = 22 dans un cadre de 96 — il reste
                donc dans le cadre à toute position, y compris aux deux bornes,
                où la pastille est encore à 26 px des bords gauche et droit. */}
            {focused && (
              <circle
                cx={toX(value)} cy={RULE_Y - 26} r="13"
                fill="none" stroke="#0284c7" strokeWidth="3" opacity="0.85"
              />
            )}
            <circle
              cx={toX(value)} cy={RULE_Y - 26} r={drag.dragging ? 9 : 7.5}
              fill="#0284c7" stroke="#fff" strokeWidth="2.5"
            />
          </g>
        </svg>
      </div>

      {/* ── La mesure lue. DOM, pas SVG : rien ne peut la chevaucher. ── */}
      <div className="flex items-baseline justify-center gap-2" role="status" aria-live="polite">
        <span className="text-sm text-slate-500">{objectLabel} mesure</span>
        <span className="font-mono font-black text-3xl text-sky-700 tabular-nums">
          {formatDec(value)}
        </span>
        <span className="text-sm text-slate-500">{unit}</span>
      </div>

      {/* ── LES CISEAUX ─────────────────────────────────────────────────
          Le geste qui ouvre l'espace entre deux entiers. Il ne calcule rien :
          il rend simplement dicibles des positions qui n'avaient pas de nom. */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onCut(Math.min(maxCuts, cuts + 1))}
          disabled={cuts >= maxCuts}
          className="min-h-[48px] px-4 rounded-xl border-2 border-violet-400 bg-violet-50 text-violet-900 text-sm font-bold hover:bg-violet-100 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          ✂️ Couper chaque part en 10
        </button>
        <button
          type="button"
          onClick={() => onCut(Math.max(0, cuts - 1))}
          disabled={cuts === 0}
          className="min-h-[48px] px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-600 text-sm font-bold hover:border-slate-400 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Recoller
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={cuts}
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="text-center text-xs text-slate-500"
        >
          {cuts === 0
            ? `Aucune coupe : le repère ne peut se poser que sur ${min} ou sur ${max}.`
            : `L'espace entre ${min} et ${max} est coupé en ${divisions} parts égales.`}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
