import { toLatinDigits } from '@smarter-academy/core';
import * as P from '@smarter-academy/core/arithmetic/proportional.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';

/**
 * ratio-ride — LE COMPTEUR DE TRAJET (unité 6 « الدالة الخطية والتناسبية », leçon 1
 * « التناسبية ومعامل التناسبية »).
 *
 * Des trottinettes électriques louées à la minute sur la promenade. Un TARIF s'écrit comme une
 * règle du manuel (`proportional.rule`) : « 15x » (15 DA la minute) ou « 10x+50 » (50 DA de
 * déverrouillage + 10 DA la minute) ; un niveau en pose un ou deux, « 15x|10x+50 ».
 *
 * L'élève fixe la DURÉE x (minutes entières, la trottinette qu'il fait rouler) ; le compteur lit le
 * prix y de chaque tarif ; « سجّل الرحلة » ENREGISTRE la colonne (x ; y) dans SON tableau. Toute la
 * vérité vient de packages/core/arithmetic/proportional.js :
 *   - les quotients y ÷ x et le verdict « tableau de proportionnalité » : `tableRatios` (exact ;
 *     une colonne x = 0 n'a pas de quotient et n'est compatible qu'avec y = 0) ;
 *   - le prix : `rule(src).at(x)` ; le coefficient : `rule.a`.
 * Ce module ne fait que l'INTERACTION : le tableau de l'élève, les jugements, les refus, la
 * colonne fantôme (الرابع المتناسب), l'écriture y = a × x, la découverte.
 *
 * JUGER un tableau est une RÉPONSE (« تناسبي » / « غير تناسبي »), jugée sur les colonnes que
 * l'élève a lui-même enregistrées :
 *   - « تناسبي » accepté ⇔ au moins deux colonnes x ≠ 0 et tous les quotients égaux ;
 *     refusé en MONTRANT deux quotients différents (ou la colonne x = 0 qui coûte déjà) ;
 *   - « غير تناسبي » accepté ⇔ le tableau porte un témoin (deux quotients différents, ou
 *     (0 ; y ≠ 0)) ; refusé en montrant que tous les quotients valent a ;
 *   - trop peu de colonnes : ni accepté ni refusé — « سجّل رحلة أخرى ».
 */

export const MAX_COLUMNS = 5;
const PLAN_IDS = Object.freeze(['A', 'B']);

/** « 15x|10x+50 » → les tarifs, dans l'ordre (A, B). */
function parsePlans(plans) {
  const src = String(plans).split('|').map((s) => s.trim()).filter(Boolean);
  if (src.length < 1 || src.length > 2) throw new Error(`ratio-ride: un ou deux tarifs (« ${plans} »)`);
  return src.map((s, i) => {
    const rule = P.rule(s);
    if (rule.kind === 'square') throw new Error(`ratio-ride: tarif non affine « ${s} »`);
    return Object.freeze({ id: PLAN_IDS[i], src: s, rule, linear: P.isLinear(rule) });
  });
}

/**
 * L'état initial. `max` : la durée maximale de la réglette (10 min pour un tarif, 20 pour deux) ;
 * `ghostX` : la durée de la colonne fantôme (hors de la réglette : il faut CALCULER, pas rouler).
 */
export function init({ plans = '15x', max, ghostX } = {}) {
  const list = parsePlans(plans);
  const top = max ?? (list.length > 1 ? 20 : 10);
  return Object.freeze({
    plans: list,
    two: list.length > 1,
    range: Object.freeze({ min: 0, max: top }),
    columns: Object.freeze([]),
    verdicts: Object.freeze({}),
    refused: Object.freeze([]),
    ghost: Object.freeze({ x: ghostX ?? top + 2, done: false }),
    formula: Object.freeze({ done: false }),
    showRatios: list.length === 1,
    recorded: 0,
    last: null,
  });
}

const with_ = (s, patch) => Object.freeze({ ...s, ...patch });
const plan = (s, id) => s.plans.find((p) => p.id === id);
/** Le tarif proportionnel du niveau (le seul qu'on complète et qu'on écrit y = a × x). */
export const linearPlan = (s) => s.plans.find((p) => p.linear) ?? null;

/** Le prix exact y d'une durée x pour un tarif. */
export const price = (s, id, x) => plan(s, id).rule.at(x);

/** Enregistrer la colonne x (refus silencieux d'un doublon, refus expliqué d'un tableau plein). */
export function record(s, x) {
  if (x == null) return with_(s, { last: { kind: 'noX' } });
  if (s.columns.includes(x)) return with_(s, { last: { kind: 'dup', x } });
  if (s.columns.length >= MAX_COLUMNS) return with_(s, { last: { kind: 'full', x } });
  const columns = Object.freeze([...s.columns, x].sort((a, b) => a - b));
  return with_(s, { columns, recorded: s.recorded + 1, last: { kind: 'recorded', x } });
}

/** Vider le tableau (les jugements déjà acceptés restent : ils ont été faits sur des preuves). */
export const clear = (s) => with_(s, { columns: Object.freeze([]), last: { kind: 'cleared' } });

/** Montrer la ligne des quotients (متقدم : elle est cachée jusqu'à ce que l'élève la demande). */
export const revealRatios = (s) => with_(s, { showRatios: true });

/** Le tableau d'un tarif : xs, ys, quotients exacts (null pour x = 0), verdict de core. */
export function table(s, id) {
  const xs = s.columns;
  const ys = xs.map((x) => price(s, id, x));
  if (xs.length === 0) return { xs, ys, ratios: [], proportional: null, a: null, nonZero: 0 };
  const t = P.tableRatios(xs, ys);
  return { xs, ys, ratios: t.ratios, proportional: t.proportional, a: t.a, nonZero: xs.filter((x) => x !== 0).length };
}

/**
 * Le TÉMOIN qu'un tableau n'est pas de proportionnalité : la colonne (0 ; y ≠ 0), sinon les deux
 * premières colonnes dont les quotients diffèrent. `null` si le tableau n'en porte aucun.
 */
export function witness(s, id) {
  const t = table(s, id);
  const zi = t.xs.findIndex((x, i) => x === 0 && !Lin.isZero(t.ys[i]));
  if (zi >= 0) return { kind: 'zero', x: 0, y: t.ys[zi] };
  const idx = t.xs.map((x, i) => i).filter((i) => t.ratios[i]);
  for (let j = 1; j < idx.length; j += 1) {
    const a = idx[0]; const b = idx[j];
    if (!Lin.eq(t.ratios[a], t.ratios[b])) {
      return { kind: 'differ', c1: { x: t.xs[a], y: t.ys[a], r: t.ratios[a] }, c2: { x: t.xs[b], y: t.ys[b], r: t.ratios[b] } };
    }
  }
  return null;
}

/** Juger le tableau d'un tarif : `says` = 'yes' (تناسبي) | 'no' (غير تناسبي). */
export function claim(s, id, says) {
  const t = table(s, id);
  const w = witness(s, id);
  const enoughYes = t.nonZero >= 2;
  if (says === 'yes') {
    if (w) return with_(s, { refused: Object.freeze([...s.refused, { id, says, witness: w }]), last: { kind: 'yesRefused', id, witness: w } });
    if (!enoughYes) return with_(s, { last: { kind: 'few', id } });
    return with_(s, { verdicts: Object.freeze({ ...s.verdicts, [id]: 'yes' }), last: { kind: 'yesOk', id, a: t.a } });
  }
  if (w) return with_(s, { verdicts: Object.freeze({ ...s.verdicts, [id]: 'no' }), last: { kind: 'noOk', id, witness: w } });
  if (!enoughYes) return with_(s, { last: { kind: 'few', id } });
  return with_(s, { refused: Object.freeze([...s.refused, { id, says, a: t.a }]), last: { kind: 'noRefused', id, a: t.a } });
}

/** Lire une saisie d'élève en nombre exact (chiffres arabes, virgule) ; null si illisible. */
export function readNumber(raw) {
  const txt = toLatinDigits(raw).trim().replace(/\s+/g, '').replace('٫', ',');
  if (txt === '') return null;
  try { return Lin.parseNumber(txt); } catch { return null; }
}

/** La colonne fantôme : l'élève y écrit le prix d'une durée hors de la réglette (× a). */
export function ghostTry(s, raw) {
  const lp = linearPlan(s);
  if (!lp || s.verdicts[lp.id] !== 'yes') return with_(s, { last: { kind: 'ghostLocked' } });
  const y = readNumber(raw);
  if (y == null) return with_(s, { last: { kind: 'syntax' } });
  const want = price(s, lp.id, s.ghost.x);
  if (Lin.eq(y, want)) return with_(s, { ghost: Object.freeze({ ...s.ghost, done: true }), last: { kind: 'ghostOk', x: s.ghost.x, y: want, a: lp.rule.a } });
  return with_(s, { last: { kind: 'ghostWrong', x: s.ghost.x, y, r: P.ratio(s.ghost.x, y), a: lp.rule.a } });
}

/** Écrire y = □ × x pour le tarif proportionnel ; refusé en rejouant une colonne de l'élève. */
export function formulaTry(s, raw) {
  const lp = linearPlan(s);
  if (!lp || s.verdicts[lp.id] !== 'yes') return with_(s, { last: { kind: 'formulaLocked' } });
  const a = readNumber(raw);
  if (a == null) return with_(s, { last: { kind: 'syntax' } });
  if (Lin.eq(a, lp.rule.a)) return with_(s, { formula: Object.freeze({ done: true, a }), last: { kind: 'formulaOk', a } });
  const x = s.columns.find((v) => v !== 0) ?? 1;
  return with_(s, { last: { kind: 'formulaWrong', a, x, got: Lin.mul(a, x), want: price(s, lp.id, x) } });
}

/** « أعِد التجربة » de l'étape 2 : efface seulement la colonne fantôme et la formule (le tableau et les jugements restent). */
export const retryRule = (s) => with_(s, {
  ghost: Object.freeze({ ...s.ghost, done: false }), formula: Object.freeze({ done: false }), last: null,
});

/** Chaque tarif a-t-il reçu son BON jugement ? */
export const allJudged = (s) => s.plans.every((p) => s.verdicts[p.id] === (p.linear ? 'yes' : 'no'));

/**
 * La découverte (contraste, MANIPULATION_DNA §3.6) :
 *   un tarif   le tableau jugé « تناسبي » ET la colonne fantôme complétée par × a ;
 *   deux tarifs les deux tableaux bien jugés (l'un accepté, l'autre refusé par ses quotients)
 *               ET y = a × x écrit.
 */
export function discoveryReady(s) {
  if (!allJudged(s)) return false;
  return s.two ? s.formula.done : s.ghost.done;
}

/* ── Écritures (affichage) ─────────────────────────────────────────────────────────────── */

/** Un nombre exact en KaTeX : décimal court à virgule (« 22{,}5 ») sinon \dfrac. */
export function numTex(p) {
  const d = Lin.fracDecimal(p, 2);
  if (d != null) return d.replace(',', '{,}');
  return Lin.fracLatex(p);
}
/** Un nombre exact en texte simple (aria, données) : « 22,5 », « 80/3 ». */
export function numText(p) {
  return Lin.fracDecimal(p, 2) ?? Lin.fracText(p);
}
/** Le quotient d'une colonne, écrit : « \dfrac{60}{4} = 15 ». */
export const quotientTex = (x, y, r) => `\\dfrac{${numTex(y)}}{${x}} = ${numTex(r)}`;

/** Le tarif écrit comme une règle : « y = 15 \times x », « y = 10 \times x + 50 ». */
export function planTex(p) {
  const a = numTex(p.rule.a);
  if (p.linear) return `y = ${a} \\times x`;
  const b = p.rule.b;
  return `y = ${a} \\times x ${b.n < 0 ? '-' : '+'} ${numTex(Lin.frac(Math.abs(b.n), b.d))}`;
}

/** L'égalité des quotients d'un tableau proportionnel : « \dfrac{30}{2} = \dfrac{75}{5} = 15 ». */
export function equalRatiosTex(s, id) {
  const t = table(s, id);
  const parts = t.xs.map((x, i) => (x === 0 ? null : `\\dfrac{${numTex(t.ys[i])}}{${x}}`)).filter(Boolean);
  return t.a ? `${parts.join(' = ')} = ${numTex(t.a)}` : parts.join(' , ');
}

/**
 * La durée PAR DÉFAUT de la trottinette (2026-10-09) : 1 minute — ni 0 (qui montrerait d'avance que
 * le forfait coûte déjà 50 DA), ni la durée de la colonne fantôme. Ce n'est pas une colonne : rien n'est
 * enregistré tant que l'élève n'appuie pas sur « سجّل ».
 */
export function defaultX(s) {
  for (let x = s.range.min + 1; x <= s.range.max; x += 1) if (x !== s.ghost.x && x !== 0) return x;
  return s.range.min;
}
