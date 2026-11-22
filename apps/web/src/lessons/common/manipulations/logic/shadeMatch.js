/**
 * shade-match — LA LOGIQUE PURE de « آلة مزج الألوان » (3AM, unité 2 « العمليات على الكسور والأعداد الناطقة », درس « تساوي كسرين ومقارنتهما », 2026-10-26).
 * Exacte : tout vient de `packages/core/arithmetic/fractions3.js` (`matchNumerator`, `shadeVerdict`) et de `powers.js`, importés PAR CHEMIN, jamais par le barrel
 * du cœur. Aucun flottant pour un VERDICT ; la couleur affichée (`mixShade`) est dérivée de la part de bleu exacte `t = c / (c + d)`.
 *
 * LE MODÈLE. Un seau de référence A contient `a` mesures de bleu pour `b` mesures de blanc. Le seau B reçoit `d` mesures de blanc (imposées) et la MAIN verse `c`
 * mesures de bleu (un entier, 0 … 40). B a la même teinte que A exactement quand `c × b = a × d` (les produits en croix) ; sinon l'aiguille du mesureur penche
 * du côté du signe de `c × b − a × d` (plus clair / plus foncé). Quand `a × d ÷ b` n'est pas entier, AUCUN c ne convient : les deux voisins `⌊a·d/b⌋` et
 * `⌊a·d/b⌋ + 1` restent de part et d'autre du zéro — la comparaison naît de l'impossible.
 *
 * Une TÂCHE : `{ id, kind, a, b, d, veil? }`.
 *  - `match` (défaut) : régler c. Exacte (a·d/b entier) : finie quand un lâcher tombe pile. Impossible : finie quand l'élève appuie « لا يوجد عدد صحيح » APRÈS avoir
 *    essayé deux entiers CONSÉCUTIFS de part et d'autre (un plus clair, le suivant plus foncé). Avec `veil` (متقدم) le mesureur est VOILÉ jusqu'à l'engagement :
 *    exacte → « أثبّت » (c courant) ; impossible → « لا يوجد عدد صحيح » avec les deux voisins écrits.
 *  - `compare` : `{ a, b, c, d }` deux seaux finis (A = a/b, B = c/d), pas de dosage ; prédire lequel est le plus foncé AVANT que le mesureur soit révélé.
 *  - `pick` (monde `equal`) : `{ a, b, candidates: [[c, d], …] }` ; on charge chaque seau candidat et on lit l'aiguille ; finie quand tous ont été chargés.
 *
 * ÉVÉNEMENTS (`state.trials`, rejoués tels quels vers `onTrial`) :
 *   { kind: 'release', mission, c, d, verdict: 'lighter' | 'match' | 'darker', free, ok }        // un lâcher du levier (mesureur visible)
 *   { kind: 'impossible', mission, below, above, ok }                                           // « لا يوجد عدد صحيح » (below/above : les voisins écrits, ou null)
 *   { kind: 'commit', mission, value, ok }                                                      // un engagement voilé : c (exacte) ou 'A' | 'B' (compare)
 *   { kind: 'load', mission, c, d, verdict }                                                     // un seau candidat chargé (monde `equal`)
 *   { kind: 'custom', free: true, mission: 'free', c, a, b, d, verdict, ok: false }               // un lâcher dans « جرّب أعدادك » (jamais compté)
 *   { kind: 'solved', mission }
 */
import { rat, ratText } from '@smarter-academy/core/arithmetic/powers.js';
import { matchNumerator, shadeVerdict } from '@smarter-academy/core/arithmetic/fractions3.js';

export const MAX_C = 40;
const FREE_RANGE = Object.freeze({ min: 1, max: 20 });
export const SHOT_MS = 450;
export const SETTLE_MS = 650;

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 's1', a: 3, b: 4, d: 8 },
    { id: 's2', a: 2, b: 3, d: 9 },
    { id: 's3', a: 3, b: 4, d: 10 },
  ] },
  advanced: { tasks: [
    { id: 'a1', a: 5, b: 6, d: 18, veil: true },
    { id: 'a2', a: 4, b: 7, d: 12, veil: true },
    { id: 'a3', a: 9, b: 12, d: 8, veil: true },
    { id: 'a4', kind: 'compare', a: 7, b: 9, c: 10, d: 13, veil: true },
  ] },
  equal: { world: 'equal', tasks: [
    { id: 'e1', kind: 'pick', a: 6, b: 8, candidates: [[9, 12], [15, 20], [7, 9], [12, 15]] },
  ] },
});

const int = (v) => Math.trunc(Number(v));

/** Chiffres arabes ou latins → latins. */
export function latin(text) {
  return String(text ?? '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
}

/** La tâche complétée ; exception si une donnée est invalide (a, b, d ≥ 1). */
function buildTask(raw, i = 0) {
  const kind = raw.kind ?? 'match';
  const a = int(raw.a); const b = int(raw.b);
  if (!(a >= 1) || !(b >= 1)) throw new Error('la référence a/b doit avoir a ≥ 1 et b ≥ 1');
  const base = { id: raw.id ?? `t${i}`, kind, a, b, veil: !!raw.veil };
  if (kind === 'pick') {
    const candidates = (raw.candidates ?? []).map(([c, d]) => Object.freeze({ c: int(c), d: int(d), match: int(c) * b === a * int(d) }));
    if (candidates.length < 2 || candidates.some((x) => !(x.d >= 1) || x.c < 0)) throw new Error('seaux candidats invalides');
    return Object.freeze({ ...base, candidates, matching: candidates.filter((x) => x.match).length });
  }
  if (kind === 'compare') {
    const c = int(raw.c); const d = int(raw.d);
    if (!(c >= 1) || !(d >= 1)) throw new Error('le seau B doit avoir c ≥ 1 et d ≥ 1');
    const { verdict, gap } = shadeVerdict(a, b, c, d);
    return Object.freeze({ ...base, c, d, darker: verdict === 'darker' ? 'B' : verdict === 'lighter' ? 'A' : null, gap });
  }
  const d = int(raw.d);
  if (!(d >= 1)) throw new Error('le blanc doit être ≥ 1');
  const m = matchNumerator(a, b, d);
  if (m.exact && Number(m.c) > MAX_C) throw new Error('le bleu à verser dépasse la capacité');
  return Object.freeze({
    ...base, d, impossible: !m.exact, goal: m.exact ? Number(m.c) : null, below: Number(m.below), above: Number(m.above),
  });
}

const BLANK = { c: 0, relC: 0, settled: null, seen: [], revealed: false, belowText: '', aboveText: '', choice: null, loaded: -1, loadedSet: [], refusal: null };

export function init(numbers = {}) {
  const raws = numbers.tasks ?? PRESETS.beginner.tasks;
  const world = numbers.world === 'equal' ? 'equal' : 'mix';
  return { world, tasks: raws.map(buildTask), ti: 0, ...BLANK, done: {}, trials: [], free: null };
}

/* ── Lecture ────────────────────────────────────────────────────────────────────────────────── */

export const isFree = (s) => !!s.free;
/** La tâche courante, ou la configuration libre (même forme qu'une tâche `match`). */
export const taskOf = (s) => (s.free ? s.free : s.tasks[s.ti]);
export const taskDone = (s, i = s.ti) => !s.free && !!s.done[i];
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const allDone = (s) => s.tasks.every((_, i) => !!s.done[i]);
/** La découverte (مبتدئ, monde `mix`, tâches sans voile) s'ouvre quand toutes les tâches sont faites. */
export const discoveryReady = (s) => !s.free && s.world === 'mix' && !s.tasks.some((t) => t.veil) && allDone(s);
/** Le mesureur est-il VOILÉ ? Une tâche voilée tant qu'aucun engagement n'a eu lieu (`revealed`) et qu'elle n'est pas finie ; jamais en libre. */
export const veiled = (s) => !s.free && !!taskOf(s).veil && !s.revealed && !taskDone(s);
/** Peut-on doser ? (tâches `match` et libre ; pas de levier sur `compare` ni `pick`) ; figé quand la tâche est finie. */
export const canDose = (s) => (s.free || taskOf(s).kind === 'match') && !taskDone(s);

/** Le bleu et le blanc du seau B courant : `{ c, d }` (le seau candidat chargé en `pick`, les seaux finis en `compare`). */
export function bucketB(s) {
  const t = taskOf(s);
  if (!s.free && t.kind === 'compare') return { c: t.c, d: t.d };
  if (!s.free && t.kind === 'pick') {
    const x = s.loaded >= 0 ? t.candidates[s.loaded] : null;
    return x ? { c: x.c, d: x.d } : { c: 0, d: t.candidates[0].d };
  }
  return { c: s.c, d: t.d };
}

/** Le jugement exact du seau B courant contre la référence. `verdict` ∈ lighter | match | darker ; `gap` BigInt signé. */
export function judge(s) {
  const t = taskOf(s);
  const { c, d } = bucketB(s);
  if (c === 0) return { verdict: 'lighter', gap: -BigInt(t.a) * BigInt(d), empty: true };
  const j = shadeVerdict(t.a, t.b, c, d);
  return { ...j, empty: false };
}

/**
 * La part de bleu de chaque seau, EXACTE : `t = c / (c + d)` (un rationnel de `powers.js`) ; à rapports égaux les parts sont ÉGALES, donc les couleurs
 * identiques. `ref` pour la référence a/b (t = a / (a + b)).
 */
export function shares(s) {
  const t = taskOf(s);
  const { c, d } = bucketB(s);
  return { ref: rat(t.a, t.a + t.b), mix: rat(c, c + d) };
}

/** Une part de bleu (rationnel `{ n, d }`) → un indice 0 … 1 (le plus foncé pour t ≥ 0,6), linéaire : la même part donne la MÊME valeur. */
export function depth(share) { return Math.min(1, (Number(share.n) / Number(share.d)) / 0.6); }

/** La position de l'aiguille pour `c` mesures de bleu dans `d` de blanc contre la référence de la tâche `t`, ∈ [−1, 1] : le signe de c·b − a·d ; la grandeur est la différence relative, plancher 0,12 hors du zéro. */
export function needleAt(t, c, d) {
  if (c === 0) return -1;
  const { gap } = shadeVerdict(t.a, t.b, c, d);
  if (gap === 0n) return 0;
  const rel = Math.abs(Number(gap)) / (t.a * d);
  const mag = Math.max(0.12, Math.min(1, rel * 5));
  return gap < 0n ? -mag : mag;
}
export function needle(s) { const { c, d } = bucketB(s); return needleAt(taskOf(s), c, d); }

/* ── Gestes ─────────────────────────────────────────────────────────────────────────────────── */

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const touch = (s, patch) => ({ ...s, ...patch, refusal: null });

/** Une (ou n) mesure de bleu versée : l'APERÇU ; le lâcher est l'essai. */
export function dose(s, n = 1) {
  if (!canDose(s)) return s;
  const c = clamp(s.c + n, 0, MAX_C);
  return c === s.c ? s : touch(s, { c, settled: null });
}
/** « تصريف » : une mesure ôtée. */
export const drain = (s) => dose(s, -1);

function eventOf(s, kind) {
  const t = taskOf(s);
  const j = judge(s);
  const verdict = j.verdict;
  if (kind === 'custom') return Object.freeze({ kind: 'custom', free: true, mission: 'free', a: t.a, b: t.b, c: s.c, d: t.d, verdict, ok: false });
  return Object.freeze({ kind: 'release', mission: t.id, a: t.a, b: t.b, c: s.c, d: t.d, verdict, free: false, ok: verdict === 'match' });
}

/**
 * Le LÂCHER du levier : l'essai jugé. Sans effet si rien n'a bougé depuis le dernier lâcher (ou si le mesureur est voilé : un essai voilé n'est pas un verdict,
 * seul l'engagement compte). Pose le tampon quand une tâche `match` exacte est sur la bonne teinte.
 */
export function release(s) {
  if (!canDose(s) || s.c === s.relC) return s;
  if (veiled(s)) return { ...s, relC: s.c, settled: null };
  const free = !!s.free;
  const ev = eventOf(s, free ? 'custom' : 'release');
  const add = [ev];
  const seen = free ? s.seen : [...s.seen.filter((x) => x.c !== s.c), { c: s.c, verdict: ev.verdict }];
  const next = { ...s, relC: s.c, settled: ev, seen, refusal: null };
  if (!free && ev.ok && !taskOf(s).impossible) {
    add.push(Object.freeze({ kind: 'solved', mission: taskOf(s).id }));
    next.done = { ...s.done, [s.ti]: true };
  }
  next.trials = [...s.trials, ...add];
  return next;
}

/** Un « encadrement » : deux entiers CONSÉCUTIFS déjà essayés, le plus petit plus clair et le suivant plus foncé. */
export function bracketSeen(s) {
  const by = Object.fromEntries(s.seen.map((x) => [x.c, x.verdict]));
  return Object.keys(by).some((k) => by[k] === 'lighter' && by[Number(k) + 1] === 'darker');
}

const refuse = (s, why) => ({ ...s, refusal: why });

/**
 * « لا يوجد عدد صحيح ». Mesureur visible (مبتدئ) : sans effet de tâche tant que l'encadrement n'est pas vu (`refusal: 'bracket'`) ; sur une tâche qui a une
 * solution entière : `refusal: 'exists'` (on ne dit pas laquelle). Mesureur voilé : les deux voisins écrits (`belowText`, `aboveText`) sont jugés.
 */
export function claimImpossible(s) {
  const t = taskOf(s);
  if (s.free || t.kind !== 'match' || taskDone(s)) return s;
  const veil = veiled(s) || (t.veil && !s.revealed);
  if (veil) {
    const below = Number(latin(s.belowText)); const above = Number(latin(s.aboveText));
    if (!s.belowText || !s.aboveText || !Number.isFinite(below) || !Number.isFinite(above)) return refuse(s, 'neighbours');
    const ok = !!t.impossible && below === t.below && above === t.above;
    const ev = Object.freeze({ kind: 'impossible', mission: t.id, below, above, ok });
    const next = { ...s, trials: [...s.trials, ev], revealed: true, settled: null, refusal: null };
    if (ok) { next.done = { ...s.done, [s.ti]: true }; next.trials = [...next.trials, Object.freeze({ kind: 'solved', mission: t.id })]; }
    return next;
  }
  if (!t.impossible) {
    const ev = Object.freeze({ kind: 'impossible', mission: t.id, below: null, above: null, ok: false });
    return { ...refuse(s, 'exists'), trials: [...s.trials, ev] };
  }
  if (!bracketSeen(s)) return refuse(s, 'bracket');
  const ev = Object.freeze({ kind: 'impossible', mission: t.id, below: t.below, above: t.above, ok: true });
  return { ...s, trials: [...s.trials, ev, Object.freeze({ kind: 'solved', mission: t.id })], done: { ...s.done, [s.ti]: true }, refusal: null };
}

export const setBelow = (s, raw) => (veiled(s) ? { ...s, belowText: latin(raw).replace(/[^0-9]/g, '').slice(0, 2) } : s);
export const setAbove = (s, raw) => (veiled(s) ? { ...s, aboveText: latin(raw).replace(/[^0-9]/g, '').slice(0, 2) } : s);

/** « أثبّت » : engage le c courant sur une tâche voilée. Juste → tampon ; faux → le mesureur est révélé (et la tâche reste ouverte). */
export function commit(s) {
  const t = taskOf(s);
  if (s.free || t.kind !== 'match' || !t.veil || taskDone(s) || s.c === 0) return s;
  const ok = !t.impossible && s.c === t.goal;
  const ev = Object.freeze({ kind: 'commit', mission: t.id, value: s.c, ok });
  const next = { ...s, trials: [...s.trials, ev], revealed: true, relC: s.c, settled: ok ? ev : s.settled, refusal: null };
  if (ok) { next.done = { ...s.done, [s.ti]: true }; next.trials = [...next.trials, Object.freeze({ kind: 'solved', mission: t.id })]; }
  return next;
}

/** `compare` : prédire lequel des deux seaux est le plus foncé (`'A'` ou `'B'`), puis le mesureur est révélé. La tâche est finie (la révélation instruit). */
export function chooseDarker(s, which) {
  const t = taskOf(s);
  if (s.free || t.kind !== 'compare' || taskDone(s) || (which !== 'A' && which !== 'B')) return s;
  const ok = t.darker === which;
  const ev = Object.freeze({ kind: 'commit', mission: t.id, value: which, ok });
  return { ...s, choice: which, revealed: true, refusal: null, done: { ...s.done, [s.ti]: true }, trials: [...s.trials, ev, ...(ok ? [Object.freeze({ kind: 'solved', mission: t.id })] : [])] };
}

/** `pick` : charge le seau candidat k (le mesureur le lit) ; la tâche est finie quand tous ont été chargés. */
export function loadCandidate(s, k) {
  const t = taskOf(s);
  if (s.free || t.kind !== 'pick' || taskDone(s) || k < 0 || k >= t.candidates.length) return s;
  const x = t.candidates[k];
  const verdict = shadeVerdict(t.a, t.b, x.c, x.d).verdict;
  const loadedSet = s.loadedSet.includes(k) ? s.loadedSet : [...s.loadedSet, k];
  const ev = Object.freeze({ kind: 'load', mission: t.id, c: x.c, d: x.d, verdict });
  const next = { ...s, loaded: k, loadedSet, refusal: null, trials: [...s.trials, ev] };
  if (loadedSet.length === t.candidates.length) { next.done = { ...s.done, [s.ti]: true }; next.trials = [...next.trials, Object.freeze({ kind: 'solved', mission: t.id })]; }
  return next;
}

/* ── Les tâches ─────────────────────────────────────────────────────────────────────────────── */

export function nextTask(s) {
  if (!canNext(s)) return s;
  return { ...s, ti: s.ti + 1, ...BLANK };
}
/** « إعادة » : la même tâche, le seau vide ; les essais restent. */
export const restartTask = (s) => (s.free ? { ...s, ...BLANK } : { ...s, ...BLANK, done: { ...s.done, [s.ti]: false } });

/* ── « جرّب أعدادك » : toujours ouvert ─────────────────────────────────────────────────────── */

/** `{ ok: true, cfg }` ou `{ ok: false, why: 'range' | 'empty' }`. a, b, d ∈ 1 … 20. */
export function validateFree(aText, bText, dText) {
  const num = (x) => { const v = latin(x).trim(); return /^\d+$/.test(v) ? Number(v) : null; };
  const a = num(aText); const b = num(bText); const d = num(dText);
  if ([aText, bText, dText].some((x) => String(x).trim() === '')) return { ok: false, why: 'empty' };
  if ([a, b, d].some((v) => v == null || v < FREE_RANGE.min || v > FREE_RANGE.max)) return { ok: false, why: 'range' };
  return { ok: true, cfg: { a, b, d } };
}
export function setFree(s, cfg) {
  const t = buildTask({ id: 'free', kind: 'match', ...cfg, veil: false });
  return { ...s, free: t, ...BLANK };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, ...BLANK } : s);

/* ── Onboarding ─────────────────────────────────────────────────────────────────────────────── */

/**
 * Le prochain geste utile — jamais le nombre de mesures : `lever` (verser), `meter` (lire l'aiguille après un lâcher), `drain` (on a trop versé), `impossible`
 * (s3 : les deux voisins essayés), `commit` (tâches voilées : engager), puis `free` quand TOUT est fait. `null` en libre ET dans la découverte de مبتدئ.
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  const t = taskOf(s);
  if (taskDone(s)) return canNext(s) ? null : { id: 'free', target: '[data-sm-free]', gesture: 'type' };
  if (t.kind === 'compare') return { id: 'commit', target: '[data-sm-pick]', gesture: 'tap' };
  if (t.kind === 'pick') return s.loadedSet.length === 0 ? { id: 'meter', target: '[data-sm-candidate]', gesture: 'tap' } : null;
  if (t.veil) {
    if (s.c > 0) return { id: 'commit', target: t.impossible ? '[data-sm-impossible]' : '[data-sm-commit]', gesture: 'tap', prefer: 'below' };
    return { id: 'lever', target: '[data-sm-lever]', gesture: 'drag' };
  }
  if (t.impossible && bracketSeen(s)) return { id: 'impossible', target: '[data-sm-impossible]', gesture: 'tap', prefer: 'below' };
  if (s.settled && s.settled.verdict === 'darker') return { id: 'drain', target: '[data-sm-drain]', gesture: 'tap', prefer: 'below' };
  if (s.settled) return { id: 'meter', target: '[data-sm-meter]', gesture: 'look' };
  return { id: 'lever', target: '[data-sm-lever]', gesture: 'drag' };
}

/* ── Découverte (مبتدئ, après s1 et s3) ─────────────────────────────────────────────────────── */

const fmt = (r) => ratText(r);

/**
 * Les nombres de la découverte et de la règle, de SES tâches : s1 (le premier c exact : `exact`) et s3 (la première impossible : `gone`), et les réfutations
 * calculées exactement — « on ajoute autant de bleu que de blanc ajouté » (c = a + (d − b), faux : plus foncé) et « plus de bleu que de blanc » (faux : c < d à la bonne teinte).
 */
export function formalOf(s) {
  const pool = s.tasks.some((t) => t.kind === 'match') ? s.tasks : init(PRESETS.beginner).tasks;   // les mondes sans dosage (equal, compare) n'ont pas de découverte : les nombres de مبتدئ
  const exact = pool.find((t) => t.kind === 'match' && !t.impossible) ?? pool[0];
  const gone = pool.find((t) => t.kind === 'match' && t.impossible) ?? pool[pool.length - 1];
  const addC = exact.a + (exact.d - exact.b);
  const addVerdict = shadeVerdict(exact.a, exact.b, addC, exact.d).verdict;
  return {
    exact: { a: exact.a, b: exact.b, d: exact.d, c: exact.goal, lhs: exact.goal * exact.b, rhs: exact.a * exact.d },
    gone: { a: gone.a, b: gone.b, d: gone.d, below: gone.below, above: gone.above, lhsBelow: gone.below * gone.b, rhsBelow: gone.a * gone.d, lhsAbove: gone.above * gone.b },
    add: { c: addC, d: exact.d, verdict: addVerdict, lhs: addC * exact.b, rhs: exact.a * exact.d },
    notBigger: { c: exact.goal, d: exact.d },
    text: fmt(rat(exact.a, exact.b)),
  };
}
