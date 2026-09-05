import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { formatDec } from '@smarter-academy/core';
import { FACES, MAX_TOTAL, totalOf, frequencies, formatPct, probabilities, loadedWeights, scaleMax } from './probaUtils';

/**
 * DiceLab — le laboratoire du dé : un dé sombre sur son plateau, la bande des
 * derniers résultats, et six pistes horizontales qui s'allongent.
 *
 * Activity            lancer un dé (1, 10, 100 ou 1 000 fois), lancer une
 *                     expérience programmée (« après trois 6 »), alourdir une
 *                     face, et regarder les effectifs se construire.
 * Mathematical objective  faire VIVRE la chaîne résultat isolé → effectifs →
 *                     fréquences → stabilisation → probabilité, avant tout mot.
 * Student action      toucher « Lancer » ; choisir le nombre de lancers ;
 *                     désigner une face (prédiction, ou face alourdie).
 * Controlled variable le nombre de lancers, puis les poids du dé.
 * Mathematical state  `counts` — six effectifs — appartient au MODULE. Total,
 *                     fréquences, longueur des pistes, repère théorique en
 *                     sont dérivés à chaque rendu.
 * Visual consequence  le dé tourne puis montre sa face ; sa face rejoint la
 *                     bande des derniers résultats ; sa piste s'allonge ; les
 *                     effectifs se mettent à jour APRÈS le roulement.
 * Expected observation « la bande des résultats n'a aucun ordre ; mais sur
 *                     1 000 lancers les six pistes ont presque la même longueur ».
 * Misconception targeted  « le 6 est plus dur » ; « après trois 6, le 6 est
 *                     plus (ou moins) probable » ; « les fréquences finissent
 *                     exactement égales ».
 * Feedback            effectifs et fréquences écrits au bout de chaque piste.
 * Formalization       le repère théorique (trait pointillé sur chaque piste)
 *                     n'apparaît que lorsque `theory` est passé.
 * Scaffolding         `controls` n'ouvre que les boutons de l'étape ; `frozen`
 *                     fige l'instrument en image d'une série passée.
 *
 * SÉCURITÉ D'AFFICHAGE (§17bis) — TOUT EST DANS LE DOM : chaque piste est une
 * rangée [face | piste | effectif | fréquence] en grille ; la barre est un
 * pourcentage de la piste (jamais > 100 % puisque `scaleMax` contient la
 * barre la plus longue ET le repère le plus haut) ; les nombres ont leur
 * propre colonne à largeur réservée (6 chiffres + espace). Aucun texte SVG.
 * La bande des résultats est plafonnée à TAIL faces.
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
export function Pips({ face, color = '#0f172a', r = 9 }) {
  if (!PIPS[face]) return null;
  return PIPS[face].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={r} fill={color} />);
}

const TONES = {
  slate: { stroke: '#475569', fill: '#ffffff', pip: '#334155' },
  indigo: { stroke: '#4f46e5', fill: '#eef2ff', pip: '#4338ca' },
  amber: { stroke: '#d97706', fill: '#fffbeb', pip: '#b45309' },
  emerald: { stroke: '#059669', fill: '#ecfdf5', pip: '#047857' },
  dark: { stroke: '#0f172a', fill: '#1e293b', pip: '#ffffff' },
};

/** Une face de dé — icône autonome pour les cartes, chips et réponses. */
export function DieIcon({ face, size = 28, tone = 'slate', title }) {
  const t = TONES[tone] ?? TONES.slate;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img"
      aria-label={title ?? (face ? `Face ${face}` : 'Dé')} className="shrink-0">
      <rect x="6" y="6" width="88" height="88" rx="18" fill={t.fill} stroke={t.stroke} strokeWidth="6" />
      {face ? <Pips face={face} color={t.pip} r={10} /> : (
        <text x="50" y="64" textAnchor="middle" fontSize="44" fontWeight="700" fill={t.stroke}>?</text>
      )}
    </svg>
  );
}

/** Six faces à toucher : prédiction, ou face à alourdir. */
export function FaceChips({ value, onChange, label, disabled = false, tone = 'indigo' }) {
  const on = tone === 'amber'
    ? 'bg-amber-500 border-amber-600'
    : 'bg-slate-900 border-slate-900';
  const hover = tone === 'amber' ? 'hover:border-amber-400' : 'hover:border-slate-500';
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
          <DieIcon face={f} size={34} tone={value === f ? 'dark' : 'slate'} title={`Face ${f}`} />
        </button>
      ))}
    </div>
  );
}

/**
 * PredictionChips — une prédiction SANS verdict. L'élève s'engage ; c'est
 * l'expérience qui suit qui répond, pas un feedback textuel (§9).
 */
export function PredictionChips({ options, value, onChange, label, disabled = false }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(o.id)}
          aria-pressed={value === o.id}
          className={`min-h-[48px] px-3 py-2 rounded-xl border-2 text-sm font-semibold transition text-left
            focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60
            ${value === o.id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-500'}`}
          style={{ touchAction: 'manipulation' }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Le gros dé : sombre, pastilles blanches ; il roule (CSS) puis se pose. */
export function BigDie({ face, rolling, loaded = false, reduce, size = 96 }) {
  const [tumble, setTumble] = useState(1);
  useEffect(() => {
    if (!rolling || reduce) return undefined;
    const id = setInterval(() => setTumble((t) => (t % 6) + 1), 70);
    return () => clearInterval(id);
  }, [rolling, reduce]);

  const shown = rolling && !reduce ? tumble : face;
  return (
    <div className={`dl-die ${rolling && !reduce ? 'dl-rolling' : ''}`} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
        <rect x="4" y="4" width="92" height="92" rx="22"
          fill={loaded ? '#b45309' : '#1e293b'} stroke={loaded ? '#fbbf24' : '#0f172a'} strokeWidth="4" />
        <rect x="10" y="10" width="80" height="34" rx="16" fill="#ffffff" opacity="0.08" />
        {shown ? <Pips face={shown} color="#ffffff" /> : (
          <text x="50" y="64" textAnchor="middle" fontSize="40" fontWeight="700" fill="#94a3b8">?</text>
        )}
      </svg>
    </div>
  );
}

export const DIE_STYLE = `
@keyframes dl-tumble {
  0% { transform: rotate(0deg) translateY(0) scale(1); }
  40% { transform: rotate(200deg) translateY(-10px) scale(1.12); }
  100% { transform: rotate(360deg) translateY(0) scale(1); }
}
.dl-die { display: inline-block; will-change: transform; }
.dl-rolling { animation: dl-tumble 450ms ease-out; }
@media (prefers-reduced-motion: reduce) { .dl-rolling { animation: none; } }
`;

export const btnBase = 'min-h-[44px] px-4 rounded-xl border-2 font-semibold text-sm transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed';
export const btnPrimary = `${btnBase} bg-slate-900 border-slate-900 text-white hover:bg-slate-700`;
export const btnSecondary = `${btnBase} bg-white border-slate-300 text-slate-800 hover:border-slate-900`;
export const btnAmber = `${btnBase} bg-amber-500 border-amber-600 text-white hover:bg-amber-600`;
export const btnGhost = `${btnBase} bg-white border-slate-200 text-slate-600 hover:border-slate-400`;

/** La bande des derniers résultats : aucun ordre à y lire — c'est le point. */
export function ResultStrip({ recent, predictedFace = null, rolling = false }) {
  if (!recent || recent.length === 0) return null;
  return (
    <div className="flex items-center gap-1 flex-wrap" role="img"
      aria-label={`Derniers résultats, du plus ancien au plus récent : ${recent.join(', ')}`}>
      <span className="text-[11px] font-mono uppercase tracking-wide text-slate-500 mr-1">derniers</span>
      {recent.map((f, i) => {
        const newest = i === recent.length - 1;
        const hit = predictedFace === f;
        return (
          <span key={i} className={`rounded-md ${newest && !rolling ? 'ring-2 ring-slate-900' : ''}`}>
            <DieIcon face={f} size={22} tone={hit ? 'indigo' : 'slate'} />
          </span>
        );
      })}
    </div>
  );
}

/**
 * FaceTracks — six pistes horizontales, une par face. Pur DOM : la barre est
 * un pourcentage de la piste, les nombres ont leur colonne.
 */
export function FaceTracks({ counts, theory = null, predictedFace = null, loadedFace = null, showFreq = false, reduce = false }) {
  const total = totalOf(counts);
  const freqs = frequencies(counts);
  const sm = scaleMax(counts, theory);
  return (
    <div className="space-y-1.5" role="img"
      aria-label={`Effectifs par face : ${FACES.map((f) => `${f} → ${formatDec(counts[f - 1])}`).join(', ')} ; total ${formatDec(total)} lancers`}>
      {FACES.map((f) => {
        const c = counts[f - 1];
        const isPred = predictedFace === f;
        const isLoaded = loadedFace === f;
        const w = (c / sm) * 100;
        const mark = theory && total > 0 ? ((theory[f - 1] * total) / sm) * 100 : null;
        const bar = isLoaded ? 'bg-amber-500' : isPred ? 'bg-indigo-600' : 'bg-slate-700';
        return (
          <div key={f} className={`grid items-center gap-2 rounded-xl px-1.5 py-1 ${isPred ? 'bg-indigo-50' : isLoaded ? 'bg-amber-50' : ''}`}
            style={{ gridTemplateColumns: `28px minmax(0,1fr) 4.5rem ${showFreq ? '4.5rem' : '0px'}` }}>
            <DieIcon face={f} size={26} tone={isLoaded ? 'amber' : isPred ? 'indigo' : 'slate'} />
            <div className="dl-track relative h-6 rounded-lg bg-white border border-slate-200 overflow-hidden">
              <motion.div className={`absolute inset-y-0 left-0 rounded-lg ${bar}`}
                initial={false} animate={{ width: `${w}%` }}
                transition={{ duration: reduce ? 0 : 0.45, ease: 'easeOut' }} />
              {mark !== null && (
                <span aria-hidden="true" className="absolute inset-y-0 border-l-2 border-dashed border-amber-600"
                  style={{ left: `${mark}%` }} />
              )}
            </div>
            <span className="font-mono font-bold text-slate-800 tabular-nums text-sm text-right whitespace-nowrap">{formatDec(c)}</span>
            {showFreq && (
              <span className="font-mono text-xs font-semibold text-indigo-700 tabular-nums text-right whitespace-nowrap">{formatPct(freqs[f - 1], total)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DiceLab({
  counts,
  lastFace = null,
  recent = [],             // les derniers résultats (≤ TAIL), du plus ancien au plus récent
  rolling = false,
  loadedFace = null,       // dé truqué : la face alourdie
  predictedFace = null,    // la face annoncée par l'élève (surlignée)
  showFreq = false,        // affiche les fréquences en %
  theory = null,           // [p1..p6] : trace le repère théorique par face
  frozen = false,          // image d'une série passée : aucun bouton
  controls = {},           // { single, ten, hundred, thousand, reset, series, experiment }
  onThrow,                 // (n) => void
  onSeries,                // (n) => void — remet à zéro puis lance n fois
  onExperiment,            // () => void — l'expérience programmée
  onReset,
  caption,
  hideDie = false,
  ariaLabel = 'Laboratoire du dé',
}) {
  const reduce = useReducedMotion();
  const total = totalOf(counts);
  const canThrow = (n) => !rolling && total + n <= MAX_TOTAL;
  const hasControls = !frozen && Object.values(controls).some(Boolean);

  const reading = `Effectifs par face : ${FACES.map((f) => `${f} → ${formatDec(counts[f - 1])}`).join(', ')} ; total ${formatDec(total)} lancers`;
  const theoryLegend = theory && (loadedFace === null
    ? 'probabilité du modèle, dé équilibré : 1/6 ≈ 16,7 % pour chaque face'
    : `probabilité du modèle, dé truqué : 3/8 = 37,5 % pour la face ${loadedFace}, 1/8 = 12,5 % pour les autres`);

  return (
    <div className="w-full rounded-2xl border-2 border-slate-300 bg-slate-50 p-3 sm:p-4 space-y-3"
      role={frozen ? 'img' : 'group'} aria-label={frozen ? `${ariaLabel} — ${reading}` : ariaLabel}>
      <style>{DIE_STYLE}</style>

      {caption && (
        <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wide">{caption}</p>
      )}

      {!hideDie && (
        <div className="rounded-2xl bg-emerald-900 px-3 py-3 flex items-center gap-4 flex-wrap shadow-inner">
          <BigDie face={lastFace} rolling={rolling} loaded={loadedFace !== null} reduce={reduce} />
          <div className="flex-1 min-w-[140px] text-white" aria-live={frozen ? 'off' : 'polite'}>
            <p className="text-2xl font-space font-bold tabular-nums">
              {rolling && !reduce ? (
                <span className="text-emerald-200">🎲 …</span>
              ) : lastFace ? (
                <>🎲 → <span className="text-amber-300">{lastFace}</span></>
              ) : (
                <span className="text-emerald-200">Pas encore lancé</span>
              )}
            </p>
            <p className="text-sm font-mono text-emerald-100">
              <strong className="text-white">{formatDec(total)}</strong> lancer{total > 1 ? 's' : ''}
              {loadedFace !== null && <span className="ml-2 text-amber-300 font-semibold">· dé truqué (face {loadedFace})</span>}
            </p>
          </div>
        </div>
      )}

      {!hideDie && <ResultStrip recent={recent} predictedFace={predictedFace} rolling={rolling} />}

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
          {controls.experiment && (
            <button type="button" className={btnPrimary} disabled={rolling}
              onClick={() => onExperiment?.()}
              aria-label={controls.experiment}
              style={{ touchAction: 'manipulation' }}>
              🧪 {controls.experiment}
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

      <div className="space-y-1.5">
        <p className="text-xs font-mono text-slate-500">
          Nombre d’apparitions de chaque face{showFreq ? ' — et sa fréquence' : ''}
          {' · total : '}<strong className="text-slate-700">{formatDec(total)}</strong>
        </p>
        <FaceTracks counts={counts} theory={theory} predictedFace={predictedFace} loadedFace={loadedFace} showFreq={showFreq} reduce={reduce} />
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

/** La mini-face sous une barre de CountBars (EventBuilder). */
export const faceIcon = (isLoaded) => (i, cx) => (
  <g transform={`translate(${cx - 12} 206) scale(0.24)`}>
    <rect x="6" y="6" width="88" height="88" rx="18" fill="#ffffff"
      stroke={isLoaded(i) ? '#d97706' : '#475569'} strokeWidth="7" />
    <Pips face={i + 1} color={isLoaded(i) ? '#b45309' : '#334155'} r={11} />
  </g>
);
