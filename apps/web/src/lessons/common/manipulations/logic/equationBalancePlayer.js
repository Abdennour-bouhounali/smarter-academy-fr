import * as B from './equationBalance.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';

/**
 * La logique PURE du LECTEUR DE MISSION de `equation-balance` (rollout 2026-11-11, unité 4 leçon 1 `muadala-ula` ; conseil du 2026-11-11,
 * verdict « L1 »). `logic/equationBalance.js` (la page, l'enseignant, le mode classe) n'est PAS touché : tout ce qui suit est AJOUTÉ ici.
 *
 *   UN ESSAI = une équation NOUVELLE écrite (étape des deux plateaux ou partage dont le résultat n'est pas une équation déjà écrite dans la
 *   manche) OU un geste REFUSÉ (`REFUSALS`) ; le même refus deux fois dans le même état, « noneHere » et « full » ne comptent pas ; le PREMIER
 *   refus de la manche est gratuit (le composant le marque `free`).
 *   Les SUITES de questions (`CHAIN_SPECS`) posent une question sur ce que l'élève vient de FAIRE : ce que la balance dessine après sa
 *   première étape (observer, puis BÂTIR l'équation avec UN leurre), le poids d'un sac lu, puis LA RÈGLE.
 *   Les PRÉDICTIONS (≤ 2 par manche, avant le premier geste) ont leur vérité calculée ici, jamais écrite à la main.
 *   `shownValues(props)` liste TOUT ce qu'un écran d'une manche peut montrer, avec son rôle, pour le balayage « valeurs interdites par
 *   rôle » (content/forbidden.js).
 */

const { isZero, toNumber } = Lin;
const { fracLatex, fracText } = B;

const REFUSALS = Object.freeze(['tipped', 'moveAcross', 'bagsUneven', 'cutMixed', 'noBags']);
/** Un refus qui compte comme un essai (« noneHere » et « full » sont des gestes impossibles, pas des idées). */
export const isRefusal = (reason) => REFUSALS.includes(reason);

/** Une écriture TeX ramenée à sa forme nue : sans espaces, « − » → « - ». */
const bare = (v) => String(v).replace(/\s+/g, '').replace(/−/g, '-');

/** L'identifiant d'une ligne écrite (pour reconnaître une équation déjà écrite dans la manche). */
export const lineSig = (pans) => bare(B.equationTex(pans));

// ── jouer la balance (tests, balayage) ───────────────────────────────────────

/** Le geste (objet + sens) qui réalise l'effet `effect` sur ce plateau, avec ce qu'il contient. */
function gestureFor(p, effect) {
  if (effect === '-1') return toNumber(p.u) >= 1 ? 'remove:ball' : 'add:balloon';
  if (effect === '+1') return toNumber(p.u) <= -1 ? 'remove:balloon' : 'add:ball';
  if (effect === '-x') return p.a >= 1 ? 'remove:bag' : 'add:anti';
  return p.a <= -1 ? 'remove:anti' : 'add:bag';
}

/**
 * Le chemin EFFICACE de la balance, dans l'un des deux ordres (`'units'` : d'abord les unités, `'bags'` : d'abord les sacs) : des étapes
 * { effect, n } faites sur les deux plateaux, puis le partage en `k`. Les manches du lecteur n'ont que des sacs positifs.
 */
export function efficientPlan(src, order = 'bags') {
  const { L, R } = B.init(src).pans;
  const bagPan = L.a >= R.a ? L : R;
  const collect = Math.min(Math.abs(L.a), Math.abs(R.a));
  const bagsStep = collect > 0 && Math.sign(L.a) === Math.sign(R.a) ? { effect: L.a > 0 ? '-x' : '+x', n: collect } : null;
  const uB = toNumber(bagPan.u);
  const unitsStep = uB !== 0 ? { effect: uB > 0 ? '-1' : '+1', n: Math.abs(uB) } : null;
  const steps = (order === 'units' ? [unitsStep, bagsStep] : [bagsStep, unitsStep]).filter(Boolean);
  return { steps, k: Math.abs(L.a - R.a) };
}

/** Joue un chemin : la balance finale, chaque équation écrite, les gestes faits. `open` : ouvre les sacs à la fin. */
export function playPlan(src, plan, { open = false } = {}) {
  let lab = B.init(src);
  const moves = []; const lines = [];
  plan.steps.forEach(({ effect, n }) => {
    ['L', 'R'].forEach((side) => {
      for (let i = 0; i < n; i += 1) { const g = gestureFor(lab.pans[side], effect); lab = B.gesture(lab, side, g); moves.push({ g, side }); }
    });
    lines.push(B.equationTex(lab.pans));
  });
  if (plan.k > 1) { lab = B.divide(lab, plan.k); lines.push(B.equationTex(lab.pans)); }
  if (open) lab = B.verify(lab);
  return { lab, moves, lines };
}

// ── moments d'une suite de questions ────────────────────────────────────────

const bothSteps = (lab) => lab.history.filter((s) => s.kind === 'both');
/** L'équation réduite ax = b (ou b = ax) : des sacs seuls d'un côté, des unités seules de l'autre, la balance horizontale. */
function reducedForm(lab) {
  if (lab.pending) return false;
  const { L, R } = lab.pans;
  return (L.a !== 0 && R.a === 0 && isZero(L.u)) || (R.a !== 0 && L.a === 0 && isZero(R.u));
}
/** Une première étape des deux plateaux est écrite et la balance est horizontale. */
const firstLineReached = (lab) => !lab.pending && bothSteps(lab).length > 0;
/** Un sac seul en face des unités : on lit x. */
const bagReadReached = (lab) => B.isSolved(lab);
/** Un sac a été lu ET les sacs ouverts (la découverte du labo, verdict L1.1). */
export const discoveryReached = (lab) => B.isSolved(lab) && lab.verified;
/** Un partage a eu lieu. */
const hasDivided = (lab) => lab.history.some((s) => s.kind === 'divide');
/** Le plateau des sacs, à la fin : l'équation est-elle réduite avec les sacs seuls, un seul plateau sans sac ? */
const noBagPan = (pans) => (pans.L.a === 0 ? pans.L : pans.R.a === 0 ? pans.R : null);

// ── la question « ce que la balance dessine » ──────────────────────────────

/** Le premier geste de l'élève, décrit : { side, kind: 'ball'|'balloon'|'bag'|'anti', verb: 'take'|'put' }. */
function firstMove(moves) {
  const m = (moves ?? [])[0];
  if (!m) return { side: 'L', kind: 'ball', verb: 'take' };
  const [verb, kind] = m.g.split(':');
  return { side: m.side, kind, verb: verb === 'remove' ? 'take' : 'put' };
}

/**
 * Les trois pastilles « taken » : combien a-t-il fait de l'autre côté. Le leurre : ce qui RESTE sur le plateau des unités après son étape.
 * `first` : son premier geste (l'objet et le verbe pour la phrase).
 */
export function lineChips(lab, { moves } = {}) {
  const st = bothSteps(lab)[0];
  const n = st.n;
  const unitPan = noBagPan(st.after) ?? st.after.R;
  let left = Math.abs(toNumber(unitPan.u));
  if (left === n || left === 0) left = Math.abs(toNumber(st.before.L.u)) + Math.abs(toNumber(st.before.R.u));
  return { n, options: [n, 0, left], first: firstMove(moves) };
}

/** Les trois pastilles « placed » : « n بالونات » (juste quand l'effet est −1), « n كرات », « لا شيء ». */
export function placedChips(lab) {
  const st = bothSteps(lab)[0];
  return { n: st.n, right: st.effect === '-1' ? 'balloons' : 'balls', options: ['balloons', 'balls', 'none'] };
}

const num = (v) => fracLatex(v);

/**
 * BÂTIR « ▢ = ▢ » : l'équation que la balance dessine maintenant, UN leurre — l'erreur classique de la leçon :
 *   `untouched` (l'autre plateau laissé tel quel : l'opération sur UN seul côté), `crossed` (le nombre qui traverse le « = » sans changer de
 *   signe), `bagsAdded` (les sacs des deux plateaux ADDITIONNÉS), `constAdded` (les constantes additionnées au lieu de retranchées).
 * `when` : 'first' (après la première étape) ou 'reduced' (à la forme ax = b).
 */
export function lineBuild(lab, { when = 'first', decoy = 'untouched' } = {}) {
  const start = lab.history[0].after;
  const st = bothSteps(lab)[0];
  const cur = when === 'reduced' ? lab.pans : st.after;
  const before = st.before;
  const L = B.panTex(cur.L); const R = B.panTex(cur.R);
  const delta = st.effect.endsWith('x') ? 0 : (st.effect.startsWith('+') ? st.n : -st.n);
  let dec;
  if (decoy === 'untouched') dec = B.panTex(before.R);
  else if (decoy === 'crossed') dec = num(Lin.sub(before.R.u, Lin.frac(delta)));
  else if (decoy === 'bagsAdded') dec = `${Math.abs(start.L.a) + Math.abs(start.R.a)}x`;
  else dec = num(Lin.add(Lin.frac(Math.abs(toNumber(start.L.u))), Lin.frac(Math.abs(toNumber(start.R.u)))));
  return { expected: [L, R], accept: [[R, L]], decoy: dec, tiles: [L, R, dec] };
}

/** Les pastilles du poids d'un sac : le bon, puis deux erreurs réelles (dans l'ordre demandé par la manche). */
export function readOptions(lab, kinds = ['weight', 'bags']) {
  const v = B.readValue(lab);
  const dv = lab.history.filter((s) => s.kind === 'divide').at(-1);
  const cand = {
    weight: dv ? Lin.mul(v, dv.k) : null,
    bags: dv ? Lin.frac(dv.k) : null,
    sign: isZero(v) ? null : Lin.sub(0, v),
    inv: isZero(v) ? null : Lin.div(1, v),
    plusOne: Lin.add(v, 1),
  };
  const wrong = [];
  [...kinds, 'sign', 'plusOne'].forEach((id) => {
    const c = cand[id];
    if (!c || Lin.eq(c, v) || wrong.some((o) => Lin.eq(o.val, c))) return;
    wrong.push({ id, val: c });
  });
  return { right: v, wrong: wrong.slice(0, 2) };
}

// ── les suites (CHAIN_SPECS) ─────────────────────────────────────────────────

const reducedAfterStep = (lab) => bothSteps(lab).length > 0 && reducedForm(lab);

/**
 * Chaque suite du lecteur : { id, reached(lab), qs }. L'id est le point d'étape de la manche (`{ checkpoint: id }`). `build`, `read`, `chips`
 * règlent les questions (voir `lineBuild`, `readOptions`, `lineChips`, `placedChips`).
 */
const CHAIN_SPECS = Object.freeze({
  r1: [
    { id: 'line', reached: firstLineReached, qs: ['lineChips', 'lineBuild'], chips: 'taken', build: { when: 'first', decoy: 'untouched' } },
    { id: 'read', reached: bagReadReached, qs: ['readChips'], read: ['weight', 'bags'] },
  ],
  r2: [
    { id: 'line', reached: firstLineReached, qs: ['lineChips', 'lineBuild'], chips: 'placed', build: { when: 'first', decoy: 'crossed' } },
    { id: 'read', reached: bagReadReached, qs: ['readChips'], read: ['sign', 'weight'] },
  ],
  r3: [
    { id: 'line', reached: firstLineReached, qs: ['lineBuild'], build: { when: 'first', decoy: 'crossed' } },
    { id: 'rule', reached: discoveryReached, qs: ['ruleBalance'] },
  ],
  m2r1: [
    { id: 'line', reached: reducedAfterStep, qs: ['lineBuild'], build: { when: 'reduced', decoy: 'bagsAdded' } },
    { id: 'read', reached: bagReadReached, qs: ['readChips'], read: ['inv', 'weight'] },
  ],
  m2r2: [
    { id: 'line', reached: reducedAfterStep, qs: ['lineBuild'], build: { when: 'reduced', decoy: 'constAdded' } },
    { id: 'rule', reached: discoveryReached, qs: ['ruleAxb'] },
  ],
  none: [],
});
export const chainsOf = (name) => CHAIN_SPECS[name] ?? [];

// ── les prédictions ──────────────────────────────────────────────────────────

export const PREDICT_KEYS = Object.freeze(['bagHolds', 'parts', 'otherPanDo', 'bagsLeft', 'whole']);

/** Les options d'une prédiction, dans l'ordre de l'écran : { says, n? } (`n` un nombre, sinon `says` est une clé i18n). */
export function predictOptions(src, key) {
  const { L, R } = B.init(src).pans;
  if (key === 'bagHolds') return [{ says: 'balls' }, { says: 'balloons' }, { says: 'none' }];
  if (key === 'whole') return [{ says: 'yes' }, { says: 'no' }];
  if (key === 'otherPanDo') return [{ says: 'takeBalls' }, { says: 'putBalloons' }, { says: 'putBalls' }];
  const k = Math.abs(L.a - R.a);
  const nums = key === 'parts' ? [k, k - 1, 12] : key === 'bagsLeft' ? [Math.abs(L.a) + Math.abs(R.a), k, Math.abs(L.a)] : [];
  // « bagsLeft » : 10 · 2 · 4 (M2 r1), 5 · 3 · 4 (M2 r2) — la bonne n'est jamais la première pour cette manche ; « parts » : la bonne d'abord
  return nums.map((n) => ({ says: String(n), n }));
}

/** La vérité d'une prédiction, calculée sur la balance de DÉPART de la manche. */
export function predictTruth(src, key) {
  const lab = B.init(src);
  const { L, R } = lab.pans;
  if (key === 'bagHolds') return Lin.cmp(lab.x, 0) > 0 ? 'balls' : Lin.cmp(lab.x, 0) < 0 ? 'balloons' : 'none';
  if (key === 'whole') return lab.x.d === 1 ? 'yes' : 'no';
  if (key === 'otherPanDo') {
    // le plateau des sacs porte des unités ; pour en défaire l'effet, l'autre plateau reçoit le MÊME effet : des balles à poser si on fait +1
    const bagPan = L.a >= R.a ? L : R;
    return toNumber(bagPan.u) < 0 ? 'putBalls' : 'takeBalls';
  }
  if (key === 'parts' || key === 'bagsLeft') return String(Math.abs(L.a - R.a));
  return null;
}

/** La prédiction est-elle JUGÉE par la balance (l'événement dont elle parle a eu lieu) ? */
function predictJudged(lab, key) {
  if (key === 'bagHolds' || key === 'whole') return B.isSolved(lab);
  if (key === 'parts') return hasDivided(lab);
  if (key === 'otherPanDo') return bothSteps(lab).length > 0;
  if (key === 'bagsLeft') return bothSteps(lab).length > 0 && (lab.pans.L.a === 0 || lab.pans.R.a === 0);
  return false;
}

/** Les prédictions jugées parmi les clés données. */
export const judgedPredictions = (lab, keys) => keys.filter((key) => predictJudged(lab, key));

// ── le guide (LabCoach) ──────────────────────────────────────────────────────

/**
 * La prochaine aide du guide — le geste, jamais la réponse. `ctx` : { done, firstRound, qty, noneHere, readDone, parts }.
 * Les ancres sont des enveloppes `[data-coach="…"]` (DraggableObject ne transmet aucun `data-*`).
 */
export function coachOf(lab, ctx = {}) {
  if (ctx.done) return null;
  const started = lab.history.length > 1 || Boolean(lab.pending);
  // fléau penché : AUCUNE bulle — au-dessus elle couvrait les objets du plateau gauche (1024 px), au-dessous la réserve : les deux sont le
  // geste suivant (walk 2026-11-11). Le verdict de la colonne dit le fait (« الكفّة اليمنى أثقل الآن ») et le fléau se voit.
  if (lab.pending) return null;
  if (ctx.noneHere && !started) return { id: 'reserve', target: '[data-coach="reserve"]', gesture: 'drag', prefer: 'below', noFlip: true };
  if (B.isSolved(lab)) return ctx.readDone && !lab.verified ? { id: 'open', target: '[data-coach="open"]', gesture: 'tap' } : null;
  if (reducedForm(lab) && Math.max(Math.abs(lab.pans.L.a), Math.abs(lab.pans.R.a)) > 1) {
    return (ctx.parts ?? 1) >= 2
      ? { id: 'keep', target: '[data-coach="keep"]', gesture: 'tap', prefer: 'above' }
      : { id: 'parts', target: '[data-coach="parts"]', gesture: 'drag', prefer: 'above' };
  }
  if (!started && ctx.qty) return { id: 'qty', target: '[data-coach="qty"]', gesture: 'tap', prefer: 'below', noFlip: true };
  if (!started && ctx.firstRound) return { id: 'grab', target: '[data-coach="pan-L-units"]', gesture: 'drag', prefer: 'above', noFlip: true };
  return null;
}

// ── le balayage « valeurs interdites par rôle » ──────────────────────────────

const Rl = (role, v) => ({ role, v: String(v) });

/**
 * TOUT ce qu'un écran d'une manche peut montrer, avec son rôle : les plateaux de départ (`pan`), leurs sacs et leurs unités (`bags`, `units`),
 * chaque équation et chaque membre des DEUX chemins efficaces (`eq`, `pan`), l'équation réduite (`reduced`), les sacs et unités retirés (`op`),
 * la solution (`solution`), la valeur des plateaux à la solution (`check`), les pastilles d'un poids lu (`chip`), les tuiles et le leurre de
 * la construction (`tile`, `decoy`), les options des prédictions (`predict`). `props` : { eq, chains, predict, choices }.
 */
export function shownValues(props) {
  const out = [];
  const eqs = props.choices?.length ? props.choices : [props.eq];
  eqs.forEach((src) => out.push(...shownOne(src, props)));
  return out;
}

function shownOne(src, props) {
  const out = [];
  const lab0 = B.init(src);
  const { L, R } = lab0.pans;
  [L, R].forEach((p) => { out.push(Rl('pan', bare(B.panTex(p))), Rl('bags', Math.abs(p.a)), Rl('units', Math.abs(toNumber(p.u)))); });
  out.push(Rl('eq', bare(B.equationTex(lab0.pans))));
  out.push(Rl('solution', fracText(lab0.x)));
  out.push(Rl('check', fracText(Lin.linAt(Lin.lin(L.a, L.u), lab0.x))));
  const specs = chainsOf(props.chains);
  ['bags', 'units'].forEach((order) => {
    const plan = efficientPlan(src, order);
    plan.steps.forEach((s) => out.push(Rl('op', `${s.effect.endsWith('x') ? 'bags' : 'units'}:${s.n}`)));
    if (plan.k > 1) out.push(Rl('op', `parts:${plan.k}`));
    const full = playPlan(src, plan, { open: true });
    full.lines.forEach((l) => { out.push(Rl('eq', bare(l))); String(l).split('=').forEach((side) => out.push(Rl('pan', bare(side)))); });
    full.lab.history.forEach((h) => { [h.after?.L, h.after?.R].filter(Boolean).forEach((p) => out.push(Rl('pan', bare(B.panTex(p))))); });
    const red = playPlan(src, { steps: plan.steps, k: 1 }).lab;
    if (reducedForm(red)) out.push(Rl('reduced', bare(B.equationTex(red.pans))));
    specs.forEach((sp) => {
      if (sp.qs.includes('lineBuild')) {
        const stage = playPlan(src, { steps: sp.build.when === 'first' ? plan.steps.slice(0, 1) : plan.steps, k: 1 });
        if (bothSteps(stage.lab).length) {
          const b = lineBuild(stage.lab, sp.build);
          b.tiles.forEach((t) => out.push(Rl('tile', bare(t))));
          out.push(Rl('decoy', bare(b.decoy)));
        }
      }
      if (sp.qs.includes('lineChips') && sp.chips === 'taken') {
        const stage = playPlan(src, { steps: plan.steps.slice(0, 1), k: 1 });
        if (bothSteps(stage.lab).length) lineChips(stage.lab, { moves: stage.moves }).options.forEach((n) => out.push(Rl('chip', n)));
      }
      if (sp.qs.includes('readChips') && B.isSolved(full.lab)) {
        const ro = readOptions(full.lab, sp.read);
        out.push(Rl('chip', fracText(ro.right)), ...ro.wrong.map((w) => Rl('chip', fracText(w.val))));
      }
    });
  });
  (props.predict ?? []).forEach((key) => predictOptions(src, key).forEach((o) => { if (o.n != null) out.push(Rl('predict', o.n)); }));
  return out;
}
