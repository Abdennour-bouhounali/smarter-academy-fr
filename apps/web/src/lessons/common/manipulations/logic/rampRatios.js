/**
 * ramp-ratios — la logique PURE des rampes du skatepark (unité 10 « حساب المثلثات في المثلث القائم », درس
 * « النسب المثلثية لزاوية حادة في مثلث قائم », نشاط 1 et نشاط 2 p. 116). Aucun React ici, aucune arithmétique
 * propre : les noms des côtés relativement à un angle (`sides`), ce que chaque rapport divise (`RATIO_SIDES`), les
 * valeurs (`ratioDeg`, `sinDeg`…) et l'arrondi du manuel (`roundTo`) viennent de `trigonometry` (packages/core).
 * Seule la GÉOMÉTRIE DU DESSIN est en flottants.
 *
 * La rampe est le triangle ABC rectangle en A : B le pied de la planche (sur le sol), A le pied de la hauteur,
 * C le haut de la rampe. La planche [BC] est l'hypoténuse, la hauteur [AC], le sol [AB]. b = l'angle B̂ (degrés
 * entiers), Ĉ = 90° − b.
 *
 *   mode 'name' (مبتدئ) : le sol AB est fixe (= hyp × cos angle, la rampe de départ) ; la main tient la HAUTEUR
 *     (donc b, au degré) ; l'élève choisit l'angle aigu (B ou C ; A, l'angle droit, est refusé), NOMME les trois
 *     côtés pour cet angle (chaque étiquette mal posée est refusée avec la raison), compose cos / sin / tan avec les
 *     côtés nommés (la planche au numérateur d'un sinus est refusée : le rapport dépasserait 1), puis lève la
 *     rampe : chaque position validée est un essai. La planche s'allonge avec la hauteur et reste plus longue.
 *   mode 'scale' (متقدم, نشاط 2) : B̂ = 40° imposé ; la main tient la LONGUEUR de la planche (au demi-mètre) et
 *     peut tourner l'angle ; l'élève enregistre des rampes et JUGE, avant de lire, si AC/BC et AC/AB sont restés
 *     ceux de la rampe précédente : la vérité (même angle ⇔ mêmes rapports) tranche.
 */
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';

const ROLES = Object.freeze(['hypotenuse', 'opposite', 'adjacent']);
export const SIDES = Object.freeze(['AB', 'AC', 'BC']);
export const KINDS = Object.freeze(['cos', 'sin', 'tan']);
export const SLOTS = Object.freeze(['num', 'den']);
const RANGE = Object.freeze({ name: Object.freeze([10, 65]), scale: Object.freeze([20, 65]) });
/** La planche en demi-mètres (متقدم) : 2 m … 9 m. */
export const LEN_RANGE = Object.freeze([4, 18]);
const LEN_START = 10; // 5 m : jamais une rampe du manuel (4, 6, 8)

const clamp = (v, [lo, hi]) => Math.max(lo, Math.min(hi, Math.round(v)));
export const fmt = (x, d = 2) => TR.roundTo(x, d);

/** Les nombres du niveau → le modèle. Un défaut de contenu lève une erreur au rendu. */
export function init({ angle = 30, hyp = 4, hyps = null, mode = 'name' } = {}) {
  if (mode !== 'name' && mode !== 'scale') throw new Error(`ramp-ratios: mode « ${mode} »`);
  const range = RANGE[mode];
  if (!Number.isInteger(angle) || angle < range[0] || angle > range[1]) throw new Error('ramp-ratios: angle hors du domaine');
  if (mode === 'name') {
    if (!(hyp > 0)) throw new Error('ramp-ratios: hyp > 0');
    const empty = () => ({ cos: {}, sin: {}, tan: {} });
    return Object.freeze({
      mode, range, angle0: angle, b: angle, run: hyp * TR.cosDeg(angle), hyp0: hyp,
      at: null, names: { B: {}, C: {} }, compose: { B: empty(), C: empty() }, trials: [], last: null,
    });
  }
  const marks = (hyps ?? []).map(Number);
  if (marks.some((m) => !(m * 2 >= LEN_RANGE[0] && m * 2 <= LEN_RANGE[1] && Number.isInteger(m * 2)))) throw new Error('ramp-ratios: hyps hors de la règle');
  return Object.freeze({ mode, range, angle0: angle, b: angle, i: LEN_START, marks, ramps: [], pending: null, last: null });
}

/* ── les mesures (ce que la règle lit) ── */

export const angleOf = (s, at = s.at, b = s.b) => (at === 'C' ? 90 - b : b);
export const lenOf = (s, i = s.i) => i / 2;
/** Les trois longueurs pour l'angle b (et la planche i en متقدم). */
export function lengths(s, b = s.b, i = s.i) {
  if (s.mode === 'name') return { AB: s.run, AC: s.run * TR.tanDeg(b), BC: s.run / TR.cosDeg(b) };
  const L = lenOf(s, i);
  return { AB: L * TR.cosDeg(b), AC: L * TR.sinDeg(b), BC: L };
}
/** La valeur d'un rapport de l'angle `at` (B ou C) — celle de la calculatrice, en degrés. */
export const value = (s, kind, at = s.at, b = s.b) => TR.ratioDeg(kind, angleOf(s, at, b));

/* ── nommer les côtés relativement à l'angle choisi ── */

/** côté → son vrai rôle pour l'angle `at` (« BC » → 'hypotenuse'). */
export function roleOfSide(at) {
  const t = TR.sides(['A', 'B', 'C'], 'A', at);
  return Object.fromEntries(Object.entries(t).map(([role, side]) => [side, role]));
}
export const sideOfRole = (at, role) => TR.sides(['A', 'B', 'C'], 'A', at)[role];

/** Toucher un sommet : B ou C choisit l'angle aigu ; A est l'angle droit (refusé). */
export function pick(s, v) {
  if (s.mode !== 'name') return s;
  if (v === 'A') return { ...s, last: { kind: 'rightAngle' } };
  if (v !== 'B' && v !== 'C') return s;
  return { ...s, at: v, last: { kind: v === s.at ? 'same' : 'picked', at: v } };
}

/** Poser l'étiquette `role` sur le côté `side` : true | raison du refus ('' = silencieux). */
export function canName(s, role, side) {
  if (s.mode !== 'name' || !s.at) return 'noAngle';
  const placed = s.names[s.at][side];
  if (placed) return placed === role ? '' : 'taken';
  const truth = roleOfSide(s.at)[side];
  if (truth === role) return true;
  return `${role}_${truth}`; // ex. 'opposite_hypotenuse' : la planche appelée « المقابل »
}
export function name(s, role, side) {
  if (canName(s, role, side) !== true) return s;
  const names = { ...s.names, [s.at]: { ...s.names[s.at], [side]: role } };
  return { ...s, names, last: { kind: 'named', role, side } };
}
export const namesDone = (s, at = s.at) => !!at && SIDES.every((sd) => !!s.names[at][sd]);
/** Les étiquettes encore à poser pour l'angle choisi. */
export const freeRoles = (s, at = s.at) => (at ? ROLES.filter((r) => !Object.values(s.names[at]).includes(r)) : [...ROLES]);

/* ── composer cos / sin / tan avec les côtés nommés ── */

/** Le côté attendu dans `slot` de `kind` pour l'angle `at`. */
export const wantedSide = (at, kind, slot) => sideOfRole(at, TR.RATIO_SIDES[kind][slot]);

/** Poser le côté `side` dans la case `slot` du rapport `kind` : true | raison. */
export function canFill(s, kind, slot, side) {
  if (s.mode !== 'name' || !namesDone(s)) return 'noNames';
  const row = s.compose[s.at][kind];
  if (row[slot]) return row[slot] === side ? '' : 'taken';
  if (side === wantedSide(s.at, kind, slot)) return true;
  const role = roleOfSide(s.at)[side];
  if (kind === 'tan') return role === 'hypotenuse' ? 'tanNoHyp' : 'tanInverted';
  if (role === 'hypotenuse') return 'hypOnTop';                 // le rapport dépasserait 1
  if (slot === 'den') return 'legBelow';                          // le dénominateur de sin / cos est la planche
  return kind === 'cos' ? 'cosOpposite' : 'sinAdjacent';           // l'autre côté de l'angle droit : l'autre rapport
}
export function fill(s, kind, slot, side) {
  if (canFill(s, kind, slot, side) !== true) return s;
  const at = s.at;
  const rows = { ...s.compose[at], [kind]: { ...s.compose[at][kind], [slot]: side } };
  return { ...s, compose: { ...s.compose, [at]: rows }, last: { kind: 'filled', ratio: kind, slot, side } };
}
export const rowDone = (s, kind, at = s.at) => !!at && SLOTS.every((sl) => !!s.compose[at][kind][sl]);
export const composeDone = (s, at = s.at) => !!at && KINDS.every((k) => rowDone(s, k, at));

/** Le rapport (refusé) que donnerait ce côté dans cette case : de quoi chiffrer le refus. */
export function wrongRatio(s, kind, slot, side) {
  const len = lengths(s);
  const otherSlot = slot === 'num' ? 'den' : 'num';
  // le côté de l'AUTRE case posé ici : c'est le rapport renversé ; sinon ce côté remplace le bon
  const other = side === wantedSide(s.at, kind, otherSlot) ? wantedSide(s.at, kind, slot) : wantedSide(s.at, kind, otherSlot);
  const [n, d] = slot === 'num' ? [side, other] : [other, side];
  return { num: n, den: d, value: len[n] / len[d] };
}

/* ── lever la rampe (مبتدئ) : la hauteur, donc b ── */

export function setB(s, b) {
  const nb = clamp(b, s.range);
  if (nb === s.b) return s;
  return { ...s, b: nb, last: { kind: 'move' } };
}
/** Une position VALIDÉE (relâchement, pause du clavier) : un essai si les trois rapports sont composés. */
export function commitB(s, b) {
  const nb = clamp(b, s.range);
  let n = { ...s, b: nb };
  if (s.mode !== 'name') return n;
  if (composeDone(n) && !n.trials.some((t) => t.b === nb && t.at === n.at)) {
    const len = lengths(n, nb);
    const trial = {
      n: n.trials.length + 1, b: nb, at: n.at, angle: angleOf(n, n.at, nb),
      values: Object.fromEntries(KINDS.map((k) => [k, value(n, k, n.at, nb)])),
      AB: len.AB, AC: len.AC, BC: len.BC,
    };
    n = { ...n, trials: [...n.trials, trial] };
  }
  const len = lengths(n, nb);
  n.last = nb === s.range[1] ? { kind: 'top', AC: len.AC, BC: len.BC } : nb === s.range[0] ? { kind: 'bottom', AB: len.AB, BC: len.BC } : { kind: 'trial' };
  return n;
}

/* ── la rampe à agrandir (متقدم) ── */

export function setLen(s, i) {
  const ni = clamp(i, LEN_RANGE);
  if (ni === s.i) return s;
  return { ...s, i: ni, last: { kind: 'move' } };
}
export const setAngle = (s, b) => {
  const nb = clamp(b, s.range);
  if (nb === s.b) return s;
  return { ...s, b: nb, last: { kind: nb === s.angle0 ? 'backTo40' : 'turn' } };
};
const rampOf = (s, n, b, i, extra = {}) => {
  const len = lengths(s, b, i);
  return { n, b, i, len: lenOf(s, i), AB: len.AB, AC: len.AC, sin: TR.sinDeg(b), tan: TR.tanDeg(b), ...extra };
};
/** Enregistrer la rampe construite : la première se lit tout de suite ; les suivantes attendent un jugement. */
export function record(s) {
  if (s.mode !== 'scale' || s.pending) return s;
  if (s.ramps.some((r) => r.b === s.b && r.i === s.i)) return { ...s, last: { kind: 'dup' } };
  const prev = s.ramps.at(-1);
  if (!prev) {
    const ramp = rampOf(s, 1, s.b, s.i, { says: null, ok: true, ref: null });
    return { ...s, ramps: [ramp], last: { kind: 'first', n: 1 } };
  }
  return { ...s, pending: { b: s.b, i: s.i }, last: { kind: 'ask' } };
}
/** La vérité : les rapports d'une rampe ne dépendent que de son angle. */
const sameRatios = (r1, r2) => r1.b === r2.b;
/** Juger : 'same' (« لم تتغيّر النسبتان ») ou 'changed' (« تغيّرتا »), par rapport à la rampe précédente. */
export function claim(s, says) {
  if (!s.pending) return s;
  const prev = s.ramps.at(-1);
  const truth = sameRatios(prev, s.pending) ? 'same' : 'changed';
  const ok = says === truth;
  const ramp = rampOf(s, s.ramps.length + 1, s.pending.b, s.pending.i, { says, ok, ref: prev.n });
  return { ...s, pending: null, ramps: [...s.ramps, ramp], last: { kind: ok ? 'claimOk' : 'claimWrong', truth, n: ramp.n, ref: prev.n } };
}

/* ── refaire LA MÊME étape (« أعِد التجربة » des questions pendant le labo, 2026-10-28) ── */

const emptyRows = () => ({ cos: {}, sin: {}, tan: {} });
/** مبتدئ : les étiquettes de l'angle choisi (et donc les rapports composés avec elles) sont effacées. */
export const retryNames = (s) => (s.mode !== 'name' || !s.at ? s : { ...s, names: { ...s.names, [s.at]: {} }, compose: { ...s.compose, [s.at]: emptyRows() }, last: null });
/** مبتدئ : les trois rapports de l'angle choisi sont à recomposer. */
export const retryCompose = (s) => (s.mode !== 'name' || !s.at ? s : { ...s, compose: { ...s.compose, [s.at]: emptyRows() }, last: null });
/** متقدم : les rampes à l'angle de départ sont à refaire (l'angle revient à celui du départ). */
export const retrySizes = (s) => (s.mode !== 'scale' ? s : { ...s, b: s.angle0, i: LEN_START, ramps: [], pending: null, last: null });
/** متقدم : les rampes à un autre angle sont retirées ; on revient à l'angle de départ. */
export const retryTurn = (s) => (s.mode !== 'scale' ? s : { ...s, b: s.angle0, ramps: s.ramps.filter((r) => r.b === s.angle0), pending: null, last: null });

/* ── ce qui reste à faire (orientation, jamais la réponse) et la découverte ── */

export function progress(s) {
  if (s.mode === 'name') {
    const composedAt = ['B', 'C'].find((at) => composeDone(s, at)) ?? null;
    const bs = [...new Set(s.trials.map((t) => t.b))];
    return {
      picked: !!s.at, named: namesDone(s), composed: !!composedAt,
      trials: bs.length, span: bs.length ? Math.max(...bs) - Math.min(...bs) : 0,
    };
  }
  const at0 = s.ramps.filter((r) => r.b === s.angle0);
  return { sizes: new Set(at0.map((r) => r.i)).size, turned: s.ramps.some((r) => r.b !== s.angle0) };
}
export function discoveryReady(s) {
  const p = progress(s);
  if (s.mode === 'name') return p.composed && p.trials >= 3 && p.span >= 20;
  return p.sizes >= 3 && p.turned;
}
/** Les témoins de la découverte (les nombres de l'élève). */
export function witnesses(s) {
  if (s.mode === 'name') {
    if (!s.trials.length) return { high: null, low: null };
    const high = s.trials.reduce((m, t) => (t.b > m.b ? t : m));
    const low = s.trials.reduce((m, t) => (t.b < m.b ? t : m));
    return { high, low };
  }
  const at0 = s.ramps.filter((r) => r.b === s.angle0);
  const small = at0.length ? at0.reduce((m, r) => (r.i < m.i ? r : m)) : null;
  const big = at0.length ? at0.reduce((m, r) => (r.i > m.i ? r : m)) : null;
  const other = s.ramps.find((r) => r.b !== s.angle0) ?? null;
  return { small, big, other };
}
/** Ce qu'un essai / une rampe dit au module (`onTrial`). */
export function evidenceOf(s, item) {
  if (s.mode === 'name') {
    return { mode: 'name', n: item.n, at: item.at, angle: item.angle, b: item.b, cos: fmt(item.values.cos), sin: fmt(item.values.sin), tan: fmt(item.values.tan) };
  }
  return { mode: 'scale', n: item.n, b: item.b, len: fmt(item.len, 1), AC: fmt(item.AC), AB: fmt(item.AB), sin: fmt(item.sin), tan: fmt(item.tan), says: item.says, ok: item.ok };
}

/* ── la géométrie du dessin (flottants) ── */

/**
 * La boîte du dessin, en mètres, FIXE pour tout le niveau (la poignée reste sous le doigt) : en مبتدئ elle contient
 * la rampe la plus raide et les deux « fantômes » de la planche (couchée sur le sol, debout le long de la hauteur) ;
 * en متقدم la plus grande planche à tous les angles.
 */
function box(s, { compact = false } = {}) {
  if (s.mode === 'name') {
    const big = s.run / TR.cosDeg(s.range[1]);
    // compact (téléphone) : la boîte s'arrête un peu après A — l'arc couché sur le sol peut sortir du cadre à droite,
    // la rampe y gagne la largeur ; sa partie haute (la planche debout au-dessus de B) reste visible.
    return { xMin: -0.9, xMax: compact ? s.run + 1.9 : big + 0.5, yMin: -1.1, yMax: big + 0.45, ghost: 0.45 };
  }
  const L = lenOf(s, LEN_RANGE[1]);
  return { xMin: -0.9, xMax: L * TR.cosDeg(s.range[0]) + 0.6, yMin: -0.9, yMax: L * TR.sinDeg(s.range[1]) + 0.5, ghost: 0 };
}
/** Échelle et conversion mètres → pixels (y vers le bas) pour une largeur et une hauteur maximale. */
export function layout(s, { width, maxHeight, compact = false }) {
  const bx = box(s, { compact });
  const w = bx.xMax - bx.xMin; const h = bx.yMax - bx.yMin;
  const scale = Math.max(4, Math.min(width / w, maxHeight / h));
  const W = Math.round(width);
  const H = Math.round(h * scale);
  const ox = (W - w * scale) / 2;
  const px = ([x, y]) => [ox + (x - bx.xMin) * scale, (bx.yMax - y) * scale];
  const toMeters = ([X, Y]) => [(X - ox) / scale + bx.xMin, bx.yMax - Y / scale];
  return { W, H, scale, px, toMeters, box: bx };
}
/** Les trois sommets (mètres). */
export function vertices(s, b = s.b, i = s.i) {
  const len = lengths(s, b, i);
  return { B: [0, 0], A: [len.AB, 0], C: [len.AB, len.AC] };
}
/** Poignée de hauteur (مبتدئ) : un point → l'angle b au degré (le sol AB est fixe). */
export function bFromPoint(s, [, y]) {
  const yy = Math.max(0.05, y);
  return clamp((Math.atan2(yy, s.run) * 180) / Math.PI, s.range);
}
/** Poignée de planche (متقدم) : la projection du point sur la planche → la longueur au demi-mètre. */
export function iFromPoint(s, [x, y]) {
  const L = x * TR.cosDeg(s.b) + y * TR.sinDeg(s.b);
  return clamp(L * 2, LEN_RANGE);
}
/** Poignée d'angle (متقدم) : la direction du point vu de B → b au degré. */
export function angleFromPoint(s, [x, y]) {
  return clamp((Math.atan2(Math.max(0, y), Math.max(0.01, x)) * 180) / Math.PI, s.range);
}

/* ── « جرّب كل الإمكانيات » (مبتدئ, étape « explore ») : tous les degrés de la rampe ───────────── */

/**
 * Les degrés b qu'il reste à essayer, du plus petit au plus grand. Seul le mode `name` est un balayage, et
 * seulement quand les trois rapports sont composés (sinon `commitB` n'enregistre pas d'essai) : avant, l'élève
 * doit encore choisir l'angle, nommer les côtés et composer — des choix, pas une liste. `scale` (متقدم) demande
 * un JUGEMENT par rampe : jamais automatique.
 */
export function tryAllPlan(s) {
  if (s.mode !== 'name' || !composeDone(s)) return [];
  const tried = new Set(s.trials.filter((t) => t.at === s.at).map((t) => t.b));
  const plan = [];
  for (let b = s.range[0]; b <= s.range[1]; b += 1) if (!tried.has(b)) plan.push(b);
  return plan;
}
