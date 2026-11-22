/**
 * marble-run — la logique PURE de « مسار الكريات » (3AM, unité 4 « الحساب الحرفي », درس « حساب قيمة عبارة حرفية », 2026-10-26).
 * Aucun React ici. Toute la vérité est EXACTE (`@smarter-academy/core/arithmetic/substitution.js`, importé PAR CHEMIN).
 *
 * L'idée. Le club de sciences a bâti un mur de billes qui CALCULE une expression : ses stations sont les opérations de l'arbre de
 * l'expression (la copieuse du carré, la presse du produit, le basculeur du moins, la jonction du + et du −). La main :
 *   1. choisit la VALEUR de la lettre — une bille prise au râtelier et lâchée dans le réservoir de la lettre, qui envoie une bille
 *      IDENTIQUE à chaque endroit de la lettre ;
 *   2. ÉCRIT sous le mur la ligne de la substitution : parenthèses autour d'une case, signe × avant une case ;
 *   3. lance la glissière. Le MUR calcule ce que l'expression SIGNIFIE ; un lecteur strict calcule ce que la LIGNE dit. Quand ils
 *      se séparent, la première station où ils diffèrent s'allume et la bannière dit les deux calculs.
 * Monde `twins` : deux murs côte à côte sous UN réservoir ; la main compare les deux paniers et déclare « contre-exemple » ou
 * « égales » (un accord de valeurs ne prouve rien : seul « انشر » prouve une égalité).
 *
 * Les événements (`events`, lus par la leçon via `state.report`) :
 *   { kind: 'drop', world, task, letter, value, free } · { kind: 'write', task, slot, brackets, times }
 *   { kind: 'run', world: 'run', task, runValue, lineValue, ok, reason, station, slot, free } · { kind: 'predict', task, predicted, value, ok }
 *   { kind: 'claim', world: 'twins', task, claim, ok, witness } · { kind: 'expand', task, left, right } (LaTeX)
 *   { kind: 'solved', world, task, line, value } · { kind: 'custom', world }
 */
import * as S from '@smarter-academy/core/arithmetic/substitution.js';
import { rat, parseRat, eq, ratText, sign } from '@smarter-academy/core/arithmetic/powers.js';
import { termsTex } from '@smarter-academy/core/arithmetic/polynomials.js';

/* ═════════════ Les billes ═════════════ */

/** Une bille : { id, v (rationnel), fmt: 'int'|'frac'|'dec' } ; `id` est son texte (« -1/2 »). */
export function marble(text, fmt) {
  const v = parseRat(text);
  return { id: String(text), v, fmt: fmt ?? (v.d === 1n ? 'int' : 'frac') };
}
const ints = (lo, hi) => { const out = []; for (let n = lo; n <= hi; n += 1) out.push(marble(String(n))); return out; };
export const RACK = Object.freeze({
  beginner: Object.freeze(ints(-5, 5)),
  advanced: Object.freeze([...ints(-5, 5), marble('-1/2'), marble('1/2'), marble('-1/3'), marble('2/3'), marble('-1.5', 'dec')]),
  twins: Object.freeze(ints(-3, 3)),
});
/** Le texte affiché d'une bille / d'une valeur (le vrai moins, la virgule). */
export function marbleText(m) {
  const v = m.v ?? m;
  const fmt = m.fmt ?? (v.d === 1n ? 'int' : 'frac');
  const neg = v.n < 0n; const a = neg ? -v.n : v.n;
  let body;
  if (v.d === 1n) body = String(a);
  else if (fmt === 'dec' && S.decimalText(rat(a, v.d))) body = S.decimalText(rat(a, v.d)).replace('.', ',');
  else body = `${a}/${v.d}`;
  return `${neg ? '−' : ''}${body}`;
}
export const valueText = (v) => (typeof v === 'string' ? v : marbleText({ v }));

/* ═════════════ Les tâches ═════════════ */

const T = (id, expr, target) => ({ id, expr, target });
export const RUN_TASKS = Object.freeze({
  beginner: Object.freeze([T('r1', '4x+7', { x: '3' }), T('r2', '4x+7', { x: '-2' }), T('r3', 'x²-3x', { x: '-2' })]),
  advanced: Object.freeze([T('r4', '5-2x²', { x: '-3' }), T('r5', '6x-1', { x: '-1/2' }), T('r6', '3x-2y', { x: '-1', y: '4' })]),
});
export const TWIN_TASKS = Object.freeze([
  { id: 'tw1', a: '(x+2)(x+3)', b: 'x²+6' },
  { id: 'tw2', a: '2x²+2', b: 'x²+x+2' },
  { id: 'tw3', a: '(x-2)(3x+3)', b: '3(x²-1)-3(x+1)' },
]);
/** « جرّب أعدادك » : les six cartes d'expression. */
export const FREE_CARDS = Object.freeze(['3x-4', 'x²+1', '-x²', '(x-1)(x+2)', '2x²-x', '5-3x']);
const FREE_RANGE = Object.freeze({ int: [-9, 9], num: [1, 9], den: [1, 9] });

const TREES = new Map();
export function treeOf(text) {
  if (!TREES.has(text)) TREES.set(text, S.parseExpression(text));
  return TREES.get(text);
}
export function tryParse(text) { try { return treeOf(text); } catch { return null; } }

/* ═════════════ Construction ═════════════ */

const clone = (tk) => ({ ...tk, ...(tk.target ? { target: { ...tk.target } } : {}) });
export function tasksFor(world, tasks, predict) {
  if (Array.isArray(tasks) && tasks.length) return tasks.map(clone);
  if (world === 'twins') return TWIN_TASKS.map(clone);
  return (predict ? RUN_TASKS.advanced : RUN_TASKS.beginner).map(clone);
}

export function init({ world = 'run', tasks, predict = false } = {}) {
  const w = world === 'twins' ? 'twins' : 'run';
  const list = tasksFor(w, tasks, predict);
  const base = {
    world: w, predict: w === 'run' && !!predict, tasks: list, ti: 0, done: list.map(() => false), events: [], bareTried: false,
    custom: false, free: freeDefaults(w), nRuns: 0, refusals: 0, wrote: false,
  };
  return load(base, 0);
}

function freeDefaults(world) {
  return world === 'twins' ? { a: '(x+1)(x+2)', b: 'x²+3x+2' } : { expr: FREE_CARDS[0], num: 2, den: 1 };
}

function load(s, ti) {
  const tk = s.tasks[ti];
  if (s.world === 'twins') {
    return { ...s, ti, custom: false, a: tryParse(tk.a), b: tryParse(tk.b), m: null, tried: [], expanded: false, ran: null, solvedNow: false, last: null, held: null, refusals: 0 };
  }
  const tree = treeOf(tk.expr);
  return { ...s, ti, custom: false, tree, env: {}, choices: S.slots(tree).map(() => ({})), touched: false, tTouched: false, predicted: null, ran: null, solvedNow: false, last: null, held: null };
}

const push = (s, ev) => ({ ...s, events: [...s.events, ev] });
const label = (s) => (s.custom ? 'custom' : s.tasks[s.ti]?.id ?? '');

/* ═════════════ Lectures ═════════════ */

export const taskOf = label;
export const allDone = (s) => s.done.every(Boolean);
export const lettersOf = (s) => (s.world === 'run' ? S.letters(s.tree) : ['x']);
export const slotsOf = (s) => (s.world === 'run' ? S.slots(s.tree) : []);
export const filled = (s) => lettersOf(s).every((l) => s.env[l]);
export const canRun = (s) => s.world === 'run' && filled(s) && (!s.predict || s.custom || !!s.predicted);
export const stationsOf = (s) => (s.world === 'run' ? S.trace(s.tree, filled(s) ? s.env : zeroEnv(s)).map((st) => ({ id: st.id, op: st.op, n: st.n, ready: filled(s), args: st.args, value: st.value })) : []);
function zeroEnv(s) { return Object.fromEntries(S.letters(s.tree).map((l) => [l, rat(0)])); }
/** Les stations SANS valeurs (avant le lâcher) : l'ordre de calcul seul. */
export const stationSkeleton = (s) => S.trace(s.tree, zeroEnv(s)).map((st) => ({ id: st.id, op: st.op, n: st.n, implicit: st.implicit }));
const targetMatches = (s) => {
  const tk = s.tasks[s.ti];
  if (s.custom || !tk?.target) return false;
  return Object.entries(tk.target).every(([l, t]) => s.env[l] && eq(s.env[l].v, parseRat(t)));
};
export const lineTokens = (s) => S.writeLine(s.tree, s.env, s.choices);
export const negativeSlots = (s) => slotsOf(s).filter((sl) => s.env[sl.name] && sign(s.env[sl.name].v) < 0).map((sl) => sl.i);
const everyNegativeBracketed = (s) => negativeSlots(s).every((i) => s.choices[i]?.brackets);
export const truthOfTwin = (s) => (s.world === 'twins' && s.a && s.b ? S.samePolynomial(s.a, s.b) : null);

/* ═════════════ Monde « run » ═════════════ */

export function hold(s, m) { return { ...s, held: m }; }

/** Lâche une bille dans le réservoir de `letter`. */
export function drop(s, letter, m) {
  if (s.world !== 'run' || !lettersOf(s).includes(letter) || !m) return s;
  const same = s.env[letter] && eq(s.env[letter].v, m.v);
  const next = { ...s, env: { ...s.env, [letter]: { v: m.v, fmt: m.fmt } }, held: null, ran: null, solvedNow: false, last: { event: 'drop' }, predicted: same ? s.predicted : null };
  return push(next, { kind: 'drop', world: 'run', task: label(s), letter, value: ratText(m.v), free: s.custom });
}

export function toggleBrackets(s, i) {
  if (s.world !== 'run' || !s.choices[i]) return s;
  const choices = s.choices.map((c, k) => (k === i ? { ...c, brackets: !c.brackets } : c));
  return push({ ...s, choices, touched: true, wrote: true, ran: null, solvedNow: false, last: { event: 'write' } },
    { kind: 'write', task: label(s), slot: i, brackets: !s.choices[i].brackets, times: !!s.choices[i].times });
}
export function toggleTimes(s, i) {
  const sl = slotsOf(s)[i];
  if (s.world !== 'run' || !sl?.needsTimes) return s;
  const choices = s.choices.map((c, k) => (k === i ? { ...c, times: !c.times } : c));
  return push({ ...s, choices, touched: true, tTouched: true, wrote: true, ran: null, solvedNow: false, last: { event: 'write' } },
    { kind: 'write', task: label(s), slot: i, brackets: !!s.choices[i].brackets, times: !s.choices[i].times });
}

/** متقدم : la prédiction de la valeur, AVANT le lancement (jamais bloquante : sa justesse n'empêche rien). */
export function commitPrediction(s, p) {
  if (s.world !== 'run' || !s.predict || !filled(s)) return s;
  const { sg = 1, n, d = 1 } = p;
  if (!Number.isInteger(n) || !Number.isInteger(d) || d < 1 || n < 0) return s;
  return { ...s, predicted: { v: rat(sg < 0 ? -n : n, d) }, ran: null, last: { event: 'predict' } };
}
export function clearPrediction(s) { return { ...s, predicted: null, ran: null }; }

/** « شغّل المسار » : le mur calcule, le lecteur lit la ligne ; juge, signale. */
export function run(s) {
  if (!canRun(s)) return s;
  const judge = S.judgeLine(s.tree, s.env, s.choices);
  const bare = slotsOf(s).some((sl) => s.env[sl.name] && sign(s.env[sl.name].v) < 0 && !s.choices[sl.i]?.brackets);
  const hit = judge.ok && targetMatches(s);
  let n = {
    ...s, nRuns: s.nRuns + 1, bareTried: s.bareTried || bare, last: { event: judge.ok ? 'run' : 'refused', reason: judge.reason },
    ran: { ...judge, hit, wrongValue: judge.ok && !s.custom && !hit, predictedOk: s.predicted ? eq(s.predicted.v, judge.runValue) : null },
    solvedNow: hit, refusals: s.refusals + (judge.ok ? 0 : 1),
  };
  if (s.predicted) n = push(n, { kind: 'predict', task: label(s), predicted: ratText(s.predicted.v), value: ratText(judge.runValue), ok: eq(s.predicted.v, judge.runValue) });
  n = push(n, { kind: 'run', world: 'run', task: label(s), runValue: ratText(judge.runValue), lineValue: judge.lineValue ? ratText(judge.lineValue) : null, ok: judge.ok, reason: judge.reason, station: judge.station, slot: judge.slot, free: s.custom });
  if (hit) {
    n = { ...n, done: n.done.map((d, k) => (k === s.ti ? true : d)) };
    n = push(n, { kind: 'solved', world: 'run', task: label(s), line: S.tokensText(judge.tokens), value: ratText(judge.runValue) });
  }
  return n;
}

/* ═════════════ Monde « twins » ═════════════ */

export function dropTwin(s, m) {
  if (s.world !== 'twins' || !m) return s;
  const tried = s.tried.some((t) => eq(t.v, m.v)) ? s.tried : [...s.tried, m];
  return push({ ...s, m, tried, ran: null, solvedNow: false, last: { event: 'drop' } }, { kind: 'drop', world: 'twins', task: label(s), letter: 'x', value: ratText(m.v), free: s.custom });
}
export const twinValues = (s) => (s.world === 'twins' && s.m && s.a && s.b ? S.pairAt(s.a, s.b, s.m.v) : null);
export const canExpand = (s) => s.world === 'twins' && !!s.a && !!s.b && !!S.toTerms(s.a) && !!S.toTerms(s.b);
export const reducedTex = (tree) => { const t = S.toTerms(tree); return t ? termsTex(t.length ? t : [{ c: 0, p: 0 }]) : null; };
export function expandTwin(s) {
  if (!canExpand(s) || s.expanded) return s;
  return push({ ...s, expanded: true, last: { event: 'expand' } }, { kind: 'expand', task: label(s), left: reducedTex(s.a), right: reducedTex(s.b) });
}
/** « counter » : accepté ssi la bille courante sépare les deux murs ; « equal » : accepté ssi les formes développées sont égales. */
export function claim(s, kind) {
  if (s.world !== 'twins' || s.solvedNow) return s;
  let ok = false; let reason = null; let witness = null;
  const pair = twinValues(s);
  if (kind === 'counter') {
    if (!pair) reason = 'nomarble';
    else if (pair.equal) reason = 'same';
    else { ok = true; witness = ratText(s.m.v); }
  } else if (!s.expanded) reason = 'notenough';
  else if (S.samePolynomial(s.a, s.b)) ok = true;
  else reason = 'differ';
  let n = { ...s, ran: { kind, ok, reason, pair }, solvedNow: ok, last: { event: ok ? 'claim' : 'refused', reason }, refusals: s.refusals + (ok ? 0 : 1) };
  n = push(n, { kind: 'claim', world: 'twins', task: label(s), claim: kind, ok, witness });
  if (ok) {
    n = { ...n, done: n.done.map((d, k) => (k === s.ti ? true : d)) };
    n = push(n, { kind: 'solved', world: 'twins', task: label(s), line: kind, value: witness ?? '' });
  }
  return n;
}

/* ═════════════ Commun ═════════════ */

const nextUnsolved = (s) => { for (let k = 1; k <= s.tasks.length; k += 1) { const i = (s.ti + k) % s.tasks.length; if (!s.done[i]) return i; } return -1; };
export const canNext = (s) => (s.custom ? s.done.some((d) => !d) : s.solvedNow && nextUnsolved(s) >= 0);
export function nextTask(s) {
  if (!canNext(s)) return s;
  const i = s.custom ? s.done.findIndex((d) => !d) : nextUnsolved(s);
  return load(s, i);
}
/** « أعِد التجربة » (questions du labo) : LA MÊME tâche repart de son état initial, non résolue (même si c'était la dernière). */
export const retryTask = (s) => (s.custom ? s : { ...load(s, s.ti), done: s.done.map((d, i) => (i === s.ti ? false : d)) });
export function backToTasks(s) { return s.custom ? load(s, s.done.findIndex((d) => !d) >= 0 ? s.done.findIndex((d) => !d) : s.ti) : s; }

/* ── « جرّب أعدادك » ── */

/** Une expression libre (un seul monde « run ») : refusée si elle ne se lit pas ou n'a aucune lettre. */
export function setFreeExpr(s, text) {
  if (s.world !== 'run') return s;
  const tree = tryParse(text);
  if (!tree || S.letters(tree).length === 0 || S.letters(tree).some((l) => l !== 'x' && l !== 'y')) return s;
  const free = { ...s.free, expr: text };
  const env = Object.fromEntries(S.letters(tree).filter((l) => s.env?.[l]).map((l) => [l, s.env[l]]));
  return push({ ...s, custom: true, free, tree, env, choices: S.slots(tree).map(() => ({})), touched: false, predicted: null, ran: null, solvedNow: false, held: null, last: { event: 'custom' } }, { kind: 'custom', world: 'run' });
}
export function setFreeTwins(s, which, text) {
  if (s.world !== 'twins') return s;
  const tree = tryParse(text);
  const other = tryParse(which === 'a' ? s.free.b : s.free.a);
  if (!tree || S.letters(tree).some((l) => l !== 'x')) return s;
  const free = { ...s.free, [which]: text };
  const a = which === 'a' ? tree : other; const b = which === 'b' ? tree : other;
  return push({ ...s, custom: true, free, a: a ?? s.a, b: b ?? s.b, m: s.m, expanded: false, ran: null, solvedNow: false, last: { event: 'custom' } }, { kind: 'custom', world: 'twins' });
}
export function stepFreeMarble(s, field, delta) {
  const free = { ...s.free };
  const [lo, hi] = field === 'num' ? [-9, 9] : FREE_RANGE.den;
  const v = Math.max(lo, Math.min(hi, free[field] + delta));
  if (v === free[field]) return s;
  free[field] = v;
  return { ...s, free };
}
export const freeMarble = (s) => { const { num, den } = s.free; return marble(den === 1 ? String(num) : `${num}/${den}`); };

/* ═════════════ Découverte ═════════════ */

export const discoveryReady = (s) => s.world === 'run' && allDone(s) && s.bareTried;

/** Le témoin de la découverte : la dernière course refusée pour parenthèses manquantes (SES nombres), sinon un exemple fixe. */
export function discoveryWitness(s) {
  const ev = [...s.events].reverse().find((e) => e.kind === 'run' && !e.ok && !e.free && e.reason === 'unbracketed');
  const e2 = ev ?? [...s.events].reverse().find((e) => e.kind === 'run' && !e.ok && !e.free);
  return e2 ? { run: e2.runValue, line: e2.lineValue, task: e2.task, reason: e2.reason } : { run: '10', line: '2', task: 'r3', reason: 'unbracketed' };
}

/* ═════════════ Onboarding (LabCoach) ═════════════ */

/**
 * Le PROCHAIN geste utile, en données pures `{ id, target, gesture }` (MANIPULATION_CONTRACT §8quater) — le geste, jamais la règle.
 *   run : rack · predict · slots · times · run · bare · next   |   twins : drop · claim · expand · next
 */
export function coachOf(s) {
  if (allDone(s) && !s.custom) return null;
  if (s.solvedNow) return canNext(s) ? { id: 'next', target: '[data-mr-next]', gesture: 'tap' } : null;
  if (s.ran && !s.ran.ok && s.world === 'run') return null; // le refus parle (la bannière) : le guide se tait
  if (s.world === 'twins') {
    if (!s.tried.length) return { id: 'drop', target: '[data-mr-rack]', gesture: 'drag' };
    if (!s.expanded && (s.refusals > 0 || s.tried.length >= 3) && canExpand(s)) return { id: 'expand', target: '[data-mr-expand]', gesture: 'tap' };
    if (s.refusals === 0) return { id: 'claim', target: '[data-mr-claims]', gesture: 'tap', prefer: 'above' };
    return null;
  }
  if (!filled(s)) return { id: 'rack', target: '[data-mr-rack]', gesture: 'drag' };
  if (s.predict && !s.custom && !s.predicted) return { id: 'predict', target: '[data-mr-predict]', gesture: 'tap' };
  const sl = slotsOf(s);
  if (!s.touched && sl.length) {
    const firstSlot = sl[0];
    return { id: 'slots', target: `[data-mr-slot="${firstSlot.i}"]`, gesture: 'tap' };
  }
  const gap = sl.find((x) => x.needsTimes && !s.choices[x.i]?.times);
  if (gap && s.nRuns === 0 && !s.tTouched) return { id: 'times', target: `[data-mr-times="${gap.i}"]`, gesture: 'tap' };
  if (!s.bareTried && s.nRuns >= 1 && negativeSlots(s).length && everyNegativeBracketed(s) && !s.custom) {
    return { id: 'bare', target: `[data-mr-slot="${negativeSlots(s)[0]}"]`, gesture: 'tap' };
  }
  if (canRun(s)) return { id: 'run', target: '[data-mr-run]', gesture: 'drag', prefer: 'above' };
  return null;
}
