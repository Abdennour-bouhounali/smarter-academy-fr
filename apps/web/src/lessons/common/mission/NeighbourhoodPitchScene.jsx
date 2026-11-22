import KidFigure from '../manipulations/primitives/KidFigure';
import { PitchBackdrop, PitchPlot, TurfStrips, PitchLines, Goal, BenchRow, CutStrip, TurfRoll, TapeMeasure } from './pitchSceneKit';

const W = 480;
const H = 260;
const GROUND = 206;
const PLOT = { x: 70, y: 70, w: 340, h: 104 };
const AISLE = 26;   // le couloir des spectateurs, coupé de la largeur
const BANDS = 8;

/**
 * LE TERRAIN DU QUARTIER ET SON COULOIR DE BANCS (leçon `nashr-tabsit`, rollout 2026-11-11 ; conseil du 2026-11-11, « Scenes » : l'objet de la
 * leçon 1 est la rangée de BANCS le long de la bande coupée) — dessiné en code (CLAUDE.md : aucune image générée dans les leçons), sur les
 * primitives communes de l'unité 3 (`pitchSceneKit.jsx`). Un terrain nu en terre battue ; le gazon s'y DÉROULE bande après bande à mesure que les
 * outils sont gagnés (`fill` ∈ [0, 1]) ; le long d'un grand côté, le couloir coupé (hachuré) porte les bancs des spectateurs ; les lignes blanches
 * et les buts n'apparaissent que lorsque tout est gagné. Deux élèves dessinés par `KidFigure` : une fille en hijab (tenue islamique) tient le mètre
 * ruban, un garçon pousse le rouleau de gazon. Aucun nombre ni aucune lettre n'est dessiné ; le texte arabe reste dans le DOM.
 */
export default function NeighbourhoodPitchScene({ fill = 0, label, className = '', scene = 'neighbourhood-pitch' }) {
  const f = Math.max(0, Math.min(1, fill));
  const done = f >= 1;
  const field = { x: PLOT.x, y: PLOT.y, w: PLOT.w, h: PLOT.h - AISLE };
  const rollX = field.x + Math.round(f * BANDS) * (field.w / BANDS);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-scene={scene} data-turf={f.toFixed(2)}>
      <PitchBackdrop width={W} height={H} ground={GROUND} />
      <PitchPlot x={PLOT.x} y={PLOT.y} w={PLOT.w} h={PLOT.h} />
      <TurfStrips x={field.x} y={field.y} w={field.w} h={field.h} fill={f} bands={BANDS} />
      {done && <PitchLines x={field.x} y={field.y} w={field.w} h={field.h} />}
      {done && <Goal x={field.x} y={field.y + field.h / 2 - 16} h={32} side="left" />}
      {done && <Goal x={field.x + field.w} y={field.y + field.h / 2 - 16} h={32} side="right" />}
      {/* le couloir coupé de la largeur, et ses bancs */}
      <CutStrip x={PLOT.x} y={PLOT.y + PLOT.h - AISLE} w={PLOT.w} h={AISLE} />
      <BenchRow x={PLOT.x + 8} y={PLOT.y + PLOT.h - 6} w={PLOT.w - 16} count={6} />
      {/* le rouleau de gazon, poussé jusqu'au bord de la dernière bande posée */}
      {!done && <TurfRoll x={Math.min(rollX, field.x + field.w - 30)} y={field.y + field.h - 13} r={11} len={28} />}
      <TapeMeasure x1={PLOT.x} y1={PLOT.y - 14} x2={PLOT.x + PLOT.w * 0.72} y2={PLOT.y - 14} />
      <KidFigure cx={40} top={110} foot={GROUND - 2} hairStyle="hijab" scarf="lavender" outfit="violet" mood={done ? 'proud' : 'wonder'} />
      <KidFigure cx={444} top={112} foot={GROUND - 2} outfit="blue" mood={done ? 'proud' : 'happy'} />
    </svg>
  );
}
