import React from 'react';
import { formatNumber, formatPercent } from './statsUtils';

/**
 * Histogram — histogramme d'une série regroupée en classes, avec en option
 * le polygone des fréquences CUMULÉES croissantes tracé par-dessus.
 *
 * Point mathématique qui justifie ce composant plutôt qu'un diagramme en
 * barres : la hauteur d'une barre est la DENSITÉ (effectif / amplitude), donc
 * c'est l'AIRE qui représente l'effectif. Sur des classes d'amplitudes
 * inégales, un diagramme en barres ment ; cet histogramme, non. Les barres
 * sont donc contiguës et occupent leur vraie largeur sur l'axe.
 *
 * @param {ReturnType<typeof groupIntoClasses>} classes
 * @param {boolean} [useDensity=true]  hauteur = densité (sinon = effectif)
 * @param {boolean} [showCumulative]   polygone des fréquences cumulées
 * @param {number}  [readAt]           lecture guidée du polygone à cette fréquence (0–1)
 */
export default function Histogram({
  classes,
  useDensity = true,
  showCumulative = false,
  readAt = null,
  unit = '',
  width = 640,
  height = 280,
  barLabel = 'effectif',
}) {
  if (!classes || classes.length === 0) return null;
  const pad = { left: 46, right: showCumulative ? 50 : 16, top: 26, bottom: 46 };
  const W = width - pad.left - pad.right;
  const H = height - pad.top - pad.bottom;

  const xLo = classes[0].from;
  const xHi = classes[classes.length - 1].to;
  const xSpan = xHi - xLo || 1;
  const toX = (v) => ((v - xLo) / xSpan) * W;

  const heightOf = (c) => (useDensity ? c.density : c.count);
  const yMax = Math.max(...classes.map(heightOf), 1);
  // Échelle « ronde » pour l'axe des hauteurs.
  const niceMax = (m) => {
    const pow = 10 ** Math.floor(Math.log10(m));
    for (const f of [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10]) if (m <= f * pow) return f * pow;
    return 10 * pow;
  };
  const top = niceMax(yMax);
  const toY = (v) => H - (v / top) * H;
  const toYc = (f) => H - f * H; // fréquences cumulées : 0 → 1 sur toute la hauteur

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * top);
  const cumPoints = classes.map((c) => ({ x: toX(c.to), y: toYc(c.cumulativeFrequency) }));
  // Le polygone part de la borne inférieure de la 1re classe, à la fréquence 0.
  const cumPath = [{ x: toX(xLo), y: toYc(0) }, ...cumPoints]
    .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Lecture guidée : où le polygone atteint-il la fréquence `readAt` ?
  let readX = null;
  if (readAt !== null) {
    let prevX = xLo; let prevF = 0;
    for (const c of classes) {
      if (c.cumulativeFrequency >= readAt) {
        const df = c.cumulativeFrequency - prevF;
        readX = df === 0 ? c.to : prevX + ((readAt - prevF) / df) * (c.to - prevX);
        break;
      }
      prevX = c.to; prevF = c.cumulativeFrequency;
    }
  }

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img"
      aria-label={`Histogramme de ${classes.length} classes${showCumulative ? ' avec polygone des fréquences cumulées' : ''}`}
      className="select-none overflow-visible">
      <g transform={`translate(${pad.left},${pad.top})`}>
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={0} y1={toY(t)} x2={W} y2={toY(t)} stroke="#e2e8f0" strokeWidth="1" />
            <text x={-8} y={toY(t) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{formatNumber(t, 2)}</text>
          </g>
        ))}
        {classes.map((c, i) => {
          const h = heightOf(c);
          return (
            <g key={i}>
              <rect x={toX(c.from)} y={toY(h)} width={Math.max(1, toX(c.to) - toX(c.from))} height={H - toY(h)}
                fill="#38bdf8" fillOpacity="0.55" stroke="#0284c7" strokeWidth="1.5" />
              {/* Étiquette au-dessus de la barre, sauf si elle sortirait du
                  cadre : dans ce cas elle passe à l'intérieur, en blanc. */}
              {c.count > 0 && (
                toY(h) > 14 ? (
                  <text x={(toX(c.from) + toX(c.to)) / 2} y={toY(h) - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#0369a1">
                    {c.count}
                  </text>
                ) : (
                  <text x={(toX(c.from) + toX(c.to)) / 2} y={toY(h) + 13} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
                    {c.count}
                  </text>
                )
              )}
            </g>
          );
        })}
        {showCumulative && (
          <>
            <path d={cumPath} fill="none" stroke="#c026d3" strokeWidth="2.5" />
            {cumPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#c026d3" />)}
            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <text key={f} x={W + 8} y={toYc(f) + 4} fontSize="10" fill="#c026d3">{formatPercent(f, 0)}</text>
            ))}
            {readX !== null && (
              <g>
                <line x1={0} y1={toYc(readAt)} x2={toX(readX)} y2={toYc(readAt)} stroke="#059669" strokeWidth="2" strokeDasharray="4 3" />
                <line x1={toX(readX)} y1={toYc(readAt)} x2={toX(readX)} y2={H} stroke="#059669" strokeWidth="2" strokeDasharray="4 3" />
                <text x={toX(readX)} y={H + 30} textAnchor="middle" fontSize="11" fontWeight="700" fill="#059669">
                  {formatNumber(readX, 1)}
                </text>
              </g>
            )}
          </>
        )}
        <line x1={0} y1={H} x2={W} y2={H} stroke="#475569" strokeWidth="1.5" />
        <line x1={0} y1={0} x2={0} y2={H} stroke="#475569" strokeWidth="1.5" />
        {classes.map((c, i) => (
          <g key={`t${i}`}>
            <line x1={toX(c.from)} y1={H} x2={toX(c.from)} y2={H + 5} stroke="#94a3b8" strokeWidth="1" />
            <text x={toX(c.from)} y={H + 18} textAnchor="middle" fontSize="10" fill="#64748b">{formatNumber(c.from, 2)}</text>
          </g>
        ))}
        <line x1={toX(xHi)} y1={H} x2={toX(xHi)} y2={H + 5} stroke="#94a3b8" strokeWidth="1" />
        <text x={toX(xHi)} y={H + 18} textAnchor="middle" fontSize="10" fill="#64748b">{formatNumber(xHi, 2)}</text>
        <text x={W} y={H + 40} textAnchor="end" fontSize="10" fill="#94a3b8">{unit}</text>
        <text x={0} y={-7} textAnchor="start" fontSize="10" fill="#94a3b8">
          {useDensity ? `${barLabel} / amplitude` : barLabel}
        </text>
      </g>
    </svg>
  );
}
