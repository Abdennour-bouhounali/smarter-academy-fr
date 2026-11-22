/**
 * ruler-compare — la logique PURE de « LA GRADUATION SOUS LA MAIN » (1AM, unité 1, درس « مقارنة الأعداد العشرية وترتيبها »).
 * Aucun React ici. Toute la vérité est EXACTE (`@smarter-academy/core/arithmetic/decimals.js`, importé par chemin).
 *
 * L'idée. Des sauts en longueur mesurés en mètres sont des nombres décimaux (4,6 · 4,35 · 12,70). La main tient la GRADUATION `g` de la
 * règle commune : 0 = le mètre, 1 = le décimètre, 2 = le centimètre, 3 = le millimètre. À la graduation g un nombre se LIT comme un nombre
 * ENTIER de graduations (`⌊x · 10^g⌋`) plus un reste strictement plus petit qu'une graduation, exact, jamais arrondi (`D.readAt`).
 * La règle SÉPARE deux sauts quand leurs lectures entières diffèrent (ou quand les deux tombent juste sur le même trait) : alors le
 * verdict est un verdict entre deux nombres NATURELS. Tant qu'elle ne sépare pas, le verdict est REFUSÉ (« la règle est trop grossière »).
 *
 * Deux sortes de tâches (objets) :
 *   compare  { a: '4,6', b: '4,35' }                  régler la graduation jusqu'à ce que la règle sépare (ou égale) les deux sauts,
 *                                                     puis choisir `<`, `=` ou `>` pour `a ? b` ;
 *   order    { values: ['7,4', …], dir: 'asc'|'desc' } régler UNE graduation pour toute la rangée (assez fine pour séparer toutes les paires),
 *                                                     puis poser les sauts dans les cases du podium ; « تحقّق » juge.
 *
 *     let s = init({ tasks: [{ kind: 'compare', a: '4,6', b: '4,35' }] });
 *     s = verdict(s, '>');      // refusé : à g = 0 les deux se lisent 4 m
 *     s = setRuler(s, 1);       // 46 dm contre 43 dm
 *     s = verdict(s, '>');      // juste
 *
 * Un défaut n'est pas un essai (CONTRACT §6bis.2) : la règle s'ouvre toujours au mètre, sans verdict ; un essai est un changement de
 * graduation, un verdict (refusé ou jugé), une pose de saut ou un « تحقّق ».
 */
import * as D from '@smarter-academy/core/arithmetic/decimals.js';

const MAX_G = 3;
const FREE_MAX_DECIMALS = 3;
const FREE_MAX_WHOLE = 99;
const SYMBOLS = Object.freeze(['<', '=', '>']);
/** Le nom parlé de chaque symbole (data-rc-verdict). */
export const SYMBOL_KEY = Object.freeze({ '<': 'lt', '=': 'eq', '>': 'gt' });

/** Les coureurs de la journée sportive : filles en hijab, garçons en sweat (KidFigure). L'ordre alterne fille / garçon. */
const JUMPERS = Object.freeze([
  Object.freeze({ id: 'rim', name: 'ريم', girl: true, look: Object.freeze({ hairStyle: 'hijab', scarf: 'rose', outfit: 'pink', skin: 'light' }) }),
  Object.freeze({ id: 'sami', name: 'سامي', girl: false, look: Object.freeze({ hairStyle: 'short', hair: 'black', outfit: 'blue', skin: 'wheat' }) }),
  Object.freeze({ id: 'lina', name: 'لينا', girl: true, look: Object.freeze({ hairStyle: 'hijab', scarf: 'mint', outfit: 'teal', skin: 'brown' }) }),
  Object.freeze({ id: 'yassine', name: 'ياسين', girl: false, look: Object.freeze({ hairStyle: 'curly', hair: 'brown', outfit: 'orange', skin: 'light' }) }),
  Object.freeze({ id: 'iman', name: 'إيمان', girl: true, look: Object.freeze({ hairStyle: 'hijab', scarf: 'lavender', outfit: 'violet', skin: 'wheat' }) }),
  Object.freeze({ id: 'anis', name: 'أنيس', girl: false, look: Object.freeze({ hairStyle: 'short', hair: 'chestnut', outfit: 'green', skin: 'deep' }) }),
]);
/** Le coureur d'un saut : dans une comparaison, les deux d'un couple qui change à chaque tâche ; dans un rangement, selon le saut. */
export const jumperOf = (kind, taskIndex, jump) => JUMPERS[kind === 'compare' ? ((taskIndex % 3) * 2 + jump) % JUMPERS.length : jump % JUMPERS.length];

/* ── Écriture et lecture d'un nombre saisi ──────────────────────────────────────────────── */

/** Un texte de saut valide : chiffres latins, virgule ou point, ≤ 3 décimales, partie entière 0…99. Retourne la valeur ou `null`. */
export function parseJump(text) {
  const s = String(text ?? '').replace(/[\s  ]/g, '').replace('.', ',');
  if (!/^\d{1,2}(,\d{1,3})?$/.test(s)) return null;
  const v = D.parse(s);
  return v && D.integerPart(v) <= FREE_MAX_WHOLE && v.k <= FREE_MAX_DECIMALS ? v : null;
}
/** Le texte tel que l'élève l'a écrit, avec la virgule (zéros de fin gardés). */
const writeJump = (v) => D.format(v);

/* ── Tâches ─────────────────────────────────────────────────────────────────────────────── */

export function normalizeTask(t) {
  if (t.kind === 'compare') {
    const av = parseJump(t.a);
    const bv = parseJump(t.b);
    if (!av || !bv) throw new RangeError(`ruler-compare: bad compare task ${JSON.stringify(t)}`);
    const c = D.cmp(av, bv);
    return Object.freeze({
      kind: 'compare', a: writeJump(av), b: writeJump(bv), av, bv, vals: Object.freeze([av, bv]), values: Object.freeze([writeJump(av), writeJump(bv)]),
      cmp: c, verdict: c < 0 ? '<' : c > 0 ? '>' : '=', minG: D.minGraduation(av, bv), rank: D.firstDifferingRank(av, bv),
    });
  }
  if (t.kind === 'order') {
    const list = Array.isArray(t.values) ? t.values : [];
    const vals = list.map(parseJump);
    if (list.length < 3 || list.length > 6 || vals.some((x) => !x) || (t.dir !== 'asc' && t.dir !== 'desc')) throw new RangeError(`ruler-compare: bad order task ${JSON.stringify(t)}`);
    return Object.freeze({
      kind: 'order', dir: t.dir, vals: Object.freeze(vals), values: Object.freeze(vals.map(writeJump)), n: vals.length, rowG: D.rowGraduation(vals),
    });
  }
  throw new RangeError(`ruler-compare: unknown task kind ${t.kind}`);
}

/** La suite de tâches de la leçon (un objet seul est toléré). */
export function tasksFor(tasks) {
  return tasks == null ? [] : Array.isArray(tasks) ? tasks : [tasks];
}

const board0 = (t) => Object.freeze(t.kind === 'order' ? { g: 0, slots: Object.freeze(Array(t.n).fill(null)) } : { g: 0 });
const put = (s, patch) => Object.freeze({ ...s, ...patch });

export function init({ tasks }) {
  const list = tasksFor(tasks).map(normalizeTask);
  if (list.length === 0) throw new RangeError('ruler-compare: at least one task');
  return Object.freeze({
    tasks: Object.freeze(list), ti: 0, boards: Object.freeze(list.map(board0)),
    done: Object.freeze({}), solved: Object.freeze({}), trials: Object.freeze([]), last: null, free: null,
  });
}

/* ── La planche active ──────────────────────────────────────────────────────────────────── */

/**
 * La planche active : la tâche en cours, ou l'essai libre.
 *   { free, kind, g, vals, values, task, slots (order) }
 */
export function activeOf(s) {
  if (s.free) {
    const f = s.free;
    const values = f.vals.map(writeJump);
    if (f.kind === 'order') return { free: true, kind: 'order', g: f.g, vals: f.vals, values, task: { kind: 'order', dir: f.dir, n: f.vals.length }, slots: f.slots, ti: s.ti };
    return { free: true, kind: 'compare', g: f.g, vals: f.vals, values, task: null, slots: null, ti: s.ti };
  }
  const t = s.tasks[s.ti];
  const b = s.boards[s.ti];
  return { free: false, kind: t.kind, g: b.g, vals: t.vals, values: t.values, task: t, slots: b.slots ?? null, ti: s.ti };
}

export const taskOf = (s) => s.tasks[s.ti];
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const isFree = (s) => !!s.free;

/** Les lectures de la planche active à sa graduation : [{ index, text, value, count, rest, restIsZero }]. */
export function readingsOf(s, g) {
  const a = activeOf(s);
  const gg = g ?? a.g;
  return a.vals.map((v, index) => ({ index, text: a.values[index], value: v, g: gg, ...D.readAt(v, gg) }));
}

/** La règle (à sa graduation actuelle) sépare-t-elle TOUT ce qui doit l'être ? compare : le couple ; order : toutes les paires. */
export function decidedNow(s) {
  const a = activeOf(s);
  if (a.kind === 'compare') return D.decidedAt(a.vals[0], a.vals[1], a.g);
  return D.rowGraduation(a.vals) !== null && a.g >= D.rowGraduation(a.vals);
}

/** La première paire que la règle ne sépare pas (order, ou compare) : [i, j] ou null. */
function firstUndecided(s) {
  const a = activeOf(s);
  for (let i = 0; i < a.vals.length; i += 1) for (let j = i + 1; j < a.vals.length; j += 1) if (!D.decidedAt(a.vals[i], a.vals[j], a.g)) return [i, j];
  return null;
}

/** Le symbole juste pour `a ? b` (compare, ou essai libre). */
const rightSymbol = (v0, v1) => { const c = D.cmp(v0, v1); return c < 0 ? '<' : c > 0 ? '>' : '='; };

/* ── Essais ─────────────────────────────────────────────────────────────────────────────── */

function record(s, a, event, patch = {}) {
  const compare = a.kind === 'compare';
  const trial = Object.freeze({
    task: s.ti, kind: a.kind, event, g: a.g, a: compare ? a.values[0] : null, b: compare ? a.values[1] : null,
    verdict: null, ok: null, decided: decidedNow(put(s, {})), free: a.free, ...patch,
  });
  return trial;
}
function withTrial(s, trial, patch = {}) {
  return put(s, { ...patch, trials: Object.freeze([...s.trials, trial]), last: trial });
}
function withBoard(s, a, board) {
  if (a.free) return { free: Object.freeze({ ...s.free, ...board }) };
  const boards = s.boards.slice();
  boards[s.ti] = Object.freeze({ ...s.boards[s.ti], ...board });
  return { boards: Object.freeze(boards) };
}

/** Le geste principal : la graduation de la règle (0…3). Un geste qui ne change rien n'est pas un essai. */
export function setRuler(s, g) {
  const a = activeOf(s);
  const next = Math.max(0, Math.min(MAX_G, Math.round(g)));
  if (next === a.g) return s;
  const s2 = put(s, withBoard(s, a, { g: next }));
  const a2 = activeOf(s2);
  const trial = record(s2, a2, 'ruler', { from: a.g });
  return withTrial(s2, trial);
}

/** Le verdict `<` `=` `>` pour `a ? b` (compare ou essai libre). Refusé tant que la règle ne sépare pas ; sinon jugé, avec ses lectures. */
export function verdict(s, sym) {
  const a = activeOf(s);
  if (a.kind !== 'compare' || !SYMBOLS.includes(sym)) return s;
  if (!a.free && taskDone(s)) return s; // une tâche juste reste juste
  const decided = D.decidedAt(a.vals[0], a.vals[1], a.g);
  if (!decided) return withTrial(s, record(s, a, 'verdict', { verdict: sym, ok: null, decided: false, refused: 'coarse' }));
  const right = rightSymbol(a.vals[0], a.vals[1]);
  const ok = sym === right;
  const reads = readingsOf(s, a.g).map((r) => r.count);
  const trial = record(s, a, 'verdict', { verdict: sym, ok, decided: true, counts: reads });
  if (a.free || !ok) return withTrial(s, trial);
  const t = s.tasks[s.ti];
  return withTrial(s, trial, {
    done: Object.freeze({ ...s.done, [s.ti]: true }),
    solved: Object.freeze({ ...s.solved, [s.ti]: Object.freeze({ g: a.g, minG: t.minG, verdict: sym, a: t.a, b: t.b, counts: reads }) }),
  });
}

/* ── Le rangement ───────────────────────────────────────────────────────────────────────── */

/** Les sauts pas encore posés (indices), dans l'ordre d'origine. */
export function trayOf(s) {
  const a = activeOf(s);
  if (!a.slots) return [];
  return a.vals.map((_, i) => i).filter((i) => !a.slots.includes(i));
}

/**
 * Poser le saut `jump` dans la case `slot`. S'il y avait déjà un saut dans la case, il prend la place laissée par `jump` (échange) ou
 * retourne sur le sable. `slot` = null : le saut revient sur le sable.
 */
export function place(s, jump, slot) {
  const a = activeOf(s);
  if (a.kind !== 'order' || (!a.free && taskDone(s))) return s;
  const slots = a.slots.slice();
  const from = slots.indexOf(jump);
  if (slot === null) {
    if (from < 0) return s;
    slots[from] = null;
  } else {
    if (slot < 0 || slot >= slots.length || jump < 0 || jump >= a.vals.length) return s;
    const occupant = slots[slot];
    if (occupant === jump) return s;
    if (from >= 0) slots[from] = occupant; // échange (occupant peut être null)
    slots[slot] = jump;
  }
  const s2 = put(s, withBoard(s, a, { slots: Object.freeze(slots) }));
  return withTrial(s2, record(s2, activeOf(s2), 'place', { jump, slot, text: a.values[jump], order: slots.map((i) => (i == null ? null : a.values[i])) }), {});
}

export const slotsFull = (s) => { const a = activeOf(s); return !!a.slots && a.slots.every((x) => x !== null); };

/** Une suite de valeurs est-elle rangée dans le sens `dir` (les égales dans n'importe quel ordre) ? Retourne l'indice i de la première inversion (i, i+1) ou −1. */
function firstInversion(vals, dir) {
  for (let i = 0; i + 1 < vals.length; i += 1) {
    const c = D.cmp(vals[i], vals[i + 1]);
    if (dir === 'asc' ? c > 0 : c < 0) return i;
  }
  return -1;
}

/** « تحقّق » : refusé si la règle ne sépare pas toutes les paires ; sinon juge l'ordre et montre la première inversion avec ses lectures. */
export function check(s) {
  const a = activeOf(s);
  if (a.kind !== 'order' || (!a.free && taskDone(s)) || !slotsFull(s)) return s;
  const placed = a.slots.map((i) => a.vals[i]);
  const order = a.slots.map((i) => a.values[i]);
  if (!decidedNow(s)) {
    const pair = firstUndecided(s);
    return withTrial(s, record(s, a, 'check', { ok: null, decided: false, refused: 'coarse', pair, order }));
  }
  const inv = firstInversion(placed, a.task.dir);
  const ok = inv < 0;
  const counts = a.slots.map((i) => D.readAt(a.vals[i], a.g).count);
  const trial = record(s, a, 'check', { ok, decided: true, inversion: ok ? null : inv, order, counts, a: ok ? null : order[inv], b: ok ? null : order[inv + 1] });
  if (!ok || a.free) return withTrial(s, trial);
  return withTrial(s, trial, {
    done: Object.freeze({ ...s.done, [s.ti]: true }),
    solved: Object.freeze({ ...s.solved, [s.ti]: Object.freeze({ g: a.g, dir: a.task.dir, order, counts }) }),
  });
}

/** Le rangement juste (indices de sauts), pour les tests : trié, stable. */
export function rightOrder(task) {
  const idx = task.vals.map((_, i) => i);
  idx.sort((i, j) => (task.dir === 'asc' ? D.cmp(task.vals[i], task.vals[j]) : D.cmp(task.vals[j], task.vals[i])) || i - j);
  return idx;
}

/* ── Tâche suivante, recommencer ────────────────────────────────────────────────────────── */

export function nextTask(s) {
  if (!canNext(s)) return s;
  return put(s, { ti: s.ti + 1, last: null });
}

/** « أعِد التجربة » (questions du labo) : LA MÊME tâche repart de la règle au mètre, NON faite (la carte se rouvrira à la réussite). */
export function retryTask(s) {
  const boards = s.boards.slice();
  boards[s.ti] = board0(s.tasks[s.ti]);
  const done = { ...s.done }; delete done[s.ti];
  const solved = { ...s.solved }; delete solved[s.ti];
  return put(s, { boards: Object.freeze(boards), done: Object.freeze(done), solved: Object.freeze(solved), last: null, free: null });
}

/* ── Ses propres nombres : l'essai LIBRE ────────────────────────────────────────────────── */

/** Le plus grand nombre de champs de l'essai libre en rangement. */
export const FREE_MAX_ORDER = 6;

/**
 * « جرّب أعدادك أنت » : ses propres nombres. Le genre de l'essai suit la tâche en cours : `compare` → deux nombres ; `order` → de 2 à 6 nombres
 * (les champs vides sont ignorés), rangés dans le sens de la tâche. `setFree(s, [t1…t6])` ; l'appel `setFree(s, aText, bText)` reste valable (compare).
 * Un texte non vide et invalide, ou trop peu de nombres valides (compare : les deux ; order : au moins 2) : rien ne change. Une nouvelle
 * série remet la règle au mètre (et vide les cases) ; ses essais portent `free: true` et ne comptent JAMAIS pour la tâche, la découverte ou `onFinished`.
 */
export function setFree(s, texts, bText) {
  const list = Array.isArray(texts) ? texts : [texts, bText];
  const kind = s.tasks[s.ti].kind;
  let vals;
  if (kind === 'compare') {
    vals = list.slice(0, 2).map(parseJump);
    if (vals.length < 2 || vals.some((v) => !v)) return s;
  } else {
    const filled = list.slice(0, FREE_MAX_ORDER).filter((x) => String(x ?? '').trim() !== '');
    vals = filled.map(parseJump);
    if (vals.some((v) => !v) || vals.length < 2) return s;
  }
  const same = s.free && s.free.kind === kind && s.free.vals.length === vals.length && s.free.vals.every((v, i) => D.eq(v, vals[i]) && v.k === vals[i].k);
  if (same) return s;
  const free = kind === 'order'
    ? { kind, dir: s.tasks[s.ti].dir, vals: Object.freeze(vals), g: 0, slots: Object.freeze(Array(vals.length).fill(null)) }
    : { kind, vals: Object.freeze(vals), g: 0 };
  return put(s, { free: Object.freeze(free), last: null });
}
export function toGuided(s) { return s.free ? put(s, { free: null, last: null }) : s; }

/* ── Ce que la leçon reçoit ─────────────────────────────────────────────────────────────── */

/** Un essai pour `onTrial` (la leçon l'écoute via `state.report`). */
export function trialEvidence(tr) {
  const out = {
    task: tr.task, kind: tr.kind, event: tr.event, g: tr.g, a: tr.a, b: tr.b, verdict: tr.verdict ?? null, ok: tr.ok, decided: Boolean(tr.decided), free: Boolean(tr.free),
  };
  if (tr.event === 'place') Object.assign(out, { jump: tr.jump, slot: tr.slot, text: tr.text, order: tr.order });
  if (tr.event === 'check') Object.assign(out, { order: tr.order, inversion: tr.inversion ?? null });
  if (tr.refused) out.refused = tr.refused;
  return out;
}
export const guidedTrials = (s, i = s.ti) => s.trials.filter((t) => !t.free && t.task === i);

/* ── Onboarding (LabCoach, MANIPULATION_CONTRACT §8quater) ──────────────────────────────── */

/**
 * La prochaine commande à montrer — jamais LA réponse :
 *   ruler    la règle n'a pas encore été touchée ET elle ne sépare pas encore : le bouton de graduation à côté de celle où l'on est ;
 *   verdict  (compare) la règle sépare : le groupe des trois symboles (jamais l'un d'eux) ;
 *   place    (order) la règle sépare tout : la rangée de sauts sur le sable ;
 *   check    (order) toutes les cases sont pleines : « تحقّق » ;
 *   next     la tâche est juste et il en reste : « المهمة التالية ».
 * `null` : essai libre, ou tout est fait (la découverte s'ouvre).
 * @returns {{ id: string, target: string, gesture: 'drag' | 'tap' } | null}
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-rc-next]', gesture: 'tap' } : null;
  const a = activeOf(s);
  const decided = decidedNow(s);
  const touched = guidedTrials(s).some((t) => t.event === 'ruler');
  if (a.kind === 'compare') {
    if (!decided && !touched) return { id: 'ruler', target: '[data-rc-knob]', gesture: 'drag' };
    if (!decided) return { id: 'ruler', target: '[data-rc-knob]', gesture: 'drag' };
    return { id: 'verdict', target: '[data-rc-verdicts]', gesture: 'tap' };
  }
  if (!decided) return { id: 'ruler', target: '[data-rc-knob]', gesture: 'drag' };
  if (!slotsFull(s)) return { id: 'place', target: '[data-rc-tray]', gesture: 'drag' };
  return { id: 'check', target: '[data-rc-check]', gesture: 'tap' };
}

/* ── La découverte : les réfutations avec SES nombres ───────────────────────────────────── */

/** Toutes les paires de nombres que l'élève a eues sous la main (compare : le couple ; order : toutes les paires de la rangée). */
function pairsOf(s) {
  const out = [];
  s.tasks.forEach((t) => {
    if (t.kind === 'compare') out.push([t.a, t.b, t.av, t.bv]);
    else for (let i = 0; i < t.n; i += 1) for (let j = i + 1; j < t.n; j += 1) out.push([t.values[i], t.values[j], t.vals[i], t.vals[j]]);
  });
  return out;
}
const natural = (v) => (v.k === 0 ? 0 : v.n % D.pow10(v.k)); // les chiffres après la virgule lus comme un nombre naturel

/**
 * Deux témoins pour la découverte, pris dans SES nombres :
 *   longer  { big, small } — celui qui a le plus de chiffres après la virgule est pourtant le plus petit ;
 *   digits  { big, small } — les chiffres après la virgule de `small` forment un naturel plus grand que ceux de `big`, et `small` est pourtant plus petit.
 * Retourne une valeur par défaut valable (4,35 / 4,6) si ses nombres n'en contiennent pas.
 */
export function witnesses(s) {
  const pairs = pairsOf(s);
  const ord = ([ta, tb, va, vb]) => (D.cmp(va, vb) < 0 ? { small: ta, big: tb, vs: va, vb } : { small: tb, big: ta, vs: vb, vb: va });
  let longer = null;
  let digits = null;
  for (const p of pairs) {
    if (D.cmp(p[2], p[3]) === 0) continue;
    const o = ord(p);
    if (!longer && o.vs.k > o.vb.k) longer = { big: o.big, small: o.small, bigDecimals: o.vb.k, smallDecimals: o.vs.k };
    if (!digits && natural(o.vs) > natural(o.vb)) digits = { big: o.big, small: o.small, smallNatural: natural(o.vs), bigNatural: natural(o.vb) };
  }
  return {
    longer: longer ?? { big: '4,6', small: '4,35', bigDecimals: 1, smallDecimals: 2 },
    digits: digits ?? { big: '4,6', small: '4,35', smallNatural: 35, bigNatural: 6 },
  };
}

export function lastOrder(s) {
  for (let i = s.tasks.length - 1; i >= 0; i -= 1) if (s.tasks[i].kind === 'order' && s.solved[i]) return { i, task: s.tasks[i], solved: s.solved[i] };
  return null;
}

/* ── Géométrie du ruban (px), pure et testée ────────────────────────────────────────────── */

/**
 * Le ruban d'un saut : une fenêtre de cases entières terminée par la case du RESTE (hachurée, dessinée en fraction d'une graduation),
 * puis le fanion posé à l'abscisse exacte du saut. Si le compte dépasse la fenêtre, le ruban est coupé à gauche (zigzag) : seules
 * les dernières cases sont dessinées, étiquetées par leur numéro. Sinon il part de la planche d'appel.
 *   width      la largeur disponible ; count : le nombre entier de graduations ; frac : le reste en graduations (0 ≤ frac < 1, pour le DESSIN) ;
 *   → { cw, shown, firstLabel, broken, boardW, restX, restW, flagX, restFrac, total }
 */
export function tapeLayout({ width, count, frac, maxCw = 62, minCw = 30, maxCells = Math.max(4, Math.min(9, Math.floor(width / 70))) }) {
  const boardW = 26; // planche d'appel (ou zigzag)
  const endPad = 22; // le fanion déborde
  const wanted = Math.min(count, maxCells);
  const cw = Math.max(minCw, Math.min(maxCw, Math.floor((width - boardW - endPad) / (wanted + 1))));
  const fit = Math.max(0, Math.floor((width - boardW - endPad) / cw) - 1);
  const shown = Math.min(count, wanted, fit);
  const restX = boardW + shown * cw;
  const flagX = restX + frac * cw;
  return {
    cw, shown, firstLabel: count - shown + 1, broken: count > shown, boardW, restX, restW: cw, flagX, restFrac: frac, total: restX + cw + endPad,
  };
}

/** La fraction décimale du reste, pour le dessin SEUL (la vérité reste `rest` exact) : { n, k } → n / 10^k. */
export const restFraction = (rest) => (rest.n === 0 ? 0 : rest.n / D.pow10(rest.k));
