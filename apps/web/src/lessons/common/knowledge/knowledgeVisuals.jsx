import React from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   SVG MINI-VISUALS de la carte des connaissances
   ─────────────────────────────────────────────────────────────────────────
   Composants autonomes (ni CoordPlane ni KaTeX). Les coordonnées sont en
   « espace élève » (y vers le haut) et converties par les helpers internes.
   Utilisés par knowledge.jsx (les données) — la carte elle-même ne les
   connaît pas : elle reçoit `item.visual` déjà construit.
   ───────────────────────────────────────────────────────────────────────── */

/**
 * L'ÉCHELLE DE TRAIT — mêmes rapports que les figures de 6e
 * (common/knowledge6e/visuals6e.jsx), pour que collège et lycée se
 * ressemblent une fois les schémas affichés en grand.
 *
 * Unités de viewBox, donc proportionnelles au dessin : c'est le RAPPORT
 * entre elles qui fait la lisibilité, pas leur valeur absolue.
 */
const S = {
  RULE: 2,      // le trait porteur (courbe, vecteur, côté)
  MARK: 1.5,    // ce qui se pose dessus (axes, graduations)
  HAIR: 1,      // l'arrière-plan (quadrillage)
  LABEL: 12,    // ce qu'on lit
  NOTE: 10.5,   // ce qui commente
  DOT: 4,       // un point
  /**
   * HALO — la « plaque » d'étiquette, en une ligne.
   *
   * Le texte est peint APRÈS son propre contour blanc (paintOrder), ce qui
   * lui découpe un fond à sa forme exacte : il garde son espace au-dessus
   * d'une courbe sans masquer un rectangle de dessin.
   *
   * L'épaisseur se mesure EN PROPORTION du texte, jamais en absolu. Le
   * contour est peint des deux côtés du trait de la lettre : à 2,5 sur un
   * texte de 12, il mangeait presque tout l'intérieur d'un « O », qui
   * finissait en anneau creux — moins lisible que la collision corrigée.
   * Un huitième du corps suffit à détacher le texte du fond.
   */
  HALO: 1.5,
};

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
  segments = [],      // [{ from, to, color?, dashed?, width?, label?, labelPos? }] — droites (cordes), en coordonnées d'élève
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
    <svg viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: width }}
      aria-hidden="true" className={`select-none overflow-visible w-full h-auto ${className}`}>
      <defs>
        {arrows.map((a, i) => <ArrowDef key={i} id={`kmp-${i}`} color={a.color ?? '#7c3aed'} />)}
      </defs>
      <g transform={`translate(${pad.left},${pad.top})`}>
        {showGrid && gxs.map(x => (
          <line key={`gx${x}`} x1={toX(x)} y1={0} x2={toX(x)} y2={H} stroke="#e2e8f0" strokeWidth={S.HAIR} />
        ))}
        {showGrid && gys.map(y => (
          <line key={`gy${y}`} x1={0} y1={toY(y)} x2={W} y2={toY(y)} stroke="#e2e8f0" strokeWidth={S.HAIR} />
        ))}
        {showAxes && (
          <>
            <line x1={toX(0)} y1={0} x2={toX(0)} y2={H} stroke="#94a3b8" strokeWidth={S.MARK} />
            <line x1={0} y1={toY(0)} x2={W} y2={toY(0)} stroke="#94a3b8" strokeWidth={S.MARK} />
          </>
        )}
        {showAxes && gxs.filter(x => x !== 0).map(x => (
          <text key={`lx${x}`} x={toX(x)} y={toY(0) + 14}
            textAnchor="middle" fontSize={S.LABEL} fill="#94a3b8">{x}</text>
        ))}
        {showAxes && gys.filter(y => y !== 0).map(y => (
          <text key={`ly${y}`} x={toX(0) - 5} y={toY(y) + 3.5}
            textAnchor="end" fontSize={S.LABEL} fill="#94a3b8">{y}</text>
        ))}
        {segments.map((sg, i) => {
          const x1 = toX(sg.from.x); const y1 = toY(sg.from.y);
          const x2 = toX(sg.to.x); const y2 = toY(sg.to.y);
          const color = sg.color ?? '#4f46e5';
          // Étiquette posée au tiers de la corde, du côté indiqué (labelPos 'above' | 'below').
          const t = sg.labelT ?? 0.82;
          const lx = x1 + (x2 - x1) * t; const ly = y1 + (y2 - y1) * t;
          const dy = sg.labelPos === 'below' ? 13 : -7;
          return (
            <g key={`sg${i}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={sg.width ?? 2.2}
                strokeDasharray={sg.dashed ? '5 4' : undefined} strokeLinecap="round" />
              {sg.label && (
                <text x={lx} y={ly + dy} textAnchor="middle" fontSize={S.LABEL} fontWeight="700" fill={color}
                  paintOrder="stroke" stroke="#fff" strokeWidth={S.HALO} strokeLinejoin="round">{sg.label}</text>
              )}
            </g>
          );
        })}
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
                  fontSize={S.LABEL} fontWeight="700" fill={color}
                  paintOrder="stroke" stroke="#fff" strokeWidth={S.HALO} strokeLinejoin="round">
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
              <circle cx={cx} cy={cy} r={S.DOT} fill={color} />
              {p.label && (
                <text x={cx + o.dx} y={cy + o.dy} textAnchor={o.anchor}
                  fontSize={S.LABEL} fontWeight="700" fill={color}
                  paintOrder="stroke" stroke="#fff" strokeWidth={S.HALO} strokeLinejoin="round">
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
    <svg viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: width }} aria-hidden="true" className="select-none w-full h-auto">
      <polygon points={pts} fill="none" stroke={color} strokeWidth={S.RULE} />
      <polyline points={sqPts} fill="none" stroke={color} strokeWidth={S.MARK} />
      {[[px[0], py[0]], [px[1], py[1]], [px[2], py[2]]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={S.DOT} fill={color} />
      ))}
      <text x={(px[0] + px[1]) / 2} y={py[0] + 18} textAnchor="middle" fontSize={S.LABEL} fontWeight="700" fill="#0369a1">{a}</text>
      <text x={px[1] + 14} y={(py[1] + py[2]) / 2 + 5} textAnchor="middle" fontSize={S.LABEL} fontWeight="700" fill="#047857">{b}</text>
      <text x={(px[0] + px[2]) / 2 - 10} y={(py[0] + py[2]) / 2 - 6}
        textAnchor="middle" fontSize={S.LABEL} fontWeight="800" fill={color}
        paintOrder="stroke" stroke="#fff" strokeWidth={S.HALO} strokeLinejoin="round">{hyp}</text>
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
          stroke={color} strokeWidth={S.RULE} markerEnd={`url(#${id})`} />
      </>
    );
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true"
      className="select-none w-full" style={{ maxWidth: w }}>
      {[[xA, A, colorAB], [xB, B, colorBC], [xC, C, colorAC]].map(([x, name, c], i) => (
        <g key={i}>
          <circle cx={x} cy={yTop} r={r} fill="#0f172a" />
          <text x={x} y={yTop - 11} textAnchor="middle" fontSize={S.LABEL} fontWeight="700" fill="#0f172a">{name}</text>
        </g>
      ))}
      <Seg x1={xA + r} y1={yTop} x2={xB - r} y2={yTop} color={colorAB} id="chs-ab" />
      <text x={(xA + xB) / 2} y={yTop - 5} textAnchor="middle" fontSize={S.LABEL} fontWeight="700" fill={colorAB}>AB</text>
      <Seg x1={xB + r} y1={yTop} x2={xC - r} y2={yTop} color={colorBC} id="chs-bc" />
      <text x={(xB + xC) / 2} y={yTop - 5} textAnchor="middle" fontSize={S.LABEL} fontWeight="700" fill={colorBC}>BC</text>

      {/* AC as a curved arrow underneath */}
      <defs>
        <marker id="chs-ac" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={colorAC} />
        </marker>
      </defs>
      <path
        d={`M ${xA} ${yTop + r + 2} Q ${(xA + xC) / 2} ${yBot + 10} ${xC - 6} ${yTop + r + 4}`}
        fill="none" stroke={colorAC} strokeWidth={S.RULE} markerEnd="url(#chs-ac)" />
      <text x={(xA + xC) / 2} y={yBot + 20} textAnchor="middle" fontSize={S.LABEL} fontWeight="700" fill={colorAC}>AC</text>
    </svg>
  );
}


/**
 * MiniGraph — un repère compact avec une ou plusieurs COURBES x ↦ f(x)
 * (fonctions de 2nde : carré, inverse, valeur absolue, affine, courbes
 * quelconques). Échantillonne chaque fonction dans l'étendue et coupe au
 * cadre ; une fonction peut déclarer `gapAt` (valeur interdite) pour que la
 * courbe soit tracée en deux branches, ou `domain: [a, b]` pour n'exister
 * que sur un intervalle. Zones de signe / variations : `bands` (bandes
 * verticales colorées) ; points nommés : `points` ; guides pointillés :
 * `guides`. Autonome, sans dépendance — rendu identique à l'écran et à
 * l'impression.
 */
export function MiniGraph({
  width = 220,
  height = 160,
  xMin = -4, xMax = 4,
  yMin = -3, yMax = 5,
  functions = [],     // [{ fn, color?, dashed?, gapAt?, domain?, label?, samples? }]
  points = [],        // [{ x, y, label?, color?, labelPos? }]
  bands = [],         // [{ from, to, color, opacity? }] bandes verticales entre deux abscisses
  guides = [],        // [{ x?, y?, color? }] droites pointillées verticales / horizontales
  showGrid = true,
  className = '',
}) {
  // 30 et non 26 : une étiquette d'ordonnée à trois chiffres (« 400 », « 500 »)
  // mesure ~22,5 px et se pose à 4 px de l'axe, soit 26,5 px — elle dépassait
  // donc du cadre d'un demi-pixel, ce que l'audit de collisions signale à juste
  // titre (« hors cadre "400" » dans la carte de fonctions-2nde).
  const pad = { left: 30, right: 12, top: 12, bottom: 22 };
  const W = width - pad.left - pad.right;
  const H = height - pad.top - pad.bottom;
  const rX = xMax - xMin;
  const rY = yMax - yMin;
  const toX = (x) => (x - xMin) / rX * W;
  const toY = (y) => H - (y - yMin) / rY * H;
  // Graduations « rondes » : au plus ~8 par axe, quelle que soit l'étendue
  // (une étendue 0..600 ne doit pas produire 600 étiquettes qui se chevauchent).
  const niceStep = (span) => { for (const st of [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000]) if (span / st <= 8) return st; return 10000; };
  const xs = niceStep(rX); const ys = niceStep(rY);
  const gxs = [];
  for (let x = Math.ceil(xMin / xs) * xs; x <= xMax + 1e-9; x += xs) gxs.push(x);
  const gys = [];
  for (let y = Math.ceil(yMin / ys) * ys; y <= yMax + 1e-9; y += ys) gys.push(y);
  const fmt = (v) => String(Math.round(v * 100) / 100).replace('-', '−');
  /** Une étiquette de point reste DANS le cadre : position et ancre corrigées près des bords. */
  const placeLabel = (cx, cy, o, text) => {
    const w = String(text).length * 6.2 + 4;
    let x = cx + o.dx; let y = cy + o.dy; let anchor = o.anchor;
    if (anchor === 'start' && x + w > W) { anchor = 'end'; x = cx - Math.abs(o.dx); }
    if (anchor === 'end' && x - w < 0) { anchor = 'start'; x = cx + Math.abs(o.dx); }
    // Une étiquette ne doit pas traverser l'axe des ordonnées (ses graduations y vivent) :
    // si elle le ferait, on la centre au-dessus ou au-dessous du point.
    const axisX = xMin <= 0 && xMax >= 0 ? toX(0) : null;
    if (axisX !== null) {
      const left = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
      const right = left + w;
      if (left < axisX + 14 && right > axisX - 14 && Math.abs(cx - axisX) > 2) { anchor = 'middle'; x = cx; y = o.dy < 0 ? cy - 8 : cy + 14; }
    }
    // UN POINT POSÉ SUR UN AXE. Le cas de l'origine : le point est SUR l'axe,
    // donc le garde ci-dessus (« assez loin de l'axe ») ne le protégeait pas,
    // et son étiquette atterrissait dans la gouttière des graduations — « O »
    // par-dessus « −1 ». On la pousse alors du côté opposé aux nombres :
    // les graduations x vivent sous l'axe horizontal et les y à gauche du
    // vertical, donc en haut à droite il n'y a jamais personne.
    const axisY = yMin <= 0 && yMax >= 0 ? toY(0) : null;
    const onAxisX = axisX !== null && Math.abs(cx - axisX) <= 2;
    const onAxisY = axisY !== null && Math.abs(cy - axisY) <= 2;
    if (onAxisX || onAxisY) {
      // Assez près pour qu'on voie QUI est nommé, assez loin pour que la
      // pastille reste identifiable : on se cale sur le rayon du point.
      anchor = 'start';
      x = cx + S.DOT + 2;
      y = cy - S.DOT - 2;
      if (x + w > W) { anchor = 'end'; x = cx - S.DOT - 2; }
      if (y < 10) y = cy + S.DOT + 10;
    }
    if (anchor === 'middle') { x = Math.max(w / 2, Math.min(W - w / 2, x)); }
    if (y < 10) y = cy + 14;
    if (y > H + 10) y = cy - 6;
    return { x, y, anchor };
  };

  const pathsOf = (f) => {
    const n = f.samples ?? 160;
    const lo = f.domain ? Math.max(xMin, f.domain[0]) : xMin;
    const hi = f.domain ? Math.min(xMax, f.domain[1]) : xMax;
    const pieces = [];
    let cur = [];
    for (let i = 0; i <= n; i++) {
      const x = lo + (hi - lo) * i / n;
      const y = f.fn(x);
      const near = f.gapAt != null && Math.abs(x - f.gapAt) < (hi - lo) / n;
      if (!Number.isFinite(y) || near || y < yMin - rY || y > yMax + rY) {
        if (cur.length > 1) pieces.push(cur);
        cur = [];
        continue;
      }
      cur.push({ x: toX(x), y: toY(Math.max(yMin - rY, Math.min(yMax + rY, y))) });
    }
    if (cur.length > 1) pieces.push(cur);
    return pieces.map((pc) => pc.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
  };

  const offs = {
    tl: { dx: -6, dy: -6, anchor: 'end' }, tr: { dx: 6, dy: -6, anchor: 'start' },
    bl: { dx: -6, dy: 13, anchor: 'end' }, br: { dx: 6, dy: 13, anchor: 'start' },
    t: { dx: 0, dy: -8, anchor: 'middle' }, b: { dx: 0, dy: 14, anchor: 'middle' },
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: width }}
      aria-hidden="true" className={`select-none overflow-visible w-full h-auto ${className}`}>
      <defs>
        <clipPath id={`mg-clip-${width}-${height}`}><rect x="0" y="0" width={W} height={H} /></clipPath>
      </defs>
      <g transform={`translate(${pad.left},${pad.top})`}>
        {bands.map((b, i) => (
          <rect key={`b${i}`} x={toX(Math.max(xMin, b.from))} y={0}
            width={Math.max(0, toX(Math.min(xMax, b.to)) - toX(Math.max(xMin, b.from)))} height={H}
            fill={b.color ?? '#10b981'} opacity={b.opacity ?? 0.14} />
        ))}
        {showGrid && gxs.map((x) => (
          <line key={`gx${x}`} x1={toX(x)} y1={0} x2={toX(x)} y2={H} stroke="#e2e8f0" strokeWidth={S.HAIR} />
        ))}
        {showGrid && gys.map((y) => (
          <line key={`gy${y}`} x1={0} y1={toY(y)} x2={W} y2={toY(y)} stroke="#e2e8f0" strokeWidth={S.HAIR} />
        ))}
        {xMin <= 0 && xMax >= 0 && <line x1={toX(0)} y1={0} x2={toX(0)} y2={H} stroke="#94a3b8" strokeWidth={S.MARK} />}
        {yMin <= 0 && yMax >= 0 && <line x1={0} y1={toY(0)} x2={W} y2={toY(0)} stroke="#94a3b8" strokeWidth={S.MARK} />}
        {/* Graduations : le HALO leur donne leur propre espace. Une courbe
            passe forcément près des axes — sans plaque, « −1 » et « −2 » se
            lisaient à travers le tracé, et l'élève ne savait plus si le
            nombre nommait l'axe ou la courbe. Le halo blanc (paintOrder)
            découpe le fond du texte sans rien masquer d'utile : c'est la
            plaque d'étiquette, au coût d'un attribut. */}
        {gxs.filter((x) => x !== 0).map((x) => (
          <text key={`lx${x}`} x={toX(x)} y={(yMin <= 0 && yMax >= 0 ? toY(0) : H) + 12}
            textAnchor="middle" fontSize={S.LABEL} fill="#94a3b8"
            paintOrder="stroke" stroke="#fff" strokeWidth={S.HALO} strokeLinejoin="round">{fmt(x)}</text>
        ))}
        {gys.filter((y) => y !== 0).map((y) => {
          // Les étiquettes de l'axe des ORDONNÉES se posent à gauche de cet axe,
          // celles de l'axe des ABSCISSES 12 px sous lui : près de l'origine les
          // deux zones se rencontrent, et « −1 » (ordonnée) chevauchait « −2 »
          // (abscisse). On saute donc l'ordonnée dont la ligne croise la bande
          // des étiquettes d'abscisse — l'axe reste gradué partout ailleurs.
          const xAxisY = yMin <= 0 && yMax >= 0 ? toY(0) : H;
          if (Math.abs(toY(y) - (xAxisY + 12)) < S.LABEL) return null;
          return (
            <text key={`ly${y}`} x={(xMin <= 0 && xMax >= 0 ? toX(0) : 0) - 4} y={toY(y) + 3.5}
              textAnchor="end" fontSize={S.LABEL} fill="#94a3b8"
              paintOrder="stroke" stroke="#fff" strokeWidth={S.HALO} strokeLinejoin="round">{fmt(y)}</text>
          );
        })}
        {guides.map((g, i) => (g.x != null
          ? <line key={`gu${i}`} x1={toX(g.x)} y1={0} x2={toX(g.x)} y2={H} stroke={g.color ?? '#0284c7'} strokeWidth={S.MARK} strokeDasharray="4 3" />
          : <line key={`gu${i}`} x1={0} y1={toY(g.y)} x2={W} y2={toY(g.y)} stroke={g.color ?? '#059669'} strokeWidth={S.MARK} strokeDasharray="4 3" />))}
        <g clipPath={`url(#mg-clip-${width}-${height})`}>
          {functions.map((f, i) => pathsOf(f).map((d, j) => (
            <path key={`f${i}-${j}`} d={d} fill="none" stroke={f.color ?? '#4f46e5'} strokeWidth={f.width ?? 2.2}
              strokeDasharray={f.dashed ? '5 4' : undefined} strokeLinecap="round" strokeLinejoin="round" />
          )))}
        </g>
        {functions.filter((f) => f.label).map((f, i) => (
          // Interligne 15 et non 12 : à 12 px de pas pour une police de 12 px il
          // ne reste AUCUN blanc entre deux étiquettes, et trois courbes nommées
          // (x², 1/x, |x|) se chevauchaient deux à deux.
          <text key={`fl${i}`} x={W - 2} y={10 + i * 15} textAnchor="end" fontSize={S.LABEL} fontWeight="700" fill={f.color ?? '#4f46e5'}
            paintOrder="stroke" stroke="#fff" strokeWidth={S.HALO}>{f.label}</text>
        ))}
        {points.map((p, i) => {
          const cx = toX(p.x); const cy = toY(p.y);
          const color = p.color ?? '#0f172a';
          const o = offs[p.labelPos ?? 'tr'] ?? offs.tr;
          const lp = p.label ? placeLabel(cx, cy, o, p.label) : null;
          return (
            <g key={`p${i}`}>
              <circle cx={cx} cy={cy} r={S.DOT} fill={p.hollow ? '#fff' : color} stroke={color} strokeWidth={S.RULE} />
              {lp && (
                <text x={lp.x} y={lp.y} textAnchor={lp.anchor} fontSize={S.LABEL} fontWeight="700" fill={color}
                  paintOrder="stroke" stroke="#fff" strokeWidth={S.HALO} strokeLinejoin="round">{p.label}</text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
