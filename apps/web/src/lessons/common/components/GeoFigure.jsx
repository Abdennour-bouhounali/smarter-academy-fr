import {
  layoutGeoFigure, tickMarks, parallelArrows, rightAngleSquare, angleArc, vectorArrow, semicirclePath, centeredArc,
} from './geoFigure';

/**
 * Une figure de géométrie DÉCLARATIVE (vecteurs fléchés et quadrillage depuis les unités 11–12, points nommés, segments, droites, demi-droites, polygones,
 * angles droits, angles, traits d'égalité, chevrons de parallélisme) — la donnée est décrite dans
 * geoFigure.js. Dessinée en SVG, jamais une image ; les noms de points et les longueurs sont du
 * texte LTR (`direction="ltr"`), l'élément porte un `aria-label` arabe.
 *
 * Utilisée par les leçons de l'unité 9 « خاصية طالس » et par la pratique (`statement.figure`,
 * features/practice/ExerciseStatement.jsx) : un exercice qui dit « في الشكل المقابل » montre le shape.
 */
const STROKE = {
  slate: '#334155', indigo: '#4f46e5', rose: '#e11d48', emerald: '#059669', amber: '#d97706', sky: '#0284c7', violet: '#7c3aed',
};
const FILL = {
  slate: 'rgba(100,116,139,0.10)', indigo: 'rgba(79,70,229,0.12)', rose: 'rgba(225,29,72,0.10)', emerald: 'rgba(5,150,105,0.12)',
  amber: 'rgba(217,119,6,0.12)', sky: 'rgba(2,132,199,0.12)', violet: 'rgba(124,58,237,0.12)',
};
const asSegment = (s) => (Array.isArray(s) ? { from: s[0], to: s[1] } : s);
const pts = (list) => list.map((p) => p.join(',')).join(' ');

export default function GeoFigure(fig) {
  // Une figure quadrillée (unités 11–12) porte beaucoup de noms : elle s'affiche plus grande par défaut (règle du 2026-10-04,
  // « une figure doit être grande et facile à voir »).
  const { ariaLabel, maxWidth = fig.grid ? 540 : 360, caption, inline = false } = fig;
  // `inline` : la figure posée DANS un paragraphe (l'énoncé d'une épreuve du BossFinal est un <p>) —
  // des <span> blocs au lieu de <figure>/<figcaption>, que le HTML refuse dans un <p>.
  const Fig = inline ? 'span' : 'figure';
  const Cap = inline ? 'span' : 'figcaption';
  const L = layoutGeoFigure(fig);
  const hidden = new Set(fig.hidden ?? []);
  const textProps = { direction: 'ltr', unicodeBidi: 'isolate' };

  return (
    <Fig className="mx-auto my-2 block w-full" style={{ maxWidth }} data-geo-figure>
      <svg
        viewBox={L.viewBox.map((v) => v.toFixed(1)).join(' ')}
        className="h-auto w-full"
        role="img"
        aria-label={ariaLabel}
      >
        {L.gridLines.map(([a, b], i) => (
          <line key={`gd${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#cbd5e1" strokeWidth={0.8} data-geo-grid />
        ))}
        {L.axes && (
          <g data-geo-axes>
            {[L.axes.x, L.axes.y].map(([a, b], i) => {
              const ar = vectorArrow(a, [b[0] + (i === 0 ? 8 : 0), b[1] - (i === 1 ? 8 : 0)], 8);
              return (
                <g key={`ax${i}`}>
                  <line x1={ar.shaft[0][0]} y1={ar.shaft[0][1]} x2={ar.shaft[1][0]} y2={ar.shaft[1][1]} stroke="#475569" strokeWidth={1.5} />
                  <polygon points={pts(ar.head)} fill="#475569" />
                </g>
              );
            })}
            {L.axes.ticks.map((tk) => (
              <g key={`tk${tk.axis}${tk.text}`}>
                <line x1={tk.at[0] - (tk.axis === 'y' ? 3 : 0)} y1={tk.at[1] - (tk.axis === 'x' ? 3 : 0)} x2={tk.at[0] + (tk.axis === 'y' ? 3 : 0)} y2={tk.at[1] + (tk.axis === 'x' ? 3 : 0)} stroke="#475569" strokeWidth={1.2} />
                {tk.label && <text x={tk.label[0]} y={tk.label[1]} fontSize={10} fill="#64748b" textAnchor={tk.axis === 'y' ? 'end' : 'middle'} style={textProps}>{tk.text}</text>}
              </g>
            ))}
          </g>
        )}
        {(fig.polygons ?? []).map((p, i) => (
          <polygon key={`pg${i}`} points={pts(p.points.map((n) => L.P[n]))} fill={FILL[p.tone ?? 'indigo']} stroke="none" />
        ))}
        {(fig.circles ?? []).map((c, i) => {
          const o = L.P[c.center];
          const r = c.radius != null ? Number(c.radius) * L.scale : Math.hypot(L.P[c.through][0] - o[0], L.P[c.through][1] - o[1]);
          return <circle key={`ci${i}`} cx={o[0]} cy={o[1]} r={r} fill="none" stroke={STROKE[c.tone ?? 'slate']} strokeWidth={1.4} strokeDasharray={c.dashed ? '5 4' : undefined} data-geo-circle />;
        })}
        {(fig.arcs ?? []).map((a, i) => {
          const c = STROKE[a.tone ?? 'rose'];
          const common = { fill: 'none', stroke: c, strokeWidth: a.bold ? 2.8 : 2, strokeDasharray: a.dashed ? '5 4' : undefined, strokeLinecap: 'round' };
          if (a.center == null) return <path key={`ar${i}`} d={semicirclePath(L.P[a.from], L.P[a.to], a.sweep ?? 'cw')} {...common} data-geo-arc />;
          const arc = centeredArc(L.P[a.center], L.P[a.from], L.P[a.to], a.sweep ?? 'ccw');
          return (
            <g key={`ar${i}`} data-geo-arc>
              <path d={arc.path} {...common} />
              {a.arrow && <polygon points={pts(arc.arrow)} fill={c} />}
              {a.label && <text x={arc.label[0]} y={arc.label[1]} fontSize={12} fontWeight={600} fill={c} textAnchor="middle" style={textProps}>{a.label}</text>}
            </g>
          );
        })}
        {(fig.lines ?? []).map((l, i) => {
          const [a, b] = L.lineEnds(l);
          const c = STROKE[l.tone ?? 'slate'];
          return (
            <g key={`ln${i}`}>
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={1.6} strokeDasharray={l.dashed ? '5 4' : undefined} />
              {l.arrows ? parallelArrows(L.P[l.through[0]], L.P[l.through[1]], l.arrows).map((ch, j) => (
                <polyline key={j} points={pts(ch)} fill="none" stroke={c} strokeWidth={1.6} />
              )) : null}
              {l.name && <text x={b[0]} y={b[1] - 6} fontSize={13} fill={c} textAnchor="middle" style={textProps}>{l.name}</text>}
            </g>
          );
        })}
        {(fig.rays ?? []).map((r, i) => {
          const a = L.P[r.from]; const b = L.rayEnd(r);
          const c = STROKE[r.tone ?? 'slate'];
          return (
            <g key={`ry${i}`}>
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={1.6} strokeDasharray={r.dashed ? '5 4' : undefined} />
              {r.name && <text x={b[0]} y={b[1] - 6} fontSize={13} fill={c} textAnchor="middle" style={textProps}>{r.name}</text>}
            </g>
          );
        })}
        {(fig.segments ?? []).map((s0, i) => {
          const s = asSegment(s0);
          const a = L.P[s.from]; const b = L.P[s.to];
          const c = STROKE[s.tone ?? 'slate'];
          const lab = s.label != null ? L.segmentLabel(s.from, s.to, s.labelSide, s.label) : null;
          return (
            <g key={`sg${i}`}>
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={s.bold ? 2.6 : 1.8} strokeDasharray={s.dashed ? '5 4' : undefined} />
              {s.ticks ? tickMarks(a, b, s.ticks).map((t, j) => (
                <line key={`t${j}`} x1={t[0][0]} y1={t[0][1]} x2={t[1][0]} y2={t[1][1]} stroke={c} strokeWidth={1.4} />
              )) : null}
              {s.arrows ? parallelArrows(a, b, s.arrows).map((ch, j) => (
                <polyline key={`a${j}`} points={pts(ch)} fill="none" stroke={c} strokeWidth={1.6} />
              )) : null}
              {lab && (
                <text x={lab[0]} y={lab[1]} fontSize={13} fontWeight={600} fill={s.tone ? c : '#0f172a'} textAnchor="middle" style={textProps}>{s.label}</text>
              )}
            </g>
          );
        })}
        {(fig.vectors ?? []).map((v, i) => {
          const a = L.P[v.from]; const b = L.P[v.to];
          const c = STROKE[v.tone ?? 'indigo'];
          const ar = vectorArrow(a, b);
          const lab = v.label != null ? L.segmentLabel(v.from, v.to, v.labelSide, v.label) : null;
          return (
            <g key={`vc${i}`} data-geo-vector>
              <line x1={ar.shaft[0][0]} y1={ar.shaft[0][1]} x2={ar.shaft[1][0]} y2={ar.shaft[1][1]} stroke={c} strokeWidth={2.4} strokeDasharray={v.dashed ? '6 4' : undefined} />
              <polygon points={pts(ar.head)} fill={c} />
              {lab && (
                <g>
                  <text x={lab[0]} y={lab[1]} fontSize={14} fontWeight={700} fontStyle="italic" fill={c} textAnchor="middle" style={textProps}>{v.label}</text>
                  <line x1={lab[0] - 6} y1={lab[1] - 14} x2={lab[0] + 5} y2={lab[1] - 14} stroke={c} strokeWidth={1.2} />
                  <polyline points={`${lab[0] + 2},${lab[1] - 16.5} ${lab[0] + 6},${lab[1] - 14} ${lab[0] + 2},${lab[1] - 11.5}`} fill="none" stroke={c} strokeWidth={1.2} />
                </g>
              )}
            </g>
          );
        })}
        {(fig.rightAngles ?? []).map(([a, v, b], i) => (
          <polyline key={`ra${i}`} points={pts(rightAngleSquare(L.P[a], L.P[v], L.P[b]))} fill="none" stroke="#e11d48" strokeWidth={1.4} />
        ))}
        {(fig.angles ?? []).map((g, i) => {
          const arc = angleArc(L.P[g.from], L.P[g.at], L.P[g.to], g.radius ?? 20);
          const c = STROKE[g.tone ?? 'emerald'];
          return (
            <g key={`an${i}`}>
              <path d={arc.path} fill="none" stroke={c} strokeWidth={1.6} />
              {g.arrow && <polygon points={pts(arc.arrow)} fill={c} />}
              {g.label && <text x={arc.label[0]} y={arc.label[1]} fontSize={12} fill={c} textAnchor="middle" style={textProps}>{g.label}</text>}
            </g>
          );
        })}
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
