/**
 * difference-meter — LA LOGIQUE PURE de « مقياس الفرق » (3AM, unité 4 « الحساب الحرفي », درس « مقارنة عددين ناطقين », 2026-10-26).
 * Exacte : tout vient de `packages/core/arithmetic/orderSign.js` (sur `powers.js` et `substitution.js`), importé PAR CHEMIN. Aucun flottant pour un VERDICT ;
 * les positions en pixels (`pixelGap`, `tagLayout`) ne servent qu'à l'affichage.
 *
 * LE MODÈLE. Une rail de verre graduée porte deux perles a et b. Un galvanomètre à aiguille a DEUX sondes, une rouge et une noire, et lit « rouge MOINS noir ». La main
 * BRANCHE chaque sonde sur une perle (c'est elle qui décide quel nombre est soustrait), lit UNE aiguille (à droite, à gauche, ou sur 0), puis choisit la carte d'ordre
 * (a > b / a < b / a = b). Trois épreuves :
 *   - `rail` visible : les perles sont à leur place ; `swap` (« بدّل المجسّين ») fait traverser l'aiguille, pas la carte juste ;
 *   - `write` (متقدم) : l'aiguille est couverte par un volet jusqu'à ce que la main ait ÉCRIT la différence (signe, numérateur, dénominateur — jugée par la valeur) ;
 *   - `curtain` (متقدم) : les perles sont derrière un rideau, seule la carte « a − b = −0,3 » est donnée ; une 4e carte « لا نستطيع الحكم » est refusée ;
 *   - monde `race` : les perles sont A(x) et B(x), la main tient x ; sondes fixées (rouge sur A, noire sur B) ; l'aiguille lit A − B ; la main simplifie A − B puis remplit
 *     une carte d'ordre par région de x.
 *
 * UNE TÂCHE
 *   rail : { id, a:'5/4', b:'3/4', range:[-2,2], mustSwap?, write?, curtain?: { left:'a', value:'-0,3' } }
 *   race : { id, A:'3x+5', B:'2x+9', xmax:10 }
 *
 * ÉVÉNEMENTS (`state.trials`, rejoués tels quels vers `onTrial`)
 *   { kind: 'plug', task, red, black } · { kind: 'reading', task, value } · { kind: 'swap', task } · { kind: 'write', task, written, value, ok }
 *   { kind: 'verdict', task, card, ok } · { kind: 'x', x } · { kind: 'coef', task, ok } · { kind: 'regions', task, ok } · { kind: 'solved', world, task } · { kind: 'custom', world }
 * Les essais libres portent `free: true` (jamais comptés).
 */
import { rat, ratText } from '@smarter-academy/core/arithmetic/powers.js';
import * as O from '@smarter-academy/core/arithmetic/orderSign.js';

export const RAIL_W = 600;
export const TAG_W = 74;
export const MERGED_W = 224;

/* ── Les niveaux et le monde `race` (les mêmes valeurs que `levels.js`, comparées par un test) ─────────────────────────────────────── */
export const PRESETS = Object.freeze({
  beginner: { world: 'rail', tasks: [
    { id: 'd1', a: '5/4', b: '3/4', range: [-2, 2] },
    { id: 'd2', a: '-3/2', b: '-1/2', range: [-2, 2], mustSwap: true },
    { id: 'd3', a: '9/11', b: '13/16', range: [-2, 2] },
  ] },
  advanced: { world: 'rail', tasks: [
    { id: 'd4', a: '17/12', b: '10/7', range: [-2, 2], write: true },
    { id: 'd5', a: '-7/6', b: '-9/8', range: [-2, 2], write: true },
    { id: 'd6', a: '2/5', b: '7/10', range: [-2, 2], curtain: { left: 'a', value: '-0,3' } },
  ] },
  race: { world: 'race', tasks: [
    { id: 'e1', A: '3x+5', B: '2x+9', xmax: 10 },
    { id: 'e2', A: '2(x+3)', B: '2x+1', xmax: 10 },
    { id: 'e3', A: 'x²+3', B: 'x²+x', xmax: 8 },
  ] },
});

const frac = (r) => Number(r.n) / Number(r.d);

export function buildTask(raw, i = 0) {
  if (raw.A !== undefined) {
    const A = O.parseExpr(raw.A); const B = O.parseExpr(raw.B);
    const xmax = raw.xmax ?? 10;
    const top = Math.max(frac(O.valueOfExpr(A, rat(xmax))), frac(O.valueOfExpr(B, rat(xmax))), 10);
    const hi = Math.ceil((top + 4) / 10) * 10;
    const terms = O.exprDifference(A, B);
    return Object.freeze({
      id: raw.id ?? `t${i}`, kind: 'race', A, B, textA: raw.A, textB: raw.B, xmax, range: [0, hi], free: !!raw.free,
      terms, regions: O.signRegions(terms), form: O.linearForm(terms),
    });
  }
  const a = typeof raw.a === 'string' ? O.parseNumber(raw.a) : raw.a;
  const b = typeof raw.b === 'string' ? O.parseNumber(raw.b) : raw.b;
  const curtain = raw.curtain ? { left: raw.curtain.left, value: O.parseNumber(raw.curtain.value) } : null;
  const range = raw.range ?? [-2, 2];
  return Object.freeze({
    id: raw.id ?? `t${i}`, kind: 'rail', a, b, textA: raw.a, textB: raw.b, range, mustSwap: !!raw.mustSwap, write: !!raw.write, curtain, free: !!raw.free,
    unitPx: RAIL_W / (range[1] - range[0]),
  });
}

const BLANK = {
  red: null, black: null, sel: null, taskSwapped: false, verdict: null, wrongs: 0, written: { sign: 1, num: 0, den: 1 }, writeOk: false,
  x: 0, xs: [0], coef: { p: 0, q: 0 }, coefOk: false, regionPick: [], regionsOk: false, last: null, flash: 0,
};
const fresh = (task) => (task.kind === 'race'
  ? { ...BLANK, red: 'a', black: 'b', regionPick: (task.regions ?? []).map(() => null) }
  : { ...BLANK, ...(task.curtain ? { red: 'a', black: 'b' } : {}) });

export function init(numbers = {}) {
  const raws = numbers.tasks ?? PRESETS.beginner.tasks;
  const tasks = raws.map(buildTask);
  return { world: numbers.world ?? tasks[0].kind, tasks, ti: 0, done: {}, free: null, swapTried: false, trials: [], ...fresh(tasks[0]) };
}

export const isFree = (s) => !!s.free;
export const taskOf = (s) => (s.free ? s.free : s.tasks[s.ti]);
export const isRace = (s) => taskOf(s).kind === 'race';
export const taskDone = (s, i = s.ti) => !s.free && !!s.done[i];
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const allDone = (s) => s.tasks.every((_, i) => !!s.done[i]);
const note = (s, e) => ({ ...s, trials: [...s.trials, { task: s.ti, taskId: taskOf(s).id, free: !!s.free, ...e }] });
const refuse = (s, reason, extra = {}) => note({ ...s, last: { kind: 'refused', reason, ...extra }, flash: s.flash + 1 }, { kind: reason === 'verdict' ? 'verdict' : reason, ok: false, ...(extra.event ?? {}) });

/* ── Lectures ────────────────────────────────────────────────────────────────────────────────── */

/** Les valeurs des perles (rationnels exacts) : sur la rail ce sont a et b ; dans `race`, A(x) et B(x). */
export function beadValues(s) {
  const t = taskOf(s);
  if (t.kind === 'race') { const x = xRat(s); return { a: O.valueOfExpr(t.A, x), b: O.valueOfExpr(t.B, x) }; }
  return { a: t.a, b: t.b };
}
export const xRat = (s) => (typeof s.x === 'number' ? (Number.isInteger(s.x) ? rat(s.x) : rat(Math.round(s.x * 2), 2)) : rat(0));
export const plugged = (s) => !!s.red && !!s.black && s.red !== s.black;
/** Ce que lit l'aiguille (rouge − noir), ou null tant que les deux sondes ne sont pas branchées. Le rideau donne une valeur connue. */
export function readingOf(s) {
  const t = taskOf(s);
  if (t.kind === 'rail' && t.curtain) return t.curtain.left === 'a' ? t.curtain.value : O.negateRat(t.curtain.value);
  if (!plugged(s)) return null;
  const { a, b } = beadValues(s);
  return s.red === 'a' ? O.difference(a, b) : O.difference(b, a);
}
/** Le volet couvre l'aiguille tant que la différence n'est pas écrite (épreuves `write`). */
export const shutterClosed = (s) => !s.free && taskOf(s).write === true && plugged(s) && !s.writeOk;
/** L'aiguille est-elle visible ? (branchée, volet levé.) */
export const needleShown = (s) => readingOf(s) !== null && !shutterClosed(s);
/** Les cartes d'ordre sont-elles actives ? */
export const cardsActive = (s) => !taskDone(s) && (taskOf(s).curtain || (plugged(s) && !shutterClosed(s)));
/** L'écart en pixels de la rail virtuelle (600 px) entre les deux perles. */
export function gapPx(s) {
  const t = taskOf(s);
  if (t.kind === 'race') { const { a, b } = beadValues(s); return O.pixelGap(a, b, RAIL_W / (t.range[1] - t.range[0])); }
  return O.pixelGap(t.a, t.b, t.unitPx);
}
/** Abscisse (viewBox 0 … RAIL_W) d'une valeur sur la rail. */
export const xOf = (task, v) => ((frac(v) - task.range[0]) / (task.range[1] - task.range[0])) * RAIL_W;
/**
 * Les étiquettes de valeur des perles : si elles se chevauchent (moins de TAG_W entre leurs centres) elles fusionnent en UNE (« حبّتان متراكبتان »).
 * Rend { merged, a: { x }, b: { x } } ; les x sont bornés pour que l'étiquette reste sur la rail.
 */
export function tagLayout(xa, xb) {
  const clamp = (x) => Math.min(RAIL_W - TAG_W / 2, Math.max(TAG_W / 2, x));
  const merged = Math.abs(xa - xb) < TAG_W;
  return { merged, a: { x: clamp(xa) }, b: { x: clamp(xb) }, mid: Math.min(RAIL_W - MERGED_W / 2, Math.max(MERGED_W / 2, (xa + xb) / 2)) };
}
/** Le sens de l'aiguille : −1 (gauche) | 0 | 1 (droite). */
export const needleSide = (s) => { const r = readingOf(s); return r ? Math.sign(Number(r.n)) : null; };

/* ── Brancher ────────────────────────────────────────────────────────────────────────────────── */

export function selectProbe(s, which) {
  if (taskDone(s) || taskOf(s).curtain || isRace(s)) return s;
  return { ...s, sel: s.sel === which ? null : which, last: null };
}
/** Brancher la sonde `which` ('red' | 'black') sur la perle `bead` ('a' | 'b'). Les deux sondes sur la même perle : refusé (la différence d'un nombre avec lui-même est 0, l'élève le voit). */
export function plug(s, which, bead) {
  if (taskDone(s) || taskOf(s).curtain || isRace(s)) return s;
  const other = which === 'red' ? s.black : s.red;
  if (other === bead) return refuse({ ...s, sel: null }, 'same', { event: { probe: which, bead } });
  const next = { ...s, [which]: bead, sel: null, last: null, verdict: null, writeOk: false, written: BLANK.written };
  const n = note(next, { kind: 'plug', red: next.red, black: next.black });
  return plugged(n) ? note(n, { kind: 'reading', value: ratText(readingOf(n)) }) : n;
}
/** Toucher une perle : la sonde choisie s'y branche ; sinon la première sonde libre (rouge d'abord). */
export function tapBead(s, bead) {
  if (taskDone(s) || taskOf(s).curtain || isRace(s)) return s;
  const which = s.sel ?? (!s.red ? 'red' : !s.black ? 'black' : null);
  return which ? plug(s, which, bead) : s;
}
export function unplug(s, which) {
  if (taskDone(s) || taskOf(s).curtain || isRace(s)) return s;
  return { ...s, [which]: null, sel: which, verdict: null, writeOk: false, last: null };
}
/** « بدّل المجسّين » : l'aiguille traverse, les perles et la carte juste restent. */
export function swap(s) {
  if (taskDone(s) || taskOf(s).curtain || isRace(s) || !plugged(s) || shutterClosed(s)) return s;
  const n = { ...s, red: s.black, black: s.red, taskSwapped: true, swapTried: true, last: { kind: 'swapped' }, flash: s.flash + 1 };
  return finishSwap(note(note(n, { kind: 'swap' }), { kind: 'reading', value: ratText(readingOf(n)) }));
}

/* ── Écrire la différence (متقدم) ────────────────────────────────────────────────────────────── */

export function setWritten(s, patch) {
  if (taskDone(s) || !shutterClosed(s)) return s;
  const w = { ...s.written, ...patch };
  w.num = Math.max(0, Math.min(999, Math.round(Number(w.num) || 0)));
  w.den = Math.max(1, Math.min(999, Math.round(Number(w.den) || 1)));
  w.sign = w.sign < 0 ? -1 : 1;
  return { ...s, written: w, last: null };
}
export function checkWritten(s) {
  if (!shutterClosed(s)) return s;
  const reading = readingOf(s);
  const j = O.writtenJudge(s.written, reading);
  if (!j.ok) return refuse({ ...s, wrongs: s.wrongs + 1 }, 'write', { written: s.written, value: j.value, reading, event: { written: `${s.written.sign < 0 ? '-' : ''}${s.written.num}/${s.written.den}`, value: j.value ? ratText(j.value) : null, expected: ratText(reading) } });
  return note({ ...s, writeOk: true, last: { kind: 'written', value: j.value }, flash: s.flash + 1 }, { kind: 'write', written: `${s.written.sign < 0 ? '-' : ''}${s.written.num}/${s.written.den}`, value: ratText(j.value), ok: true });
}

/* ── Le verdict ──────────────────────────────────────────────────────────────────────────────── */

/** Les cartes d'ordre : 'gt' | 'lt' | 'eq', et (rideau seulement) 'nojudge'. */
export function chooseCard(s, card) {
  if (taskDone(s) || !cardsActive(s)) return s;
  const t = taskOf(s);
  let ok; let reading = readingOf(s);
  if (t.kind === 'rail' && t.curtain) {
    const order = O.fromDifference({ left: t.curtain.left, value: t.curtain.value });
    ok = card !== 'nojudge' && O.CARD_OF[order] === card;
  } else if (card === 'nojudge') {
    ok = false;
  } else {
    const j = O.verdictJudge(t.a, t.b, s.red, card);
    ok = j.ok; reading = j.reading;
  }
  if (!ok) return refuse({ ...s, wrongs: s.wrongs + 1, verdict: null }, 'verdict', { card, reading, event: { card } });
  let n = note({ ...s, verdict: card, last: { kind: 'verdict', card }, flash: s.flash + 1 }, { kind: 'verdict', card, ok: true });
  if (s.free || (t.mustSwap && !n.taskSwapped)) return n;
  n = note({ ...n, done: { ...n.done, [n.ti]: true } }, { kind: 'solved', world: 'rail' });
  return n;
}
/** Après un verdict juste, une tâche `mustSwap` attend encore « بدّل المجسّين » : la dernière action la termine. */
function finishSwap(s) {
  const t = taskOf(s);
  if (s.free || taskDone(s) || !t.mustSwap || !s.verdict || !s.taskSwapped) return s;
  return note({ ...s, done: { ...s.done, [s.ti]: true } }, { kind: 'solved', world: 'rail' });
}

/* ── Le monde `race` ─────────────────────────────────────────────────────────────────────────── */

export function setX(s, x) {
  const t = taskOf(s);
  if (t.kind !== 'race') return s;
  const step = s.free ? 0.5 : 1;
  const v = Math.max(0, Math.min(t.xmax, Math.round(Number(x) / step) * step));
  if (v === s.x) return s;
  return note({ ...s, x: v, xs: s.xs.includes(v) ? s.xs : [...s.xs, v], last: null }, { kind: 'x', x: v });
}
/** Les coefficients de A − B ne s'ouvrent qu'après avoir fait bouger x (deux valeurs vues). */
export const coefOpen = (s) => isRace(s) && (s.free || s.xs.length >= 2);
export function setCoef(s, patch) {
  if (!isRace(s) || s.coefOk) return s;
  const c = { ...s.coef, ...patch };
  c.p = Math.max(-9, Math.min(9, Math.round(Number(c.p) || 0)));
  c.q = Math.max(-30, Math.min(30, Math.round(Number(c.q) || 0)));
  return { ...s, coef: c, last: null };
}
export function checkCoef(s) {
  const t = taskOf(s);
  if (t.kind !== 'race' || s.coefOk || !coefOpen(s)) return s;
  const j = O.coefJudge(t.terms, s.coef);
  if (!j.ok) {
    const sum = O.linearForm(O.exprDifference(t.A, { terms: t.B.terms.map((u) => ({ c: -u.c, p: u.p })) }));
    const bracket = sum && sum.p === s.coef.p && sum.q === s.coef.q;
    return refuse({ ...s, wrongs: s.wrongs + 1 }, 'coef', { written: s.coef, reading: readingOf(s), event: { p: s.coef.p, q: s.coef.q, reason: bracket ? 'bracket' : 'value' } });
  }
  return note({ ...s, coefOk: true, last: { kind: 'coef' }, flash: s.flash + 1 }, { kind: 'coef', ok: true });
}
export function setRegionCard(s, i, card) {
  const t = taskOf(s);
  if (t.kind !== 'race' || !s.coefOk || s.regionsOk || !t.regions?.[i]) return s;
  const pick = [...s.regionPick]; pick[i] = pick[i] === card ? null : card;
  return { ...s, regionPick: pick, last: null };
}
export const regionsFilled = (s) => taskOf(s).kind === 'race' && s.regionPick.length > 0 && s.regionPick.every(Boolean);
export function checkRegions(s) {
  const t = taskOf(s);
  if (t.kind !== 'race' || !s.coefOk || s.regionsOk || !regionsFilled(s)) return s;
  const j = O.regionCardsJudge(t.terms, s.regionPick);
  if (!j.ok) {
    const i = j.wrong[0];
    const x = O.sampleIn(t.regions[i]);
    return refuse({ ...s, wrongs: s.wrongs + 1 }, 'regions', { region: i, sample: x, reading: O.valueOfExpr({ terms: t.terms }, x), event: { wrong: j.wrong } });
  }
  let n = note({ ...s, regionsOk: true, last: { kind: 'regions' }, flash: s.flash + 1 }, { kind: 'regions', ok: true });
  if (!s.free) n = note({ ...n, done: { ...n.done, [n.ti]: true } }, { kind: 'solved', world: 'race' });
  return n;
}

/* ── Passer d'une tâche à l'autre, recommencer ──────────────────────────────────────────────── */

export function nextTask(s) { return canNext(s) ? { ...s, ti: s.ti + 1, ...fresh(s.tasks[s.ti + 1]) } : s; }
export const restartTask = (s) => (s.free ? { ...s, ...fresh(s.free) } : { ...s, ...fresh(s.tasks[s.ti]), done: { ...s.done, [s.ti]: false } });
export const canRetry = (s) => !s.free && !taskDone(s) && (s.verdict !== null || s.writeOk || s.coefOk || s.red !== null);
export const retry = (s) => (canRetry(s) ? { ...s, ...fresh(taskOf(s)) } : s);

/* ── « جرّب أعدادك » ─────────────────────────────────────────────────────────────────────────── */

/** Deux nombres libres sur la rail : { ok, a, b } | { ok: false, which, why }. */
export function validateFreeRail(ta, tb) {
  const a = O.validateNumber(ta); if (!a.ok) return { ok: false, which: 'a', why: a.why };
  const b = O.validateNumber(tb); if (!b.ok) return { ok: false, which: 'b', why: b.why };
  return { ok: true, a: a.value, b: b.value };
}
export function validateFreeRace(ta, tb) {
  const a = O.validateExpr(ta); if (!a.ok) return { ok: false, which: 'a', why: a.why };
  const b = O.validateExpr(tb); if (!b.ok) return { ok: false, which: 'b', why: b.why };
  return { ok: true, A: ta, B: tb };
}
export function setFreeRail(s, ta, tb) {
  const v = validateFreeRail(ta, tb);
  if (!v.ok) return s;
  const hi = Math.max(2, Math.ceil(Math.max(Math.abs(frac(v.a)), Math.abs(frac(v.b)))));
  const task = buildTask({ id: 'free', a: v.a, b: v.b, range: [-hi, hi], free: true });
  return note({ ...s, free: task, ...fresh(task), red: s.red ?? 'a', black: s.black ?? 'b' }, { kind: 'custom', world: 'rail' });
}
export function setFreeRace(s, ta, tb) {
  const v = validateFreeRace(ta, tb);
  if (!v.ok) return s;
  const task = buildTask({ id: 'free', A: v.A, B: v.B, xmax: 10, free: true });
  return note({ ...s, free: task, ...fresh(task), coefOk: false }, { kind: 'custom', world: 'race' });
}
export const toGuided = (s) => (s.free ? { ...s, free: null, ...fresh(s.tasks[s.ti]) } : s);

/* ── Découverte et onboarding ───────────────────────────────────────────────────────────────── */

/** 'side' (مبتدئ : متى تميل الإبرة إلى اليمين ؟) | 'need' (متقدم : هل تحتاج إلى a و b ؟) | null. */
export function discoveryKind(s) {
  if (s.free || s.tasks[0].kind === 'race') return null;
  const needs = s.tasks.some((t) => t.curtain);
  if (needs) return s.tasks.every((_, i) => !!s.done[i]) ? 'need' : null;
  return s.tasks.every((_, i) => !!s.done[i]) && s.swapTried ? 'side' : null;
}
const discoveryReady = (s) => discoveryKind(s) !== null;

/** Le prochain geste utile — jamais la valeur. */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  const t = taskOf(s);
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-dm-next]', gesture: 'tap' } : { id: 'free', target: '[data-dm-free]', gesture: 'type' };
  if (t.kind === 'race') {
    if (!coefOpen(s)) return { id: 'x', target: '[data-dm-x]', gesture: 'drag', prefer: 'above' };
    if (!s.coefOk) return { id: 'coef', target: '[data-dm-coef-panel]', gesture: 'tap' };
    return { id: 'cards', target: '[data-dm-regions]', gesture: 'tap' };
  }
  if (t.curtain) return { id: 'verdict', target: '[data-dm-cards]', gesture: 'tap' };
  if (!s.red) return { id: 'plug', target: '[data-dm-probe="red"]', gesture: 'drag', prefer: 'above' };
  if (!s.black) return { id: 'plug2', target: '[data-dm-probe="black"]', gesture: 'drag', prefer: 'above' };
  if (shutterClosed(s)) return { id: 'write', target: '[data-dm-write]', gesture: 'tap' };
  if (t.mustSwap && s.verdict && !s.taskSwapped) return { id: 'swap', target: '[data-dm-swap]', gesture: 'tap' };
  return { id: 'verdict', target: '[data-dm-cards]', gesture: 'tap', prefer: 'above' };
}
