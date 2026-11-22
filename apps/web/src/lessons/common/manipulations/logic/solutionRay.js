import * as Lin from '@smarter-academy/core/arithmetic/linear.js';

const {
  linear, frac, linAt, compareWith, solveInequality, applyBoth, relationLatex, flipRelation,
  fracLatex, fracDecimal, eq, cmp, isZero, isStrict, toNumber, satisfies,
} = Lin;

/**
 * solution-ray — LE RAYON DES SOLUTIONS (unité 4 « معادلات ومتراجحات », leçon 3).
 *
 * Une inéquation du premier degré L REL R est une متباينة qui est vraie POUR CERTAINS x.
 * L'élève promène un MOBILE sur une droite graduée : chaque position validée laisse une
 * trace — rouge si l'inégalité est vraie (la couleur des solutions dans le manuel),
 * grise sinon. La région des solutions est donc peinte par SES essais.
 *
 *   1. traces    x = k / den (den = dénominateur de la borne : la borne est toujours une
 *                graduation) ; `whole` limite aux entiers ≥ 0 (un nombre de messages).
 *   2. crochet   l'élève pose la borne, choisit le côté coloré et l'orientation du
 *                crochet (vers / loin de la partie colorée). `checkBracket` refuse avec
 *                un TÉMOIN : un x dont l'appartenance au rayon posé contredit la vérité —
 *                pris d'abord parmi ses propres traces, puis à la borne, puis entre les deux.
 *   3. transformation (متقدم) : l'élève choisit une opération sur les deux membres
 *                (`cardsFor`) PUIS le sens de la ligne obtenue. Le sens qui contredit ses
 *                traces est refusé, témoin à l'appui — c'est ainsi que la division par
 *                −3 sans inverser le sens est refusée : « tes points rouges sont à droite ».
 *
 * Toute l'arithmétique est exacte (packages/core/arithmetic/linear.js) ; aucune vue ne
 * recalcule une règle.
 */

// ── Écriture ────────────────────────────────────────────────────────────────

/** Un nombre comme le manuel l'écrit : 2{,}5 quand l'écriture décimale est courte, sinon \dfrac. */
export function numTex(p) {
  const d = fracDecimal(p, 2);
  return d != null ? d.replace(',', '{,}') : fracLatex(p);
}
/** Le même nombre pour une lecture d'écran / une étiquette SVG (« 2,5 », « 7/2 », « -5 »). */
export function numText(p) {
  const d = fracDecimal(p, 2);
  if (d != null) return d;
  return `${p.n}/${p.d}`;
}

/** a·x + b à la façon du manuel : « 2{,}5x + 100 », « -3x + 5 », « 20 ». */
export function exprTex(P) {
  const parts = [];
  if (!isZero(P.a)) {
    const c = eq(P.a, 1) ? '' : eq(P.a, -1) ? '-' : numTex(P.a);
    parts.push(`${c}x`);
  }
  if (!isZero(P.b) || parts.length === 0) {
    const t = numTex(P.b);
    parts.push(parts.length === 0 ? t : P.b.n < 0 ? `- ${t.replace(/^-/, '')}` : `+ ${t}`);
  }
  return parts.join(' ');
}

export const relTex = (rel) => relationLatex(rel);

/** La même inéquation en texte simple (titres, aria) : « −3x + 5 ≤ 20 », « 2,5x + 100 ≤ 150 ». */
const REL_PLAIN = { '<': '<', '<=': '≤', '>': '>', '>=': '≥' };
function exprPlain(P) {
  return exprTex(P).replace(/\\dfrac\{(\d+)\}\{(\d+)\}/g, '$1/$2').replace(/\{,\}/g, ',').replace(/-/g, '−');
}
export const ineqPlain = (I) => `${exprPlain(I.L)} ${REL_PLAIN[I.rel]} ${exprPlain(I.R)}`;
export const ineqTex = (I) => `${exprTex(I.L)} ${relTex(I.rel)} ${exprTex(I.R)}`;

/** « -3 \times (-4) + 5 » : la substitution, parenthèses pour un x négatif. */
export function substitutionTex(P, x) {
  const xs = x.n < 0 ? `(${numTex(x)})` : numTex(x);
  const parts = [];
  if (!isZero(P.a)) {
    if (eq(P.a, 1)) parts.push(xs);
    else if (eq(P.a, -1)) parts.push(`-${xs}`);
    else parts.push(`${numTex(P.a)} \\times ${xs}`);
  }
  if (!isZero(P.b) || parts.length === 0) {
    const t = numTex(P.b);
    parts.push(parts.length === 0 ? t : P.b.n < 0 ? `- ${t.replace(/^-/, '')}` : `+ ${t}`);
  }
  return parts.join(' ');
}

/** Un membre calculé pour x : « -3 \times (-4) + 5 = 17 » ; null pour un membre constant. */
export function sideTex(P, x) {
  if (isZero(P.a)) return null;
  return `${substitutionTex(P, x)} = ${numTex(linAt(P, x))}`;
}

// ── L'inéquation ─────────────────────────────────────────────────────────────

const REL_RE = /(<=|>=|≤|≥|<|>)/;
const REL_OF = { '<=': '<=', '≤': '<=', '>=': '>=', '≥': '>=', '<': '<', '>': '>' };

/** « -3x+5<=20 », « 2,5x+100≤150 », « x<3 » → { L, rel, R }. */
export function parseIneq(src) {
  const s = String(src).replace(/\s+/g, '');
  const parts = s.split(REL_RE);
  if (parts.length !== 3) throw new Error(`solution-ray: inéquation illisible « ${src} »`);
  return Object.freeze({ L: linear(parts[0]), rel: REL_OF[parts[1]], R: linear(parts[2]) });
}

/** Les solutions : { rel, bound, flipped } (rayon), jamais `all` / `none` dans ce laboratoire. */
export function rayOf(I) {
  const s = solveInequality(I.L, I.rel, I.R);
  if (s.kind !== 'ray') throw new Error('solution-ray: une inéquation sans borne n’a pas de rayon');
  return s;
}
/** Le côté coloré d'un rayon et si la borne est solution. */
export const sideOf = (ray) => (ray.rel === '<' || ray.rel === '<=' ? 'left' : 'right');
export const closedOf = (ray) => !isStrict(ray.rel);
/** Le crochet du manuel : « ] » ouvre vers la gauche, « [ » vers la droite. */
export const glyphOf = (side, toward) => ((side === 'left') === toward ? ']' : '[');

// ── Le laboratoire ───────────────────────────────────────────────────────────

/**
 * @param ineq   « -3x+5<=20 »
 * @param whole  x entier naturel (un nombre de messages) : graduations 0, 1, 2…
 * @param min/max bornes de la droite (entiers) ; par défaut la borne ± 6
 */
export function initLab({ ineq, whole = false, min, max }) {
  const I = parseIneq(ineq);
  const sol = rayOf(I);
  const den = whole ? 1 : sol.bound.d;
  if (den > 12) throw new Error('solution-ray: borne trop fine pour une droite graduée');
  if (whole && sol.bound.d !== 1) throw new Error('solution-ray: borne non entière pour un nombre entier');
  const b = toNumber(sol.bound);
  const lo = min ?? (whole ? 0 : Math.floor(b) - 6);
  const hi = max ?? (whole ? Math.ceil(b) + 10 : Math.ceil(b) + 6);
  return {
    ineq: I, sol, den, whole,
    kmin: lo * den, kmax: hi * den,
    traces: [],
    bracket: null,
    chain: [I],
    steps: [],
    refusals: [],
  };
}

export const xOfK = (lab, k) => frac(k, lab.den);
/** La graduation de la borne. */
export const boundK = (lab) => (lab.sol.bound.n * lab.den) / lab.sol.bound.d;

/** Les deux membres et le verdict pour la graduation k. */
export function evaluate(lab, k, I = lab.ineq) {
  return { ...evaluateX(lab, xOfK(lab, k), I), k };
}
/** Les deux membres et le verdict pour un nombre x quelconque (k = null hors graduation). */
export function evaluateX(lab, x, I = lab.ineq) {
  const left = linAt(I.L, x);
  const right = linAt(I.R, x);
  return { k: null, x, left, right, ok: compareWith(left, I.rel, right) };
}

export const inRange = (lab, k) => Number.isInteger(k) && k >= lab.kmin && k <= lab.kmax;

/** Valider une position : une trace (rouge si vraie, grise sinon), une seule par graduation. */
export function addTrace(lab, k) {
  if (!inRange(lab, k)) return lab;
  const e = evaluate(lab, k);
  const traces = [...lab.traces.filter((t) => t.k !== k), { k, ok: e.ok }].sort((a, b) => a.k - b.k);
  return { ...lab, traces };
}

export const hasContrast = (lab) => lab.traces.some((t) => t.ok) && lab.traces.some((t) => !t.ok);

// ── Le crochet ───────────────────────────────────────────────────────────────

/** x appartient-il au rayon posé par l'élève ({ k, side, toward }) ? */
function inPlaced(lab, placed, k) {
  const c = k - placed.k;
  if (c === 0) return placed.toward;
  return placed.side === 'left' ? c < 0 : c > 0;
}

/** Un x où le rayon posé et la vérité divergent — traces d'abord, puis la borne, puis la droite. */
function witnessFor(lab, member, candidates) {
  for (const k of candidates) {
    if (!inRange(lab, k)) continue;
    const e = evaluate(lab, k);
    if (member(k) !== e.ok) return { ...e, inStudent: member(k), fromTrace: lab.traces.some((t) => t.k === k) };
  }
  return null;
}

function between(a, b) {
  const out = [];
  const [lo, hi] = a < b ? [a, b] : [b, a];
  for (let k = lo; k <= hi; k += 1) out.push(k);
  // du plus proche de l'élève vers la borne
  return a < b ? out : out.reverse();
}

/**
 * Le rayon posé par l'élève est-il celui des solutions ? true, ou
 * { reason: 'needContrast' | 'position' | 'side' | 'glyph', witness }.
 */
export function checkBracket(lab, placed) {
  if (!hasContrast(lab)) return { reason: 'needContrast', witness: null };
  const member = (k) => inPlaced(lab, placed, k);
  const bk = boundK(lab);
  const truthSide = sideOf(lab.sol);
  const closed = closedOf(lab.sol);
  if (placed.k === bk && placed.side === truthSide && placed.toward === closed) return true;
  const traceKs = lab.traces.map((t) => t.k).sort((a, b) => Math.abs(a - placed.k) - Math.abs(b - placed.k));
  let reason;
  let candidates;
  if (placed.k !== bk) { reason = 'position'; candidates = [...traceKs, ...between(placed.k, bk)]; }
  else if (placed.side !== truthSide) { reason = 'side'; candidates = [...traceKs, bk - 1, bk + 1, bk]; }
  else { reason = 'glyph'; candidates = [bk]; }
  const all = [];
  for (let k = lab.kmin; k <= lab.kmax; k += 1) all.push(k);
  let witness = witnessFor(lab, member, [...candidates, ...all]);
  if (!witness && reason === 'position') {
    // Sur les graduations, x ≤ 2 et x < 3 coïncident : le témoin est ENTRE les deux (2,5).
    const x = frac(placed.k + bk, 2 * lab.den);
    const e = evaluateX(lab, x);
    const c = cmp(x, xOfK(lab, placed.k));
    witness = { ...e, inStudent: placed.side === 'left' ? c < 0 : c > 0, fromTrace: false };
  }
  return { reason, witness };
}

/** Poser le crochet : seulement s'il est juste (sinon l'état ne change pas). */
export function placeBracket(lab, placed) {
  return checkBracket(lab, placed) === true ? { ...lab, bracket: { ...placed } } : lab;
}

// ── La transformation (متقدم) ────────────────────────────────────────────────

export const current = (lab) => lab.chain.at(-1);
/** x REL c : l'inéquation est résolue. */
export const isSolved = (I) => eq(I.L.a, 1) && isZero(I.L.b) && isZero(I.R.a);
export const transformDone = (lab) => isSolved(current(lab));

/**
 * Les cartes de l'étape suivante, dans l'ordre du manuel : les x à gauche, puis les
 * nombres à droite, puis la division par le coefficient — offerte avec son opposé
 * (÷3 et ÷(−3)) : les deux chemins sont justes, seul le SENS diffère.
 */
export function cardsFor(I, divide) {
  if (isSolved(I)) return [];
  if (!isZero(I.R.a)) return [{ op: I.R.a.n > 0 ? 'subX' : 'addX', k: I.R.a.n > 0 ? I.R.a : frac(-I.R.a.n, I.R.a.d) }];
  if (!isZero(I.L.b)) return [{ op: I.L.b.n > 0 ? 'sub' : 'add', k: I.L.b.n > 0 ? I.L.b : frac(-I.L.b.n, I.L.b.d) }];
  if (isZero(I.L.a)) return [];
  if (eq(I.L.a, -1)) return [{ op: 'mul', k: frac(-1) }];
  // lecteur (verdict L3.4) : `divide: 'coef'` — SEULE la division par le coefficient lui-même (÷2 pour 2x, ÷(−2) pour −2x) ; la page offre toujours les deux
  if (divide === 'coef') return [{ op: 'div', k: I.L.a }];
  const a = I.L.a;
  const pos = a.n > 0 ? a : frac(-a.n, a.d);
  return [{ op: 'div', k: pos }, { op: 'div', k: frac(-pos.n, pos.d) }];
}

/** L'opération en LaTeX, comme dans les bulles du manuel : « -5 », « +x », « \div (-3) ». */
export function cardTex(card) {
  const k = card.k;
  const kt = numTex(k);
  const paren = k.n < 0 ? `(${kt})` : kt;
  const coefX = eq(k, 1) ? 'x' : `${kt}x`;
  return {
    add: `+ ${kt}`, sub: `- ${kt}`, addX: `+ ${coefX}`, subX: `- ${coefX}`,
    mul: `\\times ${paren}`, div: `\\div ${paren}`,
  }[card.op];
}
export const isNegativeScaling = (card) => (card.op === 'mul' || card.op === 'div') && card.k.n < 0;

/** Les deux lignes possibles après une carte : sens gardé / sens inversé, et le juste. */
export function candidates(lab, card) {
  const I = current(lab);
  const r = applyBoth(I.L, I.R, card.op, card.k, I.rel);
  if (r.refused) return { refused: r.refused };
  return {
    kept: Object.freeze({ L: r.left, rel: I.rel, R: r.right }),
    flipped: Object.freeze({ L: r.left, rel: flipRelation(I.rel), R: r.right }),
    rel: r.rel,
    flips: r.flipped,
  };
}

/**
 * L'élève choisit la ligne suivante (`rel`). Juste : elle s'ajoute à la chaîne. Fausse :
 * refusée avec un TÉMOIN pris dans ses traces — un point rouge que la ligne proposée
 * exclut, ou un point gris qu'elle inclurait.
 */
export function chooseStep(lab, card, rel) {
  const c = candidates(lab, card);
  if (c.refused) return { lab, accepted: false, reason: c.refused };
  const next = rel === c.kept.rel ? c.kept : c.flipped;
  if (rel === c.rel) {
    return {
      lab: { ...lab, chain: [...lab.chain, next], steps: [...lab.steps, { op: card.op, k: card.k, flipped: c.flips }] },
      accepted: true,
    };
  }
  const sat = (k) => satisfies(next.L, next.rel, next.R, xOfK(lab, k));
  const order = [...lab.traces].sort((a, b) => Number(b.ok) - Number(a.ok)).map((t) => t.k);
  const all = [];
  for (let k = lab.kmin; k <= lab.kmax; k += 1) all.push(k);
  const witness = witnessFor(lab, sat, [...order, ...all]);
  return {
    lab: { ...lab, refusals: [...lab.refusals, { op: card.op, k: card.k, rel, keptSign: rel === c.kept.rel }] },
    accepted: false,
    reason: c.flips ? 'mustFlip' : 'mustKeep',
    proposed: next,
    witness,
  };
}

// ── Découvertes ──────────────────────────────────────────────────────────────

/** Sans crochet (module 1) : trois essais au moins, une trace rouge et une grise. */
export const regionDiscoveryReady = (lab) => lab.traces.length >= 3 && hasContrast(lab);

/** Le crochet : posé juste ET la borne elle-même essayée (on sait si elle est solution). */
export const bracketDiscoveryReady = (lab) => !!lab.bracket && hasContrast(lab) && lab.traces.some((t) => t.k === boundK(lab));

/**
 * Le sens : chaîne menée jusqu'à x REL c, avec le contraste — une étape qui garde le
 * sens (un nombre ajouté / retranché, ou un positif) ET une multiplication / division
 * par un négatif qui l'inverse.
 */
export const flipDiscoveryReady = (lab) => !!lab.bracket && transformDone(lab)
  && lab.steps.some((s) => (s.op === 'mul' || s.op === 'div') && s.k.n < 0)
  && lab.steps.some((s) => !((s.op === 'mul' || s.op === 'div') && s.k.n < 0));

/** Une trace rouge où les deux membres diffèrent (le « < » strict) — pour réfuter « égaux ». */
export function strictRedTrace(lab) {
  const t = lab.traces.find((u) => u.ok && !eq(evaluate(lab, u.k).left, evaluate(lab, u.k).right));
  if (t) return evaluate(lab, t.k);
  for (let k = lab.kmin; k <= lab.kmax; k += 1) {
    const e = evaluate(lab, k);
    if (e.ok && !eq(e.left, e.right)) return e;
  }
  return null;
}
export const greyTrace = (lab) => { const t = lab.traces.find((u) => !u.ok); return t ? evaluate(lab, t.k) : null; };

/**
 * La graduation PAR DÉFAUT du mobile à l'ouverture (jamais une trace) : celle, hors
 * solution (inégalité FAUSSE), la plus proche du milieu de la droite — et jamais la borne
 * elle-même, que la découverte demande de tester. Si toute la droite est solution :
 * le début de la droite.
 */
export function defaultK(lab) {
  const mid = (lab.kmin + lab.kmax) / 2;
  const b = boundK(lab);
  let best = null;
  for (let k = lab.kmin; k <= lab.kmax; k += 1) {
    if (k === b || evaluate(lab, k).ok) continue;
    if (best == null || Math.abs(k - mid) < Math.abs(best - mid)) best = k;
  }
  return best ?? lab.kmin;
}
