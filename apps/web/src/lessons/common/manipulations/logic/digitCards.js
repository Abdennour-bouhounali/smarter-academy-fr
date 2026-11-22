/**
 * digit-cards — la logique PURE des critères de divisibilité (1AM, unité 3 « الضرب والقسمة », درس « قواعد قابلية
 * القسمة », manuel نشاط 4 pp. 37–38, معارف 3 p. 41, طريقة p. 42, تمرين 26 p. 46). Aucun React ici ; toute
 * l'arithmétique est ENTIÈRE et passe par `divmod` (`@smarter-academy/core/arithmetic/divisibility.js`, importé par
 * chemin — jamais le barrel du core).
 *
 * Chaque verdict est le RESTE euclidien, écrit `n = d × q + r` : la logique ne contient AUCUN critère (ni chiffre des
 * unités, ni somme des chiffres) pour JUGER — les critères sont ce que l'élève découvre. Les seules lectures de
 * chiffres (`unitsDigit`, `digitSum`) servent au registre (la matière de la conjecture) et aux réfutations.
 *
 * Deux modes :
 *   grid   la table 0 → 48 en 7 colonnes (نشاط 4). Trois coloriages dans l'ordre (2 rouge, 5 bleu, 3 vert) ;
 *          toucher une case = « c'est un multiple de d » : acceptée si r = 0, refusée sinon avec sa division.
 *          « أكمل » révèle les multiples oubliés, seulement après 5 cases coloriées à la main (REVEAL_AFTER).
 *          discoveryReady = les trois coloriages complets.
 *   cards  les cartes 4, 5, 9, 3 (تمرين 26) portées dans quatre cases ; cinq lampes (2, 3, 5, 4, 9) FERMÉES
 *          que l'élève ouvre par une affirmation « يقبل / لا يقبل » jugée ; une lampe ouverte reste ouverte et
 *          est re-jugée à chaque nouveau nombre (`flips` : gardée / basculée). Cibles du manuel : le plus grand
 *          nombre divisible par 2, 3, 5 (9534, 9543, 9435), et « لا يوجد » pour 4 et 9.
 *          discoveryReady = les cibles atteignables atteintes + UN échange qui a gardé le verdict de 3 et
 *          basculé celui de 2 (lampes 2 et 3 ouvertes).
 *
 *     let s = initCards({ digits: [4, 5, 9, 3], divisors: [2, 3, 5, 4, 9] });
 *     s = placeCard(s, 2, 0); …                       // 9 5 3 4
 *     s = claim(s, 2, true);                          // 9534 = 2 × 4767 + 0 : la lampe 2 s'ouvre
 *     s = moveSlot(s, 2, 3);                          // échange : 9543 — 3 gardée, 2 basculée
 */
import { divmod } from '@smarter-academy/core/arithmetic/divisibility.js';

export const MODES = Object.freeze(['grid', 'cards']);

/** Les couleurs du manuel (rouge ÷2, bleu ÷5, vert ÷3) ; 4 et 9 en ont une à eux si une leçon les colorie. */
export const COLOURS = Object.freeze({ 2: 'red', 5: 'blue', 3: 'green', 4: 'amber', 9: 'violet' });
export const colourOf = (d) => COLOURS[d] ?? 'slate';

/** « أكمل » ne s'offre qu'après ce nombre de cases coloriées À LA MAIN pour le coloriage ouvert. */
export const REVEAL_AFTER = 5;

const put = (s, patch) => Object.freeze({ ...s, ...patch });
const freezeMap = (o) => Object.freeze(Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Object.freeze(v)])));

/* ── Arithmétique (le reste décide, toujours) ────────────────────────────────────── */

/** La division euclidienne de n par d : { n, d, q, r, divides }. */
export function division(n, d) {
  const { q, r } = divmod(n, d);
  return { n, d, q, r, divides: r === 0 };
}
/** « 42 = 3 × 14 » (r = 0) ou « 21 = 2 × 10 + 1 ». */
export function equationText(n, d) {
  const { q, r } = divmod(n, d);
  return r === 0 ? `${n} = ${d} × ${q}` : `${n} = ${d} × ${q} + ${r}`;
}
/** Toujours avec le reste : « 42 = 3 × 14 + 0 » (la ligne formelle « الباقي معدوم »). */
export function equationWithRemainder(n, d) {
  const { q, r } = divmod(n, d);
  return `${n} = ${d} × ${q} + ${r}`;
}
/** Les chiffres d'un entier naturel, du plus fort au plus faible. */
export function digitsOf(n) {
  const out = [];
  let m = n;
  do { const { q, r } = divmod(m, 10); out.unshift(r); m = q; } while (m > 0);
  return out;
}
export const unitsDigit = (n) => divmod(n, 10).r;
export const digitSum = (n) => digitsOf(n).reduce((s, x) => s + x, 0);

/** Les multiples de d entre from et to (inclus), par le reste. */
export function multiplesOf(d, from, to) {
  const out = [];
  for (let n = from; n <= to; n += 1) if (divmod(n, d).r === 0) out.push(n);
  return out;
}

/* ══════════════ MODE grid — la table du نشاط 4 ══════════════ */

export function initGrid({ from = 0, to = 48, columns = 7, divisors = [2, 5, 3] } = {}) {
  const empty = Object.fromEntries(divisors.map((d) => [d, []]));
  return Object.freeze({
    mode: 'grid', from, to, columns, divisors: Object.freeze([...divisors]),
    active: null,
    found: freezeMap(empty),
    revealed: freezeMap(empty),
    trials: Object.freeze([]),
    last: null,
  });
}

export const cellsOf = (s) => Array.from({ length: s.to - s.from + 1 }, (_, i) => s.from + i);
export const columnOf = (s, n) => divmod(n - s.from, s.columns).r;
export const activeDivisor = (s) => (s.active == null ? null : s.divisors[s.active]);
export const colouredIn = (s, d) => [...(s.found[d] ?? []), ...(s.revealed[d] ?? [])].sort((x, y) => x - y);
export const isColoured = (s, d, n) => (s.found[d] ?? []).includes(n) || (s.revealed[d] ?? []).includes(n);
export const missingOf = (s, d) => multiplesOf(d, s.from, s.to).filter((n) => !isColoured(s, d, n));
export const colouringComplete = (s, d) => missingOf(s, d).length === 0;

/** Un coloriage s'ouvre quand le précédent est complet (l'ordre du manuel) ; un coloriage fini se rouvre pour être revu. */
export const canOpen = (s, i) => i >= 0 && i < s.divisors.length && (i === 0 || colouringComplete(s, s.divisors[i - 1]));
export const openColouring = (s, i) => (canOpen(s, i) && s.active !== i ? put(s, { active: i, last: null }) : s);

/**
 * Toucher la case n = affirmer « n est un multiple de d ». Un ESSAI jugé par le reste : accepté si r = 0 (la case
 * prend la couleur), refusé sinon. Une case déjà coloriée pour d n'est pas un nouvel essai : on remontre sa division.
 */
export function tapCell(s, n) {
  const d = activeDivisor(s);
  if (d == null || n < s.from || n > s.to) return s;
  const div = division(n, d);
  if (isColoured(s, d, n)) return put(s, { last: Object.freeze({ ...div, ok: true, again: true }) });
  const ok = div.r === 0;
  const trial = Object.freeze({ mode: 'grid', n, d, r: div.r, ok });
  const found = ok ? freezeMap({ ...s.found, [d]: [...s.found[d], n].sort((x, y) => x - y) }) : s.found;
  return put(s, { found, trials: Object.freeze([...s.trials, trial]), last: Object.freeze({ ...div, ok }) });
}

/** « أكمل » : seulement après REVEAL_AFTER cases trouvées à la main pour ce d, et s'il en manque. */
export const canReveal = (s) => {
  const d = activeDivisor(s);
  return d != null && (s.found[d] ?? []).length >= REVEAL_AFTER && !colouringComplete(s, d);
};
export function reveal(s) {
  if (!canReveal(s)) return s;
  const d = activeDivisor(s);
  return put(s, { revealed: freezeMap({ ...s.revealed, [d]: [...s.revealed[d], ...missingOf(s, d)].sort((x, y) => x - y) }), last: null });
}

/**
 * Le registre (la matière de la conjecture, jamais la règle) : pour les cases coloriées en d, les chiffres des
 * unités qu'on y lit (distincts, triés) ; et leurs SOMMES de chiffres quand d n'est ni 2 ni 5 (le coloriage de 3 :
 * ses chiffres des unités sont tous là — 0 à 9 — et c'est la somme qui se répète).
 */
export function ledger(s, d) {
  const cells = colouredIn(s, d);
  const units = [...new Set(cells.map(unitsDigit))].sort((x, y) => x - y);
  const sums = d === 2 || d === 5 ? null : [...new Set(cells.map(digitSum))].sort((x, y) => x - y);
  return { d, count: cells.length, total: multiplesOf(d, s.from, s.to).length, units, sums };
}

export const gridDiscoveryReady = (s) => s.divisors.every((d) => colouringComplete(s, d));

/** Les cases de l'élève à citer : trouvées à la main d'abord, des plus grandes aux plus petites, 0 en dernier. */
const preferred = (s, d) => {
  const desc = (xs) => [...xs].sort((x, y) => y - x);
  const all = [...desc(s.found[d] ?? []), ...desc(s.revealed[d] ?? [])];
  return [...all.filter((x) => x !== 0), ...all.filter((x) => x === 0)];
};

/**
 * Réfutation de « c'est la COLONNE qui décide » avec les cases de l'élève : un multiple m de d qu'il a colorié et,
 * dans la MÊME colonne (± columns), un nombre qui n'en est pas un. Préférence : d = 2, les cases trouvées à la main.
 */
export function columnRefutation(s) {
  const order = [...s.divisors].sort((x, y) => (x === 2 ? -1 : y === 2 ? 1 : 0));
  for (const d of order) {
    for (const m of preferred(s, d)) {
      for (const o of [m + s.columns, m - s.columns]) {
        if (o >= s.from && o <= s.to && divmod(o, d).r !== 0) return { d, m, n: o, col: columnOf(s, m) + 1 };
      }
    }
  }
  return null;
}

/**
 * Réfutation de « le chiffre des unités décide pour 3 » : un multiple m de 3 colorié par l'élève et un nombre de la
 * table qui a le MÊME chiffre des unités sans être un multiple de 3 (m ± 10, m ± 20).
 */
export function unitsRefutation(s, d = 3) {
  for (const m of preferred(s, d)) {
    for (const o of [m + 10, m - 10, m + 20, m - 20]) {
      if (o >= s.from && o <= s.to && divmod(o, d).r !== 0) return { d, m, n: o, u: unitsDigit(m) };
    }
  }
  return null;
}

/* ══════════════ MODE cards — les cartes du تمرين 26 ══════════════ */

/** Toutes les dispositions DISTINCTES des chiffres (24 pour quatre chiffres distincts), en nombres, triées. */
export function arrangements(digits) {
  const out = new Set();
  const rec = (rest, acc) => {
    if (!rest.length) { out.add(acc.reduce((n, x) => n * 10 + x, 0)); return; }
    rest.forEach((x, i) => rec([...rest.slice(0, i), ...rest.slice(i + 1)], [...acc, x]));
  };
  rec([...digits], []);
  return [...out].sort((x, y) => x - y);
}
/** Les dispositions divisibles par d (par le reste). */
export const validArrangements = (digits, d) => arrangements(digits).filter((n) => divmod(n, d).r === 0);
/** Les restes qu'on peut obtenir en disposant les cartes (un seul pour 9 : la disposition ne change rien). */
export const remaindersOf = (digits, d) => [...new Set(arrangements(digits).map((n) => divmod(n, d).r))].sort((x, y) => x - y);

export function initCards({ digits = [4, 5, 9, 3], divisors = [2, 3, 5, 4, 9] } = {}) {
  return Object.freeze({
    mode: 'cards',
    digits: Object.freeze([...digits]),
    divisors: Object.freeze([...divisors]),
    slots: Object.freeze(digits.map(() => null)),      // l'indice de la carte posée dans chaque case (0 = le chiffre de gauche)
    lamps: Object.freeze({}),                           // d → true : la lampe a été ouverte par une affirmation
    flips: null,                                        // après un changement de nombre : d → 'kept' | 'flipped'
    task: 0,                                            // l'indice (dans divisors) de la cible affichée
    tasks: Object.freeze({}),                           // d → { done, answer | none, remainders? }
    swap: null,                                         // l'échange qui a gardé 3 et basculé 2 : { from, to }
    trials: Object.freeze([]),
    last: null,
  });
}

/** Le nombre formé, ou null si une case est vide. */
export function numberOf(s) {
  if (s.slots.some((c) => c == null)) return null;
  return s.slots.reduce((n, c) => n * 10 + s.digits[c], 0);
}
export const isPlaced = (s, ci) => s.slots.includes(ci);
export const slotOfCard = (s, ci) => s.slots.indexOf(ci);
export const trayOf = (s) => s.digits.map((_, ci) => ci).filter((ci) => !isPlaced(s, ci));

/** La cible a-t-elle une solution avec ces cartes ? (sinon la bonne réponse est « لا يوجد »). */
export const targetPossible = (s, d) => validArrangements(s.digits, d).length > 0;

/** Le verdict d'une lampe pour le nombre affiché : 'closed' (jamais ouverte), 'wait' (nombre incomplet), 'yes', 'no'. */
export function lampState(s, d) {
  if (!s.lamps[d]) return 'closed';
  const n = numberOf(s);
  if (n == null) return 'wait';
  return divmod(n, d).r === 0 ? 'yes' : 'no';
}

/**
 * Un changement des cases. `before` / `after` : les nombres complets avant et après (ou null). Les lampes ouvertes
 * sont re-jugées : `flips[d]` dit si leur verdict a basculé. Un ÉCHANGE (kind 'swap') entre deux nombres complets
 * qui garde le verdict de 3 et bascule celui de 2, lampes 2 et 3 ouvertes, est la preuve d'invariance retenue.
 */
function changeSlots(s, slots, kind) {
  const before = numberOf(s);
  const next = put(s, { slots: Object.freeze(slots) });
  const after = numberOf(next);
  if (before == null || after == null || before === after) return put(next, { flips: null, last: null });
  const flips = {};
  for (const d of s.divisors) {
    if (!s.lamps[d]) continue;
    flips[d] = (divmod(before, d).r === 0) === (divmod(after, d).r === 0) ? 'kept' : 'flipped';
  }
  let { swap } = s;
  if (kind === 'swap' && !swap && flips[3] === 'kept' && flips[2] === 'flipped') swap = Object.freeze({ from: before, to: after });
  return put(next, { flips: Object.freeze(flips), swap, last: Object.freeze({ kind: 'change', from: before, to: after, swapped: kind === 'swap' }) });
}

/** Poser la carte ci (du plateau) dans la case slot ; une carte déjà là retourne au plateau. */
export function placeCard(s, ci, slot) {
  if (ci < 0 || ci >= s.digits.length || slot < 0 || slot >= s.slots.length) return s;
  const from = slotOfCard(s, ci);
  if (from >= 0) return moveSlot(s, from, slot);
  const slots = [...s.slots];
  slots[slot] = ci;
  return changeSlots(s, slots, 'place');
}
/** Déplacer la carte de la case `from` vers `to` : un ÉCHANGE si `to` est occupée. */
export function moveSlot(s, from, to) {
  if (from === to || s.slots[from] == null || to < 0 || to >= s.slots.length) return s;
  const slots = [...s.slots];
  const kind = slots[to] == null ? 'move' : 'swap';
  [slots[from], slots[to]] = [slots[to], slots[from]];
  return changeSlots(s, slots, kind);
}
/** Rendre au plateau la carte de la case slot. */
export function returnCard(s, slot) {
  if (s.slots[slot] == null) return s;
  const slots = [...s.slots];
  slots[slot] = null;
  return changeSlots(s, slots, 'return');
}

/**
 * L'affirmation « n يقبل القسمة على d » (yes) ou « لا يقبل » (no) sur une lampe FERMÉE, pour un nombre complet.
 * Jugée par le reste ; la lampe s'ouvre dans les deux cas (la division montrée est la preuve).
 */
export function claim(s, d, yes) {
  const n = numberOf(s);
  if (n == null || s.lamps[d] || !s.divisors.includes(d)) return s;
  const div = division(n, d);
  const ok = div.divides === yes;
  const trial = Object.freeze({ mode: 'cards', n, d, claim: yes ? 'yes' : 'no', r: div.r, ok });
  return put(s, {
    lamps: Object.freeze({ ...s.lamps, [d]: true }),
    trials: Object.freeze([...s.trials, trial]),
    last: Object.freeze({ kind: 'claim', ...div, claim: trial.claim, ok }),
  });
}

export const selectTask = (s, i) => (i >= 0 && i < s.divisors.length && i !== s.task ? put(s, { task: i, last: null }) : s);
export const taskDivisor = (s) => s.divisors[s.task];
export const taskDone = (s, d) => !!s.tasks[d]?.done;

/**
 * « هذا هو الأكبر » : le nombre affiché est-il le PLUS GRAND des dispositions divisibles par d ?
 *   reason 'notDivisible' (r ≠ 0) · 'notLargest' (larger = la plus petite disposition valide au-dessus) · null (ok)
 */
export function submitLargest(s, d = taskDivisor(s)) {
  const n = numberOf(s);
  if (n == null) return s;
  const div = division(n, d);
  const valid = validArrangements(s.digits, d);
  let reason = null;
  let larger = null;
  if (!div.divides) reason = 'notDivisible';
  else if (n < valid[valid.length - 1]) { reason = 'notLargest'; larger = valid.find((v) => v > n); }
  const ok = reason == null;
  const trial = Object.freeze({ mode: 'cards', n, d, claim: 'largest', r: div.r, ok });
  const tasks = ok ? Object.freeze({ ...s.tasks, [d]: Object.freeze({ done: true, answer: n }) }) : s.tasks;
  return put(s, { tasks, trials: Object.freeze([...s.trials, trial]), last: Object.freeze({ kind: 'largest', ...div, ok, reason, larger }) });
}

/**
 * « لا يوجد » : accepté seulement si AUCUNE des dispositions n'est divisible par d (les 24 sont essayées par la
 * logique) ; refusé sinon, avec la plus petite disposition valide comme contre-exemple (pas la plus grande : la
 * cible reste à atteindre).
 */
export function sayNone(s, d = taskDivisor(s)) {
  const valid = validArrangements(s.digits, d);
  const ok = valid.length === 0;
  const trial = Object.freeze({ mode: 'cards', n: null, d, claim: 'none', r: null, ok });
  const remainders = ok ? remaindersOf(s.digits, d) : null;
  const tasks = ok ? Object.freeze({ ...s.tasks, [d]: Object.freeze({ done: true, none: true, remainders }) }) : s.tasks;
  const example = ok ? null : valid[0];
  return put(s, {
    tasks, trials: Object.freeze([...s.trials, trial]),
    last: Object.freeze({ kind: 'none', d, ok, example, exampleEq: example == null ? null : equationText(example, d), remainders, count: arrangements(s.digits).length }),
  });
}

/** Les cibles du manuel qui ont une solution (2, 3, 5 avec 4, 5, 9, 3). */
export const reachableTargets = (s) => s.divisors.filter((d) => targetPossible(s, d));
export const cardsDiscoveryReady = (s) => reachableTargets(s).every((d) => taskDone(s, d)) && s.swap != null;

/**
 * « أعِد التجربة » (questions du labo) : l'étape repart, NON faite (la carte se rouvrira quand elle sera de nouveau atteinte) — table :
 * le coloriage de d est vidé et rouvert ; cartes : la cible d est rouverte ; `'swap'` : l'échange retenu est oublié.
 */
export function retryStep(s, step) {
  if (s.mode === 'grid') {
    const i = s.divisors.indexOf(step);
    if (i < 0) return s;
    return put(s, { active: i, found: freezeMap({ ...s.found, [step]: [] }), revealed: freezeMap({ ...s.revealed, [step]: [] }), last: null });
  }
  if (step === 'swap') return put(s, { swap: null, flips: null, last: null });
  const tasks = { ...s.tasks }; delete tasks[step];
  return put(s, { tasks: Object.freeze(tasks), last: null });
}

/* ══════════════ Commun ══════════════ */

export function init(numbers = {}) {
  return numbers.mode === 'cards' ? initCards(numbers) : initGrid(numbers);
}
export const discoveryReady = (s) => (s.mode === 'cards' ? cardsDiscoveryReady(s) : gridDiscoveryReady(s));
/** Ce que la leçon reçoit pour un essai (`onTrial`), exactement. */
export const trialEvidence = (tr) => (tr.mode === 'grid'
  ? { mode: 'grid', n: tr.n, d: tr.d, r: tr.r, ok: tr.ok }
  : { mode: 'cards', n: tr.n, d: tr.d, claim: tr.claim, r: tr.r, ok: tr.ok });

/* ══════════════ Géométrie : la table (px), pure et testée ══════════════ */

/**
 * La table de `count` cases en `columns` colonnes, SANS gouttière (des cases jointives, comme le tableau du manuel).
 * La case est la plus grande possible dans `width` × `maxHeight`, entre `minCell` (40 px : le doigt) et `maxCell`.
 * Si la largeur ne permet pas `minCell`, elle l'emporte sur le plancher (la table ne déborde jamais).
 */
export function gridLayout({ count, columns, width, maxHeight = Infinity, minCell = 40, maxCell = 56 }) {
  const rows = Math.ceil(count / columns);
  const byW = Math.floor(width / columns);
  const byH = Math.floor(maxHeight / rows);
  const cell = Math.min(byW, Math.max(minCell, Math.min(maxCell, byH)));
  return { rows, columns, cell, width: cell * columns, height: cell * rows };
}

/* ══════════════ LabCoach (MANIPULATION_CONTRACT §8quater) ══════════════ */

/**
 * L'étape de l'onboarding : montre le CONTRÔLE à trouver, jamais la case, la carte ou l'affirmation juste.
 *   grid  : `colouring` (ouvrir un coloriage) → `cell` (toucher la table) → `reveal` (« أكمل », après REVEAL_AFTER cases)
 *           → `nextColouring` (le coloriage suivant) ;
 *   cards : `card` (porter une carte) → `lamp` (affirmer sur une ampoule) → `submit` (valider le nombre pour la cible)
 *           → `task` (la cible suivante) → `swap` (échanger deux cartes posées).
 * « لا يوجد » n'est jamais montré : le montrer dirait que la cible est impossible.
 */
export function coachOf(s) {
  if (discoveryReady(s)) return null;
  if (s.mode === 'grid') {
    const f = s.divisors.findIndex((d) => !colouringComplete(s, d));
    if (f < 0) return null;
    if (s.active !== f) return { id: s.active == null ? 'colouring' : 'nextColouring', target: `[data-dc-colouring="${s.divisors[f]}"]`, gesture: 'tap' };
    if (canReveal(s)) return { id: 'reveal', target: '[data-dc-reveal]', gesture: 'tap' };
    return { id: 'cell', target: '[data-dc-table]', gesture: 'tap' };
  }
  if (numberOf(s) == null) {
    const ci = trayOf(s)[0];
    return ci == null ? null : { id: 'card', target: `[data-dc-card="${s.digits[ci]}"]`, gesture: 'drag' };
  }
  const closed = s.divisors.find((d) => !s.lamps[d]);
  if (closed != null && Object.keys(s.lamps).length === 0) return { id: 'lamp', target: `[data-dc-lamp="${closed}"]`, gesture: 'tap' };
  const undone = s.divisors.filter((d) => !taskDone(s, d));
  if (undone.length > 0) {
    if (!taskDone(s, taskDivisor(s))) return { id: 'submit', target: '[data-dc-submit]', gesture: 'tap' };
    return { id: 'task', target: `[data-dc-task="${undone[0]}"]`, gesture: 'tap' };
  }
  if (s.swap == null) {
    const shut = [2, 3].find((d) => s.divisors.includes(d) && !s.lamps[d]);
    if (shut != null) return { id: 'lamp', target: `[data-dc-lamp="${shut}"]`, gesture: 'tap' };
    return { id: 'swap', target: '[data-dc-slot="0"]', gesture: 'drag' };
  }
  return null;
}
