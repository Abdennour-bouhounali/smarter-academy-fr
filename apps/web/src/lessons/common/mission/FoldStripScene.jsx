import KidFigure from '../manipulations/primitives/KidFigure';

const GROUND = 232;
const TABLE = { x: 120, y: 176, w: 240, h: 14 };
/** La bande de papier pliée en V sur son support : le pli au milieu, deux moitiés qui montent (x et −x qui donnent le même carré). */
const FOLD = { x: 240, y: 164 };
const ARM = { dx: 92, dy: 104 };
const SEGMENTS = 6;
const FLAGS = ['#F59E0B', '#7C3AED', '#0EA5E9', '#10B981', '#E11D48', '#F59E0B', '#7C3AED', '#0EA5E9', '#10B981'];

/**
 * L'atelier « المستقيم الذي ينطوي » d'une foire scientifique à l'école (leçon muadalat-x-murabba, rollout 2026-11-10 ; conseil du
 * 2026-11-10) — dessiné en code (CLAUDE.md : aucune image générée dans les leçons). Sur une table, une bande de papier graduée PLIÉE en V :
 * ses deux moitiés se colorient segment après segment, symétriquement, à mesure que les outils sont gagnés ; quand tout est gagné, une rosette
 * se pose sur le pli. Deux élèves dessinés par `KidFigure` — une fille en hijab (tenue islamique) et un garçon — tiennent chacun un bout.
 * `fill` ∈ [0, 1]. Aucun nombre n'est dessiné (ni sur le pli, ni sur la bande) ; le texte arabe reste dans le DOM.
 */
export default function FoldStripScene({ fill = 0, label, className = '' }) {
  const f = Math.max(0, Math.min(1, fill));
  const lit = Math.round(f * SEGMENTS);
  const done = f >= 1;
  const end = (side) => ({ x: FOLD.x + side * ARM.dx, y: FOLD.y - ARM.dy });
  const seg = (side, i) => {
    const a = i / SEGMENTS; const b = (i + 1) / SEGMENTS;
    const p = (t) => ({ x: FOLD.x + side * ARM.dx * t, y: FOLD.y - ARM.dy * t });
    return { p: p(a), q: p(b) };
  };
  return (
    <svg viewBox="0 0 480 260" className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })} data-fold-fill={f.toFixed(2)} data-scene="fold-strip">
      <rect x="0" y="0" width="480" height={GROUND} fill="#EEF2FF" />
      {/* les fanions de la foire */}
      <path d="M 0 18 Q 240 46 480 18" fill="none" stroke="#64748B" strokeWidth="1.5" />
      {FLAGS.map((c, i) => {
        const x = 24 + i * 54; const y = 18 + 28 * (1 - ((x - 240) / 240) ** 2);
        return <polygon key={i} points={`${x - 10},${y - 2} ${x + 10},${y - 2} ${x},${y + 16}`} fill={c} />;
      })}
      <rect x="0" y={GROUND} width="480" height={260 - GROUND} fill="#CBD5E1" />
      {/* la table et sa nappe */}
      <rect x={TABLE.x} y={TABLE.y} width={TABLE.w} height={TABLE.h} rx="3" fill="#6D28D9" />
      <path d={`M ${TABLE.x} ${TABLE.y + TABLE.h} L ${TABLE.x + 12} ${GROUND} M ${TABLE.x + TABLE.w} ${TABLE.y + TABLE.h} L ${TABLE.x + TABLE.w - 12} ${GROUND}`} stroke="#4C1D95" strokeWidth="6" />
      {/* le support du pli */}
      <rect x={FOLD.x - 18} y={FOLD.y} width="36" height={TABLE.y - FOLD.y} fill="#94A3B8" rx="2" />
      {/* la bande pliée : deux moitiés, chacune graduée (des traits, aucun nombre) */}
      {[-1, 1].map((side) => {
        const e = end(side);
        return (
          <g key={side} data-fold-arm={side}>
            <line x1={FOLD.x} y1={FOLD.y} x2={e.x} y2={e.y} stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round" />
            {Array.from({ length: lit }, (_, i) => { const { p, q } = seg(side, i); return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={i % 2 ? '#A78BFA' : '#7C3AED'} strokeWidth="12" data-fold-lit />; })}
            {Array.from({ length: SEGMENTS + 1 }, (_, i) => {
              const { p } = seg(side, i);
              // une graduation EN TRAVERS de la bande (perpendiculaire au bras, incliné d'environ 48°)
              return <line key={`t${i}`} x1={p.x - 7} y1={p.y} x2={p.x + 7} y2={p.y} stroke="#334155" strokeWidth="1.5" transform={`rotate(${side * -48 + 90} ${p.x} ${p.y})`} />;
            })}
          </g>
        );
      })}
      {/* le pli : un trait en pointillés ; la rosette quand tout est gagné */}
      <line x1={FOLD.x - 10} y1={FOLD.y + 2} x2={FOLD.x + 10} y2={FOLD.y + 2} stroke="#475569" strokeWidth="2" strokeDasharray="3 3" />
      {done && (
        <g data-fold-rosette>
          <circle cx={FOLD.x} cy={FOLD.y - 14} r="13" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          <circle cx={FOLD.x} cy={FOLD.y - 14} r="6" fill="#FEF3C7" />
          <path d={`M ${FOLD.x - 6} ${FOLD.y - 3} L ${FOLD.x - 10} ${FOLD.y + 10} M ${FOLD.x + 6} ${FOLD.y - 3} L ${FOLD.x + 10} ${FOLD.y + 10}`} stroke="#B45309" strokeWidth="4" />
        </g>
      )}
      {/* les deux élèves tiennent chacun un bout de la bande */}
      <KidFigure cx={96} top={92} foot={GROUND - 4} hairStyle="hijab" scarf="rose" outfit="teal" mood={done ? 'proud' : 'wonder'} />
      <KidFigure cx={384} top={96} foot={GROUND - 4} outfit="blue" mood={done ? 'proud' : 'happy'} />
    </svg>
  );
}
