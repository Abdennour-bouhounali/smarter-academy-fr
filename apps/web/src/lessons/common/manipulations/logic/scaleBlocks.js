/**
 * La logique PURE du lab « scale-blocks » (unité 14 « الهندسة في الفضاء », درس « التكبير والتصغير وأثره على المقادير الفضائية »,
 * manuel p. 165, نشاط 6). Aucune arithmétique ici : chaque grandeur vient de packages/core/arithmetic/space.js (`scaleEffect`,
 * `scaled`, `scaleAll`, `cuboid`) et des fractions de linear.js. La vue ne recalcule jamais une règle.
 *
 * Le monde : un pavé (بلاطة قائمة / متوازي مستطيلات) BÂTI en cubes unités dans un jeu de construction sur téléphone. L'élève tient
 * le rapport k (poignée d'angle dans la scène, pas à pas, clavier). Avant de bâtir le solide image, il PRÉDIT son volume parmi
 * trois valeurs — V × k, V × k², V × k³ — puis le jeu bâtit : chaque cube du pavé devient un cube d'arête k ; quand k est entier,
 * ce cube d'arête k est fait de k³ cubes unités (un « paquet » de la même couleur que le cube d'origine). Le décompte
 * réfute « × k » et « × k² » (MISC-TAKBIR-HAJM-K). Contraste (متقدم) : AJOUTER 1 cm à chaque arête (5 × 4 × 3 → 6 × 5 × 4) n'est
 * pas un agrandissement — les trois rapports 6/5, 5/4, 4/3 diffèrent (MISC-TAKBIR-JAM).
 *
 *   init({ dims: [5, 4, 3], ks: ['3/5', 2] })   l'état (k = 1 : le pavé lui-même)
 *   setK(lab, k)                                  un nouveau rapport (efface la prédiction et le bâti)
 *   options(lab)                                  les trois volumes proposés (× k, × k², × k³), ordre stable mêlé
 *   predict(lab, id) · canBuild(lab) · build(lab) la prédiction puis le bâti, jugé par le décompte
 *   readings(lab)                                 arêtes, aire totale, volume — avant / après, rapports exacts
 *   blockLayout(dims, k)                          les cubes à dessiner (positions, arête, paquet d'origine)
 *   plusOne(lab) · plusReading(dims)              le contraste « + 1 cm partout »
 *   discoveryReady(lab) · evidenceOf(lab)
 */
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as Sp from '@smarter-academy/core/arithmetic/space.js';

const { frac, mul, div, cmp, eq, isInteger, toNumber, fracText, fracDecimal, add } = Lin;
const F = (v) => (typeof v === 'object' && v !== null && 'n' in v ? v : Number.isInteger(v) ? frac(v) : parseK(v));
function parseK(v) {
  const s = String(v).trim();
  if (s.includes('/')) { const [a, b] = s.split('/'); return Lin.div(Lin.parseNumber(a), Lin.parseNumber(b)); }
  return Lin.parseNumber(s);
}

/** Les rapports que la poignée et le pas à pas proposent (la scène montre au plus le plus grand solide visé). */
const CANDIDATES = Object.freeze(['1/2', '3/5', 1, '3/2', 2, 3].map(F));

/** Une écriture courte d'une fraction : « 2 », « 3/5 ». */
export const kText = (k) => fracText(F(k));
/** Une écriture décimale à virgule quand elle est finie (« 0,6 », « 12,96 »), sinon la fraction « a/b ». */
export const decText = (q) => fracDecimal(F(q), 4) ?? fracText(F(q));
/** LaTeX d'un rapport : « 2 », « \dfrac{3}{5} ». */
export const kLatex = (k) => Lin.fracLatex(F(k));

/** La liste des rapports d'un niveau : les candidats dont le solide image tient dans le cadre du plus grand rapport visé. */
export function kList({ dims, ks }) {
  const D = dims.map(F);
  const big = D.reduce((m, d) => (cmp(d, m) > 0 ? d : m), D[0]);
  const targets = ks.map(F);
  const frame = targets.reduce((m, k) => { const s = mul(k, big); return cmp(s, m) > 0 ? s : m; }, big);
  const out = CANDIDATES.filter((k) => cmp(mul(k, big), frame) <= 0);
  for (const t of targets) if (!out.some((k) => eq(k, t))) out.push(t);
  return Object.freeze(out.sort((a, b) => cmp(a, b)));
}

/** La plus grande arête du plus grand solide image du niveau (le cadre de la caméra). */
export function frameSize({ dims, ks }) {
  const list = kList({ dims, ks });
  const kMax = list[list.length - 1];
  return Object.freeze(dims.map((d) => toNumber(mul(F(d), kMax))));
}

export function init(numbers) {
  const dims = Object.freeze((numbers?.dims ?? [1, 1, 1]).map(F));
  const ks = Object.freeze((numbers?.ks ?? [2, 3]).map(F));
  const list = kList({ dims, ks });
  return Object.freeze({
    dims, ks, list,
    k: frac(1),
    prediction: null,           // 'k' | 'k2' | 'k3'
    built: null,                // le dernier bâti : { k, verdict, … }
    builds: Object.freeze([]),  // tous les bâtis
    plus: false,                // le cadre « + 1 cm » affiché
    plusTried: false,
    last: null,                 // le dernier événement (essai) pour onTrial
    n: 0,
  });
}

const isCube = (dims) => dims.every((d) => eq(d, dims[0]));

/** Le rapport k change : la prédiction et le bâti précédent ne décrivent plus ce qui est à l'écran. */
export function setK(lab, k) {
  const K = F(k);
  if (cmp(K, frac(0)) <= 0) return lab;
  if (eq(K, lab.k)) return lab;
  return Object.freeze({ ...lab, k: K, prediction: null, built: null, plus: false });
}
/** Le rapport suivant / précédent de la liste. */
export function stepK(lab, dir) {
  const i = lab.list.findIndex((k) => eq(k, lab.k));
  const j = Math.max(0, Math.min(lab.list.length - 1, (i < 0 ? lab.list.findIndex((k) => cmp(k, lab.k) > 0) : i) + dir));
  return setK(lab, lab.list[j]);
}
/** Le rapport de la liste le plus proche d'un réel (la poignée glissée le long de la diagonale). */
export function snapK(lab, t) {
  let best = lab.list[0]; let gap = Infinity;
  for (const k of lab.list) { const g = Math.abs(toNumber(k) - t); if (g < gap) { gap = g; best = k; } }
  return best;
}

/** Le volume du pavé de départ et ses trois images « candidates ». */
export function volumes(lab) {
  const V = Sp.cuboid(...lab.dims).volume;
  return { V, k: Sp.scaled(V, lab.k, 1), k2: Sp.scaled(V, lab.k, 2), k3: Sp.scaled(V, lab.k, 3) };
}

/** Les trois volumes proposés à la prédiction, dans un ordre stable qui dépend de k (la bonne n'est jamais toujours au bout). */
export function options(lab) {
  if (eq(lab.k, frac(1))) return null;
  const v = volumes(lab);
  const list = [
    { id: 'k', value: v.k, misconceptionId: 'MISC-TAKBIR-HAJM-K' },
    { id: 'k2', value: v.k2, misconceptionId: 'MISC-TAKBIR-HAJM-K' },
    { id: 'k3', value: v.k3, correct: true },
  ];
  const r = (lab.k.n * 7 + lab.k.d * 3) % 3;
  return Object.freeze([...list.slice(r), ...list.slice(0, r)]);
}

export function predict(lab, id) {
  if (!['k', 'k2', 'k3'].includes(id) || eq(lab.k, frac(1))) return lab;
  return Object.freeze({ ...lab, prediction: id, built: null });
}

/** true | 'noPrediction' | 'already' */
export function canBuild(lab) {
  if (lab.built && eq(lab.built.k, lab.k)) return 'already';
  if (!eq(lab.k, frac(1)) && !lab.prediction) return 'noPrediction';
  return true;
}

/** Bâtir le solide image : le décompte juge la prédiction. */
export function build(lab) {
  if (canBuild(lab) !== true) return lab;
  const v = volumes(lab);
  const identity = eq(lab.k, frac(1));
  const predicted = identity ? null : v[lab.prediction];
  const verdict = identity ? 'identity' : lab.prediction === 'k3' ? 'ok' : lab.prediction;
  const n = lab.n + 1;
  const rec = Object.freeze({
    i: n, k: lab.k, prediction: lab.prediction, predicted, volume: v.k3, verdict,
    dims: Sp.scaleAll(lab.dims, lab.k), area: Sp.scaled(Sp.cuboid(...lab.dims).area, lab.k, 2),
  });
  return Object.freeze({ ...lab, built: rec, builds: Object.freeze([...lab.builds, rec]), last: Object.freeze({ kind: 'build', ...rec }), n });
}

/** Le contraste « ajouter 1 cm à chaque arête » (affiché / masqué ; le premier affichage compte comme essai). */
export function plusOne(lab) {
  const on = !lab.plus;
  const n = on ? lab.n + 1 : lab.n;
  return Object.freeze({
    ...lab, plus: on, plusTried: lab.plusTried || on, n,
    last: on ? Object.freeze({ kind: 'plus', i: n, ...plusReading(lab.dims) }) : lab.last,
  });
}

/** (a + 1)/a, (b + 1)/b, (c + 1)/c : un agrandissement exige le MÊME rapport sur les trois arêtes. */
export function plusReading(dims) {
  const D = dims.map(F);
  const image = D.map((d) => add(d, frac(1)));
  const ratios = D.map((d, i) => div(image[i], d));
  const same = ratios.every((r) => eq(r, ratios[0]));
  return Object.freeze({ dims: Object.freeze(D), image: Object.freeze(image), ratios: Object.freeze(ratios), enlargement: same });
}

/** Ce que la lecture affiche : avant / après, et les rapports EXACTS image ÷ départ (k, k², k³ — nommés après la découverte). */
export function readings(lab) {
  const c = Sp.cuboid(...lab.dims);
  const e = Sp.scaleEffect(lab.k);
  const dims2 = Sp.scaleAll(lab.dims, lab.k);
  return Object.freeze({
    dims: lab.dims, dims2, area: c.area, area2: Sp.scaled(c.area, lab.k, 2), volume: c.volume, volume2: Sp.scaled(c.volume, lab.k, 3),
    ratio: Object.freeze({ length: e.length, area: e.area, volume: e.volume }), kind: e.kind, cube: isCube(lab.dims),
  });
}

/**
 * Les cubes du solide image : chaque cube (i, j, l) du pavé devient un cube d'arête k posé en k·(i, j, l). Quand k est ENTIER,
 * ce cube est dessiné comme k³ cubes unités (même `cluster`) ; sinon c'est un seul cube d'arête k.
 * → { unit, size, cubes: [{ at: [x, y, z], cluster, layer }] } (coordonnées en nombres : le dessin seulement).
 */
export function blockLayout(dims, k) {
  const [a, b, c] = dims.map((d) => toNumber(F(d)));
  const K = F(k);
  const kn = toNumber(K);
  const integer = isInteger(K) && Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(c);
  const cubes = [];
  for (let l = 0; l < c; l += 1) {
    for (let j = 0; j < b; j += 1) {
      for (let i = 0; i < a; i += 1) {
        const cluster = (i + j + l) % 2;
        if (integer && kn > 1) {
          for (let w = 0; w < kn; w += 1) for (let v = 0; v < kn; v += 1) for (let u = 0; u < kn; u += 1) {
            cubes.push({ at: [i * kn + u, j * kn + v, l * kn + w], cluster, layer: l * kn + w });
          }
        } else {
          cubes.push({ at: [i * kn, j * kn, l * kn], cluster, layer: l });
        }
      }
    }
  }
  return Object.freeze({ unit: integer && kn >= 1, size: integer && kn > 1 ? 1 : kn, cubes });
}

/** Les rapports visés ont tous été bâtis (après une prédiction) — et, au niveau du نشاط 6, le contraste « + 1 cm » essayé. */
export function discoveryReady(lab) {
  const done = lab.ks.every((t) => lab.builds.some((bd) => eq(bd.k, t) && bd.prediction));
  const distinct = new Set(lab.builds.filter((bd) => bd.prediction).map((bd) => fracText(bd.k))).size >= 2;
  const needsPlus = !isCube(lab.dims);
  return done && distinct && (!needsPlus || lab.plusTried);
}

/* ── les étapes du labo et leurs questions (lot 4, `primitives/LabCheckpoint`) ───────────────────────────── */

const buildAt = (lab, k) => [...lab.builds].reverse().find((bd) => eq(bd.k, k) && bd.prediction) ?? null;
/** Une étape par rapport visé (un bâti prédit), puis (pavé) le contraste « + 1 cm » ; la DERNIÈRE n'est atteinte qu'au contraste complet (la règle). */
export function stepsOf(lab) {
  const steps = lab.ks.map((k, i) => ({ id: `k${i}`, k, trial: buildAt(lab, k), reached: !!buildAt(lab, k) }));
  if (!isCube(lab.dims)) steps.push({ id: 'plus', k: null, trial: lab.plusTried ? plusReading(lab.dims) : null, reached: lab.plusTried });
  const last = steps.length - 1;
  steps[last] = { ...steps[last], reached: steps[last].reached && discoveryReady(lab) };
  return steps.map((x) => Object.freeze(x));
}
/** « أعِد التجربة » : le bâti de l'étape (ou le cadre « + 1 cm ») est effacé, k et la prédiction repartent. */
export function retryStep(lab, id) {
  const st = stepsOf(lab).find((x) => x.id === id);
  if (!st) return lab;
  if (id === 'plus') return Object.freeze({ ...lab, plus: false, plusTried: false, last: null });
  return Object.freeze({
    ...lab, k: st.k, prediction: null, built: null, plus: false, last: null,
    builds: Object.freeze(lab.builds.filter((bd) => !eq(bd.k, st.k))),
  });
}
/** Les grandeurs EXACTES d'un rapport k pour la 1re arête, l'aire totale et le volume du pavé de départ. */
export function scaledAt(lab, k) {
  const c = Sp.cuboid(...lab.dims);
  return Object.freeze({
    edge0: lab.dims[0], edge1: Sp.scaled(lab.dims[0], k, 1), area0: c.area, area1: Sp.scaled(c.area, k, 2), vol0: c.volume, vol1: Sp.scaled(c.volume, k, 3),
  });
}

/** Ce que reçoit `onTrial` : un bâti ou le contraste (pour la liste des essais de l'élève dans la leçon). */
export function evidenceOf(lab) {
  const e = lab.last;
  if (!e) return null;
  if (e.kind === 'plus') {
    return { kind: 'plus', n: e.i, dims: e.dims.map(fracText), image: e.image.map(fracText), ratios: e.ratios.map(decText), enlargement: e.enlargement };
  }
  return {
    kind: 'build', n: e.i, k: fracText(e.k), ok: e.verdict === 'ok' || e.verdict === 'identity', verdict: e.verdict,
    predicted: e.predicted ? decText(e.predicted) : null, volume: decText(e.volume), area: decText(e.area), dims: e.dims.map(decText),
  };
}

/** V′ ÷ V (exact) : « combien de fois » le volume du pavé de départ — la colonne et les « pourquoi » de la découverte. */
export const volumeRatio = (lab, volume) => div(F(volume), Sp.cuboid(...lab.dims).volume);

