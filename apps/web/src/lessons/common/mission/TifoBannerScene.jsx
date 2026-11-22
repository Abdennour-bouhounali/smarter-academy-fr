import KidFigure from '../manipulations/primitives/KidFigure';
import { SceneBackdrop, FloorBanner, BigCompass, Straightedge } from './thalesSceneKit';

const W = 480;
const H = 260;
const GROUND = 176;

/**
 * LA SALLE DES JEUNES DU QUARTIER, la veille du derby (leçon `inshaat-talis`, rollout 2026-11-10 ; conseil du 2026-11-10, verdict « Scenes: shared
 * SVG primitives + one thin scene file per lesson ») — dessinée en code (CLAUDE.md : aucune image générée dans les leçons), sur les primitives
 * communes de l'unité 9 (`thalesSceneKit.jsx`). Une longue banderole de « tifo » est étendue au sol : elle se COLORE à mesure que les outils sont
 * gagnés (`fill` ∈ [0, 1]) — verte puis rouge — et sa couture n'est tracée que lorsque tout est gagné ; au-dessus d'elle, de fins traits
 * parallèles (l'éventail de la construction, sans graduation). Deux élèves dessinés par `KidFigure` : une fille en hijab (tenue islamique) tient
 * un grand compas, un garçon une règle NON graduée. Aucun nombre n'est dessiné (ni longueur, ni rapport) ; le texte arabe reste dans le DOM.
 */
export default function TifoBannerScene({ fill = 0, label, className = '', scene = 'tifo-banner' }) {
  const f = Math.max(0, Math.min(1, fill));
  const done = f >= 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-scene={scene} data-banner-fill={f.toFixed(2)}>
      <SceneBackdrop width={W} height={H} ground={GROUND} sky="#FEF3C7" soil="#E7E5E4" />
      {/* le mur de la salle : une rangée de fanions et deux fenêtres */}
      <g data-hall>
        <rect x="34" y="34" width="70" height="52" rx="4" fill="#BAE6FD" stroke="#78716C" strokeWidth="2" />
        <rect x="376" y="34" width="70" height="52" rx="4" fill="#BAE6FD" stroke="#78716C" strokeWidth="2" />
        <path d="M 20 18 Q 240 44 460 18" fill="none" stroke="#78716C" strokeWidth="1.5" />
        {Array.from({ length: 11 }, (_, i) => {
          const x = 40 + i * 40;
          const y = 20 + 22 * (1 - ((x - 240) / 220) ** 2);
          return <polygon key={i} points={`${x - 8},${y} ${x + 8},${y} ${x},${y + 16}`} fill={['#059669', '#F8FAFC', '#E11D48'][i % 3]} stroke="#78716C" strokeWidth="0.6" />;
        })}
      </g>
      {/* la banderole au sol, en deux couleurs — la couture seulement quand la mission est gagnée */}
      <FloorBanner x={86} y={GROUND + 26} w={308} h={36} split={0.56} painted={f} />
      {/* les deux instruments, tenus par les élèves */}
      <BigCompass x={104} y={GROUND + 20} open={30} height={58} />
      <Straightedge x1={300} y1={GROUND + 6} x2={396} y2={GROUND - 26} />
      <KidFigure cx={62} top={GROUND - 96} foot={GROUND + 18} hairStyle="hijab" scarf="mint" outfit="violet" mood={done ? 'proud' : 'wonder'} />
      <KidFigure cx={428} top={GROUND - 98} foot={GROUND + 18} outfit="green" mood={done ? 'proud' : 'happy'} />
    </svg>
  );
}
