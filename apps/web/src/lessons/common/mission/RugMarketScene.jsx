import KidFigure from '../manipulations/primitives/KidFigure';

const W = 480;
const H = 260;
const FLOOR = 214;
const DIAMONDS = [0, 1, 2, 3];

/**
 * LE MARCHÉ DES TAPIS (la synthèse de l'unité 2 `wadiya-idmajiya-judhur`, `mission.scene = 'rug-market'`, 2026-11-12) — une scène MINCE dessinée en
 * code : un tapis rectangulaire posé au sol, DEUX FOIS plus long que large (deux carrés égaux, la jointure à peine marquée), un ruban à mesurer
 * déroulé le long de sa largeur — aucun nombre, aucune lettre (les dimensions sont ce que l'élève cherche). Les élèves sont le personnage partagé
 * `KidFigure` : une fille en hijab (tenue islamique) qui tient le ruban, un garçon qui regarde. Une synthèse n'a rien à gagner (les clés sont à
 * l'élève dès le départ) : la scène est pleine ; `fill` éclaire seulement le tapis.
 */
export default function RugMarketScene({ fill = 1, label, className = '', scene = 'rug-market' }) {
  const f = Math.max(0, Math.min(1, fill));
  // le tapis : 2s × s, au sol, en légère perspective (un parallélogramme)
  const x0 = 60;
  const y0 = 150;
  const s = 78;
  const skew = 22;
  const depth = 48;
  const P = (u, v) => `${x0 + u * 2 * s + v * skew},${y0 + v * depth}`;
  const rug = [P(0, 0), P(1, 0), P(1, 1), P(0, 1)].join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-scene={scene} data-rug-fill={f.toFixed(2)}>
      <rect x="0" y="0" width={W} height={H} fill="#FFFBEB" />
      {/* les arcades du marché */}
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${20 + i * 115} 120 V60 Q${77 + i * 115} 18 ${134 + i * 115} 60 V120`} fill="none" stroke="#FCD34D" strokeWidth="6" />
      ))}
      <rect x="0" y="120" width={W} height={H - 120} fill="#FEF3C7" />
      <line x1="0" x2={W} y1={FLOOR} y2={FLOOR} stroke="#FDE68A" strokeWidth="2" />
      <g opacity={0.6 + 0.4 * f} data-rug>
        <polygon points={rug} fill="#991B1B" stroke="#451A03" strokeWidth="2" />
        {/* la bordure, et la jointure à peine marquée des deux carrés égaux */}
        <polygon points={[P(0.03, 0.12), P(0.97, 0.12), P(0.97, 0.88), P(0.03, 0.88)].join(' ')} fill="none" stroke="#FCD34D" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1={x0 + s + 0.12 * skew} y1={y0 + 0.12 * depth} x2={x0 + s + 0.88 * skew} y2={y0 + 0.88 * depth} stroke="#FDE68A" strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />
        {DIAMONDS.map((i) => {
          const cx = x0 + (0.2 + i * 0.2) * 2 * s + 0.5 * skew;
          const cy = y0 + 0.5 * depth;
          return <path key={i} d={`M${cx} ${cy - 14} L${cx + 12} ${cy} L${cx} ${cy + 14} L${cx - 12} ${cy} Z`} fill={i % 2 ? '#78350F' : '#B91C1C'} stroke="#FDE68A" strokeWidth="1" />;
        })}
      </g>
      {/* le ruban à mesurer le long de la largeur (aucune graduation chiffrée) */}
      <g data-rug-tape>
        <line x1={x0 - 6} y1={y0 + 2} x2={x0 - 6 + skew} y2={y0 + depth + 2} stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
        {[0.2, 0.4, 0.6, 0.8].map((t) => (
          <line key={t} x1={x0 - 9 + t * skew} y1={y0 + 2 + t * depth} x2={x0 - 3 + t * skew} y2={y0 + 2 + t * depth} stroke="#78350F" strokeWidth="1.2" />
        ))}
      </g>
      <KidFigure cx={392} top={FLOOR - 92} foot={FLOOR + 6} hairStyle="hijab" scarf="sky" outfit="violet" mood="happy" />
      <KidFigure cx={444} top={FLOOR - 96} foot={FLOOR + 8} outfit="green" mood="wonder" />
    </svg>
  );
}
