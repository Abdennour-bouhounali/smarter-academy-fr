import { textW, gaugeGeo, labelLines, CARD_FONT, KNOB_R, SMALL } from './geometry';

/**
 * LE MONDE DESSINÉ du labo `fourth-gauges` (thème `souk`) — SVG en code, paramétré, jamais une image générée (root CLAUDE.md).
 * Un auvent à rayures, un mur de lin, une planche de prix en bois (les quatre cartes, la carte qui manque en pointillés ambre), trois
 * (puis quatre) petites balances de laiton alignées dessous — le même langage que la balance du marchand posée en décor —, la règle du
 * marchand avec sa poignée de laiton, des cagettes (tomates, oranges, pommes de terre, dattes) et une guirlande de piments.
 * Toutes les positions viennent de `geo` (`geometry.js`) : le dessin EST l'argument, rien n'est placé « à l'œil » dans la vue.
 */
const LTR = { direction: 'ltr', unicodeBidi: 'isolate' };
const FONT = 'ui-sans-serif, system-ui, sans-serif';
const EASE = 'transform 190ms cubic-bezier(.3,1.35,.5,1)';

export function MarketDefs({ uid }) {
  return (
    <defs>
      <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFE9B8" />
        <stop offset="1" stopColor="#FFF6E2" />
      </linearGradient>
      <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#C98B4A" />
        <stop offset="1" stopColor="#A56A2F" />
      </linearGradient>
      <linearGradient id={`${uid}-counter`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#D9A15D" />
        <stop offset="1" stopColor="#B87933" />
      </linearGradient>
      <linearGradient id={`${uid}-brass`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FDE68A" />
        <stop offset="0.5" stopColor="#E9B63A" />
        <stop offset="1" stopColor="#B7791F" />
      </linearGradient>
      <radialGradient id={`${uid}-knob`} cx="0.38" cy="0.32" r="0.8">
        <stop offset="0" stopColor="#FFF7CC" />
        <stop offset="0.55" stopColor="#F5C842" />
        <stop offset="1" stopColor="#B7791F" />
      </radialGradient>
      <linearGradient id={`${uid}-cloth`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#6366F1" />
        <stop offset="1" stopColor="#3730A3" />
      </linearGradient>
      <pattern id={`${uid}-quilt`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="10" height="10" fill="none" />
        <path d="M0 0H10M0 0V10" stroke="#C7D2FE" strokeWidth="1" opacity="0.35" />
      </pattern>
      <clipPath id={`${uid}-clip`}><rect x={0} y={0} width="100%" height="100%" rx={18} /></clipPath>
    </defs>
  );
}

/** Le mur de lin, l'auvent à rayures (festons), la guirlande de piments, le comptoir de bois sous la règle. */
export function Backdrop({ uid, geo }) {
  const { W, H, aw, kidW, ruler } = geo;
  const stripe = Math.max(18, Math.round(W / 22));
  const stripes = [];
  for (let x = 0, i = 0; x < W; x += stripe, i += 1) {
    stripes.push(<rect key={i} x={x} y={0} width={stripe} height={aw} fill={i % 2 ? '#FFFFFF' : '#EF4444'} />);
    stripes.push(<path key={`s${i}`} d={`M${x} ${aw} q ${stripe / 2} ${aw * 0.55} ${stripe} 0 Z`} fill={i % 2 ? '#FFFFFF' : '#EF4444'} />);
  }
  const counterY = ruler.y0 - 2;
  const peppers = [0, 1, 2, 3, 4].map((i) => ({ y: aw + 18 + i * 17, dx: i % 2 ? 6 : -6, c: ['#DC2626', '#F97316', '#DC2626', '#16A34A', '#F97316'][i] }));
  return (
    <g aria-hidden="true">
      <g clipPath={`url(#${uid}-clip)`}>
        <rect x={0} y={0} width={W} height={H} fill={`url(#${uid}-wall)`} />
        {/* les lattes du mur */}
        {[0.22, 0.5, 0.78].map((f) => <line key={f} x1={W * f} x2={W * f} y1={aw} y2={counterY} stroke="#E9C987" strokeWidth={1.4} opacity={0.45} />)}
        <rect x={0} y={counterY} width={W} height={H - counterY} fill={`url(#${uid}-counter)`} />
        <rect x={0} y={counterY} width={W} height={4} fill="#F0C27B" />
        <rect x={0} y={counterY + 4} width={W} height={2} fill="#8A5A24" opacity={0.35} />
        {stripes}
        <rect x={0} y={aw + 11} width={W} height={3} fill="#1E1B4B" opacity={0.08} />
      </g>
      {/* la guirlande de piments dans le couloir de la cliente */}
      <g>
        <line x1={kidW / 2} x2={kidW / 2} y1={aw + 4} y2={peppers[4].y} stroke="#7C5A2E" strokeWidth={1.6} />
        {peppers.map((p, i) => (
          <g key={i} transform={`translate(${kidW / 2 + p.dx} ${p.y})`}>
            <path d="M0 -6 q 2 -4 5 -4" stroke="#15803D" strokeWidth={2} fill="none" strokeLinecap="round" />
            <path d="M-5 -6 q 5 -3 10 0 q -1 12 -5 15 q -4 -3 -5 -15 Z" fill={p.c} />
            <path d="M-2.5 -3 q 0.5 6 2 9" stroke="#FFFFFF" strokeWidth={1.2} fill="none" opacity={0.45} strokeLinecap="round" />
          </g>
        ))}
      </g>
    </g>
  );
}

/** Une cagette de bois avec ses fruits (tomates, oranges, pommes de terre, dattes). */
function Crate({ x, y, w = 40, kind = 'tomato' }) {
  const h = w * 0.62;
  const colors = { tomato: ['#EF4444', '#B91C1C'], orange: ['#FB923C', '#C2410C'], potato: ['#D6B38A', '#A07A4D'], date: ['#92400E', '#451A03'] }[kind];
  const r = w * 0.115;
  const fruit = [];
  for (let i = 0; i < 4; i += 1) fruit.push(<circle key={i} cx={x + w * (0.17 + i * 0.22)} cy={y + r * 0.2} r={r} fill={colors[0]} stroke={colors[1]} strokeWidth={1} />);
  for (let i = 0; i < 3; i += 1) fruit.push(<circle key={`b${i}`} cx={x + w * (0.28 + i * 0.22)} cy={y - r * 0.6} r={r} fill={colors[0]} stroke={colors[1]} strokeWidth={1} />);
  return (
    <g aria-hidden="true">
      {fruit}
      <rect x={x} y={y} width={w} height={h} rx={3} fill="#C98B4A" stroke="#7C4A1D" strokeWidth={1.4} />
      <line x1={x + 2} x2={x + w - 2} y1={y + h * 0.36} y2={y + h * 0.36} stroke="#7C4A1D" strokeWidth={1} opacity={0.6} />
      <line x1={x + 2} x2={x + w - 2} y1={y + h * 0.68} y2={y + h * 0.68} stroke="#7C4A1D" strokeWidth={1} opacity={0.6} />
    </g>
  );
}

/** La balance de marchand, de laiton, à deux plateaux : un décor (les trois balances d'égalité en sont les petites sœurs). */
function MerchantScale({ x, y, s = 1, uid }) {
  return (
    <g aria-hidden="true" transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-3} y={-32} width={6} height={44} rx={3} fill={`url(#${uid}-brass)`} />
      <rect x={-13} y={10} width={26} height={6} rx={3} fill="#B7791F" />
      <g transform="rotate(-4 0 -30)">
        <rect x={-24} y={-33} width={48} height={5} rx={2.5} fill="#E9B63A" stroke="#B7791F" strokeWidth={1} />
        {[-22, 22].map((dx) => (
          <g key={dx}>
            <line x1={dx} x2={dx - 9} y1={-30} y2={-6} stroke="#B7791F" strokeWidth={1.2} />
            <line x1={dx} x2={dx + 9} y1={-30} y2={-6} stroke="#B7791F" strokeWidth={1.2} />
            <path d={`M${dx - 11} -6 h22 q -1 8 -11 8 q -10 0 -11 -8 Z`} fill="#F5C842" stroke="#B7791F" strokeWidth={1} />
          </g>
        ))}
      </g>
      <circle cx={0} cy={-31} r={3.6} fill="#FDE68A" stroke="#B7791F" strokeWidth={1.2} />
    </g>
  );
}

/** Le décor de droite (scène large) et les cagettes du couloir de la cliente. */
export function Decor({ geo, uid }) {
  const { W, H, decorR, kidW, kid } = geo;
  const crates = [];
  if (decorR) {
    const x0 = W - decorR - 2;
    crates.push(<Crate key="c1" x={x0 + 6} y={H - 38} w={46} kind="tomato" />);
    crates.push(<Crate key="c2" x={x0 + 10} y={H - 66} w={40} kind="orange" />);
  }
  return (
    <g aria-hidden="true">
      {decorR > 0 && <MerchantScale uid={uid} x={W - decorR / 2 - 2} y={geo.board.y0 + 50} s={0.78} />}
      {crates}
      <Crate x={kidW - 30} y={kid.foot - 18} w={28} kind="date" />
      <Crate x={2} y={kid.top - 18 > geo.aw + 90 ? kid.top - 18 : geo.aw + 98} w={Math.min(36, kidW - 8)} kind="potato" />
    </g>
  );
}

/** Une carte de la planche : papier crème sur bois ; la carte qui manque est ambre, en pointillés, avec sa lueur. */
export function PriceCard({ cell, k, value, hole, lit, children, ...rest }) {
  const w = cell.x1 - cell.x0; const h = cell.y1 - cell.y0;
  const size = value.length > 6 ? 16 : value.length > 4 ? 19 : CARD_FONT;
  return (
    <g data-fg-cell={k} data-hole={hole ? 'true' : 'false'} data-value={value} {...rest}>
      <rect x={cell.x0} y={cell.y0 + 2.5} width={w} height={h} rx={9} fill="#1E1B4B" opacity={0.16} />
      {hole && <rect x={cell.x0 - 4} y={cell.y0 - 4} width={w + 8} height={h + 8} rx={13} fill={lit ? '#34D399' : '#FBBF24'} opacity={lit ? 0.45 : 0.32} />}
      <rect x={cell.x0} y={cell.y0} width={w} height={h} rx={9} fill={hole ? '#FEF3C7' : '#FFFBEF'}
        stroke={hole ? (lit ? '#059669' : '#D97706') : '#C08A3E'} strokeWidth={hole ? 2.6 : 1.8} strokeDasharray={hole && !lit ? '6 4' : undefined} />
      <circle cx={cell.x0 + 7} cy={cell.y0 + 7} r={2.2} fill="#9A6B2B" opacity={0.7} />
      <circle cx={cell.x1 - 7} cy={cell.y0 + 7} r={2.2} fill="#9A6B2B" opacity={0.7} />
      <text x={cell.cx} y={cell.cy + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={900} fill={hole ? '#92400E' : '#1F2937'} fontFamily={FONT}
        style={LTR} textLength={textW(value, size) > w - 12 ? w - 12 : undefined} lengthAdjust="spacingAndGlyphs">{value}</text>
      {children}
    </g>
  );
}

/** La planche : bois, deux cordes, et les noms des lignes (nom en haut, unité en dessous) à droite. */
export function Board({ geo, rows, uid }) {
  const { board, rows: rowBoxes, lw } = geo;
  const maxLines = Math.max(6, Math.floor(lw / 6.4));
  return (
    <g aria-hidden="true">
      <rect x={board.x0 + 6} y={board.y0 - 5} width={2.4} height={9} fill="#7C5A2E" />
      <rect x={board.x1 - 8} y={board.y0 - 5} width={2.4} height={9} fill="#7C5A2E" />
      <rect x={board.x0} y={board.y0 + 3} width={board.x1 - board.x0} height={board.y1 - board.y0} rx={14} fill="#1E1B4B" opacity={0.18} />
      <rect x={board.x0} y={board.y0} width={board.x1 - board.x0} height={board.y1 - board.y0} rx={14} fill={`url(#${uid}-wood)`} stroke="#7C4A1D" strokeWidth={2} />
      <rect x={board.x0 + 4} y={board.y0 + 3} width={board.x1 - board.x0 - 8} height={5} rx={2.5} fill="#E7B877" opacity={0.55} />
      {rows.map((label, i) => {
        const r = rowBoxes[i];
        const { lines, unit } = labelLines(label, maxLines);
        const all = unit ? [...lines, unit] : lines;
        const lh = 13;
        const y0 = r.y0 + (r.y1 - r.y0 - all.length * lh) / 2;
        return (
          <g key={i} data-fg-row={i}>
            <rect x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0} rx={9} fill="#7C4A1D" opacity={0.55} />
            {all.map((ln, j) => {
              const isUnit = unit && j === all.length - 1;
              return (
                <text key={j} x={(r.x0 + r.x1) / 2} y={y0 + j * lh + 10.5} textAnchor="middle" fontSize={isUnit ? 11 : 12} fontWeight={isUnit ? 800 : 900}
                  fill="#FFF7E0" fontFamily={FONT} style={isUnit ? LTR : { direction: 'rtl', unicodeBidi: 'isolate' }}>{ln}</text>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

const lampColor = (state, lit) => (state === 'covered' ? '#475569' : lit ? '#34D399' : '#CBD5E1');

/**
 * Une petite balance d'égalité de laiton. `deg` > 0 : le côté droit descend ; < 0 : le gauche. Le fléau tourne, les plateaux restent
 * à l'horizontale (ils se translatent aux bouts du fléau), un disque de laiton posé sur chaque plateau est dessiné à l'échelle de sa
 * valeur. Voilée : un tissu matelassé cache le fléau (la lampe et le nom restent visibles).
 */
export function Gauge({ uid, geo, slot, id, name, state, deg, leftText, rightText, capL, capR, open, discL, discR, onToggle, ariaLabel, ...rest }) {
  const covered = state === 'covered';
  const lit = state === 'eq';
  const gg = gaugeGeo(geo, slot, deg);
  const base = gaugeGeo(geo, slot, 0);
  const { bl, lampY, pivotY, baseY } = gg;
  const cx = slot.cx;
  const showCap = open || geo.roomy;
  const dim = state === 'off';
  const chipW = (t) => Math.min(textW(t, 12) + 10, gg.chipW);
  const pan = (end, rest0, d, key) => (
    <g key={key} style={{ transform: `translate(${end.x - rest0.x}px, ${end.y - rest0.y}px)`, transition: EASE }}>
      <line x1={rest0.x} y1={pivotY} x2={rest0.x - 11} y2={pivotY + gg.dishDrop} stroke="#B7791F" strokeWidth={1.3} />
      <line x1={rest0.x} y1={pivotY} x2={rest0.x + 11} y2={pivotY + gg.dishDrop} stroke="#B7791F" strokeWidth={1.3} />
      <circle cx={rest0.x} cy={pivotY + gg.dishDrop - 4 - d} r={d} fill={`url(#${uid}-knob)`} stroke="#B7791F" strokeWidth={1} opacity={dim ? 0.35 : 1} />
      <path d={`M${rest0.x - 13} ${pivotY + gg.dishDrop} h26 q -2 7 -13 7 q -11 0 -13 -7 Z`} fill={`url(#${uid}-brass)`} stroke="#92651A" strokeWidth={1.1} />
    </g>
  );
  const restL = { x: cx - bl, y: pivotY }; const restR = { x: cx + bl, y: pivotY };
  return (
    <g className="fg-anim" data-fg-gauge={id} data-state={covered ? 'covered' : state} data-open={open ? 'true' : 'false'} data-tilt={Math.round(deg)} {...rest}>
      <rect x={slot.x0 + 2} y={slot.y0 + 2} width={slot.gw - 4} height={slot.y1 - slot.y0 - 2} rx={12} fill="#FFFBEF" opacity={lit ? 0.9 : 0.62} stroke={lit ? '#10B981' : '#E7C99A'} strokeWidth={lit ? 2 : 1.2} />
      <circle cx={cx} cy={lampY} r={6.2} fill={lampColor(state, lit)} stroke={lit ? '#047857' : '#94A3B8'} strokeWidth={1.2} data-fg-lamp data-lit={lit ? 'true' : 'false'}
        style={lit ? { filter: 'drop-shadow(0 0 5px rgba(52,211,153,0.95))' } : undefined} />
      {/* le socle et le montant */}
      <rect x={cx - 3} y={pivotY} width={6} height={baseY - pivotY} rx={3} fill={`url(#${uid}-brass)`} stroke="#92651A" strokeWidth={0.9} />
      <rect x={cx - 21} y={baseY - 1} width={42} height={7} rx={3.5} fill={`url(#${uid}-brass)`} stroke="#92651A" strokeWidth={1} />
      {/* le fléau */}
      <g style={{ transformOrigin: `${cx}px ${pivotY}px`, transform: `rotate(${deg}deg)`, transition: EASE }} opacity={dim ? 0.45 : 1}>
        <rect x={cx - bl - 4} y={pivotY - 3} width={2 * bl + 8} height={6} rx={3} fill={`url(#${uid}-brass)`} stroke="#92651A" strokeWidth={1.1} />
      </g>
      <circle cx={cx} cy={pivotY} r={4.4} fill="#FDE68A" stroke="#92651A" strokeWidth={1.2} />
      {pan(gg.left, restL, discL, 'l')}
      {pan(gg.right, restR, discR, 'r')}
      {/* le tissu : balance voilée */}
      <g style={{ opacity: covered ? 1 : 0, transition: 'opacity 160ms', pointerEvents: 'none' }} data-fg-cover={covered ? 'true' : 'false'}>
        <path d={`M${slot.x0 + 5} ${lampY + 10} h${slot.gw - 10} v${baseY - lampY - 2} q ${-(slot.gw - 10) / 4} 6 ${-(slot.gw - 10) / 2} 0 q ${-(slot.gw - 10) / 4} -6 ${-(slot.gw - 10) / 2} 0 Z`} fill={`url(#${uid}-cloth)`} stroke="#312E81" strokeWidth={1.4} />
        <path d={`M${slot.x0 + 5} ${lampY + 10} h${slot.gw - 10} v${baseY - lampY - 2} q ${-(slot.gw - 10) / 4} 6 ${-(slot.gw - 10) / 2} 0 q ${-(slot.gw - 10) / 4} -6 ${-(slot.gw - 10) / 2} 0 Z`} fill={`url(#${uid}-quilt)`} />
        <text x={cx} y={(lampY + baseY) / 2 + 14} textAnchor="middle" fontSize={26} fontWeight={900} fill="#E0E7FF" fontFamily={FONT}>؟</text>
      </g>
      {/* les deux nombres */}
      {[[leftText, cx - slot.gw / 4, 'L'], [rightText, cx + slot.gw / 4, 'R']].map(([t, x, side]) => {
        const text = covered ? '؟' : t;
        const w = chipW(text);
        return (
          <g key={side} data-fg-chip={side}>
            <rect x={x - w / 2} y={base.chipY} width={w} height={base.chipH} rx={base.chipH / 2} fill={covered ? '#E0E7FF' : lit ? '#D1FAE5' : '#FFFFFF'} stroke={covered ? '#A5B4FC' : lit ? '#10B981' : '#D6B27A'} strokeWidth={1.4} />
            <text x={x} y={base.chipY + base.chipH / 2 + 4.4} textAnchor="middle" fontSize={12} fontWeight={800} fill={covered ? '#4338CA' : '#1F2937'} fontFamily={FONT} style={LTR}
              textLength={textW(text, 12) > w - 8 ? w - 8 : undefined} lengthAdjust="spacingAndGlyphs">{text}</text>
          </g>
        );
      })}
      {showCap && !covered && [[capL, cx - slot.gw / 4], [capR, cx + slot.gw / 4]].map(([t, x], i) => (
        <text key={i} x={x} y={base.capY + 10} textAnchor="middle" fontSize={geo.compact ? 10 : SMALL} fontWeight={700} fill="#6B4A1E" fontFamily={FONT} style={LTR}
          textLength={textW(t, geo.compact ? 10 : SMALL) > slot.gw / 2 - 3 ? slot.gw / 2 - 3 : undefined} lengthAdjust="spacingAndGlyphs">{t}</text>
      ))}
      <text x={cx} y={base.nameY + 11} textAnchor="middle" fontSize={12} fontWeight={900} fill="#5B3A12" fontFamily={FONT} style={{ direction: 'rtl', unicodeBidi: 'isolate' }}
        textLength={textW(name, 12) > slot.gw - 4 ? slot.gw - 4 : undefined} lengthAdjust="spacingAndGlyphs">{name}</text>
      {/* toute la balance se touche : elle s'ouvre (ses deux nombres s'écrivent) */}
      <rect x={slot.x0} y={slot.y0} width={slot.gw} height={slot.y1 - slot.y0} fill="transparent" role="button" tabIndex={0} aria-pressed={open} aria-label={ariaLabel}
        data-fg-gauge-hit={id} style={{ cursor: 'pointer', outline: 'none' }} onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }} />
    </g>
  );
}

/** La règle du marchand : une tige de bois et de laiton, dix graduations égales (aucune ne marque la réponse), 0 et la borne. */
export function Ruler({ geo, uid, maxText, active, fillX }) {
  const { tx0, tx1, trackY } = geo.ruler;
  const ticks = [];
  for (let i = 0; i <= 10; i += 1) {
    const x = tx0 + ((tx1 - tx0) * i) / 10;
    ticks.push(<line key={i} x1={x} x2={x} y1={trackY - 7} y2={trackY + (i % 5 === 0 ? 9 : 5)} stroke="#5B3A12" strokeWidth={i % 5 === 0 ? 2.2 : 1.4} strokeLinecap="round" />);
  }
  return (
    <g aria-hidden="true">
      <rect x={tx0 - 16} y={trackY - 9} width={tx1 - tx0 + 32} height={20} rx={6} fill="#1E1B4B" opacity={0.18} transform="translate(0 2.5)" />
      <rect x={tx0 - 16} y={trackY - 9} width={tx1 - tx0 + 32} height={20} rx={6} fill="#F8E3B0" stroke="#92651A" strokeWidth={1.8} />
      <rect x={tx0 - 16} y={trackY - 9} width={9} height={20} rx={4} fill={`url(#${uid}-brass)`} stroke="#92651A" strokeWidth={1} />
      <rect x={tx1 + 7} y={trackY - 9} width={9} height={20} rx={4} fill={`url(#${uid}-brass)`} stroke="#92651A" strokeWidth={1} />
      {ticks}
      <rect x={tx0} y={trackY - 1.5} width={Math.max(0, fillX - tx0)} height={3} rx={1.5} fill="#D97706" opacity={active ? 0.9 : 0.55} />
      <text x={tx0} y={trackY + KNOB_R + 12} textAnchor="middle" fontSize={SMALL} fontWeight={800} fill="#5B3A12" fontFamily={FONT} style={LTR}>0</text>
      <text x={tx1} y={trackY + KNOB_R + 12} textAnchor="middle" fontSize={SMALL} fontWeight={800} fill="#5B3A12" fontFamily={FONT} style={LTR}>{maxText}</text>
    </g>
  );
}

/** La poignée de laiton du nombre qui manque : un anneau de 44 px (la prise), une pastille de laiton, des stries. */
export function Knob({ uid, x, y, active, lit, knobProps }) {
  return (
    <g {...knobProps} transform={`translate(${x} ${y})`} data-fg-knob data-active={active ? 'true' : 'false'}>
      <circle r={KNOB_R} fill="transparent" />
      <circle r={KNOB_R - 3} fill={lit ? '#34D399' : '#FBBF24'} opacity={active ? 0.5 : 0.28} />
      <g style={{ transform: active ? 'scale(1.14)' : 'scale(1)', transition: 'transform 140ms' }}>
        <ellipse cx={0} cy={17} rx={11} ry={3.4} fill="#1E1B4B" opacity={0.22} />
        <circle r={14.5} fill={`url(#${uid}-knob)`} stroke="#92651A" strokeWidth={1.8} />
        <circle r={9} fill="none" stroke="#92651A" strokeWidth={1.2} opacity={0.6} />
        {[-4, 0, 4].map((dx) => <line key={dx} x1={dx} x2={dx} y1={-5} y2={5} stroke="#92651A" strokeWidth={1.4} strokeLinecap="round" />)}
        <path d="M-5 -19 L0 -25 L5 -19 Z" fill={lit ? '#059669' : '#D97706'} stroke="#92651A" strokeWidth={0.9} strokeLinejoin="round" />
      </g>
    </g>
  );
}
