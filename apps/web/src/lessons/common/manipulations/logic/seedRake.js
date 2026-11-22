/**
 * seed-rake — LA LOGIQUE PURE de « مشط الشتلات » (3AM, unité 2 « العمليات على الكسور والأعداد الناطقة », درس « جمع وطرح كسرين », 2026-10-26).
 * Exacte : tout vient de `packages/core/arithmetic/fractions3.js` (`sumWith`, `cellsOf`, `zoneEnds`, `smallestCommonMultiple`, `isCommonMultiple`, `widestUnit`)
 * et de `powers.js`, importés PAR CHEMIN, jamais par le barrel du cœur. Aucun flottant pour un VERDICT.
 *
 * LE MODÈLE. Un carré de jardin (حوض) de 1 m de long. Des zones de cultures sont peintes à partir de la gauche, l'une après l'autre : `1/4` pour les tomates, `1/6` pour les
 * piments… (ou, pour une RÉCOLTE, une zone retirée de la fin de ce qui est planté). La MAIN étire un râteau : elle tient l'ESPACEMENT 1/N m (N plants par mètre,
 * 2 … 60). « ازرع » plante UN plant par case de largeur 1/N : l'espacement est BON ⇔ chaque zone contient un nombre ENTIER de cases ⇔ N est un multiple commun des
 * dénominateurs des zones. Sinon une case tombe à cheval sur la frontière de deux zones (un plant flétri, rien n'est compté). Le total est lu en plants :
 * « 5 plants × 1/12 m ». Tous les espacements qui conviennent donnent la MÊME longueur (l'invariant) ; le plus large est le plus petit multiple commun.
 *
 * Une TÂCHE : `{ id, kind, terms: [{ p: '1/4' }, { p: '1/6', sub?: true }], need?, needRefusal?, widest?, veil? }`.
 *  - `plant` (مبتدئ) : régler N puis « ازرع ». Finie quand `need` espacements DIFFÉRENTS ont convenu (défaut 1) et, si `needRefusal`, après AU MOINS un refus.
 *  - `predict` (متقدم) : le râteau est BLOQUÉ ; on écrit N et la longueur du total (une fraction), puis « ازرع » vérifie. Un total faux est réfuté par les plants.
 *    Avec `widest` (a4) un espacement qui convient mais n'est pas le plus large ouvre la question « هل توجد مسافة أوسع؟ » sans clore la tâche.
 *
 * ÉVÉNEMENTS (`state.trials`, rejoués tels quels vers `onTrial`) :
 *   { kind: 'plant', mission, N, ok: true, counts: [number…], signed: number, total: 'a/b', free: false }      // un espacement qui convient
 *   { kind: 'refused', mission, reason: 'border', N, zone, free: false, ok: false }                          // un plant à cheval sur une frontière
 *   { kind: 'predict', mission, N, value: 'a/b' | null, ok, why?: 'border' | 'value' | 'wider', free: false }  // متقدم
 *   { kind: 'hunt', mission }                                                                                 // l'étoile « أوسع مسافة؟ »
 *   { kind: 'custom', free: true, mission: 'free', N, ok: false, … }                                          // « جرّب أعدادك » : jamais compté
 *   { kind: 'solved', mission, N, total }
 */
import { rat, ratText } from '@smarter-academy/core/arithmetic/powers.js';
import { sumWith, zoneEnds, smallestCommonMultiple, isCommonMultiple, valueOf, toRaw, cellsOf } from '@smarter-academy/core/arithmetic/fractions3.js';

export const MIN_N = 2;
export const MAX_N = 60;
export const START_N = 5;
const FREE_ZONES = 3;
const FREE_MAX_DEN = 12;
const FREE_MAX_TOTAL = 2;

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'g1', terms: [{ p: '1/4' }, { p: '1/6' }], need: 2, needRefusal: true },
    { id: 'g2', terms: [{ p: '2/3' }, { p: '1/5' }] },
    { id: 'g3', terms: [{ p: '3/4' }, { p: '1/6', sub: true }] },
  ] },
  advanced: { tasks: [
    { id: 'a1', kind: 'predict', terms: [{ p: '5/6' }, { p: '3/8' }] },
    { id: 'a2', kind: 'predict', terms: [{ p: '7/10' }, { p: '4/15', sub: true }] },
    { id: 'a3', kind: 'predict', terms: [{ p: '1/2' }, { p: '1/3' }, { p: '1/4' }] },
    { id: 'a4', kind: 'predict', terms: [{ p: '3/8' }, { p: '5/12' }], widest: true },
  ] },
  fewest: { world: 'fewest', tasks: [{ id: 'f1', terms: [{ p: '3/4' }, { p: '5/6' }], widest: true }] },
});

/** Chiffres arabes ou latins → latins. */
export function latin(text) {
  return String(text ?? '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
}

const frText = (r) => ratText(r);
const toNum = (b) => (b == null ? null : Number(b));

/** Le texte « a/b » d'une valeur exacte (`rat`). */
export const valueText = frText;

/** Une fraction écrite par l'élève « n » et « d » (textes) → `{ n, d }` BigInt ou null. d ≥ 1. */
function parseFrac(nText, dText) {
  const n = latin(nText).trim(); const d = latin(dText).trim();
  if (!/^\d{1,3}$/.test(n) || !/^\d{1,3}$/.test(d)) return null;
  if (BigInt(d) === 0n) return null;
  return { n: BigInt(n), d: BigInt(d) };
}

/** La tâche complétée ; exception si une donnée est invalide. */
export function buildTask(raw, i = 0) {
  const kind = raw.kind ?? 'plant';
  const terms = (raw.terms ?? []).map((t) => ({ p: String(t.p), sub: !!t.sub }));
  if (terms.length < 1 || terms.length > FREE_ZONES) throw new Error('une à trois zones');
  if (terms.some((t, k) => t.sub && k !== terms.length - 1)) throw new Error('seule la dernière zone peut être une récolte');
  const { zones, total } = zoneEnds(terms);       // exception si négatif
  terms.forEach((t) => cellsOf(t.p, 1));           // exception si négatif
  const dens = terms.map((t) => valueOf(toRaw(t.p)).d);
  const lcm = smallestCommonMultiple(dens);
  if (lcm > BigInt(MAX_N)) throw new Error('le plus petit espacement dépasse la capacité du râteau');
  if (total.n > BigInt(FREE_MAX_TOTAL) * total.d) throw new Error('le total dépasse 2 m');
  const working = [];
  for (let N = MIN_N; N <= MAX_N; N += 1) if (isCommonMultiple(N, dens)) working.push(N);
  return Object.freeze({
    id: raw.id ?? `t${i}`, kind, terms: Object.freeze(terms), zones, total, totalText: frText(total), totalValue: total,
    dens: dens.map(Number), widestN: Number(lcm), working: Object.freeze(working),
    need: raw.need ?? 1, needRefusal: !!raw.needRefusal, widest: !!raw.widest, veil: kind === 'predict',
    harvest: terms.some((t) => t.sub), over: total.n > total.d,
  });
}

const BLANK = { N: START_N, planted: null, touched: false, refusal: null, hunt: false, wiser: false, predN: '', predNum: '', predDen: '', settled: null };

export function init(numbers = {}) {
  const raws = numbers.tasks ?? PRESETS.beginner.tasks;
  const world = numbers.world === 'fewest' ? 'fewest' : 'bed';
  const tasks = raws.map(buildTask);
  return { world, tasks, ti: 0, ...BLANK, record: {}, done: {}, trials: [], free: null, freePred: { n: '', d: '' } };
}

/* ── Lecture ────────────────────────────────────────────────────────────────────────────────── */

export const isFree = (s) => !!s.free;
export const taskOf = (s) => (s.free ? s.free : s.tasks[s.ti]);
export const taskDone = (s, i = s.ti) => !s.free && !!s.done[i];
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const allDone = (s) => s.tasks.every((_, i) => !!s.done[i]);
/** La découverte (مبتدئ, monde `bed`, tâches sans prédiction) s'ouvre quand toutes les tâches sont faites. */
export const discoveryReady = (s) => !s.free && s.world === 'bed' && !s.tasks.some((t) => t.kind === 'predict') && s.tasks.length >= 2 && allDone(s);
/** Le râteau est-il libre ? Bloqué en `predict` (on écrit N) ; en `plant` il reste libre même une fois la tâche finie (l'étoile « أوسع مسافة؟ » ouvre la chasse après deux espacements). */
export const canRake = (s) => s.free || taskOf(s).kind === 'plant';
export const canPlant = (s) => s.free || taskOf(s).kind === 'plant';
const isPredict = (s) => !s.free && taskOf(s).kind === 'predict';
const recOf = (s, t = taskOf(s)) => s.record[t.id] ?? { works: [], refused: [] };

/** Le résultat exact d'un planting à l'espacement N pour la tâche courante. */
export function resultAt(s, N = s.N) {
  const t = taskOf(s);
  const r = sumWith(t.terms, N);
  return { ...r, N, counts: r.counts.map(toNum), signedN: toNum(r.signed), totalText: frText(r.total) };
}

/** L'étoile « أوسع مسافة؟ » : jamais avant que DEUX espacements différents aient convenu (elle donnerait la réponse). */
export const starVisible = (s) => !s.free && taskOf(s).kind === 'plant' && recOf(s).works.length >= 2 && !s.hunt;

/** L'espacement le plus large (le plus petit N) parmi ceux qui ont convenu pour la tâche, ou null. */
export function widestFound(s) { const w = recOf(s).works; return w.length ? Math.min(...w) : null; }

/* ── Gestes ─────────────────────────────────────────────────────────────────────────────────── */

const clampN = (n) => Math.max(MIN_N, Math.min(MAX_N, Math.round(n)));
const touchState = (s, patch) => ({ ...s, ...patch, refusal: null });

/** Régler N (l'APERÇU) : efface le résultat précédent. */
export function setN(s, N) {
  if (!canRake(s)) return s;
  const n = clampN(N);
  if (n === s.N && s.touched) return s;
  return touchState(s, { N: n, planted: null, touched: true, settled: null });
}
export const stepN = (s, delta) => setN(s, s.N + delta);

const eventsFor = (s, t, res, free) => {
  if (free) return [Object.freeze({ kind: 'custom', free: true, mission: 'free', N: res.N, ok: false, works: res.ok })];
  return [];
};

/**
 * « ازرع » (مبتدئ et libre) : l'essai jugé. Un espacement qui convient → `plant` (ok) ; sinon `refused` (border). La tâche est finie quand `need` espacements
 * différents ont convenu (et, si `needRefusal`, après un refus).
 */
export function plant(s) {
  if (!canPlant(s)) return s;
  const t = taskOf(s);
  const res = resultAt(s);
  const planted = { ...res, ok: res.ok };
  if (s.free) return { ...s, planted, refusal: null, trials: [...s.trials, ...eventsFor(s, t, res, true)], settled: planted };
  const rec = recOf(s);
  const next = { ...s, planted, refusal: null, settled: planted };
  if (res.ok) {
    const works = rec.works.includes(res.N) ? rec.works : [...rec.works, res.N].sort((a, b) => a - b);
    next.record = { ...s.record, [t.id]: { ...rec, works } };
    const ev = Object.freeze({ kind: 'plant', mission: t.id, N: res.N, ok: true, counts: res.counts, signed: res.signedN, total: res.totalText, free: false });
    next.trials = [...s.trials, ev];
    const enough = works.length >= t.need && (!t.needRefusal || rec.refused.length > 0) && (!t.widest || works.includes(t.widestN));
    if (enough && !s.done[s.ti]) { next.done = { ...s.done, [s.ti]: true }; next.trials = [...next.trials, Object.freeze({ kind: 'solved', mission: t.id, N: res.N, total: res.totalText })]; }
  } else {
    const refused = [...rec.refused, { N: res.N, zone: res.borderAt }];
    next.record = { ...s.record, [t.id]: { ...rec, refused } };
    next.trials = [...s.trials, Object.freeze({ kind: 'refused', mission: t.id, reason: 'border', N: res.N, zone: res.borderAt, free: false, ok: false })];
    const enough = rec.works.length >= t.need && t.needRefusal && (!t.widest || rec.works.includes(t.widestN));
    if (enough && !s.done[s.ti]) { next.done = { ...s.done, [s.ti]: true }; next.trials = [...next.trials, Object.freeze({ kind: 'solved', mission: t.id, N: rec.works[0], total: t.totalText })]; }
  }
  return next;
}

/** L'étoile « أوسع مسافة؟ » : visible après deux espacements ; ouvre la chasse (le bandeau demande une distance plus large que la meilleure trouvée). */
export function star(s) {
  if (!starVisible(s) || s.hunt) return s;
  const t = taskOf(s);
  return { ...s, hunt: true, refusal: null, trials: [...s.trials, Object.freeze({ kind: 'hunt', mission: t.id })] };
}

/* ── متقدم : prédire N et le total ──────────────────────────────────────────────────────────── */

export const setPredN = (s, raw) => (isPredict(s) && !taskDone(s) ? { ...s, predN: latin(raw).replace(/[^0-9]/g, '').slice(0, 2) } : s);
export const setPredNum = (s, raw) => (isPredict(s) && !taskDone(s) ? { ...s, predNum: latin(raw).replace(/[^0-9]/g, '').slice(0, 3) } : s);
export const setPredDen = (s, raw) => (isPredict(s) && !taskDone(s) ? { ...s, predDen: latin(raw).replace(/[^0-9]/g, '').slice(0, 3) } : s);
export const predictReady = (s) => isPredict(s) && !taskDone(s) && s.predN !== '' && s.predNum !== '' && s.predDen !== '';

/**
 * « ازرع » en `predict` : on vérifie ce que l'élève a ÉCRIT. N hors 2 … 60 ou fraction invalide → `refusal: 'fields'`. Une frontière à cheval → `predict` { ok: false,
 * why: 'border' } (les plants le montrent). N qui convient mais total faux → { why: 'value' } réfuté par le décompte. Juste → la tâche est finie ; avec `widest`, un N qui
 * convient mais n'est pas le plus large reste ouvert ({ ok: true, why: 'wider' }).
 */
export function attempt(s) {
  if (!predictReady(s)) return s;
  const t = taskOf(s);
  const N = Number(s.predN);
  const f = parseFrac(s.predNum, s.predDen);
  if (!(N >= MIN_N && N <= MAX_N) || !f) return { ...s, refusal: 'fields' };
  const res = resultAt({ ...s, N }, N);
  const planted = { ...res, ok: res.ok };
  const base = { ...s, N, planted, settled: planted, refusal: null, touched: true };
  const valueOkay = res.ok && f.n * t.total.d === t.total.n * f.d;
  const evBase = { kind: 'predict', mission: t.id, N, value: `${f.n}/${f.d}`, free: false };
  if (!res.ok) return { ...base, trials: [...s.trials, Object.freeze({ ...evBase, ok: false, why: 'border' })] };
  if (!valueOkay) return { ...base, trials: [...s.trials, Object.freeze({ ...evBase, ok: false, why: 'value' })] };
  const rec = recOf(s);
  const works = rec.works.includes(N) ? rec.works : [...rec.works, N].sort((a, b) => a - b);
  const record = { ...s.record, [t.id]: { ...rec, works } };
  if (t.widest && N !== t.widestN) {
    return { ...base, record, wiser: true, trials: [...s.trials, Object.freeze({ ...evBase, ok: true, why: 'wider' })] };
  }
  return {
    ...base, record, wiser: false, done: { ...s.done, [s.ti]: true },
    trials: [...s.trials, Object.freeze({ ...evBase, ok: true }), Object.freeze({ kind: 'solved', mission: t.id, N, total: t.totalText })],
  };
}

/* ── Les tâches ─────────────────────────────────────────────────────────────────────────────── */

export function nextTask(s) { return canNext(s) ? { ...s, ti: s.ti + 1, ...BLANK } : s; }
/** « إعادة » : la même tâche, le râteau remis ; les essais restent. */
export const restartTask = (s) => (s.free ? { ...s, ...BLANK } : { ...s, ...BLANK, done: { ...s.done, [s.ti]: false }, record: { ...s.record, [taskOf(s).id]: { works: [], refused: [] } } });

/* ── « جرّب أعدادك » : toujours ouvert ─────────────────────────────────────────────────────── */

/**
 * `rows` = [{ a, b }] (textes ; une ligne vide est ignorée à partir de la 2e), `harvest` : la dernière ligne utilisée est une RÉCOLTE. Retourne `{ ok: true, cfg }` ou
 * `{ ok: false, why }` avec why ∈ empty | range | negative | total | lcm.
 */
export function validateFree(rows, harvest) {
  const used = [];
  for (let i = 0; i < FREE_ZONES; i += 1) {
    const r = rows[i] ?? { a: '', b: '' };
    const a = latin(r.a).trim(); const b = latin(r.b).trim();
    if (a === '' && b === '') { if (i === 0) return { ok: false, why: 'empty' }; break; }
    if (a === '' || b === '') return { ok: false, why: 'empty' };
    if (!/^\d+$/.test(a) || !/^\d+$/.test(b)) return { ok: false, why: 'range' };
    const na = Number(a); const nb = Number(b);
    if (na < 1 || nb < 1 || nb > FREE_MAX_DEN || na > 3 * nb) return { ok: false, why: 'range' };
    used.push({ p: `${na}/${nb}` });
  }
  if (harvest && used.length < 2) return { ok: false, why: 'range' };
  if (harvest) used[used.length - 1] = { ...used[used.length - 1], sub: true };
  try {
    buildTask({ id: 'free', terms: used });
  } catch (e) {
    const m = String(e.message);
    if (m.includes('négatif')) return { ok: false, why: 'negative' };
    if (m.includes('capacité')) return { ok: false, why: 'lcm' };
    if (m.includes('dépasse')) return { ok: false, why: 'total' };
    return { ok: false, why: 'range' };
  }
  return { ok: true, cfg: { terms: used } };
}
export function setFree(s, cfg) { return { ...s, free: buildTask({ id: 'free', ...cfg }), ...BLANK, freePred: s.freePred }; }
export const toGuided = (s) => (s.free ? { ...s, free: null, ...BLANK } : s);
export const setFreePred = (s, n, d) => ({ ...s, freePred: { n: latin(n).replace(/[^0-9]/g, '').slice(0, 3), d: latin(d).replace(/[^0-9]/g, '').slice(0, 3) } });

/** La longueur PRÉDITE du mode libre : `{ n, d, ratio }` (ratio = longueur / 1 m, flottant pour le DESSIN seulement) ou null. Aucun jugement : une fraction quelconque (2/10) est dessinée. */
export function freePrediction(s) {
  if (!s.free) return null;
  const f = parseFrac(s.freePred.n, s.freePred.d);
  if (!f) return null;
  return { n: f.n, d: f.d, ratio: Number(f.n) / Number(f.d), text: `${f.n}/${f.d}` };
}

/* ── Onboarding ─────────────────────────────────────────────────────────────────────────────── */

/**
 * Le prochain geste utile — jamais le nombre N : `rake` (étirer), `plant` (semer), `border` (un refus : essayer une autre distance), `predict` (متقدم : écrire avant de
 * semer), `free` quand TOUT est fait. `null` en libre ET dans la découverte de مبتدئ.
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  const t = taskOf(s);
  if (taskDone(s)) return canNext(s) ? null : { id: 'free', target: '[data-sr-free]', gesture: 'type' };
  if (t.kind === 'predict') return { id: 'predict', target: '[data-sr-predict]', gesture: 'type' };
  if (!s.touched) return { id: 'rake', target: '[data-sr-rake]', gesture: 'drag' };
  if (!s.planted) return { id: 'plant', target: '[data-sr-plant]', gesture: 'tap', prefer: 'below' };
  if (!s.planted.ok) return { id: 'border', target: '[data-sr-rake]', gesture: 'drag' };
  return { id: 'rake', target: '[data-sr-rake]', gesture: 'drag' };
}

/* ── Découverte (مبتدئ, après g1, g2, g3) ───────────────────────────────────────────────────── */

/**
 * Les nombres de la découverte, de SES essais de g1 : deux espacements qui ont convenu (`ok1`, `ok2`) et un refus (`bad`), et les réfutations calculées exactement —
 * « la plus grande distance réussit » (un N plus grand que celui qui a réussi échoue : `witnessBigger`) et « la somme des dénominateurs » (`sumDen` échoue).
 */
export function formalOf(s) {
  const t = s.tasks.find((x) => x.kind === 'plant') ?? init(PRESETS.beginner).tasks[0];
  const rec = s.record?.[t.id] ?? { works: [], refused: [] };
  const works = rec.works.length >= 2 ? rec.works.slice(0, 2) : t.working.slice(0, 2);
  const bad = rec.refused.length ? rec.refused[0].N : (() => { for (let N = 10; N <= MAX_N; N += 1) if (!t.working.includes(N)) return N; return 10; })();
  const dens = t.dens;
  const top = Math.max(...works);
  let witness = top + 1;
  while (t.working.includes(witness) && witness < MAX_N + 24) witness += 1;
  const sumDen = dens.reduce((a, b) => a + b, 0);
  return {
    task: t, dens, works, bad,
    badResult: sumWith(t.terms, bad), sumDen, sumDenWorks: t.working.includes(sumDen),
    witnessBigger: witness, witnessResult: sumWith(t.terms, witness),
    totalText: t.totalText, widestN: t.widestN, text: frText(rat(1, 1)),
    zone: Math.max(0, sumWith(t.terms, bad).borderAt),
  };
}
