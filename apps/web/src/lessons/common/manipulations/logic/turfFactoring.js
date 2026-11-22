import * as polynomials from '@smarter-academy/core/arithmetic/polynomials.js';

const { termsTex, termTex, gcd, commonMonomial, reduce } = polynomials;

/**
 * turf-factoring — LE TERRAIN EN GAZON (unité 3 « الحساب الحرفي », leçon 3 et synthèse).
 *
 * Le geste INVERSE du terrain découpé : on ne coupe plus un terrain en zones,
 * on ASSEMBLE des plaques de gazon en un terrain rectangulaire. Les plaques
 * sont les termes de la somme : un carré x × x (x²), une bande x × 1 (x), un
 * carreau 1 × 1 (1). Si les plaques forment un rectangle, ses deux côtés SONT
 * les deux facteurs — c'est l'analyse (تحليل) : écrire une somme en produit.
 *
 * Deux modes, deux lectures du manuel (معارف 3, p. 34) :
 *
 *   rows    la distributivité à l'envers, ka + kb = k(a + b). L'élève ÉTIRE r,
 *           le nombre de RANGÉES identiques. Les plaques se répartissent : si r
 *           ne divise pas chaque nombre de plaques, les restes tombent hors du
 *           terrain (refus). La hauteur du terrain (r rangées de hauteur 1 ou x)
 *           est le facteur commun ; une rangée est l'autre facteur. Le plus
 *           grand r est le PGCD des coefficients — le facteur commun complet.
 *
 *   square  a² + 2ab + b² = (a + b)². Un carré x², b bandes, c carreaux.
 *           L'élève PORTE chaque bande à droite ou en bas du carré ; le coin
 *           exige alors p × q carreaux. Le terrain ne se ferme que si c = p × q :
 *           pour x² + 6x + 9, 2 | 4 exige 8 carreaux et refuse ; 3 | 3 ferme un
 *           CARRÉ (x + 3)². x² + 25 ne se ferme jamais : « لا تقبل تحليلا ».
 */

/** « 6x^2+4x », « 9x+3 », « 7x-21 » → [{c, p}] (puissances ≤ 2). */
export function parseTerms(src) {
  const parts = String(src).replace(/\s+/g, '').match(/[+-]?[^+-]+/g) ?? [];
  return parts.map((part) => {
    const m = part.match(/^([+-]?)(\d*)(x(?:\^(\d))?)?$/);
    if (!m || (m[2] === '' && !m[3])) throw new Error(`turf-factoring: terme illisible « ${part} »`);
    const sign = m[1] === '-' ? -1 : 1;
    const c = m[2] === '' ? 1 : Number(m[2]);
    const p = m[3] ? Number(m[4] ?? 1) : 0;
    return { c: sign * c, p };
  });
}

/* ── Mode rows : le facteur commun ─────────────────────────────────────── */

export function initRows({ expr }) {
  const terms = parseTerms(expr);
  const m = Math.min(...terms.map((t) => t.p));
  if (Math.max(...terms.map((t) => t.p)) - m > 1) throw new Error('turf-factoring rows: une rangée ne porte que deux sortes de plaques');
  return { mode: 'rows', expr, terms, m, r: null, tried: [] };
}

/** La règle de r : de 1 au plus grand nombre de plaques d'une sorte (borné à 12). */
export const rowsRange = (s) => ({ min: 1, max: Math.min(12, Math.max(2, ...s.terms.map((t) => Math.abs(t.c)))) });

/** Le découpage en r rangées : { r, valid, perRow: [{c,p}], leftover: [{c,p}] }. */
export function rowsLayout(s, r) {
  const perRow = s.terms.map((t) => ({ c: Math.trunc(t.c / r), p: t.p }));
  const leftover = s.terms.map((t) => ({ c: t.c - r * Math.trunc(t.c / r), p: t.p })).filter((t) => t.c !== 0);
  return { r, valid: leftover.length === 0, perRow, leftover };
}

export function canRow(s, r) {
  const { min, max } = rowsRange(s);
  if (!Number.isInteger(r) || r < min || r > max) return 'outOfRange';
  return true;
}

export function setRows(s, r) {
  if (canRow(s, r) !== true) return s;
  const l = rowsLayout(s, r);
  return { ...s, r, tried: [...s.tried.filter((t) => t.r !== r), { r, valid: l.valid }].sort((a, b) => a.r - b.r) };
}

/**
 * Le r affiché à l'ouverture (jamais un essai, jamais une réponse) : le premier nombre de rangées qui ne
 * partage PAS les plaques (un reste tombe hors du terrain) ; sinon (tout r convient) le minimum de la règle.
 */
export function defaultRows(s) {
  const { min, max } = rowsRange(s);
  for (let r = min; r <= max; r += 1) if (!rowsLayout(s, r).valid) return r;
  return min;
}

/** « جرّب كل الإمكانيات » : les r de la règle pas encore validés. */
export function untriedRows(s) {
  if (s.mode !== 'rows') return [];
  const { min, max } = rowsRange(s);
  const out = [];
  for (let r = min; r <= max; r += 1) if (!s.tried.some((t) => t.r === r)) out.push(r);
  return out;
}

/** Le plus grand nombre de rangées possible : le PGCD des coefficients. */
export const rowsGcd = (s) => s.terms.reduce((g, t) => gcd(g, t.c), 0);

/** Découverte : le plus grand r essayé ET juste, et un r refusé (le contraste). */
export function rowsDiscoveryReady(s) {
  const g = rowsGcd(s);
  return s.tried.some((t) => t.r === g && t.valid) && s.tried.some((t) => !t.valid);
}

/** Le facteur commun des r rangées : r·x^m (écrit « 2x », « 3 », « x »). */
export const rowsCommon = (s, r) => ({ c: r, p: s.m });

/** L'égalité lue sur le terrain : 6x^2 + 4x = 2x(3x + 2). */
export function rowsEquationTex(s, r) {
  const l = rowsLayout(s, r);
  if (!l.valid) return null;
  const common = termTex(rowsCommon(s, r), { lead: true });
  const other = termsTex(l.perRow.map((t) => ({ c: t.c, p: t.p - s.m })));
  const lhs = termsTex(s.terms);
  const commonTex = common === '1' ? '' : common;
  return `${lhs} = ${commonTex}(${other})`;
}

/** Le facteur commun le plus grand (monôme) — garde-fou des tests. */
export const fullCommon = (s) => commonMonomial(s.terms);

/* ── Mode square : l'identité remarquable ──────────────────────────────── */

export function initSquare({ b, c }) {
  return { mode: 'square', b, c, right: 0, bottom: 0, trials: [], closed: null };
}

export const stock = (s) => s.b - s.right - s.bottom;

/** Porter une bande : de la réserve vers « right » / « bottom », ou revenir en réserve. */
export function canPlace(s, from, to) {
  if (from === to) return '';
  if (s.closed) return 'closed';
  if (from === 'stock' && stock(s) <= 0) return '';
  if (from === 'right' && s.right <= 0) return '';
  if (from === 'bottom' && s.bottom <= 0) return '';
  return true;
}

export function place(s, from, to) {
  if (canPlace(s, from, to) !== true) return s;
  const n = { ...s };
  if (from === 'right') n.right -= 1;
  if (from === 'bottom') n.bottom -= 1;
  if (to === 'right') n.right += 1;
  if (to === 'bottom') n.bottom += 1;
  return n;
}

/** Le coin exige right × bottom carreaux. */
export const cornerNeed = (s) => s.right * s.bottom;

/**
 * Fermer le terrain : toutes les bandes posées, et exactement right × bottom
 * carreaux pour le coin. Un refus garde sa raison et ses nombres.
 */
export function canClose(s) {
  if (s.closed) return 'closed';
  if (stock(s) > 0) return 'stripsLeft';
  if (cornerNeed(s) !== s.c) return cornerNeed(s) > s.c ? 'cornerShort' : 'cornerExtra';
  return true;
}

export function close(s) {
  const verdict = canClose(s);
  if (verdict === 'closed' || verdict === 'stripsLeft') return s;
  const trial = { right: s.right, bottom: s.bottom, need: cornerNeed(s), ok: verdict === true };
  const trials = [...s.trials.filter((t) => !(t.right === trial.right && t.bottom === trial.bottom)), trial];
  return { ...s, trials, closed: verdict === true ? { p: s.right, q: s.bottom } : null };
}

/** Rouvrir le terrain fermé pour essayer une autre répartition. */
export const reopen = (s) => ({ ...s, closed: null });

/** Existe-t-il une répartition qui ferme ? (p + q = b et p × q = c) */
export function closable(s) {
  for (let p = 0; p <= s.b; p += 1) if (p * (s.b - p) === s.c) return true;
  return false;
}

/**
 * Découverte : un terrain CARRÉ fermé (p = q) et une répartition refusée —
 * ou, pour une somme qui ne se ferme jamais (x² + 25), le refus lui-même :
 * la seule répartition possible a été essayée.
 */
export function squareDiscoveryReady(s) {
  if (!closable(s)) return s.trials.length > 0 && s.b === 0 ? true : s.trials.filter((t) => !t.ok).length >= Math.min(2, s.b + 1);
  return s.trials.some((t) => t.ok && t.right === t.bottom) && s.trials.some((t) => !t.ok);
}

export const squareExprTex = (s) => termsTex([{ c: 1, p: 2 }, ...(s.b ? [{ c: s.b, p: 1 }] : []), ...(s.c ? [{ c: s.c, p: 0 }] : [])]);

/** L'égalité du terrain fermé : x^2 + 6x + 9 = (x + 3)^2, ou (x + 2)(x + 4). */
export function squareEquationTex(s) {
  if (!s.closed) return null;
  const { p, q } = s.closed;
  const side = (k) => (k === 0 ? 'x' : `(x + ${k})`);
  const rhs = p === q ? (p === 0 ? 'x^2' : `(x + ${p})^2`) : `${side(p)}${side(q)}`;
  return `${squareExprTex(s)} = ${rhs}`;
}

/** La somme des plaques en LaTeX : « 6x^2 + 4x ». */
export const rowsExprTex = (s) => termsTex(s.terms);
/** La hauteur du terrain à r rangées : « 2x », « 3 », « x ». */
export const rowsCommonTex = (s, r) => termTex(rowsCommon(s, r), { lead: true });

/* ══════════════ LECTEUR DE MISSION (rollout 2026-11-11, unité 3 leçon 3 `tahlil-ibara` ; conseil du 2026-11-11, verdict « L3 ») ══════════════ */

/** La longueur « x » dessinée (non entière : une bande ne passe jamais pour 4 carreaux). */
export const XU = 3.6;

/**
 * Un ESSAI du lecteur : un r NOUVEAU validé (rows) ou une répartition NOUVELLE fermée (square). Le même r (la même répartition) deux fois
 * n'est pas un nouvel essai : son verdict est ré-annoncé, la manche ne le recompte pas (un refus répété ne mène pas à « جرّب أصغر »).
 * `lab` est l'état AVANT le geste.
 */
export const isNewRows = (lab, r) => !lab.tried.some((t) => t.r === r);
export const isNewSplit = (lab, right = lab.right, bottom = lab.bottom) => !lab.trials.some((t) => t.right === right && t.bottom === bottom);

/**
 * Ce que la manche reçoit d'un essai (`onVerdict`) :
 *   rows   — groups = r, exact = toutes les plaques rangées ; r = 1 n'est PAS un essai (une seule rangée prend tout : toujours juste, rien appris) ;
 *   square — groups = le nombre de bandes à droite, exact = le terrain fermé.
 */
export function verdictOf(lab, trial) {
  if (!trial) return null;
  if (lab.mode === 'rows') return trial.r === 1 ? null : Object.freeze({ groups: trial.r, exact: Boolean(trial.valid) });
  return Object.freeze({ groups: trial.right, exact: Boolean(trial.ok) });
}

/** Le contenu d'une rangée à r rangées, et sa largeur / hauteur en unités (une plaque x² = XU × XU ; m = 0 : bande XU × 1, carreau 1 × 1). */
const tileUnits = (lab, p) => (lab.m === 1 ? (p === 2 ? [XU, XU] : [1, XU]) : (p === 1 ? [XU, 1] : [1, 1]));
const rowUnits = (lab, terms) => terms.reduce((w, t) => w + Math.abs(t.c) * tileUnits(lab, t.p)[0], 0);

/**
 * La BOÎTE du terrain à r rangées (unités ; le composant ajoute ses marges en pixels) : `w` la largeur d'une rangée, `h` la hauteur des r rangées,
 * `left` la largeur des plaques restées dehors (0 si le terrain est juste), `tiles` le nombre de plaques d'une rangée (les espaces entre elles).
 */
export function rowsBox(lab, r) {
  const l = rowsLayout(lab, r);
  const tall = lab.m === 1 ? XU : 1;
  return {
    w: rowUnits(lab, l.perRow), h: r * tall, tall,
    left: l.valid ? 0 : rowUnits(lab, l.leftover), tiles: l.perRow.reduce((n, t) => n + Math.abs(t.c), 0),
  };
}

/** La boîte du carré (unités) au pire : toutes les bandes d'un côté, la réserve sur une ligne. */
export function squareBox(lab) {
  return { w: XU + Math.max(2, lab.b) + 1, h: XU + Math.max(1, lab.b) + 1 };
}

/* ── les PRÉDICTIONS (≤ 2 par manche) : des clés ; les options et la vérité sont CALCULÉES ici ── */

export const PREDICT_KEYS = Object.freeze({ rows: Object.freeze(['rowHeight', 'maxRows']), square: Object.freeze(['sideStrips', 'closes']) });

const maxCount = (lab) => Math.max(...lab.terms.map((t) => Math.abs(t.c)));

/**
 * Les options d'une prédiction, dans l'ordre de l'écran (la bonne ne tient pas toujours la même place d'une manche à l'autre) :
 *   rowHeight  « ارتفاع صفّ واحد؟ »             — 1, g, x (m = 1 : la bonne, x, en dernier ; m = 0 : 1 en premier) ;
 *   maxRows    « أكبر عدد من الصفوف المتماثلة؟ » — le plus grand nombre de plaques d'une sorte, g, 1 (la bonne au milieu) ;
 *   sideStrips « كم شريطًا على كل جهة؟ »         — b/2, b, c (la bonne en premier) ;
 *   closes     « هل يُغلق الملعب؟ »              — yesSquare, no, yesSpread (la bonne, « لا », au milieu pour x² + c sans bande).
 */
export function predictOptions(lab, key) {
  if (key === 'rowHeight') return ['1', String(rowsGcd(lab)), 'x'];
  if (key === 'maxRows') return [...new Set([maxCount(lab), rowsGcd(lab), 1])];
  if (key === 'sideStrips') return [...new Set([lab.b / 2, lab.b, lab.c])];
  if (key === 'closes') return ['yesSquare', 'no', 'yesSpread'];
  return [];
}

export function predictTruth(lab, key) {
  if (key === 'rowHeight') return lab.m === 1 ? 'x' : '1';
  if (key === 'maxRows') return rowsGcd(lab);
  if (key === 'sideStrips') return lab.b / 2;
  if (key === 'closes') return closable(lab) ? 'yesSquare' : 'no';
  return null;
}

/** Les prédictions JUGÉES par le terrain : le plus grand r juste vu (rows) ; un carré fermé (sideStrips) ; un essai fait (closes) ; toutes quand `all`. */
export function judgedPredictions(lab, keys, all = false) {
  return keys.filter((key) => {
    if (all) return true;
    if (key === 'rowHeight' || key === 'maxRows') return lab.tried.some((t) => t.valid && t.r === rowsGcd(lab));
    if (key === 'sideStrips') return lab.trials.some((t) => t.ok);
    if (key === 'closes') return lab.trials.length > 0;
    return false;
  });
}

/**
 * Le GUIDE (LabCoach) du lecteur — le geste, jamais la réponse (ni le bon r, ni la bonne répartition) :
 *   rows   : la poignée (« اسحب r ») → après un PREMIER refus, une ligne neutre sur les plaques restées dehors (« انظر ماذا أضاء », conseil
 *            « First refusals ») → la règle (« جرّب عددًا آخر من الصفوف » — jamais « أكبر » : une direction serait une réponse) ;
 *   square : la réserve (« اسحب شريطًا ») → « أغلق الملعب » → après un refus, une ligne neutre sur le coin → déplacer une bande ; terrain fermé
 *            mais la manche attend un refus → « أعد فتح الملعب ».
 * `ctx` : { done } — la manche n'attend plus rien du labo ; { r } — le r à l'écran (rows).
 */
export function coachOf(lab, ctx = {}) {
  if (ctx.done) return null;
  if (lab.mode === 'rows') {
    const real = lab.tried.filter((t) => t.r !== 1);
    if (real.length === 0) return { id: 'drag', target: '[data-turf-handle]', gesture: 'drag', prefer: 'below' };
    const refused = real.filter((t) => !t.valid);
    const shownRefused = ctx.r != null && refused.some((t) => t.r === ctx.r);
    if (refused.length === 1 && real.length === 1 && shownRefused) return { id: 'look', target: '[data-turf-leftover]', gesture: 'tap', prefer: 'above' };
    return { id: 'another', target: '[data-turf-ruler]', gesture: 'drag', prefer: 'below' };
  }
  if (lab.closed) return { id: 'reopen', target: '[data-turf-reopen]', gesture: 'tap', prefer: 'above' };
  if (lab.b > 0 && lab.right + lab.bottom === 0 && lab.trials.length === 0) return { id: 'stock', target: '[data-turf-stock]', gesture: 'drag', prefer: 'above' };
  if (stock(lab) > 0) return { id: 'place', target: '[data-turf-stock]', gesture: 'drag', prefer: 'above' };
  const last = lab.trials.at(-1);
  if (!last) return { id: 'close', target: '[data-turf-close]', gesture: 'tap', prefer: 'above' };
  const sameAsLast = last.right === lab.right && last.bottom === lab.bottom;
  if (!last.ok && sameAsLast && lab.trials.length === 1) return { id: 'lookCorner', target: '[data-turf-corner]', gesture: 'tap', prefer: 'below' };
  if (!last.ok && sameAsLast && lab.b > 0) return { id: 'move', target: '[data-turf-square]', gesture: 'drag', prefer: 'below' };
  return { id: 'close', target: '[data-turf-close]', gesture: 'tap', prefer: 'above' };
}

/* ── les questions du lecteur : leurs nombres, CALCULÉS et vérifiés par l'algèbre (`samePolynomial`) ── */

const tt = (t) => termTex(t, { lead: true });

/** « في كل صفّ: ▢ » (rows, au plus grand r) : le nombre de plaques de la sorte la plus haute dans UNE rangée ; leurres : le total, l'autre sorte. */
export function rowFillParts(lab) {
  const g = rowsGcd(lab);
  const [a, b] = lab.terms;
  const right = Math.abs(a.c) / g;
  const opts = [...new Set([right, Math.abs(a.c), Math.abs(b.c) / g, right + 1])].filter((n) => n > 0).slice(0, 3);
  return { kind: lab.m === 1 ? 'x2' : 'x', expected: String(right), options: opts.map(String) };
}

/** « ارتفاع الملعب كاملًا = ▢ » (rows, m = 1) : g·x ; leurres : g seul (la lettre oubliée), x seul (une rangée). */
export function heightFillParts(lab) {
  const g = rowsGcd(lab);
  const full = tt({ c: g, p: lab.m });
  return { expected: full, options: [String(g), 'x', full].filter((v, i, a) => a.indexOf(v) === i) };
}

/**
 * BÂTIR « ka + kb = ▢(▢ + ▢) » : le facteur commun COMPLET et les deux termes de la rangée ; UN leurre = le dernier terme NON divisé (le facteur
 * « à moitié sorti »). `accept` : les deux termes du crochet échangés (pas pour une différence). Garde-fous (tests) : expand(facteur × crochet) = la somme ; avec le leurre,
 * jamais ; aucun autre arrangement des tuiles n'égale la somme.
 */
export function buildFactorParts(lab) {
  const g = rowsGcd(lab);
  const common = { c: g, p: lab.m };
  const inner = lab.terms.map((t) => ({ c: t.c / g, p: t.p - lab.m }));
  const decoy = { c: lab.terms[1].c, p: lab.terms[1].p - lab.m };
  const tex = [tt(common), tt(inner[0]), tt({ ...inner[1], c: Math.abs(inner[1].c) })];
  return {
    common, inner, decoy, sign: inner[1].c < 0 ? '-' : '+',
    expected: tex, accept: inner[1].c < 0 ? [] : [[tex[0], tex[2], tex[1]]], decoyTex: tt({ ...decoy, c: Math.abs(decoy.c) }),
  };
}

/** BÂTIR « x² + bx + c = (▢ + ▢)² » : x et b/2 ; UN leurre = c lui-même (le coin pris pour le côté — `sides.whyCorner`). */
export function buildSquareParts(lab) {
  const p = lab.b / 2;
  return { side: [{ c: 1, p: 1 }, { c: p, p: 0 }], expected: ['x', String(p)], accept: [[String(p), 'x']], decoyTex: String(lab.c) };
}

/* ── TOUT ce qu'un écran du lecteur peut montrer (règle « valeurs interdites par RÔLE », conseils du 2026-11-10 et du 2026-11-11) ── */

const norm = (s) => String(s).replace(/\s+/g, '');

/**
 * `{ role, v }` pour une manche (`props` d'une manche : { mode, expr | b, c, chains, predict, choices }) :
 *   rows   — `count` les nombres de plaques de chaque sorte, `pair` « a:b » ; `tick` 1…max de la règle ; pour CHAQUE r : juste → `common` (r·x^m),
 *            `inner` (la rangée), `perRow` « r:sorte×n », `eq` l'égalité ; refusé → `leftover` « r:sorte×n » ; les questions : `chip` (rowFill,
 *            heightFill), `tile` / `decoy-inner` / `decoy-eq` (la construction et son leurre développé) ; les options des prédictions (`option`) ;
 *   square — `count` b et c, `corner` le coin de CHAQUE répartition « p|q:need », `extra` les carreaux de trop, `eq` le carré fermé, `tile` /
 *            `decoy-eq` de la construction, `option`.
 * Les choix de la manche libre sont balayés comme des manches (`choices`).
 */
export function shownValues(props = {}) {
  const out = [];
  const push = (role, v) => out.push(Object.freeze({ role, v: norm(v) }));
  const one = (p) => {
    if (p.mode === 'square') {
      const lab = initSquare({ b: p.b ?? 6, c: p.c ?? 9 });
      push('count', lab.b); push('count', lab.c); push('expr', squareExprTex(lab));
      for (let right = 0; right <= lab.b; right += 1) {
        const need = right * (lab.b - right);
        push('corner', `${right}|${lab.b - right}:${need}`);
        push('corner', need);
        if (lab.c > need) push('extra', lab.c - need);
        if (need === lab.c) push('eq', squareEquationTex({ ...lab, closed: { p: right, q: lab.b - right } }));
      }
      if (closable(lab) && lab.b % 2 === 0) {
        const bp = buildSquareParts(lab);
        bp.expected.forEach((t) => push('tile', t)); push('tile', bp.decoyTex);
        push('decoy-eq', `${squareExprTex(lab)}=(x+${lab.c})^2`);
      }
      (p.predict ?? []).forEach((key) => predictOptions(lab, key).forEach((o) => push('option', o)));
      return;
    }
    const lab = initRows({ expr: p.expr ?? '6x^2+4x' });
    lab.terms.forEach((t) => push('count', Math.abs(t.c)));
    push('pair', lab.terms.map((t) => Math.abs(t.c)).join(':'));
    push('expr', rowsExprTex(lab));
    const { min, max } = rowsRange(lab);
    const kind = (t) => (t.p === 2 ? 'x2' : t.p === 1 ? 'x' : '1');
    for (let r = min; r <= max; r += 1) {
      push('tick', r);
      const l = rowsLayout(lab, r);
      if (l.valid) {
        push('common', rowsCommonTex(lab, r));
        push('inner', termsTex(l.perRow.map((t) => ({ c: t.c, p: t.p - lab.m }))));
        l.perRow.forEach((t) => push('perRow', `${r}:${kind(t)}×${Math.abs(t.c)}`));
        push('eq', rowsEquationTex(lab, r));
      } else {
        l.leftover.forEach((t) => push('leftover', `${r}:${kind(t)}×${Math.abs(t.c)}`));
      }
    }
    if (p.chains && p.chains !== 'none') {
      rowFillParts(lab).options.forEach((o) => push('chip', o));
      if (lab.m === 1) heightFillParts(lab).options.forEach((o) => push('chip', o));
      const bp = buildFactorParts(lab);
      bp.expected.forEach((t) => push('tile', t)); push('tile', bp.decoyTex);
      const decoyInner = [bp.inner[0], bp.decoy];
      push('decoy-inner', termsTex(decoyInner));
      push('decoy-eq', `${rowsExprTex(lab)}=${tt(bp.common)}(${termsTex(decoyInner)})`);
      push('decoy-eq', termsTex(reduce(decoyInner.map((t) => ({ c: t.c * bp.common.c, p: t.p + bp.common.p })))));
    }
    (p.predict ?? []).forEach((key) => predictOptions(lab, key).forEach((o) => push('option', o)));
  };
  one(props);
  (props.choices ?? []).forEach((c) => one(c));
  return out;
}
