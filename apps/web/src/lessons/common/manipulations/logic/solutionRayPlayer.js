import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import {
  initLab, evaluate, evaluateX, inRange, xOfK, sideOf, hasContrast, current, isSolved, transformDone, cardsFor, candidates, chooseStep,
  numText, ineqPlain,
} from './solutionRay.js';

const { frac, isZero, eq } = Lin;

/**
 * solution-ray — LOGIQUE PURE DU LECTEUR DE MISSION (rollout 2026-11-11, unité 4 « معادلات ومتراجحات », leçon 3 `mutarajiha-ula` ;
 * verdict du conseil du 2026-11-11, L3.1–L3.9). Jamais appelée par la page : les 16 tests de `solutionRay.test.js` ne bougent pas, ceux-ci
 * sont dans `solutionRayPlayer.test.js`.
 *
 * Un ESSAI (verdict L3.2) : manches sans crochet — une graduation NOUVELLE relâchée ; manches avec crochet — « ثبّت » sur un brouillon NOUVEAU,
 * ou une ligne NOUVELLE choisie pour une étape (les sondes sont libres : ce sont les preuves de l'élève, jamais comptées). La division finale
 * (`divide: 'coef'`) est BÂTIE avec des tuiles (verdict L3.3) : c'est le juge de `chooseStep` qui décide, ses traces à l'appui.
 */

export const relGlyph = (rel) => ({ '<': '<', '<=': '≤', '>': '>', '>=': '≥' })[rel];

/** L'étape de la DIVISION par le coefficient : plus de x à droite, plus de nombre à gauche, un coefficient autre que ±1. */
export const isDivisionStage = (I) => !isSolved(I) && isZero(I.R.a) && isZero(I.L.b) && !isZero(I.L.a) && !eq(I.L.a, -1);

/**
 * La dernière graduation qui reste solution (rayon vers la gauche) ou la première (vers la droite), ses voisins EXTÉRIEUR (faux) et
 * INTÉRIEUR (vrai, mais pas le dernier) — `null` si la droite ne contient aucune solution.
 */
export function edgeInfo(lab) {
  const left = sideOf(lab.sol) === 'left';
  let edge = null;
  for (let k = lab.kmin; k <= lab.kmax; k += 1) {
    if (!evaluate(lab, k).ok) continue;
    if (left) edge = k; else if (edge == null) edge = k;
  }
  if (edge == null) return null;
  const out = edge + (left ? 1 : -1);
  const inn = edge + (left ? -1 : 1);
  return { left, edge, out: inRange(lab, out) ? out : null, inn: inRange(lab, inn) && evaluate(lab, inn).ok ? inn : null };
}

/** La FRONTIÈRE est épinglée (but `discovered` des manches sans crochet) : la dernière graduation solution ET son voisin extérieur sont tracés. */
export function borderSeen(lab) {
  const g = edgeInfo(lab);
  if (!g) return false;
  const has = (k) => lab.traces.some((t) => t.k === k);
  return has(g.edge) && (g.out == null || has(g.out));
}

/** Ce que la division à bâtir attend : la carte, la bonne ligne (relation + borne) et son contraire (le leurre : le sens inversé / gardé à tort). */
export function divisionParts(lab) {
  const I = current(lab);
  const card = { op: 'div', k: I.L.a };
  const c = candidates(lab, card);
  const wrongRel = c.rel === c.kept.rel ? c.flipped.rel : c.kept.rel;
  const bound = numText(c.kept.R.b);
  return {
    card, rel: c.rel, flips: c.flips, wrongRel, bound,
    expected: [relGlyph(c.rel), bound],
    tiles: [relGlyph(c.rel), bound, relGlyph(wrongRel)],
    divisorText: numText(I.L.a),
    // le TÉMOIN du sens inversé / gardé à tort, pris dans SES traces (même juge que `chooseStep`)
    refusal: chooseStep(lab, card, wrongRel),
  };
}

/** « (−2) ÷ (−2) = ▢ » : le résultat, son opposé, la somme des deux nombres, zéro. */
export function divisionFillParts(lab) {
  const I = current(lab);
  const r = Lin.div(I.R.b, I.L.a);
  const all = [r, Lin.neg(r), Lin.add(I.R.b, I.L.a), frac(0)];
  const opts = all.filter((v, i) => all.findIndex((u) => Lin.eq(u, v)) === i).slice(0, 4);
  return { dividend: numText(I.R.b), divisor: numText(I.L.a), expected: numText(r), options: opts.map(numText) };
}

const uniq = (xs) => [...new Set(xs.filter((v) => v != null))];

/** Les chiffres à écrire d'après SES traces : la valeur du membre de gauche à la dernière trace rouge, ou cette trace elle-même, et leurs leurres. */
export function edgeFillParts(lab) {
  const g = edgeInfo(lab);
  if (!g) return null;   // une droite sans solution : aucune pastille à proposer (les manches en ont toujours une, rays.test.js)
  const cost = (k) => numText(evaluate(lab, k).left);
  const at = (k) => (inRange(lab, k) ? numText(xOfK(lab, k)) : null);
  const x = xOfK(lab, g.edge);
  return {
    costExpected: cost(g.edge),
    costOptions: uniq([cost(g.edge), g.out != null ? cost(g.out) : null, numText(Lin.mul(lab.ineq.L.a, x)), numText(Lin.add(x, lab.ineq.L.b))]).slice(0, 4),
    edgeExpected: numText(x),
    edgeOptions: uniq([at(g.edge), at(g.out ?? NaN), at(g.edge + (g.left ? -1 : 1)), at(g.edge + (g.left ? 2 : -2))]).slice(0, 4),
    edgeX: numText(x), outX: g.out != null ? numText(xOfK(lab, g.out)) : null, left: g.left,
    outE: g.out != null ? evaluate(lab, g.out) : null, edgeE: evaluate(lab, g.edge),
  };
}

/** BÂTIR « ▢x + ▢ ▢ ▢ » : le coefficient, le nombre, le signe, le second membre ; UN leurre = le signe voisin (strict ↔ large). */
export function buildIneqParts(lab) {
  const I = lab.ineq;
  const near = { '<': '<=', '<=': '<', '>': '>=', '>=': '>' }[I.rel];
  const expected = [numText(I.L.a), numText(I.L.b), relGlyph(I.rel), numText(I.R.b)];
  return { expected, tiles: [...expected, relGlyph(near)], decoyRel: near, decoy: relGlyph(near) };
}

/* ── les PRÉDICTIONS (≤ 2 par manche) : des clés ; options et vérité CALCULÉES ici ── */

export const isSolKey = (key) => /^isSol:-?\d+$/.test(key);
export const isSolX = (key) => Number(key.slice(6));
export function predictOptions(lab, key) {
  if (isSolKey(key)) return ['yes', 'no'];
  if (key === 'redSide') return ['small', 'large'];
  return [];
}
export function predictTruth(lab, key) {
  if (isSolKey(key)) return evaluateX(lab, frac(isSolX(key), 1)).ok ? 'yes' : 'no';
  if (key === 'redSide') return sideOf(lab.sol) === 'left' ? 'small' : 'large';
  return null;
}
/** Les prédictions JUGÉES par la droite : toutes, quand la manche a tranché (frontière épinglée, crochet posé). */
export const judgedPredictions = (lab, keys, ready = false) => (ready ? keys : []);
export const PREDICT_KEYS_OK = (key) => isSolKey(key) || key === 'redSide';

/* ── le GUIDE (LabCoach) : le geste, jamais la réponse (ni la borne, ni le sens) ── */

/**
 * `ctx` : { mode: 'region' | 'bracket' | 'flip', done, draft: { k, side, toward }, card (une carte est choisie), divStage }.
 * Il ne dit jamais « entre un point rouge et un gris » (une stratégie) : un élève bloqué reçoit la manche `easier`.
 */
export function coachOf(lab, ctx = {}) {
  if (ctx.done) return null;
  const { mode = 'region', draft = {}, card = false, divStage = false } = ctx;
  if (lab.traces.length === 0 && !lab.bracket) return { id: 'probe', target: '[data-ray-probe]', gesture: 'drag', prefer: 'above' };
  if (!hasContrast(lab) && !lab.bracket) return { id: 'again', target: '[data-ray-track]', gesture: 'tap', prefer: 'below' };
  if (mode === 'region') return null;
  if (!lab.bracket) {
    if (draft.k == null) return { id: 'bracket', target: '[data-ray-bracket-handle]', gesture: 'drag', prefer: 'below' };
    if (draft.side == null) return { id: 'side', target: '[data-ray-sides]', gesture: 'tap', prefer: 'below' };
    if (draft.toward == null) return { id: 'toward', target: '[data-ray-towards]', gesture: 'tap', prefer: 'below' };
    return { id: 'fix', target: '[data-ray-fix]', gesture: 'tap', prefer: 'above' };
  }
  if (mode === 'flip' && !divStage && !transformDone(lab)) {
    return card
      ? { id: 'line', target: '[data-ray-choices]', gesture: 'tap', prefer: 'above' }
      : { id: 'card', target: '[data-ray-cards]', gesture: 'tap', prefer: 'above' };
  }
  return null;
}

/* ── TOUT ce qu'un écran du lecteur peut montrer (règle « valeurs interdites par RÔLE », conseils du 2026-11-10 et du 2026-11-11) ── */

const norm = (s) => String(s).replace(/\s+/g, '');

/**
 * `{ role, v }` pour une manche (`props` : { ineq, whole, min, max, bracket, transform, divide, sequence, choices, chains, predict }) :
 *   expr / line — l'inéquation et chaque ligne de sa chaîne (texte simple) ; coef / const — les deux membres ; bound — la borne ;
 *   probe — CHAQUE graduation de la droite et chaque x à tester d'une prédiction ; member — les DEUX valeurs des membres à CHAQUE graduation
 *   (une barre, une ligne calculée) ; divisor — chaque diviseur / multiplicateur des cartes ; cardk — les nombres ajoutés / retranchés ;
 *   tile / chip — la construction et ses pastilles.
 */
export function shownValues(props = {}) {
  const out = [];
  const push = (role, v) => out.push(Object.freeze({ role, v: norm(v) }));
  const flip = props.bracket !== false && props.transform === true;
  const one = (src, o) => {
    const lab = initLab({ ineq: src, whole: props.whole ?? false, min: o.min, max: o.max });
    const I = lab.ineq;
    push('expr', ineqPlain(I));
    [I.L, I.R].forEach((P) => { push('coef', numText(P.a)); push('const', numText(P.b)); });
    push('bound', numText(lab.sol.bound));
    for (let k = lab.kmin; k <= lab.kmax; k += 1) {
      const e = evaluate(lab, k);
      push('probe', numText(e.x)); push('member', numText(e.left)); push('member', numText(e.right));
    }
    if (flip) {
      let tmp = lab;
      for (let i = 0; i < 8 && !transformDone(tmp); i += 1) {
        if (props.divide === 'coef' && isDivisionStage(current(tmp))) {
          const d = divisionParts(tmp);
          d.tiles.forEach((t) => push('tile', t));
          const f = divisionFillParts(tmp);
          f.options.forEach((v) => push('chip', v));
          push('divisor', d.divisorText);
          break;
        }
        const cs = cardsFor(current(tmp), props.divide);
        if (!cs.length) break;
        cs.forEach((c) => push(c.op === 'div' || c.op === 'mul' ? 'divisor' : 'cardk', numText(c.k)));
        const c = cs[0];
        tmp = chooseStep(tmp, c, candidates(tmp, c).rel).lab;
        push('line', ineqPlain(current(tmp)));
      }
    }
    if (props.chains && props.chains !== 'none' && props.bracket === false) {
      buildIneqParts(lab).tiles.forEach((t) => push('tile', t));
      if (edgeInfo(lab)) { const f = edgeFillParts(lab); (props.chains === 'cost' ? f.costOptions : f.edgeOptions).forEach((v) => push('chip', v)); }
    }
    (props.predict ?? []).filter(isSolKey).forEach((key) => push('probe', key.slice(6)));
  };
  (props.sequence ?? [props.ineq]).filter(Boolean).forEach((s) => one(s, { min: props.min, max: props.max }));
  (props.choices ?? []).forEach((c) => one(c, {}));
  return out;
}
