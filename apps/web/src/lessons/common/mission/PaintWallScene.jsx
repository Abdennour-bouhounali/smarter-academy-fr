import KidFigure from '../manipulations/primitives/KidFigure';
import { SceneBackdrop, XTrestle, PaintRoller, PaintBucket } from './thalesSceneKit';

const W = 480;
const H = 260;
const GROUND = 232;
const WALL = { x: 18, y: 54, w: 444, h: GROUND - 54 };
const STRIPES = 8;
const PAINT = ['#0EA5E9', '#22C55E'];

/**
 * LE MUR DU STADE DU QUARTIER, repeint par des bénévoles (leçon `aksiya-talis`, rollout 2026-11-10 ; conseil du 2026-11-10, L2.8) — dessiné en
 * code (CLAUDE.md : aucune image générée dans les leçons), sur les primitives communes de l'unité 9 (`thalesSceneKit.jsx`). Le mur se PEINT
 * bande après bande à mesure que les outils sont gagnés (`fill` ∈ [0, 1]) ; devant lui un tréteau en X porte la planche et son niveau à bulle —
 * penchée tant que la mission n'est pas finie, de niveau quand tout est gagné. Deux élèves dessinés par `KidFigure` : une fille en hijab (tenue
 * islamique) tient le rouleau, un garçon regarde le niveau. Aucun nombre n'est dessiné (ni trous, ni longueurs) ; le texte arabe reste dans le DOM.
 */
export default function PaintWallScene({ fill = 0, label, className = '', scene = 'paint-wall' }) {
  const f = Math.max(0, Math.min(1, fill));
  const painted = Math.round(f * STRIPES);
  const done = f >= 1;
  const sw = WALL.w / STRIPES;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-scene={scene} data-paint-fill={f.toFixed(2)}>
      <SceneBackdrop width={W} height={H} ground={GROUND} />
      {/* le mur : des bandes verticales, peintes une à une (le reste en béton gris) */}
      <g data-wall>
        {Array.from({ length: STRIPES }, (_, i) => (
          <rect key={i} x={WALL.x + i * sw} y={WALL.y} width={sw + 0.5} height={WALL.h} fill={i < painted ? PAINT[i % 2] : '#E5E7EB'} data-wall-stripe={i < painted ? 'painted' : 'bare'} />
        ))}
        <rect x={WALL.x} y={WALL.y} width={WALL.w} height={WALL.h} fill="none" stroke="#94A3B8" strokeWidth="2" />
        <rect x={WALL.x - 6} y={WALL.y - 10} width={WALL.w + 12} height="10" rx="2" fill="#64748B" />
        {/* les fanions du club, au-dessus du mur */}
        {Array.from({ length: 9 }, (_, i) => {
          const x = 40 + i * 50;
          return <polygon key={i} points={`${x - 9},${WALL.y - 10} ${x + 9},${WALL.y - 10} ${x},${WALL.y + 6}`} fill={['#F59E0B', '#0EA5E9', '#22C55E'][i % 3]} />;
        })}
      </g>
      {/* le tréteau, sa planche et son niveau : de niveau quand la mission est gagnée */}
      <XTrestle cx={250} foot={GROUND - 2} height={128} spread={112} plankAt={0.5} level={done} />
      <PaintBucket x={170} y={GROUND - 2} color={PAINT[0]} />
      <PaintRoller x={118} y={118} color={PAINT[1]} />
      <KidFigure cx={96} top={100} foot={GROUND - 4} hairStyle="hijab" scarf="lavender" outfit="violet" mood={done ? 'proud' : 'wonder'} />
      <KidFigure cx={384} top={98} foot={GROUND - 4} outfit="blue" mood={done ? 'proud' : 'happy'} />
    </svg>
  );
}
