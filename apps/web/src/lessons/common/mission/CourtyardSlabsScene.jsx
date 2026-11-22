import KidFigure from '../manipulations/primitives/KidFigure';

const GROUND = 232;
/** La cour carrée vue en perspective douce : un losange aplati, pavé de dalles carrées. */
const YARD = { cx: 240, cy: 168, w: 300, h: 92 };

/**
 * La cour de l'école pavée de dalles carrées (leçon amaliyat-judhur, rollout 2026-11-10 ; conseil du 2026-11-10) — dessinée en code
 * (CLAUDE.md : aucune image générée dans les leçons). Une cour CARRÉE, vue de biais : ses dalles carrées identiques se posent rangée après
 * rangée à mesure que les outils sont gagnés ; quand tout est gagné, un drapeau de l'école se lève au coin. Deux élèves dessinés par
 * `KidFigure` — une fille en hijab (tenue islamique) et un garçon — posent les dalles.
 * `fill` ∈ [0, 1] ; `slabs` : le nombre de dalles par côté (5 par défaut — la leçon 5 peut réutiliser la scène avec des dalles plus GRANDES,
 * `slabs={3}`). Aucun nombre n'est dessiné (ni nombre de dalles, ni aire) ; le texte arabe reste dans le DOM.
 */
export default function CourtyardSlabsScene({ fill = 0, label, className = '', slabs = 5, scene = 'courtyard-slabs' }) {
  const f = Math.max(0, Math.min(1, fill));
  const n = Math.max(2, Math.min(8, Math.round(slabs)));
  const total = n * n;
  const laid = Math.round(f * total);
  const done = f >= 1;
  // un point (u, v) ∈ [0, 1]² de la cour → l'écran (losange : u vers la droite-bas, v vers la gauche-bas)
  const P = (u, v) => ({ x: YARD.cx + (u - v) * (YARD.w / 2), y: YARD.cy - YARD.h / 2 + (u + v) * (YARD.h / 2) });
  const quad = (u0, v0, u1, v1) => [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)].map((p) => `${p.x},${p.y}`).join(' ');
  const flagAt = P(0, 0);
  return (
    <svg viewBox="0 0 480 260" className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })} data-courtyard-fill={f.toFixed(2)} data-scene={scene}>
      <rect x="0" y="0" width="480" height={GROUND} fill="#E0F2FE" />
      {/* le mur de l'école et ses fenêtres */}
      <rect x="40" y="34" width="400" height="70" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={68 + i * 76} y="50" width="40" height="34" rx="4" fill="#BAE6FD" stroke="#0369A1" strokeWidth="2" />)}
      <rect x="0" y={GROUND} width="480" height={260 - GROUND} fill="#D6D3D1" />
      {/* la cour : sable d'abord, puis les dalles posées */}
      <polygon points={quad(0, 0, 1, 1)} fill="#FEF3C7" stroke="#A16207" strokeWidth="2" />
      {Array.from({ length: laid }, (_, i) => {
        const r = Math.floor(i / n); const c = i % n;
        const d = 0.06 / n;
        return <polygon key={i} points={quad(c / n + d, r / n + d, (c + 1) / n - d, (r + 1) / n - d)} fill={(r + c) % 2 ? '#7DD3FC' : '#38BDF8'} stroke="#0369A1" strokeWidth="1" data-courtyard-slab />;
      })}
      {/* les joints de la grille (des traits, aucun nombre) */}
      {Array.from({ length: n - 1 }, (_, i) => {
        const a = P((i + 1) / n, 0); const b = P((i + 1) / n, 1); const c = P(0, (i + 1) / n); const d = P(1, (i + 1) / n);
        return <g key={i}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#A16207" strokeWidth="0.8" strokeDasharray="3 3" /><line x1={c.x} y1={c.y} x2={d.x} y2={d.y} stroke="#A16207" strokeWidth="0.8" strokeDasharray="3 3" /></g>;
      })}
      {/* la dalle qu'on porte, tant que la cour n'est pas finie */}
      {!done && <rect x="86" y="150" width="34" height="22" rx="3" fill="#38BDF8" stroke="#0369A1" strokeWidth="2" transform="rotate(-8 103 161)" data-courtyard-carried />}
      {done && (
        <g data-courtyard-flag>
          <line x1={flagAt.x} y1={flagAt.y} x2={flagAt.x} y2={flagAt.y - 62} stroke="#475569" strokeWidth="3" />
          <path d={`M ${flagAt.x} ${flagAt.y - 62} L ${flagAt.x + 34} ${flagAt.y - 52} L ${flagAt.x} ${flagAt.y - 42} Z`} fill="#10B981" stroke="#047857" strokeWidth="1.5" />
        </g>
      )}
      <KidFigure cx={70} top={104} foot={GROUND - 4} hairStyle="hijab" scarf="rose" outfit="teal" mood={done ? 'proud' : 'happy'} />
      <KidFigure cx={410} top={108} foot={GROUND - 4} outfit="blue" mood={done ? 'proud' : 'wonder'} />
    </svg>
  );
}
