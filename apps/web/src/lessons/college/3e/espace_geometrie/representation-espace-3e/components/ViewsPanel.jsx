import React from 'react';
import { projectOrtho } from './espaceUtils';

/**
 * ViewsPanel — les trois vues du dessin technique.
 *
 * Chaque vue est une PROJECTION calculée (`projectOrtho`), jamais un dessin
 * séparé : deux vues ne peuvent donc pas se contredire, et changer le solide
 * met les trois à jour ensemble.
 *
 * Les arêtes sont toutes tracées : une projection orthogonale écrase le
 * solide, et c'est justement ce qui rend deux solides différents parfois
 * identiques dans une vue — le point que la leçon veut faire remarquer.
 */
const SIZE = 110;
const PAD = 14;

function ViewSvg({ solid, view, label, highlight = false }) {
  const pts = solid.vertices.map((p) => projectOrtho(p, view));
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const scale = Math.min((SIZE - 2 * PAD) / w, (SIZE - 2 * PAD) / h);
  const ox = (SIZE - w * scale) / 2;
  const oy = (SIZE - h * scale) / 2;
  const T = (p) => ({ x: ox + (p.x - minX) * scale, y: oy + (p.y - minY) * scale });

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-slate-600 text-center">{label}</p>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={`w-full max-w-[130px] mx-auto bg-white rounded-lg border-2 ${
          highlight ? 'border-violet-400' : 'border-slate-200'
        }`}
        role="img"
        aria-label={`Vue ${label} du solide`}>
        <g style={{ pointerEvents: 'none' }}>
          {solid.edges.map(([i, j]) => {
            const a = T(pts[i]);
            const b = T(pts[j]);
            return (
              <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export default function ViewsPanel({ solid, views = ['face', 'dessus', 'cote'], highlight = null }) {
  const LABELS = { face: 'de face', dessus: 'de dessus', cote: 'de côté' };
  return (
    <div className="grid grid-cols-3 gap-2">
      {views.map((v) => (
        <ViewSvg key={v} solid={solid} view={v} label={LABELS[v]} highlight={highlight === v} />
      ))}
    </div>
  );
}
