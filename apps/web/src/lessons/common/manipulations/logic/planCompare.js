import * as AF from '@smarter-academy/core/arithmetic/affine.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { niceStep, subdivide } from './originLine';

/**
 * plan-compare — DEUX (OU TROIS) TARIFS FACE À FACE (unité 7 « الدالة التآلفية », leçon 5 « حل مشكلات
 * وترييض وضعيات بتوظيف الدالة التآلفية » ; réutilisé par la synthèse « أدمج تعلّماتي » par un contrat de
 * props FIXE — brief de l'unité §6).
 *
 * Toute la vérité vient de packages/core/arithmetic/affine.js (sur les fractions EXACTES de linear.js) :
 * une formule est `affine('200x+2000')`, un coût `imageOf`, un budget `antecedentOf`, deux formules
 * `comparePlans`, la moins chère `cheapestAt`. Les flottants ne servent qu'au DESSIN (pixels).
 *
 * Deux laboratoires, ouverts par l'élève (MANIPULATION_CONTRACT §7quater) :
 *   model    la formule A (la première) : l'élève PORTE ses deux montants dans la facture — la partie
 *            fixe dans « يُدفع مرّة واحدة », le prix d'une unité dans « يُدفع عند كل وحدة (× x) ». « تحقّق »
 *            refuse un modèle qui contredit l'histoire (le forfait payé x fois : MISC-TARRID-JUZ-THABIT ;
 *            le prix d'une unité payé une fois) ; accepté, le lab écrit f(x) = ax + b, puis x glisse
 *            (image) et un budget se rencontre (antécédent : les cibles `ask`).
 *   compare  2 ou 3 formules : x glisse (les barres de coût et les droites bougent ensemble), l'élève
 *            POSE une marque là où deux coûts sont égaux (vérifiée exactement : `judgePin`), puis PEINT
 *            l'axe des x : sur chaque intervalle, la formule la moins chère (`paint`, refus avec témoin).
 *
 * Un ESSAI est une valeur de x VALIDÉE (relâchement, pause du clavier, bouton) — pas une position que
 * le doigt traverse. x est un nombre ENTIER ≥ 0 (des matchs, des heures entières).
 */
const { frac, parseNumber, add, sub, mul, div, cmp, eq, isZero, isInteger, toNumber, fracLatex, fracDecimal, fracText, lin, linLatex } = Lin;
const F = (v) => (typeof v === 'object' && v !== null ? v : Number.isInteger(v) ? frac(v) : parseNumber(String(v)));

export const THEMES = Object.freeze(['stadium', 'gaming', 'rental']);
const MODES = Object.freeze(['model', 'compare']);
const PLAN_IDS = Object.freeze(['A', 'B', 'C']);
/** Le nom de la fonction de chaque formule, dans les lignes écrites (« f(x) = g(x) »). */
const FN = Object.freeze(['f', 'g', 'h']);
export const COLORS = Object.freeze(['#2563EB', '#E11D48', '#059669']);

/* ── lecture des props (chaînes écrites comme le manuel) ───────────────── */

/** « 0,5 », « 2000 », « 15/2 » → fraction exacte. */
export function parseValue(raw) {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'number') return Number.isInteger(raw) ? frac(raw) : parseNumber(String(raw));
  return parseNumber(String(raw).replace(/\s+/g, '').replace(/[−–]/g, '-'));
}

/** « 200x+2000|400x » → [{ id, index, src, f }]. Une à trois formules, coûts positifs, toutes distinctes. */
export function parsePlans(raw) {
  const list = String(raw ?? '').split('|').map((s) => s.trim()).filter(Boolean);
  if (list.length < 1 || list.length > 3) throw new Error(`plan-compare : une à trois formules, reçu « ${raw} »`);
  const plans = list.map((src, index) => ({ id: PLAN_IDS[index], index, src, f: AF.affine(src) }));
  for (const p of plans) {
    if (cmp(p.f.a, 0) < 0 || cmp(p.f.b, 0) < 0) throw new Error(`plan-compare : un tarif a des montants positifs, reçu « ${p.src} »`);
    if (isZero(p.f.a) && isZero(p.f.b)) throw new Error(`plan-compare : un tarif gratuit n'est pas un tarif (« ${p.src} »)`);
  }
  for (let i = 0; i < plans.length; i++) {
    for (let j = i + 1; j < plans.length; j++) {
      if (eq(plans[i].f.a, plans[j].f.a) && eq(plans[i].f.b, plans[j].f.b)) throw new Error(`plan-compare : deux formules identiques « ${plans[i].src} »`);
    }
  }
  return plans;
}

/** « model », « compare », « model|compare » → les laboratoires ouverts, dans l'ordre. Une seule formule : model. */
export function parseModes(raw, nPlans) {
  const parts = String(raw ?? 'model').split('|').map((s) => s.trim()).filter(Boolean);
  for (const p of parts) if (!MODES.includes(p)) throw new Error(`plan-compare : mode inconnu « ${p} »`);
  if (nPlans < 2) return ['model'];
  const modes = MODES.filter((m) => parts.includes(m));
  return modes.length ? modes : ['model'];
}

/** « x:7|y:4800 » → [{ axis, v }] : coût de 7 unités ; nombre d'unités pour 4800. */
export function parseAsk(raw) {
  if (!raw) return [];
  return String(raw).split('|').filter(Boolean).map((s) => {
    const [axis, v] = s.split(':');
    if ((axis !== 'x' && axis !== 'y') || v == null) throw new Error(`plan-compare : cible illisible « ${s} »`);
    const val = parseValue(v);
    if (axis === 'x' && (!isInteger(val) || cmp(val, 0) < 0)) throw new Error(`plan-compare : x est un nombre entier d'unités (« ${s} »)`);
    return { axis, v: val };
  });
}

/* ── les comparaisons exactes ───────────────────────────────────────────── */

/** Toutes les paires (i < j) et leur comparaison (`affine.comparePlans`). */
function pairs(plans) {
  const out = [];
  for (let i = 0; i < plans.length; i++) {
    for (let j = i + 1; j < plans.length; j++) out.push({ i, j, ...AF.comparePlans(plans[i].f, plans[j].f) });
  }
  return out;
}

/** Les croisements strictement à l'intérieur de ]0 ; xMax[. */
const crossingsIn = (plans, xMax) => pairs(plans).filter((p) => p.kind === 'cross' && cmp(p.x, 0) > 0 && cmp(p.x, xMax) < 0);

/**
 * L'ENVELOPPE INFÉRIEURE sur [0 ; xMax] : les intervalles où une formule est la moins chère, et les
 * changements (`breaks`) — ce que l'élève marque puis peint. Deux formules distinctes ne sont égales
 * qu'en leur croisement : au milieu de deux croisements consécutifs, la moins chère est unique.
 */
function envelope(plans, xMax) {
  const X = F(xMax);
  const cand = [];
  for (const c of crossingsIn(plans, X)) if (!cand.some((v) => eq(v, c.x))) cand.push(c.x);
  cand.sort(cmp);
  const pts = [frac(0), ...cand, X];
  const fs = plans.map((p) => p.f);
  const segments = [];
  for (let k = 0; k + 1 < pts.length; k++) {
    const mid = div(add(pts[k], pts[k + 1]), 2);
    const best = AF.cheapestAt(fs, mid)[0];
    const last = segments[segments.length - 1];
    if (last && last.plan === best) last.to = pts[k + 1];
    else segments.push({ from: pts[k], to: pts[k + 1], plan: best });
  }
  const breaks = segments.slice(1).map((s, n) => ({ x: s.from, y: AF.imageOf(plans[s.plan].f, s.from), before: segments[n].plan, after: s.plan }));
  return { segments: segments.map((s, n) => ({ ...s, index: n })), breaks };
}

/* ── fenêtre et grilles ─────────────────────────────────────────────────── */

const ceilTo = (v, step) => Math.ceil(v / step - 1e-9) * step;

/**
 * La fenêtre : xMax ENTIER (unités) assez long pour que l'« après » du croisement se voie autant que
 * l'« avant » (deux fois le dernier croisement), les cibles comprises ; yMax couvre tous les coûts.
 */
function defaultWindow(plans, asks = [], { xMax, yMax } = {}) {
  let xm;
  if (xMax != null && xMax !== '') xm = Math.max(1, Math.ceil(toNumber(parseValue(xMax))));
  else {
    const needs = [10];
    for (const c of pairs(plans)) if (c.kind === 'cross' && cmp(c.x, 0) > 0) needs.push(Math.ceil(toNumber(c.x) * 2));
    for (const a of asks) {
      if (a.axis === 'x') needs.push(toNumber(a.v) + 2);
      else {
        const r = AF.antecedentOf(plans[0].f, a.v);
        if (r.kind === 'unique') needs.push(Math.ceil(toNumber(r.x)) + 2);
      }
    }
    const raw = Math.max(...needs);
    xm = ceilTo(raw, Math.max(1, toNumber(niceStep(raw, 10))));
  }
  let ym;
  if (yMax != null && yMax !== '') ym = toNumber(parseValue(yMax));
  else {
    const tops = plans.map((p) => toNumber(AF.imageOf(p.f, xm)));
    for (const a of asks) if (a.axis === 'y') tops.push(toNumber(a.v));
    const raw = Math.max(1, ...tops);
    ym = ceilTo(raw, toNumber(niceStep(raw, 8)));
  }
  return { xMax: xm, yMax: ym };
}

/**
 * Les graduations (xStep, yStep) et la grille EXACTE de la marque (dx, dy) : chaque croisement de la
 * fenêtre est un nœud, de sorte qu'il soit atteint exactement — jamais « à peu près ».
 */
function grids(plans, win) {
  const xStep = niceStep(win.xMax, 10);
  const yStep = niceStep(win.yMax, 8);
  const cs = crossingsIn(plans, F(win.xMax));
  const dx = subdivide(frac(1), cs.map((c) => c.x));
  const dy = subdivide(yStep, cs.map((c) => c.y));
  return { xStep, yStep, dx, dy };
}

export const indexOf = (v, d) => Math.round(v / toNumber(d));
export const valueAt = (i, d) => mul(F(d), frac(i));
export function indexRange(min, max, d) {
  const s = toNumber(d);
  return { min: Math.ceil(min / s - 1e-9), max: Math.floor(max / s + 1e-9) };
}
/** Les graduations d'un axe : valeurs exactes multiples du pas dans [0 ; max]. */
export function ticks(max, step) {
  const r = indexRange(0, max, step);
  const out = [];
  for (let i = r.min; i <= r.max; i++) out.push(valueAt(i, step));
  return out;
}

/* ── l'état ─────────────────────────────────────────────────────────────── */

export function init({ plans: rawPlans, mode, ask, xMax, yMax } = {}) {
  const plans = parsePlans(rawPlans);
  const modes = parseModes(mode, plans.length);
  const asks = parseAsk(ask);
  const win = defaultWindow(plans, asks, { xMax, yMax });
  const X = frac(win.xMax);
  for (const a of asks) {
    if (a.axis === 'x' && cmp(a.v, X) > 0) throw new Error(`plan-compare : la cible x = ${fracText(a.v)} dépasse la fenêtre`);
    if (a.axis === 'y') {
      const r = AF.antecedentOf(plans[0].f, a.v);
      if (r.kind !== 'unique' || !isInteger(r.x) || cmp(r.x, 0) < 0 || cmp(r.x, X) > 0) {
        throw new Error(`plan-compare : le budget ${fracText(a.v)} ne correspond à aucun nombre entier d'unités de la formule A`);
      }
    }
  }
  const env = envelope(plans, X);
  const chips = [];
  if (!isZero(plans[0].f.b)) chips.push('fixed');
  if (!isZero(plans[0].f.a)) chips.push('unit');
  return {
    plans, modes, asks, win, env, grid: grids(plans, win), chips,
    stage: modes[0],
    slots: { once: null, each: null },
    verdict: null,
    accepted: !modes.includes('model'),
    trials: [],
    marks: [],
    noCross: null,
    painted: {},
    brush: null,
    last: null,
  };
}

/* ── MODÈLE : porter les deux montants dans la facture ──────────────────── */

const chipValue = (s, chip) => (chip === 'fixed' ? s.plans[0].f.b : s.plans[0].f.a);
const slotOf = (s, chip) => (s.slots.once === chip ? 'once' : s.slots.each === chip ? 'each' : null);
export const reserve = (s) => s.chips.filter((c) => !slotOf(s, c));

/** Poser un montant dans une case ; un montant déjà là revient à la réserve. Le modèle accepté est figé. */
export function place(s, chip, slot) {
  if (s.accepted || !s.chips.includes(chip) || (slot !== 'once' && slot !== 'each')) return s;
  const slots = { ...s.slots };
  for (const k of ['once', 'each']) if (slots[k] === chip) slots[k] = null;
  slots[slot] = chip;
  return { ...s, slots, verdict: null, last: null };
}

/** Rendre un montant à la réserve. */
export function takeBack(s, chip) {
  if (s.accepted) return s;
  const slots = { ...s.slots };
  for (const k of ['once', 'each']) if (slots[k] === chip) slots[k] = null;
  return { ...s, slots, verdict: null, last: null };
}

/** La formule que la facture de l'élève écrit : (case « × x ») x + (case « مرّة واحدة »). */
export function builtLin(s) {
  const v = (slot) => (s.slots[slot] ? chipValue(s, s.slots[slot]) : frac(0));
  return lin(v('each'), v('once'));
}

/** La valeur de x où l'on montre ce que donne un modèle (la première cible x, sinon 3). */
export function sampleX(s) {
  const a = s.asks.find((q) => q.axis === 'x');
  return a ? a.v : frac(3);
}

/**
 * « تحقّق » — le modèle contre l'histoire, montant par montant :
 *   missing     un montant de l'histoire n'est pas dans la facture ;
 *   fixedTimes  la partie fixe (abonnement, carte, forfait) payée x fois — MISC-TARRID-JUZ-THABIT ;
 *   rateOnce    le prix d'une unité payé une seule fois.
 * Le témoin : ce que la facture de l'élève coûte pour `sampleX`, et ce que l'histoire coûte.
 */
export function check(s) {
  if (s.accepted) return s;
  const issues = [];
  for (const chip of s.chips) {
    const at = slotOf(s, chip);
    if (!at) issues.push({ chip, reason: 'missing' });
    else if (chip === 'fixed' && at === 'each') issues.push({ chip, reason: 'fixedTimes', misconception: 'MISC-TARRID-JUZ-THABIT' });
    else if (chip === 'unit' && at === 'once') issues.push({ chip, reason: 'rateOnce' });
  }
  const x = sampleX(s);
  const built = builtLin(s);
  const verdict = {
    ok: issues.length === 0, issues, x,
    mine: AF.imageOf(built, x), story: AF.imageOf(s.plans[0].f, x), tex: linTex(built),
  };
  return { ...s, verdict, accepted: verdict.ok, trials: [...s.trials], last: { kind: verdict.ok ? 'modelOk' : 'modelKo' } };
}

/* ── x : un essai validé ────────────────────────────────────────────────── */

export const costsAt = (s, x) => s.plans.map((p) => AF.imageOf(p.f, F(x)));
/** Les indices des formules les moins chères pour x (`affine.cheapestAt`). */
export const cheapest = (s, x) => AF.cheapestAt(s.plans.map((p) => p.f), F(x));
/** Le nombre d'unités dont le coût par la formule A est m (`affine.antecedentOf`), ou null. */
export function antecedentX(s, m) {
  const r = AF.antecedentOf(s.plans[0].f, F(m));
  return r.kind === 'unique' ? r.x : null;
}

/** Un x validé (entier). Rien n'est mesuré avant que la formule A soit modélisée. */
export function commitX(s, x) {
  if (!s.accepted) return s;
  const xi = Math.max(0, Math.min(s.win.xMax, Math.round(x)));
  const trial = { x: xi, stage: s.stage, costs: costsAt(s, xi), cheapest: AF.cheapestAt(s.plans.map((p) => p.f), xi) };
  const trials = [...s.trials.filter((t) => !(t.x === xi && t.stage === s.stage)), trial];
  return { ...s, trials, last: { kind: 'trial', x: xi } };
}

/**
 * Le x affiché à l'ouverture (jamais un essai) : le premier entier qui n'est ni un croisement des formules, ni
 * une cible `ask` (x ou antécédent du budget) — l'ouverture ne donne aucune réponse. 0 dans le cas courant.
 */
export function defaultX(s) {
  const forbidden = new Set();
  for (const p of pairs(s.plans)) if (p.kind === 'cross' && isInteger(p.x)) forbidden.add(toNumber(p.x));
  for (const a of s.asks) {
    if (a.axis === 'x') forbidden.add(toNumber(a.v));
    else { const r = AF.antecedentOf(s.plans[0].f, a.v); if (r.kind === 'unique') forbidden.add(toNumber(r.x)); }
  }
  for (let x = 0; x <= s.win.xMax; x += 1) if (!forbidden.has(x)) return x;
  return 0;
}

/** Les x entiers de la fenêtre pas encore validés à l'étape courante (« جرّب كل الإمكانيات »). */
export function untriedXs(s) {
  if (!s.accepted) return [];
  const out = [];
  for (let x = 0; x <= s.win.xMax; x += 1) if (!s.trials.some((t) => t.x === x && t.stage === s.stage)) out.push(x);
  return out;
}

/** Les cibles `ask` atteintes par les essais de l'élève (sur la formule A). */
export function asksDone(s) {
  return s.asks.map((q) => s.trials.some((t) => (q.axis === 'x' ? t.x === toNumber(q.v) : eq(t.costs[0], q.v))));
}

/** Le premier laboratoire est accompli : modèle accepté, et les cibles (ou deux essais distincts). */
export function modelDone(s) {
  if (!s.modes.includes('model')) return true;
  if (!s.accepted) return false;
  if (s.asks.length) return asksDone(s).every(Boolean);
  return new Set(s.trials.map((t) => t.x)).size >= 2;
}

export const canCompare = (s) => s.modes.includes('compare') && modelDone(s);
export const openCompare = (s) => (canCompare(s) ? { ...s, stage: 'compare', last: null } : s);
export const backToModel = (s) => (s.modes.includes('model') ? { ...s, stage: 'model', last: null } : s);

/* ── COMPARER : la marque des coûts égaux ───────────────────────────────── */

/**
 * La marque posée en (x ; y), exactement :
 *   cross       x est un changement de la formule la moins chère et y le coût commun → acceptée ;
 *   crossAbove  deux formules y sont égales, mais une troisième est moins chère → acceptée, sans effet ;
 *   offLine     les coûts sont égaux en x, mais la marque n'est pas à leur hauteur → refusée ;
 *   unequal     les coûts ne sont pas égaux en x → refusée, avec les coûts (le témoin).
 */
export function judgePin(s, x, y) {
  const X = F(x); const Y = F(y);
  const costs = costsAt(s, X);
  const equalPairs = pairs(s.plans).filter((p) => eq(costs[p.i], costs[p.j]));
  const onPair = equalPairs.find((p) => eq(costs[p.i], Y));
  if (onPair) {
    const br = s.env.breaks.find((b) => eq(b.x, X));
    return { kind: br && eq(br.y, Y) ? 'cross' : 'crossAbove', ok: true, x: X, y: Y, pair: [onPair.i, onPair.j], costs };
  }
  if (equalPairs.length) return { kind: 'offLine', ok: false, x: X, y: Y, pair: [equalPairs[0].i, equalPairs[0].j], costs };
  return { kind: 'unequal', ok: false, x: X, y: Y, costs };
}

export function placeMark(s, x, y) {
  if (s.stage !== 'compare') return s;
  const m = judgePin(s, x, y);
  const marks = m.ok ? [...s.marks.filter((k) => !(eq(k.x, m.x) && eq(k.y, m.y))), m] : s.marks;
  return { ...s, marks, last: { ...m, kind: m.kind } };
}

/** Chaque changement de formule a sa marque acceptée. */
const breaksMarked = (s) => s.env.breaks.map((b) => s.marks.some((m) => m.kind === 'cross' && eq(m.x, b.x)));
export const marksDone = (s) => (s.env.breaks.length ? breaksMarked(s).every(Boolean) : s.noCross?.ok === true);

/** « لا تتساوى التكلفتان » : juste seulement s'il n'y a aucun changement dans la fenêtre. */
export function claimNoCross(s) {
  if (s.stage !== 'compare') return s;
  const ok = s.env.breaks.length === 0;
  const fs = s.plans.map((p) => p.f);
  const witness = ok ? null : { a: 0, b: s.win.xMax, at0: AF.cheapestAt(fs, 0)[0], atMax: AF.cheapestAt(fs, s.win.xMax)[0] };
  const noCross = { ok, witness };
  return { ...s, noCross: ok ? noCross : s.noCross, last: { kind: ok ? 'noCrossOk' : 'noCrossKo', witness } };
}

/* ── COMPARER : peindre l'axe des x ─────────────────────────────────────── */

const canPaint = (s) => s.stage === 'compare' && marksDone(s);
export const setBrush = (s, plan) => ({ ...s, brush: plan });

/** Un x où montrer qu'une formule n'est pas la moins chère sur l'intervalle : un essai de l'élève d'abord. */
export function witnessIn(s, seg) {
  const inside = (x) => cmp(x, seg.from) > 0 && cmp(x, seg.to) < 0;
  const own = [...s.trials].reverse().find((t) => inside(frac(t.x)));
  if (own) return frac(own.x);
  const mid = div(add(seg.from, seg.to), 2);
  const r = frac(Math.round(toNumber(mid)));
  return inside(r) ? r : mid;
}

export function paint(s, segIndex, plan = s.brush) {
  if (!canPaint(s) || plan == null) return s;
  const seg = s.env.segments[segIndex];
  if (!seg) return s;
  if (seg.plan === plan) {
    return { ...s, painted: { ...s.painted, [segIndex]: plan }, last: { kind: 'paintOk', seg: segIndex, plan } };
  }
  const x = witnessIn(s, seg);
  return { ...s, last: { kind: 'paintKo', seg: segIndex, plan, x, costs: costsAt(s, x), best: seg.plan } };
}

export const paintDone = (s) => s.env.segments.every((seg) => s.painted[seg.index] === seg.plan);

/** Le segment de l'enveloppe qui contient x (au bord : celui qui commence). */
function segmentOf(s, x) {
  const X = F(x);
  const segs = s.env.segments;
  for (const seg of segs) if (cmp(X, seg.from) >= 0 && cmp(X, seg.to) < 0) return seg.index;
  return segs[segs.length - 1].index;
}

/** CONTRASTE : des essais de la comparaison dans deux intervalles différents (ou deux essais s'il n'y en a qu'un). */
export function contrastOk(s) {
  const tr = s.trials.filter((t) => t.stage === 'compare');
  const onBreak = (t) => s.env.breaks.some((b) => eq(b.x, frac(t.x)));
  const segs = new Set(tr.filter((t) => !onBreak(t)).map((t) => segmentOf(s, t.x)));
  return s.env.segments.length >= 2 ? segs.size >= 2 : new Set(tr.map((t) => t.x)).size >= 2;
}

/** La découverte s'ouvre : le dernier laboratoire de la manipulation est accompli. */
export function discoveryReady(s) {
  if (!s.modes.includes('compare')) return modelDone(s);
  return s.stage === 'compare' && marksDone(s) && paintDone(s) && contrastOk(s);
}

export function discoveryKind(s) {
  if (!s.modes.includes('compare')) return 'model';
  return s.env.breaks.length ? 'cross' : 'none';
}

/* ── écritures (KaTeX, texte) ───────────────────────────────────────────── */

/** « 2,5 », « 3400 », « 15/2 » : pour les ARIA, les attributs et les tests. */
export function numText(p) {
  const d = fracDecimal(F(p), 3);
  return d ?? fracText(F(p));
}
/** « 2{,}5 », « 3400 », « \dfrac{15}{2} » : pour KaTeX. */
export function numTex(p) {
  const d = fracDecimal(F(p), 3);
  return d ? d.replace(',', '{,}') : fracLatex(F(p));
}
/** « 200x + 2000 » avec la virgule décimale du manuel. */
export function linTex(f) {
  return linLatex(f).replace(/(\d),(\d)/g, '$1{,}$2').replace(/(\d)\.(\d)/g, '$1{,}$2');
}
const coefTex = (c) => (eq(c, 1) ? '' : numTex(c));
export const fnTex = (s, i) => `${FN[i]}(x) = ${linTex(s.plans[i].f)}`;

/** « 200 \times 7 + 2000 = 3400 » : le coût de x unités de la formule i, calcul écrit. */
export function costTex(s, i, x) {
  const { a, b } = s.plans[i].f;
  const X = F(x);
  const parts = [];
  if (!isZero(a)) parts.push(`${numTex(a)} \\times ${numTex(X)}`);
  if (!isZero(b) || !parts.length) parts.push(numTex(b));
  return `${FN[i]}(${numTex(X)}) = ${parts.join(' + ')} = ${numTex(AF.imageOf(s.plans[i].f, X))}`;
}

/** Les lignes de l'antécédent d'un budget m par la formule A : ax + b = m ; ax = m − b ; x = … */
export function antecedentLines(s, m) {
  const { a, b } = s.plans[0].f;
  const r = AF.antecedentOf(s.plans[0].f, m);
  const lines = [`${linTex(s.plans[0].f)} = ${numTex(m)}`];
  if (!isZero(b)) lines.push(`${coefTex(a)}x = ${numTex(sub(F(m), b))}`);
  if (!eq(a, 1) && r.kind === 'unique') lines.push(`x = ${numTex(r.x)}`);
  return lines;
}

/**
 * L'ÉQUATION du changement entre deux formules p et q : f(x) = g(x) ; on rassemble les x du côté du plus
 * grand coefficient ; x = x0 — puis la vérification f(x0) = g(x0).
 */
export function equalityLines(s, p, q) {
  const P = s.plans[p].f; const Q = s.plans[q].f;
  const [L, R] = cmp(P.a, Q.a) > 0 ? [P, Q] : [Q, P];
  const da = sub(L.a, R.a); const db = sub(R.b, L.b);
  const x0 = div(db, da);
  const lines = [`${FN[p]}(x) = ${FN[q]}(x)`, `${linTex(P)} = ${linTex(Q)}`, `${coefTex(da)}x = ${numTex(db)}`];
  if (!eq(da, 1)) lines.push(`x = ${numTex(x0)}`);
  return { lines, x: x0, y: AF.imageOf(P, x0), check: `${FN[p]}(${numTex(x0)}) = ${FN[q]}(${numTex(x0)}) = ${numTex(AF.imageOf(P, x0))}` };
}

/**
 * L'INÉQUATION « c moins chère que d » (c a le plus petit coefficient : moins chère APRÈS le
 * croisement) : c(x) < d(x) ; (b_c − b_d) < (a_d − a_c) x ; x > x0. On divise par un nombre positif :
 * le sens ne change pas.
 */
export function inequalityLines(s, c, d) {
  const C = s.plans[c].f; const D = s.plans[d].f;
  const lines = [`${FN[c]}(x) < ${FN[d]}(x)`, `${linTex(C)} < ${linTex(D)}`];
  if (cmp(C.a, D.a) < 0) {
    const da = sub(D.a, C.a); const db = sub(C.b, D.b);
    lines.push(`${numTex(db)} < ${coefTex(da)}x`);
    if (!eq(da, 1)) lines.push(`x > ${numTex(div(db, da))}`);
    return { lines, rel: '>', x: div(db, da) };
  }
  const da = sub(C.a, D.a); const db = sub(D.b, C.b);
  lines.push(`${coefTex(da)}x < ${numTex(db)}`);
  if (!eq(da, 1)) lines.push(`x < ${numTex(div(db, da))}`);
  return { lines, rel: '<', x: div(db, da) };
}

/**
 * Les pixels d'un repère dont l'origine est en bas à gauche (x ≥ 0, y ≥ 0) — le dessin seulement.
 * À gauche, la place des graduations des coûts (« 8000 ») ; en bas, celle des unités.
 */
export function planeGeometry({ win, width, height, padL = 38, padR = 12, padT = 12, padB = 18 }) {
  const W0 = Math.max(60, width - padL - padR);
  const H0 = Math.max(60, height - padT - padB);
  const ux = W0 / win.xMax;
  const uy = H0 / win.yMax;
  const px = (x) => padL + x * ux;
  const py = (y) => padT + (win.yMax - y) * uy;
  const fromPx = (X, Y) => ({ x: (X - padL) / ux, y: win.yMax - (Y - padT) / uy });
  return { W: padL + win.xMax * ux + padR, H: padT + win.yMax * uy + padB, ux, uy, padL, padT, px, py, fromPx };
}

/** Le tronçon d'une formule visible dans la fenêtre : [[x1, y1], [x2, y2]] (flottants) ou null. */
export function lineSegment(f, win) {
  const a = toNumber(f.a); const b = toNumber(f.b);
  let lo = 0; let hi = win.xMax;
  if (a > 0) hi = Math.min(hi, (win.yMax - b) / a);
  if (b > win.yMax) return null;
  if (hi - lo < 1e-9) return null;
  return [[lo, a * lo + b], [hi, a * hi + b]];
}

export { toNumber, frac, eq, cmp };

/* ── les ÉTAPES du labo (questions pendant le labo, lot 5) ───────────────── */

/**
 * build (la facture acceptée) · slide (x glissé, les cibles atteintes) · mark (les marques de coûts égaux) · paint (l'axe peint).
 * model seul : build, slide ; compare seul : mark, paint ; model|compare : les quatre.
 */
export function stepsOf(s) {
  const m = s.modes.includes('model'); const c = s.modes.includes('compare');
  return [...(m ? ['build', 'slide'] : []), ...(c ? ['mark', 'paint'] : [])];
}

/** L'objectif de l'étape est-il atteint ? */
export function stepReached(s, step) {
  if (step === 'build') return !!s.accepted;
  if (step === 'slide') return modelDone(s);
  if (step === 'mark') return s.stage === 'compare' && marksDone(s);
  if (step === 'paint') return s.stage === 'compare' && discoveryReady(s);
  return false;
}

/** « أعِد التجربة » : la MÊME étape repart (`fresh` : l'état de départ du niveau). */
export function restartStep(s, step, fresh) {
  if (step === 'build') return fresh;
  if (step === 'slide') return { ...s, trials: [], last: null };
  if (step === 'mark') return { ...s, marks: [], noCross: null, painted: {}, brush: null, last: null };
  return { ...s, painted: {}, brush: null, last: null };
}

/**
 * Un x ENTIER de part et d'autre du premier changement `br`, où la formule la moins chère est unique et
 * est bien celle de l'intervalle (`br.before` à gauche, `br.after` à droite) ; null s'il n'y en a pas.
 */
export function sideX(s, br, side) {
  const X = toNumber(br.x);
  const want = side === 'before' ? br.before : br.after;
  const xs = [];
  if (side === 'before') for (let x = Math.ceil(X) - 1; x >= 0; x -= 1) xs.push(x);
  else for (let x = Math.floor(X) + 1; x <= toNumber(s.win.xMax); x += 1) xs.push(x);
  return xs.find((x) => { const c = AF.cheapestAt(s.plans.map((p) => p.f), x); return c.length === 1 && c[0] === want; }) ?? null;
}
