/**
 * rank-exchange — la logique PURE de l'échange dix pour un (1AM, unité 1 « الأعداد الطبيعية والأعداد العشرية », درس
 * « كتابة الأعداد الطبيعية ودلالة الأرقام », manuel نشاط 1 p. 9, معارف 1 p. 11 et 4 p. 13, تمرين 2 p. 17). Aucun React ;
 * toute l'arithmétique passe par `@smarter-academy/core/arithmetic/placeValue.js` (importé par chemin).
 *
 * Le tableau : un COMPTE par rang (counts[k] objets de valeur 10^k), qui peut dépasser 9 — le nombre ne s'ÉCRIT que
 * lorsque chaque rang tient entre 0 et 9 (`isWritable`). Les gestes :
 *
 *   tie(rank, n)   lier n objets d'un rang : seulement n = 10 (sinon `short-pack`) → un objet du rang suivant, posé
 *                  sur le PLATEAU (`tray`), à porter ;
 *   carry(to)      porter l'objet lié dans la colonne `to` : seulement celle du rang suivant (sinon `wrong-column`) ;
 *   open(rank)     ouvrir un objet en 10 du rang de droite (jamais les unités : pas de rang à droite ici) ;
 *   add(rank, ±1)  poser / retirer un objet (متقدم : « +1 », « −1 », la dictée) — retirer d'une colonne vide :
 *                  `no-unit` ;
 *   check()        la dictée : `overflow` si une colonne tient 10 ou plus, `wrong-board` si la valeur diffère.
 *
 * INVARIANT : valueOf(s) (comptes + objet sur le plateau) ne change sous AUCUN tie / carry / open ; seuls add et la
 * remise à zéro d'une tâche le changent.
 *
 * Les tâches (une suite par niveau) : `pack` (1·13·24·37 → 2577, prédiction d'abord), `unpack` (2017 : combien de
 * paquets de 10 ? prédiction d'abord), `next` (999 + 1, en cascade), `previous` (999 − 1), `borrow` (1000 − 1 : il
 * faut ouvrir), `dictation` (des nombres donnés en lettres).
 *
 *     let s = init({ world: 'tokens', tasks: ['next'], next: 999 });
 *     s = add(s, 0, 1);            // 10 unités : le nombre ne s'écrit plus
 *     s = carry(tie(s, 0, 10), 1); // 10 dizaines …
 *     s = carry(tie(s, 1, 10), 2); s = carry(tie(s, 2, 10), 3);   // 1000 — taskDone(s) === true, 3 paquets
 */
import {
  digitsByRank, countOfRank, valueOfCounts, isWritable, decompose, spaced,
} from '@smarter-academy/core/arithmetic/placeValue.js';

const TASKS = Object.freeze(['pack', 'unpack', 'next', 'previous', 'borrow', 'dictation']);

/** Le nombre de colonnes d'un monde : 4 (crayons, argent : 1000 … 1) ou 7 (jetons : la classe des millions). */
export const columnsOf = (world) => (world === 'tokens' ? 7 : 4);

/** Les gestes qu'une tâche permet (un geste hors tâche n'est pas proposé : jamais un piège de l'interface). */
const GESTURES = Object.freeze({
  pack: ['tie'],
  unpack: ['open'],
  next: ['tie', 'add'],
  previous: ['remove'],
  borrow: ['open', 'remove'],
  dictation: ['tie', 'add', 'remove'],
});
/** Une colonne de la dictée ne monte pas au-delà (± ne sert qu'à poser un chiffre ; 10 et plus restent possibles). */
const MAX_ADD = 19;
/** Les tâches dont le premier geste est une PRÉDICTION (une carte choisie, jugée par le tableau à la fin). */
const PREDICTED = Object.freeze(['pack', 'unpack']);

const put = (s, patch) => Object.freeze({ ...s, ...patch });
const zeros = (cols) => Object.fromEntries(Array.from({ length: cols }, (_, k) => [k, 0]));
const fill = (cols, counts) => ({ ...zeros(cols), ...Object.fromEntries(Object.entries(counts ?? {}).map(([k, v]) => [Number(k), v])) });

/** La valeur d'un état : les comptes ET l'objet lié qui attend sur le plateau. */
export const valueOf = (s) => valueOfCounts(s.counts) + (s.tray ? 10 ** s.tray.to : 0);
/** Le nombre ÉCRIT (rien tant qu'une colonne tient 10 ou plus, ou qu'un objet attend d'être porté). */
export const writable = (s) => !s.tray && isWritable(s.counts);
export const writtenOf = (s) => (writable(s) ? spaced(valueOfCounts(s.counts)) : '');

export const taskOf = (s) => s.tasks[s.ti];
export const taskDone = (s, task = taskOf(s)) => !!s.done[task];
export const allDone = (s) => s.tasks.every((t) => s.done[t]);
export const discoveryReady = allDone;

/** La cible d'une tâche « +1 / −1 / emprunter ». */
export function targetOf(s, task = taskOf(s)) {
  const c = s.cfg;
  if (task === 'next') return c.next + 1;
  if (task === 'previous') return c.next - 1;
  if (task === 'borrow') return c.borrow - 1;
  if (task === 'dictation') return c.dictation[s.di] ?? null;
  return null;
}

/* ── Prédictions : trois cartes calculées des nombres de départ ─────────────────────────────────────────────── */

const three = (right, wrongs) => {
  const out = [];
  for (const v of [...wrongs, right, right * 10, right + 10]) if (Number.isSafeInteger(v) && v >= 0 && !out.includes(v) && out.length < 3) out.push(v);
  return out.sort((a, b) => a - b);
};

/** `pack` : la lecture côte à côte (MISC-KITABA-CONCAT), la somme des comptes (MISC-KITABA-SUMCOUNTS) et la valeur. */
export function packCards(start) {
  const ranks = Object.keys(start).map(Number).sort((a, b) => b - a);
  const concat = Number(ranks.map((k) => String(start[k])).join(''));
  const sum = ranks.reduce((t, k) => t + start[k], 0);
  return { cards: three(valueOfCounts(start), [concat, sum]), right: valueOfCounts(start), concat, sum };
}

/** `unpack` : le chiffre du rang (MISC-KITABA-DIGIT-COUNT), le compte du rang suivant (MISC-KITABA-RANKSHIFT), le compte. */
export function unpackCards(n, rank) {
  const digit = digitsByRank(n)[rank] ?? 0;
  const shift = countOfRank(n, rank + 1);
  const right = countOfRank(n, rank);
  return { cards: three(right, [digit, shift]), right, digit, shift };
}

export function cardsOf(s, task = taskOf(s)) {
  if (task === 'pack') return packCards(s.cfg.start).cards;
  if (task === 'unpack') return unpackCards(s.cfg.n, s.cfg.rank).cards;
  return [];
}

/* ── État ─────────────────────────────────────────────────────────────────────────────────────────────────── */

function boardFor(task, cfg, cols) {
  if (task === 'pack') return fill(cols, cfg.start);
  if (task === 'unpack') return fill(cols, digitsByRank(cfg.n));
  if (task === 'next' || task === 'previous') return fill(cols, digitsByRank(cfg.next));
  if (task === 'borrow') return fill(cols, digitsByRank(cfg.borrow));
  return zeros(cols);
}

function freshTask(s, ti) {
  const task = s.tasks[ti];
  return {
    ti, counts: Object.freeze(boardFor(task, s.cfg, s.columns)), tray: null, predict: null, di: 0,
    opened: Object.freeze({}), packs: 0, last: null,
    done: Object.freeze({ ...s.done, [task]: false }),
  };
}

/**
 * `world`, `tasks` et les nombres de chaque tâche : `start` (pack), `n` + `rank` (unpack), `next` (next / previous),
 * `borrow`, `dictation` (une liste). Les valeurs absentes prennent celles du manuel.
 */
export function init({ world = 'pencils', tasks = ['pack', 'unpack'], start, n, rank, next, borrow, dictation } = {}) {
  const list = (Array.isArray(tasks) ? tasks : [tasks]).filter((t) => TASKS.includes(t));
  const cfg = Object.freeze({
    start: Object.freeze({ ...(start ?? { 3: 1, 2: 13, 1: 24, 0: 37 }) }),
    n: n ?? 2017, rank: rank ?? 1, next: next ?? 999, borrow: borrow ?? 1000,
    dictation: Object.freeze([...(dictation ?? [7065, 4908732])]),
  });
  const base = { world, columns: columnsOf(world), tasks: Object.freeze(list.length ? list : ['pack']), cfg, done: Object.freeze({}), trials: Object.freeze([]), results: Object.freeze({}) };
  return Object.freeze({ ...base, ...freshTask(base, 0) });
}

/** « إعادة » : la tâche en cours repart (les tâches finies restent finies) ; tout repart si tout était fini. */
export function restartTask(s) {
  if (allDone(s)) return init({ world: s.world, tasks: s.tasks, ...s.cfg });
  return put(s, freshTask(s, s.ti));
}

/** « أعِد التجربة » (questions du labo) : LA MÊME tâche repart de son état initial, même si c'était la dernière. */
export const retryTask = (s) => put(s, freshTask(s, s.ti));

/** Passer à la tâche suivante (seulement quand celle-ci est finie). */
export function nextTask(s) {
  if (!taskDone(s) || s.ti >= s.tasks.length - 1) return s;
  return put(s, freshTask(s, s.ti + 1));
}

export const needsPrediction = (s) => PREDICTED.includes(taskOf(s)) && s.predict == null && !taskDone(s);
/** Le geste est-il permis maintenant ? (tâche, prédiction faite, tâche pas finie) */
export function allows(s, gesture, rank = 0) {
  const task = taskOf(s);
  if (taskDone(s) || needsPrediction(s) || !GESTURES[task]?.includes(gesture)) return false;
  if (gesture === 'tie') return !s.tray && rank < s.columns - 1;
  if (gesture === 'open') return !s.tray && rank >= 1 && (task !== 'unpack' || rank > s.cfg.rank);
  if (gesture === 'add') return !s.tray && (task === 'dictation' ? (s.counts[rank] ?? 0) < MAX_ADD : rank === 0 && valueOf(s) < targetOf(s));
  if (gesture === 'remove') return !s.tray && (task === 'dictation' || (rank === 0 && valueOf(s) > targetOf(s)));
  return true;
}

/* ── Gestes ───────────────────────────────────────────────────────────────────────────────────────────────── */

function trial(s, kind, rank, ok, extra = {}) {
  const tr = Object.freeze({ task: taskOf(s), kind, rank, ok, counts: Object.freeze({ ...s.counts }), value: valueOf(s), ...extra });
  return Object.freeze([...s.trials, tr]);
}
function refuse(s, refused, rank, kind, extra = {}) {
  const last = Object.freeze({ type: 'refused', refused, rank, ...extra });
  return put(s, { last, trials: trial(s, kind, rank, false, { refused, ...extra }) });
}

/** Choisir une carte de prédiction (rien n'est jugé avant la fin de la tâche). */
export function choose(s, value) {
  if (!needsPrediction(s) || !cardsOf(s).includes(value)) return s;
  return put(s, { predict: value, last: null });
}

/** Lier n objets du rang `rank` : 10 exactement ; moins de 10, ils retombent (`short-pack`). */
export function tie(s, rank, n = 10) {
  if (!allows(s, 'tie', rank)) return s;
  const have = s.counts[rank] ?? 0;
  if (n !== 10 || have < 10) return refuse(s, 'short-pack', rank, 'pack', { n: Math.min(n, have) });
  const counts = Object.freeze({ ...s.counts, [rank]: have - 10 });
  return put(s, { counts, tray: Object.freeze({ from: rank, to: rank + 1 }), last: Object.freeze({ type: 'tie', rank }) });
}

/** Porter l'objet lié dans la colonne `to` : seule la colonne du rang suivant l'accepte. */
export function carry(s, to) {
  if (!s.tray) return s;
  if (to !== s.tray.to) return refuse(s, 'wrong-column', s.tray.from, 'pack', { to, need: s.tray.to });
  const counts = Object.freeze({ ...s.counts, [to]: (s.counts[to] ?? 0) + 1 });
  const moved = put(s, { counts, tray: null, packs: s.packs + 1, last: Object.freeze({ type: 'carry', rank: s.tray.from, to }) });
  return settle(put(moved, { trials: trial(moved, 'pack', s.tray.from, true) }));
}

/** Ouvrir UN objet du rang `rank` en 10 objets du rang de droite. */
export function open(s, rank, times = 1) {
  if (!allows(s, 'open', rank) || (s.counts[rank] ?? 0) < 1) return s;
  const k = Math.max(1, Math.min(times, s.counts[rank]));
  const counts = Object.freeze({ ...s.counts, [rank]: s.counts[rank] - k, [rank - 1]: (s.counts[rank - 1] ?? 0) + 10 * k });
  const opened = Object.freeze({ ...s.opened, [rank]: (s.opened[rank] ?? 0) + k });
  const next = put(s, { counts, opened, last: Object.freeze({ type: 'open', rank, n: k }) });
  return settle(put(next, { trials: trial(next, 'unpack', rank, true, { n: k }) }));
}

/** « افتح الكل » n'apparaît qu'après deux ouvertures À LA MAIN dans cette colonne (choix de l'auteur, comme « أكمل »). */
export const canOpenAll = (s, rank) => allows(s, 'open', rank) && (s.opened[rank] ?? 0) >= 2 && (s.counts[rank] ?? 0) >= 2;
export const openAll = (s, rank) => (canOpenAll(s, rank) ? open(s, rank, s.counts[rank]) : s);

/** Un objet glissé hors de sa place permise (ouvrir : la colonne de DROITE seulement). */
export function refuseMove(s, rank, to, need) {
  return refuse(s, 'wrong-column', rank, 'unpack', { to, need });
}

/** Poser (+1) ou retirer (−1) un objet d'une colonne. */
export function add(s, rank, delta) {
  const gesture = delta > 0 ? 'add' : 'remove';
  if (!allows(s, gesture, rank)) return s;
  const have = s.counts[rank] ?? 0;
  if (delta < 0 && have === 0) return refuse(s, 'no-unit', rank, 'remove');
  const counts = Object.freeze({ ...s.counts, [rank]: have + (delta > 0 ? 1 : -1) });
  const next = put(s, { counts, last: Object.freeze({ type: gesture, rank }) });
  return settle(put(next, { trials: trial(next, gesture, rank, true) }));
}

/** « تحقّق » (dictée) : la valeur exacte, sur un tableau qui s'écrit. */
export function check(s) {
  if (taskOf(s) !== 'dictation' || taskDone(s) || s.tray) return s;
  const target = targetOf(s);
  if (!isWritable(s.counts)) {
    const rank = Number(Object.keys(s.counts).find((k) => s.counts[k] > 9));
    return refuse(s, 'overflow', rank, 'answer', { target, count: s.counts[rank] });
  }
  const value = valueOfCounts(s.counts);
  if (value !== target) return refuse(s, 'wrong-board', null, 'answer', { target, board: value });
  const results = { ...s.results, dictation: Object.freeze([...(s.results.dictation ?? []), value]) };
  const di = s.di + 1;
  const finished = di >= s.cfg.dictation.length;
  const base = put(s, { results: Object.freeze(results), trials: trial(s, 'answer', null, true, { target }), last: Object.freeze({ type: 'answer', value, finished }) });
  if (finished) return put(base, { done: Object.freeze({ ...s.done, dictation: true }) });
  return put(base, { di, counts: Object.freeze(zeros(s.columns)) });
}

/** Après chaque geste : la tâche est-elle finie ? (pack, unpack : la prédiction est alors JUGÉE par le tableau) */
function settle(s) {
  const task = taskOf(s);
  if (taskDone(s)) return s;
  let done = false;
  let result = null;
  if (task === 'pack' && writable(s)) {
    const value = valueOfCounts(s.counts);
    done = true;
    result = { value, predict: s.predict, ok: s.predict === value };
  } else if (task === 'unpack' && Object.keys(s.counts).every((k) => Number(k) <= s.cfg.rank || s.counts[k] === 0)) {
    const count = s.counts[s.cfg.rank];
    done = true;
    result = { count, predict: s.predict, ok: s.predict === count, digit: digitsByRank(s.cfg.n)[s.cfg.rank] ?? 0, rest: s.cfg.n - count * 10 ** s.cfg.rank };
  } else if ((task === 'next' || task === 'previous' || task === 'borrow') && writable(s) && valueOfCounts(s.counts) === targetOf(s)) {
    done = true;
    result = { value: targetOf(s), packs: s.packs, opens: Object.values(s.opened).reduce((a, b) => a + b, 0) };
  }
  if (!done) return s;
  const next = put(s, {
    done: Object.freeze({ ...s.done, [task]: true }),
    results: Object.freeze({ ...s.results, [task]: Object.freeze(result) }),
    last: Object.freeze({ type: 'done', task, ...result }),
  });
  if (!PREDICTED.includes(task)) return next;
  return put(next, { trials: trial(next, 'predict', null, result.ok, { predict: s.predict, actual: task === 'pack' ? result.value : result.count }) });
}

/** Ce que la leçon reçoit pour chaque geste jugé (`onTrial`). */
export const trialEvidence = (tr) => ({ task: tr.task, kind: tr.kind, rank: tr.rank, ok: tr.ok, counts: { ...tr.counts }, value: tr.value });

/* ── Lectures pour la découverte et la règle ──────────────────────────────────────────────────────────────── */

/** `n = c × 10^rank + reste` (unpack) : « 2017 = 201 × 10 + 7 ». */
export function unpackLine(n, rank) {
  const p = 10 ** rank;
  const c = countOfRank(n, rank);
  const r = n - c * p;
  return r === 0 ? `${n} = ${c} × ${p}` : `${n} = ${c} × ${p} + ${r}`;
}

/** Le مفكوك écrit : « 2017 = 2 × 1000 + 1 × 10 + 7 ». */
export function decomposeLine(n) {
  const terms = decompose(n).map((t) => (t.rank === 0 ? String(t.digit) : `${t.digit} × ${t.value}`));
  return `${n} = ${terms.join(' + ') || '0'}`;
}

/** Les paires رقم / عدد de chaque rang de n (le tableau du تمرين 1) : [{ rank, digit, count }] du rang 0 au plus haut. */
export function digitCountPairs(n) {
  const d = digitsByRank(n);
  return Object.keys(d).map(Number).map((rank) => ({ rank, digit: d[rank], count: countOfRank(n, rank) }));
}

/** Les chiffres non nuls d'un nombre, sans ses zéros : 7065 → 765 (la conjecture « le zéro ne vaut rien »). */
export const withoutZeros = (n) => Number(String(n).replace(/0/g, '') || '0');
export const zeroCount = (n) => (String(n).match(/0/g) ?? []).length;

/* ── Géométrie d'une colonne (px), pure et testée ────────────────────────────────────────────────────────── */

/** La forme des objets d'un rang (largeur / hauteur), par monde. */
export function aspectOf(world, rank) {
  if (world === 'tokens') return 1;
  if (world === 'money') return rank >= 2 ? 1.9 : 1;
  return [0.26, 0.8, 1.15, 1.25][Math.min(rank, 3)];
}

/** Au-delà, une colonne dessine `MAX_SHOWN` objets et sa pastille dit le compte exact. */
const MAX_SHOWN = 60;

/**
 * Les places des objets d'une colonne de `width` × `height` : empilés depuis le BAS, en rangées centrées, chacun une
 * seule fois et entièrement dans la colonne. La taille (hauteur d'un objet) descend de `maxSize` à `minSize` jusqu'à
 * ce que tout tienne ; sinon `shown` < `count` objets sont dessinés et la pastille (`badge`, dès 10 objets) porte le
 * compte exact.
 *   { size, w (largeur d'un objet), cols, rows, shown, stacked (empilés), badge, positions: [{ x, y }] }
 */
export function columnLayout({ count, width, height, aspect = 1, gap = 0.16, pad = 4, minSize = 12, maxSize = 40, minPitch = 0.5, comfort = 20 }) {
  const want = Math.min(count, MAX_SHOWN);
  const fit = (s0, mp = minPitch) => {
    const s = Math.max(1, Math.floor(Math.min(s0, (width - 2 * pad) / aspect, height - 2 * pad) * 10) / 10);
    const g = gap * s;
    const cols = Math.max(1, Math.floor((width - 2 * pad + g) / (s * aspect + g)));
    const need = Math.max(1, Math.ceil(want / cols));
    // le pas vertical : un objet + son joint ; s'il manque de la hauteur, les objets s'EMPILENT (une pile de jetons, de
    // billets) jusqu'à `minPitch` de leur hauteur — chacun garde une tranche visible
    const room = height - 2 * pad - s;
    const pitch = need > 1 ? Math.min(s + g, room / (need - 1)) : s + g;
    return { s, g, cols, need, pitch, ok: pitch >= s * mp - 1e-9 };
  };
  let best = null;
  // d'abord sans empiler, tant que les objets restent confortables (≥ `comfort` px) ; ensuite seulement, la pile
  for (let s = maxSize; s >= Math.max(minSize, comfort) && !best; s -= 0.5) {
    const f = fit(s, 1);
    if (f.ok) best = f;
  }
  for (let s = maxSize; s >= minSize && !best; s -= 0.5) {
    const f = fit(s);
    if (f.ok) best = f;
  }
  if (!best) {
    // même à la plus petite taille tout ne tient pas : on dessine ce qui tient, la pastille dit le compte exact
    const f = fit(minSize);
    const pitch = f.s * minPitch;
    const rows = Math.max(1, Math.floor((height - 2 * pad - f.s) / pitch + 1e-9) + 1);
    best = { ...f, pitch, need: rows };
  }
  const { s: size, g, cols, pitch } = best;
  const rows = Math.max(1, Math.floor((height - 2 * pad - size) / pitch + 1e-9) + 1);
  const shown = Math.min(want, cols * rows);
  const w = size * aspect;
  const used = Math.min(cols, Math.max(1, shown));
  const blockW = used * w + (used - 1) * g;
  const x0 = (width - blockW) / 2;
  const positions = Array.from({ length: shown }, (_, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    return { x: x0 + c * (w + g), y: height - pad - size - r * pitch };
  });
  return { size, w, cols, rows, shown, stacked: pitch < size, badge: count >= 10, positions };
}

/** Combien un objet peut recouvrir le précédent dans une pile : les jetons et pièces s'empilent, les crayons à peine. */
export function pitchOf(world, rank) {
  if (world === 'tokens' || (world === 'money' && rank < 2)) return 0.36;
  if (world === 'money') return 0.32;
  return rank === 0 ? 0.8 : 0.6;
}

/* ── Le guide d'onboarding : « que doit faire la main MAINTENANT ? » ─────────────────────────────────────────── */

/**
 * La prochaine action attendue de l'élève, comme une DONNÉE pure (le composant `LabCoach` la montre) :
 * `{ id, target, rank?, gesture }` — `target` est un sélecteur du contrat DOM du labo, `gesture` : 'tap' | 'drag' | 'sweep'.
 * `null` quand rien n'est à guider (tâche finale faite). Ne dit JAMAIS la règle : elle montre le BOUTON, pas la raison.
 * `focusCol` : la colonne choisie de la dictée.
 */
export function coachOf(s, { focusCol = 0 } = {}) {
  const task = taskOf(s);
  if (!task) return null;
  if (needsPrediction(s)) return { id: 'predict', target: '[data-rx-cards]', gesture: 'tap' };
  if (taskDone(s)) return s.ti < s.tasks.length - 1 ? { id: 'next-task', target: '[data-rx-next]', gesture: 'tap' } : null;
  if (s.tray) return { id: 'carry', target: '[data-rx-tray]', rank: s.tray.to, gesture: 'drag' };
  const cols = Array.from({ length: s.columns }, (_, r) => r);
  const full = cols.find((r) => (s.counts[r] ?? 0) >= 10 && allows(s, 'tie', r));
  if (task === 'pack' || (task === 'next' && full != null)) {
    return full != null ? { id: 'tie', target: `[data-rx-tie="${full}"]`, rank: full, gesture: 'tap' } : null;
  }
  if (task === 'unpack') {
    const r = [...cols].reverse().find((x) => (s.counts[x] ?? 0) > 0 && allows(s, 'open', x));
    return r != null ? { id: 'open', target: `[data-rx-open="${r}"]`, rank: r, gesture: 'tap' } : null;
  }
  if (task === 'next') return { id: 'plus', target: '[data-rx-plus="0"]', rank: 0, gesture: 'tap' };
  if (task === 'previous') return { id: 'minus', target: '[data-rx-minus="0"]', rank: 0, gesture: 'tap' };
  if (task === 'borrow') {
    if ((s.counts[0] ?? 0) > 0) return { id: 'minus', target: '[data-rx-minus="0"]', rank: 0, gesture: 'tap' };
    const r = cols.find((x) => x >= 1 && (s.counts[x] ?? 0) > 0 && allows(s, 'open', x));
    return r != null ? { id: 'open', target: `[data-rx-open="${r}"]`, rank: r, gesture: 'tap' } : null;
  }
  if (task === 'dictation') {
    const want = digitsByRank(targetOf(s) ?? 0);
    const r = [...cols].reverse().find((x) => (s.counts[x] ?? 0) !== (want[x] ?? 0));
    if (r == null) return { id: 'check', target: '[data-rx-check]', gesture: 'tap' };
    if (focusCol !== r) return { id: 'pick', target: `[data-rx-body="${r}"]`, rank: r, gesture: 'tap' };
    return (s.counts[r] ?? 0) < (want[r] ?? 0)
      ? { id: 'plus', target: `[data-rx-plus="${r}"]`, rank: r, gesture: 'tap' }
      : { id: 'minus', target: `[data-rx-minus="${r}"]`, rank: r, gesture: 'tap' };
  }
  return null;
}
