
/**
 * Les LECTURES posées DANS une scène SVG : une pilule de valeur (« 136 cm » au-dessus d'une tête) et une cote de
 * différence (deux flèches entre deux niveaux, la pilule « +6 cm » à côté). Le texte est un îlot LTR isolé (chiffres
 * et unité latine dans une page RTL — ARABIC_RTL_CONTRACT). La largeur d'une pilule est ESTIMÉE (aucune mesure DOM :
 * la scène se rend aussi côté serveur, tests de rendu) ; `pillWidth` est exportée et testée.
 */

/** Largeur estimée d'une pilule pour `text` en `size` px (chiffres, espaces, quelques lettres latines). */
export function pillWidth(text, size = 14) {
  const s = String(text);
  let w = 0;
  for (const ch of s) w += ch === ' ' ? 0.32 : /[0-9]/.test(ch) ? 0.6 : /[+−\-×]/.test(ch) ? 0.62 : 0.56;
  return Math.round(w * size + size * 1.3);
}

/**
 * Une pilule pleine. `x`, `y` : le point d'ancrage (`anchor` 'middle' | 'start' | 'end' horizontalement, `y` est le
 * BAS de la pilule si `pointer` = 'down' — la pointe touche alors `y` —, sinon son centre vertical).
 */
export function SvgPill({ x, y, text, fill = '#4F46E5', color = '#FFFFFF', size = 14, anchor = 'middle', pointer = null, ...rest }) {
  const w = pillWidth(text, size);
  const h = Math.round(size * 1.9);
  const x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
  const tip = pointer === 'down' ? Math.round(size * 0.45) : 0;
  const y0 = pointer === 'down' ? y - tip - h : y - h / 2;
  const mid = x0 + w / 2;
  return (
    <g {...rest}>
      <rect x={x0} y={y0 + 1.5} width={w} height={h} rx={h / 2} fill="#1E1B4B" opacity={0.12} />
      <rect x={x0} y={y0} width={w} height={h} rx={h / 2} fill={fill} />
      {tip > 0 && <path d={`M${mid - tip} ${y0 + h - 0.5} L${mid} ${y0 + h + tip} L${mid + tip} ${y0 + h - 0.5} Z`} fill={fill} />}
      <text x={mid} y={y0 + h / 2 + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={800} fill={color}
        fontFamily="ui-sans-serif, system-ui, sans-serif" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{text}</text>
    </g>
  );
}

/**
 * Une cote verticale entre deux niveaux `y1` et `y2` à l'abscisse `x` : une flèche double, ses deux traits d'arrêt,
 * et la pilule `label` du côté `side` ('right' | 'left'), ou au-dessus (`placement` 'above', scène étroite). Quand l'écart est trop petit pour loger les pointes, elles
 * passent DEHORS et se font face (la cote des dessins techniques). Rien n'est dessiné si les niveaux sont égaux.
 */
export function SvgDimension({ x, y1, y2, label, color = '#4F46E5', pillFill, side = 'right', placement = 'side', size = 13, ...rest }) {
  if (y1 === y2) return null;
  const a = Math.min(y1, y2);
  const b = Math.max(y1, y2);
  const head = 5;
  const inside = b - a >= 2 * head + 4;
  const arrow = (y, dir) => `M${x - head} ${y - dir * head} L${x} ${y} L${x + head} ${y - dir * head}`;
  const px = side === 'right' ? x + 9 : x - 9;
  return (
    <g {...rest}>
      <line x1={x - 7} x2={x + 7} y1={a} y2={a} stroke={color} strokeWidth={1.6} />
      <line x1={x - 7} x2={x + 7} y1={b} y2={b} stroke={color} strokeWidth={1.6} />
      {inside ? (
        <>
          <line x1={x} x2={x} y1={a + 1} y2={b - 1} stroke={color} strokeWidth={1.8} />
          <path d={arrow(a + 1, -1)} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          <path d={arrow(b - 1, 1)} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <line x1={x} x2={x} y1={a - 12} y2={a - 1} stroke={color} strokeWidth={1.8} />
          <line x1={x} x2={x} y1={b + 1} y2={b + 12} stroke={color} strokeWidth={1.8} />
          <path d={arrow(a - 1, 1)} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          <path d={arrow(b + 1, -1)} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {label != null && placement === 'side' && <SvgPill x={px} y={(a + b) / 2} text={label} size={size} anchor={side === 'right' ? 'start' : 'end'} fill={pillFill ?? color} />}
      {label != null && placement === 'above' && <SvgPill x={x} y={a - (inside ? 4 : 16)} pointer="down" text={label} size={size} fill={pillFill ?? color} />}
    </g>
  );
}
