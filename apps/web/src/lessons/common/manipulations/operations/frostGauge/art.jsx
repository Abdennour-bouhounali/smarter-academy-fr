import KidFigure from '../../primitives/KidFigure';

/**
 * Le décor de `frost-gauge` (« ميزان الصقيع », thème `winterdjelfa`) : une JAUGE VERTICALE et trois mondes qui portent le même niveau —
 *   `frost`     le thermomètre de la cour d'une école de Djelfa en hiver : un mur de pierre, la neige, une ligne de gel au 0, le liquide qui monte ou descend ;
 *   `altitude`  un appareil d'altitude : la mer au-dessous du 0 (le niveau de la mer), une colline au-dessus, un repère à pointe ;
 *   `floors`    les étages d'un immeuble d'Oran : l'ascenseur est la jauge, sa cabine est le niveau, le sous-sol est sous le 0.
 * Tout est SVG (jamais d'image raster) ; les NOMBRES viennent de la scène (aucun chiffre n'est écrit ici, sauf par les pastilles de lecture).
 * Les personnes sont toujours `KidFigure` (les filles en hijab).
 */
export const W = 640;
export const H = 300;
export const GX = 330;                 // l'axe de la jauge
const Y_TOP = 30;
const Y_BOT = 250;

export const COL = {
  sky: '#E0F2FE', skyDark: '#BAE6FD', snow: '#F8FAFC', snowShade: '#E2E8F0', stone: '#CBD5E1', stoneDark: '#94A3B8', ink: '#0F172A',
  hot: '#EF4444', cold: '#0EA5E9', zero: '#475569', sea: '#38BDF8', seaDark: '#0369A1', sand: '#FCE7A8', hill: '#86EFAC', hillDark: '#4ADE80',
  wall: '#E7D8C4', wallDark: '#B8A88F', basement: '#A8A29E', basementDark: '#78716C', cabin: '#FBBF24', cabinDark: '#B45309', amber: '#D97706',
  miss: '#E11D48', mirror: '#14B8A6', hatch: '#A5B4FC',
};

/** Le mappage d'une graduation vers y (la plus haute en haut). */
export const yOf = (g, grad) => Y_BOT - ((grad - g.gmin) * (Y_BOT - Y_TOP)) / (g.gmax - g.gmin);
export const gradAtY = (g, y) => Math.round(g.gmin + ((Y_BOT - y) * (g.gmax - g.gmin)) / (Y_BOT - Y_TOP));

/** Le ciel et l'arrière-plan commun (dégradé), plus le décor du monde. */
export function Backdrop({ uid, scene, g }) {
  const y0 = yOf(g, 0);
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.skyDark} /><stop offset="1" stopColor={COL.sky} /></linearGradient>
        <linearGradient id={`${uid}-sea`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.sea} /><stop offset="1" stopColor={COL.seaDark} /></linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#${uid}-sky)`} />
      {scene === 'frost' && <FrostWorld y0={y0} />}
      {scene === 'altitude' && <AltitudeWorld uid={uid} y0={y0} />}
      {scene === 'floors' && <FloorsWorld g={g} y0={y0} />}
    </g>
  );
}

function FrostWorld({ y0 }) {
  return (
    <g>
      {/* des collines blanches */}
      <path d="M0 220 Q90 150 180 205 T360 190 T560 200 T640 175 L640 330 L0 330 Z" fill={COL.snowShade} opacity={0.85} />
      <path d="M0 250 Q120 205 240 245 T470 238 T640 232 L640 330 L0 330 Z" fill={COL.snow} />
      {/* le mur de pierre de la cour qui porte le thermomètre */}
      <rect x={GX - 62} y={10} width={150} height={H - 26} rx={8} fill={COL.stone} stroke={COL.stoneDark} strokeWidth={2} />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={GX - 62} x2={GX + 88} y1={30 + i * 32} y2={30 + i * 32} stroke={COL.stoneDark} strokeWidth={1} opacity={0.5} />)}
      {/* la neige sur le haut du mur et au pied */}
      <path d={`M${GX - 66} 14 q18 -14 38 0 t38 0 t38 0 t38 0 v8 h-152 z`} fill="#fff" stroke={COL.snowShade} strokeWidth={1} />
      <rect x={0} y={H - 18} width={W} height={18} fill="#fff" />
      <line x1={0} x2={W} y1={y0} y2={y0} stroke={COL.cold} strokeWidth={1.6} strokeDasharray="7 6" opacity={0.75} />
      {/* des flocons */}
      {[[60, 40], [150, 70], [240, 28], [470, 52], [560, 36], [600, 90], [90, 120]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.2} fill="#fff" opacity={0.9} />)}
    </g>
  );
}

function AltitudeWorld({ uid, y0 }) {
  return (
    <g>
      <rect x={0} y={y0} width={W} height={H - y0} fill={`url(#${uid}-sea)`} />
      <path d={`M0 ${y0} q20 -9 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0`} fill="none" stroke="#fff" strokeWidth={2.4} opacity={0.9} />
      {/* une colline au-dessus du niveau de la mer */}
      <path d={`M0 ${y0} L0 ${y0 - 30} Q70 ${y0 - 120} 150 ${y0 - 80} Q220 ${y0 - 50} 250 ${y0} Z`} fill={COL.hill} stroke={COL.hillDark} strokeWidth={2} />
      <path d={`M560 ${y0} Q590 ${y0 - 50} 640 ${y0 - 36} L640 ${y0} Z`} fill={COL.sand} />
      {/* sous la mer : des bulles */}
      {[[90, y0 + 50], [200, y0 + 90], [470, y0 + 70], [560, y0 + 120], [110, y0 + 150]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3 + (i % 2)} fill="#fff" opacity={0.45} />)}
      <line x1={0} x2={W} y1={y0} y2={y0} stroke={COL.zero} strokeWidth={1.6} strokeDasharray="7 6" opacity={0.8} />
    </g>
  );
}

function FloorsWorld({ g, y0 }) {
  const rows = [];
  for (let i = g.gmin; i < g.gmax; i += 1) {
    const yTop = yOf(g, i + 1);
    const yBot = yOf(g, i);
    const below = i < 0;
    rows.push(
      <g key={i}>
        <rect x={80} y={yTop} width={200} height={yBot - yTop} fill={below ? COL.basement : COL.wall} stroke={below ? COL.basementDark : COL.wallDark} strokeWidth={1.4} />
        {!below && [0, 1, 2].map((w) => <rect key={w} x={96 + w * 62} y={yTop + 5} width={36} height={Math.max(8, yBot - yTop - 10)} rx={3} fill="#BAE6FD" stroke={COL.wallDark} strokeWidth={1} />)}
        {below && [0, 1].map((w) => <rect key={w} x={104 + w * 86} y={yTop + 6} width={52} height={Math.max(8, yBot - yTop - 12)} rx={4} fill={COL.basementDark} opacity={0.55} />)}
      </g>,
    );
  }
  return (
    <g>
      <rect x={0} y={y0} width={W} height={H - y0} fill="#D6D3D1" opacity={0.55} />
      {rows}
      <rect x={70} y={Y_TOP - 12} width={220} height={10} rx={3} fill="#B91C1C" />
      <line x1={0} x2={W} y1={y0} y2={y0} stroke={COL.zero} strokeWidth={2} />
      {/* la porte du rez-de-chaussée */}
      <rect x={168} y={y0 - (y0 - yOf(g, 1)) * 0.78} width={30} height={(y0 - yOf(g, 1)) * 0.78} rx={3} fill="#92400E" />
    </g>
  );
}

/** Le tube : la jauge elle-même (le liquide en frost, un mât à repère ailleurs, le puits d'ascenseur en floors) et ses graduations. */
export function Ruler({ scene, g, level }) {
  const yTop = Y_TOP - 12;
  const yLevel = yOf(g, level);
  const y0 = yOf(g, 0);
  const ticks = [];
  for (let i = g.gmin; i <= g.gmax; i += 1) {
    const y = yOf(g, i);
    ticks.push(<line key={i} x1={GX + 15} x2={GX + (i === 0 ? 36 : 25)} y1={y} y2={y} stroke={i === 0 ? COL.ink : '#334155'} strokeWidth={i === 0 ? 3 : 1.8} data-fg-tick={i} />);
  }
  return (
    <g>
      {scene === 'frost' && (
        <g>
          <rect x={GX - 13} y={yTop} width={26} height={Y_BOT - yTop + 14} rx={13} fill="#fff" stroke={COL.ink} strokeWidth={2.4} />
          <circle cx={GX} cy={Y_BOT + 26} r={19} fill="#fff" stroke={COL.ink} strokeWidth={2.4} />
          <circle cx={GX} cy={Y_BOT + 26} r={13} fill={level >= 0 ? COL.hot : COL.cold} />
          <rect x={GX - 6} y={yLevel} width={12} height={Y_BOT + 20 - yLevel} fill={level >= 0 ? COL.hot : COL.cold} data-fg-liquid={level >= 0 ? 'warm' : 'cold'} />
        </g>
      )}
      {scene === 'altitude' && <rect x={GX - 5} y={yTop} width={10} height={Y_BOT - yTop + 8} rx={5} fill="#fff" stroke={COL.ink} strokeWidth={2.2} />}
      {scene === 'floors' && <rect x={GX - 24} y={Y_TOP - 12} width={48} height={Y_BOT - Y_TOP + 12} rx={4} fill="#334155" stroke={COL.ink} strokeWidth={2} />}
      {ticks}
      <line x1={GX - 150} x2={GX - 24} y1={y0} y2={y0} stroke={COL.zero} strokeWidth={1.4} strokeDasharray="5 5" opacity={scene === 'floors' ? 0 : 0.6} />
    </g>
  );
}

/** Ce que la main tient : l'anneau sur le liquide, le repère à pointe, la cabine. */
export function KnobShape({ scene, y, active }) {
  const stroke = active ? '#4338CA' : COL.ink;
  if (scene === 'frost') return <g><circle cx={GX} cy={y} r={15} fill="#fff" stroke={stroke} strokeWidth={3.4} /><circle cx={GX} cy={y} r={5} fill={stroke} /></g>;
  if (scene === 'altitude') return <g><path d={`M${GX} ${y} l24 -13 v26 z`} fill={COL.amber} stroke={stroke} strokeWidth={2.6} strokeLinejoin="round" /><circle cx={GX} cy={y} r={7} fill="#fff" stroke={stroke} strokeWidth={2.6} /></g>;
  return <g><rect x={GX - 20} y={y - 11} width={40} height={22} rx={4} fill={COL.cabin} stroke={stroke} strokeWidth={2.6} /><line x1={GX} x2={GX} y1={y - 11} y2={y + 11} stroke={COL.cabinDark} strokeWidth={1.8} /></g>;
}

/** Une pastille de lecture : la valeur relative avec son signe seulement sous le zéro. */
export function Reading({ x, y, text, tone, anchor = 'start' }) {
  const w = Math.max(56, 18 + String(text).length * 14);
  const x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
  const fill = tone === 'below' ? COL.cold : tone === 'above' ? COL.amber : COL.zero;
  return (
    <g data-fg-reading={text} data-tone={tone}>
      <rect x={x0} y={y - 17} width={w} height={34} rx={17} fill={fill} />
      <text x={x0 + w / 2} y={y + 7} textAnchor="middle" fontSize={21} fontWeight={800} fill="#fff" direction="ltr" style={{ unicodeBidi: 'isolate' }}>{`\u2066${text}\u2069`}</text>
    </g>
  );
}

/** La cote de distance : un trait vertical entre le zéro et le niveau, hachuré, avec un nombre quand on le demande. */
export function DistanceBracket({ g, level, label, x = GX - 44 }) {
  const y0 = yOf(g, 0);
  const y1 = yOf(g, level);
  if (level === 0) return null;
  return (
    <g data-fg-distance={Math.abs(level)} aria-hidden="true">
      <rect x={x - 5} y={Math.min(y0, y1)} width={10} height={Math.abs(y1 - y0)} fill={COL.hatch} opacity={0.5} />
      <line x1={x - 9} x2={x + 9} y1={y0} y2={y0} stroke={COL.zero} strokeWidth={2} />
      <line x1={x - 9} x2={x + 9} y1={y1} y2={y1} stroke={COL.zero} strokeWidth={2} />
      {label != null && <text x={x - 12} y={(y0 + y1) / 2 + 5} textAnchor="end" fontSize={21} fontWeight={800} fill="#3730A3" direction="ltr" style={{ unicodeBidi: 'isolate' }}>{`\u2066${label}\u2069`}</text>}
    </g>
  );
}

/** L'élève qui lit : toujours KidFigure (la fille en hijab). */
export function Observer({ idx = 0, mood = 'happy', size = 92, x = 70, y = 190 }) {
  const girl = idx % 2 === 0;
  return (
    <svg x={x} y={y} width={size} height={size * 1.25} viewBox="0 0 40 50" aria-hidden="true" data-fg-kid data-mood={mood}>
      {girl
        ? <KidFigure cx={20} top={2} foot={47} hairStyle="hijab" scarf="rose" outfit="green" skin="light" mood={mood} />
        : <KidFigure cx={20} top={2} foot={47} hairStyle="short" outfit="blue" skin="light" hair="brown" mood={mood} />}
    </svg>
  );
}

/** Un mini enfant pour le bandeau de verdict (HTML). */
export function KidChip({ idx = 0, mood = 'happy', size = 40 }) {
  const girl = idx % 2 === 0;
  return (
    <svg width={size} height={size + 6} viewBox="0 0 40 50" aria-hidden="true" data-fg-kid data-mood={mood}>
      {girl
        ? <KidFigure cx={20} top={2} foot={47} hairStyle="hijab" scarf="rose" outfit="green" skin="light" mood={mood} />
        : <KidFigure cx={20} top={2} foot={47} hairStyle="short" outfit="blue" skin="light" hair="brown" mood={mood} />}
    </svg>
  );
}
