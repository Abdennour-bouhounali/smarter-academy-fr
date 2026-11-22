import * as L from './pairScoreboard.js';

/**
 * La logique PURE du LECTEUR DE MISSION de `pair-scoreboard` (rollout 2026-11-12, unité 5 leçon 1 `mafhum-jumla` ; conseil du 2026-11-11,
 * verdict « L1 », L1.2–L1.6, L1.11, X7). `logic/pairScoreboard.js` (la page, l'enseignant, le mode classe) n'est PAS touché : tout ce qui suit est
 * AJOUTÉ ici, au-dessus de ses fonctions (init, set, swap, claim, gauges, readingTex…).
 *
 *   LE DÉPART : les deux poignées partent d'une ثنائية EXPLICITE (`start`), posée (x et y valent déjà quelque chose) mais jamais un essai.
 *   UN ESSAI (manches à jauges visibles) = une ثنائية NOUVELLE validée (relâchement, pause du clavier, « اقلب ») ; une ثنائية déjà validée n'est
 *   pas un essai. Une réponse REFUSÉE (« تحقّق من ثنائيتي ») est un essai `{ exact: false }` (une fois par ثنائية) ; acceptée sur une ثنائية
 *   déjà validée, elle n'ajoute rien. MANCHE COUVERTE (`covered`) : la jauge (2) est cachée ; déplacer n'est PAS un essai, seule une réponse sur
 *   une ثنائية nouvelle l'est. Ce que le BUT de la manche exige est GRATUIT (`free`, verdict L1.2 b) :
 *     'firstHalf'   la première ثنائية qui n'allume qu'UNE jauge (r1 : le contraste) ;
 *     'gauge1x3'    les trois premières ثنائيات qui allument la jauge (1), et la ثنائية acceptée RENVERSÉE (r2) ;
 *     'firstRefusal' la première réponse refusée d'une manche couverte (r3).
 *   LA DÉCOUVERTE (`discover`) : 'contrast' (une ثنائية acceptée ET une à une seule jauge), 'many' (acceptée, ≥ 3 ثنائيات de la jauge (1) et la
 *   ثنائية acceptée renversée vue), 'covered' (une réponse acceptée).
 *   `shownValues(props)` liste TOUT ce qu'un écran d'une manche peut montrer, avec son rôle (content/forbidden.js le balaie).
 */

export const PRED_KEYS = Object.freeze(['manyFirst', 'swapSol']);
export const GAUGE1_GOAL = 3;

const keyOf = (x, y) => `${x};${y}`;
const isHalf = (t) => t.ok[0] !== t.ok[1];

/** La manche : la jumla, son monde, ses bornes, et la ثنائية de DÉPART posée (jamais un essai). */
export function initRound({ system, theme, ranges, start }) {
  const lab = L.init({ system, theme, ranges });
  const s0 = start ?? startFor(lab);
  return { ...lab, x: s0.x, y: s0.y, start: { x: s0.x, y: s0.y }, claimed: [] };
}

/** Le départ par défaut : (0 ; 0) s'il n'allume rien, sinon la ثنائية de la page (`defaultPair`). */
function startFor(lab) {
  const inR = (r, v) => v >= r.min && v <= r.max;
  if (inR(lab.range.x, 0) && inR(lab.range.y, 0) && !L.okPair(lab, 0, 0).some(Boolean)) return { x: 0, y: 0 };
  return L.defaultPair(lab);
}

/** Les lectures du lecteur : les VALEURS des conditions (monde « count ») ou les lignes de substitution (verdict L1.4). */
export const readingsOf = (lab, mode) => (mode === 'values' && lab.shape.kind === 'count' ? 'values' : 'lines');

/** La valeur d'une condition d'un monde « count » : (1) x + y contre N, (2) p·x + q·y contre V. */
export function gaugeValue(lab, i, x, y) {
  const sh = lab.shape;
  if (sh.kind !== 'count') return null;
  return i === 0 ? { have: x + y, target: sh.N } : { have: sh.p * x + sh.q * y, target: sh.V };
}

/* ── les essais ─────────────────────────────────────────────────────────────────────── */

export const gauge1Pairs = (lab) => lab.trials.filter((t) => t.ok[0]);
const swapOfSolved = (lab) => (lab.solved && lab.solved.x !== lab.solved.y ? { x: lab.solved.y, y: lab.solved.x } : null);
/** La ثنائية acceptée RENVERSÉE a-t-elle été validée (par « اقلب » ou à la main) ? */
export const swapSeen = (lab) => { const s = swapOfSolved(lab); return !!s && lab.trials.some((t) => t.x === s.x && t.y === s.y); };

/** Le verdict d'un essai NOUVEAU `t` (une ثنائية validée), avant `before` : exact ⇔ les deux jauges ; gratuit selon la règle de la manche. */
function trialVerdict(before, t, round, n) {
  const exact = t.ok[0] && t.ok[1];
  let free = false;
  if (round.free === 'firstHalf') free = isHalf(t) && !before.trials.some(isHalf);
  if (round.free === 'gauge1x3') {
    const s = swapOfSolved(before);
    free = (t.ok[0] && gauge1Pairs(before).length < GAUGE1_GOAL) || (!!s && t.x === s.x && t.y === s.y);
  }
  return { groups: n, exact, ...(free ? { free: true } : {}) };
}

/**
 * UN GESTE de l'élève, pur : `{ kind: 'set', which, v } | { kind: 'swap' } | { kind: 'claim' }` sur la manche `round` ({ covered, free }).
 * Rend `{ lab, verdicts }` — les verdicts à envoyer à `onVerdict` (0, 1 ou 2 : une ثنائية nouvelle ET sa réponse refusée).
 */
export function act(lab, action, round = {}) {
  const verdicts = [];
  if (action.kind === 'set' || action.kind === 'swap') {
    let next = action.kind === 'set' ? L.set(lab, action.which, action.v) : L.swap(lab);
    // la ثنائية de DÉPART n'est jamais un essai, même revalidée (elle a été vue à l'ouverture)
    if (next.last?.kind === 'trial' && next.last.fresh && lab.start && next.last.x === lab.start.x && next.last.y === lab.start.y) {
      next = { ...next, trials: next.trials.slice(0, -1), last: { ...next.last, fresh: false } };
    }
    if (!round.covered && next.last?.kind === 'trial' && next.last.fresh) {
      verdicts.push(trialVerdict(lab, next.last, round, next.trials.length));
    }
    return { lab: next, verdicts };
  }
  if (action.kind === 'claim') {
    if (lab.x == null || lab.y == null) return { lab: L.claim(lab), verdicts };
    const k = keyOf(lab.x, lab.y);
    const wasTrial = lab.trials.some((t) => t.x === lab.x && t.y === lab.y);
    // la ثنائية de DÉPART n'est jamais un essai, pas plus par une réponse que par un geste (revue 2026-11-12)
    const atStart = !!lab.start && lab.x === lab.start.x && lab.y === lab.start.y;
    const wasClaimed = lab.claimed.some((c) => keyOf(c.x, c.y) === k);
    const next0 = L.claim(lab);
    const ok = next0.last.ok;
    const accepted = next0.last.kind === 'accepted';
    const trials = atStart && !wasTrial && !round.covered ? next0.trials.filter((t) => !(t.x === lab.x && t.y === lab.y)) : next0.trials;
    const next = { ...next0, trials, ...(wasClaimed ? {} : { claimed: [...lab.claimed, { x: lab.x, y: lab.y, ok, accepted }] }) };
    if (round.covered) {
      if (!wasClaimed) {
        const free = !accepted && round.free === 'firstRefusal' && !lab.claimed.some((c) => !c.accepted);
        verdicts.push({ groups: next.claimed.length, exact: accepted, ...(free ? { free: true } : {}) });
      }
      return { lab: next, verdicts };
    }
    if (!wasTrial && !atStart) verdicts.push(trialVerdict(lab, next.trials[next.trials.length - 1], round, next.trials.length));
    if (!accepted && !wasClaimed) verdicts.push({ groups: next.trials.length, exact: false });
    return { lab: next, verdicts };
  }
  return { lab, verdicts };
}

/** La réponse déjà donnée sur (x ; y) — la jauge (2) d'une manche couverte n'est montrée que pour elle. */
export const claimAt = (lab, x, y) => lab.claimed.find((c) => c.x === x && c.y === y) ?? null;

/* ── la découverte ──────────────────────────────────────────────────────────────────── */

export function discovered(lab, mode) {
  if (mode === 'covered') return lab.solved != null;
  if (mode === 'many') return lab.solved != null && gauge1Pairs(lab).length >= GAUGE1_GOAL && swapSeen(lab);
  // les cas particuliers (module 2, décision du propriétaire OQ1) : trois ثنائيات de la jauge (1) vues suffisent — la jauge (2) les juge TOUTES
  // pareil (jamais allumée avec la (1) : aucune solution ; toujours : une infinité)
  if (mode === 'gauge1x3') return gauge1Pairs(lab).length >= GAUGE1_GOAL;
  return L.discoveryReady(lab);
}

/**
 * Les faits d'une jumla « parallèle » d'un monde « count » où p = q (« قطع من فئة واحدة ») : N objets de valeur p valent TOUJOURS p·N ;
 * la jauge (2) vaut `full` sur chaque ثنائية de la jauge (1) — égal à V (une infinité de solutions) ou non (aucune).
 */
export function parallelFacts(lab) {
  const { N, p, q, V } = lab.shape;
  return { N, p, q, V, full: p * N, same: p === q, kind: p === q ? (p * N === V ? 'infinite' : 'none') : 'other' };
}

/* ── les suites de questions ────────────────────────────────────────────────────────── */

/** La réponse REFUSÉE d'une manche couverte dont la jauge (1) était allumée (« الموسم ممتلئ » est vrai). */
export const fullRefused = (lab) => lab.claimed.find((c) => !c.accepted && c.ok[0] && !c.ok[1]) ?? null;

const CHAIN_SPECS = Object.freeze({
  season: [{ id: 'season', reached: (lab) => discovered(lab, 'contrast'), qs: ['halfWhich', 'buildLine'] }],
  coins: [{ id: 'coins', reached: (lab) => discovered(lab, 'many'), qs: ['buildEq2', 'rule'] }],
  covered: [{ id: 'covered', reached: (lab) => discovered(lab, 'covered'), qs: ['readCovered', 'coveredWhy'] }],
  never: [{ id: 'never', reached: (lab) => discovered(lab, 'gauge1x3'), qs: ['whyNever'] }],
  always: [{ id: 'always', reached: (lab) => discovered(lab, 'gauge1x3'), qs: ['whyAlways'] }],
  none: [],
});
export const chainsOf = (name) => CHAIN_SPECS[name] ?? [];
/** Les questions d'une suite, sans celle que la manche rend sans objet (« لماذا رفضت » sans refus à jauge (1) allumée). */
export const questionsOf = (spec, lab) => spec.qs.filter((q) => (q === 'coveredWhy' ? fullRefused(lab) != null : true));

/** BÂTIR ce qu'a calculé la jauge (2) sur la ثنائية acceptée : « V = p × x + q × y », un leurre = p·x (les victoires seules, L1.6). */
export function buildLine(lab) {
  const { p, q } = lab.shape; const s = lab.solved;
  const V = p * s.x + q * s.y;
  const decoy = p * s.x;
  return { expected: [V, s.x, s.y], decoy, tiles: [V, s.x, s.y, decoy], ops: [`= ${p} ×`, q === 1 ? '+' : `+ ${q} ×`] };
}

/** BÂTIR la condition (2) : « p x + q y = V », le leurre = le montant de la ثنائية RENVERSÉE de l'élève (330 : L1.11). */
export function buildEq2(lab) {
  const { p, q, V } = lab.shape; const s = lab.solved;
  const decoy = p * s.y + q * s.x;
  return { expected: [p, q, V], decoy, tiles: [q, decoy, p, V], ops: ['x +', 'y ='] };
}

/** LIRE la jauge (2) découverte : V ; leurres N (les matchs) et p·x (les victoires seules, L1.6). */
export function readCovered(lab) {
  const { p, N } = lab.shape; const s = lab.solved;
  const right = p * s.x + lab.shape.q * s.y;
  return { right, wrong: [{ id: 'count', v: N }, { id: 'wins', v: p * s.x }] };
}

/* ── les prédictions (r2) ───────────────────────────────────────────────────────────── */

/** Les options, dans l'ordre de l'écran (la bonne n'est pas au même rang d'une clé à l'autre). */
export function predictOptions(key) {
  if (key === 'manyFirst') return [{ says: 'one' }, { says: 'many' }, { says: 'none' }];
  if (key === 'swapSol') return [{ says: 'no' }, { says: 'yes' }];
  return [];
}

/** Les ثنائيات entières des bornes qui vérifient l'équation (1) (pour la vérité de « كم ثنائية ؟ »). */
export function eq1Pairs(lab) {
  const out = [];
  for (let x = lab.range.x.min; x <= lab.range.x.max; x += 1) for (let y = lab.range.y.min; y <= lab.range.y.max; y += 1) if (L.okPair(lab, x, y)[0]) out.push({ x, y });
  return out;
}

/** La vérité d'une prédiction, calculée sur la jumla de la manche (jamais écrite à la main). */
export function predictTruth(lab, key) {
  if (key === 'manyFirst') { const n = eq1Pairs(lab).length; return n > 1 ? 'many' : n === 1 ? 'one' : 'none'; }
  if (key === 'swapSol') {
    const sol = lab.solved ?? solutionIn(lab);
    if (!sol) return null;
    return L.okPair(lab, sol.y, sol.x).every(Boolean) ? 'yes' : 'no';
  }
  return null;
}

/** La solution entière de la jumla dans les bornes (la seule ثنائية qui allume les deux jauges). */
export function solutionIn(lab) {
  for (let x = lab.range.x.min; x <= lab.range.x.max; x += 1) for (let y = lab.range.y.min; y <= lab.range.y.max; y += 1) if (L.okPair(lab, x, y).every(Boolean)) return { x, y };
  return null;
}

/** Quand la prédiction est POSÉE : 'start' (avant le premier geste) ou 'accepted' (à la réponse acceptée, L1.11). */
export const predictWhen = (key) => (key === 'swapSol' ? 'accepted' : 'start');

/** La prédiction est-elle JUGÉE par le terrain ? */
export function predictJudged(lab, key) {
  if (key === 'manyFirst') return gauge1Pairs(lab).length >= 2;
  if (key === 'swapSol') return swapSeen(lab);
  return false;
}
export const judgedPredictions = (lab, keys) => keys.filter((key) => predictJudged(lab, key));

/* ── le guide (LabCoach) ────────────────────────────────────────────────────────────── */

/**
 * La prochaine aide — le GESTE, jamais la réponse. `ctx` : { done, movedX, movedY, covered, swap } (swap : la manche a le bouton « اقلب »).
 * Les jauges sont masquées pendant le geste (L1.2) : la bulle « gauge1 » vient APRÈS le premier essai, sur la jauge lue au relâchement (G8).
 */
export function coachOf(lab, ctx = {}) {
  if (ctx.done) return null;
  if (!ctx.movedX) return { id: 'handleX', target: '[data-coach="handle-x"]', gesture: 'drag', prefer: 'above' };
  if (!ctx.movedY) return { id: 'handleY', target: '[data-coach="handle-y"]', gesture: 'drag', prefer: 'above' };
  if (ctx.covered) return lab.claimed.length === 0 ? { id: 'reveal', target: '[data-coach="claim"]', gesture: 'tap', prefer: 'above' } : null;
  if (lab.trials.length === 1) return { id: 'gauge1', target: '[data-coach="gauge-1"]', gesture: 'tap', prefer: 'above' };
  if (lab.solved && ctx.swap && !swapSeen(lab)) return { id: 'swap', target: '[data-coach="swap"]', gesture: 'tap', prefer: 'above' };
  if (!lab.solved && lab.trials.length >= 2 && lab.claimed.length === 0) return { id: 'claim', target: '[data-coach="claim"]', gesture: 'tap', prefer: 'above' };
  return null;
}

/* ── le monde en bande : la grille la plus grande dans la largeur et une hauteur bornée ── */

/** n objets en 1 à 4 rangées : la case la plus grande qui tient dans width × maxHeight (le monde du lecteur est une BANDE, pas un carré). */
export function stripGrid({ count, width, maxHeight, gap = 4, maxCell = 44, minCell = 12 }) {
  const n = Math.max(1, count);
  let best = null;
  for (let rows = 1; rows <= 4; rows += 1) {
    const cols = Math.ceil(n / rows);
    const byW = (width - (cols - 1) * gap) / cols;
    const byH = (maxHeight - (rows - 1) * gap) / rows;
    const cell = Math.floor(Math.min(byW, byH, maxCell));
    if (!best || cell > best.cell) best = { rows, cols, cell };
  }
  const cell = Math.max(minCell, best.cell);
  return { rows: best.rows, cols: best.cols, cell, width: best.cols * cell + (best.cols - 1) * gap, height: best.rows * cell + (best.rows - 1) * gap };
}

/* ── le balayage « valeurs interdites par rôle » ────────────────────────────────────── */

const Rl = (role, v) => ({ role, v: String(v) });
const bare = (s) => String(s).replace(/\s+/g, '').replace(/−/g, '-');

/**
 * TOUT ce qu'un écran d'une manche peut montrer, avec son rôle : la jumla (`system`) et chaque équation (`eq`), le total N (`total`), la cible V
 * (`target`), les coefficients (`coef`), le départ (`start`), la solution (`solution`) et sa renversée (`swap`), les lectures des jauges au départ,
 * à la solution et à la renversée (`reading`), les pastilles (`chip`), les tuiles et le leurre d'une construction (`tile`, `decoy`).
 * `props` : { system, theme, ranges, start, chains, choices }.
 */
export function shownValues(props) {
  if (!props.choices?.length) return shownOne(props);
  return props.choices.flatMap((sys) => shownOne({ ...props, ...choiceProps(props, sys) }));
}

/** Les props d'une jumla du choix libre : son monde et ses bornes (`choiceSpec`), le départ par défaut (`startFor`). */
export function choiceProps(props, sys) {
  const spec = props.choiceSpec?.[sys] ?? {};
  return { system: sys, theme: spec.theme, ranges: spec.ranges, start: spec.start };
}

function shownOne(props) {
  const out = [];
  const lab0 = initRound(props);
  out.push(Rl('system', bare(props.system)));
  lab0.src.forEach((e) => out.push(Rl('eq', bare(e))));
  const sh = lab0.shape;
  if (sh.kind === 'count') out.push(Rl('total', sh.N), Rl('target', sh.V), Rl('coef', sh.p), Rl('coef', sh.q));
  out.push(Rl('start', L.pairText(lab0.start.x, lab0.start.y)));
  const sol = solutionIn(lab0);
  const at = (x, y) => [0, 1].forEach((i) => {
    const v = gaugeValue(lab0, i, x, y);
    if (v) out.push(Rl('reading', v.have));
    L.readingTex(lab0, i, x, y).lines.forEach((ln) => out.push(Rl('line', bare(ln))));
  });
  at(lab0.start.x, lab0.start.y);
  if (sol) {
    out.push(Rl('solution', L.pairText(sol.x, sol.y)));
    at(sol.x, sol.y);
    if (sol.x !== sol.y) {
      out.push(Rl('swap', L.pairText(sol.y, sol.x)));
      const inR = sol.y >= lab0.range.x.min && sol.y <= lab0.range.x.max && sol.x >= lab0.range.y.min && sol.x <= lab0.range.y.max;
      if (inR) at(sol.y, sol.x);
    }
    const solved = { ...lab0, solved: sol };
    chainsOf(props.chains).forEach((sp) => sp.qs.forEach((q) => {
      if (q === 'buildLine' && sh.kind === 'count') { const b = buildLine(solved); b.tiles.forEach((t) => out.push(Rl('tile', t))); out.push(Rl('decoy', b.decoy)); }
      if (q === 'buildEq2' && sh.kind === 'count') { const b = buildEq2(solved); b.tiles.forEach((t) => out.push(Rl('tile', t))); out.push(Rl('decoy', b.decoy)); }
      if (q === 'readCovered' && sh.kind === 'count') { const r = readCovered(solved); out.push(Rl('chip', r.right), ...r.wrong.map((w) => Rl('chip', w.v))); }
    }));
  }
  // une jumla parallèle (module 2) : la valeur que la jauge (2) lit sur TOUTE ثنائية de la jauge (1), et quelques-unes de ces ثنائيات
  if (sh.kind === 'count' && sh.p === sh.q) {
    out.push(Rl('reading', parallelFacts(lab0).full));
    eq1Pairs(lab0).forEach((pr) => out.push(Rl('solution', L.pairText(pr.x, pr.y))));
  }
  return out;
}
