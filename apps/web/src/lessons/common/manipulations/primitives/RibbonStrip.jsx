import { motion, useReducedMotion } from 'framer-motion';

/**
 * UN RUBAN — une longueur dessinée comme un vrai ruban de mercerie, à
 * l'échelle, avec ses bouts crantés.
 *
 * L'atelier de couture de la leçon 6 pose la question du manuel en objets :
 * « deux rubans de 252 cm et 140 cm ; quelle est la plus grande longueur qui
 * mesure exactement les deux ? ». Les FROQUES : on coupe le petit ruban dans
 * le grand, encore et encore, jusqu'à ce qu'il ne reste rien. EUCLIDE : on
 * reporte le petit ruban le long du grand autant de fois qu'il tient ; le
 * bout qui dépasse est le reste. Deux rubans au même `scale` se comparent
 * d'un regard, et une soustraction se VOIT avant tout calcul. LES DIFFÉRENCES
 * sont des coups de ciseaux ; les DIVISIONS, des reports.
 *
 * `segments` découpe le ruban (le morceau égal au petit, la différence ; les
 * copies du diviseur, le reste) ; chaque segment porte sa couleur et son
 * étiquette (DOM, LTR). `ghost` dessine en pointillés la partie pas encore
 * couverte (Euclide : ce qui reste à mesurer). `cut` marque d'une entaille la
 * fin du premier segment — là où passent les ciseaux.
 *
 * Toute animation est une transformation (scaleX), désactivée sous
 * prefers-reduced-motion, et aucun état final n'en dépend.
 */
const TONES = {
  a: { fill: '#38BDF8', edge: '#0369A1', stripe: '#7DD3FC' },
  b: { fill: '#A78BFA', edge: '#5B21B6', stripe: '#C4B5FD' },
  diff: { fill: '#FBBF24', edge: '#B45309', stripe: '#FDE68A' },
  rem: { fill: '#FB923C', edge: '#C2410C', stripe: '#FED7AA' },
  unit: { fill: '#34D399', edge: '#047857', stripe: '#6EE7B7' },
  pgcd: { fill: '#F43F5E', edge: '#9F1239', stripe: '#FDA4AF' },
  ghost: { fill: '#F8FAFC', edge: '#94A3B8', stripe: 'none' },
};

const U = 4;     // px par unité de longueur dans le viewBox
const H = 28;

export default function RibbonStrip({ value, scale, tone = 'a', label, segments, ghost = 0, cut = false, height = 'h-8', className = '', children }) {
  const reduce = useReducedMotion();
  const segs = segments ?? [{ value, tone }];
  const covered = segs.reduce((s, x) => s + x.value, 0);
  const total = Math.max(1, scale ?? covered + ghost);
  const W = total * U;
  let cursor = 0;
  const drawn = segs.map((s, i) => { const start = cursor; cursor += s.value; return { ...s, start, key: i }; });
  const ghostStart = cursor;

  return (
    <div className={`relative w-full ${className}`} dir="ltr" data-ribbon data-value={value ?? covered}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={`block w-full ${height}`} aria-hidden="true" focusable="false">
        <defs>
          <pattern id="sa-ribbon-weave" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M0 6 L6 0" stroke="#FFFFFF" strokeWidth="1" opacity=".35" />
          </pattern>
        </defs>
        {ghost > 0 && (
          <path d={`M ${ghostStart * U} 3 L ${W} 3 L ${W - 4} ${H / 2} L ${W} ${H - 3} L ${ghostStart * U} ${H - 3} Z`}
            fill={TONES.ghost.fill} stroke={TONES.ghost.edge} strokeWidth="1" strokeDasharray="4 3" data-ribbon-ghost />
        )}
        {drawn.map((s, i) => {
          const T = TONES[s.tone] ?? TONES.a;
          const x = s.start * U; const w = s.value * U;
          const first = i === 0; const last = i === drawn.length - 1 && ghost === 0;
          const n = 4;
          const d = `M ${x} 3 L ${x + w} 3 ${last ? `L ${x + w - n} ${H / 2}` : ''} L ${x + w} ${H - 3} L ${x} ${H - 3} ${first ? `L ${x + n} ${H / 2}` : ''} Z`;
          return (
            <motion.g key={s.key} data-ribbon-segment={s.tone}
              initial={reduce ? false : { scaleX: 0.9, opacity: 0.6 }} animate={{ scaleX: 1, opacity: 1 }}
              transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 26 }}
              style={{ originX: `${x + w / 2}px`, transformBox: 'fill-box' }}>
              <path d={d} fill={T.fill} stroke={T.edge} strokeWidth="1.2" strokeLinejoin="round" />
              <path d={d} fill="url(#sa-ribbon-weave)" />
              {/* la couture : deux lignes pointillées le long du ruban */}
              <line x1={x + 3} y1="7.5" x2={x + w - 3} y2="7.5" stroke={T.stripe} strokeWidth="0.8" strokeDasharray="2 2" />
              <line x1={x + 3} y1={H - 7.5} x2={x + w - 3} y2={H - 7.5} stroke={T.stripe} strokeWidth="0.8" strokeDasharray="2 2" />
            </motion.g>
          );
        })}
        {cut && drawn.length > 1 && (
          // L'entaille des ciseaux, à la fin du premier morceau.
          <g data-ribbon-cut transform={`translate(${drawn[0].value * U} 0)`}>
            <line x1="0" y1="0" x2="0" y2={H} stroke="#0F172A" strokeWidth="1.2" strokeDasharray="3 2" />
            <circle cx="-3" cy="-1" r="2.4" fill="none" stroke="#0F172A" strokeWidth="1" />
            <circle cx="3" cy="-1" r="2.4" fill="none" stroke="#0F172A" strokeWidth="1" />
          </g>
        )}
      </svg>
      {(drawn.some((s) => s.label) || (ghost > 0 && label)) && (
        <div className="relative mt-0.5 h-4 w-full">
          {drawn.filter((s) => s.label).map((s) => (
            // Étroit sur un téléphone → l'étiquette se cache sous `sm` plutôt
            // que de chevaucher la voisine (§17bis).
            <span key={s.key} className={`absolute top-0 truncate text-center font-mono text-[11px] font-bold text-slate-700 ${s.value / total < 0.2 ? 'block' : ''}`}
              style={{ left: `${(s.start / total) * 100}%`, width: `${(s.value / total) * 100}%` }}>
              {s.label}
            </span>
          ))}
        </div>
      )}
      {label && <div className="mt-0.5 text-center font-mono text-xs font-bold text-slate-800">{label}</div>}
      {children}
    </div>
  );
}
