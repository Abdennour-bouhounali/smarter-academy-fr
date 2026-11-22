/**
 * inscribed-angle — LA LOGIQUE PURE du laboratoire « زاوية التسديد » (unité 13, leçon zawiya-muhitiya, manuel pp. 153,
 * 156, 159). Aucune arithmétique ici : chaque angle, chaque position (sur / dans / hors du cercle), chaque arc vient de
 * packages/core/arithmetic/rotation.js (`pointOnCircle`, `vertexAngle`, `arcAngles`, `angleAt`, `inscribedFromCentral`,
 * `circlePosition`, `normalize`). Ce module dit ce que la main a le droit de faire et ce que l'écran doit montrer.
 *
 * Le sommet tenu par la main (le tireur M, ou le point D du نشاط 4) est repéré en POLAIRE autour du centre O :
 * `t` (degrés, sens direct, depuis l'axe des abscisses) et `rho` (1 = sur le cercle, < 1 dedans, > 1 dehors).
 *
 * DEUX MODES (le mode suit le niveau) :
 *
 *   'striker' (مبتدئ, plateforme — l'angle de tir) : les poteaux A et B sont sur un cercle peint sur la pelouse ; l'angle
 *             au centre \widehat{AOB} (au point central) est donné. L'élève PARIE d'abord sur l'angle de tir (un pari de
 *             180° ou plus est refusé : un angle de triangle est plus petit ; le double de l'angle au centre est nommé),
 *             puis déplace le tireur : sur le grand arc l'angle ne bouge pas ; dedans il grandit, dehors il diminue (refusés :
 *             « ليست زاوية محيطية ») ; sur l'autre arc (derrière la ligne de but) l'angle intercepte l'AUTRE arc.
 *
 *   'act4'    (متقدم, نشاط 4 p. 153) : trois étapes ouvertes par l'élève — 'mezian' (placer D pour que [AD] soit un diamètre,
 *             lire les deux égalités du manuel puis CHOISIR la relation), 'houaria' (D n'importe où sur le grand arc : trois
 *             positions, O tantôt dans l'angle, tantôt dehors — la relation tient), 'interior' (D poussé DANS le disque :
 *             l'angle de l'exercice 12, qui n'est pas inscrit, vaut la demi-somme des deux arcs).
 */
import * as R from '@smarter-academy/core/arithmetic/rotation.js';
import * as linear from '@smarter-academy/core/arithmetic/linear.js';

const STAGES = Object.freeze(['mezian', 'houaria', 'interior']);
/** Tolérance de l'aimant du cercle (fraction du rayon) et pas de la distance hors du cercle. */
const SNAP = 0.07;
const RHO_STEP = 0.05;
const RHO_MIN = 0.25;
export const RHO_MAX = 1.45;
/** Deux positions sont « différentes » si leurs directions diffèrent d'au moins tant de degrés. */
const DISTINCT = 15;
/** Un sommet à moins de tant de degrés d'un poteau n'a plus d'angle lisible : il est repoussé. */
export const POST_GAP = 6;

const O = Object.freeze({ x: 0, y: 0 });
const toNum = (v) => (typeof v === 'number' ? v : linear.toNumber(v));
const round6 = (v) => Math.round(v * 1e6) / 1e6;
/** Un angle mesuré, nettoyé du bruit flottant : 59.9999999 → 60. */
export const clean = (v) => { const r = round6(v); return Math.abs(r - Math.round(r)) < 1e-6 ? Math.round(r) : r; };
/** Un angle écrit à la manière du manuel : 60 → « 60 », 62.5 → « 62,5 », 75.42 → « 75,4 ». */
export const degText = (v) => { const c = clean(v); return Number.isInteger(c) ? String(c) : String(Math.round(c * 10) / 10).replace('.', ','); };

export function init(numbers = {}) {
  const mode = Array.isArray(numbers.stages) ? 'act4' : 'striker';
  const r = Number(numbers.r ?? 4);
  const A = R.normalize(numbers.A ?? 150);
  const B = R.normalize(numbers.B ?? 30);
  const t0 = R.normalize(numbers.M ?? numbers.D ?? 270);
  const Apt = R.pointOnCircle(O, r, A); const Bpt = R.pointOnCircle(O, r, B);
  const central = clean(R.angleAt(Apt, O, Bpt));
  return Object.freeze({
    mode, r, A, B, Apt, Bpt, central,
    inscribed: clean(toNum(R.inscribedFromCentral(central))),
    name: mode === 'act4' ? 'D' : 'M',
    stages: mode === 'act4' ? Object.freeze(numbers.stages.filter((s) => STAGES.includes(s))) : Object.freeze([]),
    stage: mode === 'act4' ? numbers.stages[0] : null,
    pos: Object.freeze({ t: t0, rho: 1 }),
    bet: null, relation: null,
    trials: Object.freeze([]), last: null,
  });
}

/** Le point (unités du dessin) de la position polaire `pos`. */
export const pointOf = (s, pos = s.pos) => R.pointOnCircle(O, s.r * pos.rho, pos.t);
/** Le point de la direction diamétralement opposée à A (le D de مزيان). */
export const diameterT = (s) => R.normalize(s.A + 180);

/**
 * Ce que la position `pos` donne : la place du sommet (sur / dans / hors du cercle), l'arc où il est (le GRAND arc —
 * celui qui ne porte pas l'arc intercepté AB — ou l'autre), l'angle \widehat{AMB} et, hors du cercle, les arcs de la règle.
 */
export function measure(s, pos = s.pos) {
  const P = pointOf(s, pos);
  const v = R.vertexAngle(O, s.Apt, s.Bpt, P);
  const position = pos.rho === 1 ? 'on' : v.position;
  let arc = null;
  if (position === 'on') arc = R.arcAngles(O, s.Apt, s.Bpt, P).reflex ? 'minor' : 'major';
  // O dans l'angle \widehat{ADB} ⇔ les angles ADO et ODB s'ajoutent (la figure de هوارية : D′ diamétralement opposé sur l'arc AB)
  const oInside = position === 'on' && arc === 'major'
    ? Math.abs(R.angleAt(s.Apt, P, O) + R.angleAt(O, P, s.Bpt) - v.angle) < 1e-6 : null;
  return Object.freeze({
    position, arc, angle: clean(v.angle),
    far: clean(v.far), near: clean(v.near ?? 0), rule: position === 'on' ? 'inscribed' : v.rule,
    A2: v.A2, B2: v.B2, oInside,
    diameter: position === 'on' && Math.abs(R.normalize(pos.t - diameterT(s))) < 1e-9,
  });
}

/**
 * La position que la main DEMANDE (pointeur, clavier, boutons) devient une position LÉGALE : degré entier ; aimant du
 * cercle (|ρ − 1| ≤ SNAP → ρ = 1) ; ρ par pas de RHO_STEP dans [RHO_MIN ; RHO_MAX] ; à l'étape de مزيان, la direction
 * du diamètre aimante à ±3° ; un sommet collé à un poteau est repoussé (un angle n'y a plus de sens).
 */
export function legal(s, t, rho) {
  let tt = R.normalize(Math.round(t));
  let rr = Math.abs(rho - 1) <= SNAP ? 1 : Math.round(Math.min(RHO_MAX, Math.max(RHO_MIN, rho)) / RHO_STEP) * RHO_STEP;
  rr = Math.round(rr * 100) / 100;
  if (rr === 1 && s.stage === 'mezian') {
    const d = R.normalizeSigned(tt - diameterT(s));
    if (Math.abs(d) <= 3) tt = diameterT(s);
  }
  for (const post of [s.A, s.B]) {
    const d = R.normalizeSigned(tt - post);
    if (Math.abs(d) < POST_GAP && rr > 0.8 && rr < 1.25) tt = R.normalize(post + (d < 0 ? -POST_GAP : POST_GAP));
  }
  return Object.freeze({ t: tt, rho: rr });
}

/** Déplacer le sommet SANS juger (pendant le geste) : la lecture suit, l'essai ne compte qu'au relâchement (`place`). */
export const moveTo = (s, pos) => Object.freeze({ ...s, pos: legal(s, pos.t, pos.rho) });

/**
 * Le verdict d'une position VALIDÉE, selon le mode et l'étape :
 *   'inside' | 'outside'  le sommet n'est pas sur le cercle : ce n'est pas une زاوية محيطية (refus, sauf l'étape 'interior'
 *                         où l'intérieur est le but : 'interior') ;
 *   'minor'               sur le cercle, mais de l'autre côté de la corde (derrière la ligne de but / sur l'arc coloré) ;
 *   'major'               sur le grand arc : l'angle inscrit qui intercepte l'arc AB ;
 *   'diameter' | 'notDiameter'  à l'étape de مزيان.
 */
function verdictOf(s, m) {
  if (m.position !== 'on') {
    if (s.stage === 'interior' && m.position === 'inside') return 'interior';
    return m.position;
  }
  if (m.arc === 'minor') return 'minor';
  if (s.stage === 'mezian') return m.diameter ? 'diameter' : 'notDiameter';
  return 'major';
}
/** Les verdicts qui REFUSENT la position (l'élève voit pourquoi ; l'essai est gardé comme contraste). */
const REFUSED = Object.freeze(['inside', 'outside', 'notDiameter']);

/** Valider la position `pos` (relâchement, pause au clavier, bouton) : un essai jugé, retenu dans la mémoire du lab. */
export function place(s, pos = s.pos) {
  const p = legal(s, pos.t, pos.rho);
  const m = measure(s, p);
  const kind = verdictOf(s, m);
  const trial = Object.freeze({ t: p.t, rho: p.rho, stage: s.stage, kind, ...m, refused: REFUSED.includes(kind) });
  return Object.freeze({ ...s, pos: p, trials: Object.freeze([...s.trials, trial]), last: Object.freeze({ kind: 'trial', trial }) });
}

/**
 * Le PARI (mode striker, avant toute lecture de l'angle de tir) : un nombre de degrés.
 *   'impossible' ≥ 180° ou ≤ 0 — un angle de triangle (M, A, B) est strictement entre 0° et 180° : refusé ;
 *   'double'     le double de l'angle au centre (l'erreur MISC-MUHITIYA-DIF) : refusé, et nommé ;
 *   'equal'      l'angle au centre lui-même : accepté comme pari — les mesures le contrediront ;
 *   'half'       la moitié : accepté ; 'other' : accepté.
 * Le pari se change tant qu'aucun essai n'a été fait sur le cercle.
 */
export function betVerdict(s, value) {
  if (value == null || !Number.isFinite(value)) return 'empty';
  if (Math.abs(value - 2 * s.central) < 1e-9) return 'double';
  if (value >= 180 || value <= 0) return 'impossible';
  if (Math.abs(value - s.central) < 1e-9) return 'equal';
  if (Math.abs(value - s.inscribed) < 1e-9) return 'half';
  return 'other';
}
const BET_REFUSED = Object.freeze(['empty', 'impossible', 'double']);
export const canBet = (s) => s.mode === 'striker' && !s.trials.some((t) => t.position === 'on');
export function bet(s, value) {
  if (!canBet(s)) return s;
  const verdict = betVerdict(s, value);
  const b = Object.freeze({ value, verdict, refused: BET_REFUSED.includes(verdict) });
  return Object.freeze({ ...s, bet: b.refused ? s.bet : b, last: Object.freeze({ kind: 'bet', bet: b }) });
}
/** Le pari tient-il (un pari accepté a été posé) ? Avant, l'angle de tir reste caché (« ? »). */
export const hasBet = (s) => s.mode !== 'striker' || (s.bet != null && !s.bet.refused);

/**
 * L'étape de مزيان : une fois D posé au bout du diamètre, l'élève CHOISIT la relation entre \widehat{AOB} et \widehat{ADB}
 * (les deux égalités du manuel sont écrites avec SES nombres) : 'double' (\widehat{AOB} = 2\widehat{ADB}) juste ;
 * 'half' (= ½ \widehat{ADB}, l'erreur MISC-MUHITIYA-DIF) et 'equal' réfutés par les nombres.
 */
const RELATIONS = Object.freeze(['double', 'half', 'equal']);
export const mezianReady = (s) => s.trials.some((t) => t.stage === 'mezian' && t.kind === 'diameter');
export function pickRelation(s, choice) {
  if (!mezianReady(s) || !RELATIONS.includes(choice)) return s;
  const ok = choice === 'double';
  return Object.freeze({ ...s, relation: ok ? 'double' : s.relation, last: Object.freeze({ kind: 'relation', choice, ok }) });
}

/** Les essais acceptés sur le grand arc (une étape donnée, ou le mode striker), à directions DIFFÉRENTES. */
export function distinctMajor(s, stage = s.mode === 'act4' ? 'houaria' : null) {
  const out = [];
  for (const tr of s.trials) {
    if (tr.kind !== 'major' || (stage && tr.stage !== stage)) continue;
    if (out.every((o) => Math.abs(R.normalizeSigned(o.t - tr.t)) >= DISTINCT)) out.push(tr);
  }
  return out;
}
/** Un contraste a-t-il été vu : le sommet hors du cercle, ou sur l'autre arc ? */
const contrastSeen = (s) => s.trials.some((t) => t.position !== 'on' || t.kind === 'minor');

/** L'étape est-elle accomplie (la carte « التالي » s'ouvre) ? */
export function stageDone(s, stage = s.stage) {
  if (stage === 'mezian') return s.relation === 'double';
  if (stage === 'houaria') {
    const d = distinctMajor(s, 'houaria');
    return d.length >= 3 && d.some((t) => t.oInside === true) && d.some((t) => t.oInside === false);
  }
  if (stage === 'interior') return s.trials.some((t) => t.kind === 'interior');
  return false;
}
/** Passer à l'étape suivante (geste de l'élève, après `stageDone`) ; revenir en arrière garde tout. */
export function advance(s) {
  const i = s.stages.indexOf(s.stage);
  if (i < 0 || i >= s.stages.length - 1 || !stageDone(s)) return s;
  const next = s.stages[i + 1];
  const pos = next === 'interior' ? legal(s, s.pos.t, 0.6) : s.pos;
  return Object.freeze({ ...s, stage: next, pos, last: null });
}
export function back(s) {
  const i = s.stages.indexOf(s.stage);
  if (i <= 0) return s;
  const prev = s.stages[i - 1];
  return Object.freeze({ ...s, stage: prev, pos: legal({ ...s, stage: prev }, s.pos.t, 1), last: null });
}

/** Le but du mode striker : deux positions différentes sur le grand arc, après le pari. */
export const goalMet = (s) => hasBet(s) && distinctMajor(s).length >= 2;

/**
 * La découverte s'ouvre sur un CONTRASTE (MANIPULATION_DNA §3.6) :
 *   striker  le pari, DEUX positions différentes sur le grand arc (le même angle) ET un sommet hors du cercle ou sur
 *            l'autre arc (un angle différent) ;
 *   act4     les trois étapes : la relation de مزيان choisie, trois positions de هوارية (O dedans ET dehors), un D intérieur.
 */
export function discoveryReady(s) {
  if (s.mode === 'act4') return s.stages.every((st) => stageDone(s, st));
  return goalMet(s) && contrastSeen(s);
}

/**
 * Deux essais du grand arc à des distances DIFFÉRENTES de la ligne de but (le milieu de [AB]) — pour réfuter
 * « plus on est près du but, plus l'angle est grand » avec les nombres de l'élève. null s'il n'y en a pas deux.
 */
export function nearFar(s) {
  const mid = { x: (s.Apt.x + s.Bpt.x) / 2, y: (s.Apt.y + s.Bpt.y) / 2 };
  const d = (tr) => { const p = pointOf(s, tr); return Math.hypot(p.x - mid.x, p.y - mid.y); };
  const list = distinctMajor(s).slice().sort((a, b) => d(a) - d(b));
  if (list.length < 2) return null;
  const [near, far] = [list[0], list[list.length - 1]];
  if (d(far) - d(near) < s.r * 0.15) return null;
  return { near, far, nearDist: d(near), farDist: d(far) };
}

/** Le dernier événement, en données plates pour `onTrial` (les modules listent les essais de l'élève). */
export function evidenceOf(s) {
  const last = s.last;
  if (!last) return null;
  if (last.kind === 'bet') return { mode: s.mode, kind: 'bet', value: last.bet.value, verdict: last.bet.verdict };
  if (last.kind === 'relation') return { mode: s.mode, kind: 'relation', choice: last.choice, ok: last.ok };
  const tr = last.trial;
  return {
    mode: s.mode, kind: tr.kind, stage: tr.stage, t: tr.t, rho: tr.rho, name: s.name,
    angle: degText(tr.angle), central: degText(s.central), far: degText(tr.far), near: degText(tr.near), oInside: tr.oInside,
  };
}

/**
 * Les angles du triangle de مزيان quand D est au bout du diamètre (les nombres des deux égalités du manuel) :
 * \widehat{BAD} (intercepte l'arc BD), \widehat{ADB} (l'arc AB), \widehat{AOB}.
 */
export function mezianNumbers(s) {
  const D = R.pointOnCircle(O, s.r, diameterT(s));
  return Object.freeze({
    BAD: clean(R.angleAt(s.Bpt, s.Apt, D)), ADB: clean(R.angleAt(s.Apt, D, s.Bpt)), AOB: s.central,
    AOD: 180,
  });
}
/** L'angle \widehat{AOD} (au centre) d'une position D sur le cercle — ce qui manque au diamètre (« 150° لا 180° »). */
export const aodOf = (s, pos = s.pos) => clean(R.angleAt(s.Apt, O, pointOf(s, pos)));

/* ── les étapes du labo et leurs questions (LabCheckpoint, lot 4) ─────────── */

/**
 * Les ÉTAPES : striker = `major` (le pari ET deux positions du grand arc), `contrast` (+ un sommet hors du cercle ou sur l'autre arc = `discoveryReady`) ;
 * act4 = les étapes du niveau (`mezian`, `houaria`, `interior`), chacune finie quand `stageDone`. Une suite de questions s'ouvre quand l'objectif de
 * l'étape ET des précédentes est atteint.
 */
export function stepsOf(s) {
  const flags = s.mode === 'act4' ? s.stages.map((st) => [st, stageDone(s, st)]) : [['major', goalMet(s)], ['contrast', discoveryReady(s)]];
  return flags.map(([id], i) => ({ id, reached: flags.slice(0, i + 1).every(([, ok]) => ok) }));
}

/** « أعِد التجربة » : remet LA MÊME étape au départ (les étapes précédentes ne bougent pas). */
export function retryStep(s, id) {
  if (s.mode === 'striker') {
    if (id === 'major') return Object.freeze({ ...s, bet: null, trials: Object.freeze([]), pos: legal(s, s.pos.t, 1), last: null });
    if (id === 'contrast') return Object.freeze({ ...s, trials: Object.freeze(s.trials.filter((t) => t.position === 'on' && t.kind === 'major')), pos: legal(s, s.pos.t, 1), last: null });
    return s;
  }
  if (!s.stages.includes(id)) return s;
  const base = { ...s, stage: id, trials: Object.freeze(s.trials.filter((t) => t.stage !== id)), last: null };
  if (id === 'mezian') base.relation = null;
  const next = Object.freeze(base);
  return Object.freeze({ ...next, pos: legal(next, s.pos.t, id === 'interior' ? 0.6 : 1) });
}

/** Le dernier essai « hors règle » (sommet hors du cercle ou sur l'autre arc), pour la question de contraste. */
export const lastContrast = (s) => [...s.trials].reverse().find((t) => t.position !== 'on' || t.kind === 'minor') ?? null;
/** Le dernier essai gardé d'une étape (ou, en striker, du grand arc). */
export const lastOf = (s, kind) => [...s.trials].reverse().find((t) => t.kind === kind) ?? null;
