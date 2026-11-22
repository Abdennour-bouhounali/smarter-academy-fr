import KidFigure from '../../primitives/KidFigure';
import * as L from '../../logic/seedRake';
import { W, BED_X, BED_W, ROWS, RAKE, BRACKET_Y, ZONE_COLORS, HARVEST, segments, cellBox, wholeCells, straddled, borderOf, toNum, toothX, sceneH } from './seedArt';

/**
 * LE حوض غرس DE LA CLUB D'ENVIRONNEMENT (thème `seedbed`) — la scène SVG de `seed-rake`, dessinée en code, jamais générée. Tout y est HONNÊTE :
 *  - le حوض fait 1 m (`BED_W` unités) avec une règle en bois (0 … 1 m) ; les zones sont peintes à partir de la gauche, chacune avec sa pancarte (sa fraction) ;
 *  - le râteau a N + 1 dents espacées de 1/N m exactement ; ses ombres tombent sur la terre ; le plant occupe une case de terre de largeur 1/N ;
 *  - un espacement qui ne convient pas laisse UNE case à cheval sur une frontière : un plant flétri, coupé par la frontière, contour rouge ; rien n'est compté ;
 *  - la longueur plantée est une accolade sur la règle ; au-delà de 1 m un second حوض glisse DESSOUS ; en mode libre l'accolade pointillée est la prédiction de l'élève.
 * Repère de conception : 470 × 168 (232 avec le second حوض), mis à l'échelle par le parent.
 */
export const CSS = `
@keyframes sr-grow { 0% { transform: scaleY(0.2); opacity: 0; } 100% { transform: scaleY(1); opacity: 1; } }
.sr-plant { animation: sr-grow 260ms ease-out both; transform-box: fill-box; transform-origin: 50% 100%; }
@keyframes sr-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
.sr-wilt { animation: sr-shake 380ms ease-in-out 1; }
@keyframes sr-pulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
.sr-pulse { animation: sr-pulse 1.2s ease-in-out infinite; }
.sr-grab { outline: none; }
.sr-grab:focus-visible .sr-grab-ring { stroke: #4F46E5; stroke-width: 4; opacity: 1; }
@media (prefers-reduced-motion: reduce) { .sr-plant, .sr-wilt, .sr-pulse { animation: none !important; } }
`;

const WOOD = '#B45309';
const WOOD_DARK = '#78350F';

/** Un plant (deux feuilles et une tige) dans la case `b` : un point en dessous de 30 cases par mètre ; `wilted` : penché, brun. */
function Plant({ b, rowTop, rowH, color, wilted, faded, dot, delay = 0 }) {
  const cx = b.x + b.w / 2;
  const base = rowTop + rowH - 3;
  if (dot) return <circle className="sr-plant" cx={cx} cy={base - Math.min(b.w * 0.35, 4)} r={Math.min(b.w * 0.32, 3.2)} fill={wilted ? '#92400E' : color} opacity={faded ? 0.3 : 1} data-sr-plant style={{ animationDelay: `${delay}ms` }} />;
  const sz = Math.min(b.w * 0.5, rowH * 0.42, 16);
  const lean = wilted ? 0.55 : 0;
  return (
    <g className={wilted ? 'sr-wilt' : 'sr-plant'} data-sr-plant data-wilted={wilted ? 'true' : 'false'} opacity={faded ? 0.3 : 1} style={{ animationDelay: `${delay}ms` }}>
      <path d={`M${cx} ${base} Q${cx + lean * sz * 1.4} ${base - sz * 1.1} ${cx + lean * sz * 2} ${base - sz * 1.7}`} fill="none" stroke={wilted ? '#92400E' : '#166534'} strokeWidth={Math.max(1.3, sz * 0.14)} strokeLinecap="round" />
      <ellipse cx={cx - sz * 0.55 + lean * sz} cy={base - sz * 1.55} rx={sz * 0.6} ry={sz * 0.3} transform={`rotate(${wilted ? 40 : -28} ${cx - sz * 0.55 + lean * sz} ${base - sz * 1.55})`} fill={wilted ? '#A16207' : color} />
      <ellipse cx={cx + sz * 0.55 + lean * sz * 1.6} cy={base - sz * 1.55} rx={sz * 0.6} ry={sz * 0.3} transform={`rotate(${wilted ? 70 : 28} ${cx + sz * 0.55 + lean * sz * 1.6} ${base - sz * 1.55})`} fill={wilted ? '#92400E' : color} />
    </g>
  );
}

export default function SeedScene({ lab, k, uid, scale, mood, grabProps, svgRef }) {
  const t = L.taskOf(lab);
  const free = L.isFree(lab);
  const done = L.taskDone(lab);
  const N = lab.N;
  const pl = lab.planted;
  const shown = !!pl;
  const showTeeth = true;
  const locked = !L.canRake(lab);
  const colorOf = (i, z) => (z.sub ? HARVEST : ZONE_COLORS[i % 3]);
  const over = t.over && (shown ? pl.ok : !t.veil);
  const rowsUsed = over ? 2 : 1;
  const teeth = Array.from({ length: N + 1 }, (_, i) => BED_X + (i * BED_W) / N);
  const rowBox = (row) => ROWS[row];
  const dot = N > 30;

  /* les zones : rectangles teintés + pancartes ; les plants ; la frontière fautive */
  const zoneRects = [];
  t.zones.forEach((z, zi) => {
    const col = colorOf(zi, z);
    const from = toNum(z.from); const to = toNum(z.to);
    segments(from, to).forEach((sg, si) => {
      if (sg.row >= rowsUsed && !(sg.row === 1 && over)) return;
      const R = rowBox(sg.row);
      zoneRects.push(
        <g key={`z${zi}-${si}`} data-sr-zone={zi}>
          <rect x={sg.x0} y={R.y} width={sg.x1 - sg.x0} height={R.h} fill={col.fill} opacity={z.sub ? 0.4 : 0.5} />
          {z.sub && <rect x={sg.x0} y={R.y} width={sg.x1 - sg.x0} height={R.h} fill="none" stroke={col.dark} strokeWidth={1.6} strokeDasharray="5 3" />}
        </g>,
      );
    });
  });
  const signs = t.zones.map((z, zi) => {
    const col = colorOf(zi, z);
    const seg = segments(toNum(z.from), toNum(z.to))[0];
    if (!seg) return null;
    const R = rowBox(seg.row);
    const label = t.terms[zi].p;
    const wBox = Math.max(30, Math.min(seg.x1 - seg.x0 - 6, 54));
    const cx = seg.x0 + (seg.x1 - seg.x0) / 2;
    return (
      <g key={`sg${zi}`} data-sr-sign={zi} aria-hidden="true">
        <rect x={cx - wBox / 2} y={R.y - 14} width={wBox} height={15} rx={5} fill="#FFFFFF" stroke={col.dark} strokeWidth={1.6} />
        <text x={cx} y={R.y - 2.6} textAnchor="middle" fontSize={12} fontWeight={900} fill={col.dark} style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{z.sub ? `−${label}` : label}</text>
      </g>
    );
  });

  const plants = [];
  const wilts = [];
  let borderLine = null;
  if (shown) {
    const info = pl.ok ? null : borderOf(t, pl.borderAt);
    const bad = pl.ok ? [] : straddled(t.zones.flatMap((z) => [z.from, z.to]), N);
    t.zones.forEach((z, zi) => {
      if (z.sub && !pl.ok) return;
      wholeCells(z.sub ? z.from : z.from, z.to, N).forEach((c, ci) => {
        const b = cellBox(c, N);
        if (b.row >= rowsUsed && !(b.row === 1 && over)) return;
        const R = rowBox(b.row);
        plants.push(<Plant key={`p${zi}-${c}`} b={b} rowTop={R.y} rowH={R.h} color={z.sub ? '#B45309' : '#16A34A'} faded={z.sub} dot={dot} delay={Math.min(ci * 22, 260)} />);
      });
    });
    bad.forEach((c) => {
      const b = cellBox(c, N);
      const R = rowBox(Math.min(1, b.row));
      wilts.push(
        <g key={`w${c}`} data-sr-wilt aria-hidden="true">
          <rect x={b.x} y={R.y} width={b.w} height={R.h} fill="#FEE2E2" opacity={0.85} />
          <rect x={b.x} y={R.y} width={b.w} height={R.h} fill="none" stroke="#DC2626" strokeWidth={2} />
          <Plant b={b} rowTop={R.y} rowH={R.h} color="#A16207" wilted dot={dot} />
        </g>,
      );
    });
    if (info) {
      const px = BED_X + toNum(info.pos) * BED_W;
      const bx = px > BED_X + BED_W ? px - BED_W : px;
      const row = toNum(info.pos) > 1 ? 1 : 0;
      borderLine = <line x1={bx} x2={bx} y1={rowBox(row).y - 4} y2={rowBox(row).y + rowBox(row).h + 4} stroke="#DC2626" strokeWidth={2.4} strokeDasharray="4 3" data-sr-borderline />;
    }
  }

  /* les cases de terre (quadrillage fin) */
  const soilLines = Array.from({ length: Math.max(0, Math.min(N, 60)) + 1 }, (_, i) => BED_X + (i * BED_W) / N);

  /* l'accolade de la longueur plantée */
  const netTo = shown && pl.ok ? toNum(pl.total) : null;
  const brackets = [];
  const bracket = (x0, x1, y, key, color, dashed, label) => (
    <g key={key} data-sr-bracket={key}>
      <path d={`M${x0} ${y - 5} L${x0} ${y} L${x1} ${y} L${x1} ${y - 5}`} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? '6 4' : undefined} />
      {label && (
        <g>
          <rect x={(x0 + x1) / 2 - 30} y={y + 2} width={60} height={15} rx={7} fill="#FFFFFF" stroke={color} strokeWidth={1.4} />
          <text x={(x0 + x1) / 2} y={y + 13} textAnchor="middle" fontSize={11} fontWeight={900} fill={color} style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{label}</text>
        </g>
      )}
    </g>
  );
  const RULER_Y = ROWS[0].y + ROWS[0].h + 2;
  if (netTo != null) {
    const a = Math.min(netTo, 1);
    brackets.push(bracket(BED_X, BED_X + a * BED_W, BRACKET_Y.real, 'real', '#4338CA', false, netTo <= 1 ? `${pl.totalText} ${k('unit.m')}` : null));
    if (netTo > 1) brackets.push(bracket(BED_X, BED_X + (netTo - 1) * BED_W, BRACKET_Y.real2, 'real2', '#4338CA', false, `${pl.totalText} ${k('unit.m')}`));
  }
  const pred = free ? L.freePrediction(lab) : null;
  if (pred) {
    const r = Math.min(pred.ratio, 1);
    brackets.push(bracket(BED_X, BED_X + r * BED_W, over ? BRACKET_Y.pred2 : BRACKET_Y.pred, 'pred', '#EA580C', true, pred.ratio > 1 ? `${pred.text} ${k('unit.m')} ›` : `${pred.text} ${k('unit.m')}`));
  }

  const H = sceneH(over, !!pred);
  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width={W * scale} height={H * scale} role="img" aria-label={k('scene.aria')} data-sr-svg data-n={N} style={{ display: 'block', margin: '0 auto' }}>
      <defs>
        <linearGradient id={`${uid}-ground`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ECFCCB" /><stop offset="1" stopColor="#BEF264" /></linearGradient>
        <linearGradient id={`${uid}-soil`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8B5A2B" /><stop offset="1" stopColor="#6B4423" /></linearGradient>
      </defs>
      <rect x={0} y={H - 14} width={W} height={14} fill={`url(#${uid}-ground)`} />

      {/* le râteau : une barre, N + 1 dents, la poignée, la zone de saisie */}
      <g data-sr-rake-art opacity={locked && !done ? 0.55 : 1}>
        <rect x={BED_X - 10} y={RAKE.y} width={BED_W + 20} height={RAKE.h} rx={7} fill={WOOD} stroke={WOOD_DARK} strokeWidth={2} />
        {showTeeth && teeth.map((x, i) => (
          <line key={i} x1={x} x2={x} y1={RAKE.toothTop} y2={RAKE.toothBottom} stroke="#475569" strokeWidth={N > 40 ? 1.3 : 2.2} strokeLinecap="round" data-sr-tooth={i} />
        ))}
        {teeth.map((x, i) => <line key={`s${i}`} x1={x} x2={x} y1={RAKE.toothBottom + 2} y2={ROWS[0].y + ROWS[0].h} stroke="#1E1B4B" strokeOpacity={N > 40 ? 0.12 : 0.2} strokeWidth={1} strokeDasharray="2 3" />)}
        <g data-sr-handle style={{ pointerEvents: 'none' }}>
          <circle cx={toothX(N)} cy={RAKE.y + RAKE.h / 2} r={11} fill="#FDE68A" stroke={WOOD_DARK} strokeWidth={2.4} />
          <path d={`M${toothX(N) - 5} ${RAKE.y + RAKE.h / 2} l-0 0 m0 0 h10 M${toothX(N) - 3} ${RAKE.y + RAKE.h / 2 - 4} l-3 4 l3 4 M${toothX(N) + 3} ${RAKE.y + RAKE.h / 2 - 4} l3 4 l-3 4`} fill="none" stroke={WOOD_DARK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {!locked && <rect className={!lab.touched ? 'sr-pulse sr-grab-ring' : 'sr-grab-ring'} x={BED_X - 10} y={RAKE.y - 2} width={BED_W + 20} height={RAKE.h + 4} rx={8} fill="none" stroke="#F59E0B" strokeWidth={3} strokeDasharray="6 5" opacity={!lab.touched ? 0.85 : 0} />}
        {locked && !done && (
          <g aria-hidden="true" transform={`translate(${BED_X + BED_W / 2} ${RAKE.y + RAKE.h / 2})`}>
            <rect x={-9} y={-3} width={18} height={12} rx={3} fill="#E2E8F0" stroke="#475569" strokeWidth={1.6} />
            <path d="M-5 -3 v-4 a5 5 0 0 1 10 0 v4" fill="none" stroke="#475569" strokeWidth={1.8} />
          </g>
        )}
      </g>
      <g className="sr-grab" data-sr-rake data-n={N} data-locked={locked ? 'true' : 'false'} {...grabProps}>
        <rect x={BED_X - 14} y={0} width={BED_W + 28} height={RAKE.toothBottom + 6} fill="transparent" style={{ cursor: locked ? 'not-allowed' : 'ew-resize' }} />
      </g>

      {/* le حوض : terre, quadrillage, zones, plants */}
      {[0, 1].slice(0, rowsUsed).map((row) => (
        <g key={`bed${row}`} data-sr-bed={row}>
          <rect x={BED_X} y={ROWS[row].y} width={BED_W} height={ROWS[row].h} rx={5} fill={`url(#${uid}-soil)`} stroke="#3F2310" strokeWidth={2.2} />
          {soilLines.map((x, i) => <line key={i} x1={x} x2={x} y1={ROWS[row].y} y2={ROWS[row].y + ROWS[row].h} stroke="#FFFFFF" strokeOpacity={N > 40 ? 0.1 : 0.2} strokeWidth={0.8} />)}
        </g>
      ))}
      {zoneRects}
      {plants}
      {wilts}
      {borderLine}
      {signs}

      {/* la règle en bois : 0 … 1 m */}
      <g data-sr-ruler aria-hidden="true">
        <rect x={BED_X} y={RULER_Y} width={BED_W} height={11} rx={3} fill="#FDE68A" stroke={WOOD_DARK} strokeWidth={1.6} />
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={BED_X + f * BED_W} x2={BED_X + f * BED_W} y1={RULER_Y} y2={RULER_Y + (f === 0 || f === 1 ? 11 : 7)} stroke={WOOD_DARK} strokeWidth={1.6} />
          </g>
        ))}
        <text x={BED_X} y={RULER_Y + 22} textAnchor="middle" fontSize={11} fontWeight={800} fill={WOOD_DARK}>0</text>
        <text x={BED_X + BED_W} y={RULER_Y + 22} textAnchor="end" fontSize={11} fontWeight={800} fill={WOOD_DARK} style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{`1 ${k('unit.m')}`}</text>
      </g>
      {over && <text x={BED_X + 2} y={ROWS[1].y - 5} fontSize={10} fontWeight={800} fill="#475569" data-sr-second>{k('scene.second')}</text>}
      {brackets}

      {/* Sara et son arrosoir */}
      <g data-sr-kid aria-hidden="true">
        <KidFigure cx={W - 30} top={H - 112} foot={H - 8} hairStyle="hijab" scarf="mint" outfit="green" skin="wheat" mood={mood} data-sr-sara data-mood={mood} />
        <g transform={`translate(${W - 11} ${H - 52}) rotate(${mood === 'proud' ? -16 : -4}) scale(0.62)`}>
          <path d="M-12 0 h18 l-2 14 h-14 z" fill="#38BDF8" stroke="#0369A1" strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M6 4 l11 -7" stroke="#0369A1" strokeWidth={2.6} strokeLinecap="round" />
          <path d="M-12 3 q-8 -3 -4 -11" fill="none" stroke="#0369A1" strokeWidth={2} />
        </g>
      </g>
    </svg>
  );
}
