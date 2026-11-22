import * as E from '@smarter-academy/core/arithmetic/expansion.js';

/**
 * area-split (monde `arrows`) — la GÉOMÉTRIE de la ligne écrite, pure et testée (MANIPULATION_CONTRACT §7ter étape 9). L'expression est une
 * rangée de PUCES posées à des abscisses calculées (aucune mesure du DOM : la scène se rend aussi côté serveur) ; les flèches rouges sont
 * des arcs AU-DESSUS de la rangée, du centre d'une origine (terme du 1er facteur) au centre d'une cible (terme de l'autre parenthèse).
 * Une rangée trop large pour la scène est réduite (`scale`), jamais coupée.
 */
export const CHIP_H = 44;
export const ARC_H = 78;
const MIN_SCALE = 0.55;
const MAX_SCALE = 1.32;

const minus = (s) => s.replace(/-/g, '−');
/** Le texte d'une puce : le terme AVEC son signe (« −3 »), et un « + 1 » / « − 3 » détaché pour un terme qui suit un autre. */
export function chipText(term, i) {
  const body = minus(E.termTex({ c: Math.abs(term.c), p: term.p }).replace(/^1x/, 'x').replace('^2', '²'));
  if (i === 0) return term.c < 0 ? `−${body}` : body;
  return `${term.c < 0 ? '−' : '+'} ${body}`;
}
export const chipWidth = (text, scale = 1) => Math.max(Math.round(40 * Math.max(scale, 0.9)), Math.round((text.replace(/\s/g, '').length * 14 + 22) * scale));

/**
 * La rangée : jetons { kind: 'chip' | 'paren' | 'op', x, w, text, side, k, oi?, tj? }. `side` : 'f1' | 'f2'. Les origines (`oi`) sont les
 * puces du 1er facteur, les cibles (`tj`) celles du 2e, numérotées sur toute la ligne (tous produits).
 */
export function lineLayout(expr, { width, maxScale = MAX_SCALE }) {
  const build = (scale) => {
    const gap = Math.round(6 * scale); const pw = Math.round(14 * scale); const ow = Math.round(30 * scale);
    const tokens = []; let x = 0; let oi = 0; let tj = 0;
    const put = (tk) => { tokens.push({ ...tk, x }); x += tk.w + gap; };
    expr.products.forEach((pr, k) => {
      if ((k > 0) || pr.sign < 0) put({ kind: 'op', w: ow, text: pr.sign < 0 ? '−' : '+', k });
      const multi = pr.f1.length > 1;
      if (multi) put({ kind: 'paren', w: pw, text: '(', k, side: 'f1' });
      pr.f1.forEach((t, i) => {
        const text = chipText(t, i);
        put({ kind: 'chip', w: chipWidth(text, scale), text, k, side: 'f1', oi, i, term: t }); oi += 1;
      });
      if (multi) put({ kind: 'paren', w: pw, text: ')', k, side: 'f1' });
      put({ kind: 'paren', w: pw, text: '(', k, side: 'f2' });
      pr.f2.forEach((t, j) => {
        const text = chipText(t, j);
        put({ kind: 'chip', w: chipWidth(text, scale), text, k, side: 'f2', tj, j, term: t }); tj += 1;
      });
      put({ kind: 'paren', w: pw, text: ')', k, side: 'f2' });
    });
    return { tokens, total: x - gap };
  };
  const natural = build(1);
  let scale = Math.max(MIN_SCALE, Math.min(maxScale, width / natural.total));
  let laid = scale === 1 ? natural : build(scale);
  // les largeurs minimales des puces ne rétrécissent pas : on affine jusqu'à ce que la rangée tienne (ou que l'échelle minimale soit atteinte)
  while (laid.total > width && scale > MIN_SCALE) { scale = Math.max(MIN_SCALE, Math.round((scale - 0.02) * 100) / 100); laid = build(scale); }
  const offset = Math.max(0, Math.round((width - laid.total) / 2));
  const tokens = laid.tokens.map((tk) => ({ ...tk, x: tk.x + offset }));
  const centre = (tk) => tk.x + tk.w / 2;
  return {
    tokens, scale, total: laid.total, width, arcH: Math.round(ARC_H * Math.max(1, scale)), chipH: Math.round(CHIP_H * Math.max(1, scale)), height: Math.round(ARC_H * Math.max(1, scale)) + Math.round(CHIP_H * Math.max(1, scale)),
    origins: tokens.filter((tk) => tk.kind === 'chip' && tk.side === 'f1').map((tk) => ({ oi: tk.oi, k: tk.k, cx: centre(tk), x: tk.x, w: tk.w })),
    targets: tokens.filter((tk) => tk.kind === 'chip' && tk.side === 'f2').map((tk) => ({ tj: tk.tj, k: tk.k, cx: centre(tk), x: tk.x, w: tk.w })),
  };
}

/** L'arc d'une flèche (repère de la rangée, y = 0 en haut des arcs ; les puces commencent à y = ARC_H). `rank` : le rang de l'arc parmi ceux du même produit (arcs imbriqués). */
export function arcOf(lay, from, to, { rank = 0, arrivals = 1, slot = 0 } = {}) {
  const ARC = lay.arcH ?? ARC_H;
  const a = lay.origins.find((o) => o.oi === from); const b = lay.targets.find((t) => t.tj === to);
  const dx = b.cx - a.cx;
  const spread = arrivals > 1 ? (slot - (arrivals - 1) / 2) * 9 : 0;
  const x1 = a.cx + Math.sign(dx || 1) * 4; const x2 = b.cx + spread;
  const y = ARC - 2;
  const peak = Math.min(ARC - 10, 22 + rank * 14 + Math.abs(dx) * 0.16);
  return { x1, y1: y, x2, y2: y, cx: (x1 + x2) / 2, cy: y - peak * 2 + 6, peak, d: `M${x1} ${y} Q${(x1 + x2) / 2} ${y - peak * 2 + 6} ${x2} ${y - 3}` };
}
