import React from 'react';
import KidFigure from '../manipulations/primitives/KidFigure';
import { PitchBackdrop, PitchPlot, TurfStrips, PitchLines, Goal, Bench, BenchRow, TapeMeasure } from './pitchSceneKit';

const W = 480;
const H = 260;
const GROUND = 214;
const PLOT = { x: 150, y: 58, w: 180, h: 140 };
const ROWS = 3;     // les rangées de gradins, montées une à une
const ROW = 13;     // la profondeur d'une rangée

/**
 * LES GRADINS DU TERRAIN DU QUARTIER (leçon `mutatabiqat-shahira`, rollout 2026-11-11 ; conseil du 2026-11-11, « Cross-lesson › Scenes » : l'objet
 * de la leçon 2 = les gradins posés le long de DEUX côtés voisins, le coin où ils se croisent n'est JAMAIS mis en valeur — ce serait la correction
 * de la مسألة) — dessinée en code (CLAUDE.md : aucune image générée dans les leçons), sur les primitives communes de l'unité 3 (`pitchSceneKit.jsx`).
 * Un terrain carré ; à mesure que les outils sont gagnés (`fill` ∈ [0, 1]), le gazon s'y déroule et les rangées de bancs des gradins montent le long
 * du côté haut et du côté droit (le coin commun reste de la terre nue, sans couleur ni trait propre) ; les lignes blanches et les buts n'apparaissent
 * que lorsque tout est gagné. Deux élèves dessinés par `KidFigure` : une fille en hijab (tenue islamique) tend le mètre ruban le long d'un côté, un
 * garçon porte un banc. Un ballon. Aucun nombre ni aucune lettre n'est dessiné ; le texte arabe reste dans le DOM.
 */
export default function StandsPitchScene({ fill = 0, label, className = '', scene = 'stands-pitch' }) {
  const f = Math.max(0, Math.min(1, fill));
  const done = f >= 1;
  const rows = Math.round(f * ROWS);
  const field = { x: PLOT.x, y: PLOT.y + ROWS * ROW, w: PLOT.w - ROWS * ROW, h: PLOT.h - ROWS * ROW };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-scene={scene} data-stand-rows={rows}>
      <PitchBackdrop width={W} height={H} ground={GROUND} />
      <PitchPlot x={PLOT.x} y={PLOT.y} w={PLOT.w} h={PLOT.h} />
      <TurfStrips x={field.x} y={field.y} w={field.w} h={field.h} fill={f} bands={6} />
      {done && <PitchLines x={field.x} y={field.y} w={field.w} h={field.h} />}
      {done && <Goal x={field.x} y={field.y + field.h / 2 - 14} h={28} side="left" />}
      {/* les gradins : des rangées de bancs le long du côté HAUT (sans le coin) et du côté DROIT (sans le coin) */}
      <g data-stands>
        {Array.from({ length: rows }, (_, i) => (
          <React.Fragment key={i}>
            <BenchRow x={field.x + 2} y={PLOT.y + (ROWS - i) * ROW - 1} w={field.w - 4} count={4} />
            <g transform={`translate(${field.x + field.w + i * ROW + 1} ${field.y + field.h}) rotate(-90)`}>
              <BenchRow x={2} y={ROW - 1} w={field.h - 4} count={3} color="#22C55E" />
            </g>
          </React.Fragment>
        ))}
      </g>
      {!done && <circle cx={field.x + field.w / 2} cy={field.y + field.h / 2} r="6" fill="#fff" stroke="#0F172A" strokeWidth="1.2" data-ball />}
      <TapeMeasure x1={PLOT.x} y1={PLOT.y + PLOT.h + 10} x2={PLOT.x + PLOT.w * 0.8} y2={PLOT.y + PLOT.h + 10} />
      <KidFigure cx={96} top={118} foot={GROUND - 2} hairStyle="hijab" scarf="sky" outfit="teal" mood={done ? 'proud' : 'wonder'} />
      <KidFigure cx={392} top={120} foot={GROUND - 2} outfit="orange" mood={done ? 'proud' : 'happy'} />
      <Bench x={404} y={GROUND - 64} w={36} />
    </svg>
  );
}
