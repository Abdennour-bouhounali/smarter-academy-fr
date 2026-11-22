import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import {
  parseModel, xRange, storyLin, storyCarried, partsAt, trialAt, solution, answer, modelTex, solvingLines, discoveryReady, grows, elementTex,
  inequalityLines,
  toNumber as nz,
} from './growthRace';

const { frac, linAt, fracText } = LIN;

/**
 * growth-race — LECTEUR DE MISSION (rollout 2026-11-11, unité 4 leçon 4 `tarrid-mushkila` ; conseil du 2026-11-11, verdict L4.1–L4.9).
 * Logique PURE lue par le lecteur seulement : la page, l'enseignant et la synthèse ne l'appellent pas (logic/growthRace.js est inchangé).
 */

const reducedSides = (model) => ({ L: storyLin(model, 'left'), R: storyLin(model, 'right') });
const uniq = (a) => a.filter((v, i) => a.indexOf(v) === i);

/** La structure de l'histoire, pour le balayage des rôles : 'three' = une personne contre la somme d'exactement trois ; 'factor3' ; 'ok'. */
export function structureOf(model) {
  const groups = (s) => model.sides[s].groups;
  if (groups('left').concat(groups('right')).some((g) => nz(g.k) === 3)) return 'factor3';
  const count = (s) => groups(s).length === 1 ? groups(s)[0].elements.filter((e) => grows(model, e)).length : -1;
  if ((count('left') === 1 && count('right') === 3) || (count('right') === 1 && count('left') === 3)) return 'three';
  return 'ok';
}

/**
 * Tout ce qu'un écran de la manche peut MONTRER, par rôle (balayage du contenu : content/forbidden.js) : les âges écrits (`age`), chaque âge et
 * chaque total à chaque x de la règle (`value`/`total`/`readout`), les âges simultanés d'un écran (`screen`), la solution, le total de la
 * rencontre (`meet`), la première valeur entière d'une inéquation (`first`), les équations écrites (`eq`), la structure.
 */
export function shownValues({ left, right, maxX, goal = 'equal', chains }) {
  const model = parseModel(left, right);
  const range = xRange(model, maxX);
  const out = [];
  const push = (role, v) => out.push({ role, v: String(v) });
  model.elements.forEach((el) => { if (el.kind === 'age') push('age', nz(el.c)); });
  for (let x = range.min; x <= range.max; x += 1) {
    const ages = [];
    for (const side of ['left', 'right']) {
      partsAt(model, side, x).forEach((p) => { push('value', nz(p.value)); if (p.kind === 'age') ages.push({ side, v: nz(p.value) }); });
      const total = nz(linAt(storyLin(model, side), frac(x)));
      push('total', total);
      push('readout', total);
    }
    out.push({ role: 'screen', ages, x });
  }
  const sol = solution(model);
  if (sol.x != null) {
    push('solution', fracText(sol.x));
    if (sol.kind === 'natural') push('meet', nz(linAt(storyLin(model, 'left'), sol.x)));
  }
  const ans = answer(model, goal);
  if (ans.first != null && goal !== 'equal') push('first', ans.first);
  const bare = (t) => String(t).replace(/\s+/g, '').replace(/\\left|\\right|\\times/g, '');
  push('eq', bare(modelTex(model, storyCarried(model))));
  solvingLines(model).lines.forEach((l) => push('eq', bare(l)));
  push('structure', structureOf(model));
  // la synthèse de l'unité (2026-11-12, ADDITIF) : deux TARIFS — leurs rôles, l'inéquation de la manche et les tuiles des questions du lecteur
  const pool = poolOf(model);
  if (pool) {
    push('rate', pool.a); push('rate', pool.b); push('fixed', pool.f); push('saving', pool.a - pool.b);
    if (goal !== 'equal' && ans.rel) L_INEQ(model, ans.rel).forEach((l) => push('eq', bare(l)));
    const qs = chainsOfPlayer(chains);
    if (qs.build.includes('ineqBuild')) ineqSpec(model).tiles.forEach((v) => push('tile', v));
    if (qs.race.includes('savingBuild')) { const sp = savingSpec(model); if (sp) sp.tiles.forEach((v) => push('tile', v)); }
    if (qs.race.includes('firstPool')) { const fp = firstSpec(model); if (fp) fp.options.forEach((v) => push('chip', v)); }
  }
  return out;
}

/* ── les prédictions du lecteur ── */

/** Les cartes à poser : les éléments qui changent (un nombre fixe, comme « 31 », n'en prend pas). */
const cardCount = (model) => storyCarried(model).length;

/** Les choix d'une prédiction (des nombres/clés ; le texte vient de i18n), dans un ordre tournant `pos` (la bonne place varie). */
export function predictOptions(model, kind, pos = 0) {
  let set = [];
  if (kind === 'cards') {
    const n = cardCount(model); const total = model.elements.length;
    set = uniq([n, total !== n ? total : n + 2, n !== 1 ? 1 : n + 1]);
  } else if (kind === 'ahead') set = ['left', 'right', 'same'];
  else if (kind === 'meets') set = ['yes', 'no'];
  return set.map((_, i) => set[(i + pos) % set.length]);
}

/** La vérité d'une prédiction, CALCULÉE (jamais une constante). */
export function predictTruth(model, kind, range) {
  if (kind === 'cards') return cardCount(model);
  if (kind === 'ahead') { const t = trialAt(model, range.max); return t.rel === '>' ? 'left' : t.rel === '<' ? 'right' : 'same'; }
  if (kind === 'meets') { const s = solution(model); return s.kind === 'natural' && nz(s.x) <= range.max ? 'yes' : 'no'; }
  return null;
}

/**
 * Les prédictions JUGÉES par le geste qui les tranche : `cards` au premier modèle juste, `ahead` au premier essai au-delà de la rencontre
 * (ou au bout de la règle s'il n'y a pas de rencontre), `meets` à la découverte.
 */
export function judgedPredictions(lab, preds, range) {
  const sol = solution(lab.model);
  const past = lab.trials.some((t) => (sol.x != null ? t.x > nz(sol.x) : t.x === range.max));
  const ready = discoveryReady(lab, range);
  return preds.filter((p) => (p.kind === 'cards' ? !!lab.verdict?.ok : p.kind === 'ahead' ? past : p.kind === 'meets' ? ready : false)).map((p) => p.key);
}

/* ── les suites de questions du lecteur ── */
const CHAINS_PLAYER = Object.freeze({
  sum4: { build: ['slopeTap', 'buildEq'], race: ['whereTap'] },
  mult: { build: ['buildEq'], race: ['whereTap', 'afterTap', 'ruleP'] },
  sum2: { build: ['buildEq'], race: ['whereTap'] },
  easy: { build: ['buildEq'], race: [] },
  past: { build: [], race: ['trendTap', 'solveTap', 'buildPast', 'rulePast'] },
  none: { build: [], race: [] },
  // la synthèse de l'unité 4 (wadiya-idmajiya-muadalat, 2026-11-12, ADDITIF) : deux TARIFS (« × x ») — bâtir l'inéquation « f + bx < ax »,
  // l'égalité n'est PAS la réponse (« ابتداءً من » = le premier entier au-delà), et ce qu'une séance économise rembourse l'abonnement
  pool: { build: ['ineqBuild'], race: ['wherePool', 'firstPool'] },
  poolEasy: { build: ['ineqBuild'], race: ['firstPool'] },
  poolSaving: { build: [], race: ['firstPool', 'savingBuild'] },
  poolSavingEasy: { build: [], race: ['savingBuild'] },
});
export const chainsOfPlayer = (mode) => CHAINS_PLAYER[mode] ?? CHAINS_PLAYER.none;

/** Les choix de « بكم يزيد … ؟ » : 1, la pente du membre qui grandit, et la constante. */
export function slopeChoices(model) {
  const { R } = reducedSides(model);
  return uniq([1, nz(R.a), nz(R.b)]).sort((p, q) => p - q);
}

/**
 * La question BÂTIR l'équation, dérivée du modèle : 'eqSum' (« ▢ = ▢ + ▢ » : une personne = a·x + b) ou 'eqSum2' (« ▢ + ▢ = ▢ » : deux
 * personnes et une cible). Un SEUL leurre — l'erreur classique : « + x » une seule fois ('x'), ou la cible qui « vieillit » ('31 + x').
 */
export function buildSpec(model) {
  const { R: Rs } = reducedSides(model);
  const leftEls = model.elements.filter((e) => e.side === 'left');
  const rightEls = model.elements.filter((e) => e.side === 'right');
  const tex = (el) => elementTex(model, el, true);
  if (leftEls.length === 1 && rightEls.some((e) => grows(model, e))) {
    const l = tex(leftEls[0]); const ax = nz(Rs.a) === 1 ? 'x' : `${nz(Rs.a)}x`; const b = String(nz(Rs.b));
    return { kind: 'eqSum', ops: ['=', '+'], expected: [l, ax, b], accept: [[l, b, ax]], tiles: [ax, b, 'x', l], decoy: 'x' };
  }
  if (leftEls.length >= 2 && rightEls.length === 1 && !grows(model, rightEls[0])) {
    const [e1, e2] = leftEls; const t = String(nz(Rs.b));
    return { kind: 'eqSum2', ops: ['+', '='], expected: [tex(e1), tex(e2), t], accept: [[tex(e2), tex(e1), t]], tiles: [`${t} + x`, tex(e2), t, tex(e1)], decoy: `${t} + x` };
  }
  return null;
}

/** BÂTIR le passé (solution négative) : « منذ ▢ سنوات : ▢ + ▢ = cible » — le leurre est l'âge du plus jeune dans |x| années (le futur). */
export function pastSpec(model) {
  const sol = solution(model);
  const els = model.elements.filter((e) => e.side === 'left' && e.kind === 'age');
  const target = nz(storyLin(model, 'right').b);
  if (sol.kind !== 'negative' || els.length !== 2) return null;
  const n = Math.abs(nz(sol.x));
  const [lo, hi] = els.map((e) => nz(e.c) - n).sort((p, q) => p - q);
  const decoy = Math.min(...els.map((e) => nz(e.c))) + n;
  return { n, ages: [lo, hi], target, decoy, expected: [String(n), String(lo), String(hi)], accept: [[String(n), String(hi), String(lo)]], tiles: [String(hi), String(decoy), String(n), String(lo)] };
}

/* ── le guide ── */
/** Le geste du moment (jamais la réponse) : { id, target } ou null. `ui` : { done, blocking }. */
export function coachOf(lab, ui = {}) {
  if (ui.done) return null;
  if (lab.stage === 'build') {
    if (!lab.carried.length) return { id: 'carry', target: '[data-gr-token]' };
    if (!lab.verdict) return { id: 'check', target: '[data-gr-check]' };
    if (lab.verdict.ok && !ui.blocking) return { id: 'open', target: '[data-gr-open-race]' };
    return null;
  }
  if (lab.trials.length === 0) return { id: 'stretch', target: '[data-gr-x]' };
  if (lab.trials.length === 1) return { id: 'again', target: '[data-gr-more]' };
  return null;
}

/** La clé d'un jeu de cartes (même jeu vérifié deux fois = un seul événement `model`). */
export const modelKey = (carried) => [...carried].sort().join('|');

/* ── la synthèse de l'unité 4 (2026-11-12, ADDITIF) : deux TARIFS « ax » contre « f + bx » ── */
const L_INEQ = (model, rel) => inequalityLines(model, rel).lines;

/** Les deux tarifs d'une course « ax » contre « f + bx » (a > b > 0, f > 0) — sinon null (une course d'âges, un autre tarif). */
export function poolOf(model) {
  if (model.op !== 'mul') return null;
  const Ls = model.elements.filter((e) => e.side === 'left'); const Rs = model.elements.filter((e) => e.side === 'right');
  const rateL = Ls.length === 1 && Ls[0].kind === 'rate' ? nz(Ls[0].c) : null;
  const rateR = Rs.find((e) => e.kind === 'rate'); const fixR = Rs.find((e) => e.kind === 'fixed');
  if (rateL == null || Rs.length !== 2 || !rateR || !fixR) return null;
  const a = rateL; const b = nz(rateR.c); const f = nz(fixR.c);
  return a > b && b > 0 && f > 0 ? { a, b, f } : null;
}

/** BÂTIR l'inéquation « la formule 2 est meilleure » : « f + bx < ax » — leurre : l'abonnement payé à chaque séance (« fx »). */
export function ineqSpec(model) {
  const p = poolOf(model);
  if (!p) return null;
  const f = String(p.f); const bx = `${p.b}x`; const ax = `${p.a}x`; const decoy = `${p.f}x`;
  return { ops: ['+', '<'], expected: [f, bx, ax], accept: [[bx, f, ax]], tiles: [bx, decoy, ax, f], decoy };
}

/** La première séance où la formule 2 est MEILLEURE : jetons [égalité, première, avant] — le piège est l'égalité. */
export function firstSpec(model) {
  const p = poolOf(model); const s = solution(model);
  if (!p || s.kind !== 'natural') return null;
  const n = nz(s.x);
  return { n, first: n + 1, options: [n, n + 1, Math.max(0, n - 1)], equal: nz(linAt(storyLin(model, 'left'), s.x)) };
}

/**
 * La construction NUMÉRIQUE de la synthèse : « (a − b) × n = f » — chaque séance, la formule 2 économise a − b ; après n séances l'économie
 * rembourse l'abonnement (l'égalité). Leurre : le prix a pris pour l'économie.
 */
export function savingSpec(model) {
  const p = poolOf(model); const s = solution(model);
  if (!p || s.kind !== 'natural') return null;
  const n = nz(s.x); const d = p.a - p.b;
  const tiles = [String(p.a), String(p.f), String(d), String(n)];
  return { a: p.a, b: p.b, f: p.f, d, n, ops: ['×', '='], expected: [String(d), String(n), String(p.f)], accept: [[String(n), String(d), String(p.f)]], tiles, decoy: String(p.a) };
}
