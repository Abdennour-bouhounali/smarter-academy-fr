import KidFigure from '../../primitives/KidFigure';

/**
 * Le décor de `jump-tape` (« شريط القفز », thème `sportsday`) : la fosse de saut en longueur du collège un jour de sport — le ciel, les gradins, la pelouse, le sable ratissé,
 * la planche d'appel blanche à gauche (= le métré O), un ruban de mesure jaune déroulé le long de la fosse, des drapeaux colorés et l'empreinte d'une athlète.
 * Tout est SVG (jamais d'image raster) ; les NOMBRES viennent de la scène (aucun chiffre n'est écrit ici). Les personnes sont toujours `KidFigure` (filles en hijab).
 */
export const W = 640;
export const H = 212;
export const TY = 118;        // le haut du ruban
export const TH = 38;         // la hauteur du ruban
export const POLE = 60;       // la hauteur d'une hampe
const SAND_Y = 100;
const SAND_H = 98;

export const COL = {
  sky: '#E0F2FE', skyDark: '#BAE6FD', grass: '#86EFAC', grassDark: '#4ADE80', sand: '#FCE7A8', sandDark: '#E8C97A', board: '#FFFFFF', boardEdge: '#CBD5E1',
  tape: '#FACC15', tapeDark: '#A16207', tapeInk: '#1F2937', ink: '#0F172A', miss: '#E11D48', hatch: '#FB7185', cursor: '#4F46E5', bleacher: '#CBD5E1', wood: '#92400E',
  red: '#E11D48', blue: '#2563EB', green: '#16A34A', amber: '#D97706',
};
const FLAG_FILL = { red: COL.red, blue: COL.blue, green: COL.green, amber: COL.amber };

/** Le ciel, les gradins, la pelouse, la fosse de sable ratissé, la planche d'appel (à gauche de O = `x0`) et la bordure du bout (à `xEnd`). `cut` : le ruban est coupé à gauche (O hors champ). */
export function Backdrop({ uid, x0, xEnd, cut }) {
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.skyDark} /><stop offset="1" stopColor={COL.sky} /></linearGradient>
        <linearGradient id={`${uid}-sand`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FEF3C7" /><stop offset="1" stopColor={COL.sand} /></linearGradient>
        <pattern id={`${uid}-rake`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(8)"><line x1="0" y1="0" x2="0" y2="9" stroke={COL.sandDark} strokeWidth="1.2" opacity="0.5" /></pattern>
      </defs>
      <rect x={0} y={0} width={W} height={SAND_Y + 8} fill={`url(#${uid}-sky)`} />
      {/* les gradins et une rangée de fanions */}
      <rect x={0} y={72} width={W} height={34} fill={COL.bleacher} opacity={0.65} />
      {[0, 1, 2].map((i) => <line key={i} x1={0} x2={W} y1={80 + i * 9} y2={80 + i * 9} stroke="#94A3B8" strokeWidth={1.2} opacity={0.6} />)}
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${24 + i * 46} 70 l10 4 l-10 4 z`} fill={['#F59E0B', '#2DD4BF', '#F472B6', '#818CF8'][i % 4]} opacity={0.85} />)}
      <line x1={0} x2={W} y1={70} y2={70} stroke="#64748B" strokeWidth={1.4} />
      <rect x={0} y={SAND_Y + 4} width={W} height={H - SAND_Y - 4} fill={COL.grass} />
      <rect x={0} y={SAND_Y + 4} width={W} height={5} fill={COL.grassDark} />
      <rect x={4} y={SAND_Y + 10} width={W - 8} height={SAND_H - 12} rx={14} fill={`url(#${uid}-sand)`} stroke={COL.sandDark} strokeWidth={1.6} />
      <rect x={4} y={SAND_Y + 10} width={W - 8} height={SAND_H - 12} rx={14} fill={`url(#${uid}-rake)`} />
      {!cut && <rect x={x0 - 14} y={TY - 6} width={14} height={TH + 12} rx={2} fill={COL.board} stroke={COL.boardEdge} strokeWidth={1.4} />}
      <line x1={xEnd} x2={xEnd} y1={SAND_Y + 12} y2={SAND_Y + SAND_H - 4} stroke={COL.wood} strokeWidth={3} strokeDasharray="1 0" opacity={0.55} />
    </g>
  );
}

/** Le ruban jaune de `x0` à `x0 + 600`. Le bord gauche est déchiré quand la fenêtre n'a pas son origine (`cut`). */
export function TapeBand({ x0, len, cut }) {
  return (
    <g aria-hidden="true">
      <rect x={x0} y={TY + 2} width={len} height={TH} rx={3} fill="#000" opacity={0.12} />
      <rect x={x0} y={TY} width={len} height={TH} rx={3} fill={COL.tape} stroke={COL.tapeDark} strokeWidth={1.4} data-jt-tape />
      {cut && <path d={`M${x0} ${TY} l-7 5 l7 5 l-7 5 l7 5 l-7 5 l7 5 l-7 3 l0 5 L${x0} ${TY + TH} Z`} fill={COL.sandDark} opacity={0.9} />}
    </g>
  );
}

/** Une petite graduation : `kind` 'big' (grande marque) | 'mid' (la 5e) | 'small'. */
export function Tick({ x, kind, i, animate }) {
  const h = kind === 'big' ? 26 : kind === 'mid' ? 17 : 10;
  return (
    <line x1={x} x2={x} y1={TY} y2={TY + h} stroke={COL.tapeInk} strokeWidth={kind === 'big' ? 2.4 : kind === 'mid' ? 1.6 : 1.2} strokeLinecap="round"
      className={animate ? 'jt-tick' : undefined} style={animate ? { animationDelay: `${Math.min(i, 60) * 14}ms` } : undefined} />
  );
}

/** Un drapeau planté en `x` : hampe plantée dans le ruban, fanion coloré, pastille de la lettre. `ghost` : le drapeau tenu entre les doigts (pointillés). */
export function Flag({ x, color, letter, state, ghost }) {
  const fill = FLAG_FILL[color] ?? COL.red;
  const top = TY - POLE;
  const wrong = state === 'wrong';
  return (
    <g aria-hidden="true" opacity={ghost ? 0.78 : 1}>
      <line x1={x} x2={x} y1={top} y2={TY + 3} stroke="#475569" strokeWidth={3} strokeLinecap="round" strokeDasharray={ghost ? '5 3' : undefined} />
      <path d={`M${x + 1.5} ${top + 1} h30 l-9 11 l9 11 h-30 z`} fill={fill} stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" strokeDasharray={ghost ? '4 3' : undefined} />
      <text x={x + 12} y={top + 17} fontSize={13} fontWeight={900} fill="#fff" textAnchor="middle" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{letter}</text>
      <circle cx={x} cy={TY + 3} r={3.4} fill="#475569" />
      {wrong && <circle cx={x} cy={TY + 3} r={9} fill="none" stroke={COL.miss} strokeWidth={2} strokeDasharray="3 2" />}
    </g>
  );
}

/** L'empreinte d'une athlète dans le sable, à la VRAIE place du saut (deux semelles) ; son contour est celui du drapeau. */
export function Footprint({ x, color }) {
  const c = FLAG_FILL[color] ?? COL.red;
  return (
    <g aria-hidden="true">
      <ellipse cx={x - 4} cy={TY + TH + 30} rx={5} ry={9} fill={COL.sandDark} stroke={c} strokeWidth={1.8} strokeDasharray="3 2" transform={`rotate(-8 ${x - 4} ${TY + TH + 30})`} />
      <ellipse cx={x + 6} cy={TY + TH + 24} rx={5} ry={9} fill={COL.sandDark} stroke={c} strokeWidth={1.8} strokeDasharray="3 2" transform={`rotate(8 ${x + 6} ${TY + TH + 24})`} />
    </g>
  );
}

/** Le curseur de lecture : un trait vertical posé sur une graduation et sa poignée. */
export function Cursor({ x, active }) {
  return (
    <g aria-hidden="true" data-jt-cursor-art>
      <line x1={x} x2={x} y1={TY - 22} y2={TY + TH + 22} stroke={COL.cursor} strokeWidth={2.4} />
      <circle cx={x} cy={TY - 30} r={active ? 13 : 11} fill={COL.cursor} stroke="#fff" strokeWidth={2.4} />
      <path d={`M${x - 5} ${TY - 30} l-4 0 M${x + 5} ${TY - 30} l4 0`} stroke="#fff" strokeWidth={2} strokeLinecap="round" />
      <path d={`M${x - 3} ${TY - 33} l-3 3 l3 3 M${x + 3} ${TY - 33} l3 3 l-3 3`} fill="none" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Le mini-sujet d'un bac de drapeaux : un enfant (KidFigure — fille en hijab, garçon en sweat). */
export function Jumper({ idx, mood = 'happy', size = 44 }) {
  const girl = idx % 2 === 0;
  return (
    <svg width={size} height={size + 6} viewBox="0 0 40 50" aria-hidden="true" data-jt-kid>
      {girl
        ? <KidFigure cx={20} top={2} foot={47} hairStyle="hijab" scarf={idx === 0 ? 'rose' : 'mint'} outfit={idx === 0 ? 'green' : 'violet'} skin={idx === 0 ? 'light' : 'wheat'} mood={mood} />
        : <KidFigure cx={20} top={2} foot={47} hairStyle="short" outfit="blue" skin="light" hair="brown" mood={mood} />}
    </svg>
  );
}
