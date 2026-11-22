/**
 * parallelogram-pin — la logique PURE de la banderole du tifo (unité 11 « الأشعة والانسحاب », درس « الشعاعان
 * المتساويان ومتوازي الأضلاع ومنتصف قطعة »). Aucun React ici et AUCUNE arithmétique propre : chaque verdict
 * « même vecteur ? » vient de `vectors.relation` (المنحى / الاتجاه / الطول), chaque point de `vectors.translate`,
 * `vectors.midpoint`, `vectors.vecScale` (packages/core/arithmetic/vectors.js, fractions exactes). Les flottants ne
 * servent qu'au dessin.
 *
 * DEUX MODES, un même objectif (« تساوي شعاعين يترجم المنتصف ومتوازي الأضلاع ») :
 *
 *   `midpoint` (مبتدئ, plateforme) — [AB] est partagé en N parts égales (N = 8) ; l'élève tient I sur [AB]
 *     (encoche k = 1 … N − 1, I = A + k/N · AB). Les flèches AI et IB sont comparées en direct : même منحى et même
 *     اتجاه toujours, même طول SEULEMENT à k = N/2. Il peut aussi RETOURNER la seconde flèche (IB ↔ BI) : au
 *     milieu, AI et BI ont le même منحى et le même طول mais des اتجاهان متعاكسان — le piège MISC-SHUAA-MUNTASAF-IB-IA.
 *
 *   `parallelogram` (متقدم, طرائق p. 131 « إنشاء صورة نقطة بانسحاب عُلم شعاعه ») — A, B, C donnés sur la ورقة
 *     مرصوفة. Étape D : l'élève POSE D (nœud par nœud) pour que D soit l'image de C par le انسحاب de vecteur AB,
 *     i.e. CD = AB. La banderole A → B → D → C ne se tend en متوازي أضلاع ABDC que là ; les milieux de ses deux
 *     cordes [AD] et [BC] se confondent ALORS seulement (A + D = B + C). Le piège DC = AB (D = C − AB) donne une
 *     banderole croisée — refusé avec sa raison (MISC-SHUAA-TARTIB-RUUS). Étape E (ouverte par l'élève) : E tel
 *     que EB = AC ; poser E « à la place de BE = AC » tombe… sur D (BD = AC) — refusé. Alors EB = BD : B milieu de [DE].
 *
 * UN ESSAI est une position VALIDÉE (relâchement, Entrée, toucher d'un nœud, pause du curseur, retournement de la
 * flèche) — jamais une valeur que le doigt a traversée.
 */
import * as V from '@smarter-academy/core/arithmetic/vectors.js';

const STEPS = 8;

const toPt = (p) => (p && typeof p.x === 'object' ? p : V.point(p[0], p[1]));
const key = (p) => V.coords(p).join(';');
export const same = (p, q) => V.vecEq(toPt(p), toPt(q));
export const xy = (p) => V.coords(toPt(p));

// ── le mode « midpoint » ─────────────────────────────────────────────────────

/** L'état initial : [AB], N parts, I à l'encoche `start` (jamais le milieu). */
function initMidpoint({ A = [0, 0], B = [4, 2], steps = STEPS, start = 2 } = {}) {
  const N = Number(steps);
  if (!Number.isInteger(N) || N < 4 || N % 2 !== 0) throw new Error(`parallelogram-pin: steps pair ≥ 4 (« ${steps} »)`);
  const a = toPt(A); const b = toPt(B);
  if (V.vecEq(a, b)) throw new Error('parallelogram-pin: A = B');
  const k = Math.min(N - 1, Math.max(1, start === N / 2 ? start + 1 : start));
  return Object.freeze({ mode: 'midpoint', A: a, B: b, N, k, second: 'IB', trials: Object.freeze([]), last: null });
}

export const midRange = (s) => Object.freeze({ min: 1, max: s.N - 1 });
/** I à l'encoche k : A + (k/N)·AB, exact. */
export const pointI = (s, k = s.k) => V.translate(s.A, V.vecScale(V.vec(s.A, s.B), `${k}/${s.N}`));

/**
 * La lecture à l'encoche k : les deux vecteurs comparés, la relation du manuel et son verdict.
 *   kind 'equal'  — AI = IB (même منحى، اتجاه، طول) : I est le milieu ;
 *   kind 'length' — même منحى et même اتجاه, longueurs différentes (`shorter` dit laquelle) ;
 *   kind 'sense'  — même منحى et même طول, اتجاهان متعاكسان (AI et BI au milieu) ;
 *   kind 'both'   — même منحى seulement (BI ailleurs qu'au milieu : sens ET longueur diffèrent).
 */
export function midReading(s, k = s.k, second = s.second) {
  const I = pointI(s, k);
  const AI = V.vec(s.A, I);
  const W = second === 'IB' ? V.vec(I, s.B) : V.vec(s.B, I);
  const rel = V.relation(AI, W);
  const kind = rel.equal ? 'equal' : rel.sense && !rel.length ? 'length' : !rel.sense && rel.length ? 'sense' : 'both';
  return Object.freeze({
    k, second, I, rel, kind,
    partsAI: k, partsW: s.N - k,
    shorter: k * 2 < s.N ? 'AI' : k * 2 > s.N ? 'W' : null,
    middle: k * 2 === s.N,
  });
}

export const moveI = (s, k) => {
  const r = midRange(s);
  const kk = Math.min(r.max, Math.max(r.min, Math.round(k)));
  return kk === s.k ? s : Object.freeze({ ...s, k: kk, last: Object.freeze({ kind: 'move' }) });
};

/** Valide la position de I (un essai). */
export function commitI(s, k = s.k) {
  const moved = moveI(s, k);
  const r = midReading(moved);
  const trial = Object.freeze({ k: r.k, second: r.second, kind: r.kind, middle: r.middle });
  return Object.freeze({ ...moved, trials: Object.freeze([...moved.trials, trial]), last: Object.freeze({ kind: 'commit', trial }) });
}

/**
 * « جرّب كل الإمكانيات » (mode midpoint) : les encoches de I pas encore validées avec la seconde flèche affichée
 * (le retournement reste un choix de l'élève). Chacune est un `commitI` ordinaire.
 */
export function untriedNotches(s) {
  if (s.mode !== 'midpoint') return [];
  const r = midRange(s);
  return Array.from({ length: r.max - r.min + 1 }, (_, j) => r.min + j)
    .filter((k) => !s.trials.some((t) => t.k === k && t.second === s.second));
}

/** Le départ n'est jamais la réponse : midpoint, jamais le milieu ; parallelogram, ni D juste, ni le piège, ni E juste. */
export function defaultIsSolution(s) {
  if (s.mode === 'midpoint') return s.k * 2 === s.N;
  const at = (p, q) => V.vecEq(p, q);
  return at(s.D, s.target) || at(s.D, s.crossed) || at(s.E, s.targetE) || at(s.E, s.target);
}

/** Retourner la seconde flèche (IB ↔ BI) : un essai aussi (l'élève a choisi quoi comparer). */
export function flip(s) {
  const t = Object.freeze({ ...s, second: s.second === 'IB' ? 'BI' : 'IB' });
  return commitI(t, t.k);
}

/** Le contraste : le milieu (AI = IB) ET une position où seules les longueurs diffèrent. */
export function midDiscoveryReady(s) {
  return s.trials.some((t) => t.kind === 'equal') && s.trials.some((t) => t.kind === 'length');
}

// ── le mode « parallelogram » ────────────────────────────────────────────────

const OFFSETS = [[1, -2], [-1, -2], [2, 1], [-2, 1], [0, -2], [2, 0]];

/** Le cadre de la ورقة مرصوفة : A, B, C, les cibles et les pièges, plus une maille autour. */
function windowOf(points) {
  const cs = points.map(xy);
  const xs = cs.map((c) => c[0]); const ys = cs.map((c) => c[1]);
  return Object.freeze({
    xMin: Math.floor(Math.min(...xs)) - 1, xMax: Math.ceil(Math.max(...xs)) + 1,
    yMin: Math.floor(Math.min(...ys)) - 1, yMax: Math.ceil(Math.max(...ys)) + 1,
  });
}

function initParallelogram({ A = [1, 4], B = [2, 1], C = [5, 3] } = {}) {
  const a = toPt(A); const b = toPt(B); const c = toPt(C);
  if (V.collinear(a, b, c)) throw new Error('parallelogram-pin: A, B, C alignés');
  for (const p of [a, b, c]) if (!xy(p).every(Number.isInteger)) throw new Error('parallelogram-pin: nœuds entiers');
  const AB = V.vec(a, b); const AC = V.vec(a, c);
  const target = V.translate(c, AB);          // D : CD = AB
  const crossed = V.translate(c, V.vecNeg(AB)); // le piège : DC = AB
  const targetE = V.translate(b, V.vecNeg(AC)); // E : EB = AC
  const win = windowOf([a, b, c, target, crossed, targetE]);
  const inWin = (p) => { const [x, y] = xy(p); return x >= win.xMin && x <= win.xMax && y >= win.yMin && y <= win.yMax; };
  const taken = [a, b, c, target, crossed];
  const start = (from, avoid) => {
    for (const [dx, dy] of OFFSETS) {
      const p = V.translate(from, V.point(dx, dy));
      if (inWin(p) && !avoid.some((q) => V.vecEq(p, q))) return p;
    }
    throw new Error('parallelogram-pin: pas de départ libre');
  };
  const D = start(c, [...taken, targetE]);
  const E = start(b, [...taken, targetE, D]);
  return Object.freeze({
    mode: 'parallelogram', A: a, B: b, C: c, target, crossed, targetE, win,
    stage: 'D', D, E, dDone: false, eDone: false, trials: Object.freeze([]), last: null,
  });
}

/** Le nœud entier le plus proche d'un point continu, borné au cadre. */
export function nodeAt(s, x, y) {
  const cx = Math.min(s.win.xMax, Math.max(s.win.xMin, Math.round(x)));
  const cy = Math.min(s.win.yMax, Math.max(s.win.yMin, Math.round(y)));
  return V.point(cx, cy);
}

/**
 * Le verdict d'une position du point tenu (`which` = 'D' ou 'E') :
 *   D : on compare CD à AB ; E : on compare EB à AC (le manuel : « EB = AC »).
 *   'ok'        — égaux ;
 *   'order'     — opposés : DC = AB (la banderole croisée) / BE = AC ;
 *   'isD'       — (E) E posé sur D : c'est BD = AC, pas EB = AC ;
 *   'length'    — même منحى، même اتجاه, longueur différente (`longer`) ;
 *   'senseLen'  — même منحى, اتجاه contraire ET longueur différente ;
 *   'direction' — منحى différent (`sameLength` : même longueur, autre منحى — « la longueur ne suffit pas ») ;
 *   'zero'      — le point est posé sur l'origine (C pour D, B pour E) : pas de flèche.
 */
export function judge(s, which, P = s[which]) {
  const p = toPt(P);
  const ref = which === 'D' ? V.vec(s.A, s.B) : V.vec(s.A, s.C);
  const vecOf = which === 'D' ? V.vec(s.C, p) : V.vec(p, s.B);
  if (V.isZeroVec(vecOf)) return Object.freeze({ kind: 'zero', rel: null });
  const rel = V.relation(vecOf, ref);
  let kind;
  if (rel.equal) kind = 'ok';
  else if (which === 'E' && V.vecEq(p, s.target)) kind = 'isD';
  else if (rel.opposite) kind = 'order';
  else if (rel.direction && rel.sense) kind = 'length';
  else if (rel.direction) kind = 'senseLen';
  else kind = 'direction';
  const longer = rel.direction ? V.normSquared(vecOf).n * V.normSquared(ref).d > V.normSquared(ref).n * V.normSquared(vecOf).d : null;
  return Object.freeze({ kind, rel, longer, sameLength: rel.length });
}

/** Les milieux des deux cordes de la banderole, [AD] et [BC], et s'ils se confondent (A + D = B + C). */
export function midpoints(s, D = s.D) {
  const mAD = V.midpoint(s.A, toPt(D));
  const mBC = V.midpoint(s.B, s.C);
  return Object.freeze({ mAD, mBC, merged: V.vecEq(mAD, mBC) });
}

/** La banderole A → B → D → C : tendue (متوازي أضلاع), croisée (le piège DC = AB) ou lâche. */
export function bannerShape(s, D = s.D) {
  const d = toPt(D);
  if (V.isParallelogram(s.A, s.B, d, s.C)) return 'taut';
  if (V.isParallelogram(s.A, s.B, s.C, d)) return 'crossed';
  return 'slack';
}

export function movePoint(s, which, P) {
  if (which === 'E' && s.stage !== 'E') return s;
  if (which === 'D' && s.stage !== 'D') return s;
  const p = nodeAt(s, ...xy(P));
  return V.vecEq(p, s[which]) ? s : Object.freeze({ ...s, [which]: p, last: Object.freeze({ kind: 'move' }) });
}

/** Valide la position du point tenu (un essai) ; une position juste fige l'étape. */
export function commitPoint(s, which, P = s[which]) {
  const moved = movePoint(s, which, P);
  if (moved.stage !== which) return moved;
  const p = moved[which];
  const j = judge(moved, which, p);
  const trial = Object.freeze({ which, at: key(p), kind: j.kind, sameLength: j.sameLength, longer: j.longer });
  const done = j.kind === 'ok';
  return Object.freeze({
    ...moved,
    ...(which === 'D' ? { dDone: moved.dDone || done } : { eDone: moved.eDone || done }),
    trials: Object.freeze([...moved.trials, trial]),
    last: Object.freeze({ kind: 'commit', trial }),
  });
}

/** L'élève ouvre l'étape E (seulement après D juste) — et peut revenir voir D. */
export const openE = (s) => (s.dDone ? Object.freeze({ ...s, stage: 'E', last: null }) : s);
export const backToD = (s) => Object.freeze({ ...s, stage: 'D', last: null });

const paraDiscoveryReady = (s) => s.dDone && s.eDone;

// ── commun ───────────────────────────────────────────────────────────────────

export function init(n = {}) {
  return n.mode === 'parallelogram' ? initParallelogram(n) : initMidpoint(n);
}
export const discoveryReady = (s) => (s.mode === 'parallelogram' ? paraDiscoveryReady(s) : midDiscoveryReady(s));

/** Les ÉTAPES de la scène : midpoint `equal` (le milieu) · `length` (une encoche où seules les longueurs diffèrent) ; parallelogram `D` · `E`. */
export const STEP_KINDS = Object.freeze({ midpoint: ['equal', 'length'], parallelogram: ['D', 'E'] });
export function reachedKinds(s) {
  if (s.mode === 'parallelogram') return [s.dDone && 'D', s.eDone && 'E'].filter(Boolean);
  return STEP_KINDS.midpoint.filter((kd) => s.trials.some((t) => t.kind === kd));
}
/** « أعِد التجربة » : remet CETTE étape au départ (ses essais s'effacent, la poignée revient, l'autre étape reste). */
export function restartStep(s, kd) {
  if (s.mode === 'parallelogram') {
    const f = initParallelogram({ A: xy(s.A), B: xy(s.B), C: xy(s.C) });
    const trials = s.trials.filter((t) => t.which !== kd);
    return kd === 'D'
      ? Object.freeze({ ...s, D: f.D, dDone: false, eDone: false, stage: 'D', trials: Object.freeze(trials.filter((t) => t.which !== 'E')), last: null })
      : Object.freeze({ ...s, E: f.E, eDone: false, stage: 'E', trials: Object.freeze(trials), last: null });
  }
  return Object.freeze({ ...s, k: Math.min(s.N - 1, 2), second: 'IB', trials: Object.freeze(s.trials.filter((t) => t.kind !== kd)), last: null });
}

/** Le dernier essai validé d'un certain genre (pour réfuter un distracteur avec les propres essais de l'élève). */
export const lastTrial = (s, pred) => [...s.trials].reverse().find(pred) ?? null;

/** Ce que le module affiche de l'essai (`onTrial`). */
export function evidenceOf(s) {
  const t = s.trials.at(-1);
  if (!t) return null;
  if (s.mode === 'midpoint') return { mode: 'midpoint', n: s.trials.length, k: t.k, N: s.N, second: t.second, kind: t.kind };
  return { mode: 'parallelogram', n: s.trials.length, which: t.which, kind: t.kind };
}

/** La géométrie du dessin : cadre (unités), échelle en px, conversions. */
export function frame(s, { width, height, pad = 22 }) {
  const win = s.mode === 'parallelogram' ? s.win : windowOf([s.A, s.B]);
  const cols = win.xMax - win.xMin; const rows = win.yMax - win.yMin;
  const u = Math.max(8, Math.min((width - 2 * pad) / cols, (height - 2 * pad) / rows));
  const W = cols * u + 2 * pad; const H = rows * u + 2 * pad;
  const ox = (width - W) / 2; const oy = (height - H) / 2;
  const px = (x) => ox + pad + (x - win.xMin) * u;
  const py = (y) => oy + pad + (win.yMax - y) * u;
  const fromPx = (X, Y) => [win.xMin + (X - ox - pad) / u, win.yMax - (Y - oy - pad) / u];
  return { win, u, cols, rows, px, py, fromPx, P: (p) => { const [x, y] = xy(p); return [px(x), py(y)]; } };
}

/** La hauteur naturelle de la scène pour une largeur : l'échelle d'un carré du quadrillage, plafonnée. */
export function naturalHeight(s, width, pad = 22) {
  const win = s.mode === 'parallelogram' ? s.win : windowOf([s.A, s.B]);
  const cols = win.xMax - win.xMin; const rows = win.yMax - win.yMin;
  const u = Math.min(64, (width - 2 * pad) / cols);
  return rows * u + 2 * pad;
}
