import KidFigure from '../manipulations/primitives/KidFigure';
import { PitchBackdrop } from './pitchSceneKit';

const W = 480;
const H = 260;
const GROUND = 120;

/**
 * LA PLACE À LA FONTAINE (la synthèse de l'unité 3 `wadiya-idmajiya-harfi`, `mission.scene = 'fountain-plaza'`, 2026-11-12) — une scène MINCE
 * dessinée en code, sur le fond commun de l'unité (`pitchSceneKit.jsx › PitchBackdrop`) : une نافورة carrée vue en légère perspective, entourée
 * d'un ممرّ dallé de MÊME largeur sur ses quatre côtés (les quatre bandes et les quatre coins à peine marqués) — aucun nombre, aucune lettre
 * (la largeur est ce que l'élève cherche). Les élèves sont le personnage partagé `KidFigure` : une fille en hijab (tenue islamique) qui regarde
 * le ممرّ, un garçon qui le montre. Une synthèse n'a rien à gagner (les clés sont à l'élève dès le départ) : `fill` éclaire seulement le ممرّ.
 */
export default function FountainPlazaScene({ fill = 1, label, className = '', scene = 'fountain-plaza' }) {
  const f = Math.max(0, Math.min(1, fill));
  // le carré extérieur (ممرّ + نافورة) en perspective : un parallélogramme ; la نافورة au milieu, le ممرّ de largeur w autour
  const x0 = 130;
  const y0 = 150;
  const side = 150;
  const depth = 80;
  const skew = 40;
  const P = (u, v) => `${x0 + u * side + v * skew},${y0 + v * depth}`;
  const quad = (u0, v0, u1, v1) => [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)].join(' ');
  const w = 0.2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-scene={scene} data-plaza-fill={f.toFixed(2)}>
      <PitchBackdrop width={W} height={H} ground={GROUND} sky="#E0F2FE" soil="#E7E5E4" />
      {/* des arbres au fond de la place */}
      {[40, 110, 370, 440].map((cx) => (
        <g key={cx} aria-hidden="true">
          <rect x={cx - 3} y={GROUND - 26} width="6" height="26" fill="#78350F" />
          <circle cx={cx} cy={GROUND - 36} r="18" fill="#16A34A" />
        </g>
      ))}
      {/* le ممرّ : le carré extérieur dallé, plus clair à mesure que `fill` monte */}
      <g data-plaza-path opacity={0.6 + 0.4 * f}>
        <polygon points={quad(0, 0, 1, 1)} fill="#D6D3D1" stroke="#57534E" strokeWidth="2" />
        {/* les quatre coins à peine marqués : les lignes qui prolongent les bords de la نافورة */}
        {[w, 1 - w].map((t) => (
          <g key={t} stroke="#78716C" strokeWidth="1" strokeDasharray="3 4">
            <line x1={x0 + t * side} y1={y0} x2={x0 + t * side + skew} y2={y0 + depth} />
            <polyline points={`${P(0, t)} ${P(1, t)}`} fill="none" />
          </g>
        ))}
      </g>
      {/* la نافورة : l'eau, son rebord, un jet d'eau au milieu */}
      <g data-plaza-fountain>
        <polygon points={quad(w, w, 1 - w, 1 - w)} fill="#38BDF8" stroke="#0369A1" strokeWidth="2.5" />
        <polygon points={quad(w + 0.06, w + 0.08, 1 - w - 0.06, 1 - w - 0.08)} fill="#7DD3FC" opacity="0.7" />
        <path d={`M${x0 + side / 2 + skew / 2} ${y0 + depth / 2} q -10 -34 0 -46 q 10 12 0 46`} fill="#BAE6FD" stroke="#0EA5E9" strokeWidth="1.2" />
      </g>
      <KidFigure cx={66} top={GROUND + 6} foot={GROUND + 112} hairStyle="hijab" scarf="sky" outfit="teal" mood="wonder" />
      <KidFigure cx={420} top={GROUND + 4} foot={GROUND + 114} outfit="green" mood="happy" />
    </svg>
  );
}
