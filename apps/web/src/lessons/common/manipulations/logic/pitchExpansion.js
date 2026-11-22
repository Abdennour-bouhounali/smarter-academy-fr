import * as polynomials from '@smarter-academy/core/arithmetic/polynomials.js';

const { partialProducts, reduce, evaluate, termsTex, factorTex, termTex, samePolynomial } = polynomials;

/**
 * pitch-expansion — LE TERRAIN DÉCOUPÉ (unité 3 « الحساب الحرفي », leçons 1 et 2).
 *
 * Un terrain rectangulaire dont la LONGUEUR est le premier facteur et la
 * LARGEUR le second : (3x − 1)(3 + x). Chaque terme d'un facteur est un
 * segment du côté ; le terrain se découpe donc en zones, une par couple de
 * termes, et l'aire de chaque zone est un produit partiel. C'est la lecture
 * par aires du manuel (le carré MNPQ, p. 32 ; le tableau de Descartes, p. 31).
 *
 * Trois gestes, une seule mathématique :
 *   ÉTIRER x      la lettre est une longueur : le terrain grandit, les zones
 *                 suivent ; l'égalité doit tenir POUR TOUTE valeur de x.
 *   PORTER        chaque zone dans « المجموع » : le développement s'écrit
 *                 terme à terme, sous les yeux, à partir des zones portées.
 *   FUSIONNER     deux termes SEMBLABLES (même puissance) se réunissent ;
 *                 deux termes non semblables REFUSENT (x² est un carré, 3x
 *                 une bande) — c'est la réduction (تبسيط).
 *
 * RÉSISTANCE : « تحقّق » compare l'aire du terrain (le produit) à la somme
 * portée, pour la valeur de x à l'écran. Tant qu'une zone manque, la somme
 * est TROP PETITE (ou trop grande, pour une zone retranchée) et la zone
 * oubliée s'allume avec son aire — c'est l'erreur (a + b)² = a² + b² rendue
 * visible : les deux bandes ab manquent.
 *
 * Termes négatifs (a − b) : le segment −b est RETRANCHÉ de a, dessiné hachuré
 * à l'intérieur ; la zone (−b)(−d) retranchée deux fois est RAJOUTÉE
 * (hachures croisées) — la figure de (a − b)² du manuel.
 */

const TERM_RE = /^([+-]?)(\d*)(x?)$/;

/** « 3x-1 » → [{c:3,p:1},{c:-1,p:0}] ; « x+10+x » garde les deux x (un côté fait de trois segments). */
export function parseFactor(src) {
  const parts = String(src).replace(/\s+/g, '').match(/[+-]?[^+-]+/g) ?? [];
  return parts.map((part) => {
    const m = part.match(TERM_RE);
    if (!m || (m[2] === '' && m[3] === '')) throw new Error(`pitch-expansion: terme illisible « ${part} »`);
    const sign = m[1] === '-' ? -1 : 1;
    const c = m[2] === '' ? 1 : Number(m[2]);
    return { c: sign * c, p: m[3] ? 1 : 0 };
  });
}

/** « 3x-1|3+x » → [f1, f2]. Un seul facteur ⇒ son carré (« x+3 » ⇔ « x+3|x+3 »). */
export function parseExpr(expr) {
  const [a, b] = String(expr).split('|');
  const f1 = parseFactor(a);
  return [f1, b == null ? f1 : parseFactor(b)];
}

const sameFactor = (f, g) => f.length === g.length && f.every((t, k) => t.c === g[k].c && t.p === g[k].p);

/** La nature du produit, qui choisit la découverte (le vocabulaire du manuel). */
export function kindOf([f1, f2]) {
  if (f1.length === 1 || f2.length === 1) return 'distributive';
  if (f1.length === 2 && f2.length === 2) {
    if (sameFactor(f1, f2)) return f1[1].c < 0 ? 'square-diff' : 'square-sum';
    const flip = (f) => [f[0], { ...f[1], c: -f[1].c }];
    if (sameFactor(f1, flip(f2)) && f1[0].c > 0) return 'sum-diff';
  }
  return 'double';
}

/** La valeur (entière) d'un terme pour x. */
const tv = (t, x) => t.c * x ** t.p;

/** Un côté est dessinable pour x si ses termes positifs l'emportent sur ses termes retranchés. */
function drawable(f, x) {
  const pos = f.filter((t) => tv(t, x) > 0).reduce((s, t) => s + tv(t, x), 0);
  const neg = f.filter((t) => tv(t, x) < 0).reduce((s, t) => s - tv(t, x), 0);
  return pos > 0 && neg < pos;
}

/**
 * La règle de x : à partir de la plus petite valeur entière qui dessine les
 * deux côtés, jusqu'à `span` crans plus loin — et jamais au-delà de la
 * dernière valeur dessinable (5 − 2x s'arrête à x = 2). Un facteur qui n'est
 * positif pour aucun x de 1 à 50 (1 − x, −x − 2) n'est pas un terrain : erreur
 * de contenu, levée tout de suite plutôt qu'un terrain vide.
 */
export function xRange([f1, f2], span = 7) {
  const ok = (v) => drawable(f1, v) && drawable(f2, v);
  let min = 1;
  while (min <= 50 && !ok(min)) min += 1;
  if (min > 50) throw new Error('pitch-expansion: un côté n’est positif pour aucune valeur de x');
  let max = min;
  while (max < min + span && ok(max + 1)) max += 1;
  return { min, max };
}

export function init({ expr, simplify = true }) {
  const factors = parseExpr(expr);
  const cells = partialProducts(factors[0], factors[1]);
  return {
    expr, factors, simplify, kind: kindOf(factors), cells,
    collected: [],        // ids de zones portées, dans l'ordre du geste
    tray: [],             // les termes de « المجموع » : { id, term, from: [ids de zones] }
    trials: [],           // { x, ok, product, sum, missing: [ids] } — une vérification par valeur de x
    lastRefusal: null,
  };
}

/** La géométrie d'un côté pour x : segments { k, start, len, negative } en unités de longueur. */
export function sideSegments(f, x) {
  const segs = [];
  let at = 0;
  f.forEach((t, k) => { const v = tv(t, x); if (v > 0) { segs.push({ k, start: at, len: v, negative: false }); at += v; } });
  const total = at;
  let back = total;
  f.forEach((t, k) => { const v = tv(t, x); if (v < 0) { back += v; segs.push({ k, start: back, len: -v, negative: true }); } });
  return { segs: segs.sort((a, b) => a.k - b.k), total };
}

/** Les zones dessinées pour x : rectangles en unités, avec le signe de leur aire. */
export function zones(s, x) {
  const A = sideSegments(s.factors[0], x);
  const B = sideSegments(s.factors[1], x);
  return {
    width: A.total, height: B.total,
    zones: s.cells.map((cell) => {
      const a = A.segs[cell.i]; const b = B.segs[cell.j];
      const removed = a.negative !== b.negative;           // retranchée une fois
      const restored = a.negative && b.negative;           // retranchée deux fois → rajoutée
      return { ...cell, x0: a.start, y0: b.start, w: a.len, h: b.len, removed, restored, area: tv(cell.term, x) };
    }),
  };
}

export const product = (s, x) => evaluate(s.factors[0], x) * evaluate(s.factors[1], x);
export const traySum = (s, x) => s.tray.reduce((sum, chip) => sum + tv(chip.term, x), 0);
export const allCollected = (s) => s.collected.length === s.cells.length;
export const missing = (s) => s.cells.filter((c) => !s.collected.includes(c.id)).map((c) => c.id);

export function canCollect(s, id) {
  if (!s.cells.some((c) => c.id === id)) return '';
  if (s.collected.includes(id)) return 'already';
  return true;
}

export function collect(s, id) {
  if (canCollect(s, id) !== true) return s;
  const cell = s.cells.find((c) => c.id === id);
  return { ...s, collected: [...s.collected, id], tray: [...s.tray, { id: `t${id}`, term: cell.term, from: [id] }], lastRefusal: null };
}

/** Rendre une zone : on la retire de la somme (tant qu'elle n'a pas été fusionnée). */
export function uncollect(s, id) {
  const chip = s.tray.find((c) => c.from.length === 1 && c.from[0] === id);
  if (!chip) return s;
  return { ...s, collected: s.collected.filter((c) => c !== id), tray: s.tray.filter((c) => c !== chip) };
}

/**
 * Fusionner deux termes de la somme : seulement s'ils sont SEMBLABLES.
 * Deux termes opposés (+3x et −3x) s'annulent : le terme disparaît.
 */
export function canMerge(s, a, b) {
  if (a === b) return '';
  const ca = s.tray.find((c) => c.id === a); const cb = s.tray.find((c) => c.id === b);
  if (!ca || !cb) return '';
  if (!s.simplify) return 'notYet';
  if (ca.term.p !== cb.term.p) return 'notLike';
  return true;
}

export function merge(s, a, b) {
  if (canMerge(s, a, b) !== true) return s;
  const ca = s.tray.find((c) => c.id === a); const cb = s.tray.find((c) => c.id === b);
  const c = ca.term.c + cb.term.c;
  const rest = s.tray.filter((t) => t.id !== a && t.id !== b);
  const at = s.tray.indexOf(cb);
  const merged = { id: `m${[...cb.from, ...ca.from].sort().join('_')}`, term: { c, p: ca.term.p }, from: [...cb.from, ...ca.from], cancelled: c === 0 };
  const tray = [...rest];
  tray.splice(Math.min(at, tray.length), 0, merged);
  return { ...s, tray: c === 0 ? tray.filter((t) => t !== merged) : tray, lastRefusal: null };
}

/** Plus aucun couple de termes semblables dans la somme. */
export function isSimplified(s) {
  const powers = s.tray.map((c) => c.term.p);
  return new Set(powers).size === powers.length;
}

/** Vérifier pour la valeur de x à l'écran : l'aire du terrain contre la somme portée. */
export function verify(s, x) {
  const p = product(s, x); const sum = traySum(s, x);
  // `sig` (lecteur, 2026-11-11) : la somme portée au moment de l'essai — le même x avec la même somme n'est pas un nouvel essai
  const trial = { x, ok: allCollected(s) && p === sum, product: p, sum, missing: missing(s), sig: trayKey(s) };
  // `lastX` (synthèse de l'unité 3, 2026-11-12) : le x du DERNIER essai — celui que le terrain montre (les essais sont triés par x)
  return { ...s, trials: [...s.trials.filter((t) => t.x !== x), trial].sort((u, v) => u.x - v.x), lastX: x };
}

/** Les valeurs de x où l'égalité a été vérifiée juste (somme complète). */
export const verifiedXs = (s) => s.trials.filter((t) => t.ok).map((t) => t.x);

/** La somme est complète (et réduite si demandé) : « تحقّق » a un sens pour chaque x. */
export const sumReady = (s) => allCollected(s) && (!s.simplify || isSimplified(s));

/**
 * « جرّب كل الإمكانيات » : les valeurs de x de la règle dont l'égalité n'a pas encore été vérifiée juste.
 * Seulement quand la somme est construite par l'élève (porter les zones et réunir restent ses gestes).
 */
export function untriedXs(s, range) {
  if (!sumReady(s)) return [];
  const out = [];
  for (let x = range.min; x <= range.max; x += 1) if (!s.trials.some((t) => t.x === x && t.ok)) out.push(x);
  return out;
}

/**
 * LA DÉCOUVERTE : toutes les zones portées, la somme réduite (si demandé),
 * et l'égalité vérifiée pour AU MOINS DEUX valeurs de x — une seule valeur
 * ne dit rien d'une identité (« صحيحة من أجل كل القيم »).
 */
export function discoveryReady(s) {
  return allCollected(s) && (!s.simplify || isSimplified(s)) && verifiedXs(s).length >= 2;
}

/* ── Écritures ─────────────────────────────────────────────────────────── */

export const productTex = (s, letter = 'x') => {
  const [f1, f2] = s.factors;
  if (s.kind === 'square-sum' || s.kind === 'square-diff') return `${factorTex(f1, { letter })}^2`;
  return `${factorTex(f1, { letter })}${factorTex(f2, { letter })}`;
};
export const trayTex = (s, letter = 'x') => termsTex(s.tray.map((c) => c.term), { letter });
export const resultTex = (s, letter = 'x') => termsTex(reduce(s.cells.map((c) => c.term)), { letter });
export const cellTex = (cell, letter = 'x') => termTex(cell.term, { letter, lead: true });

/** La somme portée est-elle le développement réduit ? (garde-fou des tests) */
export const trayIsExpansion = (s) => samePolynomial(s.tray.map((c) => c.term), s.cells.map((c) => c.term));

/** Une valeur entière écrite pour KaTeX et les lecteurs d’écran (le « - » ASCII est rendu « − » par KaTeX). */
export const valueText = (v) => String(v);

/* ══════════════ LECTEUR DE MISSION (rollout 2026-11-11, unité 3 leçon 1 `nashr-tabsit` ; conseil du 2026-11-11) ══════════════ */

/** La somme portée, comme une clé (les ids de ses termes, triés) : deux essais au même x avec la même clé sont le même essai. */
export function trayKey(s) {
  return s.tray.map((c) => c.id).sort().join(',');
}

/** Le même x avec la même somme portée a-t-il déjà été vérifié ? (le même geste deux fois n'est pas un essai — §10.4) */
export const sameTrial = (s, x) => s.trials.some((t) => t.x === x && t.sig === trayKey(s));

/**
 * LES COLLISIONS D'AIRES (verdict du conseil, « added rulings ») : deux zones de NATURE différente (degré : x² / x / constante) dont l'aire
 * est ÉGALE pour cette valeur de x. En mode « aires » (`labels: 'area'`) l'élève ne lit que des NOMBRES : à x = 3, (3x − 1)(3 + x) montre
 * 27, 27, −3, −3 — il ne peut plus dire quelle tuile (9x ou 3x²) va où. Deux zones de même nature (les deux bandes bx d'un carré) ne sont
 * jamais une collision : ce sont des jumelles, c'est ainsi que « 2ab » se voit. Renvoie les paires [idA, idB].
 */
export function areaCollisions(expr, x) {
  const cells = partialProducts(...parseExpr(expr));
  const out = [];
  for (let a = 0; a < cells.length; a += 1) {
    for (let b = a + 1; b < cells.length; b += 1) {
      const A = cells[a]; const B = cells[b];
      if (A.term.p !== B.term.p && tv(A.term, x) === tv(B.term, x)) out.push([A.id, B.id]);
    }
  }
  return out;
}

/**
 * Les valeurs de x ATTEIGNABLES par la règle, ± et « تحقّق » : celles de `xRange`, privées en mode « aires » de chaque x à collision (la
 * règle saute par-dessus ; une collision au bord RÉDUIT la règle : elle commence ou finit à la valeur suivante). Mode « termes » : toute la règle.
 */
export function playerXs({ expr, span = 7, labels = 'terms' }) {
  const r = xRange(parseExpr(expr), span);
  const xs = [];
  for (let x = r.min; x <= r.max; x += 1) if (labels !== 'area' || areaCollisions(expr, x).length === 0) xs.push(x);
  if (!xs.length) throw new Error(`pitch-expansion: aucune valeur de x sans collision pour « ${expr} »`);
  return xs;
}

/** La valeur atteignable la plus proche de `v` (à égalité, du côté `dir` : +1 vers le haut, −1 vers le bas). */
export function snapX(xs, v, dir = 1) {
  let best = xs[0];
  for (const x of xs) {
    const d = Math.abs(x - v); const bd = Math.abs(best - v);
    if (d < bd || (d === bd && Math.sign(x - best) === Math.sign(dir))) best = x;
  }
  return best;
}

/** Le x de départ : `start` s'il est atteignable, sinon la valeur par défaut de la page (min + 2) ramenée sur une valeur atteignable. */
export function startXOf({ expr, span = 7, labels = 'terms', start }) {
  const xs = playerXs({ expr, span, labels });
  if (start != null && xs.includes(start)) return start;
  const r = xRange(parseExpr(expr), span);
  return snapX(xs, Math.min(r.min + 2, r.max), 1);
}

/**
 * CE QU'UNE ZONE MONTRE (la zone sur le terrain, la case du tableau de Descartes, la pastille de « المجموع ») — une seule fonction :
 *   labels 'terms' (la page, défaut) : son terme littéral, « 3x² » ;
 *   labels 'area'  (lecteur, manches 1–2 de nashr-tabsit) : son AIRE pour ce x, un NOMBRE (négatif pour une zone retranchée), jamais sa
 *                  lettre — la construction (BUILD) écrit ensuite les termes : elle n'est plus une copie.
 * → { kind: 'term' | 'area', tex, value, removed } ; `tex` sans $ (« 3x^2 », « -3 »).
 */
export function zoneText(term, x, labels = 'terms', letter = 'x') {
  const value = tv(term, x);
  if (labels === 'area') return Object.freeze({ kind: 'area', tex: valueText(value), value, removed: value < 0 });
  return Object.freeze({ kind: 'term', tex: termTex(term, { letter, lead: true }), value, removed: term.c < 0 });
}

/** Ce que la manche reçoit pour un essai (« تحقّق ») : `groups` = la valeur de x, `exact` = l'égalité vérifiée (toutes les zones portées). */
export const verdictOf = (trial) => Object.freeze({ groups: trial.x, exact: Boolean(trial.ok) });

/** La découverte du lecteur : celle de la page (toutes les zones, la somme réduite si demandé, deux x vérifiés). */
export const playerDiscovery = discoveryReady;

/** Au moins une valeur de x vérifiée juste : la première suite de questions de la manche peut se poser. */
export const firstOk = (s) => verifiedXs(s).length >= 1;

/** Les zones NON hachurées (ni retranchées, ni rajoutées) : leurs deux termes sont positifs. */
export function unhatchedIds(s) {
  return s.cells.filter((c) => s.factors[0][c.i].c > 0 && s.factors[1][c.j].c > 0).map((c) => c.id);
}

/**
 * Les PRÉDICTIONS du lecteur (≤ 2 par manche), leur vérité CALCULÉE :
 *   'unhatched' — « les deux zones non hachurées suffisent ? » : oui seulement si leur somme est le produit, pour tout x ;
 *   'otherX'    — « l'égalité reste vraie pour une autre valeur ? » : le développement complet est le produit (toujours oui) ;
 *   'termsLeft' — « combien de termes après la réduction ? » : le nombre de termes du développement réduit.
 */
export function predictTruth(s, kind, pred = {}) {
  const all = s.cells.map((c) => c.term);
  if (kind === 'claim' || kind === 'twice' || kind === 'noX') return predictTruthSquare(s, kind, pred);
  if (kind === 'unhatched') {
    const ids = unhatchedIds(s);
    return samePolynomial(s.cells.filter((c) => ids.includes(c.id)).map((c) => c.term), all) ? 'yes' : 'no';
  }
  if (kind === 'otherX') return samePolynomial(all, all) ? 'yes' : 'no';
  if (kind === 'termsLeft') return String(reduce(all).length);
  throw new Error(`pitch-expansion: prédiction inconnue « ${kind} »`);
}

/** Les options d'une prédiction (dans l'ordre affiché) : oui / non, ou trois nombres de termes autour de la vérité. */
export function predictOptions(s, kind) {
  if (kind === 'termsLeft') { const n = Number(predictTruth(s, kind)); return [n - 1, n, n + 1].filter((v) => v > 0).map(String); }
  return ['yes', 'no'];
}

/**
 * Les prédictions JUGÉES (leurs clés) : 'unhatched' par un essai fait avec EXACTEMENT les zones non hachurées portées ; 'otherX' à la
 * deuxième valeur de x vérifiée ; 'termsLeft' quand la somme est complète et réduite. Toutes quand `all` (la dernière suite de la manche
 * est atteinte) — un résultat n'est jamais perdu derrière la question.
 */
export function judgedPredictions(s, preds, all = false) {
  const plain = unhatchedIds(s).map((id) => `t${id}`).sort().join(',');
  return preds.filter((p) => {
    if (all) return true;
    if (p.kind === 'unhatched') return s.trials.some((t) => t.sig === plain);
    if (p.kind === 'otherX') return verifiedXs(s).length >= 2;
    if (p.kind === 'termsLeft') return allCollected(s) && isSimplified(s);
    // leçon 2 (mutatabiqat-shahira) : « مساحة الملعب … ؟ » et « قُطع مرّتين ؟ » au 1er x juste ; « يبقى حدّ فيه x ؟ » quand la somme est réduite
    if (p.kind === 'claim' || p.kind === 'twice') return firstOk(s);
    if (p.kind === 'noX') return allCollected(s) && isSimplified(s);
    return false;
  }).map((p) => p.key);
}

/**
 * Le GUIDE (LabCoach) du lecteur — le geste, jamais la réponse. `ctx` : { x, done }.
 *   aucune zone portée → une zone non hachurée (« اسحبها إلى المجموع ») ; un refus au x à l'écran → une zone oubliée qui s'allume ;
 *   d'autres zones non hachurées à porter → la suivante (jamais une hachurée avant un refus : c'est la prédiction de la manche 2) ;
 *   des termes semblables à réunir (réduction demandée) → une pastille ; la somme pas encore vérifiée à ce x → « تحقّق » ;
 *   une seule valeur vérifiée → la poignée de x (« غيّر x ثم تحقّق ») ; rien quand le but de la manche est atteint.
 */
export function coachOf(s, ctx = {}) {
  if (ctx.done) return null;
  const x = ctx.x;
  const here = s.trials.find((t) => t.x === x);
  if (here && !here.ok && here.sig === trayKey(s) && here.missing.length) return { id: 'missing', target: `[data-pitch-zone="${here.missing[0]}"]`, gesture: 'drag' };
  // leçon 2 : un carré d'une SOMME n'a aucune zone hachurée — avant le premier refus, le guide montre les DEUX CARRÉS seulement (la manche
  // demande « les deux carrés suffisent-ils ? » ; les deux bandes s'allument au refus)
  const plain = s.kind === 'square-sum' && !s.trials.some((t) => !t.ok) ? s.cells.filter((c) => c.i === c.j).map((c) => c.id) : unhatchedIds(s);
  const todo = plain.filter((id) => !s.collected.includes(id));
  if (!s.collected.length) return { id: 'carry', target: `[data-pitch-zone="${todo[0] ?? s.cells[0].id}"]`, gesture: 'drag' };
  const refused = s.trials.some((t) => !t.ok);
  if (todo.length) return { id: 'carryMore', target: `[data-pitch-zone="${todo[0]}"]`, gesture: 'drag' };
  if (refused && !allCollected(s)) return { id: 'carryMore', target: `[data-pitch-zone="${missing(s)[0]}"]`, gesture: 'drag' };
  if (s.simplify && allCollected(s) && !isSimplified(s)) return { id: 'merge', target: '[data-tray-chip]', gesture: 'drag' };
  if (!sameTrial(s, x)) return { id: 'check', target: '[data-pitch-check]', gesture: 'tap' };
  if (verifiedXs(s).length === 1 && here?.ok) return { id: 'ruler', target: '[data-pitch-handle]', gesture: 'drag' };
  return null;
}

/** Toutes les sommes de sous-ensembles d'une liste de nombres (ce que « المجموع » peut afficher avant et après les réunions). */
function subsetSums(values) {
  const out = new Set([0]);
  values.forEach((v) => { [...out].forEach((s) => out.add(s + v)); });
  out.delete(0);
  return [...out];
}

/**
 * Les FORMES FAUSSES d'un développement, pures (la même liste que `wrongForms` du composant, sans filtre par x) : seuls les produits « en
 * face », le signe ignoré, une zone oubliée ; pour k(a + b) un seul terme multiplié, ou l'addition au lieu du produit.
 */
export function wrongCandidates(s) {
  const { cells, factors: [f1, f2] } = s;
  const lastI = f1.length - 1; const lastJ = f2.length - 1;
  const absT = (t) => ({ c: Math.abs(t.c), p: t.p });
  if (s.kind === 'distributive') {
    const [m, other] = f1.length === 1 ? [f1[0], f2] : [f2[0], f1];
    return [
      reduce([polynomials.mulTerms(m, other[0]), ...other.slice(1)]),
      reduce([...other.slice(0, -1), polynomials.mulTerms(m, other.at(-1))]),
      reduce([m, ...other]),
    ];
  }
  const diag = cells.filter((c) => c.i === c.j).map((c) => c.term);
  return [
    reduce(s.kind === 'sum-diff' ? diag.map(absT) : diag),
    reduce(cells.map((c) => absT(c.term))),
    reduce(cells.filter((c) => !(c.i === 0 && c.j === lastJ)).map((c) => c.term)),
    reduce(cells.filter((c) => !(c.i === lastI && c.j === lastJ)).map((c) => c.term)),
  ];
}

/**
 * TOUT ce qu'un écran du lecteur peut montrer pour une manche (règle « valeurs interdites par RÔLE », conseil du 2026-11-11) — pour chaque x
 * atteignable : `x`, la valeur de chaque côté (`side`), l'aire de chaque zone (`area`), l'aire du terrain et CHAQUE somme de sous-ensemble
 * d'aires (`sum`) ; les facteurs (`factor`), chaque terme de zone et chaque terme réunissable (`term`), le développement réduit et chaque forme
 * fausse (`expansion`) avec sa valeur à chaque x (`decoy`), la tuile leurre des constructions (`term`). `{ role, v }`, v en texte TeX sans $.
 * `props` : { expr, span, labels, choices? }.
 */
export function shownValues(props) {
  const out = [];
  const push = (role, v) => out.push(Object.freeze({ role, v: String(v) }));
  const s = init({ expr: props.expr, simplify: props.labels !== 'area' });
  const xs = playerXs({ expr: props.expr, span: props.span, labels: props.labels });
  const [f1, f2] = s.factors;
  push('factor', polynomials.factorTex(f1)); push('factor', polynomials.factorTex(f2));
  s.cells.forEach((c) => push('term', termTex(c.term)));
  // les réunions partielles de termes semblables (« −x − 4x » → « −5x »)
  [0, 1, 2].forEach((p) => {
    const like = s.cells.filter((c) => c.term.p === p).map((c) => c.term.c);
    subsetSums(like).forEach((c) => { if (c !== 0) push('term', termTex({ c, p })); });
  });
  push('expansion', termsTex(reduce(s.cells.map((c) => c.term))));
  const wrongs = wrongCandidates(s).filter((w) => w.length);
  wrongs.forEach((w) => push('expansion', termsTex(w)));
  // la tuile leurre d'une construction : la valeur absolue d'une zone (ou le terme non multiplié)
  s.cells.forEach((c) => push('term', termTex({ c: Math.abs(c.term.c), p: c.term.p })));
  [...f1, ...f2].forEach((t) => push('term', termTex(t)));
  xs.forEach((x) => {
    push('x', x);
    push('side', evaluate(f1, x)); push('side', evaluate(f2, x));
    const areas = s.cells.map((c) => tv(c.term, x));
    areas.forEach((a) => push('area', a));
    push('sum', product(s, x));
    subsetSums(areas).forEach((v) => push('sum', v));
    wrongs.forEach((w) => push('decoy', evaluate(w, x)));
  });
  (props.choices ?? []).forEach((expr) => shownValues({ expr, span: props.span, labels: 'terms' }).forEach((v) => out.push(v)));
  // leçon 2 : les options des questions de la manche (bandes, coin, annulation, construction à coefficient) et les affirmations prédites
  squareShown(s, props, xs).forEach((v) => out.push(v));
  // la synthèse de l'unité 3 : les tuiles des constructions du ممرّ (suites 'ring' / 'ringTerms')
  ringShown(s, props, xs).forEach((v) => out.push(v));
  return out;
}

/* ══════════════ LEÇON 2 `mutatabiqat-shahira` (rollout 2026-11-11 ; conseil du 2026-11-11, verdict L2.1–L2.7) ══════════════
 * Les terrains CARRÉS (a ± b)² et le terrain (a + b)(a − b) — tout est ajouté, rien de la leçon 1 ne change : de nouvelles suites (`square`,
 * `squareDiff`, `sumDiff`, `coef` et leurs entraînements), de nouvelles questions (`stripFill`, `cornerFill`, `cancelFill`, `identityBuild` en
 * LETTRES a, b, `coefBuild` en nombres), trois prédictions (`claim`, `twice`, `noX`). Chaque vérité est CALCULÉE ici. */

const TERM_POLY_RE = /^([+-]?)(\d*)(x(?:\^(\d+))?)?$/;
/** « x^2-25 » → [{c:1,p:2},{c:-25,p:0}] (une affirmation prédite, écrite en texte). */
export function parsePoly(src) {
  const parts = String(src).replace(/\s+/g, '').replace(/−/g, '-').match(/[+-]?[^+-]+/g) ?? [];
  return parts.map((part) => {
    const m = part.match(TERM_POLY_RE);
    if (!m || (m[2] === '' && !m[3])) throw new Error(`pitch-expansion: terme illisible « ${part} »`);
    const c = (m[1] === '-' ? -1 : 1) * (m[2] === '' ? 1 : Number(m[2]));
    return { c, p: m[3] ? Number(m[4] ?? 1) : 0 };
  });
}

/** Le terrain est-il une identité remarquable (un carré de binôme, ou une somme par une différence) ? */
export const isIdentityKind = (s) => s.kind === 'square-sum' || s.kind === 'square-diff' || s.kind === 'sum-diff';

/** Le binôme du premier côté : a (son premier terme), b (la valeur absolue du second), et le signe. */
export function binomialOf(s) {
  const [t1, t2] = s.factors[0];
  return { a: t1, b: { c: Math.abs(t2.c), p: t2.p }, minus: t2.c < 0 };
}

/** La zone RESTAURÉE (retranchée deux fois : (−b)(−b)) d'un carré de différence, ou null. */
export const restoredCell = (s) => s.cells.find((c) => s.factors[0][c.i].c < 0 && s.factors[1][c.j].c < 0) ?? null;

function predictTruthSquare(s, kind, pred) {
  const all = s.cells.map((c) => c.term);
  if (kind === 'claim') return samePolynomial(parsePoly(pred.claim), all) ? 'yes' : 'no';
  if (kind === 'twice') return restoredCell(s) ? 'yes' : 'no';
  return reduce(all).some((t) => t.p === 1) ? 'yes' : 'no';   // noX
}

const tx = (t) => termTex(t, { lead: true });
/** Une option signée pour une pastille (« +25 », « -25 ») — la comparaison lit la chaîne. */
const signed = (v) => (v > 0 ? `+${v}` : String(v));
/** Une suite de trois pastilles dont la bonne réponse change de place avec les nombres (jamais toujours la même). */
function spin(list, right, seed) {
  const rest = list.filter((o) => o !== right);
  const at = Math.abs(seed) % list.length;
  return [...rest.slice(0, at), right, ...rest.slice(at)];
}

/**
 * « ملعبك = المربّعان + ▢ شريط، مساحة كل منه ▢ » (r1, après le 1er x juste) : le NOMBRE de bandes (2 — deux, pas une ni quatre) et la bande en
 * lettres, ab (pas 2ab, pas b²). `fields` pour LabCheckpoint › fill.
 */
export function stripFillParts(s) {
  const { a, b } = binomialOf(s);
  const ab = { c: Math.abs(a.c * b.c), p: a.p + b.p };
  const twice = { c: 2 * ab.c, p: ab.p };
  const bb = { c: b.c * b.c, p: 2 * b.p };
  return [
    { id: 'count', expected: '2', options: spin(['1', '2', '4'], '2', b.c) },
    { id: 'each', expected: tx(ab), options: spin([tx(ab), tx(twice), tx(bb)], tx(ab), b.c + 1) },
  ];
}

/**
 * « المنطقة b²: قُطعت ▢ مرّة؛ في المجموع ▢ » (r2, après le 1er x juste) — sur les nombres de la manche (verdict L2.3 : jamais la phrase
 * « قُطع مرّتين فيُضاف مرّة ») : 2 fois ; +b² (pas −b², pas 0).
 */
export function cornerFillParts(s) {
  const cell = restoredCell(s);
  const v = cell.term.c;
  return [
    { id: 'times', expected: '2', options: spin(['1', '2', '0'], '2', v) },
    { id: 'sign', expected: signed(v), options: spin([signed(v), signed(-v), '0'], signed(v), v + 1) },
  ];
}

/** « المنطقتان +bx و −bx معًا: ▢ » (module 2, après le 1er x juste) : 0 (pas 2bx, pas −2bx) — la fusion qui VIDE la pastille est la coupe. */
export function cancelFillParts(s) {
  const strip = s.cells.find((c) => c.term.p === 1 && c.term.c > 0).term;
  const two = { c: 2 * strip.c, p: 1 };
  return [{ id: 'cancel', expected: '0', options: spin(['0', tx(two), tx({ c: -two.c, p: 1 })], '0', strip.c) }];
}

/**
 * BÂTIR l'identité EN LETTRES (verdict L2.6 : a, b — les côtés du terrain se ré-étiquettent a / b à l'écran pendant la question). UNE tuile leurre
 * par nature (L2.2/L2.3) : carré d'une somme → ab (le double oublié) ; carré d'une différence → −b² (le signe de b²) ; somme × différence → +b².
 * `expected` dans l'ordre du manuel ; `accept` : l'autre ordre des deux derniers termes, toujours juste.
 */
export function identityParts(s) {
  if (s.kind === 'square-sum') return { lhs: '(a + b)^2', expected: ['a^2', '2ab', 'b^2'], accept: [['a^2', 'b^2', '2ab']], decoy: 'ab', ops: ['+', '+'], preset: ['a^2', null, null] };
  if (s.kind === 'square-diff') return { lhs: '(a - b)^2', expected: ['a^2', '-2ab', '+b^2'], accept: [['a^2', '+b^2', '-2ab']], decoy: '-b^2', ops: ['', ''], preset: ['a^2', null, null] };
  if (s.kind === 'sum-diff') return { lhs: '(a + b)(a - b)', expected: ['a^2', '-b^2'], accept: [], decoy: '+b^2', ops: [''], preset: [null, null] };
  return null;
}

/**
 * BÂTIR le développement d'un carré à COEFFICIENT, en nombres (r3, verdict L2.6 : la manche du coefficient) : (2x − 1)² = ▢ − ▢ + ▢ avec les
 * tuiles a² = 4x², 2ab = 4x, b² = 1 et le leurre « coefficient non élevé au carré » (2x²).
 */
export function coefParts(s) {
  const { a, b, minus } = binomialOf(s);
  const aa = { c: a.c * a.c, p: 2 * a.p };
  const ab2 = { c: 2 * a.c * b.c, p: a.p + b.p };
  const bb = { c: b.c * b.c, p: 2 * b.p };
  const decoy = { c: a.c, p: 2 * a.p };
  // les SIGNES sont DANS les tuiles (« -4x », « +1 ») : un signe entre deux emplacements est aria-hidden (revue a11y 2026-11-11)
  const sg = (t) => (t.c < 0 ? tx(t) : `+${tx(t)}`);
  return { expected: [tx(aa), sg({ ...ab2, c: minus ? -ab2.c : ab2.c }), sg(bb)], decoy: tx(decoy), ops: ['', ''], aa, ab2, bb };
}

/** Les suites (et leurs entraînements) qui posent chaque question de la leçon 2 — lu par `shownValues` pour balayer leurs options. */
const SQUARE_QS = {
  square: ['strip', 'identity'], squareEasy: ['strip'], squareDiff: ['corner', 'identity'], squareDiffEasy: ['corner'],
  coef: ['coef'], coefEasy: ['coef'], sumDiff: ['cancel', 'identity'], sumDiffEasy: ['cancel'],
};

/** Ce que les questions et les prédictions de la leçon 2 montrent, en plus du terrain (balayé par la règle « valeurs interdites par rôle »). */
function squareShown(s, props, xs) {
  const out = [];
  const push = (role, v) => out.push(Object.freeze({ role, v: String(v) }));
  const qs = SQUARE_QS[props.chains] ?? [];
  if (qs.includes('strip')) stripFillParts(s).forEach((f) => f.options.forEach((o) => push(f.id === 'count' ? 'count' : 'term', o)));
  if (qs.includes('corner')) cornerFillParts(s).forEach((f) => f.options.forEach((o) => push(f.id === 'times' ? 'count' : 'term', o)));
  if (qs.includes('cancel')) cancelFillParts(s).forEach((f) => f.options.forEach((o) => push('term', o)));
  if (qs.includes('coef')) { const c = coefParts(s); [...c.expected, c.decoy].forEach((o) => push('term', o)); }
  (props.predict ?? []).filter((p) => p.kind === 'claim').forEach((p) => {
    const claim = parsePoly(p.claim);
    push('expansion', termsTex(claim));
    xs.forEach((x) => push('decoy', evaluate(claim, x)));
  });
  return out;
}

/* ══════════════ LA SYNTHÈSE de l'unité 3 `wadiya-idmajiya-harfi` (lecteur de mission, 2026-11-12) — LE ممرّ AUTOUR D'UN CARRÉ ══════════════
 * Un terrain « x+a+x » (un côté fait de trois segments : un ممرّ de largeur x, le carré central de côté a, le ممرّ) au carré : la zone centrale
 * a × a est une نافورة, les huit autres le ممرّ. Tout est AJOUTÉ, rien des leçons 1–2 ne change : deux suites du lecteur ('ring' en aires,
 * 'ringTerms' en termes, et leurs entraînements) et leurs constructions, chacune CALCULÉE ici. */

/** Le côté central a d'un terrain « x+a+x » au carré (même facteur deux fois, x · constante positive · x), sinon null. */
export function ringOf(s) {
  const [f1, f2] = s.factors;
  if (!sameFactor(f1, f2) || f1.length !== 3) return null;
  const [l, c, r] = f1;
  if (l.p !== 1 || l.c !== 1 || r.p !== 1 || r.c !== 1 || c.p !== 0 || c.c <= 0) return null;
  return c.c;
}

/**
 * BÂTIR la mesure du ممرّ, EN NOMBRES, au x de l'élève : « ▢ − ▢ = 4 × ▢ + 4 × ▢ » — le terrain entier, la نافورة, un شريط (a × x), un ركن
 * (x × x). UNE tuile leurre : le côté a de la نافورة (son aire confondue avec son côté) ; si elle est déjà une tuile, (a + x)² (le ممرّ d'un seul
 * côté), sinon a + 2x.
 */
export function ringBuildParts(s, x) {
  const a = ringOf(s);
  const outer = (a + 2 * x) ** 2; const center = a * a; const strip = a * x; const corner = x * x;
  const expected = [outer, center, strip, corner].map(String);
  const decoy = [a, (a + x) ** 2, a + 2 * x, 2 * strip].map(String).find((v) => !expected.includes(v));
  return { a, x, expected, decoy, outer, center, strip, corner, ring: outer - center };
}

/**
 * BÂTIR l'aire du ممرّ en TERMES : « (2x + a)² − a² = ▢ ▢ » — 4x² et +4ax ; deux tuiles leurres : +a² (la نافورة gardée) et +2ax (le ممرّ d'un
 * seul côté : (a + x)² − a² = x² + 2ax). Les signes sont DANS les tuiles (« +28x »).
 */
export function ringExprParts(s) {
  const a = ringOf(s);
  const sq = termTex({ c: 4, p: 2 }); const lin = `+${termTex({ c: 4 * a, p: 1 })}`;
  return { a, lhs: `(2x + ${a})^2 - ${a}^2`, expected: [sq, lin], decoys: [`+${a * a}`, `+${termTex({ c: 2 * a, p: 1 })}`] };
}

/** Ce que les constructions du ممرّ montrent, en plus du terrain (balayé par la règle « valeurs interdites par rôle »). */
function ringShown(s, props, xs) {
  const out = [];
  const push = (role, v) => out.push(Object.freeze({ role, v: String(v) }));
  if (!ringOf(s)) return out;
  if (props.chains === 'ring' || props.chains === 'ringEasy') {
    xs.forEach((x) => {
      const p = ringBuildParts(s, x);
      [...p.expected, p.decoy].forEach((v) => push('tile', v));
      push('pitch', p.outer); push('center', p.center); push('ring', p.ring);
    });
  }
  if (props.chains === 'ringTerms' || props.chains === 'ringTermsEasy') {
    const p = ringExprParts(s);
    [...p.expected, ...p.decoys].forEach((v) => push('term', v));
    push('factor', `2x+${p.a}`);
    push('expansion', `${p.expected[0]}${p.expected[1]}`);
    p.decoys.forEach((d) => push('expansion', `${p.expected[0]}${p.expected[1]}${d}`));
  }
  return out;
}
