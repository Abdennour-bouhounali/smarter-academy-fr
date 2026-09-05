import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { placeLabels, axisObstacles } from './labelLayout';
import { railEndpoints, isZeroVec, fr } from './colinUtils';

/**
 * VectorPlane — le repère de la leçon : des points, des vecteurs (flèches),
 * des rails (droites supports) et un parallélogramme, tous DÉRIVÉS de l'état
 * du module, dessinés sur le CoordPlane partagé.
 *
 * SÉCURITÉ DE MISE EN PAGE (INTERACTION_PEDAGOGY §17bis) :
 *  - Aucune étiquette de VECTEUR dans le SVG : deux vecteurs colinéaires se
 *    superposent, leurs étiquettes le feraient aussi. Les noms et coordonnées
 *    vivent dans une légende DOM sous le repère (`legend`).
 *  - Les noms de POINTS sont placés par `placeLabels` : ancre + candidates,
 *    ramenés dans le cadre, éloignés des autres points, des autres noms et des
 *    segments à éviter — testé sur toute la grille, pas sur l'état par défaut.
 *  - Les têtes de flèches sont dessinées ici (polygone), à la couleur de la
 *    flèche : le marqueur partagé de CoordPlane est monochrome.
 *  - Le rail est coupé au cadre par `railEndpoints` : il ne sort jamais.
 *
 * Tout ce qui est décoratif est peint dans l'overlay de CoordPlane, donc sous
 * `pointerEvents: 'none'` : la zone tactile unique reste au-dessus.
 */
const TONES = {
  violet: '#7c3aed', emerald: '#059669', rose: '#e11d48', amber: '#d97706',
  sky: '#0284c7', slate: '#64748b', indigo: '#4f46e5',
};
const tone = (t) => TONES[t] ?? t ?? TONES.violet;

export default function VectorPlane({
  range,
  points = [],           // [{ id, name?, x, y, color?, r? }]
  vectors = [],          // [{ id, from, to, color?, width?, dashed? }]
  rails = [],            // [{ id, through, dir, color? }]
  polygons = [],         // passés tels quels à CoordPlane
  avoidSegments = true,  // les noms évitent les vecteurs dessinés
  draggableId = null,
  onPointChange,
  step = 1,
  frozen = false,
  disabled = false,
  ariaLabel,
  legend = null,         // [{ id, label, value, color }] — DOM, sous le repère
  unit,
}) {
  const overlay = (toSvg, geo) => {
    const svgSegs = vectors.map((v) => ({ from: toSvg(v.from.x, v.from.y), to: toSvg(v.to.x, v.to.y) }));
    const anchors = points.filter((p) => p.name).map((p) => ({ id: p.id, name: p.name, r: p.id === draggableId ? 8 : (p.r ?? 6), ...toSvg(p.x, p.y) }));
    const labels = placeLabels(anchors, geo, { segments: avoidSegments ? svgSegs : [], obstacles: axisObstacles(geo) });
    return (
      <g>
        {rails.map((r) => {
          const ends = railEndpoints(r.through, r.dir, range);
          if (!ends) return null;
          const a = toSvg(ends.from.x, ends.from.y); const b = toSvg(ends.to.x, ends.to.y);
          return <line key={r.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={tone(r.color)} strokeWidth={r.width ?? 2} strokeDasharray="7 6" opacity={r.opacity ?? 0.55} />;
        })}
        {vectors.map((v, i) => {
          const { from, to } = svgSegs[i];
          const c = tone(v.color);
          const d = { x: to.x - from.x, y: to.y - from.y };
          const len = Math.hypot(d.x, d.y);
          if (len < 1e-6) {
            // Le vecteur nul : un point cerclé, pas une flèche.
            return <circle key={v.id} cx={from.x} cy={from.y} r="5" fill="none" stroke={c} strokeWidth="2.5" />;
          }
          const ux = d.x / len; const uy = d.y / len;
          const head = Math.min(11, len * 0.6);
          const base = { x: to.x - head * ux, y: to.y - head * uy };
          const half = head * 0.45;
          const p1 = { x: base.x - half * uy, y: base.y + half * ux };
          const p2 = { x: base.x + half * uy, y: base.y - half * ux };
          return (
            <g key={v.id} opacity={v.opacity ?? 1}>
              <line x1={from.x} y1={from.y} x2={base.x + ux} y2={base.y + uy} stroke={c} strokeWidth={v.width ?? 3.5} strokeDasharray={v.dashed ? '6 5' : undefined} strokeLinecap="round" />
              <polygon points={`${to.x},${to.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`} fill={c} />
            </g>
          );
        })}
        {labels.map((l) => (
          <text key={l.id} x={l.x} y={l.y} textAnchor={l.anchor} fontSize="14" fontWeight="700" className="font-space" fill="#0f172a">{l.name}</text>
        ))}
      </g>
    );
  };

  return (
    <div className="space-y-2">
      <CoordPlane
        range={range}
        unit={unit}
        step={step}
        points={points.map((p) => ({ id: p.id, x: p.x, y: p.y, color: p.color ? tone(p.color) : undefined }))}
        draggableId={frozen || disabled ? null : draggableId}
        onPointChange={onPointChange}
        polygons={polygons}
        overlay={overlay}
        caption={false}
        frozen={frozen}
        disabled={disabled}
        ariaLabel={ariaLabel}
      />
      {legend && (
        <div className="flex flex-wrap justify-center gap-2" aria-live="polite">
          {legend.map((it) => (
            <span key={it.id} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-sm font-mono font-bold tabular-nums text-slate-800">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: tone(it.color) }} aria-hidden="true" />
              <span>{it.label}</span>
              {it.value !== undefined && <span className="text-slate-600 font-semibold">{it.value}</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Une pastille voyant : couleur ET texte (la couleur n'est jamais seule). */
export function Lamp({ on, label, onText = 'oui', offText = 'non', neutral = false, tone: t = 'emerald' }) {
  const T = { emerald: 'border-emerald-300 bg-emerald-50 text-emerald-800', amber: 'border-amber-300 bg-amber-50 text-amber-800' };
  return (
    <div className={`flex-1 min-w-[100px] rounded-xl border-2 p-2 text-center ${neutral ? 'border-slate-200 bg-slate-50 text-slate-500' : on ? T[t] : 'border-slate-200 bg-slate-50 text-slate-600'}`} role="status">
      <p className="text-[11px] font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-sm font-extrabold">{neutral ? '—' : on ? onText : offText}</p>
    </div>
  );
}

/** Un réglage de composante : « x_v » avec − / + (chemin tactile du glisser). */
export function ComponentStepper({ label, value, onChange, min, max, disabled = false, tone: t = 'indigo' }) {
  const T = { indigo: 'bg-indigo-600', emerald: 'bg-emerald-600', violet: 'bg-violet-600', amber: 'bg-amber-600' };
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-bold text-slate-700 font-mono">{label}</span>
      <button type="button" disabled={disabled || value <= min} onClick={() => onChange(value - 1)} aria-label={`Diminuer ${label}`} className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold focus-visible:ring-2 focus-visible:ring-blue-500">−</button>
      <span className={`min-w-[2.5rem] text-center px-2 py-1.5 rounded-lg text-white font-mono font-bold tabular-nums ${T[t] ?? T.indigo}`}>{fr(value)}</span>
      <button type="button" disabled={disabled || value >= max} onClick={() => onChange(value + 1)} aria-label={`Augmenter ${label}`} className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold focus-visible:ring-2 focus-visible:ring-blue-500">+</button>
    </div>
  );
}
