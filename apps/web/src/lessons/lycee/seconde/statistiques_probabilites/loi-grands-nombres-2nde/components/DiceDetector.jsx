import React, { useState, useCallback } from 'react';
import { makeRng, drawFrom, formatPercent } from '../../../../../common/stats';
import { DICE_CANDIDATES } from '../data';

/**
 * DiceDetector — trois dés, un seul pipé, et la seule arme est la taille de
 * la série.
 *
 * OBSERVATION ATTENDUE, mesurée avant d'écrire le module : sur 30 lancers,
 * le dé pipé (P(6) = 0,25 au lieu de 0,167) sort en tête dans 61 % des cas
 * seulement — autant dire au hasard ; sur 300 lancers, 99 % ; sur 3 000,
 * 100 %. L'élève ne peut donc PAS réussir de façon fiable en petite série,
 * et c'est le propos : ce n'est pas l'œil qui tranche, c'est n.
 *
 * Le composant ne révèle jamais l'identité du dé pipé avant que l'élève
 * n'accuse : la vérification est une décision, pas une observation passive.
 */
const FACES = [1, 2, 3, 4, 5, 6];

export default function DiceDetector({ onVerdict = null, seed0 = 20260906 }) {
  const [n, setN] = useState(30);
  const [counts, setCounts] = useState(null);   // { [id]: number[6] }
  const [accused, setAccused] = useState(null);
  const [seed, setSeed] = useState(seed0);

  const roll = useCallback((size) => {
    const rng = makeRng(seed);
    const next = {};
    for (const die of DICE_CANDIDATES) {
      const weights = die.weights.map((p, i) => ({ value: i, p }));
      const c = new Array(6).fill(0);
      for (let i = 0; i < size; i += 1) c[drawFrom(rng, weights)] += 1;
      next[die.id] = c;
    }
    setCounts(next);
    setN(size);
    setAccused(null);
    setSeed((s) => (s * 1664525 + 1013904223) >>> 0);
  }, [seed]);

  const accuse = (id) => {
    setAccused(id);
    const die = DICE_CANDIDATES.find((d) => d.id === id);
    onVerdict?.({ id, correct: Boolean(die?.rigged), n });
  };

  return (
    <div className="rounded-2xl border-2 border-emerald-100 bg-white p-4 space-y-4">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
          Combien de lancers pour chaque dé ?
        </div>
        <div className="flex flex-wrap gap-2">
          {[30, 300, 3000].map((size) => (
            <button key={size} type="button" onClick={() => roll(size)}
              aria-pressed={counts !== null && n === size}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition active:scale-95 ${
                counts !== null && n === size
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'}`}>
              {size.toLocaleString('fr-FR')} lancers
            </button>
          ))}
        </div>
      </div>

      {counts ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {DICE_CANDIDATES.map((die) => {
            const c = counts[die.id];
            const total = c.reduce((a, b) => a + b, 0);
            const f6 = c[5] / total;
            const isAccused = accused === die.id;
            const revealed = accused !== null;
            return (
              <div key={die.id}
                className={`rounded-xl border-2 p-3 space-y-2 transition ${
                  revealed && die.rigged ? 'border-rose-400 bg-rose-50'
                    : isAccused ? 'border-slate-400 bg-slate-50'
                    : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{die.label}</span>
                  {revealed && (
                    <span className={`text-xs font-bold ${die.rigged ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {die.rigged ? '⚠️ pipé' : '✓ équilibré'}
                    </span>
                  )}
                </div>
                {/* histogramme des six faces */}
                <svg width="100%" viewBox="0 0 180 64" role="img"
                  aria-label={`${die.label} : fréquence du 6 égale à ${formatPercent(f6, 1)}`}
                  className="select-none">
                  {FACES.map((face, i) => {
                    const h = (c[i] / total) * 150;
                    return (
                      <g key={face}>
                        <rect x={6 + i * 29} y={50 - Math.min(h, 44)} width="20" height={Math.min(h, 44)}
                          fill={i === 5 ? '#059669' : '#94a3b8'} rx="2" />
                        <text x={16 + i * 29} y={61} textAnchor="middle" fontSize="9" fill="#64748b">{face}</text>
                      </g>
                    );
                  })}
                  <line x1="4" y1="50.5" x2="176" y2="50.5" stroke="#cbd5e1" strokeWidth="1" />
                </svg>
                <div className="text-sm text-slate-700">
                  Fréquence du 6 : <strong className="tabular-nums">{formatPercent(f6, 1)}</strong>
                </div>
                {!revealed && (
                  <button type="button" onClick={() => accuse(die.id)}
                    className="w-full px-3 py-2 rounded-lg text-xs font-bold border-2 border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 active:scale-95 transition">
                    C’est celui-ci
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Choisis un nombre de lancers : les trois dés seront lancés autant de fois chacun.
        </p>
      )}

      {counts && (
        <p className="text-xs text-slate-500">
          Rappel : sur un dé équilibré, chaque face sort environ {formatPercent(1 / 6, 1)} du temps.
        </p>
      )}
    </div>
  );
}
