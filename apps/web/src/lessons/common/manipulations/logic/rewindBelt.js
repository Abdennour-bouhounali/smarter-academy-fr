/**
 * La LOGIQUE du labo `rewind-belt` (« الحزام المعاكس », 1AM unité 6 « الحساب الحرفي », درس « البحث عن أعداد ناقصة », 2026-10-30) — pure, sans React.
 * L'arithmétique est rationnelle exacte (`packages/core/arithmetic/missingNumber.js`, importé PAR CHEMIN) : décimaux et fractions, jamais de flottant.
 *
 * Une TÂCHE : `{ id, kind, a, out, rack }` — une machine d'atelier a une CARTE (`kind` : add « + a », sub « − a », rsub « a − », mul « × a », div « ÷ a ») ; elle a reçu un nombre
 * d'objets et a rendu `out`. La main FAIT TOURNER LE TAPIS À REBOURS : elle choisit une carte dans la rangée `rack` (la carte inverse n'est jamais désignée), puis TIRE la caisse
 * de `out` à travers la machine à rebours jusqu'au bac d'entrée (le nombre manquant □ apparaît), puis la REPOUSSE en avant à travers la machine d'origine : ce qui sort est
 * comparé à `out` (contre-épreuve par substitution). La caisse tirée avec une mauvaise carte ne se corrige jamais : la contre-épreuve DIT CE QUI SORT (« 72 au lieu de 54 »).
 *
 * Phases : `rewind` (carte à choisir, caisse de la sortie vers l'entrée) → `check` (caisse en entrée, à repousser) → `done` (ça tient) ou `miss` (ce qui sort n'est pas `out` : « جرّب بطاقة أخرى »).
 * Modèles d'erreur (missingNumber › judgePick) : `same`, `family`, `trap` (« a − □ » prise pour « □ − a »), `neg` (le tapis se bloque), `other`.
 */
import * as M from '@smarter-academy/core/arithmetic/missingNumber.js';

export const FREE_KINDS = Object.freeze(['add', 'sub', 'rsub', 'mul']);
const bad = (m) => { throw new Error(`rewind-belt : ${m}`); };

export function normalizeTasks(list) {
  return (list ?? []).map((t) => {
    if (!t || typeof t.id !== 'string') bad('tâche sans id');
    if (!M.KINDS.includes(t.kind)) bad(`carte inconnue : ${t.kind}`);
    const card = M.card(t.kind, t.a);
    const out = M.parse(t.out);
    if (!out || M.isNeg(out)) bad(`sortie illisible : ${t.out}`);
    const secret = M.missing(card, out);
    if (M.isNeg(secret)) bad(`le nombre manquant de ${t.id} serait négatif`);
    const rack = [...(t.rack ?? ['add', 'sub', 'mul', 'div'])];
    if (rack.length < 3 || rack.length > 5 || new Set(rack).size !== rack.length) bad(`rangée de cartes invalide : ${rack}`);
    if (!rack.every((k) => M.KINDS.includes(k))) bad(`carte inconnue dans la rangée de ${t.id}`);
    const right = rack.filter((k) => M.judgePick(card, k, out).ok);
    if (right.length !== 1) bad(`${t.id} : ${right.length} cartes justes dans la rangée (une seule attendue)`);
    return Object.freeze({
      id: t.id, kind: t.kind, a: card.a, out, card, secret, rack: Object.freeze(rack), rightKind: right[0],
      decimal: M.isTerminating(secret) && !M.isInt(secret), fraction: !M.isTerminating(secret), advanced: /^a\d/.test(t.id),
    });
  });
}

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'b1', kind: 'add', a: '9', out: '54', rack: ['add', 'sub', 'mul', 'div'] },
    { id: 'b2', kind: 'sub', a: '14', out: '54', rack: ['add', 'sub', 'mul', 'div'] },
    { id: 'b3', kind: 'mul', a: '6', out: '54', rack: ['add', 'sub', 'mul', 'div'] },
    { id: 'b4', kind: 'rsub', a: '80', out: '54', rack: ['add', 'sub', 'rsub'] },
  ] },
  advanced: { tasks: [
    { id: 'a1', kind: 'add', a: '17,5', out: '46,2', rack: ['add', 'sub', 'mul', 'div'] },
    { id: 'a2', kind: 'rsub', a: '12,5', out: '4,8', rack: ['add', 'sub', 'rsub'] },
    { id: 'a3', kind: 'mul', a: '7', out: '20', rack: ['add', 'sub', 'mul', 'div'] },
  ] },
});

export function init(numbers = {}) {
  const tasks = normalizeTasks(numbers.tasks ?? PRESETS.beginner.tasks);
  if (!tasks.length) bad('aucune tâche');
  return fresh({ tasks, ti: 0, done: {}, solved: {}, trials: [], free: null, tries: 0 });
}
function fresh(s) {
  return { ...s, phase: 'rewind', pick: null, pos: 0, found: null, fwd: null, moved: false, last: null, refusal: null };
}

/* ── Lectures ── */
export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const isAdvanced = (s) => s.tasks.some((t) => t.advanced);
/** On ne change de carte qu'au bord du tapis : phase `rewind`, caisse encore sur le plateau de sortie. */
export const canPick = (s) => !s.free && s.phase === 'rewind' && s.pos === 0;
/** Ce que la machine inverse rendrait si on tirait la caisse jusqu'au bout avec la carte choisie (`null` : pas de carte, ou un négatif : le tapis se bloque). */
function peekFound(s) {
  if (!s.pick) return null;
  const t = taskOf(s);
  const j = M.judgePick(t.card, s.pick, t.out);
  return j.model === 'neg' || j.model === 'other' && !j.found ? null : j.found;
}
/** Le nombre écrit sur la caisse à la position courante (rationnel, ou `null` : « ؟ »). */
export function crateValue(s) {
  const t = taskOf(s);
  if (s.phase === 'done') return t.out;
  if (s.phase === 'miss') return s.fwd;
  if (s.phase === 'check') return s.pos > 0.5 ? s.found : M.run(t.card, s.found);
  return s.pos < 0.5 ? t.out : peekFound(s);
}
/** Le nombre posé dans le bac d'entrée (□ rempli) : après le tirage à rebours. */
export const binValue = (s) => (s.phase === 'rewind' ? null : s.found);

/* ── Le geste : choisir la carte, tirer la caisse ── */
export function pickCard(s, kind) {
  if (!canPick(s)) return s;
  if (!taskOf(s).rack.includes(kind)) return s;
  return { ...s, pick: s.pick === kind ? null : kind, refusal: null, last: null };
}

/** La position bornée à [0, 1] et AIMANTÉE aux deux bouts (la main ne tombe jamais à 0,9999 du bac). */
const clamp01 = (p) => { const c = Math.max(0, Math.min(1, p)); return c >= 0.97 ? 1 : c <= 0.03 ? 0 : c; };

/** Tire ou repousse la caisse à la position `p` (0 : plateau de sortie ; 1 : bac d'entrée). */
export function setPos(s, p) {
  if (s.free || taskDone(s) || s.phase === 'miss') return s;
  const t = taskOf(s);
  const to = clamp01(Number.isFinite(p) ? p : 0);
  if (s.phase === 'rewind') {
    if (!s.pick) return to > 0 ? { ...s, refusal: 'pick' } : s;
    if (to < 1) return to === s.pos ? s : { ...s, pos: to, moved: true, refusal: null, last: s.last?.kind === 'docked' ? null : s.last };
    // la caisse arrive au bac d'entrée avec la carte choisie
    const j = M.judgePick(t.card, s.pick, t.out);
    if (j.model === 'neg') {
      const trial = Object.freeze({ kind: 'rewind', ok: false, model: 'neg', id: t.id, pick: s.pick, found: j.found ? M.text(j.found) : null });
      return { ...s, pos: 0.56, moved: true, trials: [...s.trials, trial], last: trial, refusal: null };
    }
    if (!j.found) return { ...s, pos: 0.56, moved: true, refusal: 'jam' };
    const trial = Object.freeze({ kind: 'rewind', ok: j.ok, model: j.model, id: t.id, pick: s.pick, found: M.text(j.found) });
    return { ...s, phase: 'check', pos: 1, found: j.found, moved: true, trials: [...s.trials, trial], last: Object.freeze({ kind: 'docked', found: j.found }), refusal: null };
  }
  // phase `check` : on repousse la caisse vers le plateau de sortie à travers la machine d'origine
  if (to > 0) return to === s.pos ? s : { ...s, pos: to, refusal: null };
  const fwd = M.run(t.card, s.found);
  const ok = M.eq(fwd, t.out);
  const j = M.judgePick(t.card, s.pick, t.out);
  const trial = Object.freeze({ kind: 'check', ok, model: ok ? 'right' : j.model, id: t.id, pick: s.pick, found: M.text(s.found), fwd: M.text(fwd) });
  const trials = [...s.trials, trial];
  if (ok) return { ...s, phase: 'done', pos: 0, fwd, trials, last: trial, done: { ...s.done, [s.ti]: true }, solved: { ...s.solved, [s.ti]: trial } };
  return { ...s, phase: 'miss', pos: 0, fwd, trials, last: trial };
}
export const posBy = (s, delta) => setPos(s, s.pos + delta);
/** « أكمل » : mène la caisse au bout de la phase courante (même geste, au clavier ou au doigt). */
export const finishRun = (s) => (s.phase === 'rewind' ? setPos(s, 1) : s.phase === 'check' ? setPos(s, 0) : s);
/** « جرّب بطاقة أخرى » : après une contre-épreuve ratée, la caisse revient au plateau de sortie et la rangée se rouvre. */
export function retryPick(s) {
  if (s.phase !== 'miss') return s;
  return { ...s, phase: 'rewind', pick: null, pos: 0, found: null, fwd: null, last: null, refusal: null, tries: s.tries + 1 };
}

export function nextTask(s) { return canNext(s) ? fresh({ ...s, ti: s.ti + 1 }) : s; }
export function retryTask(s) {
  const strip = (o) => { const c = { ...o }; delete c[s.ti]; return c; };
  return fresh({ ...s, done: strip(s.done), solved: strip(s.solved) });
}

/* ── « جرّب أعدادك » : une machine de l'élève (carte + nombre a + sortie b), ouverte en permanence ── */
const FREE_DEFAULT = Object.freeze({ kind: 'add', a: '9', b: '54' });
export function setFree(s, patch) {
  const cur = s.free ?? FREE_DEFAULT;
  const next = { ...cur, ...patch };
  return { ...s, free: Object.freeze(next), last: Object.freeze({ kind: 'custom', free: true }) };
}
export const toGuided = (s) => (s.free ? fresh({ ...s, free: null }) : s);
/** Ce que le labo dit d'une machine libre : le nombre manquant, la contre-épreuve, ou pourquoi il n'y en a pas. */
export function freeInfo(s) {
  if (!s.free) return null;
  const a = M.parse(s.free.a);
  const b = M.parse(s.free.b);
  if (!a || !b) return { ok: false, reason: 'unreadable' };
  if (M.isNeg(a) || M.isNeg(b)) return { ok: false, reason: 'negative' };
  if (s.free.kind === 'mul' && a.n === 0) return { ok: false, reason: 'zeroFactor' };
  const card = M.card(s.free.kind, a);
  const x = M.missing(card, b);
  if (M.isNeg(x)) return { ok: false, reason: 'impossible' };
  return { ok: true, card, x, out: b, back: M.inverseKind(s.free.kind), check: M.run(card, x), fraction: !M.isTerminating(x) };
}

export const trialEvidence = (tr) => tr;

/* ── Onboarding (LabCoach) : la pastille suit le geste utile MAINTENANT, jamais la réponse ── */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-rb-next]', gesture: 'tap', prefer: 'below' } : null;
  if (s.phase === 'miss') return { id: 'again', target: '[data-rb-retry]', gesture: 'tap', prefer: 'below' };
  if (s.phase === 'check') return { id: 'check', target: '[data-rb-crate]', gesture: 'drag', prefer: 'above' };
  if (!s.pick) return { id: 'card', target: '[data-rb-rack]', gesture: 'tap', prefer: 'below' };
  return { id: 'rewind', target: '[data-rb-crate]', gesture: 'drag', prefer: 'above' };
}
