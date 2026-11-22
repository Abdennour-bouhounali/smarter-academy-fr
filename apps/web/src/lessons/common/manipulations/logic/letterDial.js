/**
 * La LOGIQUE du labo `letter-dial` (« قرص الحروف », 1AM unité 6 « الحساب الحرفي », درس « تطبيق قاعدة حرفية », 2026-10-30) — pure, sans React.
 * L'arithmétique est rationnelle exacte (`packages/core/arithmetic/letterRule.js`, importé PAR CHEMIN), jamais de flottant.
 *
 * Une TÂCHE : `{ id, kind, name, formula | left+right, dials, target | out }`. La règle est imprimée sur une carte avec ses LETTRES ; la main TOURNE un cadran par lettre (un nombre entier de `min` à `max`) ;
 * la valeur du cadran TOMBE dans CHAQUE fente de la lettre et la carte calcule (parenthèses, produits, sommes). Trois sortes de tâches :
 *   set    mettre les cadrans sur les valeurs demandées (`target`) : la carte donne la valeur de la règle (le prix de 12 feuilles, le périmètre d'une clôture) ;
 *   find   tourner le cadran jusqu'à ce que la carte affiche la valeur demandée (`out`) : le client qui a payé 95 ;
 *   claim  une « règle » prétendue `left = right` : la carte compare les deux membres ; la tâche est faite quand l'élève a trouvé des valeurs où la carte affiche ≠ (UN contre-exemple suffit).
 * La main LÂCHE le cadran (`release`) pour qu'une valeur compte : passer par la valeur demandée en tournant ne termine jamais la tâche.
 *
 * Phases d'une tâche : `turn` (les cadrans tournent) → `done` (la tâche est faite : cadrans figés ; « أعد التجربة » la rouvre).
 * Le panneau libre « جرّب قاعدتك أنت » accepte une règle tapée par l'élève (« 3n+7 », « 2(a+b) », « ab ») : la multiplication implicite est LUE comme un produit et RENDUE avec ×.
 */
import * as R from '@smarter-academy/core/arithmetic/letterRule.js';

const bad = (m) => { throw new Error(`letter-dial : ${m}`); };

const KINDS = Object.freeze(['set', 'find', 'claim']);
export const FREE_MAX = 20;
const FREE_LETTERS = 2;

export function normalizeTasks(list) {
  return (list ?? []).map((t) => {
    if (!t || typeof t.id !== 'string') bad('tâche sans id');
    if (!KINDS.includes(t.kind)) bad(`sorte inconnue : ${t.kind}`);
    const claim = t.kind === 'claim';
    const tree = claim ? null : R.parse(t.formula);
    const left = claim ? R.parse(t.left) : null;
    const right = claim ? R.parse(t.right) : null;
    const letters = claim ? [...new Set([...R.lettersOf(left), ...R.lettersOf(right)])] : R.lettersOf(tree);
    if (!letters.length || letters.length > 2) bad(`${t.id} : une ou deux lettres`);
    const dials = {};
    for (const l of letters) {
      const d = t.dials?.[l];
      if (!d) bad(`${t.id} : pas de cadran pour ${l}`);
      const min = d.min ?? 0; const max = d.max; const start = d.start ?? min;
      if (!Number.isInteger(min) || !Number.isInteger(max) || max <= min || start < min || start > max) bad(`${t.id} : cadran ${l} invalide`);
      dials[l] = Object.freeze({ min, max, start });
    }
    const target = {};
    if (t.kind === 'set') {
      for (const l of letters) {
        const v = Number(t.target?.[l]);
        if (!Number.isInteger(v) || v < dials[l].min || v > dials[l].max) bad(`${t.id} : valeur demandée de ${l} hors du cadran`);
        target[l] = v;
      }
    }
    let out = null;
    if (t.kind === 'find') {
      out = R.parseNumber(t.out);
      if (!out) bad(`${t.id} : valeur demandée illisible`);
      if (letters.length !== 1) bad(`${t.id} : find n'a qu'une lettre`);
      const l = letters[0];
      const hits = [];
      for (let v = dials[l].min; v <= dials[l].max; v += 1) if (R.eq(R.evaluate(tree, { [l]: R.Q(v) }), out)) hits.push(v);
      if (hits.length !== 1) bad(`${t.id} : ${hits.length} valeurs atteignent ${t.out} (une seule attendue)`);
      target[l] = hits[0];
    }
    if (claim) {
      let counter = 0;
      const [l1, l2] = letters;
      for (let a = dials[l1].min; a <= dials[l1].max; a += 1) {
        for (let b = l2 ? dials[l2].min : 0; b <= (l2 ? dials[l2].max : 0); b += 1) {
          const env = { [l1]: R.Q(a), ...(l2 ? { [l2]: R.Q(b) } : {}) };
          if (!R.compare(left, right, env).eq) counter += 1;
        }
      }
      if (!counter) bad(`${t.id} : aucun contre-exemple sur les cadrans`);
      const start = Object.fromEntries(letters.map((l) => [l, R.Q(dials[l].start)]));
      if (!R.compare(left, right, start).eq) bad(`${t.id} : le départ doit être un cas où la prétendue règle tient`);
    }
    return Object.freeze({
      id: t.id, kind: t.kind, name: t.name ?? t.id, formula: t.formula ?? null, tree, left, right, letters: Object.freeze(letters), dials: Object.freeze(dials),
      target: Object.freeze(target), out, advanced: /^a\d/.test(t.id),
    });
  });
}

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'b1', kind: 'set', name: 'price', formula: '5*n+20', dials: { n: { max: 30 } }, target: { n: 12 } },
    { id: 'b2', kind: 'find', name: 'price', formula: '5*n+20', dials: { n: { max: 30 } }, out: '95' },
    { id: 'b3', kind: 'set', name: 'promo', formula: '5*n+20-n', dials: { n: { max: 30 } }, target: { n: 10 } },
  ] },
  advanced: { tasks: [
    { id: 'a1', kind: 'set', name: 'fence', formula: '2*(a+b)', dials: { a: { max: 30 }, b: { max: 30 } }, target: { a: 15, b: 8 } },
    { id: 'a2', kind: 'set', name: 'fence', formula: '2*(a+b)', dials: { a: { max: 30 }, b: { max: 30 } }, target: { a: 8, b: 15 } },
    { id: 'a3', kind: 'claim', name: 'claim', left: 'a+b', right: 'a*b', dials: { a: { max: 12, start: 2 }, b: { max: 12, start: 2 } } },
  ] },
});

export function init(numbers = {}) {
  const tasks = normalizeTasks(numbers.tasks ?? PRESETS.beginner.tasks);
  if (!tasks.length) bad('aucune tâche');
  return fresh({ tasks, ti: 0, done: {}, solved: {}, trials: [], free: null });
}
const startEnv = (t) => Object.fromEntries(t.letters.map((l) => [l, t.dials[l].start]));
function fresh(s) {
  const t = s.tasks[s.ti];
  return { ...s, env: startEnv(t), touched: false, last: null, phase: 'turn', moved: {} };
}

/* ── Lectures ── */
export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const isAdvanced = (s) => s.tasks.some((t) => t.advanced);
export const canTurn = (s) => s.free ? true : !taskDone(s);
const Qenv = (env) => Object.fromEntries(Object.entries(env).map(([k, v]) => [k, R.Q(v)]));

/** Ce que la carte montre pour la tâche courante : les états du calcul (`rows`), la valeur, et pour `claim` les deux membres et le signe. */
export function view(s, t = taskOf(s), env = s.env) {
  const e = Qenv(env);
  if (t.kind === 'claim') {
    const c = R.compare(t.left, t.right, e);
    return { kind: 'claim', left: R.steps(t.left, e), right: R.steps(t.right, e), l: c.l, r: c.r, eq: c.eq, letters: t.letters };
  }
  const rows = R.steps(t.tree, e);
  return { kind: t.kind, rows, value: R.evaluate(t.tree, e), letters: t.letters };
}
/** La tâche courante est-elle faite avec ces valeurs ? (`find` : la valeur demandée ; `set` : les valeurs demandées ; `claim` : le signe ≠.) */
function isSolution(t, env) {
  if (t.kind === 'set' || t.kind === 'find') return t.letters.every((l) => env[l] === t.target[l]);
  return !R.compare(t.left, t.right, Qenv(env)).eq;
}

/* ── Le geste : tourner un cadran, le lâcher ── */
const clampInt = (v, d) => { const n = Math.round(Number.isFinite(v) ? v : d.min); return Math.max(d.min, Math.min(d.max, n)); };

/** Tourne le cadran de la lettre à `v` (arrondi à l'entier, borné) ; ne termine jamais la tâche (voir `release`). */
export function turn(s, letter, v) {
  if (s.free) {
    const d = { min: 0, max: FREE_MAX };
    const cur = s.free.env[letter] ?? 0;
    const to = clampInt(v, d);
    return to === cur ? s : { ...s, free: { ...s.free, env: { ...s.free.env, [letter]: to } } };
  }
  const t = taskOf(s);
  if (!canTurn(s) || !t.dials[letter]) return s;
  const to = clampInt(v, t.dials[letter]);
  if (to === s.env[letter]) return s;
  return { ...s, env: { ...s.env, [letter]: to }, touched: true, moved: { ...s.moved, [letter]: true }, last: null };
}
export const turnBy = (s, letter, delta) => turn(s, letter, (s.free ? s.free.env[letter] ?? 0 : s.env[letter]) + delta);

/** La main lâche le cadran : si les valeurs sont celles que la tâche demande, la tâche est faite. */
export function release(s) {
  if (s.free || taskDone(s)) return s;
  const t = taskOf(s);
  if (!s.touched) return s;
  if (!isSolution(t, s.env)) {
    // un cas où la prétendue règle TIENT : dit sans verdict (« 4 = 4 »)
    return t.kind === 'claim' ? { ...s, last: Object.freeze({ kind: 'holds', env: { ...s.env } }) } : { ...s, last: Object.freeze({ kind: 'rest', env: { ...s.env } }) };
  }
  const v = view(s);
  const trial = Object.freeze({
    kind: 'check', ok: true, id: t.id, task: t.kind, env: Object.freeze({ ...s.env }),
    value: t.kind === 'claim' ? `${R.text(v.l)}|${R.text(v.r)}` : R.text(v.value),
  });
  return { ...s, phase: 'done', trials: [...s.trials, trial], last: Object.freeze({ kind: 'done', env: { ...s.env } }), done: { ...s.done, [s.ti]: true }, solved: { ...s.solved, [s.ti]: trial } };
}

export function nextTask(s) { return canNext(s) ? fresh({ ...s, ti: s.ti + 1 }) : s; }
export function retryTask(s) {
  const strip = (o) => { const c = { ...o }; delete c[s.ti]; return c; };
  return fresh({ ...s, done: strip(s.done), solved: strip(s.solved) });
}

/* ── « جرّب قاعدتك أنت » : une règle tapée par l'élève, ouverte en permanence ── */
const FREE_DEFAULT = Object.freeze({ text: '3n+7', env: Object.freeze({}) });
const FREE_RE = /^[0-9a-z+\-−*×(),.\s٠-٩]*$/;
/** Lit ce que l'élève a tapé : la règle, ses lettres (une ou deux), ou la raison pour laquelle elle est refusée. */
export function freeInfo(s) {
  if (!s.free) return null;
  const raw = s.free.text.trim();
  if (!raw) return { ok: false, reason: 'empty' };
  if (!FREE_RE.test(raw)) return { ok: false, reason: 'chars' };
  let tree;
  try { tree = R.parse(raw); } catch { return { ok: false, reason: 'unreadable' }; }
  const letters = R.lettersOf(tree);
  if (letters.length === 0) return { ok: false, reason: 'noletter' };
  if (letters.length > FREE_LETTERS) return { ok: false, reason: 'toomany' };
  const env = Object.fromEntries(letters.map((l) => [l, s.free.env[l] ?? 0]));
  const e = Qenv(env);
  return { ok: true, tree, letters, env, rows: R.steps(tree, e), value: R.evaluate(tree, e), slots: Object.fromEntries(letters.map((l) => [l, R.slotCount(tree, l)])) };
}
export function setFree(s, text) {
  const cur = s.free ?? { text: FREE_DEFAULT.text, env: {} };
  return { ...s, free: Object.freeze({ ...cur, text: String(text).slice(0, 30) }), last: Object.freeze({ kind: 'custom', free: true }) };
}
export function openFree(s) { return s.free ? s : { ...s, free: Object.freeze({ text: '', env: {} }), last: Object.freeze({ kind: 'custom', free: true }) }; }
export const toGuided = (s) => (s.free ? fresh({ ...s, free: null }) : s);

export const trialEvidence = (tr) => tr;

/* ── Onboarding (LabCoach) : la pastille suit le geste utile MAINTENANT, jamais la réponse ── */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-ld-next]', gesture: 'tap', prefer: 'below' } : null;
  const t = taskOf(s);
  if (!s.touched) return { id: t.kind === 'claim' ? 'claim' : 'dial', target: `[data-ld-dial=${t.letters[0]}]`, gesture: 'drag', prefer: 'above' };
  if (t.kind === 'claim' && s.last?.kind === 'holds') return { id: 'again', target: `[data-ld-dial=${t.letters[0]}]`, gesture: 'drag', prefer: 'above' };
  return null;
}
