import React from 'react';

/**
 * Gauge — cadran de balance/pèse-personne : une jauge graduée dont le
 * remplissage indique une masse. Sert à s'entraîner à LIRE une mesure,
 * comme un objet posé sur une balance à affichage.
 *
 * `revealValue=false` masque l'affichage numérique (l'élève doit lire la
 * graduation atteinte par le remplissage) ; `revealValue=true` l'affiche
 * (utilisé après validation, ou quand la lecture n'est pas ce qui est
 * évalué dans cette étape).
 */
export default function Gauge({ min = 0, max, value, step, labelEvery = 1, unit = 'g', revealValue = false, ariaLabel = 'Balance à affichage' }) {
  const W = 640;
  const PAD_L = 30;
  const PAD_R = 30;
  const axisW = W - PAD_L - PAD_R;
  const span = max - min;
  const toX = (v) => PAD_L + ((v - min) / span) * axisW;

  const ticks = [];
  const n = Math.round(span / step);
  for (let i = 0; i <= n; i += 1) ticks.push(Math.round((min + i * step) * 1000) / 1000);

  const fillX = Math.max(PAD_L, Math.min(W - PAD_R, toX(value)));

  return (
    <div className="w-full" role="img" aria-label={ariaLabel}>
      <svg viewBox={`0 0 ${W} 130`} className="w-full max-w-lg mx-auto select-none">
        {/* Écran d'affichage numérique */}
        <rect x={W / 2 - 70} y="6" width="140" height="34" rx="6" fill="#0f172a" />
        <text x={W / 2} y="30" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="20" fontWeight="700" fill="#4ade80">
          {revealValue ? `${value} ${unit}` : '— — —'}
        </text>

        {/* Piste de la jauge */}
        <rect x={PAD_L} y="66" width={axisW} height="20" rx="10" fill="#e2e8f0" />
        <rect x={PAD_L} y="66" width={Math.max(0, fillX - PAD_L)} height="20" rx="10" fill="#3b82f6" />

        {/* Graduations */}
        {ticks.map((v, i) => {
          const labeled = i % labelEvery === 0;
          return (
            <g key={v}>
              <line x1={toX(v)} y1="90" x2={toX(v)} y2={labeled ? 104 : 98} stroke="#64748b" strokeWidth={labeled ? 2 : 1.2} />
              {labeled && (
                <text x={toX(v)} y="120" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="13" fill="#475569">
                  {v}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
