import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as Pr from '@smarter-academy/core/arithmetic/proportional.js';

/**
 * linear-machine — LA MACHINE À RÈGLE CACHÉE (unité 6 « الدالة الخطية والتناسبية », leçon 2
 * « مفهوم وتعيين الدالة الخطية »).
 *
 * Les règles s'écrivent comme le manuel, séparées par « | » : « 0,8x » (نشاط 1 corrigé : la remise
 * de 20 % de l'Aïd), « x^2|2x|2x-1 » (نشاط 2). Elles sont lues par `proportional.rule` — AUCUNE
 * arithmétique n'est refaite ici : image (`rule.at`), coefficient depuis un couple
 * (`proportional.coefficientFrom`), antécédent (`proportional.antecedent`), témoins de non-linéarité
 * (`proportional.linearityWitnesses`), tableau de proportionnalité (`proportional.tableRatios`).
 *
 * Ce module ne fait que l'INTERACTION :
 *   - l'élève NOURRIT la machine de cartes de son choix : chaque carte donne un ESSAI (x ; f(x)) de SA
 *     table (une carte déjà essayée ne refait rien) ;
 *   - il règle le cadran a d'une machine-TÉMOIN (x ⟼ a·x), ou y POSE un couple de sa table : un couple
 *     (m ; f(m)) avec m ≠ 0 fixe a = f(m) ÷ m ; le couple (0 ; 0) est REFUSÉ — « 0 ⟼ 0 pour tout a » ;
 *   - il AFFIRME « f(x) = a·x » : refusé avec un TÉMOIN (une colonne de sa table où a·x ≠ f(x) ; à
 *     défaut la machine en donne un : f(0) ≠ 0 ou f(2m) ≠ 2·f(m)) ; ou « cette machine n'est pas
 *     linéaire » : refusé tant que sa table ne contient pas de témoin (f(0) ≠ 0, ou deux rapports
 *     f(x) ÷ x différents) ;
 *   - il fait tourner la machine À L'ENVERS : il cherche (carte vierge) le nombre dont l'image est une
 *     étiquette-cible (f(x) = 6 → x = 7,5) ; 120 n'est pas une carte : f(120) reste à calculer (س 2).
 *
 * La découverte (contraste, MANIPULATION_DNA §3.6) : une machine — la machine linéaire reconnue
 * avec au moins deux couples non nuls (son a est le même rapport partout) ; plusieurs machines —
 * chacune classée (une linéaire, les autres réfutées par un témoin de l'élève).
 */

const F = (v) => (typeof v === 'object' && v !== null ? v : Number.isInteger(v) ? Lin.frac(v) : Lin.parseNumber(v));
const same = (p, q) => Lin.eq(F(p), F(q));

/**
 * Les cartes par défaut (la carte vierge s'y ajoute : 8 + 1 = 3 × 3, 11 + 1 = 4 × 3) : les prix du نشاط 1
 * (50 → 200), quelques autres, 1 (son image est a) et 0.
 */
const DECKS = Object.freeze({
  souk: Object.freeze(['50', '100', '150', '200', '10', '25', '1', '0']),
  // Les nombres des trois tableaux du نشاط 2 (−3 … 4,5), 0 compris.
  numbers: Object.freeze(['-3', '-2', '-1', '0', '0,5', '1', '1,5', '2', '2,5', '3', '4,5']),
});

/** Le cadran a de la machine-témoin : une graduation (en dixièmes ou en moitiés). */
export const DIALS = Object.freeze({
  souk: Object.freeze({ min: 0, max: 20, step: '0,1' }), // a de 0 à 2 par 0,1
  numbers: Object.freeze({ min: -6, max: 10, step: '0,5' }), // a de −3 à 5 par 0,5
});

/** La graduation de la marche arrière (souk) : x de 0 à 10 par 0,25. */
export const REVERSE = Object.freeze({ min: 0, max: 40, step: '0,25' });
/** La carte vierge que l'élève étire : x de 0 à 10 par 0,25 (souk), de −4 à 6 par 0,5 (nombres). */
export const BLANKS = Object.freeze({ souk: REVERSE, numbers: Object.freeze({ min: -8, max: 12, step: '0,5' }) });

export const dialValue = (dial, i) => Lin.mul(F(dial.step), i);
/** L'indice de graduation le plus proche d'une valeur (borné) — la poignée ; la valeur reste exacte. */
export function dialIndex(dial, a) {
  const i = Math.round(Lin.toNumber(Lin.div(F(a), F(dial.step))));
  return Math.min(dial.max, Math.max(dial.min, i));
}

/** « 0,8x|2x » → les machines (règles lues par core). */
function parseRules(rules) {
  const src = String(rules).split('|').map((s) => s.trim()).filter(Boolean);
  if (src.length === 0) throw new Error('linear-machine: aucune règle');
  return src.map((s) => Pr.rule(s));
}

/**
 * L'état initial. `world` : « souk » (une machine, des étiquettes de prix) ou « numbers »
 * (plusieurs machines, des nombres relatifs) — lu sur le NOMBRE de machines, jamais deviné.
 */
export function init({ rules, cards, targets } = {}) {
  const parsed = parseRules(rules ?? '0,8x');
  const world = parsed.length === 1 ? 'souk' : 'numbers';
  const deck = (cards ? String(cards).split('|') : DECKS[world]).map((c) => F(c.trim()));
  return {
    rules: String(rules ?? '0,8x'),
    world,
    dial: DIALS[world],
    deck,
    targets: (targets ? String(targets).split('|') : []).map((t) => F(t.trim())),
    machines: parsed.map((rule, i) => ({ id: i, rule, trials: [], a: null, verdict: null })),
    current: 0,
    last: null,
    reverse: { hits: [] },
  };
}

const cur = (s) => s.machines[s.current];
const withMachine = (s, m, last) => ({ ...s, machines: s.machines.map((x) => (x.id === m.id ? m : x)), last });

/** Choisir la machine sur laquelle on travaille (plusieurs machines). */
export function select(s, i) {
  if (i < 0 || i >= s.machines.length || i === s.current) return s;
  return { ...s, current: i, last: null };
}

/** Ajoute un essai (x ; f(x)) à la table d'une machine ; trié par x ; un x déjà essayé ne change rien. */
function addTrial(m, x, by) {
  if (m.trials.some((t) => same(t.x, x))) return { m, fresh: false };
  const t = Object.freeze({ x: F(x), fx: m.rule.at(F(x)), by });
  const trials = [...m.trials, t].sort((p, q) => Lin.cmp(p.x, q.x));
  return { m: { ...m, trials }, fresh: true, t };
}

/** Une carte dans la trémie : la machine calcule son image. */
export function feed(s, x) {
  const m = cur(s);
  const r = addTrial(m, x, 'student');
  const t = r.t ?? m.trials.find((u) => same(u.x, x));
  const { s: s2, hit } = markTarget(s, t);
  return withMachine(s2, r.m, { kind: r.fresh ? 'fed' : 'again', x: t.x, fx: t.fx, hit });
}

/** Le cadran tourné à la main (valeur exacte). */
export function setDial(s, a) {
  const m = cur(s);
  return withMachine(s, { ...m, a: F(a) }, { kind: 'dial', a: F(a) });
}

/** Un couple (m ; f(m)) peut-il fixer a ? true, ou la raison du refus. */
export function canFixFrom(x) {
  return Lin.isZero(F(x)) ? 'zero' : true;
}

/** Le couple de la table posé sur le cadran : a = f(m) ÷ m ; le couple (0 ; f(0)) ne fixe rien. */
export function fixFrom(s, x) {
  const m = cur(s);
  const t = m.trials.find((u) => same(u.x, x));
  if (!t) return s;
  if (canFixFrom(t.x) !== true) return withMachine(s, m, { kind: 'zeroFixesNothing', x: t.x, fx: t.fx });
  const a = Pr.coefficientFrom(t.x, t.fx);
  return withMachine(s, { ...m, a }, { kind: 'fixed', x: t.x, fx: t.fx, a });
}


/** Le témoin, PRIS DANS LA TABLE de l'élève, que la machine n'est pas linéaire (ou null). */
export function witnessInTrials(trials) {
  const z = trials.find((t) => Lin.isZero(t.x) && !Lin.isZero(t.fx));
  if (z) return { kind: 'zero', x: z.x, fx: z.fx };
  const nz = trials.filter((t) => !Lin.isZero(t.x));
  for (let i = 0; i < nz.length; i += 1) {
    for (let j = i + 1; j < nz.length; j += 1) {
      const { proportional } = Pr.tableRatios([nz[i].x, nz[j].x], [nz[i].fx, nz[j].fx]);
      if (!proportional) {
        const doubled = same(nz[j].x, Lin.mul(nz[i].x, 2)) ? 'double' : same(nz[i].x, Lin.mul(nz[j].x, 2)) ? 'double' : 'ratio';
        return { kind: doubled, p: nz[i], q: nz[j], r1: Pr.ratio(nz[i].x, nz[i].fx), r2: Pr.ratio(nz[j].x, nz[j].fx) };
      }
    }
  }
  return null;
}

/**
 * « f(x) = a·x » affirmé. Accepté ⇔ la règle EST x ⟼ a·x pour ce a. Sinon le refus porte un témoin :
 * une colonne de la table où a·x ≠ f(x) ; s'il n'y en a pas, la machine en ajoute une (f(0) ≠ 0,
 * le double d'une entrée, ou 1) — c'est la machine qui résiste, jamais un rouge muet.
 */
export function claimLinear(s) {
  const m = cur(s);
  if (m.trials.length === 0) return { ...s, last: { kind: 'needTrial' } };
  if (m.a == null) return { ...s, last: { kind: 'needDial' } };
  if (Pr.isLinear(m.rule) && same(m.rule.a, m.a)) {
    return withMachine(s, { ...m, verdict: { kind: 'linear', a: m.a } }, { kind: 'acceptedLinear', a: m.a });
  }
  const bad = m.trials.find((t) => !same(Pr.image(m.a, t.x), t.fx));
  if (bad) return withMachine(s, m, { kind: 'refusedLinear', a: m.a, x: bad.x, fx: bad.fx, ax: Pr.image(m.a, bad.x), byMachine: false });
  // Aucune colonne ne contredit a : la machine produit son témoin.
  let wx = null;
  if (!Lin.isZero(m.rule.at(0)) && !m.trials.some((t) => Lin.isZero(t.x))) wx = Lin.frac(0);
  if (wx == null) {
    const base = m.trials.find((t) => !Lin.isZero(t.x))?.x ?? Lin.frac(1);
    const cands = [Lin.mul(base, 2), Lin.frac(1), Lin.frac(2), Lin.frac(3), Lin.frac(4), Lin.frac(0)];
    wx = cands.find((c) => !m.trials.some((t) => same(t.x, c)) && !same(Pr.image(m.a, c), m.rule.at(c)));
  }
  if (wx == null) return { ...s, last: { kind: 'needTrial' } };
  const r = addTrial(m, wx, 'machine');
  return withMachine(s, r.m, { kind: 'refusedLinear', a: m.a, x: r.t.x, fx: r.t.fx, ax: Pr.image(m.a, r.t.x), byMachine: true });
}

/** « Cette machine n'est pas linéaire » : accepté avec le témoin de la table ; refusé sans témoin. */
export function claimNotLinear(s) {
  const m = cur(s);
  if (m.trials.length === 0) return { ...s, last: { kind: 'needTrial' } };
  const w = witnessInTrials(m.trials);
  if (Pr.isLinear(m.rule)) return withMachine(s, m, { kind: 'refusedNot', nonZero: m.trials.filter((t) => !Lin.isZero(t.x)).length });
  if (!w) return withMachine(s, m, { kind: 'needWitness' });
  return withMachine(s, { ...m, verdict: { kind: 'notLinear', witness: w } }, { kind: 'acceptedNot', witness: w });
}

/* ── La marche arrière (souk) : quel prix donne cette étiquette ? ─────────────────────── */

/**
 * Les étiquettes-cibles (`targets`, « 6|1,4 ») : la machine doit les PRODUIRE. L'élève cherche l'entrée
 * (carte vierge étirée, ou calcul x = t ÷ a) ; une sortie égale à une cible la marque atteinte — sans
 * changer de scène (la marche arrière du نشاط 1 se fait dans le même laboratoire).
 */
function markTarget(s, t) {
  const hit = s.targets.find((g) => same(g, t.fx));
  if (!hit || s.reverse.hits.some((h) => same(h.target, hit))) return { s, hit: null };
  return { s: { ...s, reverse: { ...s.reverse, hits: [...s.reverse.hits, { target: hit, x: t.x }] } }, hit };
}

/* ── Les questions pendant le labo (2026-10-28, lot 5) ───────────────────────────────── */

/** Les essais de l'ÉLÈVE avec une entrée non nulle (la machine en ajoute elle-même pour réfuter : ils ne comptent pas). */
export const studentNonZero = (m) => m.trials.filter((t) => t.by === 'student' && !Lin.isZero(t.x));
/** Monde « souk » : l'étape « nourrir » est atteinte quand deux cartes non nulles sont passées dans la machine. */
export const feedReached = (s) => studentNonZero(s.machines[0]).length >= 2;
/** « أعِد التجربة » sur l'affirmation : la machine courante reprend sans verdict (sa table est gardée). */
export const reopen = (s) => withMachine(s, { ...cur(s), verdict: null }, null);

/** Le nombre dont l'image est t (affichage de la ligne écrite x = t ÷ a). */
export const antecedentOf = (s, t) => Pr.antecedent(cur(s).rule.a, t);

/* ── La découverte ─────────────────────────────────────────────────────────────────────── */

export function discoveryReady(s) {
  if (s.machines.length === 1) {
    const m = s.machines[0];
    return m.verdict?.kind === 'linear' && m.trials.filter((t) => !Lin.isZero(t.x)).length >= 2;
  }
  return s.machines.every((m) => m.verdict) && s.machines.some((m) => m.verdict.kind === 'linear');
}

/** Deux couples non nuls d'une machine (pour réfuter « une remise fixe » par la table de l'élève). */
export function twoNonZero(m) {
  const nz = m.trials.filter((t) => !Lin.isZero(t.x));
  return nz.length >= 2 ? [nz[0], nz[nz.length - 1]] : null;
}

/** Une machine non linéaire avec f(0) = 0 (x² au نشاط 2) : réfute « f(0) = 0 suffit ». */
export function zeroButNotLinear(s) {
  const m = s.machines.find((u) => !Pr.isLinear(u.rule) && Lin.isZero(u.rule.at(0)));
  if (!m) return null;
  return { machine: m.id, f1: m.rule.at(1), f2: m.rule.at(2) };
}

/** Une machine non linéaire avec f(0) ≠ 0 (2x − 1) : son f(0). */
export function zeroNotZero(s) {
  const m = s.machines.find((u) => !Lin.isZero(u.rule.at(0)));
  return m ? { machine: m.id, f0: m.rule.at(0) } : null;
}

/* ── L'écriture (affichage seulement) ──────────────────────────────────────────────────── */

/** Un nombre écrit comme le manuel : 0,8 · −3 · \dfrac{5}{3} (LaTeX). */
export function numTex(p) {
  const d = Lin.fracDecimal(F(p));
  if (d != null) return d.replace(',', '{,}');
  return Lin.fracLatex(F(p));
}
/** Un nombre écrit en texte (DOM) : « 0,8 », « −3 », « 5/3 ». */
export function numText(p) {
  const d = Lin.fracDecimal(F(p));
  return (d ?? Lin.fracText(F(p))).replace('-', '−');
}
/** Un facteur entre parenthèses s'il est négatif : 0{,}8 \times (-3). */
export const factorTex = (p) => (Lin.cmp(F(p), 0) < 0 ? `(${numTex(p)})` : numTex(p));

/** La règle d'une machine écrite x ⟼ … (formel seulement : la règle reste cachée avant). */
export function ruleTex(rule) {
  if (rule.kind === 'square') return 'x^2';
  const a = Lin.eq(rule.a, 1) ? '' : Lin.eq(rule.a, -1) ? '-' : numTex(rule.a);
  if (Lin.isZero(rule.b)) return `${a}x`;
  return `${a}x ${Lin.cmp(rule.b, 0) < 0 ? '-' : '+'} ${numTex(Lin.cmp(rule.b, 0) < 0 ? Lin.neg(rule.b) : rule.b)}`;
}

/** « a·x » écrit pour un a donné : 0{,}8x, -3x, x. */
export function axTex(a) {
  if (Lin.eq(F(a), 1)) return 'x';
  if (Lin.eq(F(a), -1)) return '-x';
  return `${numTex(a)}x`;
}

/** Les colonnes à montrer dans une largeur donnée : les plus récentes, gardées dans l'ordre des x. */
export function visibleColumns(trials, maxCols) {
  if (trials.length <= maxCols) return trials;
  return trials.slice(-Math.max(1, maxCols));
}

/**
 * Le paquet de cartes en BLOC QUASI CARRÉ (MANIPULATION_CONTRACT §8bis) : cols ≈ ⌈√n⌉, ajusté pour
 * que chaque carte garde 44 px de large dans la largeur donnée.
 */
export function deckGrid(n, width, { minCell = 44, gap = 6 } = {}) {
  let cols = Math.max(1, Math.ceil(Math.sqrt(n)));
  while (cols > 1 && cols * minCell + (cols - 1) * gap > width) cols -= 1;
  const rows = Math.ceil(n / cols);
  const cell = Math.max(minCell, Math.floor((width - (cols - 1) * gap) / cols));
  return { cols, rows, cell: Math.min(cell, 76) };
}

/* ── Valeurs PAR DÉFAUT (2026-10-09) : jamais une réponse, jamais un essai ───────────────── */

/**
 * L'indice par défaut du cadran a : la graduation de a = 1 (la plus « naturelle »), sauf si c'est
 * le coefficient CACHÉ de la machine courante (ce serait donner la réponse) — alors la suivante.
 */
export function defaultDialIndex(s) {
  const m = cur(s);
  const hidden = Pr.isLinear(m.rule) ? m.rule.a : null;
  let i = Math.min(s.dial.max, Math.max(s.dial.min, dialIndex(s.dial, 1)));
  while (hidden != null && same(dialValue(s.dial, i), hidden) && i < s.dial.max) i += 1;
  if (hidden != null && same(dialValue(s.dial, i), hidden)) i = Math.max(s.dial.min, i - 2);
  return i;
}

/**
 * L'indice par défaut de la carte vierge : x = 2, sauf si sa sortie est une étiquette-cible (la
 * marche arrière serait résolue d'avance) — alors la graduation suivante.
 */
export function defaultBlankIndex(s) {
  const dial = BLANKS[s.world];
  const m = cur(s);
  const bad = (i) => s.targets.some((g) => same(g, m.rule.at(dialValue(dial, i))));
  let i = Math.min(dial.max, Math.max(dial.min, dialIndex(dial, 2)));
  while (bad(i) && i < dial.max) i += 1;
  return i;
}
