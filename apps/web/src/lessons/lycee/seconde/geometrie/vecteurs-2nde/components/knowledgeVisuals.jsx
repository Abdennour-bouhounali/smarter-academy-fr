import React from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   SVG MINI-VISUALS de la carte des connaissances
   ─────────────────────────────────────────────────────────────────────────
   Composants autonomes (ni CoordPlane ni KaTeX). Les coordonnées sont en
   « espace élève » (y vers le haut) et converties par les helpers internes.
   Utilisés par knowledge.jsx (les données) — la carte elle-même ne les
   connaît pas : elle reçoit `item.visual` déjà construit.
   ───────────────────────────────────────────────────────────────────────── */

function ArrowDef({ id, color }) {
  return (
    <marker id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill={color} />
    </marker>
  );
}

/**
 * MiniPlane — compact coordinate system with points + arrows.
 */
export function MiniPlane({
  width = 200,
  height = 160,
  xMin = -1, xMax = 6,
  yMin = -1, yMax = 5,
  points = [],
  arrows = [],
  showGrid = true,
  showAxes = true,
  className = '',
}) {
  const pad = { left: 28, right: 14, top: 14, bottom: 26 };
  const W = width - pad.left - pad.right;
  const H = height - pad.top - pad.bottom;
  const rX = xMax - xMin;
  const rY = yMax - yMin;
  const toX = (x) => (x - xMin) / rX * W;
  const toY = (y) => H - (y - yMin) / rY * H;

  const gxs = [];
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) gxs.push(x);
  const gys = [];
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) gys.push(y);

  return (
    <svg viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true" className={`select-none overflow-visible ${className} w-full h-auto`} style={{ maxWidth: width }}>
      <defs>
        {arrows.map((a, i) => <ArrowDef key={i} id={`kmp-${i}`} color={a.color ?? '#7c3aed'} />)}
      </defs>
      <g transform={`translate(${pad.left},${pad.top})`}>
        {showGrid && gxs.map(x => (
          <line key={`gx${x}`} x1={toX(x)} y1={0} x2={toX(x)} y2={H} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {showGrid && gys.map(y => (
          <line key={`gy${y}`} x1={0} y1={toY(y)} x2={W} y2={toY(y)} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {showAxes && (
          <>
            <line x1={toX(0)} y1={0} x2={toX(0)} y2={H} stroke="#94a3b8" strokeWidth="1.5" />
            <line x1={0} y1={toY(0)} x2={W} y2={toY(0)} stroke="#94a3b8" strokeWidth="1.5" />
          </>
        )}
        {showAxes && gxs.filter(x => x !== 0).map(x => (
          <text key={`lx${x}`} x={toX(x)} y={toY(0) + 14}
            textAnchor="middle" fontSize="9" fill="#94a3b8">{x}</text>
        ))}
        {showAxes && gys.filter(y => y !== 0).map(y => (
          <text key={`ly${y}`} x={toX(0) - 5} y={toY(y) + 3.5}
            textAnchor="end" fontSize="9" fill="#94a3b8">{y}</text>
        ))}
        {arrows.map((a, i) => {
          const x1 = toX(a.from.x); const y1 = toY(a.from.y);
          const x2 = toX(a.to.x);   const y2 = toY(a.to.y);
          const dx = x2 - x1; const dy = y2 - y1;
          const len = Math.hypot(dx, dy);
          if (len < 1) return null;
          const shrink = 7;
          const ux = dx / len; const uy = dy / len;
          const color = a.color ?? '#7c3aed';
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2 - ux * shrink} y2={y2 - uy * shrink}
                stroke={color} strokeWidth={a.dashed ? 1.5 : 2.2}
                strokeDasharray={a.dashed ? '4 3' : undefined}
                markerEnd={`url(#kmp-${i})`} />
              {a.label && (
                <text x={mx - uy * 12} y={my + ux * 12}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="11" fontWeight="700" fill={color}
                  paintOrder="stroke" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round">
                  {a.label}
                </text>
              )}
            </g>
          );
        })}
        {points.map((p, i) => {
          const cx = toX(p.x); const cy = toY(p.y);
          const color = p.color ?? '#0f172a';
          const lp = p.labelPos ?? 'tl';
          const offs = {
            tl: { dx: -7, dy: -7, anchor: 'end' },
            tr: { dx:  7, dy: -7, anchor: 'start' },
            bl: { dx: -7, dy: 14, anchor: 'end' },
            br: { dx:  7, dy: 14, anchor: 'start' },
            t:  { dx:  0, dy: -9, anchor: 'middle' },
            b:  { dx:  0, dy: 15, anchor: 'middle' },
          };
          const o = offs[lp] ?? offs.tl;
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r="4.5" fill={color} />
              {p.label && (
                <text x={cx + o.dx} y={cy + o.dy} textAnchor={o.anchor}
                  fontSize="12" fontWeight="700" fill={color}
                  paintOrder="stroke" stroke="#fff" strokeWidth="3" strokeLinejoin="round">
                  {p.label}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** Right triangle illustrating Pythagorean norm */
export function RightTriangle({ a = 3, b = 4, hyp = 5, color = '#7c3aed', width = 160, height = 120 }) {
  const pad = 26;
  const W = width - pad * 2;
  const H = height - pad * 2;
  const scale = Math.min(W / a, H / b);
  const ox = pad; const oy = height - pad;
  const px = [ox, ox + a * scale, ox + a * scale];
  const py = [oy, oy, oy - b * scale];
  const pts = px.map((x, i) => `${x},${py[i]}`).join(' ');
  const sq = 9;
  const sqPts = `${px[1] - sq},${py[1]} ${px[1] - sq},${py[1] - sq} ${px[1]},${py[1] - sq}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: width }}>
      <polygon points={pts} fill="none" stroke={color} strokeWidth="2.2" />
      <polyline points={sqPts} fill="none" stroke={color} strokeWidth="1.5" />
      {[[px[0], py[0]], [px[1], py[1]], [px[2], py[2]]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill={color} />
      ))}
      <text x={(px[0] + px[1]) / 2} y={py[0] + 18} textAnchor="middle" fontSize="13" fontWeight="700" fill="#0369a1">{a}</text>
      <text x={px[1] + 14} y={(py[1] + py[2]) / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#047857">{b}</text>
      <text x={(px[0] + px[2]) / 2 - 10} y={(py[0] + py[2]) / 2 - 6}
        textAnchor="middle" fontSize="13" fontWeight="800" fill={color}
        paintOrder="stroke" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round">{hyp}</text>
    </svg>
  );
}

/** Chasles relation: A → B → C with looping bottom arrow */
export function ChaslesArrow({
  A = 'A', B = 'B', C = 'C',
  colorAB = '#7c3aed', colorBC = '#059669', colorAC = '#d97706',
}) {
  // 104 de haut : les noms A, B, C (au-dessus) et « AC » (sous l'arc) restent
  // dans le viewBox — à 84 l'étiquette AC (y = 90) sortait du cadre.
  const w = 260; const h = 104;
  const xA = 20; const xB = 130; const xC = 240;
  const yTop = 28; const yBot = 74;
  const r = 5;

  function Seg({ x1, y1, x2, y2, color, id }) {
    const dx = x2 - x1; const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const ux = dx / len; const uy = dy / len;
    const shrink = 7;
    return (
      <>
        <defs>
          <marker id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={color} />
          </marker>
        </defs>
        <line x1={x1} y1={y1} x2={x2 - ux * shrink} y2={y2 - uy * shrink}
          stroke={color} strokeWidth="2" markerEnd={`url(#${id})`} />
      </>
    );
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true"
      className="select-none w-full" style={{ maxWidth: w }}>
      {[[xA, A, colorAB], [xB, B, colorBC], [xC, C, colorAC]].map(([x, name, c], i) => (
        <g key={i}>
          <circle cx={x} cy={yTop} r={r} fill="#0f172a" />
          <text x={x} y={yTop - 11} textAnchor="middle" fontSize="13" fontWeight="700" fill="#0f172a">{name}</text>
        </g>
      ))}
      <Seg x1={xA + r} y1={yTop} x2={xB - r} y2={yTop} color={colorAB} id="chs-ab" />
      <text x={(xA + xB) / 2} y={yTop - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill={colorAB}>AB</text>
      <Seg x1={xB + r} y1={yTop} x2={xC - r} y2={yTop} color={colorBC} id="chs-bc" />
      <text x={(xB + xC) / 2} y={yTop - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill={colorBC}>BC</text>

      {/* AC as a curved arrow underneath */}
      <defs>
        <marker id="chs-ac" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={colorAC} />
        </marker>
      </defs>
      <path
        d={`M ${xA} ${yTop + r + 2} Q ${(xA + xC) / 2} ${yBot + 10} ${xC - 6} ${yTop + r + 4}`}
        fill="none" stroke={colorAC} strokeWidth="2" markerEnd="url(#chs-ac)" />
      <text x={(xA + xC) / 2} y={yBot + 20} textAnchor="middle" fontSize="10" fontWeight="700" fill={colorAC}>AC</text>
    </svg>
  );
}
