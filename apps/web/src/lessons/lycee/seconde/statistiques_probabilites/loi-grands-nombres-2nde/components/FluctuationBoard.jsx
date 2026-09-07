import React, { useState, useCallback } from 'react';
import { makeRng, runBernoulliTrials, formatPercent } from '../../../../../common/stats';

/**
 * FluctuationBoard — vingt séries de MÊME taille, posées sur un même axe.
 *
 * OBSERVATION ATTENDUE : le nuage de points est large pour n = 10, étroit
 * pour n = 1 000, et TOUJOURS centré sur p. C'est la fluctuation
 * d'échantillonnage rendue visible d'un seul coup d'œil — là où le module 1
 * ne montrait qu'une série à la fois.
 *
 * L'étendue observée (min → max) est affichée en clair : c'est elle qui
 * s'effondre quand n grandit, et c'est le nombre que l'élève doit comparer
 * d'un réglage à l'autre.
 */
const SERIES_COUNT = 20;

export default function FluctuationBoard({ p, pLabel, onBatch = null, seed0 = 424242 }) {
  const [n, setN] = useState(10);
  const [batches, setBatches] = useState({});   // { [n]: number[] }
  const [seed, setSeed] = useState(seed0);

  const runBatch = useCallback((size) => {
    const rng = makeRng(seed);
    const freqs = Array.from({ length: SERIES_COUNT }, () => runBernoulliTrials(rng, size, p) / size);
    setBatches((prev) => ({ ...prev, [size]: freqs }));
    setSeed((s) => (s * 1664525 + 1013904223) >>> 0);
    onBatch?.(size, freqs);
  }, [seed, p, onBatch]);

  const freqs = batches[n] ?? null;
  const width = 640; const height = 120;
  // Marges latérales dimensionnées pour que les libellés CENTRÉS sur 0 % et
  // 100 % (et le repère « p = … ») tiennent dans le viewBox : un texte
  // text-anchor=middle déborde de la moitié de sa largeur.
  const pad = { left: 30, right: 30, top: 34, bottom: 30 };
  const W = width - pad.left - pad.right;

  // Axe fixe de 0 à 1 : changer n ne doit PAS changer l'échelle, sinon le
  // resserrement — le phénomène même — deviendrait invisible.
  const x = (f) => pad.left + f * W;

  const spread = freqs ? Math.max(...freqs) - Math.min(...freqs) : null;

  return (
    <div className="rounded-2xl border-2 border-violet-100 bg-white p-4 space-y-3">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
          Taille de chaque série
        </div>
        <div className="flex flex-wrap gap-2">
          {[10, 100, 1000].map((size) => (
            <button key={size} type="button"
              onClick={() => { setN(size); runBatch(size); }}
              aria-pressed={n === size}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition active:scale-95 ${
                n === size
                  ? 'border-violet-500 bg-violet-50 text-violet-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300'}`}>
              {SERIES_COUNT} séries de {size.toLocaleString('fr-FR')}
            </button>
          ))}
          {freqs && (
            <button type="button" onClick={() => runBatch(n)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-violet-300 bg-white text-violet-700 hover:bg-violet-50 active:scale-95 transition">
              ↻ Relancer
            </button>
          )}
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img"
        aria-label={freqs
          ? `${SERIES_COUNT} séries de ${n} répétitions : fréquences de ${formatPercent(Math.min(...freqs), 1)} à ${formatPercent(Math.max(...freqs), 1)}, probabilité théorique ${formatPercent(p, 1)}`
          : 'Aucune série lancée pour le moment'}
        className="select-none overflow-visible">
        {/* axe 0 → 1 */}
        <line x1={pad.left} y1={height - pad.bottom} x2={width - pad.right} y2={height - pad.bottom}
          stroke="#cbd5e1" strokeWidth="1.5" />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={x(t)} y1={height - pad.bottom} x2={x(t)} y2={height - pad.bottom + 5} stroke="#cbd5e1" strokeWidth="1.5" />
            <text x={x(t)} y={height - pad.bottom + 18} textAnchor="middle" fontSize="11" fill="#64748b">
              {formatPercent(t, 0)}
            </text>
          </g>
        ))}
        {/* la probabilité théorique : repère fixe */}
        <line x1={x(p)} y1={19} x2={x(p)} y2={height - pad.bottom} stroke="#dc2626" strokeWidth="2" strokeDasharray="4 3" />
        <text x={x(p)} y={14} fontSize="12" fontWeight="700" fill="#dc2626"
          textAnchor={p < 0.12 ? 'start' : p > 0.88 ? 'end' : 'middle'}>
          p = {pLabel}
        </text>
        {/* une pastille par série */}
        {freqs?.map((f, i) => (
          <circle key={i} cx={x(f)} cy={height - pad.bottom - 12 - (i % 5) * 6} r="4.5"
            fill="#7c3aed" fillOpacity="0.55" stroke="#5b21b6" strokeWidth="1" />
        ))}
      </svg>

      {freqs ? (
        <p className="text-sm text-slate-700">
          Les {SERIES_COUNT} séries de <strong>{n.toLocaleString('fr-FR')}</strong> répétitions vont de{' '}
          <strong>{formatPercent(Math.min(...freqs), 1)}</strong> à{' '}
          <strong>{formatPercent(Math.max(...freqs), 1)}</strong> — une étendue de{' '}
          <strong className="text-violet-700">{formatPercent(spread, 1)}</strong>.
        </p>
      ) : (
        <p className="text-sm text-slate-500">Choisis une taille de série pour lancer les {SERIES_COUNT} séries d’un coup.</p>
      )}
    </div>
  );
}
