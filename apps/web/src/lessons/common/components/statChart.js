/**
 * Un DIAGRAMME STATISTIQUE déclaratif — diagramme en barres, histogramme, polygone (des effectifs ou des
 * effectifs cumulés), diagramme circulaire / semi-circulaire — dessiné par StatChart.jsx dans un énoncé de pratique
 * (`statement.figure` avec `kind: 'chart'`) et dans un problème (ProblemSupport). Un énoncé qui dit « le diagramme
 * représente » MONTRE le diagramme, au lieu de recopier ses nombres dans un tableau.
 *
 * Sans DOM : ce module valide la donnée (le validateur des exercices l'importe) et calcule la géométrie.
 *
 *   { kind: 'chart', type: 'bar', ariaLabel: 'Diagramme en barres des âges …',
 *     xTitle: 'Âge (ans)', yTitle: 'Nombre d’élèves', y: { max: 12, step: 2, minor: 2 },
 *     bars: [{ label: '13', value: 5 }, { label: '14', value: 9 }, { label: '15', missing: true }] }
 *   { kind: 'chart', type: 'histogram', edges: [20, 30, 40, 50], values: [4, 10, 6], y: { max: 10, step: 2 }, polygon: true }
 *   { kind: 'chart', type: 'line', x: { min: 0, max: 50, step: 10 }, points: [[0, 0], [10, 4], [20, 9]], y: { max: 10, step: 2 } }
 *   { kind: 'chart', type: 'pie', half: false, show: 'angle', parts: [{ label: 'Football', value: 12 }, …] }
 *
 * Règles de LECTURE (un diagramme d'énoncé se LIT, contrat EXERCISE_CONTRACT « Statistical charts ») :
 * - la valeur d'une barre / d'un rectangle / d'un sommet n'est PAS écrite (sauf `values: true`) : elle doit
 *   tomber sur une ligne du quadrillage (multiple de `y.step / y.minor`), sinon l'élève ne peut pas la lire ;
 * - `missing: true` : la barre (ou le secteur) que l'élève doit compléter — case pointillée « ? », sans valeur ;
 * - le corps du diagramme se lit de GAUCHE à DROITE, comme toute la page ; titres d'axes et noms de
 *   catégories sont du texte français.
 */
const STAT_CHART_TYPES = Object.freeze(['bar', 'histogram', 'line', 'pie']);
const STAT_CHART_KEYS = Object.freeze([
  'kind', 'type', 'ariaLabel', 'caption', 'xTitle', 'yTitle', 'maxWidth',
  'y', 'values', 'bars', 'edges', 'polygon', 'missing', 'x', 'points', 'parts', 'half', 'show',
]);
const PIE_SHOW = Object.freeze(['none', 'value', 'angle', 'percent']);
const MAX_BARS = 12;
const EPS = 1e-9;
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const onStep = (v, step) => Math.abs(v / step - Math.round(v / step)) < 1e-7;

/** Nombre à la française de la maison : virgule décimale, au plus deux décimales, sans zéros inutiles. */
export function fmtNum(n) {
  const r = Math.round(n * 100) / 100;
  return String(r).replace('.', ',');
}

/** Graduation fine (la plus petite ligne du quadrillage). */
const fineStep = (y) => y.step / (y.minor ?? 1);

function validateAxisY(y, errors) {
  if (!y || typeof y !== 'object') { errors.push('y = { max, step } obligatoire'); return false; }
  if (!(isNum(y.max) && y.max > 0)) errors.push('y.max > 0');
  if (!(isNum(y.step) && y.step > 0)) errors.push('y.step > 0');
  if (y.minor != null && !(Number.isInteger(y.minor) && y.minor >= 1 && y.minor <= 5)) errors.push('y.minor entier entre 1 et 5');
  if (isNum(y.max) && isNum(y.step) && y.step > 0 && !onStep(y.max, y.step)) errors.push(`y.max (${y.max}) n'est pas un multiple de y.step (${y.step})`);
  if (isNum(y.max) && isNum(y.step) && y.step > 0 && y.max / y.step > 12) errors.push('plus de 12 graduations : augmenter y.step');
  return errors.length === 0;
}

/** Une hauteur que l'élève doit lire : sous le plafond et sur une ligne du quadrillage. */
function checkReadable(v, y, values, where, errors) {
  if (!isNum(v) || v < 0) { errors.push(`${where} : valeur numérique ≥ 0`); return; }
  if (v > y.max + EPS) errors.push(`${where} : ${v} dépasse y.max (${y.max})`);
  if (!values && !onStep(v, fineStep(y))) {
    errors.push(`${where} : ${v} ne tombe sur aucune ligne du quadrillage (pas ${fmtNum(fineStep(y))}) — illisible ; changer y.step / y.minor ou poser values: true`);
  }
}

/** Toutes les erreurs d'un diagramme (vide = valide). */
export function validateStatChart(c) {
  const errors = [];
  if (!c || typeof c !== 'object') return ['diagramme absent'];
  for (const k of Object.keys(c)) if (!STAT_CHART_KEYS.includes(k)) errors.push(`clé inconnue « ${k} »`);
  if (c.kind !== 'chart') errors.push('kind = « chart »');
  if (!STAT_CHART_TYPES.includes(c.type)) errors.push(`type inconnu « ${c.type} » (${STAT_CHART_TYPES.join(', ')})`);
  if (typeof c.ariaLabel !== 'string' || !c.ariaLabel.trim() || /[\u0600-\u06FF]/.test(c.ariaLabel)) errors.push('ariaLabel en français obligatoire');

  if (c.type === 'bar') {
    const bars = c.bars;
    if (!Array.isArray(bars) || bars.length < 2) errors.push('bars : au moins deux barres');
    else {
      if (bars.length > MAX_BARS) errors.push(`bars : au plus ${MAX_BARS} barres (360 px)`);
      const ok = validateAxisY(c.y, errors);
      const seen = new Set();
      bars.forEach((b, i) => {
        if (typeof b?.label !== 'string' || !b.label.trim()) errors.push(`bars[${i}] : label obligatoire`);
        else if (seen.has(b.label)) errors.push(`bars[${i}] : label « ${b.label} » en double`); else seen.add(b.label);
        if (b?.missing) { if (b.value != null) errors.push(`bars[${i}] : missing sans value`); } else if (ok) checkReadable(b?.value, c.y, c.values, `bars[${i}]`, errors);
      });
    }
  }

  if (c.type === 'histogram') {
    const { edges, values } = c;
    if (!Array.isArray(edges) || edges.length < 3 || !edges.every(isNum)) errors.push('edges : au moins trois bornes numériques');
    else {
      for (let i = 1; i < edges.length; i++) if (!(edges[i] > edges[i - 1])) errors.push(`edges[${i}] : bornes strictement croissantes`);
      if (!Array.isArray(values) || values.length !== edges.length - 1) errors.push('values : une hauteur par classe (edges.length − 1)');
      else if (validateAxisY(c.y, errors)) {
        const miss = new Set(c.missing ?? []);
        values.forEach((v, i) => { if (!(miss.has(i) && v == null)) checkReadable(v, c.y, false, `values[${i}]`, errors); });
      }
      if (edges.length - 1 > MAX_BARS) errors.push(`au plus ${MAX_BARS} classes`);
      (c.missing ?? []).forEach((m) => { if (!(Number.isInteger(m) && m >= 0 && m < edges.length - 1)) errors.push(`missing : indice de classe inconnu ${m}`); });
      // Le polygone passerait par le sommet de la classe manquante : il donnerait la réponse.
      if (c.polygon && (c.missing ?? []).length) errors.push('polygon et missing ensemble : le polygone dévoilerait la classe à compléter');
    }
  }

  if (c.type === 'line') {
    const { x, points } = c;
    if (!x || !isNum(x.min) || !isNum(x.max) || !isNum(x.step) || !(x.max > x.min) || !(x.step > 0)) errors.push('x = { min, max, step } avec max > min et step > 0');
    else if (!onStep(x.max - x.min, x.step)) errors.push('x.max − x.min doit être un multiple de x.step');
    else if ((x.max - x.min) / x.step > 12) errors.push('plus de 12 graduations sur x : augmenter x.step');
    if (!Array.isArray(points) || points.length < 2) errors.push('points : au moins deux sommets [x, y]');
    else if (validateAxisY(c.y, errors) && x && isNum(x.min)) {
      points.forEach((p, i) => {
        if (!Array.isArray(p) || p.length !== 2 || !p.every(isNum)) { errors.push(`points[${i}] : [x, y] numériques`); return; }
        if (p[0] < x.min - EPS || p[0] > x.max + EPS) errors.push(`points[${i}] : x = ${p[0]} hors de l'axe`);
        if (i > 0 && !(p[0] > points[i - 1][0])) errors.push(`points[${i}] : abscisses strictement croissantes`);
        checkReadable(p[1], c.y, c.values, `points[${i}]`, errors);
      });
    }
  }

  if (c.type === 'pie') {
    const parts = c.parts;
    if (!Array.isArray(parts) || parts.length < 2) errors.push('parts : au moins deux secteurs');
    else {
      if (parts.length > 8) errors.push('parts : au plus 8 secteurs');
      parts.forEach((p, i) => {
        if (typeof p?.label !== 'string' || !p.label.trim()) errors.push(`parts[${i}] : label obligatoire`);
        if (!(isNum(p?.value) && p.value > 0)) errors.push(`parts[${i}] : value > 0 (même un secteur « ? » a sa taille)`);
      });
    }
    if (c.show != null && !PIE_SHOW.includes(c.show)) errors.push(`show : ${PIE_SHOW.join(' | ')}`);
  }
  if (c.type !== 'pie' && c.show != null) errors.push('show : réservé au type pie');
  if (c.type !== 'pie' && c.half != null) errors.push('half : réservé au type pie');
  return errors;
}

/* ── Mise en page ─────────────────────────────────────────────────────── */

const CHART_W = 340;
const PAD = { l: 38, r: 14, t: 12, b: 32 };
const PLOT_H = 176;

function yGrid(y) {
  const fine = fineStep(y);
  const lines = [];
  for (let k = 0; k * fine <= y.max + EPS; k++) {
    const v = k * fine;
    lines.push({ v, major: onStep(v, y.step) });
  }
  return lines;
}

/**
 * La géométrie d'un diagramme d'axes (bar, histogram, line) : viewBox, quadrillage, rectangles, sommets,
 * étiquettes. y vers le bas en SVG ; la donnée a y vers le haut.
 */
export function layoutAxisChart(c) {
  const W = CHART_W;
  // Les noms de barres doivent tenir dans leur case : police réduite, puis deux rangées décalées si elle passerait sous 11 (un vide d’un cinquième de case entre deux noms).
  let labelFont = 12; let stagger = false;
  if (c.type === 'bar') {
    const slot = (W - PAD.l - PAD.r) / c.bars.length;
    const longest = Math.max(...c.bars.map((bar) => bar.label.length));
    const fit = (room) => (room * 0.8) / (Math.max(2, longest) * 0.6);
    labelFont = Math.min(13, fit(slot));
    if (labelFont < 11) { stagger = true; labelFont = Math.min(13, fit(2 * slot)); }
  }
  const H = PAD.t + PLOT_H + PAD.b + (stagger ? 14 : 0);
  const x0 = PAD.l; const x1 = W - PAD.r; const yb = PAD.t + PLOT_H;
  const Y = (v) => yb - (v / c.y.max) * PLOT_H;
  const grid = yGrid(c.y).map((g) => ({ ...g, y: Y(g.v), text: g.major ? fmtNum(g.v) : null }));
  const out = { W, H, x0, x1, yb, yTop: PAD.t, grid, rects: [], xLabels: [], points: [], valueTexts: [], labelFont, stagger };

  if (c.type === 'bar') {
    const n = c.bars.length;
    const slot = (x1 - x0) / n;
    const bw = Math.min(34, slot * 0.5);
    c.bars.forEach((b, i) => {
      const cx = x0 + slot * (i + 0.5);
      out.xLabels.push({ x: cx, text: b.label, row: stagger ? i % 2 : 0 });
      if (b.missing) out.rects.push({ x: cx - bw / 2, y: PAD.t, w: bw, h: PLOT_H, missing: true, key: b.label });
      else {
        out.rects.push({ x: cx - bw / 2, y: Y(b.value), w: bw, h: yb - Y(b.value), key: b.label });
        if (c.values) out.valueTexts.push({ x: cx, y: Y(b.value) - 4, text: fmtNum(b.value) });
      }
    });
  }

  if (c.type === 'histogram') {
    const lo = c.edges[0]; const hi = c.edges[c.edges.length - 1];
    const X = (e) => x0 + 8 + ((e - lo) / (hi - lo)) * (x1 - x0 - 16);
    const miss = new Set(c.missing ?? []);
    c.values.forEach((v, i) => {
      const xa = X(c.edges[i]); const xb = X(c.edges[i + 1]);
      if (miss.has(i)) out.rects.push({ x: xa, y: PAD.t, w: xb - xa, h: PLOT_H, missing: true, key: i });
      else out.rects.push({ x: xa, y: Y(v), w: xb - xa, h: yb - Y(v), contiguous: true, key: i });
    });
    c.edges.forEach((e) => out.xLabels.push({ x: X(e), text: fmtNum(e) }));
    if (c.polygon) {
      // Le polygone des effectifs : les milieux des côtés supérieurs, fermé sur l'axe à une demi-classe de chaque bout.
      const first = c.edges[1] - c.edges[0]; const last = c.edges[c.edges.length - 1] - c.edges[c.edges.length - 2];
      const mids = c.values.map((v, i) => [X((c.edges[i] + c.edges[i + 1]) / 2), Y(v ?? 0)]);
      const left = Math.max(x0, X(lo - first / 2)); const right = Math.min(x1, X(hi + last / 2));
      out.points = [[left, yb], ...mids, [right, yb]];
      out.polygonLine = true;
    }
  }

  if (c.type === 'line') {
    const X = (v) => x0 + 8 + ((v - c.x.min) / (c.x.max - c.x.min)) * (x1 - x0 - 16);
    for (let v = c.x.min; v <= c.x.max + EPS; v += c.x.step) out.xLabels.push({ x: X(v), text: fmtNum(v) });
    out.points = c.points.map(([px, py]) => [X(px), Y(py)]);
    out.polygonLine = true;
    out.dots = true;
    if (c.values) c.points.forEach(([px, py]) => out.valueTexts.push({ x: X(px), y: Y(py) - 6, text: fmtNum(py) }));
  }
  return out;
}

/** Le nombre écrit dans un secteur selon `show` (« 72° », « 20 % », « 12 »), ou « ? » pour un secteur manquant. */
export function pieText(part, total, { half = false, show = 'value' } = {}) {
  if (part.missing) return '?';
  if (show === 'none') return null;
  if (show === 'angle') return `${fmtNum((part.value / total) * (half ? 180 : 360))}°`;
  if (show === 'percent') return `${fmtNum((part.value / total) * 100)} %`;
  return fmtNum(part.value);
}

/** Les secteurs d'un diagramme circulaire (ou semi-circulaire) : chemins SVG + position du nombre de chaque secteur. */
export function layoutPie(c) {
  const R = 96;
  const half = Boolean(c.half);
  const M = 30; // marge : un nombre de petit secteur sort du disque
  const W = 2 * R + 2 * M;
  const cx = W / 2;
  const cy = R + M;
  const H = half ? R + M + 12 : 2 * R + 2 * M;
  const total = c.parts.reduce((s, p) => s + p.value, 0);
  // Cercle : depuis midi, sens des aiguilles d'une montre. Demi-cercle : de 9 h à 3 h par le haut.
  let a0 = half ? Math.PI : -Math.PI / 2;
  const span = half ? Math.PI : 2 * Math.PI;
  const sectors = c.parts.map((p, i) => {
    const a1 = a0 + (p.value / total) * span;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const P = (a, r = R) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const [sx, sy] = P(a0); const [ex, ey] = P(a1);
    const d = c.parts.length === 1 && !half
      ? `M${cx - R} ${cy} A${R} ${R} 0 1 1 ${cx + R} ${cy} A${R} ${R} 0 1 1 ${cx - R} ${cy} Z`
      : `M${cx} ${cy} L${sx.toFixed(2)} ${sy.toFixed(2)} A${R} ${R} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)} Z`;
    const mid = (a0 + a1) / 2;
    const small = a1 - a0 < 0.42; // < 24° : le nombre sort du secteur
    const [tx, ty] = P(mid, small ? R + 16 : R * 0.6);
    // Le NOM de la catégorie écrit dans le secteur (comme le manuel) quand il y tient : la couleur seule ne relie
    // pas un secteur à sa légende (impression, daltonisme). Une classe « $…$ » reste dans la légende (KaTeX hors SVG).
    const nameInside = !small && a1 - a0 >= 0.75 && !/\$/.test(p.label) && p.label.length <= 12;
    const s = { i, d, tx, ty, outside: small, nameInside, text: pieText(p, total, { half, show: c.show ?? 'value' }), missing: Boolean(p.missing), label: p.label };
    a0 = a1;
    return s;
  });
  // Tous ou aucun : un disque où un secteur porte son nom et son voisin non ressemble à une erreur — la légende suffit alors.
  if (!sectors.every((sec) => sec.nameInside)) sectors.forEach((sec) => { sec.nameInside = false; });
  return { W, H, cx, cy, R, sectors, total, half };
}
