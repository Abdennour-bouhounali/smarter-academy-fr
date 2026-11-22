import * as A from '@smarter-academy/core/arithmetic/affine.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';

/**
 * affine-meter — LE COMPTEUR À PARTIE FIXE (unité 7 « الدالة التآلفية », leçon 1
 * « مفهوم وتعيين دالة تآلفية »).
 *
 * Une règle s'écrit comme le manuel (`affine.affine`) : « 40x+100 » (une course en taxi-application :
 * 100 DA de prise en charge + 40 DA le km), « 185x+35000 » (la paie du نشاط 1 : 35000 DA de base +
 * 185 DA par heure supplémentaire). Le compteur montre UN bloc b (posé une fois) et x blocs de a.
 *
 * Trois étapes, enchaînées par l'élève (`mode` = « image », ou « image|antecedent|classify ») :
 *   image       la main tient x ; le compteur se construit bloc par bloc : f(x) = a·x + b.
 *               Terminée quand les essais (validés) portent le CONTRASTE : x = 0 (le compteur affiche
 *               déjà b) ou un couple x, 2x (f(2x) ≠ 2·f(x)) — et, si la leçon pose des `marks`
 *               (les colonnes du tableau du manuel), toutes les marques visitées.
 *   antecedent  un total m est affiché ; l'élève déplace x jusqu'à ce que le compteur l'atteigne.
 *               Le programme inverse est « اطرح b ثم اقسم على a » : (m − b) ÷ a — jamais m ÷ a − b.
 *   classify    l'élève tient les boutons a et b : b → 0 rend la fonction خطية (le compteur part de
 *               0), a → 0 la rend ثابتة (le compteur ne bouge plus avec x). Terminée quand les deux
 *               cas ont été VALIDÉS.
 * Tout le calcul vient de packages/core/arithmetic/affine.js ; ce module ne fait que l'INTERACTION.
 */

const MODES = Object.freeze(['image', 'antecedent', 'classify']);
const with_ = (s, patch) => Object.freeze({ ...s, ...patch });
const F = (v) => (typeof v === 'object' && v !== null ? v : Number.isInteger(v) ? Lin.frac(v) : Lin.parseNumber(v));

/** « image|antecedent|classify » → ['image', 'antecedent', 'classify'] (ordre du manuel imposé). */
function parseModes(mode = 'image') {
  const list = String(mode).split('|').map((m) => m.trim()).filter(Boolean);
  if (!list.length || list.some((m) => !MODES.includes(m))) throw new Error(`affine-meter: mode illisible « ${mode} »`);
  return Object.freeze(MODES.filter((m) => list.includes(m)));
}

/** Un nombre écrit comme le manuel : 36850, 2,5, 1/3 (jamais d'espace de milliers). */
export const numText = (p) => Lin.fracDecimal(F(p)) ?? Lin.fracText(F(p));
export const numTex = (p) => {
  const d = Lin.fracDecimal(F(p));
  return d != null ? d.replace(',', '{,}') : Lin.fracLatex(F(p));
};

/**
 * La grille d'un bouton (a ou b) : un pas « rond » qui divise la valeur du manuel (elle reste
 * atteignable exactement) et qui ne fait pas plus du quart d'elle ; de 0 au double.
 */
export function knobGrid(v) {
  const n = Lin.toNumber(F(v));
  if (!(n > 0) || !Number.isInteger(n)) throw new Error(`affine-meter: bouton non entier « ${v} »`);
  const steps = [5000, 1000, 500, 100, 50, 10, 5, 1];
  const step = steps.find((p) => n % p === 0 && p <= n / 4) ?? 1;
  return Object.freeze({ step, max: Math.round((2 * n) / step) });
}

/** Le bloc presque carré de n tuiles (MANIPULATION_CONTRACT §8bis) ; `aspect` = largeur / hauteur. */
export function tileGrid(n, aspect = 1) {
  if (n <= 0) return Object.freeze({ cols: 0, rows: 0 });
  const cols = Math.max(1, Math.min(n, Math.round(Math.sqrt(n * aspect))));
  const c = Math.ceil(n / Math.ceil(n / cols));
  return Object.freeze({ cols: c, rows: Math.ceil(n / c) });
}

/**
 * L'état initial. `target` : le total m de l'étape antecedent (un x ENTIER de la réglette, sinon la
 * leçon est fautive : erreur au rendu). `marks` : « 5|8|10|12|15 ». `xMax` : la fin de la réglette.
 */
export function init({ rule = '40x+100', mode = 'image', target, marks, xMax } = {}) {
  const f = A.affine(rule);
  if (Lin.cmp(f.a, 0) <= 0 || Lin.cmp(f.b, 0) <= 0) throw new Error(`affine-meter: un compteur a ≠ 0 et une partie fixe b > 0 (« ${rule} »)`);
  const modes = parseModes(mode);
  const markList = marks ? String(marks).split('|').map((m) => Number(m)).filter((m) => Number.isInteger(m) && m >= 0) : [];
  let tgt = null; let targetX = null;
  if (modes.includes('antecedent')) {
    if (target == null || target === '') throw new Error('affine-meter: antecedent sans `target`');
    tgt = F(target);
    const r = A.antecedentOf(f, tgt);
    if (r.kind !== 'unique' || !Lin.isInteger(r.x) || Lin.cmp(r.x, 1) < 0) throw new Error(`affine-meter: ${target} n'a pas d'antécédent entier ≥ 1`);
    targetX = Lin.toNumber(r.x);
  }
  const far = Math.max(0, targetX ?? 0, ...markList);
  const max = xMax != null ? Number(xMax) : Math.max(12, Math.ceil((far + 1) / 5) * 5);
  if (far > max) throw new Error('affine-meter: une marque ou la cible hors de la réglette');
  const aGrid = knobGrid(f.a.d === 1 ? f.a.n : 1);
  const bGrid = knobGrid(f.b.d === 1 ? f.b.n : 1);
  return Object.freeze({
    f, rule: String(rule), modes, stage: modes[0],
    range: Object.freeze({ min: 0, max }),
    target: tgt, targetX, marks: Object.freeze(markList),
    trials: Object.freeze([]), recorded: 0,
    antTrials: Object.freeze([]), hit: false,
    aGrid, bGrid,
    knobs: Object.freeze({ a: Math.round(Lin.toNumber(f.a) / aGrid.step), b: Math.round(Lin.toNumber(f.b) / bGrid.step) }),
    visited: Object.freeze({ linear: false, constant: false }),
    classified: 0,
    last: null,
  });
}

/** La fonction que le compteur applique : celle de la leçon, ou celle des boutons (étape classify). */
export function current(s) {
  if (s.stage !== 'classify') return s.f;
  return Lin.lin(s.knobs.a * s.aGrid.step, s.knobs.b * s.bGrid.step);
}
/** f(x) exact, avec la fonction courante. */
export const meterAt = (s, x) => A.imageOf(current(s), x);

/** La forme écrite (LaTeX) de la fonction courante, « 185x + 35000 ». */
export const ruleTex = (s) => A.affineLatex(current(s));

/** Les trois noms : toute fonction est تآلفية ; b = 0 → خطية ; a = 0 → ثابتة. */
export const kinds = (s) => A.kindOf(current(s));

/* ── l'étape « image » ─────────────────────────────────────────────── */

/** Le témoin que le total N'EST PAS proportionnel à x, pris dans les essais de l'élève. */
export function proportionWitness(s) {
  const tr = s.trials;
  if (tr.includes(0)) return Object.freeze({ kind: 'zero', fx: A.imageOf(s.f, 0) });
  for (const x of tr) {
    if (x > 0 && tr.includes(2 * x)) return Object.freeze({ kind: 'double', x, fx: A.imageOf(s.f, x), f2x: A.imageOf(s.f, 2 * x) });
  }
  return null;
}

export function imageDone(s) {
  if (s.marks.length && !s.marks.every((m) => s.trials.includes(m))) return false;
  return s.trials.length >= 3 && proportionWitness(s) != null;
}

/** Valider une valeur x (relâchement, pause du clavier) : un ESSAI de l'étape en cours. */
export function commit(s, x) {
  if (x == null) return with_(s, { last: { kind: 'noX' } });
  if (s.stage === 'image') {
    const fx = A.imageOf(s.f, x);
    const trials = s.trials.includes(x) ? s.trials : Object.freeze([...s.trials, x].sort((p, q) => p - q));
    return with_(s, { trials, recorded: s.recorded + 1, last: { kind: 'image', x, fx } });
  }
  if (s.stage === 'antecedent') {
    const fx = A.imageOf(s.f, x);
    const c = Lin.cmp(fx, s.target);
    const antTrials = s.antTrials.includes(x) ? s.antTrials : Object.freeze([...s.antTrials, x]);
    if (c === 0) return with_(s, { antTrials, hit: true, last: { kind: 'hit', x, fx } });
    return with_(s, { antTrials, last: { kind: c < 0 ? 'below' : 'above', x, fx, gap: Lin.sub(s.target, fx) } });
  }
  return with_(s, { last: { kind: 'classifyX', x } });
}

/* ── l'enchaînement des étapes (MANIPULATION_CONTRACT §7quater : l'élève ouvre la suivante) ── */

export function stageDone(s, stage) {
  if (stage === 'image') return imageDone(s);
  if (stage === 'antecedent') return s.hit;
  return classifyDone(s);
}
/** Une étape s'ouvre quand la précédente (dans `modes`) est accomplie ; on revient toujours en arrière. */
export function canOpen(s, stage) {
  const i = s.modes.indexOf(stage);
  if (i < 0) return false;
  return s.modes.slice(0, i).every((m) => stageDone(s, m));
}
export function setStage(s, stage) {
  if (!canOpen(s, stage) || s.stage === stage) return s;
  return with_(s, { stage, last: { kind: 'stage', stage } });
}
/** « أعِد التجربة » (LabCheckpoint) : l'étape COURANTE repart de zéro (les essais, la cible, les boutons), les autres restent. */
export function restartStage(s) {
  if (s.stage === 'image') return with_(s, { trials: Object.freeze([]), recorded: 0, last: null });
  if (s.stage === 'antecedent') return with_(s, { antTrials: Object.freeze([]), hit: false, last: null });
  return with_(s, {
    knobs: Object.freeze({ a: Math.round(Lin.toNumber(s.f.a) / s.aGrid.step), b: Math.round(Lin.toNumber(s.f.b) / s.bGrid.step) }),
    visited: Object.freeze({ linear: false, constant: false }), classified: 0, last: null,
  });
}
export const nextStage = (s) => s.modes[s.modes.indexOf(s.stage) + 1] ?? null;

/* ── l'étape « antecedent » : le programme inverse ── */

/** « اطرح b ثم اقسم على a » écrit avec les nombres : m − b = r, r ÷ a = x. */
export function inverseLines(s) {
  if (!s.target) return [];
  const r = Lin.sub(s.target, s.f.b);
  const x = Lin.div(r, s.f.a);
  return [
    `${numTex(s.target)} - ${numTex(s.f.b)} = ${numTex(r)}`,
    `${numTex(r)} \\div ${numTex(s.f.a)} = ${numTex(x)}`,
  ];
}
/** L'ordre inversé (MISC-TAALUFI-SABIQ-TARTIB) : m ÷ a − b, exact — pour le réfuter. */
export const wrongOrder = (s) => Lin.sub(Lin.div(s.target, s.f.a), s.f.b);
/** Diviser sans retirer b (MISC-TAALUFI-SABIQ-QISMA) : m ÷ a, exact. */
export const divideOnly = (s) => Lin.div(s.target, s.f.a);

/* ── l'étape « classify » : les boutons a et b ── */

export function setKnob(s, which, idx) {
  if (s.stage !== 'classify') return s;
  const g = which === 'a' ? s.aGrid : s.bGrid;
  const v = Math.min(g.max, Math.max(0, Math.round(idx)));
  if (s.knobs[which] === v) return s;
  return with_(s, { knobs: Object.freeze({ ...s.knobs, [which]: v }) });
}

/** Valider le réglage des boutons : il compte comme cas خطية (b = 0, a ≠ 0) ou ثابتة (a = 0). */
export function commitKnobs(s) {
  if (s.stage !== 'classify') return s;
  const k = kinds(s);
  const visited = Object.freeze({
    linear: s.visited.linear || (k.linear && !k.constant),
    constant: s.visited.constant || k.constant,
  });
  const kind = k.constant ? 'constant' : k.linear ? 'linear' : 'affine';
  return with_(s, { visited, classified: s.classified + 1, last: { kind: 'knobs', which: kind, a: current(s).a, b: current(s).b } });
}
export const classifyDone = (s) => s.visited.linear && s.visited.constant;

/** Les abscisses de la petite réglette de lecture (4 compteurs) : 0, ⅓, ⅔, la fin. */
export function sweep(s) {
  const m = s.range.max;
  return [0, Math.round(m / 3), Math.round((2 * m) / 3), m];
}

/* ── la découverte ── */

/** Le contraste pédagogique est atteint : l'image (et, si posée, l'antécédent) faite(s). */
export const discoveryReady = (s) => imageDone(s) && (!s.modes.includes('antecedent') || s.hit);

/** Deux nombres naïfs que l'élève pourrait croire : « a + b par unité » (MISC-TARRID-JUZ-THABIT). */
export const perUnitSum = (s) => Lin.add(s.f.a, s.f.b);

/* ── défaut de la règle et balayage ─────────────────────────────────────── */

/**
 * Le x affiché à l'ouverture (jamais un essai, jamais une réponse) : au départ de l'antécédent, 0 (le compteur
 * montre b, loin du total visé) ; sinon le premier x ≥ 1 qui n'est pas une marque du manuel.
 */
export function defaultX(s) {
  if (s.stage === 'antecedent') return s.range.min === s.targetX ? s.range.min + 1 : s.range.min;
  for (let x = Math.max(1, s.range.min); x <= s.range.max; x += 1) if (!s.marks.includes(x)) return x;
  return s.range.min;
}

/** Les x que le balayage « جرّب كل الإمكانيات » n'a pas encore validés (image, antécédent) ; classify : aucun. */
export function untriedXs(s) {
  if (s.stage !== 'image' && s.stage !== 'antecedent') return [];
  const done = s.stage === 'image' ? s.trials : s.antTrials;
  const out = [];
  for (let x = s.range.min; x <= s.range.max; x += 1) if (!done.includes(x)) out.push(x);
  return out;
}
