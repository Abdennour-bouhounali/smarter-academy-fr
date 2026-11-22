import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';

const {
  eqn, classify, leftAt, isolate, substitute, eliminationFactors, scale, addEqs, eqLatex, pairLatex,
  system: parseSystem,
} = LS;
const {
  parseNumber, eq, isZero, isInteger, cmp, neg, fracLatex, fracText, fracDecimal, toNumber,
} = LIN;

/**
 * story-modeller — LA LOGIQUE PURE du laboratoire « ترييض مشكلة بجملة معادلتين » (unité 5, leçon
 * « حل مشكلات بتوظيف جمل معادلتين » ; réutilisé par la synthèse « أدمج تعلّماتي »).
 *
 * Les CINQ ÉTAPES du tableau du manuel (نشاط 3 p. 57) sont les étapes du laboratoire :
 *
 *   name     1) اختيار المجاهيل     porter les lettres sur les NOMS de l'histoire ; une donnée connue
 *                                   (140 زائرا) refuse la lettre (MISC-JUMLA-MAJAHIL)
 *   model    2) ترجمة المشكلة       porter les nombres de l'histoire dans les cases □x + □y = □, une
 *                                   équation par information ; « تحقّق » rejoue chaque information avec
 *                                   l'équation de l'élève et refuse dans les mots de l'histoire
 *                                   (un prix compté comme une personne : MISC-JUMLA-TARJAMA)
 *   solve    3) حل الجملة           choisir التعويض ou الجمع ; les lignes sont CALCULÉES par
 *                                   linearSystem et révélées une à une ; s'arrêter à une inconnue
 *                                   est refusé (MISC-JUMLA-NISF-HALL)
 *   verify   4) تحقق                porter les deux valeurs sur les éléments de l'histoire (les
 *                                   tourniquets, les étiquettes de prix) et REJOUER l'histoire : chaque
 *                                   information est recomptée ; un nombre de personnes non entier ou
 *                                   négatif est signalé (MISC-JUMLA-TAHAQQUQ-NAS)
 *   answer   5) الإجابة             choisir la phrase qui répond à la question
 *
 * Tout calcul passe par packages/core/arithmetic/linearSystem.js (fractions exactes) : aucune
 * égalité de flottants, aucune arithmétique propre. Ce module ne contient AUCUN texte arabe — les
 * raisons sont des clés (`lesson.json › manipulation.storyModeller.*`).
 *
 * VOCABULAIRE
 *   inconnue (unknown)  ce que l'histoire demande : { id: 'x', noun: 'عدد البالغين' } ; l'id est
 *                       aussi la variable du `system` de la leçon (x, y — ou a, b)
 *   lettre (letter)     ce que l'élève PORTE : les mêmes ids ; `naming[unknownId] = lettre`. Il
 *                       peut nommer à l'envers (x = عدد الصغار) : tout se relit dans SES lettres.
 *   case (slot)         'a' multiplie la PREMIÈRE lettre, 'b' la seconde, 'c' est le second membre
 *   jeton (chip)        un nombre de l'histoire, réutilisable : `c0`, `c1`… et le jeton « 1 »
 *                       (`one` : « chacun compte une fois ») — le coefficient 1 de « x + y » se
 *                       PORTE, il n'est jamais deviné d'une case vide
 */

export const STAGES = Object.freeze(['name', 'model', 'solve', 'verify', 'answer']);
export const SLOTS = Object.freeze(['a', 'b', 'c']);
export const ONE = 'one';

const num = (v) => (typeof v === 'object' && v !== null ? v : parseNumber(String(v).replace(/[\s  ]/g, '')));

/* ── Le modèle de l'histoire ──────────────────────────────────────────────────────────────── */

/**
 * Lit les props du contrat en un modèle :
 *   { ids, target: [e1, e2] (variables = ids), facts, chips: [{ key, value }], sol, hasCount }
 * Lève une erreur de CONTENU si un nombre du modèle n'est porté par aucun jeton (la leçon
 * demanderait à l'élève un nombre qu'il ne peut pas prendre) ou si la jumla n'a pas une solution.
 */
export function parseModel({ system, unknowns, facts, chips }) {
  const ids = (unknowns ?? []).map((u) => u.id);
  if (ids.length !== 2 || ids[0] === ids[1]) throw new Error('story-modeller: deux inconnues distinctes');
  const parts = String(system).split('|');
  if (parts.length !== 2) throw new Error(`story-modeller: « éq1|éq2 » attendu, reçu « ${system} »`);
  const target = parseSystem(parts[0], parts[1], ids);
  if ((facts ?? []).length !== 2) throw new Error('story-modeller: une information (fact) par équation');
  const list = [...(chips ?? []).map((c, i) => ({ key: `c${i}`, value: num(c.value) })), { key: ONE, value: num(1) }];
  target.forEach((e, i) => SLOTS.forEach((s) => {
    if (!list.some((c) => eq(c.value, e[s]))) throw new Error(`story-modeller: aucun jeton ne porte ${fracText(e[s])} (équation ${i + 1}, case ${s})`);
  }));
  const sol = classify(target);
  if (sol.kind !== 'unique') throw new Error('story-modeller: la jumla doit avoir une solution unique');
  return Object.freeze({
    ids, target, facts: facts.map((f) => ({ kind: f.kind ?? 'other' })), chips: list, sol,
    hasCount: facts.some((f) => f.kind === 'count'),
  });
}

const chipValue = (model, key) => model.chips.find((c) => c.key === key)?.value ?? null;

/** La jumla CIBLE relue dans les lettres de l'élève (il a pu nommer à l'envers). */
export function targetInLetters(model, naming) {
  const [u0] = model.ids;
  const swapped = naming[u0] !== u0;
  return model.target.map((e) => (swapped ? eqn(e.b, e.a, e.c) : e));
}

/** Les cases d'une jumla correcte : le premier jeton qui porte chaque nombre (« 1 » en dernier). */
export function targetSlots(model, naming) {
  const T = targetInLetters(model, naming ?? defaultNaming(model));
  const pick = (v) => (model.chips.find((c) => c.key !== ONE && eq(c.value, v)) ?? model.chips.find((c) => eq(c.value, v))).key;
  return { 1: { a: pick(T[0].a), b: pick(T[0].b), c: pick(T[0].c) }, 2: { a: pick(T[1].a), b: pick(T[1].b), c: pick(T[1].c) } };
}

export const defaultNaming = (model) => ({ [model.ids[0]]: model.ids[0], [model.ids[1]]: model.ids[1] });

/* ── L'état du laboratoire ─────────────────────────────────────────────────────────────────── */

const emptySlots = () => ({ 1: { a: null, b: null, c: null }, 2: { a: null, b: null, c: null } });

export function init(model, { named = false, startWith = 'model' } = {}) {
  const solveFirst = startWith === 'solve';
  const naming = named || solveFirst ? defaultNaming(model) : { [model.ids[0]]: null, [model.ids[1]]: null };
  return {
    stage: solveFirst ? 'solve' : named ? 'model' : 'name',
    named: named || solveFirst,
    naming,
    slots: solveFirst ? targetSlots(model, naming) : emptySlots(),
    verdict: solveFirst ? { ok: true, rows: [{ ok: true }, { ok: true }] } : null,
    checks: 0,
    refusals: 0,
    method: null,
    revealed: 0,
    half: null,
    gates: { [model.ids[0]]: null, [model.ids[1]]: null },
    replay: null,
    replays: [],
    answer: null,
    answerTries: [],
  };
}

/* ── 1) اختيار المجاهيل ─────────────────────────────────────────────────────────────────────── */

/**
 * Porter la lettre `letter` sur une zone de nom : `noun:<unknownId>` (une inconnue de l'histoire)
 * ou `known:<chipKey>` (une donnée de l'énoncé). true | clé de refus | '' (geste sans objet).
 */
export function canName(lab, letter, zone) {
  if (lab.stage !== 'name') return '';
  if (zone.startsWith('known:')) return 'known';
  const id = zone.startsWith('noun:') ? zone.slice(5) : null;
  if (id == null || !(id in lab.naming)) return '';
  if (lab.naming[id] === letter) return '';
  if (lab.naming[id] != null) return 'taken';
  return true;
}

export function name(lab, letter, unknownId) {
  const naming = { ...lab.naming };
  for (const k of Object.keys(naming)) if (naming[k] === letter) naming[k] = null;
  naming[unknownId] = letter;
  return { ...lab, naming };
}

export function unname(lab, unknownId) {
  if (lab.stage !== 'name') return lab;
  return { ...lab, naming: { ...lab.naming, [unknownId]: null } };
}

export const namingDone = (lab) => Object.values(lab.naming).every((v) => v != null);

export function openModel(lab) {
  if (!namingDone(lab)) return lab;
  return { ...lab, stage: 'model' };
}

/* ── 2) ترجمة المشكلة ───────────────────────────────────────────────────────────────────────── */

export const slotId = (row, slot) => `slot:${row}:${slot}`;
function parseSlot(zone) {
  const m = /^slot:([12]):([abc])$/.exec(zone ?? '');
  return m ? { row: Number(m[1]), slot: m[2] } : null;
}

export function canFill(lab, chipKey, zone) {
  if (lab.stage !== 'model') return '';
  const s = parseSlot(zone);
  if (!s || !chipKey) return '';
  if (lab.slots[s.row][s.slot] === chipKey) return '';
  return true;
}

export function fill(lab, chipKey, zone) {
  const s = parseSlot(zone);
  if (!s || lab.stage !== 'model') return lab;
  return { ...lab, slots: { ...lab.slots, [s.row]: { ...lab.slots[s.row], [s.slot]: chipKey } }, verdict: null };
}

export const rowComplete = (lab, row) => SLOTS.every((s) => lab.slots[row][s] != null);

/** L'équation que l'élève a construite (dans SES lettres), ou null si une case est vide. */
export function studentEq(lab, model, row) {
  if (!rowComplete(lab, row)) return null;
  const v = (s) => chipValue(model, lab.slots[row][s]);
  return eqn(v('a'), v('b'), v('c'));
}

const equivalent = (e1, e2) => classify([e1, e2]).kind === 'infinite';

/** Les places (dans les lettres de l'élève) où la jumla cible porte la valeur `v`. */
function rolesOf(T, v) {
  const out = [];
  T.forEach((e, i) => SLOTS.forEach((s) => { if (eq(e[s], v)) out.push({ row: i + 1, slot: s }); }));
  return out;
}

/**
 * Rejouer UNE information avec l'équation de l'élève. { ok } ou { ok: false, reason, slot, chip,
 * otherRow? } ; la raison est dite dans les mots de l'histoire par la vue :
 *   incomplete    une case vide
 *   swapped       les deux prix (les deux coefficients) échangés : 150 tickets d'adultes…
 *   oneInMoney    le jeton « 1 » dans une information d'ARGENT : chacun n'y compte pas une fois
 *   moneyInCount  un prix dans l'information qui COMPTE des personnes (MISC-JUMLA-TARJAMA)
 *   countInMoney  le nombre de personnes dans l'information d'argent
 *   otherFact     un nombre de l'AUTRE information (deux informations du même genre)
 *   totalAsCoef   le total de l'information posé comme ce que vaut CHACUN
 *   coefAsTotal   ce que vaut chacun posé comme total
 *   mismatch      aucune des raisons précédentes (nombres équivalents mal placés…)
 */
export function checkRow(lab, model, row) {
  if (!rowComplete(lab, row)) return { ok: false, reason: 'incomplete' };
  const T = targetInLetters(model, lab.naming);
  const S = studentEq(lab, model, row);
  const t = T[row - 1];
  if (equivalent(S, t)) return { ok: true };
  if (eq(S.a, t.b) && eq(S.b, t.a) && eq(S.c, t.c) && !eq(S.a, S.b)) return { ok: false, reason: 'swapped', slot: 'a', chip: lab.slots[row].a };
  const kind = model.facts[row - 1].kind;
  const otherKind = model.facts[2 - row].kind;
  for (const s of SLOTS) {
    const chip = lab.slots[row][s];
    const v = S[s];
    if (eq(v, t[s])) continue;
    if (chip === ONE && kind === 'money') return { ok: false, reason: 'oneInMoney', slot: s, chip };
    const roles = rolesOf(T, v);
    const here = roles.filter((r) => r.row === row);
    const there = roles.filter((r) => r.row !== row);
    if (here.length) {
      if (s !== 'c' && here.some((r) => r.slot === 'c')) return { ok: false, reason: 'totalAsCoef', slot: s, chip };
      if (s === 'c') return { ok: false, reason: 'coefAsTotal', slot: s, chip };
      return { ok: false, reason: 'swapped', slot: s, chip };
    }
    if (there.length) {
      if (kind === 'count' && otherKind !== 'count') return { ok: false, reason: 'moneyInCount', slot: s, chip, otherRow: 3 - row };
      if (kind === 'money' && otherKind === 'count') return { ok: false, reason: 'countInMoney', slot: s, chip, otherRow: 3 - row };
      return { ok: false, reason: 'otherFact', slot: s, chip, otherRow: 3 - row };
    }
    return { ok: false, reason: 'mismatch', slot: s, chip };
  }
  return { ok: false, reason: 'mismatch' };
}

/** « تحقّق » : les deux informations rejouées ; le verdict garde la raison de chaque ligne. */
export function checkModel(lab, model) {
  if (lab.stage !== 'model') return lab;
  const rows = [checkRow(lab, model, 1), checkRow(lab, model, 2)];
  const ok = rows.every((r) => r.ok);
  return { ...lab, verdict: { ok, rows }, checks: lab.checks + 1, refusals: lab.refusals + (ok ? 0 : 1) };
}

/** La jumla de l'élève (lettres) quand elle est vérifiée. */
export function studentSystem(lab, model) {
  return [studentEq(lab, model, 1), studentEq(lab, model, 2)];
}

/** « x+y=140|300x+150y=30300 » dans les lettres de l'élève (pour `onModel`). */
export function systemText(sys, ids) {
  return sys.map((e) => eqLatex(e, ids).replace(/\s+/g, '').replace(/\\dfrac\{(\d+)\}\{(\d+)\}/g, '$1/$2')).join('|');
}

export function openSolve(lab) {
  if (lab.stage !== 'model' || !lab.verdict?.ok) return lab;
  return { ...lab, stage: 'solve', method: null, revealed: 0, half: null };
}

/* ── 3) حل الجملة ───────────────────────────────────────────────────────────────────────────── */

const isOne = (p) => eq(p, 1);
const isMinusOne = (p) => eq(p, -1);
const wrap = (p) => (cmp(p, 0) < 0 ? `(${fracLatex(p)})` : fracLatex(p));

/** « 140 - x », « 7 - 2x », « 3x + 1 », « -\dfrac{1}{2}x » : k·u + m à la façon du manuel. */
function affTex(k, m, u) {
  const body = (c) => (isOne(c) ? u : `${fracLatex(c)}${u}`);
  if (isZero(k)) return fracLatex(m);
  const absK = cmp(k, 0) < 0 ? neg(k) : k;
  if (isZero(m)) return cmp(k, 0) < 0 ? `-${body(absK)}` : body(absK);
  return `${fracLatex(m)} ${cmp(k, 0) < 0 ? '-' : '+'} ${body(absK)}`;
}

/** k·u + m évalué en u = val, écrit (« 140 - 62 », « 7 - 2 \times 3 »). */
function affAtTex(k, m, val) {
  const absK = cmp(k, 0) < 0 ? neg(k) : k;
  const term = isOne(absK) ? wrap(val) : `${fracLatex(absK)} \\times ${wrap(val)}`;
  if (isZero(k)) return fracLatex(m);
  if (isZero(m)) return cmp(k, 0) < 0 ? `-${term}` : term;
  return `${fracLatex(m)} ${cmp(k, 0) < 0 ? '-' : '+'} ${term}`;
}

/** Un terme c·(contenu) dans une somme : premier ou non, signe porté par c. */
function termTex(c, content, first, paren) {
  if (isZero(c)) return '';
  const negative = cmp(c, 0) < 0;
  const abs = negative ? neg(c) : c;
  let body;
  if (paren) body = isOne(abs) ? `(${content})` : `${fracLatex(abs)}(${content})`;
  else body = isOne(abs) ? content : `${fracLatex(abs)}${content}`;
  if (first) return negative ? `-${body}` : body;
  return negative ? ` - ${body}` : ` + ${body}`;
}
function termValueTex(c, value, first) {
  if (isZero(c)) return '';
  const negative = cmp(c, 0) < 0;
  const abs = negative ? neg(c) : c;
  const body = isOne(abs) ? wrap(value) : `${fracLatex(abs)} \\times ${wrap(value)}`;
  if (first) return negative ? `-${body}` : body;
  return negative ? ` - ${body}` : ` + ${body}`;
}

/** L'équation e où la lettre `w` est remplacée par une EXPRESSION (entre parenthèses) ou une VALEUR. */
function replacedTex(e, ids, w, { expr, value }) {
  const coefs = [e.a, e.b];
  let out = '';
  ids.forEach((id, i) => {
    const first = out === '';
    if (id === w) out += expr != null ? termTex(coefs[i], expr, first, true) : termValueTex(coefs[i], value, first);
    else out += termTex(coefs[i], id, first, false);
  });
  return `${out || '0'} = ${fracLatex(e.c)}`;
}

/** Le choix de l'inconnue à isoler pour التعويض : un coefficient ±1 d'abord, sinon un isolement entier. */
function substitutionChoice(sys, ids) {
  const cands = [];
  sys.forEach((e, i) => ids.forEach((w, j) => {
    const own = j === 0 ? e.a : e.b;
    if (isZero(own)) return;
    const iso = isolate(e, j === 0 ? 'x' : 'y');
    const score = (isOne(own) || isMinusOne(own) ? 0 : 10) + (isInteger(iso.k) && isInteger(iso.m) ? 0 : 5) + (isOne(own) ? 0 : 1) + (j === 1 ? 0 : 0.5) + i * 0.25;
    cands.push({ i, j, w, iso, score });
  }));
  cands.sort((p, q) => p.score - q.score);
  return cands[0];
}

/** L'inconnue à éliminer pour الجمع : les multiplicateurs les plus petits ; y à égalité (le manuel). */
function eliminationChoice(sys, ids) {
  const opts = ['x', 'y'].map((which, j) => {
    const f = eliminationFactors(sys[0], sys[1], which);
    return f ? { j, which, w: ids[j], f, size: Math.max(Math.abs(f[0]), Math.abs(f[1])) - (j === 1 ? 0.5 : 0) } : null;
  }).filter(Boolean);
  opts.sort((p, q) => p.size - q.size);
  return opts[0];
}

/**
 * Les LIGNES de la résolution, calculées par linearSystem (jamais par la vue) :
 *   [{ key, vars, tex }] — `key` est le libellé arabe (`lines.<key>`), `vars` ses valeurs, `tex`
 *   la ligne mathématique. `halfAt` = l'indice de la ligne qui donne la PREMIÈRE inconnue (après
 *   elle, la vue demande « هل انتهى الحل؟ »). `values` = { lettre: fraction }.
 */
export function solvePlan(sys, ids, method) {
  const sol = classify(sys);
  if (sol.kind !== 'unique') throw new Error('story-modeller: jumla sans solution unique');
  const values = { [ids[0]]: sol.x, [ids[1]]: sol.y };
  const lines = [];
  let first; let second;
  if (method === 'sub') {
    const { i, j, w, iso } = substitutionChoice(sys, ids);
    const u = ids[1 - j];
    const other = sys[1 - i];
    lines.push({ key: 'isolate', vars: { n: i + 1, letter: w }, tex: `${w} = ${affTex(iso.k, iso.m, u)}` });
    lines.push({ key: 'substitute', vars: { n: 2 - i, letter: w }, tex: replacedTex(other, ids, w, { expr: affTex(iso.k, iso.m, u) }) });
    const red = substitute(other, j === 0 ? 'x' : 'y', iso);
    lines.push({ key: 'reduce', vars: {}, tex: `${termTex(red.a, u, true, false) || '0'} = ${fracLatex(red.c)}` });
    const uVal = values[u];
    lines.push({ key: 'solveOne', vars: { letter: u }, tex: `${u} = ${fracLatex(uVal)}` });
    lines.push({ key: 'backIso', vars: { letter: w, other: u }, tex: `${w} = ${affAtTex(iso.k, iso.m, uVal)} = ${fracLatex(values[w])}` });
    first = { letter: u, value: uVal }; second = { letter: w, value: values[w] };
  } else if (method === 'add') {
    const { j, which, w, f } = eliminationChoice(sys, ids);
    const u = ids[1 - j];
    const [k1, k2] = f;
    const E1 = scale(sys[0], k1); const E2 = scale(sys[1], k2);
    if (k1 !== 1) lines.push({ key: 'scale', vars: { n: 1, k: k1 }, tex: eqLatex(E1, ids) });
    if (k2 !== 1) lines.push({ key: 'scale', vars: { n: 2, k: k2 }, tex: eqLatex(E2, ids) });
    const S = addEqs(E1, E2);
    lines.push({ key: 'addEq', vars: { letter: w }, tex: eqLatex(S, ids) });
    const uVal = values[u];
    lines.push({ key: 'solveOne', vars: { letter: u }, tex: `${u} = ${fracLatex(uVal)}` });
    // on revient dans l'équation (1) si elle contient w, sinon dans (2)
    const back = isZero(which === 'x' ? sys[0].a : sys[0].b) ? 1 : 0;
    const e = sys[back];
    lines.push({ key: 'back', vars: { n: back + 1, letter: u, other: w }, tex: `${replacedTex(e, ids, u, { value: uVal })} \\;\\Rightarrow\\; ${w} = ${fracLatex(values[w])}` });
    first = { letter: u, value: uVal }; second = { letter: w, value: values[w] };
  } else {
    throw new Error(`story-modeller: méthode inconnue « ${method} »`);
  }
  lines.push({ key: 'pair', vars: {}, tex: pairLatex(values[ids[0]], values[ids[1]]) });
  return { lines, halfAt: lines.findIndex((l) => l.key === 'solveOne'), first, second, values };
}

export function chooseMethod(lab, method) {
  if (lab.stage !== 'solve' || (method !== 'sub' && method !== 'add')) return lab;
  if (lab.method === method) return lab;
  return { ...lab, method, revealed: 1, half: null };
}

/**
 * « السطر التالي ». Après la ligne qui donne la première inconnue, la suite est bloquée tant que
 * l'élève n'a pas dit que le travail n'est pas fini (`half` = 'more').
 */
export function canReveal(lab, plan) {
  if (lab.stage !== 'solve' || !lab.method) return false;
  if (lab.revealed >= plan.lines.length) return false;
  if (lab.revealed === plan.halfAt + 1 && lab.half !== 'more') return false;
  return true;
}
export function reveal(lab, plan) {
  return canReveal(lab, plan) ? { ...lab, revealed: lab.revealed + 1 } : lab;
}
/** « هل انتهى الحل؟ » — 'done' est refusé (la solution est une ثنائية), 'more' ouvre la suite. */
export function claimHalf(lab, choice) {
  if (lab.stage !== 'solve' || lab.half === 'more') return lab;
  if (choice === 'more') return { ...lab, half: 'more' };
  if (choice === 'done') return { ...lab, half: 'refused', halfRefusals: (lab.halfRefusals ?? 0) + 1 };
  return lab;
}
export const solved = (lab, plan) => lab.stage !== 'name' && lab.method != null && lab.revealed >= plan.lines.length;

export function openVerify(lab, plan) {
  if (!solved(lab, plan)) return lab;
  return { ...lab, stage: 'verify', gates: Object.fromEntries(Object.keys(lab.gates).map((k) => [k, null])), replay: null };
}

/* ── 4) تحقق — rejouer l'histoire ───────────────────────────────────────────────────────────── */

export const gateId = (unknownId) => `gate:${unknownId}`;

export function canGate(lab, letter, zone) {
  if (lab.stage !== 'verify' || !zone?.startsWith('gate:')) return '';
  const id = zone.slice(5);
  if (!(id in lab.gates)) return '';
  if (lab.gates[id] === letter) return '';
  return true;
}

export function gate(lab, letter, zone) {
  if (canGate(lab, letter, zone) !== true) return lab;
  const id = zone.slice(5);
  const gates = { ...lab.gates };
  for (const k of Object.keys(gates)) if (gates[k] === letter) gates[k] = null;
  gates[id] = letter;
  return { ...lab, gates, replay: null };
}

export function ungate(lab, unknownId) {
  if (lab.stage !== 'verify') return lab;
  return { ...lab, gates: { ...lab.gates, [unknownId]: null }, replay: null };
}

export const gatesDone = (lab) => Object.values(lab.gates).every((v) => v != null);

/**
 * REJOUER l'histoire : chaque inconnue reçoit la valeur de la lettre posée sur elle ; chaque
 * information est recomptée avec les nombres de l'HISTOIRE (la jumla cible, pas celle de l'élève).
 *   { ok, facts: [{ ok, lhs, c }], natural: { ok, bad: [unknownId] }, values: { unknownId: frac } }
 * `natural` : dès qu'une information COMPTE des personnes, chaque inconnue est un entier ≥ 0.
 */
export function replayStory(model, gates, letterValues) {
  const [u0, u1] = model.ids;
  const values = { [u0]: letterValues[gates[u0]], [u1]: letterValues[gates[u1]] };
  const facts = model.target.map((e) => {
    const lhs = leftAt(e, values[u0], values[u1]);
    return { ok: eq(lhs, e.c), lhs, c: e.c };
  });
  const bad = model.hasCount ? model.ids.filter((id) => !isInteger(values[id]) || cmp(values[id], 0) < 0) : [];
  const natural = { ok: bad.length === 0, bad };
  return { ok: facts.every((f) => f.ok) && natural.ok, facts, natural, values };
}

export function replay(lab, model, letterValues) {
  if (lab.stage !== 'verify' || !gatesDone(lab)) return lab;
  const r = replayStory(model, lab.gates, letterValues);
  return { ...lab, replay: r, replays: [...lab.replays, { gates: { ...lab.gates }, ok: r.ok }] };
}

/** Une information rejouée : « 300 \times 62 + 150 \times 78 = 30300 » (nombres de l'histoire). */
export function replayTex(model, values) {
  const [u0, u1] = model.ids;
  return model.target.map((e) => {
    const left = `${termValueTex(e.a, values[u0], true)}${termValueTex(e.b, values[u1], isZero(e.a))}` || '0';
    return `${left} = ${fracLatex(leftAt(e, values[u0], values[u1]))}`;
  });
}

export function openAnswer(lab) {
  if (lab.stage !== 'verify' || !lab.replay?.ok) return lab;
  return { ...lab, stage: 'answer' };
}

/* ── 5) الإجابة ─────────────────────────────────────────────────────────────────────────────── */

export function chooseAnswer(lab, index, correct) {
  if (lab.stage !== 'answer') return lab;
  return { ...lab, answer: index, answerTries: [...lab.answerTries, index], answered: lab.answered || index === correct };
}

export const discoveryReady = (lab) => lab.stage === 'answer' && lab.answered === true;

/* ── Revenir en arrière (le geste de l'élève, jamais un seuil) ──────────────────────────────── */

export function backTo(lab, stage) {
  const order = STAGES.indexOf(stage);
  if (order < 0 || order >= STAGES.indexOf(lab.stage)) return lab;
  if (stage === 'name' && lab.named) return lab;
  const next = { ...lab, stage, answer: null, answered: false, replay: null, gates: Object.fromEntries(Object.keys(lab.gates).map((k) => [k, null])) };
  if (order <= STAGES.indexOf('solve')) { next.method = stage === 'solve' ? lab.method : null; next.revealed = stage === 'solve' ? lab.revealed : 0; }
  if (order <= STAGES.indexOf('model')) { next.verdict = null; next.method = null; next.revealed = 0; next.half = null; }
  return next;
}

/**
 * « أعِد التجربة » d'une étape (LabCheckpoint) : la MÊME étape repart de son départ — sans quitter l'étape ni toucher aux précédentes.
 * name : les lettres sont reprises ; model : les cases et le verdict ; solve : la méthode et les lignes ; verify : les portes et le rejeu ;
 * answer : la réponse choisie.
 */
export function retryStage(lab, model) {
  switch (lab.stage) {
    case 'name': return { ...lab, naming: { [model.ids[0]]: null, [model.ids[1]]: null } };
    case 'model': return { ...lab, slots: emptySlots(), verdict: null };
    case 'solve': return { ...lab, method: null, revealed: 0, half: null };
    case 'verify': return { ...lab, gates: Object.fromEntries(Object.keys(lab.gates).map((k) => [k, null])), replay: null };
    case 'answer': return { ...lab, answer: null, answered: false };
    default: return lab;
  }
}

/* ── Écritures (aucun calcul) ───────────────────────────────────────────────────────────────── */

/** « 30300 », « 2,8 », « 7/3 » : un nombre lisible (virgule décimale, aucun groupement — bidi). */
export function numberText(p) {
  const v = num(p);
  if (!isInteger(v)) return fracDecimal(v);
  // jamais groupé : « 30 300 » au milieu d'une phrase arabe se lit « 300 … 30 » (bidi) — le manuel
  // écrit d'ailleurs « 30300DA » dans son tableau.
  return String(v.n);
}

export const systemLatex = LS.systemLatex;
export { fracLatex, fracText, toNumber, eqLatex };

/**
 * Les histoires INTÉGRÉES (les deux niveaux de `levels.js` et la fête de la synthèse) : la jumla de
 * chaque thème. Leurs mots sont dans lesson.json › manipulation.storyModeller.themes.<id>.
 */
export const THEME_SYSTEMS = Object.freeze({
  stadium: 'x+y=20|300x+150y=4800',
  museum: 'x+y=140|300x+150y=30300',
  party: '150x+150y=11250|24x+30y=2100',
});
