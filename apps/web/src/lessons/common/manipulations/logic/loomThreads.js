/**
 * loom-threads — LA LOGIQUE PURE des « خيوط النول » (3AM, unité 5, درس « المتباينات والعمليات », 2026-10-26). Exacte : les fractions et
 * `imageRay` viennent de `packages/core/arithmetic/linear.js` (importé PAR CHEMIN, jamais par le barrel du cœur).
 *
 * LE MODÈLE. Deux poutres graduées (la haute, la basse) ; chaque nombre x de la poutre haute est relié par un fil à son IMAGE sur la poutre basse.
 * Deux fils de laine portent a (rouge) et b (bleu), a < b. La MAIN tient UN nœud sur la poutre basse :
 *   - le PEIGNE (`comb`, + c) : le nœud est l'image du fil de 0 ; sa position EST c, et tout x arrive en x + c ;
 *   - le CLOU (`nail`, × c) : le fil de 0 est cloué en 0 et le nœud est l'image du fil de 1 ; sa position EST c, et tout x arrive en c·x.
 * Déposer le nœud (« اربط ») est un ESSAI : on lit l'ordre des deux images. Les fils se CROISENT ⇔ le facteur est strictement négatif ; × 0 écrase
 * tout sur 0 (0 = 0, plus de relation stricte). Une tâche peut demander une seconde étape (une troisième poutre) ou transporter une BANDE (x < 3).
 * « جرّب أعدادك » (`free`) : l'élève écrit a et b (demis) ; aucune tâche n'est cochée.
 */
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';

export const TOOLS = Object.freeze(['comb', 'nail']);
export const RANGE = Object.freeze({ comb: [-6, 6], nail: [-3, 3] });
const FREE_LIMIT = 5;
export const BEAM = 10;

/** Les tâches par défaut de chaque niveau (la leçon peut passer les siennes). Nombres exacts écrits en texte. */
const PRESETS = Object.freeze({
  beginner: {
    step: '1',
    tasks: [
      { id: 't1', kind: 'swap', a: '1', b: '3' },
      { id: 't2', kind: 'reach', a: '-2', b: '-1', target: ['6', '3'] },
      { id: 't3', kind: 'meet', a: '1', b: '3' },
    ],
  },
  advanced: {
    step: '1/2',
    tasks: [
      { id: 'a1', kind: 'reach', a: '-3/2', b: '1', target: ['5', '0'], maxStages: 2 },
      { id: 'a2', kind: 'band', band: { rel: '<', bound: '3' }, goal: { rel: '>', bound: '-6' }, maxStages: 2 },
      { id: 'a3', kind: 'reach', a: '2', b: '3', target: ['-1', '-3/2'] },
    ],
  },
});

const P = (v) => Lin.parseNumber(v);
const identity = (tool) => Lin.frac(tool === 'comb' ? 0 : 1);

/** Applique une étape { tool, c } à un nombre. */
export const stageOf = (tool, c, x) => (tool === 'comb' ? Lin.add(x, c) : Lin.mul(x, c));
const asStage = (st) => ({ op: st.tool === 'comb' ? 'add' : 'mul', k: st.c });

function buildTask(raw, i) {
  const t = { id: raw.id ?? `t${i}`, kind: raw.kind, maxStages: raw.maxStages ?? 1 };
  if (raw.kind === 'band') {
    t.band = { rel: raw.band.rel, bound: P(raw.band.bound) };
    t.goal = { rel: raw.goal.rel, bound: P(raw.goal.bound) };
  } else {
    t.a = P(raw.a);
    t.b = P(raw.b);
    if (Lin.cmp(t.a, t.b) >= 0) throw new Error('a doit être plus petit que b');
    if (raw.target) t.target = [P(raw.target[0]), P(raw.target[1])];
  }
  return Object.freeze(t);
}

/** L'état de départ. `numbers` = { step, tasks }. */
export function init(numbers = {}) {
  const base = PRESETS.beginner;
  const tasks = (numbers.tasks ?? base.tasks).map(buildTask);
  return {
    step: P(numbers.step ?? base.step), tasks, ti: 0, tool: 'nail', toolChosen: false, v: identity('nail'), stages: [], done: {},
    trials: [], last: null, free: null, negTried: false,
  };
}

export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]) && s.negTried;
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const isIdentity = (s) => Lin.eq(s.v, identity(s.tool));

/** La paire de départ (a, b) : de la tâche, ou celle de l'élève en libre. `null` pour une bande. */
export function startPair(s) {
  if (s.free) return { a: s.free.a, b: s.free.b };
  const t = taskOf(s);
  return t.kind === 'band' ? null : { a: t.a, b: t.b };
}
export const maxStages = (s) => (s.free ? 2 : taskOf(s).maxStages);
export const isBand = (s) => !s.free && taskOf(s).kind === 'band';

/** Les étapes engagées + l'étape sous la main (l'aperçu). */
export const liveStages = (s) => [...s.stages, { tool: s.tool, c: s.v }];

/** Les positions de a et b après chaque poutre : [ [a, b] (haute), …, [a', b'] (basse) ]. */
export function beams(s, withLive = true) {
  const pair = startPair(s);
  if (!pair) return null;
  const out = [[pair.a, pair.b]];
  const list = withLive ? liveStages(s) : s.stages;
  for (const st of list) { const [a, b] = out[out.length - 1]; out.push([stageOf(st.tool, st.c, a), stageOf(st.tool, st.c, b)]); }
  return out;
}
export const images = (s) => { const b = beams(s); return b ? b[b.length - 1] : null; };

/** La bande transportée : { rel, bound } ou { collapsed: true } (tâche bande). */
export function bandImage(s) {
  if (!isBand(s)) return null;
  return Lin.imageRay(taskOf(s).band, liveStages(s).map(asStage));
}

/** Le symbole d'ordre de deux nombres : '<', '>' ou '='. */
export const relOf = (p, q) => { const c = Lin.cmp(p, q); return c < 0 ? '<' : c > 0 ? '>' : '='; };

/** La poutre basse a-t-elle l'ordre inversé par rapport à la haute ? (croisement) */
export function crossed(s) {
  const pair = startPair(s);
  const img = images(s);
  if (!pair || !img) return false;
  return Lin.cmp(pair.a, pair.b) * Lin.cmp(img[0], img[1]) < 0;
}
export const collapsed = (s) => { const img = images(s); return !!img && Lin.eq(img[0], img[1]); };

function goalReached(s) {
  if (s.free) return false;
  const t = taskOf(s);
  const img = images(s);
  if (t.kind === 'swap') return Lin.cmp(img[0], img[1]) > 0;
  if (t.kind === 'meet') return Lin.eq(img[0], img[1]);
  if (t.kind === 'reach') return Lin.eq(img[0], t.target[0]) && Lin.eq(img[1], t.target[1]);
  const b = bandImage(s);
  return !b.collapsed && b.rel === t.goal.rel && Lin.eq(b.bound, t.goal.bound);
}
export const reached = goalReached;

/* ── Gestes ──────────────────────────────────────────────────────────────────────────────────── */

/** Arrondit au pas (1 ou 1/2), borne à la portée de l'outil. */
function snap(s, raw, tool = s.tool) {
  const x = typeof raw === 'number' ? raw : Lin.toNumber(raw);
  const m = Math.max(1, Math.round(1 / Lin.toNumber(s.step)));
  const [lo, hi] = RANGE[tool];
  const n = Math.max(lo * m, Math.min(hi * m, Math.round(x * m)));
  return Lin.frac(n, m);
}

export function setTool(s, tool) {
  if (!TOOLS.includes(tool)) return s;
  if (tool === s.tool && s.toolChosen) return s;
  return { ...s, tool, toolChosen: true, v: identity(tool), last: null };
}
/** Le nœud glisse (aperçu) : le nombre devient c. */
export function dragKnot(s, raw) {
  const v = snap(s, raw);
  return Lin.eq(v, s.v) ? s : { ...s, v };
}
export const nudge = (s, dir) => dragKnot(s, Lin.toNumber(s.v) + dir * Lin.toNumber(s.step));

/** « اربط » : l'essai jugé — lit l'ordre des deux images (ou le bord de la bande). */
export function tie(s) {
  const img = images(s);
  const live = { tool: s.tool, c: s.v };
  const band = isBand(s) ? bandImage(s) : null;
  const hit = goalReached(s);
  const pair = startPair(s);
  const trial = Object.freeze({
    kind: 'tie', task: s.free ? -1 : s.ti, taskKind: s.free ? 'free' : taskOf(s).kind, tool: live.tool, c: Lin.fracText(live.c), cNum: Lin.toNumber(live.c),
    stages: s.stages.length + 1, free: !!s.free,
    ...(pair ? {
      a: Lin.fracText(pair.a), b: Lin.fracText(pair.b), a2: Lin.fracText(img[0]), b2: Lin.fracText(img[1]),
      crossed: crossed(s), collapsed: collapsed(s), relTo: relOf(img[0], img[1]),
    } : {
      band: true, edge: band.collapsed ? '0' : Lin.fracText(band.bound), side: band.collapsed ? 'collapsed' : band.rel === '>' ? 'right' : 'left', collapsed: !!band.collapsed,
      crossed: !band.collapsed && band.rel === '>', relTo: band.collapsed ? '=' : band.rel,
    }),
    reached: hit,
  });
  const neg = live.tool === 'comb' && Lin.cmp(live.c, 0) < 0;
  return {
    ...s, last: trial, trials: [...s.trials, trial], negTried: s.negTried || neg,
    done: hit && !s.free ? { ...s.done, [s.ti]: true } : s.done,
  };
}

export const canStage = (s) => !isIdentity(s) && s.stages.length + 1 < maxStages(s);
/** « عارضة أخرى » : l'étape sous la main est engagée, une nouvelle poutre s'ouvre. */
export function addStage(s) {
  if (!canStage(s)) return s;
  return { ...s, stages: [...s.stages, { tool: s.tool, c: s.v }], v: identity(s.tool), last: null };
}
/** « تراجع » : annule l'étape sous la main, puis la dernière étape engagée. */
export function undo(s) {
  if (!isIdentity(s)) return { ...s, v: identity(s.tool), last: null };
  if (!s.stages.length) return s;
  const prev = s.stages[s.stages.length - 1];
  return { ...s, stages: s.stages.slice(0, -1), tool: prev.tool, v: prev.c, last: null };
}
export function nextTask(s) {
  if (!canNext(s)) return s;
  return { ...s, ti: s.ti + 1, stages: [], tool: 'nail', v: identity('nail'), last: null };
}
export const restartTask = (s) => ({ ...s, stages: [], tool: 'nail', v: identity('nail'), last: null });

/** « جرّب أعدادك » : l'élève écrit a et b (demis, de −5 à 5, a ≠ b). Renvoie le même état si l'écriture est refusée. */
export function parseFree(raw) {
  try {
    const x = P(String(raw).replace('−', '-'));
    if (Math.abs(Lin.toNumber(x)) > FREE_LIMIT || x.d > 2) return null;
    return x;
  } catch { return null; }
}
export function setFree(s, rawA, rawB) {
  const a = parseFree(rawA);
  const b = parseFree(rawB);
  if (!a || !b || Lin.eq(a, b)) return s;
  const [lo, hi] = Lin.cmp(a, b) < 0 ? [a, b] : [b, a];
  return { ...s, free: { a: lo, b: hi }, stages: [], tool: 'nail', v: identity('nail'), last: null };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, stages: [], tool: 'nail', v: identity('nail'), last: null } : s);

/* ── Lecture ─────────────────────────────────────────────────────────────────────────────────── */

export const trialEvidence = (tr) => ({ ...tr });
const guidedTrials = (s, i = s.ti) => s.trials.filter((t) => !t.free && t.task === i);

/**
 * Le prochain geste utile — jamais la réponse : `tool` (choisir une des deux cartes), `drag` (le nœud), `tie` (déposer), `tryNeg` (une fois, le
 * contraste : le peigne avec un nombre négatif), `stage` (متقدم : une deuxième poutre), `next`. `null` en libre et quand la découverte est gagnée.
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) {
    if (canNext(s)) return { id: 'next', target: '[data-lt-next]', gesture: 'tap' };
    if (!s.negTried) return { id: 'tryNeg', target: '[data-lt-tools]', gesture: 'tap' };
    return null;
  }
  const mine = guidedTrials(s);
  if (!s.toolChosen && mine.length === 0) return { id: 'tool', target: '[data-lt-tools]', gesture: 'tap' };
  if (isIdentity(s) && s.stages.length === 0 && mine.length === 0) return { id: 'drag', target: '[data-lt-knob]', gesture: 'drag' };
  if (s.stages.length === 0 && !isIdentity(s) && s.last?.kind !== 'tie') return { id: 'tie', target: '[data-lt-tie]', gesture: 'tap' };
  if (maxStages(s) > 1 && s.stages.length === 0 && mine.length >= 1 && canStage(s) && !s.last?.reached) return { id: 'stage', target: '[data-lt-stage]', gesture: 'tap' };
  if (s.stages.length >= 1 && isIdentity(s)) return { id: 'drag', target: '[data-lt-knob]', gesture: 'drag' };
  if (!isIdentity(s) && s.last?.kind !== 'tie') return { id: 'tie', target: '[data-lt-tie]', gesture: 'tap' };
  return { id: 'drag', target: '[data-lt-knob]', gesture: 'drag' };
}

/* ── Découverte : les réfutations avec SES essais ────────────────────────────────────────────── */

/** Ses essais : le peigne négatif (rien ne s'est croisé), un clou > 1 (rien ne s'est croisé), un clou négatif (croisement). */
export function witnesses(s) {
  const tries = s.trials.filter((t) => !t.band && t.stages === 1 && t.cNum !== 0);
  return {
    combNeg: tries.findLast((t) => t.tool === 'comb' && t.cNum < 0) ?? null,
    nailBig: tries.findLast((t) => t.tool === 'nail' && t.cNum > 1) ?? null,
    nailNeg: tries.findLast((t) => t.tool === 'nail' && t.cNum < 0) ?? null,
  };
}
