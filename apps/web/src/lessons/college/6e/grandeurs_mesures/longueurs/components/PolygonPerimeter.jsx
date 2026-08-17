import React from 'react';

/**
 * PolygonPerimeter — polygone schématique (pas à l'échelle, comme les
 * schémas en barres du reste du site) sur lequel l'élève TAPE chaque côté,
 * dans l'ordre du contour, pour construire le périmètre côté après côté
 * avant de voir apparaître une formule. Aucun glisser-déposer : on reste
 * sur le pattern tap-based déjà utilisé partout ailleurs (mobile-safe).
 */

const SHAPES = {
  triangle: { viewBox: '0 0 300 200', vertices: [[40, 170], [260, 170], [150, 30]] },
  rectangle: { viewBox: '0 0 300 200', vertices: [[40, 160], [260, 160], [260, 40], [40, 40]] },
  quad: { viewBox: '0 0 300 200', vertices: [[30, 170], [270, 150], [230, 30], [70, 50]] },
};

function centroidOf(vertices) {
  const n = vertices.length;
  const sx = vertices.reduce((s, [x]) => s + x, 0);
  const sy = vertices.reduce((s, [, y]) => s + y, 0);
  return [sx / n, sy / n];
}

export default function PolygonPerimeter({
  shape = 'triangle',
  sideLengths,
  unit = 'm',
  tappedIndices = [],
  onTapSide,
  ariaLabelPrefix = 'Côté',
  disabled = false,
}) {
  const def = SHAPES[shape] || SHAPES.triangle;
  const { vertices, viewBox } = def;
  const n = vertices.length;
  const [cx, cy] = centroidOf(vertices);

  const points = vertices.map((v) => v.join(',')).join(' ');

  const edges = vertices.map((v, i) => {
    const [x1, y1] = v;
    const [x2, y2] = vertices[(i + 1) % n];
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    let dx = mx - cx;
    let dy = my - cy;
    const dist = Math.hypot(dx, dy) || 1;
    dx /= dist;
    dy /= dist;
    return { x1, y1, x2, y2, lx: mx + dx * 22, ly: my + dy * 22 };
  });

  return (
    <svg viewBox={viewBox} className="w-full max-w-md mx-auto select-none" role="img" aria-label={`Polygone (${n} côtés)`}>
      <polygon points={points} fill="#eff6ff" stroke="#1e293b" strokeWidth="2" />
      {edges.map((e, i) => {
        const isTapped = tappedIndices.includes(i);
        return (
          <g key={i}>
            <line
              x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke={isTapped ? '#059669' : '#1e293b'}
              strokeWidth={isTapped ? 6 : 3}
              strokeLinecap="round"
              style={{ cursor: disabled ? 'default' : 'pointer', transition: 'stroke 0.2s, stroke-width 0.2s' }}
              onClick={() => !disabled && onTapSide?.(i)}
            />
            {/* zone tactile élargie, invisible, pour un tap confortable */}
            <line
              x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke="transparent" strokeWidth="22"
              style={{ cursor: disabled ? 'default' : 'pointer' }}
              onClick={() => !disabled && onTapSide?.(i)}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label={`${ariaLabelPrefix} ${i + 1} : ${sideLengths[i]} ${unit}${isTapped ? ', déjà compté' : ''}`}
              aria-pressed={isTapped}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); !disabled && onTapSide?.(i); }
              }}
            />
            <text
              x={e.lx} y={e.ly} textAnchor="middle" dominantBaseline="middle"
              className={isTapped ? 'fill-emerald-700' : 'fill-slate-600'}
              style={{ fontSize: 15, fontFamily: 'monospace', fontWeight: 700 }}
            >
              {sideLengths[i]} {unit}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
