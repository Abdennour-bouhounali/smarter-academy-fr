import KidFigure from '../manipulations/primitives/KidFigure';

/**
 * LA SCÈNE « جدار القامات » (unité 4 leçon 4 `tarrid-mushkila`, `mission.scene = 'family-heights'` ; conseil du 2026-11-11, verdict L4.8).
 * Un mur de salon et sa toise en bois, GRADUÉE SANS AUCUN NOMBRE ; un père et trois enfants se tiennent devant, tous dessinés par le personnage
 * partagé `KidFigure` (la fille porte le hijab et la tunique ; le père, plus grand, la tunique aussi). `fill` (0 → 1) = les outils gagnés / total :
 * à chaque outil un trait de crayon de plus monte sur la toise pour chaque enfant et chacun se tient un peu plus haut ; à 1 un ruban relie les traits.
 * Aucun nombre, aucun « = », aucun gâteau. Dessiné en code, `aria-hidden` sans `label`.
 */
const KIDS = [
  { cx: 200, base: 56, outfit: 'green', hair: 'black', hairStyle: 'short' },
  { cx: 258, base: 48, outfit: 'pink', hair: 'brown', hairStyle: 'hijab', tunic: true },
  { cx: 316, base: 38, outfit: 'orange', hair: 'chestnut', hairStyle: 'short' },
];

export default function FamilyHeightsScene({ fill = 0, label, className = '', scene = 'family-heights' }) {
  const f = Math.max(0, Math.min(1, fill));
  const steps = Math.round(f * 4);
  const FLOOR = 232;
  const tall = (kid) => kid.base + 9 * steps;   // chaque outil : un cran de plus pour tous
  const marks = (kid, j) => FLOOR - (kid.base + 9 * j + 2) * 1.55;
  return (
    <svg viewBox="0 0 480 260" className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-scene={scene} data-fill={fill}>
      <rect x="0" y="0" width="480" height="260" fill="#F5EBDD" />
      <rect x="0" y="0" width="480" height="30" fill="#E7D3B5" />
      <rect x="0" y={FLOOR} width="480" height="28" fill="#C99B63" />
      <line x1="0" x2="480" y1={FLOOR} y2={FLOOR} stroke="#8A5F2C" strokeWidth="2" />
      {/* la toise : un montant de bois gradué, sans chiffre */}
      <rect x="92" y="38" width="30" height={FLOOR - 38} rx="4" fill="#D6A15F" stroke="#92602A" strokeWidth="2" />
      {Array.from({ length: 19 }, (_, i) => (
        <line key={i} x1="92" x2={i % 3 === 0 ? 112 : 104} y1={FLOOR - 10 - i * 10} y2={FLOOR - 10 - i * 10} stroke="#6B4423" strokeWidth="1.6" />
      ))}
      {/* les traits de crayon : un de plus à chaque outil, pour chaque enfant */}
      {KIDS.map((kid, ki) => Array.from({ length: steps + 1 }, (_, j) => (
        <line key={`${ki}-${j}`} x1={126 + ki * 8} x2={146 + ki * 8} y1={marks(kid, j)} y2={marks(kid, j)} stroke={['#15803D', '#BE185D', '#C2410C'][ki]} strokeWidth="3" strokeLinecap="round" />
      )))}
      {f >= 1 && <polyline points={KIDS.map((kid, ki) => `${126 + ki * 8},${marks(kid, steps)}`).join(' ')} fill="none" stroke="#B45309" strokeWidth="2" strokeDasharray="4 3" />}
      {/* le père : la tunique, le plus grand ; les enfants : leur taille monte avec les outils */}
      <KidFigure cx={405} top={FLOOR - 178} foot={FLOOR} outfit="teal" hair="black" tunic mood="proud" data-family="father" />
      {KIDS.map((kid, i) => (
        <KidFigure key={i} cx={kid.cx} top={FLOOR - tall(kid) * 1.55} foot={FLOOR} outfit={kid.outfit} hair={kid.hair} hairStyle={kid.hairStyle} tunic={kid.tunic}
          scarf="rose" mood={f >= 1 ? 'proud' : 'happy'} data-family={`kid${i}`} />
      ))}
    </svg>
  );
}
