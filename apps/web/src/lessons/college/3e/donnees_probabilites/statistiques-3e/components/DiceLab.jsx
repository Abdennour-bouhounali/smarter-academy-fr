import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { formatDec } from '@smarter-academy/core';
import {
  FACES, MAX_TOTAL, totalOf, frequencies, formatPct, barGeometry, CHART, probabilities,
  loadedWeights,
} from './diceUtils';

/**
 * DiceLab — le laboratoire du dé : un dé qui roule, six barres qui poussent.
 *
 * Activity            lancer un dé (1, 10, 100 ou 1 000 fois) et regarder la
 *                     série statistique se construire lancer après lancer.
 * Mathematical objective  faire VIVRE la chaîne résultat isolé → série →
 *                     effectifs → fréquences → stabilisation, avant tout mot.
 * Student action      toucher « Lancer » ; choisir le nombre de lancers ;
 *                     désigner une face (prédiction, ou face alourdie).
 * Controlled variable le nombre de lancers, et (plus tard) les poids du dé.
 * Mathematical state  `counts` — six effectifs — appartient au MODULE. Total,
 *                     fréquences, échelle des barres, repère théorique en sont
 *                     dérivés ici à chaque rendu : rien n'est stocké deux fois.
 * Visual consequence  le dé tourne puis montre sa face ; la barre de cette
 *                     face grandit ; les cartes d'effectifs se mettent à jour
 *                     APRÈS le roulement (settle-then-number).
 * Expected observation « peu de lancers : des barres très inégales ; beaucoup
 *                     de lancers : six barres presque de même hauteur ».
 * Misconception targeted  « le 6 est plus dur à faire » ; « une face qui vient
 *                     de sortir trois fois est plus probable » ; « les
 *                     fréquences deviennent exactement égales ».
 * Feedback            les effectifs et fréquences sont écrits sous le
 *                     graphique, en clair, jamais seulement dessinés.
 * Formalization       le repère théorique (1/6, ou 3/8 pour un dé truqué)
 *                     n'apparaît que lorsque `theory` est passé — c'est-à-dire
 *                     après que l'élève a construit l'idée.
 * Scaffolding         `controls` n'ouvre que les boutons de l'étape ;
 *                     `frozen` fige l'instrument en image d'une série passée.
 * Transfer            le même instrument, dé truqué, montre pourquoi 1/6
 *                     dépend de l'hypothèse « dé équilibré ».
 *
 * ─── SÉCURITÉ D'AFFICHAGE (§17bis) ──────────────────────────────────────
 *  1. L'échelle verticale (`scaleMax`) contient toujours la barre la plus
 *     haute ET le repère théorique le plus haut : rien ne dépasse TOP.
 *  2. Chaque étiquette d'effectif vit dans SA colonne de 100 unités, au-dessus
 *     de sa barre, avec un halo blanc pour rester lisible si le repère
 *     pointillé la traverse. Deux étiquettes ne partagent jamais une colonne.
 *  3. Toute lecture numérique longue (« 17 / 1 000 », « 16,7 % ») est un
 *     nœud DOM sous le SVG, dans une grille qui se replie sur mobile — elle ne
 *     peut pas entrer en collision avec le dessin.
 *  4. Les grands nombres restent lisibles : le module plafonne à MAX_TOTAL.
 *  Le test `diceUtils.test.js` balaie ces états ; la suite e2e audite le SVG.
 */

const PIPS = {
  1: [[50, 50]],
  2: [[30, 30], [70, 70]],
  3: [[30, 30], [50, 50], [70, 70]],
  4: [[30, 30], [70, 30], [30, 70], [70, 70]],
  5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
  6: [[30, 30], [70, 30], [30, 50], [70, 50], [30, 70], [70, 70]],
};

/** Les pastilles d'une face, dans un carré 100 × 100. */
function Pips({ face, color = '#0f172a', r = 9 }) {
  if (!PIPS[face]) return null;
  return PIPS[face].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={r} fill={color} />);
}

/** Une face de dé — icône autonome pour les cartes, chips et réponses. */
export function DieIcon({ face, size = 28, tone = 'slate', title }) {
  const stroke = tone === 'indigo' ? '#4f46e5' : tone === 'amber' ? '#d97706' : '#475569';
  const fill = tone === 'indigo' ? '#eef2ff' : tone === 'amber' ? '#fffbeb' : '#ffffff';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img"
      aria-label={title ?? (face ? `Face ${face}` : 'Dé')} className="shrink-0">
      <rect x="6" y="6" width="88" height="88" rx="18" fill={fill} stroke={stroke} strokeWidth="6" />
      {face ? <Pips face={face} color={stroke} r={10} /> : (
        <text x="50" y="64" textAnchor="middle" fontSize="44" fontWeight="700" fill={stroke}>?</text>
      )}
    </svg>
  );
}

/** Six faces à toucher : prédiction, ou face à alourdir. */
export function FaceChips({ value, onChange, label, disabled = false, tone = 'indigo' }) {
  const on = tone === 'amber'
    ? 'bg-amber-500 border-amber-600 text-white'
    : 'bg-indigo-600 border-indigo-600 text-white';
  const hover = tone === 'amber' ? 'hover:border-amber-400' : 'hover:border-indigo-400';
  return (
    <div className="flex flex-wrap gap-1.5 justify-center" role="group" aria-label={label}>
      {FACES.map((f) => (
        <button
          key={f}
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(f)}
          aria-pressed={value === f}
          aria-label={`${label} ${f}`}
          className={`min-w-[48px] min-h-[48px] px-1.5 rounded-xl border-2 flex items-center justify-center transition
            focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60
            ${value === f ? on : `bg-white border-slate-200 ${hover}`}`}
          style={{ touchAction: 'manipulation' }}
        >
          <DieIcon face={f} size={34} tone={value === f ? 'slate' : 'slate'} title={`Face ${f}`} />
        </button>
      ))}
    </div>
  );
}

/** Le gros dé : il roule (CSS), ses pastilles défilent, puis il se pose. */
function BigDie({ face, rolling, loadedFace, reduce }) {
  const [tumble, setTumble] = useState(1);
  useEffect(() => {
    if (!rolling || reduce) return undefined;
    const id = setInterval(() => setTumble((t) => (t % 6) + 1), 70);
    return () => clearInterval(id);
  }, [rolling, reduce]);

  const shown = rolling && !reduce ? tumble : face;
  const loaded = loadedFace !== null;
  return (
    <div className={`dl-die ${rolling && !reduce ? 'dl-rolling' : ''}`} aria-hidden="true">
      <svg width="96" height="96" viewBox="0 0 100 100" className="drop-shadow-md">
        <rect x="4" y="4" width="92" height="92" rx="20"
          fill={loaded ? '#fffbeb' : '#ffffff'} stroke={loaded ? '#d97706' : '#1e293b'} strokeWidth="5" />
        {shown ? <Pips face={shown} color={loaded ? '#b45309' : '#0f172a'} /> : (
          <text x="50" y="64" textAnchor="middle" fontSize="40" fontWeight="700" fill="#94a3b8">?</text>
        )}
      </svg>
    </div>
  );
}

const STYLE = `
@keyframes dl-tumble {
  0% { transform: rotate(0deg) scale(1); }
  45% { transform: rotate(210deg) scale(1.14); }
  100% { transform: rotate(360deg) scale(1); }
}
.dl-die { display: inline-block; will-change: transform; }
.dl-rolling { animation: dl-tumble 450ms ease-out; }
@media (prefers-reduced-motion: reduce) { .dl-rolling { animation: none; } }
`;

const btnBase = 'min-h-[44px] px-4 rounded-xl border-2 font-semibold text-sm transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed';
const btnPrimary = `${btnBase} bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-700`;
const btnSecondary = `${btnBase} bg-white border-indigo-200 text-indigo-800 hover:border-indigo-500`;
const btnAmber = `${btnBase} bg-amber-500 border-amber-600 text-white hover:bg-amber-600`;
const btnGhost = `${btnBase} bg-white border-slate-200 text-slate-600 hover:border-slate-400`;

export default function DiceLab({
  counts,
  lastFace = null,
  rolling = false,
  loadedFace = null,       // dé truqué : la face alourdie
  predictedFace = null,    // la face annoncée par l'élève (surlignée)
  showFreq = false,        // affiche les fréquences en %
  showVocab = false,       // nomme « effectif » sur les cartes
  theory = null,           // [p1..p6] : trace le repère théorique par face
  frozen = false,          // image d'une série passée : aucun bouton
  controls = {},           // { single, ten, hundred, thousand, reset, series }
  onThrow,                 // (n) => void
  onSeries,                // (n) => void — remet à zéro puis lance n fois
  onReset,
  caption,                 // texte au-dessus du graphique (ex. « Série de 100 lancers »)
  ariaLabel = 'Laboratoire du dé',
}) {
  const reduce = useReducedMotion();
  const total = totalOf(counts);
  const freqs = frequencies(counts);
  const { bars } = barGeometry(counts, theory);
  const g = CHART;
  const canThrow = (n) => !rolling && total + n <= MAX_TOTAL;
  const hasControls = !frozen && Object.values(controls).some(Boolean);

  // Le mot « effectif » n'entre dans la lecture d'écran qu'une fois `showVocab`
  // posé — c'est-à-dire une fois la brique « série statistique » rendue. Avant,
  // l'instrument se décrit sans son vocabulaire, comme à l'écran.
  const reading = `${showVocab ? 'Effectifs par face' : 'Apparitions par face'} : ${FACES.map((f) => `${f} → ${counts[f - 1]}`).join(', ')} ; total ${formatDec(total)} lancers`;
  const theoryLegend = theory && (loadedFace === null
    ? 'probabilité du modèle, dé équilibré : 1/6 ≈ 16,7 % pour chaque face'
    : `probabilité du modèle, dé truqué : 3/8 = 37,5 % pour la face ${loadedFace}, 1/8 = 12,5 % pour les autres`);

  return (
    <div className="w-full rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3"
      role={frozen ? 'img' : 'group'} aria-label={frozen ? `${ariaLabel} — ${reading}` : ariaLabel}>
      <style>{STYLE}</style>

      {caption && (
        <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wide">{caption}</p>
      )}

      {/* ── Le dé et sa lecture ── */}
      <div className="flex items-center gap-4 flex-wrap">
        <BigDie face={lastFace} rolling={rolling} loadedFace={loadedFace} reduce={reduce} />
        <div className="flex-1 min-w-[140px]" aria-live={frozen ? 'off' : 'polite'}>
          <p className="text-2xl font-space font-bold text-slate-800 tabular-nums">
            {rolling && !reduce ? (
              <span className="text-slate-400">🎲 …</span>
            ) : lastFace ? (
              <>🎲 → <span className="text-indigo-700">{lastFace}</span></>
            ) : (
              <span className="text-slate-400">Pas encore lancé</span>
            )}
          </p>
          <p className="text-sm font-mono text-slate-600">
            <strong className="text-slate-800">{formatDec(total)}</strong> lancer{total > 1 ? 's' : ''}
            {loadedFace !== null && <span className="ml-2 text-amber-700 font-semibold">· dé truqué (face {loadedFace})</span>}
          </p>
        </div>
      </div>

      {/* ── Les commandes de l'étape ── */}
      {hasControls && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Lancer le dé">
          {controls.single && (
            <button type="button" className={btnPrimary} disabled={!canThrow(1)}
              onClick={() => onThrow?.(1)} aria-label="Lancer le dé" style={{ touchAction: 'manipulation' }}>
              🎲 Lancer
            </button>
          )}
          {controls.ten && (
            <button type="button" className={btnSecondary} disabled={!canThrow(10)}
              onClick={() => onThrow?.(10)} aria-label="Lancer 10 fois" style={{ touchAction: 'manipulation' }}>
              Lancer ×10
            </button>
          )}
          {controls.hundred && (
            <button type="button" className={btnSecondary} disabled={!canThrow(100)}
              onClick={() => onThrow?.(100)} aria-label="Lancer 100 fois" style={{ touchAction: 'manipulation' }}>
              Lancer ×100
            </button>
          )}
          {controls.thousand && (
            <button type="button" className={btnSecondary} disabled={!canThrow(1000)}
              onClick={() => onThrow?.(1000)} aria-label="Lancer 1 000 fois" style={{ touchAction: 'manipulation' }}>
              Lancer ×1 000
            </button>
          )}
          {controls.series && (
            <button type="button" className={loadedFace !== null ? btnAmber : btnPrimary} disabled={rolling}
              onClick={() => onSeries?.(controls.series)}
              aria-label={`Nouvelle série de ${formatDec(controls.series)} lancers`}
              style={{ touchAction: 'manipulation' }}>
              ↻ Nouvelle série : {formatDec(controls.series)} lancers
            </button>
          )}
          {controls.reset && (
            <button type="button" className={btnGhost} disabled={rolling || total === 0}
              onClick={() => onReset?.()} aria-label="Recommencer à zéro" style={{ touchAction: 'manipulation' }}>
              Recommencer
            </button>
          )}
        </div>
      )}

      {/* ── Le graphique : six barres, une par face ── */}
      <svg viewBox={`0 0 ${g.W} ${g.H}`} className="w-full max-w-[640px] mx-auto select-none block"
        role="img" aria-label={reading}>
        <line x1="8" y1={g.BASE} x2={g.W - 8} y2={g.BASE} stroke="#0f172a" strokeWidth="2" />
        {bars.map((b) => {
          const isPred = predictedFace === b.face;
          const isLoaded = loadedFace === b.face;
          const fill = isLoaded ? '#f59e0b' : isPred ? '#4f46e5' : '#818cf8';
          return (
            <g key={b.face}>
              <motion.rect
                x={b.x} width={g.BAR_W} rx="4" fill={fill}
                initial={false}
                animate={{ y: b.y, height: b.h }}
                transition={{ duration: reduce ? 0 : 0.5, ease: 'easeOut' }}
              />
              {b.tick !== null && (
                <line x1={b.cx - g.BAR_W / 2 - 10} y1={b.tick} x2={b.cx + g.BAR_W / 2 + 10} y2={b.tick}
                  stroke="#d97706" strokeWidth="2.5" strokeDasharray="6 4" />
              )}
              <text x={b.cx} y={b.labelY} textAnchor="middle" fontSize="12"
                className="font-mono font-bold tabular-nums" fill="#1e293b"
                stroke="#ffffff" strokeWidth="3" paintOrder="stroke">
                {b.label}
              </text>
              {/* la face, sous la ligne de base — une mini-face, pas un chiffre */}
              <g transform={`translate(${b.cx - g.FACE_SIZE / 2} ${g.FACE_Y}) scale(${g.FACE_SIZE / 100})`}>
                <rect x="6" y="6" width="88" height="88" rx="18" fill="#ffffff"
                  stroke={isLoaded ? '#d97706' : '#475569'} strokeWidth="7" />
                <Pips face={b.face} color={isLoaded ? '#b45309' : '#334155'} r={11} />
              </g>
            </g>
          );
        })}
      </svg>

      {/* ── Les lectures, en clair et hors du dessin ── */}
      <div className="space-y-1.5">
        <p className="text-xs font-mono text-slate-500">
          {showVocab ? 'Effectif de chaque face (nombre d’apparitions)' : 'Nombre d’apparitions de chaque face'}
          {' — total : '}<strong className="text-slate-700">{formatDec(total)}</strong>
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {FACES.map((f) => {
            const c = counts[f - 1];
            const isPred = predictedFace === f;
            const isLoaded = loadedFace === f;
            const ring = isLoaded ? 'border-amber-400 bg-amber-50' : isPred ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-slate-50';
            return (
              <div key={f} className={`rounded-xl border-2 ${ring} px-2 py-1.5 flex flex-col items-center gap-0.5 min-w-0`}>
                <DieIcon face={f} size={22} tone={isLoaded ? 'amber' : isPred ? 'indigo' : 'slate'} />
                <span className="font-mono font-bold text-slate-800 tabular-nums text-sm leading-tight">{formatDec(c)}</span>
                <span className="font-mono text-[11px] text-slate-500 tabular-nums leading-tight">/ {formatDec(total)}</span>
                {showFreq && (
                  <span className="font-mono text-xs font-semibold text-indigo-700 tabular-nums leading-tight">
                    {formatPct(freqs[f - 1], total)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {theoryLegend && (
          <p className="text-xs text-amber-800 flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-6 border-t-2 border-dashed border-amber-600" />
            <span>{theoryLegend}</span>
          </p>
        )}
      </div>
    </div>
  );
}

/** Les probabilités du dé courant — pour passer `theory` sans les recalculer partout. */
export const theoryFor = (loadedFace) => probabilities(loadedWeights(loadedFace));
