import KidFigure from '../../primitives/KidFigure';

/**
 * Le décor de `bridge-load` (« حمولة الجسر », thème `weighbridge`) : le dépôt de matériaux au bord d'un oued à sec — des sacs de CIMENT (gris, 50 kg) et de SABLE (beige, 40 kg) sur
 * des palettes —, un camion à benne ouverte (sa masse à vide peinte sur la portière), la dalle du pèse-camion, la barrière et le pont. Tout est SVG, aucune image raster ; aucun
 * chiffre n'est écrit ici que celui qu'on lui passe (la masse à vide). Anis (garçon en sweat) porte à مبتدئ, Salma (fille en hijab et tunique longue) lit les écrans à متقدم ;
 * les chauffeurs ne sont jamais dessinés (une silhouette de cabine).
 */
export const COL = {
  sky: '#E0F2FE', skyLow: '#FEF3C7', ground: '#E9D8A6', groundDark: '#CDB87A', road: '#64748B', roadDark: '#475569', stripe: '#FACC15',
  cement: '#9CA3AF', cementDark: '#6B7280', cementBand: '#1D4ED8', sand: '#E8D5A3', sandDark: '#B8A06A', sandTie: '#92400E',
  truck: '#2563EB', truckDark: '#1E40AF', cab: '#F59E0B', cabDark: '#B45309', glass: '#BAE6FD', wheel: '#1F2937', hub: '#CBD5E1',
  concrete: '#D6D3D1', concreteDark: '#A8A29E', red: '#E11D48', green: '#059669', ink: '#0F172A', pallet: '#A16207', palletDark: '#713F12',
};

/** Un sac : `kind` 'cement' | 'sand', posé par son coin haut-gauche (x, y), `w` × `h` px. */
export function Sack({ x, y, w = 14, h = 8, kind = 'cement', ...rest }) {
  const c = kind === 'sand';
  return (
    <g {...rest} aria-hidden="true">
      <rect x={x} y={y} width={w} height={h} rx={Math.min(2.4, h / 3)} fill={c ? COL.sand : COL.cement} stroke={c ? COL.sandDark : COL.cementDark} strokeWidth={Math.max(0.6, h / 12)} />
      {!c && h >= 8 && <rect x={x + w * 0.18} y={y + h * 0.36} width={w * 0.64} height={Math.max(1.2, h * 0.24)} fill={COL.cementBand} opacity={0.85} />}
      {c && h >= 8 && <path d={`M${x + w * 0.3} ${y + h * 0.5} q${w * 0.2} ${-h * 0.25} ${w * 0.4} 0`} fill="none" stroke={COL.sandTie} strokeWidth={Math.max(0.8, h / 9)} />}
    </g>
  );
}

/** Les sacs d'une sorte rangés en COLONNES de 5 (une palette = une colonne pleine), posés à partir de (x0, floor) vers la droite. → un groupe + la largeur occupée. */
export function Pile({ kind, count, x0, floor, colW, sackH = 8, ...rest }) {
  const cols = Math.ceil(count / 5);
  return (
    <g {...rest}>
      {Array.from({ length: cols }, (_, c) => {
        const n = Math.min(5, count - c * 5);
        return Array.from({ length: n }, (__, r) => <Sack key={`${c}-${r}`} x={x0 + c * colW} y={floor - (r + 1) * sackH} w={colW - 1} h={sackH - 0.6} kind={kind} />);
      })}
    </g>
  );
}

/** Le camion, en coordonnées locales : l'origine est le coin bas-gauche de la benne (sol de la benne), la benne mesure 170 de large, la cabine suit à droite. */
export function Truck({ tag, tagKind, empty, children, ...rest }) {
  return (
    <g {...rest}>
      {/* la dalle du pèse-camion sous les roues */}
      <rect x={-10} y={37} width={238} height={8} rx={2} fill={COL.roadDark} />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-6 + i * 26} y={37} width={12} height={8} fill={COL.stripe} opacity={0.9} />)}
      {/* la benne : plancher et côté peint */}
      <rect x={0} y={0} width={170} height={26} rx={3} fill={COL.truck} stroke={COL.truckDark} strokeWidth={2} />
      <rect x={0} y={-3} width={170} height={4} fill={COL.truckDark} />
      {children}
      {/* la cabine : une silhouette (le chauffeur n'est jamais dessiné) */}
      <path d="M174 26 V-6 Q174 -12 182 -12 H200 Q206 -12 210 -4 L222 10 Q226 14 226 20 V26 Z" fill={COL.cab} stroke={COL.cabDark} strokeWidth={2} />
      <path d="M182 -7 H198 Q202 -7 205 -2 L212 8 H182 Z" fill={COL.glass} stroke={COL.cabDark} strokeWidth={1.4} />
      <rect x={176} y={14} width={20} height={8} rx={2} fill={COL.cabDark} opacity={0.35} />
      {[34, 134, 196].map((cx) => (
        <g key={cx}><circle cx={cx} cy={28} r={11} fill={COL.wheel} /><circle cx={cx} cy={28} r={4.4} fill={COL.hub} /></g>
      ))}
      {tag}
    </g>
  );
}

/** La barrière : un fût, un bras rouge et blanc qui se lève (`open`). Le pivot est en (px, py), le bras part vers la gauche (`len`). */
export function Barrier({ px, py, len = 64, open }) {
  return (
    <g aria-hidden="true">
      <rect x={px - 5} y={py - 4} width={10} height={36} rx={3} fill={COL.concreteDark} stroke={COL.ink} strokeWidth={1.2} />
      <g transform={`rotate(${open ? 72 : 0} ${px} ${py})`} style={{ transition: 'transform 420ms ease-out' }} data-bl-arm>
        <rect x={px - len} y={py - 3.5} width={len} height={7} rx={2} fill="#fff" stroke={COL.ink} strokeWidth={1.2} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={px - len + 4 + i * (len / 4)} y={py - 3.5} width={len / 8} height={7} fill={COL.red} />)}
      </g>
      <circle cx={px} cy={py} r={4.6} fill={open ? COL.green : COL.red} stroke={COL.ink} strokeWidth={1.2} />
    </g>
  );
}

/** Le pont de l'oued à sec, à droite de la scène. */
export function Bridge({ x, y, w }) {
  return (
    <g aria-hidden="true">
      <rect x={x} y={y} width={w} height={12} fill={COL.concrete} stroke={COL.concreteDark} strokeWidth={1.4} />
      <rect x={x} y={y - 10} width={w} height={4} fill={COL.concreteDark} />
      {[0.15, 0.5, 0.85].map((f) => <rect key={f} x={x + w * f - 2} y={y - 10} width={4} height={10} fill={COL.concreteDark} />)}
      <path d={`M${x + 6} ${y + 12} q${(w - 12) / 2} -26 ${w - 12} 0`} fill={COL.ground} stroke={COL.concreteDark} strokeWidth={1.4} />
    </g>
  );
}

export function Student({ x, y, girl, mood, h = 52 }) {
  return girl
    ? <KidFigure cx={x} top={y - h} foot={y} hairStyle="hijab" scarf="rose" outfit="green" skin="light" mood={mood} />
    : <KidFigure cx={x} top={y - h} foot={y} hairStyle="short" outfit="blue" skin="light" hair="brown" mood={mood} />;
}
