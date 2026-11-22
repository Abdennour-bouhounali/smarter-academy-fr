import { useId } from 'react';
import { layoutSpaceFigure } from './spaceFigure';

/**
 * Une figure de l'ESPACE déclarative (unité 14 « الهندسة في الفضاء ») — la sœur 3D de GeoFigure : sphères, pavés, pyramides,
 * cylindres, cônes, troncs de cône, cercles (grands / petits), plans, sections, segments, angles droits. La donnée est décrite
 * dans spaceFigure.js ; le dessin suit la convention du manuel : ce qui est VU en trait plein, ce qui est CACHÉ en pointillés.
 * SVG, jamais une image ; les noms de points sont du texte LTR, l'élément porte un `aria-label` arabe.
 *
 * Utilisée par les leçons de l'unité 14 et par la pratique (`statement.figure` avec `kind: 'space'`,
 * features/practice/ExerciseStatement.jsx).
 */
const STROKE = {
  slate: '#334155', indigo: '#4f46e5', rose: '#e11d48', emerald: '#059669', amber: '#d97706', sky: '#0284c7', violet: '#7c3aed',
};
const FILL = {
  slate: 'rgba(100,116,139,0.10)', indigo: 'rgba(79,70,229,0.14)', rose: 'rgba(225,29,72,0.14)', emerald: 'rgba(5,150,105,0.22)',
  amber: 'rgba(217,119,6,0.16)', sky: 'rgba(2,132,199,0.18)', violet: 'rgba(124,58,237,0.14)',
};
const pts = (list) => list.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

export default function SpaceFigure(fig) {
  const { ariaLabel, maxWidth = 380, caption, inline = false } = fig;
  const uid = useId().replace(/:/g, '');
  const Fig = inline ? 'span' : 'figure';
  const Cap = inline ? 'span' : 'figcaption';
  const L = layoutSpaceFigure(fig);
  const hidden = new Set(fig.hidden ?? []);
  const textProps = { direction: 'ltr', unicodeBidi: 'isolate' };

  return (
    <Fig className="mx-auto my-2 block w-full" style={{ maxWidth }} data-space-figure>
      <svg viewBox={`0 0 ${L.width.toFixed(1)} ${L.height.toFixed(1)}`} className="h-auto w-full" role="img" aria-label={ariaLabel}>
        <defs>
          {L.outlines.map((o, i) => (
            <radialGradient key={i} id={`${uid}-sph${i}`} cx="38%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="55%" stopColor={STROKE[o.tone]} stopOpacity="0.10" />
              <stop offset="100%" stopColor={STROKE[o.tone]} stopOpacity="0.26" />
            </radialGradient>
          ))}
        </defs>
        {L.outlines.map((o, i) => (
          <circle key={`ol${i}`} cx={o.c[0]} cy={o.c[1]} r={o.r} fill={o.fill ? `url(#${uid}-sph${i})` : 'none'} stroke={STROKE[o.tone]} strokeWidth={1.8} data-space-outline />
        ))}
        {L.fills.map((f, i) => (
          <g key={`fl${i}`} data-space-fill={f.kind}>
            <polygon points={pts(f.pts)} fill={FILL[f.tone]} stroke={f.kind === 'section' ? STROKE[f.tone] : 'none'} strokeWidth={f.kind === 'section' ? 1.6 : 0} />
            {f.label && (() => {
              const p = f.pts[0];
              return <text x={p[0] + 8} y={p[1] + 16} fontSize={12} fontWeight={600} fill={STROKE[f.tone]} style={textProps}>{f.label}</text>;
            })()}
          </g>
        ))}
        {L.lines.map((l, i) => (
          <polyline
            key={`ln${i}`}
            points={pts(l.pts)}
            fill="none"
            stroke={STROKE[l.tone]}
            strokeWidth={l.bold ? 2.6 : l.hidden ? 1.2 : 1.7}
            strokeDasharray={l.hidden ? '5 4' : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={l.hidden ? 0.75 : 1}
            data-space-line={l.hidden ? 'hidden' : 'seen'}
          />
        ))}
        {(fig.segments ?? []).filter((s) => s.label != null).map((s, i) => {
          const lab = L.segmentLabel(s);
          return <text key={`sl${i}`} x={lab[0]} y={lab[1]} fontSize={13} fontWeight={600} fill={s.tone ? STROKE[s.tone] : '#0f172a'} textAnchor="middle" style={textProps}>{s.label}</text>;
        })}
        {(fig.rightAngles ?? []).map((ra, i) => (
          <polyline key={`ra${i}`} points={pts(L.rightAngle(ra))} fill="none" stroke="#e11d48" strokeWidth={1.3} />
        ))}
        {Object.keys(L.P).filter((n) => !hidden.has(n)).map((n) => (
          <g key={`pt${n}`}>
            <circle cx={L.P[n][0]} cy={L.P[n][1]} r={2.6} fill="#0f172a" />
            <text x={L.pointLabels[n][0]} y={L.pointLabels[n][1]} fontSize={14} fontWeight={700} fill="#0f172a" textAnchor="middle" style={textProps}>{n}</text>
          </g>
        ))}
      </svg>
      {caption && <Cap className="mt-1 block text-center text-xs text-slate-500">{caption}</Cap>}
    </Fig>
  );
}
