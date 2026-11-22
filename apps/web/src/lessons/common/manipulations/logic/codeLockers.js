/**
 * code-lockers — LA LOGIQUE PURE des « خزائن الأمانات » (3AM, unité 1 « الأعداد النسبية », درس « حاصل قسمة عددين نسبيين », 2026-10-26).
 * Exacte : tout vient de `packages/core/arithmetic/relativeOps.js` et `powers.js` (importés PAR CHEMIN, jamais par le barrel du cœur).
 *
 * LE MODÈLE. Un casier de la bibliothèque municipale a un cadenas à molettes. La règle écrite sur sa porte est « b × ? = a » (ou « ? × b = a ») :
 * il ne s'ouvre qu'avec le code q qui rend la règle vraie. Le code est lu sur des MOLETTES : une molette de SIGNE (+ / −) et des molettes de chiffres
 * (deux molettes d'entiers, ou un entier et deux décimales) ; en mode FRACTION le code est une fraction dont le signe de devant, le signe du numérateur
 * et le signe du dénominateur sont trois molettes. L'écran du cadenas MULTIPLIE en direct (b × code) à côté du résultat voulu ; tirer la poignée est
 * l'ESSAI. La définition « a ÷ b est le nombre q tel que b × q = a » EST le mécanisme ; rien n'énonce la règle des signes.
 *
 * MISSIONS (`tasks`, chacune `{ id, b, a, qFirst?, layout?, live?, commit?, switch?, writings? }`)
 *   layout   'int' (signe + dizaines + unités) · 'dec' (signe + unités + dixièmes + centièmes) · 'frac' (devant, ±numérateur, ±dénominateur) · 'free' (5 molettes)
 *   live     l'écran multiplie à chaque cran (مبتدئ) ; sinon il montre « ؟ » jusqu'au premier essai
 *   commit   le SIGNE doit être posé et « ثبّت » pressé avant que les molettes de chiffres se débloquent (متقدم : une prédiction) ; un signe faux est refusé
 *            au premier essai avec son calcul, et la molette de signe est libérée
 *   switch   le bouton « وضع الكسر » apparaît après deux essais (le code décimal ne suffit pas)
 *   writings le nombre de ÉCRITURES DIFFÉRENTES d'un même code qui doivent ouvrir le casier (monde `fraction`)
 *   qFirst   l'inconnue est écrite en PREMIER : « ? × b = a »
 * La zone libre « جرّب أعدادك » : b de −20 à 20 et a de −99 à 99 (un chiffre décimal), b = 0 est accepté et montré honnêtement.
 */
import * as R from '@smarter-academy/core/arithmetic/relativeOps.js';
import * as P from '@smarter-academy/core/arithmetic/powers.js';

const LAYOUTS = Object.freeze({
  int: ['s', 't', 'u'],
  dec: ['s', 'u', 'd1', 'd2'],
  free: ['s', 't', 'u', 'd1', 'd2'],
  frac: ['s', 'ns', 'n', 'ds', 'd'],
});
export const SIGN_KEYS = Object.freeze(['s', 'ns', 'ds']);
export const FREE_B = Object.freeze([-20, 20]);
export const FREE_A = Object.freeze([-99, 99]);

/** Les missions par défaut de chaque monde. */
const PRESETS = Object.freeze({
  beginner: {
    world: 'lockers',
    tasks: [
      { id: 'm1', b: '-6', a: '48' },
      { id: 'm2', b: '9', a: '-54' },
      { id: 'm3', b: '-7', a: '-63', qFirst: true },
      { id: 'm4', b: '-12', a: '-60' },
    ],
  },
  advanced: {
    world: 'lockers',
    tasks: [
      { id: 'a1', b: '-8', a: '-2', layout: 'dec', commit: true },
      { id: 'a2', b: '2,5', a: '-7,5', layout: 'dec', commit: true },
      { id: 'a3', b: '-0,4', a: '1,2', layout: 'dec', commit: true },
      { id: 'a4', b: '-5', a: '0', qFirst: true, layout: 'dec', commit: true },
    ],
  },
});

export const FRACTION_TASKS = Object.freeze([
  { id: 'f1', b: '-6', a: '4', layout: 'dec', live: true, switch: true, writings: 2 },
  { id: 'f2', b: '-9', a: '-6', layout: 'frac', live: true, writings: 2 },
]);

/* ── Lectures de base ───────────────────────────────────────────────────────────────────────── */

const rat = (x) => (x && typeof x === 'object' ? x : R.parseRel(String(x)));
export const text = (x) => R.relText(typeof x === 'object' ? x : rat(x));
const minus = (s) => String(s).replace(/-/g, '−');
const wrap = (r) => (P.sign(rat(r)) < 0 ? `(${text(r)})` : text(r));

/** La règle écrite sur la porte : « (−6) × ? = 48 » (texte LTR) ; `qFirst` : « ? × (−7) = −63 ». */
export function ruleText(task) {
  const b = wrap(task.b);
  return task.qFirst ? `? × ${b} = ${text(task.a)}` : `${b} × ? = ${text(task.a)}`;
}

/** Le calcul que l'écran écrit pour un code : « (−6) × (−3) = 18 ». */
export function calcText(task, code, product) {
  const b = wrap(task.b);
  const c = wrap(code);
  return `${task.qFirst ? `${c} × ${b}` : `${b} × ${c}`} = ${text(product)}`;
}

/** La phrase de division que le سجلّ écrit : « 48 ÷ (−6) = −8 ». */
export const sentenceOf = (task, q) => `${wrap(task.a)} ÷ ${wrap(task.b)} = ${text(q)}`;

/** Le quotient voulu. */
export const answerOf = (task) => (P.sign(rat(task.b)) === 0 ? null : R.divide(task.a, task.b));

/** Le nombre de décimales d'un nombre fini (ou null). */
function decimalPlaces(r) {
  if (!R.isFiniteDecimal(r)) return null;
  const s = R.relText(r);
  const i = s.indexOf(',');
  return i < 0 ? 0 : s.length - i - 1;
}

/** Le code est-il atteignable avec des molettes décimales de `places` décimales ? */
export function decimalReachable(task, places) {
  const q = answerOf(task);
  if (!q) return false;
  const d = decimalPlaces(q);
  return d != null && d <= places;
}

/* ── Les molettes ───────────────────────────────────────────────────────────────────────────── */

const RANGE = Object.freeze({ s: [-1, 1], ns: [-1, 1], ds: [-1, 1], t: [0, 9], u: [0, 9], d1: [0, 9], d2: [0, 9], n: [0, 20], d: [1, 20] });
/** Les graduations d'une molette, dans l'ordre : [−1, 1] pour un signe, 0…9 pour un chiffre. */
export function wheelItems(key) {
  const [lo, hi] = RANGE[key];
  return SIGN_KEYS.includes(key) ? [1, -1] : Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
}
export const freshWheels = () => ({ s: 1, ns: 1, ds: 1, t: 0, u: 0, d1: 0, d2: 0, n: 1, d: 1 });

/** La valeur exacte d'un code lu sur les molettes. */
export function codeValue(w, layout) {
  if (layout === 'frac') return P.div(P.rat(w.s * w.ns * w.n), P.rat(w.ds * w.d));
  if (layout === 'int') return P.rat(w.s * (10 * w.t + w.u));
  if (layout === 'dec') return P.rat(w.s * (100 * w.u + 10 * w.d1 + w.d2), 100);
  return P.rat(w.s * (1000 * w.t + 100 * w.u + 10 * w.d1 + w.d2), 100);
}

/** L'écriture d'un code en fraction : « −(2/3) », « −2/3 », « 2/−3 », « −2/−3 » (la clé de comparaison des ÉCRITURES). */
export function writingKey(w, layout) {
  if (layout !== 'frac') return text(codeValue(w, layout));
  return `${w.s < 0 ? '−(' : ''}${w.ns < 0 ? '−' : ''}${w.n}/${w.ds < 0 ? '−' : ''}${w.d}${w.s < 0 ? ')' : ''}`;
}

/** Une mission est-elle solvable avec ses molettes ? (init lève une erreur sinon). */
function solvable(task) {
  const q = answerOf(task);
  if (P.sign(rat(task.a)) === 0 && P.sign(rat(task.b)) !== 0) return true;
  if (!q) return false;
  const layout = task.layout ?? 'int';
  if (layout === 'frac' || task.switch) {
    for (let n = 0; n <= 20; n += 1) for (let d = 1; d <= 20; d += 1) if (P.eq(P.div(P.rat(n), P.rat(d)), P.sign(q) < 0 ? P.neg(q) : q)) return true;
    if (layout === 'frac') return false;
  }
  const abs = P.sign(q) < 0 ? P.neg(q) : q;
  if (layout === 'int') return R.isFiniteDecimal(abs) && decimalPlaces(abs) === 0 && P.sign(P.sub(abs, 99)) <= 0;
  if (layout === 'dec') return (decimalPlaces(abs) ?? 9) <= 2 && P.sign(P.sub(abs, P.parseRat('9,99'))) <= 0;
  return (decimalPlaces(abs) ?? 9) <= 2;
}

/* ── L'état ─────────────────────────────────────────────────────────────────────────────────── */

function normalize(tasks) {
  return tasks.map((tk) => ({
    layout: 'int', live: !tk.commit && (tk.layout ?? 'int') === 'int', ...tk, b: text(tk.b), a: text(tk.a),
  }));
}

const freshTask = (s, ti, over = {}) => {
  const tk = s.tasks[ti];
  return { ...s, ti, layout: tk.layout, wheels: freshWheels(), committed: null, moved: { digit: false, sign: false }, last: null, ...over };
};

/** L'état de départ. `numbers` = { world, tasks } (cf. PRESETS, FRACTION_TASKS). Une mission impossible lève une erreur. */
export function init(numbers = {}) {
  const world = numbers.world ?? 'lockers';
  const tasks = normalize(numbers.tasks ?? (world === 'fraction' ? FRACTION_TASKS : PRESETS.beginner.tasks));
  for (const tk of tasks) if (!solvable(tk)) throw new Error(`mission impossible : ${tk.id}`);
  const s = {
    world, tasks, ti: 0, done: {}, opened: {}, trials: [], record: [], free: null, switched: false,
    wheels: freshWheels(), layout: tasks[0].layout, committed: null, moved: { digit: false, sign: false }, last: null, next: 0,
  };
  return s;
}

export const taskOf = (s) => (s.free ? s.free.task : s.tasks[s.ti]);
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
const guidedTrials = (s, i = s.ti) => s.trials.filter((x) => !x.free && x.task === i);
const pullsOnTask = (s, i = s.ti) => guidedTrials(s, i).length;

/** Le bouton « وضع الكسر » : après deux essais sur une mission `switch`, ou toujours dans la zone libre. */
export const switchReady = (s) => (s.free ? true : !!taskOf(s).switch && pullsOnTask(s) >= 2 && !taskDone(s));
export const wheelKeys = (s) => LAYOUTS[s.layout];
/** Les molettes de chiffres sont verrouillées tant que le signe n'est pas posé (missions `commit`). */
export const digitsLocked = (s) => !s.free && !!taskOf(s).commit && s.committed == null && !taskDone(s);
/** La molette de signe est verrouillée après « ثبّت ». */
export const signLocked = (s) => !s.free && !!taskOf(s).commit && s.committed != null;
export const wheelLocked = (s, key) => (s.free ? false : taskDone(s) ? true : SIGN_KEYS.includes(key) ? (key === 's' && signLocked(s)) : digitsLocked(s));
export const codeNow = (s) => codeValue(s.wheels, s.layout);

/** Tourne une molette de `delta` crans (cyclique). Les signes basculent. */
export function turn(s, key, delta) {
  if (!LAYOUTS[s.layout].includes(key) || wheelLocked(s, key)) return s;
  const items = wheelItems(key);
  const at = items.indexOf(s.wheels[key]);
  const nextV = items[(at + delta + items.length * 8) % items.length];
  const isSign = SIGN_KEYS.includes(key);
  return { ...s, wheels: { ...s.wheels, [key]: nextV }, moved: { digit: s.moved.digit || !isSign, sign: s.moved.sign || isSign } };
}
/** Pose une molette sur une valeur précise (glisser jusqu'à un cran). */
export function setWheel(s, key, v) {
  if (!LAYOUTS[s.layout].includes(key) || wheelLocked(s, key) || !wheelItems(key).includes(v)) return s;
  const isSign = SIGN_KEYS.includes(key);
  return { ...s, wheels: { ...s.wheels, [key]: v }, moved: { digit: s.moved.digit || !isSign, sign: s.moved.sign || isSign } };
}

/** « ثبّت » : le signe est posé, les molettes de chiffres se débloquent. */
export const canCommit = (s) => !s.free && !!taskOf(s).commit && s.committed == null && s.moved.sign && !taskDone(s);
export const commit = (s) => (canCommit(s) ? { ...s, committed: s.wheels.s } : s);

/** Passer au mode fraction (jamais en arrière dans une mission ; la zone libre bascule dans les deux sens). */
export function switchMode(s) {
  if (!switchReady(s)) return s;
  if (s.free) return { ...s, layout: s.layout === 'frac' ? 'free' : 'frac', wheels: freshWheels(), last: null, moved: { digit: false, sign: false } };
  if (s.layout === 'frac') return s;
  return { ...s, layout: 'frac', wheels: freshWheels(), last: null, switched: true, moved: { digit: false, sign: false } };
}

/**
 * Juge un code pour un cadenas { b, a, qFirst } : { ok, product, reason }. `reason` : 'sign' (même distance, signe faux), 'distance', 'zero-lock'
 * (b = 0, a ≠ 0 : aucun code n'ouvre), null quand ça ouvre. b = 0 et a = 0 : tout code ouvre.
 */
export function judge(lock, code) {
  const product = P.mul(rat(lock.b), rat(code));
  if (P.sign(rat(lock.b)) === 0) return P.sign(rat(lock.a)) === 0 ? { ok: true, product, reason: null, all: true } : { ok: false, product, reason: 'zero-lock' };
  if (P.eq(product, rat(lock.a))) return { ok: true, product, reason: null };
  const same = P.sign(rat(lock.a)) !== 0 && P.eq(R.distance(product), R.distance(rat(lock.a)));
  return { ok: false, product, reason: same ? 'sign' : 'distance' };
}

/** Le code que l'écran multiplie en direct (مبتدئ) ; avant le premier essai d'une mission voilée, rien. */
export const liveCalc = (s) => {
  const t = taskOf(s);
  if (!t.live && !s.free) return null;
  return calcText(t, codeNow(s), P.mul(rat(t.b), codeNow(s)));
};

/** Tire la poignée : l'essai. */
export function pull(s) {
  const t = taskOf(s);
  if (!s.free && taskDone(s) && !t.writings) return s;
  if (!s.free && t.writings && taskDone(s)) return s;
  if (!s.free && t.commit && s.committed == null) return s;
  const lock = s.free ? s.free.task : t;
  const idx = s.free ? -1 : s.ti;
  const w = s.wheels;
  const layout = s.layout;
  const key = writingKey(w, layout);
  const base = { kind: 'pull', task: idx, taskId: t.id, free: !!s.free, layout, b: text(lock.b), a: text(lock.a) };
  const q = answerOf(lock);

  // 1) signe posé (متقدم) : refusé au premier essai si le signe est faux — avec le calcul « même distance, signe faux »
  if (!s.free && t.commit && q && P.sign(q) !== 0 && s.committed !== P.sign(q)) {
    const dist = R.distance(q);
    const code = P.mul(rat(s.committed), dist);
    const prod = P.mul(rat(lock.b), code);
    const ev = { ...base, ok: false, reason: 'sign', committed: s.committed, code: text(code), product: text(prod), calc: calcText(lock, code, prod), want: text(lock.a) };
    return { ...s, trials: [...s.trials, ev], last: ev, committed: null, moved: { ...s.moved, sign: false } };
  }

  const code = codeValue(w, layout);
  const j = judge(lock, code);
  let ev = { ...base, ok: j.ok, reason: j.reason, code: text(code), writing: key, product: text(j.product), calc: calcText(lock, code, j.product), want: text(lock.a), all: !!j.all };
  if (q) ev = { ...ev, answer: text(q) };
  if (s.free) return { ...s, trials: [...s.trials, ev], last: ev };

  if (!j.ok) return { ...s, trials: [...s.trials, ev], last: ev };

  const opened = s.opened[idx] ?? { keys: [], codes: [] };
  const fresh = !opened.keys.includes(key);
  const keys = fresh ? [...opened.keys, key] : opened.keys;
  const need = t.writings ?? 1;
  const doneNow = keys.length >= need;
  ev = { ...ev, fresh, count: keys.length, need, doneNow };
  const row = fresh ? { sig: `${t.id}:${key}`, id: t.id, rule: ruleText(t), code: text(code), writing: key, sentence: sentenceOf(t, code), task: idx } : null;
  return {
    ...s,
    trials: [...s.trials, ev], last: ev,
    opened: { ...s.opened, [idx]: { keys, codes: fresh ? [...opened.codes, text(code)] : opened.codes } },
    done: doneNow ? { ...s.done, [idx]: true } : s.done,
    record: row ? [...s.record, row] : s.record,
  };
}

export function nextTask(s) {
  if (!canNext(s)) return s;
  return freshTask(s, s.ti + 1);
}
export function restartTask(s) {
  if (s.free) return { ...s, wheels: freshWheels(), last: null };
  const done = { ...s.done };
  delete done[s.ti];
  const opened = { ...s.opened };
  delete opened[s.ti];
  return { ...freshTask(s, s.ti), done, opened, record: s.record.filter((r) => r.task !== s.ti) };
}

/* ── « جرّب أعدادك » ────────────────────────────────────────────────────────────────────────── */

/** Lit un nombre de la zone libre : au plus un chiffre décimal, dans l'intervalle. */
export function parseFree(raw, [lo, hi]) {
  const str = String(raw).trim();
  if (!/^[-−+]?[0-9٠-٩]+([,.٫][0-9٠-٩])?$/.test(str)) return null;
  let r;
  try { r = R.parseRel(str); } catch { return null; }
  if (P.sign(P.sub(r, lo)) < 0 || P.sign(P.sub(r, hi)) > 0) return null;
  return r;
}
export function setFree(s, bRaw, aRaw) {
  const b = parseFree(bRaw, FREE_B);
  const a = parseFree(aRaw, FREE_A);
  if (b == null || a == null) return s;
  const task = { id: 'free', b: text(b), a: text(a), layout: 'free', live: true };
  return { ...s, free: { task }, layout: 'free', wheels: freshWheels(), last: null, moved: { digit: false, sign: false } };
}
export const toGuided = (s) => (s.free ? freshTask({ ...s, free: null }, s.ti, { done: s.done }) : s);

/* ── Preuves, registre, onboarding ──────────────────────────────────────────────────────────── */

export const trialEvidence = (tr) => ({ ...tr });
export const recordRows = (s) => s.record.map((r) => ({ ...r }));

/**
 * Le prochain geste utile — jamais la réponse : `sign` (la molette de signe), `commit` (« ثبّت »), `digit` (une molette de chiffres), `handle`
 * (la poignée), `switch` (« وضع الكسر »), `next`. `null` en libre et quand la découverte est gagnée.
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  const t = taskOf(s);
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-cl-next]', gesture: 'tap' } : null;
  const mine = guidedTrials(s);
  if (switchReady(s) && s.layout !== 'frac') return { id: 'switch', target: '[data-cl-switch]', gesture: 'tap' };
  if (t.commit) {
    if (s.committed == null) return s.moved.sign ? { id: 'commit', target: '[data-cl-commit]', gesture: 'tap' } : { id: 'sign', target: '[data-cl-wheel="s"]', gesture: 'tap', prefer: 'below' };
    if (!s.moved.digit && mine.length === 0) return { id: 'digit', target: '[data-cl-wheel="u"]', gesture: 'drag', prefer: 'below' };
    return mine.length === 0 || s.last?.reason === 'sign' ? { id: 'handle', target: '[data-cl-handle]', gesture: 'drag', prefer: 'below' } : null;
  }
  if (s.layout === 'frac') return !s.moved.digit && mine.length === 0 ? { id: 'digit', target: '[data-cl-wheel="n"]', gesture: 'drag', prefer: 'below' } : null;
  if (!s.moved.digit && mine.length === 0) return { id: 'digit', target: '[data-cl-wheel="u"]', gesture: 'drag', prefer: 'below' };
  if (!s.moved.sign && mine.length === 0 && t.layout === 'int') return { id: 'sign', target: '[data-cl-wheel="s"]', gesture: 'tap', prefer: 'below' };
  return mine.length === 0 ? { id: 'handle', target: '[data-cl-handle]', gesture: 'drag', prefer: 'below' } : null;
}
export { minus };
