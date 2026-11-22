import KidFigure from '../manipulations/primitives/KidFigure';
import { PitchBackdrop, PitchPlot, TurfStrips, PitchLines, Goal, TurfRollStack, TurfRoll, TapeMeasure } from './pitchSceneKit';

const W = 480;
const H = 260;
const GROUND = 150;

/**
 * LES ROULEAUX DE GAZON DU TERRAIN DU QUARTIER (leçon `tahlil-ibara`, rollout 2026-11-11 ; conseil du 2026-11-11, « Cross-lesson › Scenes » :
 * l'objet de la leçon 3 = les rouleaux de gazon empilés) — dessinée en code (CLAUDE.md : aucune image générée dans les leçons), sur les primitives
 * communes de l'unité 3 (`pitchSceneKit.jsx`). Le terrain est à moitié nu ; des RANGÉES de gazon s'y posent à mesure que les outils sont gagnés
 * (`fill` ∈ [0, 1], des bandes HORIZONTALES : la leçon range les plaques en rangées), les lignes blanches et les buts n'apparaissent que lorsque tout
 * est gagné. Le long du grillage, deux piles de rouleaux. Deux élèves dessinés par `KidFigure` : une fille en hijab (tenue islamique) déroule un
 * rouleau, un garçon tend un mètre ruban (sans graduation chiffrée). Aucun nombre, aucune lettre n'est dessiné ; le texte arabe reste dans le DOM.
 */
export default function TurfRollsScene({ fill = 0, label, className = '', scene = 'turf-rolls' }) {
  const f = Math.max(0, Math.min(1, fill));
  const done = f >= 1;
  const plot = { x: 120, y: GROUND + 14, w: 240, h: 84 };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-scene={scene} data-turf-fill={f.toFixed(2)}>
      <PitchBackdrop width={W} height={H} ground={GROUND} sky="#DBEAFE" soil="#D6D3D1" />
      {/* le grillage du terrain : des poteaux et deux fils, au fond */}
      <g data-fence stroke="#64748B" strokeWidth="1.5">
        <line x1="12" y1={GROUND - 46} x2={W - 12} y2={GROUND - 46} />
        <line x1="12" y1={GROUND - 24} x2={W - 12} y2={GROUND - 24} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={12 + i * 41} y1={GROUND - 54} x2={12 + i * 41} y2={GROUND} strokeWidth="2.5" />)}
      </g>
      {/* les rouleaux empilés le long du grillage — l'objet de la leçon */}
      <TurfRollStack x={20} y={GROUND} count={3} r={11} len={28} />
      <TurfRollStack x={372} y={GROUND} count={2} r={11} len={28} />
      {/* le terrain : la terre, puis les rangées de gazon posées au fil des outils */}
      <PitchPlot {...plot} />
      <TurfStrips {...plot} fill={f} bands={6} vertical={false} />
      {done && <PitchLines {...plot} />}
      {done && <Goal x={plot.x + 4} y={plot.y + plot.h * 0.3} h={plot.h * 0.4} side="left" />}
      {done && <Goal x={plot.x + plot.w - 4} y={plot.y + plot.h * 0.3} h={plot.h * 0.4} side="right" />}
      {/* un rouleau en train d'être déroulé, au bord du terrain */}
      <TurfRoll x={64} y={GROUND + 92} r={9} len={40} />
      <TapeMeasure x1={384} y1={GROUND + 104} x2={plot.x + plot.w} y2={GROUND + 104} />
      <KidFigure cx={58} top={GROUND - 30} foot={GROUND + 84} hairStyle="hijab" scarf="sky" outfit="teal" mood={done ? 'proud' : 'wonder'} />
      <KidFigure cx={432} top={GROUND - 32} foot={GROUND + 84} outfit="green" mood={done ? 'proud' : 'happy'} />
    </svg>
  );
}
