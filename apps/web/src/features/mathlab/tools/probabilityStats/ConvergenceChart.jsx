import { formatValue } from '../functionGrapher/grapherFormat.js';

/**
 * La LOI DES GRANDS NOMBRES, dessinée — le graphique le plus important de
 * l'outil (§ 19 du cahier des charges).
 *
 * En abscisse le nombre de tirages, en échelle LOGARITHMIQUE : c'est le seul
 * moyen de voir 10, 100, 1 000 et 100 000 sur le même dessin, donc de voir
 * l'entonnoir se refermer. En ordonnée la fréquence de l'issue suivie. La
 * droite de la probabilité théorique est horizontale et fixe : c'est la
 * fréquence qui vient à elle, jamais l'inverse.
 *
 * Rien n'est expliqué ici. Le dessin dit la chose.
 */

const VIEW_HEIGHT = 190;
const PAD = { top: 14, right: 16, bottom: 30, left: 46 };

export default function ConvergenceChart({ points, theoretical, title, compact = false }) {
  const VIEW_WIDTH = compact ? 440 : 720;
  const plotWidth = VIEW_WIDTH - PAD.left - PAD.right;
  const plotHeight = VIEW_HEIGHT - PAD.top - PAD.bottom;
  if (!points || points.length < 2) return null;

  const nMax = Math.max(10, points[points.length - 1].n);
  const logMax = Math.log10(nMax);
  const x = (n) => PAD.left + (logMax <= 0 ? 0 : (Math.log10(Math.max(1, n)) / logMax) * plotWidth);

  // La fenêtre verticale s'ouvre autour de la probabilité théorique, assez
  // large pour contenir les premiers écarts (une série de 10 peut donner 0,8)
  // mais jamais si large que l'entonnoir devienne plat.
  const frequencies = points.map((p) => p.frequency);
  const spread = Math.max(0.08, ...frequencies.map((f) => Math.abs(f - theoretical)));
  const yLow = Math.max(0, theoretical - spread * 1.15);
  const yHigh = Math.min(1, theoretical + spread * 1.15);
  const y = (f) => PAD.top + plotHeight - ((f - yLow) / Math.max(1e-6, yHigh - yLow)) * plotHeight;

  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.n).toFixed(1)},${y(p.frequency).toFixed(1)}`).join(' ');
  const decades = [];
  for (let d = 1; d <= nMax; d *= 10) decades.push(d);
  // Le total lui-même est gradué s'il est assez loin de la dernière décade
  // pour que « 1000 » et « 1010 » ne s'écrivent pas l'un sur l'autre.
  if (nMax / decades[decades.length - 1] >= 1.6) decades.push(nMax);

  return (
    <svg
      className="sa-ml-ps__chart sa-ml-ps__chart--convergence"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={title}
      dir="ltr"
      data-ml-ps-convergence
    >
      {[yLow, (yLow + yHigh) / 2, yHigh].map((value) => (
        <g key={value}>
          <line x1={PAD.left} y1={y(value)} x2={PAD.left + plotWidth} y2={y(value)} stroke="#f1f5f9" strokeWidth="1" />
          <text x={PAD.left - 8} y={y(value) + 4} textAnchor="end" className="sa-ml-ps__chart-tick">
            {formatValue(value * 100, 0)} %
          </text>
        </g>
      ))}

      <line
        x1={PAD.left}
        y1={y(theoretical)}
        x2={PAD.left + plotWidth}
        y2={y(theoretical)}
        className="sa-ml-ps__theoretical"
        data-ml-ps-convergence-theoretical
      />
      <text x={PAD.left + plotWidth - 2} y={y(theoretical) - 6} textAnchor="end" className="sa-ml-ps__chart-legend sa-ml-ps__chart-legend--theoretical">
        p = {formatValue(theoretical, 3)}
      </text>

      <path d={path} className="sa-ml-ps__trajectory" />

      <line x1={PAD.left} y1={PAD.top + plotHeight} x2={PAD.left + plotWidth} y2={PAD.top + plotHeight} stroke="#475569" strokeWidth="1.5" />
      {decades.map((d) => (
        <g key={d}>
          <line x1={x(d)} y1={PAD.top + plotHeight} x2={x(d)} y2={PAD.top + plotHeight + 4} stroke="#94a3b8" strokeWidth="1" />
          <text x={x(d)} y={PAD.top + plotHeight + 17} textAnchor="middle" className="sa-ml-ps__chart-label">{d}</text>
        </g>
      ))}
    </svg>
  );
}
