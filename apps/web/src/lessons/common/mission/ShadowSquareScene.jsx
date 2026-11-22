import KidFigure from '../manipulations/primitives/KidFigure';
import { SceneBackdrop, Sun, PlainTower, SunRay, GroundShadow } from './thalesSceneKit';

const W = 480;
const H = 260;
const GROUND = 206;

/**
 * LA PLACE DU QUARTIER À L'HEURE DE L'OMBRE (la synthèse de l'unité 9 `wadiya-idmajiya-talis`, 2026-11-10 ; décisions S) — dessinée en code sur
 * les primitives de l'unité (`thalesSceneKit.jsx`). Une tour carrée et SIMPLE (aucun symbole religieux), une fille en hijab (tenue islamique)
 * déroule un mètre ruban au sol, un garçon tient une perche verticale plantée où son ombre finit avec celle de la tour ; UN rayon de soleil
 * passe par les deux sommets. Les personnes sont des `KidFigure`. Aucun nombre, aucune lettre. Une synthèse n'a rien à gagner (les clés sont
 * à l'élève dès le départ) : la scène est pleine dès le premier écran ; `fill` éclaire seulement le rayon.
 */
export default function ShadowSquareScene({ fill = 1, label, className = '', scene = 'shadow-square' }) {
  const f = Math.max(0, Math.min(1, fill));
  // la tour au pied A, haute de h ; la perche plus loin, plus courte, ses deux ombres finissent au même point O (Thalès : alignés)
  const A = { x: 132, y: GROUND };
  const towerH = 150;
  const M = { x: A.x, y: GROUND - towerH };
  const O = { x: 420, y: GROUND };
  const t = 0.78;                                             // la perche à 78 % du chemin de A à O : son sommet est SUR le rayon MO
  const B = { x: A.x + (O.x - A.x) * t, y: GROUND };
  const E = { x: B.x, y: GROUND - towerH * (1 - t) };
  const sun = { x: A.x - 70, y: M.y - 28 };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-scene={scene} data-shadow-fill={f.toFixed(2)}>
      <SceneBackdrop width={W} height={H} ground={GROUND} sky="#E0F2FE" soil="#E7E5E4" />
      {/* les maisons du quartier au loin */}
      <g opacity="0.5">
        {[[214, 44, 40], [266, 52, 28], [330, 40, 46], [380, 56, 32]].map(([x, w, h]) => <rect key={x} x={x} y={GROUND - h} width={w} height={h} fill="#CBD5E1" />)}
      </g>
      <Sun x={Math.max(26, sun.x)} y={Math.max(26, sun.y)} />
      <GroundShadow x1={A.x} x2={O.x} y={GROUND} />
      <GroundShadow x1={B.x} x2={O.x} y={GROUND + 6} />
      <PlainTower x={A.x} foot={GROUND} h={towerH} />
      <g opacity={0.45 + 0.55 * f}><SunRay from={{ x: Math.max(26, sun.x) + 12, y: Math.max(26, sun.y) + 8 }} to={O} /></g>
      {/* la perche verticale, rayée */}
      <g data-shadow-pole>
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={i} x={B.x - 2.5} y={E.y + (i * (GROUND - E.y)) / 5} width="5" height={(GROUND - E.y) / 5} fill={i % 2 ? '#F8FAFC' : '#DC2626'} stroke="#7F1D1D" strokeWidth="0.6" />
        ))}
      </g>
      <circle cx={O.x} cy={O.y} r="5" fill="#F59E0B" stroke="#92400E" strokeWidth="1.5" data-shadow-meet-point />
      {/* le mètre ruban au sol, déroulé par la fille */}
      <g data-tape>
        <line x1={A.x + 6} y1={GROUND + 14} x2={262} y2={GROUND + 14} stroke="#EAB308" strokeWidth="4" />
        <rect x={258} y={GROUND + 7} width="14" height="14" rx="3" fill="#CA8A04" />
      </g>
      <KidFigure cx={284} top={GROUND - 88} foot={GROUND + 6} hairStyle="hijab" scarf="sand" outfit="green" mood="wonder" />
      <KidFigure cx={B.x + 22} top={GROUND - 90} foot={GROUND + 8} outfit="blue" mood="happy" />
    </svg>
  );
}
