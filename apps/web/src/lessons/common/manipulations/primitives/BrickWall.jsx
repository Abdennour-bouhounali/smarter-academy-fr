import { brickLayout } from './brickLayout';

/**
 * UN MUR EN BRIQUES DE LONGUEUR n — la grandeur dessinée en briques, pas en
 * barre.
 *
 * Dans la leçon 3, « n divise a » se VOIT : le mur de a est fait de briques
 * entières de n, sans morceau. Quand on accole le mur de b (la somme), qu'on
 * enlève le mur de b (la différence) ou qu'on mesure a avec des panneaux de
 * b (le reste), le résultat est encore un mur de briques entières — c'est la
 * propriété, vue avant d'être écrite. Une barre unie ne montre rien de cela ;
 * les joints de mortier, si.
 *
 * `segments` découpe le mur en parties de couleurs différentes (a puis b pour
 * la somme, la différence puis la partie enlevée en fantôme, les panneaux de
 * b puis le reste). Chaque segment est bâti en briques de `unit` à partir de
 * son début ; un segment qui ne tombe pas juste montre son morceau en ambre.
 * `scale` est la longueur qui occupe toute la largeur : deux murs au même
 * `scale` se comparent d'un regard.
 *
 * Les étiquettes sont en DOM (jamais en <text> SVG) : lisibles, LTR, et
 * jamais déformées par l'échelle.
 */
const TONES = {
  a: { fill: '#38BDF8', edge: '#0369A1', light: '#BAE6FD' },
  b: { fill: '#A78BFA', edge: '#5B21B6', light: '#DDD6FE' },
  sum: { fill: '#34D399', edge: '#047857', light: '#A7F3D0' },
  diff: { fill: '#FBBF24', edge: '#B45309', light: '#FDE68A' },
  rem: { fill: '#FB923C', edge: '#C2410C', light: '#FED7AA' },
  panel: { fill: '#CBD5E1', edge: '#475569', light: '#F1F5F9' },
  ghost: { fill: 'none', edge: '#94A3B8', light: 'none' },
};

const U = 10;      // px par unité dans le viewBox
const H = 30;      // hauteur du mur (viewBox)

export default function BrickWall({ value, unit, scale, tone = 'a', segments, label, className = '', height = 'h-9', showJoints = true }) {
  const segs = segments ?? [{ value, tone }];
  const total = Math.max(1, scale ?? segs.reduce((s, x) => s + x.value, 0));
  const W = total * U;
  let cursor = 0;
  const drawn = segs.map((s, i) => {
    const start = cursor;
    cursor += s.value;
    return { ...s, start, layout: brickLayout({ value: s.value, unit }), key: i };
  });

  return (
    <div className={`relative w-full ${className}`} dir="ltr" data-brick-wall data-value={value ?? drawn.reduce((s, x) => s + x.value, 0)}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={`block w-full ${height}`} aria-hidden="true" focusable="false">
        {/* le sol : une ligne, pour que le mur tienne debout */}
        <rect x="0" y={H - 2} width={W} height="2" fill="#E2E8F0" />
        {drawn.map((s) => {
          const T = TONES[s.tone] ?? TONES.a;
          const ghost = s.tone === 'ghost';
          return (
            <g key={s.key} transform={`translate(${s.start * U} 0)`} data-wall-segment={s.tone}>
              {s.layout.bricks.map(([x0, x1], i) => (
                <g key={i}>
                  <rect x={x0 * U + 0.6} y="3" width={(x1 - x0) * U - 1.2} height={H - 6} rx="1.4"
                    fill={T.fill} stroke={T.edge} strokeWidth={ghost ? 1 : 0.9} strokeDasharray={ghost ? '3 2' : undefined} />
                  {!ghost && showJoints && (
                    // Le joint horizontal : ce qui fait lire « brique » et non « case ».
                    <line x1={x0 * U + 1.5} y1={H / 2} x2={x1 * U - 1.5} y2={H / 2} stroke={T.light} strokeWidth="1" opacity=".9" />
                  )}
                </g>
              ))}
              {s.layout.partialSpan && (
                <rect x={s.layout.partialSpan[0] * U + 0.6} y="3" width={(s.layout.partialSpan[1] - s.layout.partialSpan[0]) * U - 1.2} height={H - 6} rx="1.4"
                  fill="#FDE68A" stroke="#B45309" strokeWidth="1" strokeDasharray="2 1.5" data-wall-partial />
              )}
            </g>
          );
        })}
      </svg>
      {/* les étiquettes des segments, en DOM, centrées sous leur partie du mur */}
      {drawn.some((s) => s.label) && (
        <div className="relative mt-0.5 h-4 w-full">
          {drawn.filter((s) => s.label).map((s) => (
            // Un segment étroit n'a pas la place de son étiquette sur un
            // téléphone : elle se cache sous `sm` plutôt que de chevaucher
            // la voisine (INTERACTION_PEDAGOGY §17bis — aucun état reachable
            // ne superpose deux étiquettes).
            <span key={s.key} className={`absolute top-0 truncate text-center font-mono text-[11px] font-bold ${s.value / total < 0.14 ? 'block' : ''} ${s.tone === 'ghost' ? 'text-slate-400 line-through' : 'text-slate-700'}`}
              style={{ left: `${(s.start / total) * 100}%`, width: `${(s.value / total) * 100}%` }}>
              {s.label}
            </span>
          ))}
        </div>
      )}
      {label && <div className="mt-0.5 text-center font-mono text-xs font-bold text-slate-800">{label}</div>}
    </div>
  );
}
