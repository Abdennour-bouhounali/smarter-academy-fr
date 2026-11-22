import { pillWidth } from '../../primitives/SvgPill';

/**
 * LE MONDE DESSINÉ du labo `elevator-reel` (thème `mallElevator`) — SVG en code, paramétré, jamais une image générée (root CLAUDE.md).
 * Une coupe de centre commercial de Bab Ezzouar : neuf étages au-dessus de la rue (vitrines, un café avec son auvent), la ligne de la rue
 * « الطابق 0 », neuf niveaux de parking en dessous (piliers, voitures), le numéro signé PEINT sur le mur de chaque niveau, un ascenseur
 * de charge en verre dans son puits, et — à droite du puits — les flèches empilées de « r + r + … + r ». Le dessin EST l'argument :
 * la cabine est à l'échelle (un étage = une bande), au-dessus de la rue quand le temps est négatif et la vitesse aussi.
 * Tout est décor `aria-hidden` sauf la cabine et le numéro de l'étage (jamais une information que le texte n'a pas).
 */

const FONT = 'ui-sans-serif, system-ui, sans-serif';
const LTR = { direction: 'ltr', unicodeBidi: 'isolate' };
export const minus = (s) => String(s).replace(/-/g, '−');

function TowerDefs({ uid }) {
  return (
    <defs>
      <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#BAE6FD" />
        <stop offset="1" stopColor="#E0F2FE" />
      </linearGradient>
      <linearGradient id={`${uid}-under`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#D6C7AE" />
        <stop offset="1" stopColor="#B8A68A" />
      </linearGradient>
      <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#E0F2FE" stopOpacity="0.95" />
        <stop offset="1" stopColor="#7DD3FC" stopOpacity="0.85" />
      </linearGradient>
      <linearGradient id={`${uid}-knob`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FEF08A" />
        <stop offset="1" stopColor="#FACC15" />
      </linearGradient>
    </defs>
  );
}

/** Une voiture garée (niveau de parking) : carrosserie arrondie, vitres, deux roues. */
function Car({ x, y, w, h, color }) {
  return (
    <g>
      <rect x={x} y={y + h * 0.35} width={w} height={h * 0.45} rx={h * 0.16} fill={color} />
      <path d={`M${x + w * 0.2} ${y + h * 0.36} L${x + w * 0.3} ${y + h * 0.08} H${x + w * 0.7} L${x + w * 0.82} ${y + h * 0.36} Z`} fill={color} />
      <path d={`M${x + w * 0.3} ${y + h * 0.33} L${x + w * 0.36} ${y + h * 0.14} H${x + w * 0.64} L${x + w * 0.74} ${y + h * 0.33} Z`} fill="#E0F2FE" opacity={0.9} />
      <circle cx={x + w * 0.26} cy={y + h * 0.82} r={h * 0.12} fill="#334155" />
      <circle cx={x + w * 0.74} cy={y + h * 0.82} r={h * 0.12} fill="#334155" />
    </g>
  );
}

/** Le décor des niveaux : vitrines au-dessus de la rue, parking dessous. Un niveau = la bande [edge(f), edge(f) + fh]. */
function Backdrop({ uid, g }) {
  const { width, fh, bodyX, shaftX, edge, labelW } = g;
  const roomW = shaftX - bodyX - 6;
  const cars = ['#F43F5E', '#0EA5E9', '#F59E0B', '#8B5CF6', '#10B981'];
  const levels = [];
  for (let f = 9; f >= -9; f -= 1) {
    const y0 = edge(f);
    if (f > 0) {
      levels.push(
        <g key={f}>
          <rect x={bodyX} y={y0} width={shaftX + g.shaftW - bodyX + 2} height={fh} fill={f % 2 ? '#F8FAFC' : '#F1F5F9'} />
          <line x1={bodyX} x2={shaftX + g.shaftW + 2} y1={y0 + fh} y2={y0 + fh} stroke="#CBD5E1" strokeWidth={1} />
          {roomW > 36 && [0, 1].map((k) => (
            <rect key={k} x={bodyX + 6 + k * (roomW / 2)} y={y0 + fh * 0.2} width={roomW / 2 - 10} height={fh * 0.6} rx={3} fill="#BFDBFE" opacity={0.75} />
          ))}
          {f === 1 && <path d={`M${bodyX + 2} ${y0 + 4} h${roomW - 2} v${fh * 0.22} h-${roomW - 2} Z`} fill="#F59E0B" opacity={0.75} />}
        </g>,
      );
    } else if (f < 0) {
      levels.push(
        <g key={f}>
          <rect x={bodyX} y={y0} width={shaftX + g.shaftW - bodyX + 2} height={fh} fill="none" />
          <line x1={bodyX} x2={shaftX + g.shaftW + 2} y1={y0 + fh} y2={y0 + fh} stroke="#8B7B62" strokeWidth={1} opacity={0.7} />
          {f % 2 !== 0 && roomW > 36 && <Car x={bodyX + 8 + (Math.abs(f) % 3) * 6} y={y0 + fh * 0.12} w={Math.min(roomW - 22, fh * 2.2)} h={fh * 0.8} color={cars[Math.abs(f) % cars.length]} />}
          <rect x={bodyX + roomW - 6} y={y0} width={5} height={fh} fill="#A39275" opacity={0.8} />
        </g>,
      );
    }
  }
  return (
    <g aria-hidden="true">
      <rect x={0} y={0} width={width} height={edge(0) + fh / 2} fill={`url(#${uid}-sky)`} rx={14} />
      <rect x={0} y={g.streetY} width={width} height={g.H - g.streetY} fill={`url(#${uid}-under)`} />
      <rect x={bodyX} y={edge(9)} width={shaftX + g.shaftW + 2 - bodyX} height={edge(0) + fh / 2 - edge(9)} fill="#F8FAFC" stroke="#94A3B8" strokeWidth={1.5} />
      {levels}
      {/* le trottoir et la ligne de la rue */}
      <rect x={0} y={g.streetY - 3} width={width} height={6} fill="#64748B" />
      <rect x={0} y={g.streetY - 3} width={width} height={2} fill="#94A3B8" />
      {/* la colonne des numéros peints sur le mur (le signe est un vrai moins) */}
      <rect x={0} y={edge(9)} width={labelW} height={edge(-9) + fh - edge(9)} fill="#FFFFFF" opacity={0.55} />
      {Array.from({ length: 19 }, (_, i) => 9 - i).map((f) => (
        <text key={`n${f}`} x={labelW - 4} y={g.y(f) + fh * 0.18} textAnchor="end" fontSize={Math.max(10, Math.min(17, fh * 0.55))} fontWeight={f === 0 ? 900 : 700}
          fill={f === 0 ? '#1E1B4B' : f > 0 ? '#475569' : '#78350F'} fontFamily={FONT} style={LTR} data-er-level={f}>{minus(f)}</text>
      ))}
    </g>
  );
}

/** Le puits en verre et son câble ; la cabine, avec la flèche du sens et la vitesse SIGNÉE (« −2 ▼ », 2026-10-27). */
function Cabin({ uid, g, floor, r, glow }) {
  const cy = g.y(floor);
  const w = g.shaftW - 8;
  const h = g.fh - 4;
  const x = g.shaftX + 4;
  const dir = r > 0 ? 'up' : r < 0 ? 'down' : 'still';
  const tri = dir === 'up' ? `M${x + w * 0.2} ${cy + h * 0.2} l${h * 0.22} ${-h * 0.4} l${h * 0.22} ${h * 0.4} Z`
    : dir === 'down' ? `M${x + w * 0.2} ${cy - h * 0.2} l${h * 0.22} ${h * 0.4} l${h * 0.22} ${-h * 0.4} Z` : null;
  return (
    <g data-er-cabin data-floor={floor} data-sense={dir}>
      <line x1={x + w / 2} x2={x + w / 2} y1={g.top} y2={cy - h / 2} stroke="#475569" strokeWidth={1.6} />
      <rect x={x - 3} y={cy - h / 2 - 1} width={w + 6} height={h + 2} rx={5} fill="none" stroke={glow ? '#10B981' : 'none'} strokeWidth={4} opacity={glow ? 0.7 : 0} />
      <rect x={x} y={cy - h / 2} width={w} height={h} rx={4} fill={`url(#${uid}-glass)`} stroke="#0369A1" strokeWidth={2} />
      <line x1={x + w / 2} x2={x + w / 2} y1={cy - h / 2} y2={cy + h / 2} stroke="#0369A1" strokeWidth={1} opacity={0.5} />
      {tri && <path d={tri} fill={dir === 'up' ? '#059669' : '#E11D48'} />}
      <text x={x + w * 0.82} y={cy + h * 0.17} textAnchor="end" fontSize={Math.max(10, h * 0.55)} fontWeight={900} fill="#0C4A6E" fontFamily={FONT} style={LTR}>{minus(r)}</text>
    </g>
  );
}

/** Les flèches empilées : une par minute (r étages chacune), pleines au temps positif, pointillées (chemin restant) au temps négatif. */
function Arrows({ g, arrows }) {
  return (
    <g aria-hidden="true" data-er-arrows={arrows.length}>
      {arrows.map((a, i) => {
        const x = g.arrowX + (i % 2 ? 6 : -2);
        const y1 = g.y(a.from); const y2 = g.y(a.to);
        const up = y2 < y1;
        const color = i % 2 ? '#7C3AED' : '#4F46E5';
        const head = 6;
        return (
          <g key={i} data-er-arrow={i} data-dashed={a.dashed ? 'true' : 'false'} data-half={a.half ? 'true' : 'false'}>
            <line x1={x} x2={x} y1={y1} y2={y2 + (up ? head : -head)} stroke={color} strokeWidth={a.half ? 2.6 : 3.6} strokeLinecap="round" strokeDasharray={a.dashed ? '5 4' : undefined} />
            <path d={`M${x - head} ${y2 + (up ? head + 1 : -head - 1)} L${x} ${y2} L${x + head} ${y2 + (up ? head + 1 : -head - 1)} Z`} fill={color} />
          </g>
        );
      })}
    </g>
  );
}

/** « الطابق −6 » : une pilule dont le mot est arabe (RTL) et le nombre un îlot LTR — posée à gauche du puits, à la hauteur de la cabine. */
function FloorPill({ g, floor, word, value, glow }) {
  const size = Math.max(11, Math.min(17, g.fh * 0.5));
  const w = pillWidth(`${word} ${value}`, size) + 2;
  const h = Math.round(size * 1.9);
  const x1 = g.shaftX - 5;
  const x0 = Math.max(g.labelW + 2, x1 - w);
  const cy = g.y(floor);
  const fill = glow ? '#059669' : '#4F46E5';
  return (
    <g data-er-pill data-floor={value}>
      <rect x={x0} y={cy - h / 2 + 1.5} width={x1 - x0} height={h} rx={h / 2} fill="#1E1B4B" opacity={0.12} />
      <rect x={x0} y={cy - h / 2} width={x1 - x0} height={h} rx={h / 2} fill={fill} />
      <text x={(x0 + x1) / 2} y={cy + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={800} fill="#FFFFFF" fontFamily={FONT}
        style={{ direction: 'rtl', unicodeBidi: 'isolate' }}>{word} <tspan style={LTR}>{value}</tspan></text>
    </g>
  );
}

/**
 * La tour complète. `floor` (continu), `r`, `arrows`, `showArrows`, `glow` (la cabine est où il faut), `pill` (le texte « الطابق −6 »).
 */
export default function TowerArt({ uid, g, floor, r, arrows, showArrows, glow, pill, ariaLabel }) {
  return (
    <svg width="100%" viewBox={`0 0 ${g.width} ${g.H}`} style={{ maxWidth: g.width, display: 'block', margin: '0 auto' }} role="img" aria-label={ariaLabel} data-er-svg dir="ltr">
      <TowerDefs uid={uid} />
      <Backdrop uid={uid} g={g} />
      <g aria-hidden="true">
        <rect x={g.shaftX} y={g.top} width={g.shaftW} height={g.edge(-9) + g.fh - g.top} fill="#E2E8F0" opacity={0.7} />
        <line x1={g.shaftX} x2={g.shaftX} y1={g.top} y2={g.edge(-9) + g.fh} stroke="#64748B" strokeWidth={2} />
        <line x1={g.shaftX + g.shaftW} x2={g.shaftX + g.shaftW} y1={g.top} y2={g.edge(-9) + g.fh} stroke="#64748B" strokeWidth={2} />
      </g>
      {showArrows && <Arrows g={g} arrows={arrows} />}
      <Cabin uid={uid} g={g} floor={floor} r={r} glow={glow} />
      <FloorPill g={g} floor={floor} word={pill.word} value={pill.value} glow={glow} />
    </svg>
  );
}
