import * as LIN from '@smarter-academy/core/arithmetic/linear.js';

const {
  frac, parseNumber, lin, linAdd, linScale, linAt, linLatex, cmp, eq, isInteger, toNumber, fracLatex, fracText,
  solveEquation, solveInequality, sub, add, mul,
} = LIN;

/**
 * growth-race — LA COURSE DE DEUX GRANDEURS (unité 4 « معادلات ومتراجحات », leçon
 * « ترييض مشكلة » ; réutilisée par la synthèse « أدمج تعلّماتي » avec la piscine).
 *
 * Deux grandeurs du premier degré qui CHANGENT avec x : l'âge du père et la somme des
 * âges de ses enfants (« بعد كم سنة… »), ou le prix de deux formules d'abonnement
 * (« ابتداءً من كم حصة… »). La leçon les écrit comme dans le modèle du manuel :
 *
 *   left="36+x"  right="4+x+6+x+8+x"     (طرائق p. 49 : 36 + x = (4 + x) + (6 + x) + (8 + x))
 *   left="30+x"  right="2(6+x)"          (plateforme : « ضعف عمر الابن »)
 *   left="75x"   right="560+5x"          (synthèse : 75 دج la séance / 560 دج l'année + 5 دج la séance)
 *
 * LA STRUCTURE est gardée, pas seulement { a, b } : chaque ÉLÉMENT de l'histoire (une
 * personne, un tarif) est un objet du dessin, et c'est sur lui que l'élève porte le jeton.
 *   « 36+x »       → un élément `age`  (base 36 ; il vieillit : 36 + x)
 *   « 75x »        → un élément `rate` (75 par séance : 75 × x)
 *   « 560 »        → un élément `fixed` (payé une fois, ne dépend pas de x)
 *   « 2(6+x) »     → un GROUPE de facteur 2 qui contient l'élément `age` 6
 * Un nombre suivi d'un « x » nu forme un `age` ; « kx » est un `rate` ; un nombre seul
 * est `fixed`. Le jeton est « + x » quand l'histoire est faite d'âges (op `add`),
 * « × x » quand elle est faite de tarifs (op `mul`) — l'opération vient des expressions,
 * jamais du thème. Un mélange des deux est un défaut de contenu (exception).
 *
 * DEUX LABORATOIRES, ouverts l'un après l'autre PAR L'ÉLÈVE (MANIPULATION_CONTRACT §7quater) :
 *   CONSTRUIRE   porter le jeton sur chaque élément qui change avec x ; « تحقّق » compare
 *                le modèle construit à l'histoire et refuse, élément par élément, avec la
 *                raison dans les mots de l'histoire (`verifyModel`) ;
 *   COURIR       étirer x (entier ≥ 0) : les deux grandeurs suivent ; chaque x validé est
 *                un essai (`commitTrial`) ; elles se rejoignent à la solution de l'équation
 *                et l'une dépasse l'autre au-delà (l'inéquation).
 * Le calcul est EXACT (packages/core/arithmetic/linear.js) : aucune égalité de flottants.
 */

// ── Lecture d'une expression ────────────────────────────────────────────────

const clean = (s) => String(s).replace(/\s+/g, '').replace(/[−–]/g, '-').replace(/[×*]/g, '').replace(/\[/g, '(').replace(/]/g, ')');

/** Découpe une somme au premier niveau de parenthèses : « 2(4+x+7+x)+3 » → ['2(4+x+7+x)', '3']. */
function splitTop(s) {
  const out = []; let depth = 0; let cur = '';
  for (const ch of s) {
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (depth < 0) throw new Error(`growth-race: parenthèses déséquilibrées « ${s} »`);
    if (ch === '+' && depth === 0) { if (cur === '') throw new Error(`growth-race: terme vide dans « ${s} »`); out.push(cur); cur = ''; }
    else if (ch === '-' && depth === 0) throw new Error(`growth-race: une grandeur qui grandit est une SOMME (pas de « - ») : « ${s} »`);
    else cur += ch;
  }
  if (depth !== 0 || cur === '') throw new Error(`growth-race: expression illisible « ${s} »`);
  out.push(cur);
  return out;
}

const NUM = /^\d+(?:[.,]\d+)?$/;

/** Les éléments d'une somme sans parenthèses : un nombre suivi d'un « x » nu vieillit. */
function elementsOf(terms, src) {
  const els = [];
  for (const t of terms) {
    if (t === 'x') {
      const prev = els.at(-1);
      if (prev && prev.kind === 'fixed' && !prev.paired) { prev.kind = 'age'; prev.paired = true; } else els.push({ kind: 'age', c: frac(0), paired: true });
    } else if (/x$/.test(t) && NUM.test(t.slice(0, -1))) {
      els.push({ kind: 'rate', c: parseNumber(t.slice(0, -1)) });
    } else if (NUM.test(t)) {
      els.push({ kind: 'fixed', c: parseNumber(t) });
    } else {
      throw new Error(`growth-race: terme illisible « ${t} » dans « ${src} »`);
    }
  }
  return els.map(({ kind, c }) => ({ kind, c }));
}

/**
 * « 4+x+6+x+8+x » → { groups: [{ k: 1, elements: [age 4, age 6, age 8] }] } ;
 * « 2(6+x) » → { groups: [{ k: 2, elements: [age 6] }] }.
 */
function parseSide(src) {
  const s = clean(src);
  if (!s) throw new Error('growth-race: expression vide');
  const groups = []; let loose = [];
  const flush = () => { if (loose.length) { groups.push({ k: frac(1), elements: elementsOf(loose, src) }); loose = []; } };
  for (const term of splitTop(s)) {
    const m = term.match(/^(\d+(?:[.,]\d+)?)?\((.+)\)$/);
    if (m) {
      flush();
      groups.push({ k: m[1] ? parseNumber(m[1]) : frac(1), elements: elementsOf(splitTop(m[2]), src) });
    } else {
      loose.push(term);
    }
  }
  flush();
  return { groups };
}

/**
 * Le MODÈLE de l'histoire : les deux membres, leurs éléments numérotés (`L0`, `R0`, `R1`…)
 * dans l'ordre d'écriture, et l'opération du jeton.
 */
export function parseModel(left, right) {
  const sides = { left: parseSide(left), right: parseSide(right) };
  const elements = [];
  for (const side of ['left', 'right']) {
    let i = 0;
    sides[side].groups.forEach((g, gi) => g.elements.forEach((el) => {
      elements.push({ id: `${side === 'left' ? 'L' : 'R'}${i}`, side, group: gi, index: i, kind: el.kind, c: el.c });
      i += 1;
    }));
  }
  const kinds = new Set(elements.map((e) => e.kind));
  if (kinds.has('age') && kinds.has('rate')) throw new Error('growth-race: des âges ET des tarifs dans une même course');
  if (!kinds.has('age') && !kinds.has('rate')) throw new Error('growth-race: rien ne dépend de x');
  return { src: { left, right }, sides, elements, op: kinds.has('rate') ? 'mul' : 'add' };
}

/** Les éléments qui DOIVENT porter le jeton dans l'histoire. */
export const grows = (model, el) => el.kind === (model.op === 'mul' ? 'rate' : 'age');

// ── Valeur et écriture d'un membre ─────────────────────────────────────────

/** a·x + b d'un élément, selon qu'il porte le jeton ou non. */
function elementLin(model, el, carried) {
  if (!carried) return lin(0, el.c);
  return model.op === 'add' ? lin(1, el.c) : lin(el.c, 0);
}

/** Le membre `side` construit avec l'ensemble `carried` (ids) — { a, b } exact. */
function sideLin(model, side, carried) {
  const set = new Set(carried);
  let total = lin(0, 0); let i = 0;
  for (const g of model.sides[side].groups) {
    let inner = lin(0, 0);
    for (let j = 0; j < g.elements.length; j += 1) {
      const el = model.elements.find((e) => e.side === side && e.index === i);
      inner = linAdd(inner, elementLin(model, el, set.has(el.id)));
      i += 1;
    }
    total = linAdd(total, linScale(inner, g.k));
  }
  return total;
}

/** L'ensemble juste (l'histoire), et les deux membres de l'histoire. */
export const storyCarried = (model) => model.elements.filter((e) => grows(model, e)).map((e) => e.id);
export const storyLin = (model, side) => sideLin(model, side, storyCarried(model));

const num = (p) => fracLatex(p).replace(/\.\d+/, (d) => d.replace('.', '{,}'));

/** Le terme d'un élément : « 4 », « 4 + x », « 75x », « 560 ». */
export function elementTex(model, el, carried) {
  if (!carried) return num(el.c);
  if (model.op === 'mul') return `${eq(el.c, 1) ? '' : num(el.c)}x`;
  return eq(el.c, 0) ? 'x' : `${num(el.c)} + x`;
}

/**
 * Le membre ÉCRIT comme le manuel, avec sa structure : « 36 + x »,
 * « (4 + x) + (6 + x) + (8 + x) », « 2(6 + x) », « 560 + 5x », « 2[(4 + x) + (7 + x)] ».
 * Un élément « c + x » se met entre parenthèses quand il est l'un de plusieurs termes.
 */
export function sideTex(model, side, carried) {
  const set = new Set(carried);
  const groups = model.sides[side].groups;
  const many = groups.length > 1 || groups[0].elements.length > 1;
  let i = 0;
  const parts = groups.map((g) => {
    const terms = g.elements.map(() => {
      const el = model.elements.find((e) => e.side === side && e.index === i);
      i += 1;
      const t = elementTex(model, el, set.has(el.id));
      const wrap = model.op === 'add' && set.has(el.id) && !eq(el.c, 0) && (many || !eq(g.k, 1));
      return wrap && (g.elements.length > 1 || eq(g.k, 1)) ? `(${t})` : t;
    });
    const inner = terms.join(' + ');
    if (eq(g.k, 1)) return inner;
    const k = num(g.k);
    if (g.elements.length === 1) {
      const only = inner;
      return /[+ ]/.test(only) ? `${k}(${only})` : `${k} \\times ${only}`;
    }
    return `${k}\\left[${inner}\\right]`;
  });
  return parts.join(' + ');
}

/** L'équation du modèle construit (ou de l'histoire) : « 36 + x = (4 + x) + … ». */
export const modelTex = (model, carried) => `${sideTex(model, 'left', carried)} = ${sideTex(model, 'right', carried)}`;

// ── Construire : le laboratoire du modèle ──────────────────────────────────

/**
 * `startWith: 'race'` épingle la course (comme `startWith="lists"` de common-divisors) : le
 * modèle de l'histoire est déjà posé et vérifié — pour une leçon qui a DÉJÀ modélisé.
 */
export function init(left, right, { startWith = 'build' } = {}) {
  const model = parseModel(left, right);
  const lab = { model, carried: [], verdict: null, stage: 'build', trials: [] };
  if (startWith !== 'race') return lab;
  const carried = storyCarried(model);
  return { ...lab, carried, verdict: verifyModel({ model, carried }), stage: 'race' };
}

/** Porter le jeton sur l'élément `id` : `true`, ou la clé de la raison du refus. */
export function canCarry(lab, id) {
  const el = lab.model.elements.find((e) => e.id === id);
  if (!el) return '';
  if (lab.carried.includes(id)) return 'already';
  return true;
}

export function carry(lab, id) {
  if (canCarry(lab, id) !== true) return lab;
  const carried = lab.model.elements.map((e) => e.id).filter((e) => e === id || lab.carried.includes(e));
  return { ...lab, carried, verdict: null };
}

export function remove(lab, id) {
  if (!lab.carried.includes(id)) return lab;
  return { ...lab, carried: lab.carried.filter((e) => e !== id), verdict: null };
}

/**
 * « تحقّق » : le modèle construit dit-il l'histoire ? Chaque écart est un élément et sa
 * raison, dans les mots de l'histoire :
 *   notGrown    (âges) une personne qui n'a pas vieilli — l'erreur MISC-TARRID-MAJHUL-WAHID
 *   fixedGrown  (âges) un nombre fixe qui « vieillit »
 *   rateOnce    (tarifs) un tarif par séance payé une seule fois
 *   fixedTimes  (tarifs) l'abonnement payé à chaque séance — MISC-WADIYA-TARJAMA
 */
export function verifyModel(lab) {
  const { model, carried } = lab;
  const issues = [];
  for (const el of model.elements) {
    const has = carried.includes(el.id);
    const must = grows(model, el);
    if (must && !has) issues.push({ id: el.id, reason: model.op === 'add' ? 'notGrown' : 'rateOnce' });
    if (!must && has) issues.push({ id: el.id, reason: model.op === 'add' ? 'fixedGrown' : 'fixedTimes' });
  }
  return { ok: issues.length === 0, issues };
}

export function check(lab) {
  return { ...lab, verdict: verifyModel(lab) };
}

/** La course ne s'ouvre que sur un modèle VÉRIFIÉ — et c'est l'élève qui l'ouvre. */
export const canRace = (lab) => Boolean(lab.verdict?.ok);
export const openRace = (lab) => (canRace(lab) ? { ...lab, stage: 'race' } : lab);
export const backToBuild = (lab) => ({ ...lab, stage: 'build' });

// ── Courir : le laboratoire de x ───────────────────────────────────────────

const REL = (c) => (c < 0 ? '<' : c > 0 ? '>' : '=');

/** Les deux grandeurs pour x (exactes), et leur ordre. */
export function trialAt(model, x) {
  const X = frac(x);
  const left = linAt(storyLin(model, 'left'), X);
  const right = linAt(storyLin(model, 'right'), X);
  return { x, left, right, rel: REL(cmp(left, right)) };
}

/** La valeur de CHAQUE élément pour x (pour lire « 13 + 15 + 17 » sous les colonnes). */
export function partsAt(model, side, x) {
  const X = frac(x);
  return model.elements.filter((e) => e.side === side).map((el) => {
    const value = linAt(elementLin(model, el, grows(model, el)), X);
    const g = model.sides[side].groups[el.group];
    return { id: el.id, kind: el.kind, base: el.c, value, factor: g.k };
  });
}

/**
 * La LECTURE des deux membres pour x, comme l'التحقق du manuel : « 36 + 9 = 45 »,
 * « 13 + 15 + 17 = 45 », « 2 \\times 24 = 48 », « 560 + 5 \\times 8 = 600 ».
 */
export function readoutTex(model, side, x) {
  const parts = partsAt(model, side, x);
  const groups = model.sides[side].groups;
  const lone = groups.length === 1 && groups[0].elements.length === 1 && eq(groups[0].k, 1);
  let i = 0;
  const expr = groups.map((g) => {
    const terms = g.elements.map(() => {
      const p = parts[i]; i += 1;
      if (p.kind === 'fixed') return num(p.base);
      if (p.kind === 'rate') return eq(p.base, 1) ? String(x) : `${num(p.base)} \\times ${x}`;
      return lone && !eq(p.base, 0) ? `${num(p.base)} + ${x}` : num(p.value);
    });
    const inner = terms.join(' + ');
    if (eq(g.k, 1)) return inner;
    return g.elements.length > 1 ? `${num(g.k)} \\times (${inner})` : `${num(g.k)} \\times ${inner}`;
  }).join(' + ');
  const total = linAt(storyLin(model, side), frac(x));
  return { expr, total, tex: expr === num(total) ? expr : `${expr} = ${num(total)}` };
}

/** Un x validé (relâchement, pause clavier) est un ESSAI ; un x déjà essayé ne compte qu'une fois. */
export function commitTrial(lab, x) {
  if (!Number.isInteger(x) || x < 0) return lab;
  if (lab.trials.some((t) => t.x === x)) return lab;
  return { ...lab, trials: [...lab.trials, trialAt(lab.model, x)] };
}

/**
 * La solution de l'équation left = right, lue dans le DOMAINE de l'histoire (x entier ≥ 0) :
 *   natural   un entier ≥ 0 — les deux grandeurs se rejoignent sur la règle
 *   fraction  positive mais pas entière — elles se croisent ENTRE deux graduations
 *   negative  c'est arrivé dans le passé (âges) — jamais sur la règle
 *   none      elles ne se rejoignent jamais (mêmes pentes, écart constant)
 *   all       elles sont toujours égales
 */
export function solution(model) {
  const s = solveEquation(storyLin(model, 'left'), storyLin(model, 'right'));
  if (s.kind !== 'unique') return { kind: s.kind };
  if (cmp(s.x, 0) < 0) return { kind: 'negative', x: s.x };
  return { kind: isInteger(s.x) ? 'natural' : 'fraction', x: s.x };
}

const GOAL_REL = { less: '<', greater: '>' };

/**
 * La question posée : `equal` (quand left = right ?) ou `less` / `greater` (à partir de
 * quand left < right, left > right ?). Pour une inéquation : le rayon (linear.js) et le
 * PREMIER entier naturel qui la vérifie (« ابتداءً من 9 حصص »), ou null.
 */
export function answer(model, goal = 'equal') {
  const sol = solution(model);
  if (goal === 'equal') return { goal, sol, first: sol.kind === 'natural' ? toNumber(sol.x) : null };
  const rel = GOAL_REL[goal];
  if (!rel) throw new Error(`growth-race: but inconnu « ${goal} »`);
  const L = storyLin(model, 'left'); const R = storyLin(model, 'right');
  const ray = solveInequality(L, rel, R);
  let first = null;
  for (let x = 0; x <= 1000; x += 1) if (LIN.satisfies(L, rel, R, frac(x))) { first = x; break; }
  // Au-delà du premier, tous les suivants la vérifient-ils ? (rayon vers +∞)
  const toInfinity = ray.kind === 'all' || (ray.kind === 'ray' && (ray.rel === '>' || ray.rel === '>='));
  return { goal, sol, rel, ray, first, toInfinity };
}

/** Le bout de la règle : assez loin pour voir la rencontre ET le dépassement. */
function defaultMax(model) {
  const sol = solution(model);
  if (sol.kind === 'natural' || sol.kind === 'fraction') {
    const s = Math.ceil(toNumber(sol.x));
    return Math.max(6, s + Math.max(4, Math.ceil(s / 3)));
  }
  return 12;
}

/**
 * La règle de x : de 0 (aujourd'hui, aucune séance) à `maxX` (prop de la leçon) ou au bout
 * par défaut. Une règle trop courte n'a jamais le droit de CACHER la rencontre : elle est
 * prolongée jusqu'à deux crans au-delà.
 */
export function xRange(model, maxX) {
  const sol = solution(model);
  let max = Math.max(2, Math.floor(maxX ?? defaultMax(model)));
  if (sol.kind === 'natural' || sol.kind === 'fraction') max = Math.max(max, Math.ceil(toNumber(sol.x)) + 2);
  return { min: 0, max };
}

/**
 * La DÉCOUVERTE s'ouvre sur un CONTRASTE fait par l'élève :
 *   natural  la rencontre elle-même, un essai AVANT et un essai APRÈS (si la rencontre est
 *            en 0, deux essais après) ;
 *   fraction les deux graduations qui l'encadrent (l'ordre s'inverse sans égalité) ;
 *   sinon    trois essais dont x = 0 (le présent) : l'ordre ne change jamais sur la règle.
 * Une solution entière AU-DELÀ de la règle compte comme « jamais sur la règle ».
 */
export function discoveryReady(lab, range) {
  const sol = solution(lab.model);
  const xs = lab.trials.map((t) => t.x);
  const inRange = (v) => v >= range.min && v <= range.max;
  if (sol.kind === 'natural' && inRange(toNumber(sol.x))) {
    const s = toNumber(sol.x);
    if (!xs.includes(s)) return false;
    if (s === range.min) return xs.filter((x) => x > s).length >= 2;
    return xs.some((x) => x < s) && xs.some((x) => x > s);
  }
  if (sol.kind === 'fraction' && Math.ceil(toNumber(sol.x)) <= range.max) {
    const lo = Math.floor(toNumber(sol.x));
    return xs.includes(lo) && xs.includes(lo + 1);
  }
  return xs.length >= 3 && xs.includes(0);
}

/** Le cas de découverte (choisit la conjecture et la règle formelle). */
export function discoveryKind(model, range) {
  const sol = solution(model);
  if (sol.kind === 'natural') return toNumber(sol.x) <= range.max ? 'meet' : 'beyond';
  if (sol.kind === 'fraction') return Math.ceil(toNumber(sol.x)) <= range.max ? 'between' : 'beyond';
  return sol.kind; // negative · none · all
}

/** Qui mène avant / après la rencontre (pour les phrases de la découverte). */
export function leaders(model) {
  const L = storyLin(model, 'left'); const R = storyLin(model, 'right');
  const at0 = REL(cmp(linAt(L, frac(0)), linAt(R, frac(0))));
  const slope = REL(cmp(L.a, R.a)); // celui qui a la plus grande pente finit devant
  return { before: at0, after: slope };
}

/**
 * La RÉSOLUTION écrite comme le manuel (طرائق p. 49) : la forme réduite
 * « 36 + x = 3x + 18 », puis « 2x = 18 », puis « x = 9 » — le coefficient de x
 * gardé POSITIF (on regroupe x du côté où il y en a le plus).
 */
/**
 * Un membre RÉDUIT, écrit comme le manuel : « 36 + x » reste tel quel (rien à réduire),
 * « (4 + x) + (6 + x) + (8 + x) » devient « 3x + 18 ».
 */
export function reducedTex(model, side) {
  const t = sideTex(model, side, storyCarried(model));
  const xs = (t.match(/x/g) ?? []).length;
  return !/[([]|\\left|\\times/.test(t) && xs <= 1 ? t : linLatex(storyLin(model, side));
}

export function solvingLines(model) {
  const L = storyLin(model, 'left'); const R = storyLin(model, 'right');
  const lines = [`${reducedTex(model, 'left')} = ${reducedTex(model, 'right')}`];
  const s = solveEquation(L, R);
  if (s.kind !== 'unique') {
    const d = sub(L.b, R.b);
    lines.push(`${num(L.b)} ${s.kind === 'all' ? '=' : '\\neq'} ${num(R.b)}`);
    return { lines, kind: s.kind, d };
  }
  const rightHeavy = cmp(R.a, L.a) > 0;
  const a = rightHeavy ? sub(R.a, L.a) : sub(L.a, R.a);
  const b = rightHeavy ? sub(L.b, R.b) : sub(R.b, L.b);
  const ax = eq(a, 1) ? 'x' : `${num(a)}x`;
  if (!eq(a, 1)) lines.push(`${ax} = ${num(b)}`);
  lines.push(`x = ${fracLatex(s.x)}`);
  return { lines, kind: 'unique', x: s.x };
}

/** La même chose pour une inéquation (left REL right) : « 70x > 560 », « x > 8 ». */
export function inequalityLines(model, rel) {
  const L = storyLin(model, 'left'); const R = storyLin(model, 'right');
  const T = { '<': '<', '<=': '\\leq', '>': '>', '>=': '\\geq' };
  const lines = [`${reducedTex(model, 'left')} ${T[rel]} ${reducedTex(model, 'right')}`];
  const ray = solveInequality(L, rel, R);
  if (ray.kind !== 'ray') return { lines, ray };
  const a = sub(L.a, R.a); const b = sub(R.b, L.b);
  if (!eq(a, 1) && !eq(a, -1)) lines.push(`${num(a)}x ${T[rel]} ${num(b)}`);
  lines.push(`x ${T[ray.rel]} ${fracLatex(ray.bound)}`);
  return { lines, ray };
}

/** « 45 », « 7,5 » — un nombre exact pour une étiquette (virgule décimale). */
export function valueText(p) {
  const d = LIN.fracDecimal(p);
  return d ?? fracText(p);
}

export { add, mul, toNumber };

/**
 * Le x PAR DÉFAUT de la course (jamais un essai, jamais écrit dans `lab.trials`) :
 * le plus petit x de la règle où les deux grandeurs ne sont PAS égales et où la
 * question posée n'est pas déjà vraie (equal : pas de rencontre ; less / greater :
 * l'ordre demandé n'est pas encore atteint). Sinon le plus petit x non égal, sinon le début.
 */
export function defaultX(model, range, goal = 'equal') {
  const wanted = GOAL_REL[goal] ?? '=';
  let loose = null;
  for (let x = range.min; x <= range.max; x += 1) {
    const { rel } = trialAt(model, x);
    if (rel === '=') continue;
    if (loose == null) loose = x;
    if (rel !== wanted) return x;
  }
  return loose ?? range.min;
}
