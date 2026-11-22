import KidFigure from '../manipulations/primitives/KidFigure';
import { SceneBackdrop, Projector, LightBeam, CinemaScreen, ChairRows } from './thalesSceneKit';

const W = 480;
const H = 260;
const GROUND = 196;

/**
 * LE CINÉ-CLUB DE NUIT SUR LA PLACE DU QUARTIER (leçon `talis-hisab-atwal`, rollout 2026-11-10 ; conseil du 2026-11-10, verdict « Scenes: shared
 * SVG primitives + one thin scene file per lesson ») — dessiné en code (CLAUDE.md : aucune image générée dans les leçons), sur les primitives
 * communes de l'unité 9 (`thalesSceneKit.jsx`). Un projecteur sur son pied envoie un faisceau (deux bords) vers le grand écran ; une fille en
 * hijab (tenue islamique) tient une planche blanche DANS le faisceau, un garçon règle le projecteur ; devant, les chaises vides. L'image de
 * l'écran devient nette bande après bande à mesure que les outils sont gagnés (`fill` ∈ [0, 1]) et le faisceau s'éclaire ; le paysage projeté
 * n'apparaît que lorsque tout est gagné. Les deux personnes sont dessinées par `KidFigure`. Aucun nombre n'est dessiné (ni longueur, ni rapport) ;
 * le texte arabe reste dans le DOM.
 */
export default function NightCinemaScene({ fill = 0, label, className = '', scene = 'night-cinema' }) {
  const f = Math.max(0, Math.min(1, fill));
  const done = f >= 1;
  const lens = { x: 96, y: 128 };
  const screen = { x: 372, y: 46, w: 86, h: 112 };
  const top = { x: screen.x, y: screen.y + 4 };
  const bottom = { x: screen.x, y: screen.y + screen.h - 4 };
  // la planche blanche, DANS le faisceau, parallèle à l'écran : ses bords sont sur les deux bords du faisceau (à 46 % du chemin)
  const t = 0.46;
  const at = (P) => ({ x: lens.x + (P.x - lens.x) * t, y: lens.y + (P.y - lens.y) * t });
  const bt = at(top); const bb = at(bottom);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-scene={scene} data-cinema-fill={f.toFixed(2)}>
      <SceneBackdrop width={W} height={H} ground={GROUND} sky="#1E1B4B" soil="#44403C" />
      {/* la nuit : une lune ronde, des étoiles, les maisons du quartier et leurs fenêtres éclairées */}
      <g data-night>
        <circle cx="54" cy="36" r="15" fill="#FEF9C3" />
        {[[120, 26], [176, 48], [236, 20], [300, 40], [340, 16], [420, 28], [150, 70]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#E0E7FF" />)}
        {[[0, 62, 150], [58, 54, 132], [118, 70, 144]].map(([x, w, y]) => (
          <g key={x}>
            <rect x={x} y={y} width={w} height={GROUND - y} fill="#312E81" />
            <rect x={x + 10} y={y + 12} width="9" height="11" fill="#FDE68A" opacity="0.85" />
            <rect x={x + w - 22} y={y + 26} width="9" height="11" fill="#FDE68A" opacity="0.6" />
          </g>
        ))}
      </g>
      {/* le faisceau, puis l'écran qui devient net */}
      <LightBeam from={lens} top={top} bottom={bottom} lit={0.25 + 0.75 * f} />
      <CinemaScreen {...screen} lit={f} />
      {/* la planche blanche tenue dans le faisceau */}
      <g data-white-board>
        <rect x={bt.x - 3} y={bt.y} width="6" height={bb.y - bt.y} rx="2" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1.5" />
      </g>
      <Projector x={lens.x} y={lens.y} />
      <ChairRows x={196} y={GROUND + 28} w={236} rows={2} perRow={7} />
      {/* la fille en hijab tient la planche ; le garçon règle le projecteur */}
      <KidFigure cx={bt.x + 22} top={GROUND - 90} foot={GROUND + 6} hairStyle="hijab" scarf="sky" outfit="teal" mood={done ? 'proud' : 'wonder'} />
      <KidFigure cx={38} top={GROUND - 92} foot={GROUND + 8} outfit="orange" mood={done ? 'proud' : 'happy'} />
    </svg>
  );
}
