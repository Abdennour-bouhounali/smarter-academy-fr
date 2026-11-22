import { memo } from 'react';
import { UNITS_PER_CM, UNITS_PER_MM, toDegrees, toRadians } from './geoMath.js';
import { RULER_MARGIN, RULER_WIDTH, PROTRACTOR_INNER, compassGeometry, setSquareGeometry } from './instruments.js';

/**
 * Les instruments DESSINÉS — en SVG, jamais en image (CLAUDE.md : « le dessin
 * se LIT »). Chaque instrument est dessiné dans SON repère (u = +x, le côté
 * du corps = −y), puis posé par une seule transformation : pendant un
 * glisser, seule la transformation change et React ne redessine pas les
 * centaines de graduations (`memo`).
 *
 * Les couleurs sont des ATTRIBUTS de présentation, pas des classes : le même
 * balisage est copié tel quel dans l'image exportée « مع أدوات الهندسة »,
 * où aucune feuille de style ne s'applique.
 *
 * `data-geo-hit` nomme la partie qu'un pointeur saisit (GeometryDesk).
 */

const INK = '#3f3a2e';
const DIGITS = { fontFamily: 'Nunito, Inter, Cairo, sans-serif', direction: 'ltr' };

export const poseTransform = (inst) => `translate(${inst.x} ${inst.y}) rotate(${toDegrees(inst.angle)})`;

// ── المسطرة ──────────────────────────────────────────────────────────────

export const RulerShape = memo(function RulerShape({ lengthCm, highlight = false }) {
  const L = lengthCm * UNITS_PER_CM;
  const ticks = [];
  for (let mm = 0; mm <= lengthCm * 10; mm += 1) {
    const x = mm * UNITS_PER_MM;
    const h = mm % 10 === 0 ? 0.55 * UNITS_PER_CM : mm % 5 === 0 ? 0.36 * UNITS_PER_CM : 0.22 * UNITS_PER_CM;
    ticks.push(`M${x} 0V${-h}`);
  }
  const numbers = [];
  for (let cm = 0; cm <= lengthCm; cm += 1) {
    numbers.push(
      <text key={cm} x={cm * UNITS_PER_CM} y={-0.72 * UNITS_PER_CM} fontSize={0.34 * UNITS_PER_CM} textAnchor="middle" fill={INK} {...DIGITS}>{cm}</text>,
    );
  }

  return (
    <g data-geo-hit="ruler:body">
      <rect
        x={-RULER_MARGIN} y={-RULER_WIDTH} width={L + 2 * RULER_MARGIN} height={RULER_WIDTH} rx={3}
        fill="#fff4c2" fillOpacity={0.78} stroke={highlight ? '#e67700' : '#b08a1e'} strokeWidth={highlight ? 2 : 1.2}
      />
      {/* Le bord biseauté, là où l'on trace. */}
      <rect x={-RULER_MARGIN} y={-0.12 * UNITS_PER_CM} width={L + 2 * RULER_MARGIN} height={0.12 * UNITS_PER_CM} fill="#e8d27a" fillOpacity={0.9} />
      <path d={ticks.join('')} stroke={INK} strokeWidth={0.9} fill="none" />
      {numbers}
      {/* Le ZÉRO : la graduation d'où l'on mesure. */}
      <path d={`M0 0V${-0.62 * UNITS_PER_CM}`} stroke="#c92a2a" strokeWidth={1.6} />
      <path d={`M-4 ${-0.62 * UNITS_PER_CM - 7}L4 ${-0.62 * UNITS_PER_CM - 7}L0 ${-0.62 * UNITS_PER_CM}Z`} fill="#c92a2a" />
      <text x={L + RULER_MARGIN * 0.2} y={-1.18 * UNITS_PER_CM} fontSize={0.3 * UNITS_PER_CM} textAnchor="end" fill={INK} fillOpacity={0.75} {...DIGITS}>cm</text>
    </g>
  );
});

// ── المنقلة ──────────────────────────────────────────────────────────────

export const ProtractorShape = memo(function ProtractorShape({ radiusCm }) {
  const R = radiusCm * UNITS_PER_CM;
  const ticks = [];
  for (let d = 0; d <= 180; d += 1) {
    const l = d % 10 === 0 ? 0.6 * UNITS_PER_CM : d % 5 === 0 ? 0.4 * UNITS_PER_CM : 0.22 * UNITS_PER_CM;
    const c = Math.cos(toRadians(d));
    const s = -Math.sin(toRadians(d));
    ticks.push(`M${R * c} ${R * s}L${(R - l) * c} ${(R - l) * s}`);
  }
  const labels = [];
  for (let d = 0; d <= 180; d += 10) {
    const c = Math.cos(toRadians(d));
    const s = -Math.sin(toRadians(d));
    const r1 = R - 0.95 * UNITS_PER_CM;
    const r2 = R - 1.5 * UNITS_PER_CM;
    labels.push(
      <text key={`o${d}`} x={r1 * c} y={r1 * s} fontSize={0.3 * UNITS_PER_CM} textAnchor="middle" dominantBaseline="central" fill={INK} transform={`rotate(${90 - d} ${r1 * c} ${r1 * s})`} {...DIGITS}>{d}</text>,
      <text key={`i${d}`} x={r2 * c} y={r2 * s} fontSize={0.24 * UNITS_PER_CM} textAnchor="middle" dominantBaseline="central" fill="#1c7ed6" transform={`rotate(${90 - d} ${r2 * c} ${r2 * s})`} {...DIGITS}>{180 - d}</text>,
    );
  }
  const inner = R * PROTRACTOR_INNER;

  return (
    <g data-geo-hit="protractor:body">
      <path
        d={`M${-R} 0A${R} ${R} 0 0 1 ${R} 0ZM${inner} 0A${inner} ${inner} 0 0 0 ${-inner} 0Z`}
        fill="#d0ebff" fillOpacity={0.62} fillRule="evenodd" stroke="#1971c2" strokeWidth={1.2}
      />
      <path d={ticks.join('')} stroke={INK} strokeWidth={0.8} fill="none" />
      {labels}
      {/* Le diamètre et le CENTRE — le point que l'on pose sur le sommet. */}
      <path d={`M${-R} 0H${R}`} stroke="#1971c2" strokeWidth={1.2} />
      <path d={`M-9 0H9M0 -9V4`} stroke="#c92a2a" strokeWidth={1.4} />
      <circle cx={0} cy={0} r={3} fill="none" stroke="#c92a2a" strokeWidth={1.2} />
    </g>
  );
});

// ── الكوس ────────────────────────────────────────────────────────────────

export const SetSquareShape = memo(function SetSquareShape({ kind, sizeCm }) {
  const g = setSquareGeometry({ x: 0, y: 0, angle: 0, kind, sizeCm });
  const a = g.a;
  const b = g.b;
  // L'évidement intérieur, comme sur une vraie équerre de tableau.
  const k = 0.45;
  const cx = a / 3;
  const cy = -b / 3;
  const inner = [[0, 0], [a, 0], [0, -b]].map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
  const ticks = [];
  for (let mm = 0; mm * UNITS_PER_MM <= a - 0.6 * UNITS_PER_CM; mm += 1) {
    const x = mm * UNITS_PER_MM;
    const h = mm % 10 === 0 ? 0.45 * UNITS_PER_CM : mm % 5 === 0 ? 0.3 * UNITS_PER_CM : 0.18 * UNITS_PER_CM;
    ticks.push(`M${x} 0V${-h}`);
  }
  const numbers = [];
  for (let cm = 1; cm * UNITS_PER_CM <= a - 1 * UNITS_PER_CM; cm += 1) {
    numbers.push(<text key={cm} x={cm * UNITS_PER_CM} y={-0.62 * UNITS_PER_CM} fontSize={0.28 * UNITS_PER_CM} textAnchor="middle" fill={INK} {...DIGITS}>{cm}</text>);
  }
  const sq = 0.5 * UNITS_PER_CM;
  const acute = kind === '3060' ? ['30°', '60°'] : ['45°', '45°'];

  return (
    <g data-geo-hit="setSquare:body">
      <path
        d={`M0 0L${a} 0L0 ${-b}ZM${inner[0][0]} ${inner[0][1]}L${inner[2][0]} ${inner[2][1]}L${inner[1][0]} ${inner[1][1]}Z`}
        fill="#d3f9d8" fillOpacity={0.66} fillRule="evenodd" stroke="#2b8a3e" strokeWidth={1.2} strokeLinejoin="round"
      />
      <path d={ticks.join('')} stroke={INK} strokeWidth={0.8} fill="none" />
      {numbers}
      {/* L'angle DROIT, marqué comme dans le cahier. */}
      <path d={`M${sq} 0V${-sq}H0`} stroke="#2b8a3e" strokeWidth={1.2} fill="none" />
      <text x={a - 1.6 * UNITS_PER_CM} y={-0.2 * UNITS_PER_CM - (b / a) * 1.2 * UNITS_PER_CM} fontSize={0.3 * UNITS_PER_CM} fill="#2b8a3e" {...DIGITS}>{acute[0]}</text>
      <text x={0.22 * UNITS_PER_CM} y={-b + 1.5 * UNITS_PER_CM} fontSize={0.3 * UNITS_PER_CM} fill="#2b8a3e" {...DIGITS}>{acute[1]}</text>
    </g>
  );
});

// ── الفرجار ──────────────────────────────────────────────────────────────

/**
 * Le compas se dessine dans la SCÈNE (pas dans un repère rigide) : son
 * ouverture change sa forme. Deux branches, l'articulation, la poignée, la
 * pointe sèche sur le centre, la mine sur le cercle.
 */
export function CompassShape({ compass, drawing = false }) {
  const g = compassGeometry(compass);
  const legW = 0.24 * UNITS_PER_CM;
  const pencilStart = { x: g.tip.x + (g.apex.x - g.tip.x) * 0.28, y: g.tip.y + (g.apex.y - g.tip.y) * 0.28 };
  const coneStart = { x: g.tip.x + (g.apex.x - g.tip.x) * 0.07, y: g.tip.y + (g.apex.y - g.tip.y) * 0.07 };

  return (
    <g>
      {/* La branche à pointe sèche. */}
      <line data-geo-hit="compass:body" x1={g.apex.x} y1={g.apex.y} x2={g.pivot.x} y2={g.pivot.y} stroke="#868e96" strokeWidth={legW} strokeLinecap="round" />
      <line x1={g.apex.x} y1={g.apex.y} x2={g.pivot.x} y2={g.pivot.y} stroke="#dee2e6" strokeWidth={legW * 0.35} strokeLinecap="round" pointerEvents="none" />
      {/* La branche porte-mine : le crayon, puis la mine. */}
      <line data-geo-hit="compass:body" x1={g.apex.x} y1={g.apex.y} x2={pencilStart.x} y2={pencilStart.y} stroke="#868e96" strokeWidth={legW} strokeLinecap="round" />
      <line data-geo-hit="compass:tip" x1={pencilStart.x} y1={pencilStart.y} x2={coneStart.x} y2={coneStart.y} stroke="#fab005" strokeWidth={legW * 1.25} />
      <line x1={coneStart.x} y1={coneStart.y} x2={g.tip.x} y2={g.tip.y} stroke="#e9c77b" strokeWidth={legW * 0.9} strokeLinecap="round" pointerEvents="none" />
      <circle cx={g.tip.x} cy={g.tip.y} r={2.2} fill={drawing ? '#1e1e1e' : '#495057'} pointerEvents="none" />
      {/* L'articulation et la poignée qu'on fait tourner. */}
      <line data-geo-hit="compass:knob" x1={g.apex.x} y1={g.apex.y} x2={g.knob.x} y2={g.knob.y} stroke="#495057" strokeWidth={legW * 1.1} strokeLinecap="round" />
      <circle data-geo-hit="compass:body" cx={g.apex.x} cy={g.apex.y} r={legW * 1.3} fill="#adb5bd" stroke="#495057" strokeWidth={1.2} />
      {/* La pointe sèche : un point fin, cerclé de rouge — c'est le CENTRE. */}
      <circle cx={g.pivot.x} cy={g.pivot.y} r={3.2} fill="#c92a2a" pointerEvents="none" />
    </g>
  );
}

/** Le « crayon de géométrie » tenu par l'enseignant pendant qu'il trace : une mine et un bout de crayon. */
export function PencilCursor({ at, zoom }) {
  const s = 1 / Math.max(zoom, 0.2);

  return (
    <g transform={`translate(${at.x} ${at.y}) scale(${s})`} pointerEvents="none">
      <path d="M0 0L7 -16L13 -13Z" fill="#e9c77b" stroke="#6b5a2e" strokeWidth={0.8} />
      <path d="M0 0L2.6 -6L4.9 -4.9Z" fill="#343a40" />
      <path d="M7 -16L28 -60L34 -57L13 -13Z" fill="#fab005" stroke="#b08a1e" strokeWidth={0.8} />
    </g>
  );
}
