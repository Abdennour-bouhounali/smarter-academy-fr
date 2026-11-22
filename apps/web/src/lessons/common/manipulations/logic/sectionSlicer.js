/**
 * LA TRANCHEUSE — logique PURE du lab `section-slicer` (unité 14 « الهندسة في الفضاء », درس « المقاطع المستوية للمجسمات
 * المألوفة », manuel pp. 164–169 : نشاط 2, 3, 4, 5 ; معارف 3 ; طرائق ص 169).
 *
 * L'imprimante 3D du fablab du lycée dépose un solide COUCHE PAR COUCHE : chaque couche est une SECTION PLANE. La main tient
 * le plan de coupe (sa distance h au centre, sa position x, la distance d à l'axe, le rapport k = SE/SA) ; avant que la buse
 * n'imprime la couche, l'élève PRÉDIT la section (son rayon, ses dimensions, sa nature) ; la mesure tranche : la couche réelle
 * est imprimée, et la prédiction fausse est dessinée telle quelle (une « couche fantôme ») — elle sort du solide ou ne touche
 * pas sa surface, et le lab dit pourquoi avec les nombres de l'écran.
 *
 * Aucune arithmétique n'est écrite ici : sections et valeurs exactes viennent de `space` (packages/core/arithmetic/space.js)
 * et des fractions de `linear`, les racines de `trigonometry` (surds). Les coordonnées de DESSIN (`sceneFigure`) sont des
 * flottants qui ne décident de rien.
 *
 * Un « étage » (stage) = un solide + un mode de coupe : sphere · cuboid-face · cuboid-edge · cylinder-base · cylinder-axis ·
 * pyramid. La variable de chaque étage est un INDICE entier (le geste se pose sur des « hauteurs de couche » exactes) ;
 * `valueOf(lab, stage, i)` en donne la valeur exacte (fraction).
 */
import * as space from '@smarter-academy/core/arithmetic/space.js';
import * as linear from '@smarter-academy/core/arithmetic/linear.js';
import * as trigonometry from '@smarter-academy/core/arithmetic/trigonometry.js';
import { spaceFigureQuality } from '../../components/spaceFigure';

const { frac, add, sub, mul, div, cmp, eq, toNumber, parseNumber, fracLatex } = linear;
const { surd, sqrt, surdLatex, surdNumber, roundTo, surdEq } = trigonometry;

const F = (v) => (v && typeof v === 'object' && 'n' in v ? v : Number.isInteger(v) ? frac(v) : String(v).includes('/') ? div(parseNumber(String(v).split('/')[0]), parseNumber(String(v).split('/')[1])) : parseNumber(String(v)));
const sq = (p) => mul(p, p);
/** Une longueur exacte (fraction ou surd) en LaTeX avec la virgule décimale du manuel (« 2{,}5 », « \sqrt{5} », « \dfrac{\sqrt{119}}{4} »). */
export const lengthTex = (x) => decimalComma(x && typeof x === 'object' && 'r' in x ? surdLatex(x) : fracTexDec(F(x)));
/** Une fraction : décimale courte quand elle est finie (2,8 ; 1,25), sinon \dfrac. */
function fracTexDec(p) {
  p = F(p);
  if (p.d === 1) return String(p.n);
  let d = p.d; let k = 0;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  if (d === 1) {
    for (k = 1; k <= 4; k += 1) { const v = (p.n * 10 ** k) / p.d; if (Number.isInteger(v)) return String(toNumber(p)).replace('.', ','); }
  }
  return fracLatex(p);
}
const decimalComma = (tex) => tex.replace(/(\d)\.(\d)/g, '$1{,}$2').replace(/(\d),(\d)/g, '$1{,}$2');
/** L'arrondi au centième, virgule (« 2,73 ») ; un entier reste un entier. */
export const approx = (x, digits = 2) => {
  const n = x && typeof x === 'object' && 'r' in x ? surdNumber(x) : toNumber(F(x));
  return Number.isInteger(Math.round(n * 1e9) / 1e9) ? String(Math.round(n)) : roundTo(n, digits);
};
/** Une longueur est-elle exacte « en décimal » (fraction) ou une racine (surd irrationnel) ? */
export const isIrrational = (x) => !!(x && typeof x === 'object' && 'r' in x && x.r !== 1);

const STAGES = Object.freeze(['sphere', 'cuboid-face', 'cuboid-edge', 'cylinder-base', 'cylinder-axis', 'pyramid']);
export const SOLID_OF = Object.freeze({
  sphere: 'sphere', 'cuboid-face': 'cuboid', 'cuboid-edge': 'cuboid', 'cylinder-base': 'cylinder', 'cylinder-axis': 'cylinder', pyramid: 'pyramid',
});
const FIRST_STAGE = { sphere: 'sphere', cuboid: 'cuboid-face', cylinder: 'cylinder-axis', pyramid: 'pyramid' };

/**
 * La configuration d'un niveau (levels.js) → les étages, chacun avec sa variable : indices min / max, pas (fraction), départ,
 * marques du manuel (orientation, jamais des boutons-réponses), nom, orientation du rail.
 */
function configOf(numbers = {}) {
  const solids = numbers.solids ?? ['sphere'];
  const R = F(numbers.R ?? 5);
  const step = F(numbers.step ?? 1);
  const cfg = { solids, stages: {} };
  if (solids.includes('sphere')) {
    const max = Math.round(toNumber(div(add(R, frac(1)), step)));
    const stops = (numbers.stops ?? []).map((s) => Math.round(toNumber(div(F(s), step))));
    const start = numbers.start != null ? Math.round(toNumber(div(F(numbers.start), step))) : Math.round(max * 0.36);
    cfg.stages.sphere = { R, step, min: 0, max, stops, start, foot: numbers.foot ?? 'A', letter: numbers.foot === 'I' ? 'x' : 'h' };
  }
  if (solids.includes('cuboid')) {
    const [a, b, c] = (numbers.cuboid?.dims ?? [25, 20, 6]).map(F);
    const half = frac(1, 2);
    const cm0 = sub(a, F(numbers.cuboid?.dm ?? 21));
    const cn0 = sub(b, F(numbers.cuboid?.bn ?? 17));
    const ratio = div(cn0, cm0); // la direction du plan : CN / CM (3/4 au manuel)
    // la position x = DI d'un plan parallèle à CBFG : de 1/2 à a − 1/2
    const nx = Math.round(toNumber(div(a, half)));
    cfg.stages['cuboid-face'] = { dims: { a, b, c }, step: half, min: 1, max: nx - 1, stops: [], start: Math.round(nx * 0.3) };
    // CM le long de [CD] ; CN = ratio × CM doit rester sur [CB] et M sur [CD]
    const cmMax = cmp(mul(a, ratio), b) <= 0 ? a : div(b, ratio);
    cfg.stages['cuboid-edge'] = {
      dims: { a, b, c }, step: half, ratio, cm0, cn0, min: 1, max: Math.floor(toNumber(div(cmMax, half))) - 1,
      stops: [Math.round(toNumber(div(cm0, half)))], start: Math.round(toNumber(div(mul(cm0, frac(5, 2)), half))),
    };
  }
  if (solids.includes('cylinder')) {
    const r = F(numbers.cylinder?.r ?? '1,7');
    const h = F(numbers.cylinder?.h ?? 6);
    const d0 = F(numbers.cylinder?.d ?? '0,8');
    const qs = frac(1, 4);
    const nz = Math.round(toNumber(div(h, qs)));
    cfg.stages['cylinder-base'] = { r, h, step: qs, min: 1, max: nz - 1, stops: [], start: Math.round(nz * 0.6) };
    const ds = frac(1, 20);
    const dmax = Math.round(toNumber(div(add(r, frac(1, 2)), ds)));
    cfg.stages['cylinder-axis'] = {
      r, h, step: ds, min: 0, max: dmax, stops: [Math.round(toNumber(div(d0, ds))), Math.round(toNumber(div(r, ds)))], start: Math.round(toNumber(div(frac(2, 5), ds))), d0,
    };
  }
  if (solids.includes('pyramid')) {
    const side = F(numbers.pyramid?.side ?? 4);
    const H = F(numbers.pyramid?.height ?? 6);
    const k0 = F(numbers.pyramid?.ratio ?? '3/4');
    // l'indice i = 1…7 est la HAUTEUR du plan en huitièmes de la hauteur : k = SE / SA = 1 − i/8
    const i0 = Math.round(toNumber(mul(sub(frac(1), k0), frac(8))));
    cfg.stages.pyramid = { side, H, step: frac(1, 8), min: 1, max: 7, stops: [i0], start: 4, k0 };
  }
  cfg.order = STAGES.filter((s) => cfg.stages[s]);
  for (const s of cfg.order) cfg.stages[s].start = safeStart(cfg.stages[s], s === 'sphere' ? [0, Math.round(toNumber(div(cfg.stages.sphere.R, cfg.stages.sphere.step)))] : []);
  return cfg;
}

/**
 * Le départ d'un étage n'est JAMAIS une réponse de la tâche (une marque du manuel, le grand cercle, la tangente) : s'il en est une,
 * on prend la position voisine la plus proche qui n'en est pas. Pas un essai : seule l'impression en écrit un.
 */
function safeStart(st, extra = []) {
  const targets = new Set([...(st.stops ?? []), ...extra]);
  if (!targets.has(st.start)) return st.start;
  for (let d = 1; d <= st.max - st.min; d += 1) {
    for (const i of [st.start + d, st.start - d]) if (i >= st.min && i <= st.max && !targets.has(i)) return i;
  }
  return st.start;
}

/** L'état initial du lab : l'étage ouvert, la position de chaque étage, rien d'imprimé. */
export function init(numbers) {
  const cfg = configOf(numbers);
  const pos = {};
  for (const s of cfg.order) pos[s] = cfg.stages[s].start;
  return {
    cfg, stage: cfg.order[0], pos, pending: null, trials: [], last: null, ghost: null, layers: [], found: {}, n: 0, filament: 0,
  };
}

/** La valeur exacte de la variable d'un étage à l'indice i. */
export function valueOf(lab, stage = lab.stage, i = lab.pos[stage]) {
  const st = lab.cfg.stages[stage];
  if (stage === 'pyramid') return sub(frac(1), mul(frac(i), st.step)); // k
  return mul(frac(i), st.step);
}

// ── la section RÉELLE d'un étage (space.js) ─────────────────────────────────

/**
 * La section exacte d'un étage à une position :
 *   sphere        { kind: 'circle' | 'great-circle' | 'point' | 'none', h, r, r2 }
 *   cuboid-face   { kind: 'rectangle', sides: [CB, CG], area }
 *   cuboid-edge   { kind: 'rectangle', cm, cn, mn, sides: [MN, CG], area }
 *   cylinder-base { kind: 'circle', z, r }
 *   cylinder-axis { kind: 'rectangle' | 'segment' | 'none', d, width, half, h }
 *   pyramid       { kind: 'square', k, side, diag, area }
 */
export function sectionAt(lab, stage = lab.stage, i = lab.pos[stage]) {
  const st = lab.cfg.stages[stage];
  const v = valueOf(lab, stage, i);
  if (stage === 'sphere') {
    const s = space.sphereSection(st.R, v);
    return { stage, kind: s.kind, h: v, r: s.radius, r2: s.radius2 };
  }
  if (stage === 'cuboid-face') {
    const s = space.cuboidSection(st.dims, { parallelTo: 'face', face: 'bc' });
    return { stage, kind: 'rectangle', x: v, sides: s.sides, area: s.area };
  }
  if (stage === 'cuboid-edge') {
    const cn = mul(v, st.ratio);
    const s = space.cuboidSection(st.dims, { parallelTo: 'edge', p: v, q: cn });
    return { stage, kind: 'rectangle', cm: v, cn, mn: s.sides[1], sides: [s.sides[1], s.sides[0]], area: s.area };
  }
  if (stage === 'cylinder-base') {
    const s = space.cylinderSection(st.r, st.h, { parallelTo: 'base' });
    return { stage, kind: 'circle', z: v, r: s.radius };
  }
  if (stage === 'cylinder-axis') {
    const s = space.cylinderSection(st.r, st.h, { axisDistance: v });
    return { stage, kind: s.kind, d: v, width: s.kind === 'rectangle' ? s.sides[0] : null, half: s.halfWidth ?? null, h: st.h };
  }
  const s = space.apexSection({ base: [st.side, st.side], ratio: v });
  const side = s.sides[0];
  return { stage, kind: 'square', k: v, side, diag: trigonometry.surdMul(surd(side), surd(1, 2)), area: sq(side) };
}

// ── les cartes de prédiction (la bonne + deux confusions réelles, toutes FAUSSES pour les autres) ──────────────

/** Ordre déterministe (dépend de la position) : la bonne carte n'est pas toujours la première. */
const rotate = (list, seed) => { const s = ((seed % list.length) + list.length) % list.length; return [...list.slice(s), ...list.slice(0, s)]; };
const dedupe = (correct, candidates, same, n = 2) => {
  const out = [];
  for (const c of candidates) {
    if (out.length >= n) break;
    if (c == null || same(c, correct) || out.some((o) => same(o, c))) continue;
    out.push(c);
  }
  return out;
};

/**
 * Les trois cartes d'une impression. Une carte de RAYON porte `r2` (le carré du rayon, rationnel : la vérification
 * OM² = h² + r² ? R² est exacte) ; une carte de NATURE porte `nature` ; une carte de RECTANGLE porte `sides`.
 */
export function cardsFor(lab, stage = lab.stage, i = lab.pos[stage]) {
  const st = lab.cfg.stages[stage];
  const sec = sectionAt(lab, stage, i);
  let correct; let others;
  if (stage === 'sphere') {
    const { R } = st; const h = sec.h;
    const radius = (r2, kind) => ({ kind, r2, r: sqrt(r2) });
    if (sec.kind === 'none') {
      correct = { kind: 'ok', nature: 'none' };
      others = [{ kind: 'mumas', nature: 'point' }, radius(sub(sq(h), sq(R)), 'swap')];
    } else if (sec.kind === 'point') {
      correct = { kind: 'ok', nature: 'point' };
      others = [radius(sq(R), 'great'), { kind: 'none', nature: 'none' }];
    } else if (sec.kind === 'great-circle') {
      correct = radius(sq(R), 'ok');
      others = [radius(sq(mul(R, frac(2))), 'qutr'), { kind: 'point', nature: 'point' }];
    } else {
      correct = radius(sec.r2, 'ok');
      const cands = [radius(sq(sub(R, h)), 'tarh'), radius(add(sq(R), sq(h)), 'jam'), radius(sq(sec.r2), 'root'), radius(sq(add(R, h)), 'jam2')];
      others = dedupe(correct, cands, (x, y) => !!x.r2 && !!y.r2 && eq(x.r2, y.r2));
    }
  } else if (stage === 'cuboid-face') {
    const { a, b, c } = st.dims;
    correct = { kind: 'ok', sides: [surd(b), surd(c)] };
    others = [{ kind: 'buud', sides: [surd(a), surd(c)] }, { kind: 'wajh', sides: [surd(a), surd(b)] }];
  } else if (stage === 'cuboid-edge') {
    const { c } = st.dims;
    correct = { kind: 'ok', sides: [sec.mn, surd(c)] };
    others = dedupe(correct, [
      { kind: 'majmu', sides: [surd(add(sec.cm, sec.cn)), surd(c)] },
      { kind: 'dil', sides: [surd(sec.cm), surd(c)] },
      { kind: 'dil', sides: [surd(sec.cn), surd(c)] },
    ], (x, y) => surdEq(x.sides[0], y.sides[0]));
  } else if (stage === 'cylinder-base') {
    correct = { kind: 'ok', nature: 'circle', r: sec.r };
    others = [{ kind: 'baydawi', nature: 'ellipse' }, { kind: 'shakl', nature: 'rectangle', sides: [surd(mul(st.r, frac(2))), surd(st.h)] }];
  } else if (stage === 'cylinder-axis') {
    const { r, h } = st; const d = sec.d;
    if (sec.kind === 'none') {
      correct = { kind: 'ok', nature: 'none' };
      others = [{ kind: 'mumas', nature: 'segment' }, { kind: 'swap', sides: [trigonometry.surdMul(sqrt(sub(sq(d), sq(r))), surd(2)), surd(h)] }];
    } else if (sec.kind === 'segment') {
      correct = { kind: 'ok', nature: 'segment' };
      others = [{ kind: 'qutr', sides: [surd(mul(r, frac(2))), surd(h)] }, { kind: 'none', nature: 'none' }];
    } else {
      correct = { kind: 'ok', sides: [sec.width, surd(h)] };
      const two = (x) => trigonometry.surdMul(x, surd(2));
      others = dedupe(correct, [
        { kind: 'tarh', sides: [surd(mul(sub(r, d), frac(2))), surd(h)] },
        { kind: 'qutr', sides: [surd(mul(r, frac(2))), surd(h)] },
        { kind: 'nisf', sides: [surd(r), surd(h)] },
        { kind: 'jam', sides: [two(sqrt(add(sq(r), sq(d)))), surd(h)] },
        { kind: 'mumas', nature: 'segment' },
      ], (x, y) => !!x.sides && !!y.sides && surdEq(x.sides[0], y.sides[0]));
    }
  } else {
    const { side } = st; const k = sec.k;
    correct = { kind: 'ok', sides: [surd(sec.side)] };
    others = dedupe(correct, [
      { kind: 'haram', sides: [surd(side)] },
      { kind: 'mutammim', sides: [surd(mul(side, sub(frac(1), k)))] },
      { kind: 'murabba', sides: [surd(mul(side, sq(k)))] },
    ], (x, y) => surdEq(x.sides[0], y.sides[0]));
  }
  const cards = [{ ...correct, correct: true }, ...others.slice(0, 2).map((o) => ({ ...o, correct: false }))];
  return rotate(cards, i + STAGES.indexOf(stage)).map((c, j) => ({ ...c, id: `c${j}` }));
}

// ── les gestes ──────────────────────────────────────────────────────────────

/** Ouvrir un étage (onglet ou mode) : la position de chaque étage est gardée ; une prédiction en cours est abandonnée. */
export function goStage(lab, stage) {
  if (!lab.cfg.stages[stage] || lab.stage === stage) return lab;
  return { ...lab, stage, pending: null, ghost: null, last: null, lastOf: { ...(lab.lastOf ?? {}), [SOLID_OF[stage]]: stage } };
}
/** Ouvrir un solide (onglet) : son dernier mode utilisé, sinon le premier. */
export const goSolid = (lab, solid) => goStage(lab, lab.lastOf?.[solid] ?? FIRST_STAGE[solid]);

/** Le plan bouge (glisser dans la scène, rail, −/+, flèches) : seulement s'il n'attend pas une prédiction. */
export function canMove(lab) { return lab.pending == null ? true : 'pending'; }
export function moveTo(lab, i) {
  const st = lab.cfg.stages[lab.stage];
  const j = Math.max(st.min, Math.min(st.max, Math.round(i)));
  if (canMove(lab) !== true || j === lab.pos[lab.stage]) return lab;
  return { ...lab, pos: { ...lab.pos, [lab.stage]: j }, ghost: null, last: lab.last?.kind === 'moved' ? lab.last : null };
}

/** « اطبع الطبقة » : la buse s'arrête, l'élève doit d'abord PRÉDIRE (aucune valeur n'est encore lue). */
export function canPrint(lab) { return lab.pending == null ? true : 'pending'; }
export function print(lab) {
  if (canPrint(lab) !== true) return lab;
  return { ...lab, pending: { stage: lab.stage, i: lab.pos[lab.stage], cards: cardsFor(lab) }, ghost: null, last: { kind: 'predict' } };
}
export const cancel = (lab) => (lab.pending ? { ...lab, pending: null, last: null } : lab);

/**
 * Vérification d'une carte de RAYON pour la sphère : la couche annoncée (cercle de rayon ρ, à la distance h de O) est-elle
 * SUR la sphère ? Un point M de ce cercle vérifie OM² = h² + ρ² ; il est sur la sphère ssi OM² = R² (exact).
 */
export function ringCheck(R, h, r2) {
  const om2 = add(sq(F(h)), F(r2));
  const c = cmp(om2, sq(F(R)));
  return { om2, om: sqrt(om2), on: c === 0, where: c === 0 ? 'on' : c < 0 ? 'inside' : 'outside' };
}

/** L'élève choisit une carte : la couche réelle est imprimée ; une carte fausse laisse sa couche fantôme et sa raison. */
export function choose(lab, cardId) {
  const p = lab.pending;
  if (!p) return lab;
  const card = p.cards.find((c) => c.id === cardId);
  if (!card) return lab;
  const sec = sectionAt(lab, p.stage, p.i);
  const st = lab.cfg.stages[p.stage];
  const n = lab.n + 1;
  const ok = !!card.correct;
  let detail = null;
  if (p.stage === 'sphere' && card.r2 != null) detail = ringCheck(st.R, sec.h, card.r2);
  const trial = { n, stage: p.stage, i: p.i, value: valueOf(lab, p.stage, p.i), kind: sec.kind, ok, card: card.kind, section: sec };
  const layer = { n, stage: p.stage, i: p.i, filament: lab.filament % FILAMENTS.length };
  const found = ok ? { ...lab.found, [p.stage]: true } : lab.found;
  return {
    ...lab,
    pending: null,
    n,
    trials: [...lab.trials, trial],
    layers: sec.kind === 'none' ? lab.layers : [...lab.layers.filter((l) => !(l.stage === p.stage && l.i === p.i)), layer].slice(-10),
    ghost: ok ? null : { stage: p.stage, i: p.i, card },
    last: { kind: ok ? 'ok' : 'refused', card, section: sec, detail, stage: p.stage, i: p.i, n },
    found,
    filament: lab.filament + 1,
    lastOf: { ...(lab.lastOf ?? {}), [SOLID_OF[p.stage]]: p.stage },
  };
}

/** Le décor (bobine de filament) change la couleur de la PROCHAINE couche — un geste décoratif, sans mathématique. */
export const FILAMENTS = Object.freeze(['#06b6d4', '#a855f7', '#f43f5e', '#22c55e', '#f59e0b', '#3b82f6']);
export const nextFilament = (lab) => ({ ...lab, filament: lab.filament + 1 });

// ── la découverte (sphère) : le CONTRASTE grand cercle / petit cercle / contact ou rien ─────────────────────────

function sphereContrast(lab) {
  const t = lab.trials.filter((x) => x.stage === 'sphere');
  return {
    great: t.some((x) => x.kind === 'great-circle'),
    small: t.some((x) => x.kind === 'circle'),
    edge: t.some((x) => x.kind === 'point' || x.kind === 'none'),
    count: t.length,
  };
}
export function discoveryReady(lab) {
  if (!lab.cfg.stages.sphere) return false;
  const c = sphereContrast(lab);
  return c.great && c.small && c.edge && c.count >= 3;
}
/** Un essai de petit cercle de l'élève (pour réfuter « r = R − h » avec SES nombres), le plus récent. */
export function witness(lab) {
  return [...lab.trials].reverse().find((x) => x.stage === 'sphere' && x.kind === 'circle') ?? null;
}

/** Un étage est « trouvé » quand une impression a été prédite juste ; la suite (متقدم) propose l'étage suivant. */
export const isFound = (lab, stage) => !!lab.found[stage];
export function nextStage(lab) {
  const solids = lab.cfg.solids;
  const cur = SOLID_OF[lab.stage];
  const j = solids.indexOf(cur);
  if (j < 0 || j >= solids.length - 1) return null;
  return FIRST_STAGE[solids[j + 1]];
}

/* ── les étapes du labo et leurs questions (lot 4, `primitives/LabCheckpoint`) ───────────────────────────── */

/** Une étape par étage : la sphère est atteinte au CONTRASTE (grand cercle, petit cercle, contact ou rien), les autres à une impression prédite juste. */
export function stepsOf(lab) {
  return lab.cfg.order.map((id) => {
    const mine = lab.trials.filter((x) => x.stage === id);
    const trial = id === 'sphere' ? witness(lab)
      : [...mine].reverse().find((x) => x.ok && (id !== 'cylinder-axis' || x.kind === 'rectangle')) ?? null;
    const reached = id === 'sphere' ? discoveryReady(lab) && !!trial : !!trial;
    return Object.freeze({ id, reached, trial });
  });
}
/** « أعِد التجربة » : efface les impressions de l'étage (la sphère : toutes, le contraste est à refaire) et rouvre la prédiction. */
export function retryStep(lab, id) {
  const st = stepsOf(lab).find((x) => x.id === id);
  if (!st || !st.trial) return lab;
  const drop = id === 'sphere' ? (x) => x.stage === 'sphere' : (x) => x === st.trial;
  const trials = lab.trials.filter((x) => !drop(x));
  const stillOk = trials.some((x) => x.stage === id && x.ok);
  return { ...lab, trials, layers: id === 'sphere' ? lab.layers.filter((l) => l.stage !== 'sphere') : lab.layers, found: { ...lab.found, [id]: stillOk }, pending: null, ghost: null, last: null };
}

/** Ce que le module lit des essais de l'élève (onTrial) : l'étage, la valeur, le verdict, la section en LaTeX. */
export function evidenceOf(trial, lab) {
  if (!trial) return null;
  return { n: trial.n, stage: trial.stage, ok: trial.ok, value: trial.stage === 'pyramid' ? kTex(trial.value) : lengthTex(trial.value), section: sectionTex(trial.section, lab) };
}

/** La section en LaTeX courte : « r = \sqrt{5} », « 20 \times 6 », « نقطة » (clé), « — ». */
export function sectionTex(sec) {
  if (!sec) return '';
  if (sec.kind === 'circle' || sec.kind === 'great-circle') return `r = ${lengthTex(sec.r)}`;
  if (sec.kind === 'rectangle') return `${lengthTex(sec.sides?.[0] ?? sec.width)} \\times ${lengthTex(sec.sides?.[1] ?? sec.h)}`;
  if (sec.kind === 'square') return `${lengthTex(sec.side)} \\times ${lengthTex(sec.side)}`;
  return '';
}

// ── la scène, en données : la FIGURE de repli (SpaceFigure) et les coordonnées de dessin ─────────────────────────

const n2 = (x) => (x && typeof x === 'object' && 'r' in x ? surdNumber(x) : toNumber(F(x)));
const r3 = (v) => Math.round(v * 1000) / 1000;
/** Les points d'un pavé nommé comme le manuel (haut DCBA, bas HGFE : D devant à gauche, H sous D). */
export function cuboidNamed({ a, b, c }) {
  const [A, B, C] = [a, b, c].map(n2);
  return { D: [0, 0, C], C: [A, 0, C], B: [A, B, C], A: [0, B, C], H: [0, 0, 0], G: [A, 0, 0], F: [A, B, 0], E: [0, B, 0] };
}
const CUBOID_FACES = [['D', 'C', 'B', 'A'], ['H', 'G', 'F', 'E'], ['D', 'C', 'G', 'H'], ['C', 'B', 'F', 'G'], ['B', 'A', 'E', 'F'], ['A', 'D', 'H', 'E']];

/**
 * La figure SpaceFigure de l'état (le repli sans WebGL, et la vérité des tests) : le solide, le plan (P) et, si la couche est
 * imprimée à cette position, la section nommée comme au manuel.
 */
export function sceneFigure(lab, ariaLabel) {
  const fig = rawFigure(lab, ariaLabel);
  return declutter(fig, OPTIONAL_NAMES[lab.stage] ?? []);
}

/** Les noms qu'on peut taire quand ils se poseraient sur un autre (pied du plan, sommets de la section). */
const OPTIONAL_NAMES = {
  sphere: ['I', 'A', 'M'], 'cuboid-face': ['I', 'J', 'K', 'L'], 'cuboid-edge': ['M', 'N', 'P', 'O'],
  'cylinder-base': ['B'], 'cylinder-axis': ['H', 'K', 'I', 'L', 'J'], pyramid: ['E', 'F', 'G', 'H'],
};
/** Retire, un à un, les noms facultatifs qui chevauchent un autre nom ou un point (spaceFigureQuality). */
function declutter(fig, optional) {
  for (let k = 0; k < 10; k += 1) {
    const names = new Set();
    for (const t of spaceFigureQuality(fig, { maxAspect: Infinity })) {
      const m = t.match(/label : (\S+) \/ (\S+) se/) ?? t.match(/label : (\S+) posé sur le point (\S+)/);
      if (m) { names.add(m[1]); names.add(m[2]); }
    }
    const bad = optional.find((n) => names.has(n) && !(fig.hidden ?? []).includes(n));
    if (!bad) break;
    fig.hidden = [...(fig.hidden ?? []), bad];
  }
  return fig;
}

function rawFigure(lab, ariaLabel) {
  const stage = lab.stage;
  const st = lab.cfg.stages[stage];
  const sec = sectionAt(lab);
  const printed = lab.layers.some((l) => l.stage === stage && l.i === lab.pos[stage]);
  const base = { kind: 'space', ariaLabel, maxWidth: 360 };
  if (stage === 'sphere') {
    const R = n2(st.R); const h = n2(sec.h); const P = st.foot;
    const pts = { O: [0, 0, 0], N: [0, 0, R], S: [0, 0, -R], [P]: [0, 0, h] };
    const fig = {
      ...base, view: { azimuth: -62, elevation: 22 }, points: pts, solids: [{ type: 'sphere', center: 'O', radius: R }],
      segments: [{ from: 'N', to: 'S', dashed: true }], labels: { N: 'nw', S: 'sw', [P]: 'ne' },
    };
    const c = 1.25 * R;
    Object.assign(pts, { P1: [-c, -c, h], P2: [c, -c, h], P3: [c, c, h], P4: [-c, c, h] });
    fig.planes = [{ points: ['P1', 'P2', 'P3', 'P4'], tone: 'sky', label: '(P)' }];
    fig.hidden = ['P1', 'P2', 'P3', 'P4'];
    if (printed && (sec.kind === 'circle' || sec.kind === 'great-circle')) {
      const r = n2(sec.r);
      pts.M = [r3(-r * 0.94), r3(-r * 0.342), h];
      fig.circles = [{ center: P, radius: r3(r), normal: 'z', on: 0, tone: 'rose', bold: true }];
      fig.segments.push({ from: P, to: 'M', tone: 'rose' }, { from: 'O', to: 'M' });
      if (sec.kind === 'circle') fig.rightAngles = [['O', P, 'M']];
    }
    if (h === R) {
      // h = R : le pied du plan EST N (le point de contact) — un seul nom, N
      delete pts[P]; delete fig.labels[P];
    }
    if (h === 0) {
      // h = 0 : le pied du plan EST le centre — un seul nom, O
      delete pts[P]; delete fig.labels[P];
      fig.segments = fig.segments.filter((s) => s.from !== P);
      if (fig.circles) fig.circles[0].center = 'O';
    }
    return fig;
  }
  if (stage === 'cuboid-face' || stage === 'cuboid-edge') {
    const pts = cuboidNamed(st.dims);
    const fig = { ...base, view: { azimuth: -58, elevation: 26 }, points: pts, solids: [{ type: 'polyhedron', faces: CUBOID_FACES }] };
    const [A, B, C] = [st.dims.a, st.dims.b, st.dims.c].map(n2);
    if (stage === 'cuboid-face') {
      const x = n2(sec.x);
      Object.assign(pts, { I: [x, 0, C], J: [x, B, C], K: [x, B, 0], L: [x, 0, 0] });
      fig.sections = [{ points: ['I', 'J', 'K', 'L'], tone: printed ? 'emerald' : 'sky' }];
    } else {
      const cm = n2(sec.cm); const cn = n2(sec.cn);
      Object.assign(pts, { M: [r3(A - cm), 0, C], N: [A, r3(cn), C], P: [A, r3(cn), 0], O: [r3(A - cm), 0, 0] });
      fig.sections = [{ points: ['M', 'N', 'P', 'O'], tone: printed ? 'emerald' : 'sky' }];
    }
    return fig;
  }
  if (stage === 'cylinder-base' || stage === 'cylinder-axis') {
    const r = n2(st.r); const H = n2(st.h);
    const pts = { "O'": [0, 0, 0], O: [0, 0, H] };
    const fig = { ...base, view: { azimuth: -62, elevation: 20 }, points: pts, solids: [{ type: 'cylinder', base: "O'", top: 'O', radius: r }], segments: [{ from: "O'", to: 'O', dashed: true }] };
    if (stage === 'cylinder-base') {
      const z = n2(sec.z);
      pts.B = [0, 0, z];
      fig.circles = [{ center: 'B', radius: r, normal: 'z', tone: printed ? 'rose' : 'sky', bold: printed }];
    } else if (sec.kind === 'rectangle') {
      const d = n2(sec.d); const w = n2(sec.half);
      Object.assign(pts, { K: [-d, r3(w), H], I: [-d, r3(-w), H], L: [-d, r3(-w), 0], J: [-d, r3(w), 0] });
      fig.sections = [{ points: ['K', 'I', 'L', 'J'], tone: printed ? 'emerald' : 'sky' }];
      if (d > 0) { pts.H = [-d, 0, H]; fig.segments.push({ from: 'O', to: 'H', dashed: true }); }
    } else if (sec.kind === 'segment') {
      // le plan est TANGENT : il ne touche la surface latérale que le long d'une génératrice
      const d = n2(sec.d);
      Object.assign(pts, { H: [-d, 0, H], L: [-d, 0, 0] });
      fig.segments.push({ from: 'O', to: 'H', dashed: true }, { from: 'H', to: 'L', tone: 'rose', bold: true });
    }
    return fig;
  }
  // pyramid
  const half = n2(st.side) / 2; const H = n2(st.H); const k = n2(sec.k); const z = (1 - k) * H; const e = half * k;
  const pts = { S: [0, 0, H], A: [-half, -half, 0], B: [half, -half, 0], C: [half, half, 0], D: [-half, half, 0], E: [-e, -e, r3(z)], F: [e, -e, r3(z)], G: [e, e, r3(z)], H: [-e, e, r3(z)] };
  return {
    ...base, view: { azimuth: -64, elevation: 18 }, points: pts,
    solids: [{ type: 'polyhedron', faces: [['A', 'B', 'C', 'D'], ['S', 'A', 'B'], ['S', 'B', 'C'], ['S', 'C', 'D'], ['S', 'D', 'A']] }],
    sections: [{ points: ['E', 'F', 'G', 'H'], tone: printed ? 'emerald' : 'sky' }],
    segments: printed ? [{ from: 'E', to: 'G', dashed: true, tone: 'rose' }] : [],
  };
}

/** Le rapport k = SE/SA s'écrit en fraction, comme au manuel (« \\dfrac{3}{4} »), jamais en décimal. */
export const kTex = (k) => fracLatex(F(k));
/** La valeur de la variable en LaTeX : une longueur en décimal court, le rapport de la pyramide en fraction. */
export const valueLatex = (lab, stage = lab.stage, i = lab.pos[stage]) => (stage === 'pyramid' ? kTex(valueOf(lab, stage, i)) : lengthTex(valueOf(lab, stage, i)));
/** Les numéros d'une valeur, pour l'ARIA et les tests (« 1,25 », « 3/4 »). */
export const valueText = (lab, stage = lab.stage, i = lab.pos[stage]) => {
  const v = valueOf(lab, stage, i);
  if (stage === 'pyramid') return linear.fracText(v);
  return fracTexDec(v).replace('\\dfrac{', '').replace('}{', '/').replace('}', '');
};
export { F as toFrac, n2 as toNumberAny };
