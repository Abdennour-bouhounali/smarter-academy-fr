/**
 * story-bars — la logique PURE du modèle en barres d'une histoire (1AM, unité 2 « الجمع والطرح », درس
 * « معنى الجمع والطرح », manuel pp. 25, 26, 29). Aucun React ici ; toute l'arithmétique est EXACTE
 * (`@smarter-academy/core/arithmetic/linear.js`, importé par chemin — jamais le barrel du core).
 *
 * L'idée : les mots « يزيد / ينقص / أكثر / أقل » ne décident pas de l'opération — c'est la STRUCTURE.
 * Dans le « مخطط بأقواس » (une ligne coupée en deux parties, un arc au-dessus de chaque partie, un arc
 * sous le tout), si l'inconnue est le TOUT on additionne les parties ; si c'est une PARTIE on soustrait
 * l'autre partie du tout. La bande ne se ferme que quand les parties font le tout.
 *
 * Deux modes, décidés par l'histoire (`STORIES[id].mode`) :
 *
 *   stretch  (checkup, method29) : un enfant connu (سارة 130 cm) et, item après item, un enfant inconnu
 *            dont la main TIRE la taille sur la toise (100–150 cm). Le relâchement est un essai jugé
 *            exactement (`judgeHeight`) ; une fois la phrase vraie, l'élève choisit une des trois cartes
 *            de calcul (`a + d`, `a − d`, `d − a`) : la bonne écrit la ligne et ferme la bande.
 *
 *     let s = init('checkup');
 *     s = commitHeight(s, 139);   // نزيم à 139 : « تزيد » lu comme une addition — refusé (kind 'mirror')
 *     s = commitHeight(s, 121);   // vrai
 *     s = chooseCalc(s, 1);       // 130 − 9 = 121 : l'item est fait
 *
 *   cards    (act1) : les six textes de نشاط 1 et ses six cartes ; une carte n'est acceptée sur un texte
 *            que si sa valeur est EXACTEMENT la réponse du texte (`canPlace`). Refusée, elle est notée sur
 *            le texte (`slot.tried`) et la vue dessine la bande de ce texte avec la valeur de la carte à
 *            la place de l'inconnue — elle ne se ferme pas.
 *
 * Un défaut n'est pas un essai (MANIPULATION_CONTRACT §6bis.2) : l'enfant inconnu s'ouvre à la taille
 * de l'enfant connu (aucun item n'a une différence nulle, ce n'est donc jamais une réponse) et rien
 * n'est inscrit dans `trials` avant un relâchement.
 */
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';

const { frac, parseNumber, add, sub, eq, cmp, fracDecimal } = LIN;

/** La toise : graduée de 100 à 150 cm, au centimètre (un nombre tous les 10 cm). */
export const GAUGE = Object.freeze({ min: 100, max: 150 });
/**
 * Le cadre de la scène (cm) : les enfants sont dessinés EN ENTIER, les pieds sur la graduation 0 et le sommet du crâne
 * sur leur taille (2026-10-14 — refonte « Gen Alpha » ; jamais un enfant qui flotte au-dessus du zéro de la toise).
 * Au-dessus de `hi` et sous `lo`, la scène réserve des marges en PIXELS (`GAUGE_PAD`) : la pilule de valeur au-dessus
 * de la tête la plus haute, les pilules de nom sous les pieds.
 */
export const VIEW = Object.freeze({ lo: 0, hi: 150 });
export const GAUGE_PAD = Object.freeze({ top: 44, bottom: 46 });

const OP = { '+': add, '-': sub };

/**
 * Les histoires. Les NOMBRES sont ici, les MOTS dans `lesson.manipulation.json › storyBars.stories.<id>`.
 *   stretch : `known` (l'enfant connu) ; chaque item `{ id, d, sign }` — l'inconnue vaut known + sign·d ;
 *             sign = +1 : l'inconnue est la plus grande (le TOUT) ; −1 : une PARTIE. `trap` : le mot de la
 *             phrase (« تزيد », « تنقص ») dit l'inverse de l'opération.
 *   cards   : chaque item est un texte `{ id, n, parts: [p0, p1], whole, unknown, answer }` ; `unknown` est
 *             'whole', 0 ou 1 (le rôle de l'inconnue dans la bande) ; les nombres sont ceux du manuel.
 *   `discoveryItems` : les items à réussir avant la question (le contraste) ; `refute` : les items de
 *   l'élève qui réfutent les deux conjectures fausses (word : « le mot décide » ; big : « on soustrait
 *   toujours le petit du grand »).
 */
export const STORIES = Object.freeze({
  checkup: Object.freeze({
    mode: 'stretch', discovery: true, unit: 'cm', ref: null,
    known: Object.freeze({ id: 'sara', h: 130 }),
    items: Object.freeze([
      Object.freeze({ id: 'amine', d: 6, sign: 1, trap: false }),
      Object.freeze({ id: 'rim', d: 4, sign: -1, trap: false }),
      Object.freeze({ id: 'nazim', d: 9, sign: -1, trap: true }),
      Object.freeze({ id: 'yassine', d: 5, sign: 1, trap: true }),
    ]),
    discoveryItems: Object.freeze([0, 1, 2]),
    refute: Object.freeze({ word: 2, big: 0 }),
  }),
  method29: Object.freeze({
    mode: 'stretch', discovery: false, unit: 'cm', ref: 'method-3',
    known: Object.freeze({ id: 'akram', h: 124 }),
    items: Object.freeze([
      Object.freeze({ id: 'younes', d: 3, sign: 1, trap: false }),
      Object.freeze({ id: 'mohamed', d: 5, sign: -1, trap: false }),
    ]),
    discoveryItems: Object.freeze([]),
    refute: null,
  }),
  act1: Object.freeze({
    mode: 'cards', discovery: true, unit: null, ref: 'act-1',
    // les six bulles de calcul, dans l'ordre où le manuel les imprime
    cards: Object.freeze(['24,5 + 11,5', '17,5 + 1,5', '17,5 - 1,5', '31,02 - 22,60', '31,02 + 22,60', '24,5 - 11,5']),
    items: Object.freeze([
      Object.freeze({ id: 't1', n: 1, parts: ['24,5', '11,5'], whole: null, unknown: 'whole', answer: '36' }),
      Object.freeze({ id: 't2', n: 2, parts: ['11,5', null], whole: '24,5', unknown: 1, answer: '13' }),
      Object.freeze({ id: 't3', n: 3, parts: [null, '1,5'], whole: '17,5', unknown: 0, answer: '16' }),
      Object.freeze({ id: 't4', n: 4, parts: ['17,5', '1,5'], whole: null, unknown: 'whole', answer: '19' }),
      Object.freeze({ id: 't5', n: 5, parts: ['31,02', '22,60'], whole: null, unknown: 'whole', answer: '53,62' }),
      Object.freeze({ id: 't6', n: 6, parts: ['22,60', null], whole: '31,02', unknown: 1, answer: '8,42' }),
    ]),
    discoveryItems: Object.freeze([0, 1, 2, 3, 4, 5]),
    refute: Object.freeze({ word: 2, big: 0 }),
  }),
});
export const STORY_IDS = Object.freeze(Object.keys(STORIES));

export function storyOf(id) {
  const st = STORIES[id];
  if (!st) throw new Error(`story-bars: histoire inconnue « ${id} »`);
  return st;
}

/* ── Écriture des nombres (virgule décimale, signe moins typographique) ───────────── */

/** Un nombre exact écrit comme le manuel : « 8,42 », « 136 », « -124 ». */
export function dec(p) {
  const f = typeof p === 'object' ? p : parseNumber(p);
  return fracDecimal(f, 3) ?? LIN.fracText(f);
}
const MINUS = '−';
/** « 130 + 6 », « 31,02 − 22,60 » (l'opérande tel qu'écrit, le signe moins U+2212). */
export const calcText = (c) => `${c.a} ${c.op === '-' ? MINUS : '+'} ${c.b}`;
/** Une carte du manuel « 24,5 + 11,5 » → { a, op, b }. */
function parseCalc(src) {
  const m = String(src).trim().match(/^(\S+)\s*([+\-−])\s*(\S+)$/);
  if (!m) throw new Error(`story-bars: calcul illisible « ${src} »`);
  return { a: m[1], op: m[2] === '+' ? '+' : '-', b: m[3] };
}
/** La valeur EXACTE d'un calcul (une fraction de linear.js). */
export const calcValue = (c) => OP[c.op](parseNumber(c.a), parseNumber(c.b));

/* ── Les réponses ─────────────────────────────────────────────────────────────────── */

/** La réponse exacte de l'item i. stretch : known + sign·d ; cards : la réponse du manuel. */
export function answerOf(id, i) {
  const st = storyOf(id);
  const it = st.items[i];
  if (st.mode === 'stretch') return frac(st.known.h + it.sign * it.d);
  return parseNumber(it.answer);
}

/** La réponse RECALCULÉE depuis la structure de la bande (le tout = somme des parties). */
export function answerFromStructure(id, i) {
  const st = storyOf(id);
  const it = st.items[i];
  if (st.mode === 'stretch') return it.sign > 0 ? add(st.known.h, it.d) : sub(st.known.h, it.d);
  if (it.unknown === 'whole') return add(parseNumber(it.parts[0]), parseNumber(it.parts[1]));
  return sub(parseNumber(it.whole), parseNumber(it.parts[1 - it.unknown]));
}

/** L'inconnue est-elle le TOUT (on additionne) ou une PARTIE (on soustrait) ? */
export function unknownIsWhole(id, i) {
  const st = storyOf(id);
  const it = st.items[i];
  return st.mode === 'stretch' ? it.sign > 0 : it.unknown === 'whole';
}

/* ── La bande d'un item, pour une valeur donnée de l'inconnue ─────────────────────── */

/**
 * Les rôles de la bande de l'item i quand l'inconnue vaut `value` (une fraction, ou null : pas encore
 * posée). Les valeurs sont des textes à virgule (ArcTape les lit) ; la vue ajoute les mots.
 *   { parts: [{ role, value, unknown }], whole: { role, value, unknown }, closed }
 * `role` nomme la quantité : stretch → 'known' | 'unknown' | 'diff' ; cards → 'p0' | 'p1' | 'whole'.
 * `closed` est jugé EXACTEMENT (les parties font le tout), jamais par ArcTape.
 */
export function tapeOf(id, i, value) {
  const st = storyOf(id);
  const it = st.items[i];
  const v = value == null ? null : (typeof value === 'object' ? value : parseNumber(value));
  const show = (p) => (p == null ? null : dec(p));
  if (st.mode === 'stretch') {
    const known = { role: 'known', value: show(frac(st.known.h)), unknown: false };
    const unk = { role: 'unknown', value: show(v), unknown: true };
    const diff = { role: 'diff', value: show(frac(it.d)), unknown: false };
    const parts = it.sign > 0 ? [known, diff] : [unk, diff];
    const whole = it.sign > 0 ? unk : known;
    const closed = v != null && eq(add(parseNumber(parts[0].value), parseNumber(parts[1].value)), parseNumber(whole.value));
    return { parts, whole, closed };
  }
  const parts = it.parts.map((p, k) => (it.unknown === k
    ? { role: `p${k}`, value: show(v), unknown: true }
    : { role: `p${k}`, value: p, unknown: false }));
  const whole = it.unknown === 'whole' ? { role: 'whole', value: show(v), unknown: true } : { role: 'whole', value: it.whole, unknown: false };
  const closed = v != null && eq(add(parseNumber(parts[0].value), parseNumber(parts[1].value)), parseNumber(whole.value));
  return { parts, whole, closed };
}

/* ── État ─────────────────────────────────────────────────────────────────────────── */

const put = (s, patch) => Object.freeze({ ...s, ...patch });

/** Le défaut d'un item stretch : la taille de l'enfant connu (jamais une réponse : d > 0 partout). */
const defaultHeight = (id) => storyOf(id).known.h;

export function init(id) {
  const st = storyOf(id);
  if (st.mode === 'stretch') {
    return Object.freeze({
      story: id, mode: 'stretch', cur: 0,
      items: st.items.map(() => Object.freeze({ h: defaultHeight(id), stretchOk: false, calcOk: false, ghost: null })),
      trials: [], last: null,
    });
  }
  return Object.freeze({
    story: id, mode: 'cards',
    slots: st.items.map(() => Object.freeze({ matched: null, tried: null })),
    trials: [], last: null,
  });
}
/** « إعادة » : tout recommencer, mémoire des essais comprise. */
export const reset = (s) => init(s.story);
/** « أعِد التجربة » (questions du labo) : l'item en cours repart de zéro (stretch) ; en mode cartes, la scène entière (une seule suite). */
export function retryItem(s) {
  if (s.mode !== 'stretch') return init(s.story);
  return put(s, { items: withItem(s, s.cur, { h: defaultHeight(s.story), stretchOk: false, calcOk: false, ghost: null }), last: null });
}

/* ── Mode stretch ─────────────────────────────────────────────────────────────────── */

const withItem = (s, i, patch) => s.items.map((it, k) => (k === i ? Object.freeze({ ...it, ...patch }) : it));
const clampH = (h) => Math.max(GAUGE.min, Math.min(GAUGE.max, Math.round(h)));

/**
 * Le verdict EXACT d'une taille h (cm) pour l'item i :
 *   ok      la phrase est vraie ;
 *   equal   les deux enfants ont la même taille (aucune différence) ;
 *   mirror  la bonne différence, mais du mauvais côté (« تزيد » lu comme une addition) ;
 *   side    du mauvais côté, une autre différence ;
 *   gap     du bon côté, une autre différence.
 */
export function judgeHeight(id, i, h) {
  const st = storyOf(id);
  const it = st.items[i];
  const H = frac(h);
  const known = frac(st.known.h);
  const target = answerOf(id, i);
  const side = cmp(H, known); // +1 : l'inconnu est plus grand
  const diff = Math.abs(h - st.known.h);
  const base = { h, known: st.known.h, d: it.d, diff, taller: side > 0 };
  if (eq(H, target)) return { ...base, ok: true, kind: 'ok' };
  if (side === 0) return { ...base, ok: false, kind: 'equal' };
  if (side !== it.sign) return { ...base, ok: false, kind: diff === it.d ? 'mirror' : 'side' };
  return { ...base, ok: false, kind: 'gap' };
}

/** Pendant le geste : la taille suit le doigt (pas un essai). Refusé une fois la phrase vraie. */
export function setHeight(s, h) {
  const it = s.items[s.cur];
  if (it.stretchOk) return it.h === clampH(h) ? s : put(s, { last: { kind: 'locked', item: s.cur } });
  const hh = clampH(h);
  if (hh === it.h) return s;
  return put(s, { items: withItem(s, s.cur, { h: hh, ghost: null }) });
}

/** Le relâchement (ou la pause du clavier) : un ESSAI jugé. */
export function commitHeight(s, h) {
  const i = s.cur;
  const it = s.items[i];
  if (it.stretchOk) return put(s, { last: { kind: 'locked', item: i } });
  const hh = clampH(h);
  const v = judgeHeight(s.story, i, hh);
  const trial = { item: i, kind: 'stretch', value: hh, ok: v.ok, verdict: v.kind };
  return put(s, {
    items: withItem(s, i, { h: hh, stretchOk: v.ok, ghost: null }),
    trials: [...s.trials, trial],
    last: { kind: 'stretch', item: i, verdict: v },
  });
}

/** Les trois cartes de calcul d'un item stretch, dans l'ordre CANONIQUE : a + d, a − d, d − a. */
export function calcCards(id, i) {
  const st = storyOf(id);
  const it = st.items[i];
  const a = String(st.known.h);
  const d = String(it.d);
  return [{ a, op: '+', b: d }, { a, op: '-', b: d }, { a: d, op: '-', b: a }];
}
/** L'index canonique de la bonne carte. */
export const rightCalc = (id, i) => (storyOf(id).items[i].sign > 0 ? 0 : 1);

const PERMS = [[0, 1, 2], [1, 2, 0], [2, 0, 1], [0, 2, 1], [2, 1, 0], [1, 0, 2]];
/** L'ordre AFFICHÉ des cartes : un mélange fixe (le même pour tous les élèves), dépendant des nombres. */
export function calcOrder(id, i) {
  const st = storyOf(id);
  const it = st.items[i];
  return PERMS[(st.known.h + it.d * 7 + i * 5) % PERMS.length];
}

/**
 * Le verdict d'une carte de calcul : ok (sa valeur est la réponse), impossible (on ne peut pas ôter le
 * plus grand du plus petit en 1AM — aucune taille), wrong (une autre taille : le fantôme la montre).
 */
export function judgeCalc(id, i, ci) {
  const c = calcCards(id, i)[ci];
  const value = calcValue(c);
  if (cmp(value, frac(0)) < 0) return { ok: false, kind: 'impossible', calc: c, value };
  if (eq(value, answerOf(id, i))) return { ok: true, kind: 'ok', calc: c, value };
  return { ok: false, kind: 'wrong', calc: c, value, taller: cmp(value, frac(storyOf(id).known.h)) > 0 };
}

/** Choisir une carte : jugée exactement ; la taille qu'elle donne devient la tête fantôme. */
export function chooseCalc(s, ci) {
  const i = s.cur;
  const it = s.items[i];
  if (!it.stretchOk) return put(s, { last: { kind: 'calcFirst', item: i } });
  if (it.calcOk) return put(s, { last: { kind: 'calcDone', item: i } });
  const v = judgeCalc(s.story, i, ci);
  const trial = { item: i, kind: 'calc', value: dec(v.value), ok: v.ok, verdict: v.kind, calc: calcText(v.calc), card: ci };
  const ghost = v.kind === 'impossible' ? null : LIN.toNumber(v.value);
  return put(s, {
    items: withItem(s, i, { calcOk: v.ok, ghost: { ci, h: ghost, ok: v.ok } }),
    trials: [...s.trials, trial],
    last: { kind: 'calc', item: i, verdict: v },
  });
}

export const itemDone = (s, i) => (s.mode === 'stretch' ? s.items[i].stretchOk && s.items[i].calcOk : s.slots[i].matched != null);
/** Le premier item non fait (= le nombre d'items faits quand ils sont faits dans l'ordre). */
export const firstUndone = (s) => {
  const n = s.mode === 'stretch' ? s.items.length : s.slots.length;
  for (let i = 0; i < n; i += 1) if (!itemDone(s, i)) return i;
  return n;
};
/** Aller à un item : seulement un item fait ou le premier non fait (les items vont dans l'ordre). */
export function goTo(s, i) {
  if (s.mode !== 'stretch' || i < 0 || i >= s.items.length || i > firstUndone(s) || i === s.cur) return s;
  return put(s, { cur: i, last: null });
}
/** L'item suivant (après une bande fermée). */
export const next = (s) => goTo(s, Math.min(firstUndone(s), s.items.length - 1));

/* ── Mode cards ───────────────────────────────────────────────────────────────────── */

export const cardsOf = (id) => storyOf(id).cards.map(parseCalc);
export const cardValue = (id, c) => calcValue(cardsOf(id)[c]);
export const isPlaced = (s, c) => s.slots.some((sl) => sl.matched === c);

/**
 * La carte c sur le texte t : true quand sa valeur EST la réponse du texte ; '' (refus muet) quand le
 * geste n'a pas de sens (texte déjà résolu, carte déjà posée) ; sinon le type du refus :
 *   'operation'  les deux nombres du texte, l'autre opération (le piège) ;
 *   'numbers'    les nombres d'un autre texte.
 */
export function canPlace(s, c, t) {
  if (s.slots[t].matched != null || isPlaced(s, c)) return '';
  const card = cardsOf(s.story)[c];
  if (eq(calcValue(card), answerOf(s.story, t))) return true;
  return refusalKind(s.story, c, t);
}

/** Le refus d'une carte sur un texte : mêmes nombres (autre opération) ou autres nombres. */
function refusalKind(id, c, t) {
  const card = cardsOf(id)[c];
  const it = storyOf(id).items[t];
  const nums = [...it.parts, it.whole].filter((x) => x != null).map((x) => parseNumber(x));
  const mine = [card.a, card.b].map((x) => parseNumber(x));
  return mine.every((m) => nums.some((n) => eq(n, m))) ? 'operation' : 'numbers';
}

/** Poser (accepté) ou essayer (refusé) une carte : toujours un ESSAI noté. */
export function placeCard(s, c, t) {
  const verdict = canPlace(s, c, t);
  if (verdict === '') return s;
  const card = cardsOf(s.story)[c];
  const value = calcValue(card);
  const ok = verdict === true;
  const trial = { item: t, kind: 'card', value: dec(value), ok, verdict: ok ? 'ok' : verdict, calc: calcText(card), card: c };
  const slots = s.slots.map((sl, k) => (k === t ? Object.freeze(ok ? { matched: c, tried: null } : { ...sl, tried: c }) : sl));
  return put(s, { slots, trials: [...s.trials, trial], last: { kind: 'card', item: t, card: c, ok, verdict: trial.verdict } });
}

/* ── Découverte, fin ──────────────────────────────────────────────────────────────── */

/** Le contraste : les items de `discoveryItems` faits (une addition, une soustraction ET un piège). */
export function discoveryReady(s) {
  const st = storyOf(s.story);
  if (!st.discovery) return false;
  return st.discoveryItems.every((i) => itemDone(s, i));
}
export const allDone = (s) => firstUndone(s) === (s.mode === 'stretch' ? s.items.length : s.slots.length);

/** Le calcul juste d'un item, écrit (« 130 − 9 »), et sa valeur (« 121 ») — pour les réfutations. */
export function rightCalcOf(id, i) {
  const st = storyOf(id);
  if (st.mode === 'stretch') {
    const c = calcCards(id, i)[rightCalc(id, i)];
    return { calc: calcText(c), value: dec(calcValue(c)) };
  }
  const cards = cardsOf(id);
  const c = cards.findIndex((card) => eq(calcValue(card), answerOf(id, i)));
  return { calc: calcText(cards[c]), value: dec(calcValue(cards[c])), card: c };
}

/** La ligne formelle d'un item fait : « □ = 130 + 6 = 136 ». */
export function formalLine(id, i) {
  const r = rightCalcOf(id, i);
  return `□ = ${r.calc} = ${r.value}`;
}

/** Ce que la leçon reçoit pour un essai (`onTrial`). */
export function trialEvidence(s, trial) {
  const st = storyOf(s.story);
  const out = { story: s.story, item: st.items[trial.item].id, kind: trial.kind, value: trial.value, ok: trial.ok };
  if (trial.calc) out.calc = trial.calc;
  return out;
}

/* ── Géométrie de la toise (px), pure et testée ───────────────────────────────────── */

/**
 * La toise dessinée sur une hauteur `height` (px) : `VIEW.lo` (le sol) à `height − pad.bottom`, `VIEW.hi` à `pad.top` ;
 * la même échelle pour la toise et pour chaque enfant (les tailles sont À L'ÉCHELLE).
 */
export function gaugeScale(height, pad = GAUGE_PAD) {
  const span = VIEW.hi - VIEW.lo;
  const usable = Math.max(1, height - pad.top - pad.bottom);
  const k = usable / span;
  const floor = height - pad.bottom;
  return {
    k,
    floor,
    yOf: (cm) => floor - (cm - VIEW.lo) * k,
    cmAt: (y) => VIEW.lo + (floor - y) / k,
  };
}
/** Une taille (cm entier, bornée à la toise) sous le pointeur. */
export function heightFromY(y, height, pad = GAUGE_PAD) {
  return clampH(gaugeScale(height, pad).cmAt(y));
}
/** Les graduations de la poignée : chaque cm de 100 à 150, un nombre tous les 10 cm. */
export const gaugeTicks = () => Array.from({ length: GAUGE.max - GAUGE.min + 1 }, (_, k) => ({ cm: GAUGE.min + k, major: (GAUGE.min + k) % 10 === 0, mid: (GAUGE.min + k) % 5 === 0 }));
/**
 * Les graduations DESSINÉES de la toise entière (0 → 150) pour une échelle `k` px/cm : un trait par cm quand il y a la
 * place (k ≥ 3), sinon tous les 5 cm ; un nombre tous les 10 cm, ou tous les 20 cm quand 10 cm font moins de 18 px.
 */
export function rulerTicks(k) {
  const step = k >= 3 ? 1 : 5;
  const label = 10 * k >= 18 ? 10 : 20;
  const out = [];
  for (let cm = VIEW.lo; cm <= VIEW.hi; cm += step) out.push({ cm, major: cm % 10 === 0, mid: cm % 5 === 0, label: cm % label === 0 });
  return out;
}

/* ── L'onboarding (LabCoach, MANIPULATION_CONTRACT §8quater) ─────────────────────────── */

/**
 * Le bouton ou le geste dont la main a besoin MAINTENANT : `{ id, target, gesture }` (target = un sélecteur du contrat
 * DOM) ou `null` (tout est fait). Il montre la poignée / la rangée de cartes / le bouton « suivant », JAMAIS la taille,
 * la carte juste ni l'opération : choisir reste à l'élève.
 *   stretch : la poignée → les cartes de calcul → « التلميذ التالي » ;
 *   cards   : une carte (premier essai seulement : le glisser ou le toucher-toucher ensuite se connaît).
 */
export function coachOf(s) {
  if (allDone(s)) return null;
  if (s.mode === 'stretch') {
    const it = s.items[s.cur];
    if (!it.stretchOk) return { id: 'handle', target: '[data-sb-handle]', gesture: 'drag' };
    if (!it.calcOk) return { id: 'calc', target: '[data-sb-calcs]', gesture: 'tap' };
    return { id: 'next', target: '[data-sb-next]', gesture: 'tap' };
  }
  if (s.trials.length > 0) return null;
  const c = cardsOf(s.story).findIndex((_, ci) => !isPlaced(s, ci));
  return c < 0 ? null : { id: 'card', target: `[data-sb-card="${c}"]`, gesture: 'drag' };
}
