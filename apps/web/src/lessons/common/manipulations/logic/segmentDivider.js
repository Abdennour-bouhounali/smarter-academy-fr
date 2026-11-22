/**
 * segment-divider — la logique PURE de l'éventail des parallèles (unité 9 « خاصية طالس », درس
 * « إنشاءات هندسية وتطبيقات خاصية طالس (تقسيم قطعة مستقيم) », طرائق pp. 107 et 109).
 * Aucun React ici, aucune arithmétique propre : les rapports viennent de `thales` (packages/core),
 * les fractions de `linear`. Les COORDONNÉES de dessin (flottants) sont calculées à part, dans
 * `sceneLayout` / `setSquareAt`, et ne décident jamais de rien.
 *
 * L'UNITÉ DE LA SCÈNE est le millimètre du dessin : [AB] mesure toujours 100 (AB = `length` cm à la
 * lecture, 10 cm par défaut). Une ouverture du compas est un ENTIER de millimètres ; une marque est
 * posée à (marque précédente + ouverture) sur son rail. Tout ce qui se lit (parts, rapports) est un
 * rapport d'entiers — exact.
 *
 * DEUX MODES, un seul instrument (règle non graduée + compas + équerre) :
 *
 *   'equal' (طرائق ص 107, مبتدئ) — partager [AB] en n parts égales :
 *     1. le rayon [Ax) : son angle se règle tant qu'aucune marque n'est posée (`setAngle`) ;
 *     2. le compas : une ouverture r (`setOpening`), chaque report est un geste (`carry`) — changer
 *        r en route donne des marques INÉGALES que la mesure finale montre ;
 *     3. relier une marque à B (`join`) — la n-ième, pas la dernière posée par hasard ;
 *     4. l'équerre glisse le long de la règle (`setSlide`, aimantée à ±3 mm d'une marque) ; `draw` trace
 *        la parallèle par la marque sous son bord — refusée hors d'une marque.
 *     Une construction finie (toutes les marques avant la marque reliée ont leur parallèle) est un
 *     ESSAI : `ok` si n = parts et marques égales ; sinon `count` (MISC-TALIS-ADAD-AL-ALAMAT) ou
 *     `unequal`. La découverte demande un essai juste ET un contraste (un essai raté, ou deux essais
 *     justes d'angles / d'ouvertures différents : les points de partage ne bougent pas).
 *
 *   'ratio' (طرائق ص 109, متقدم) — le point M de (AB) tel que MA/MB = p/q :
 *     (d₁) // (d₂) passent par A et B ; le compas gradue quatre rails (d₁ ↑, d₁ ↓, d₂ ↑, d₂ ↓) ;
 *     la règle relie une marque de (d₁) à une marque de (d₂) (`setEnd`, `commitRuler`) et coupe (AB)
 *     au point t·AB, t = a/(a − b) (abscisses SIGNÉES le long de d) — par `thales.ratioPoint`.
 *     MA/MB = |a|/|b| (`thales.ratio`). Côtés opposés → le point est dans [AB] ; même côté → dehors ;
 *     a = b → la règle est parallèle à (AB). La découverte : le point intérieur ET le point extérieur.
 *
 *   const s = carry(carry(carry(init({ parts: 3 }))));      // trois marques de 15 mm
 *   const j = join(s, 2);                                   // la 3e marque reliée à B
 *   draw(setSlide(j, 15))  …                                // parallèles par les marques 1 et 2
 */
import * as TH from '@smarter-academy/core/arithmetic/thales.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';

const { frac, sub, div, eq, cmp, toNumber, fracText } = LIN;

/** [AB] dans la scène (mm). */
export const AB = 100;
const MODES = Object.freeze(['equal', 'ratio']);
export const ANGLE = Object.freeze({
  equal: Object.freeze({ min: 20, max: 70, start: 40 }),
  ratio: Object.freeze({ min: 40, max: 90, start: 65 }),
});
export const OPEN = Object.freeze({
  equal: Object.freeze({ min: 8, max: 25, start: 15 }),
  ratio: Object.freeze({ min: 6, max: 20, start: 12 }),
});
/** L'équerre « accroche » une marque à 3 mm près. */
const SNAP = 3;
export const RAILS = Object.freeze({ equal: Object.freeze(['ray']), ratio: Object.freeze(['a+', 'a-', 'b+', 'b-']) });

const clampInt = (v, lo, hi) => Math.min(hi, Math.max(lo, Math.round(Number(v))));

export function init({ mode = 'equal', parts = 3, p = 3, q = 2, marks = 5, length = 10, sameUnitOnly = false, player = false } = {}) {
  const m = MODES.includes(mode) ? mode : 'equal';
  if (m === 'equal' && (!Number.isInteger(parts) || parts < 2 || parts > 9)) throw new Error(`segment-divider: parts « ${parts} »`);
  if (m === 'ratio' && (!Number.isInteger(p) || !Number.isInteger(q) || p < 1 || q < 1 || p > marks || q > marks)) {
    throw new Error(`segment-divider: rapport ${p}/${q} pour ${marks} marques par rail`);
  }
  const rails = Object.fromEntries(RAILS[m].map((r) => [r, []]));
  return Object.freeze({
    mode: m,
    parts: m === 'equal' ? parts : null,
    p: m === 'ratio' ? p : null,
    q: m === 'ratio' ? q : null,
    // `equal` : n + 1 marques possibles — de quoi poser une marque de trop (et la relier par erreur).
    cap: m === 'equal' ? parts + 1 : marks,
    length,
    // LECTEUR DE MISSION (2026-11-10, conseil L3.1) — voir la fin du fichier. `sameUnitOnly` : une règle posée sur des graduations d'ouvertures
    // différentes est REFUSÉE (`units`) ; `player` : la marque 1 ne se relie pas à B, une règle déjà essayée n'est pas un nouvel essai.
    sameUnitOnly: m === 'ratio' && Boolean(sameUnitOnly),
    player: Boolean(player),
    angle: ANGLE[m].start,
    opening: OPEN[m].start,
    rails,
    joined: null,
    parallels: [],
    slide: null,
    ends: { a: null, b: null },
    joins: [],
    trials: [],
    last: null,
  });
}

const put = (s, patch) => Object.freeze({ ...s, ...patch });

/* ── le rayon / les deux parallèles : l'angle ─────────────────────────────── */

export const markCount = (s) => Object.values(s.rails).reduce((n, r) => n + r.length, 0);
/** L'angle se règle tant qu'aucune marque n'est posée : changer la direction en route déplacerait les marques. */
const angleLocked = (s) => markCount(s) > 0;

export function setAngle(s, deg) {
  if (angleLocked(s)) return put(s, { last: { kind: 'angleLocked' } });
  const a = clampInt(deg, ANGLE[s.mode].min, ANGLE[s.mode].max);
  return a === s.angle ? s : put(s, { angle: a });
}

/* ── le compas : l'ouverture, les reports ─────────────────────────────────── */

export function setOpening(s, r) {
  const o = clampInt(r, OPEN[s.mode].min, OPEN[s.mode].max);
  return o === s.opening ? s : put(s, { opening: o });
}

export const lastPos = (s, rail) => s.rails[rail].at(-1)?.pos ?? 0;
/** Où tomberait le prochain report sur ce rail (la « marque fantôme »). */
export const ghostPos = (s, rail) => lastPos(s, rail) + s.opening;

/** true | raison du refus. */
export function canCarry(s, rail = RAILS[s.mode][0]) {
  if (!s.rails[rail]) return 'noRail';
  if (s.rails[rail].length >= s.cap) return 'full';
  if (s.mode === 'equal' && s.joined != null) return 'afterJoin';
  return true;
}

export function carry(s, rail = RAILS[s.mode][0]) {
  const ok = canCarry(s, rail);
  if (ok !== true) return put(s, { last: { kind: ok, rail } });
  const prev = s.rails[rail].at(-1);
  const mark = Object.freeze({ pos: ghostPos(s, rail), r: s.opening });
  const list = [...s.rails[rail], mark];
  return put(s, {
    rails: Object.freeze({ ...s.rails, [rail]: Object.freeze(list) }),
    last: { kind: 'carried', rail, count: list.length, changed: prev != null && prev.r !== s.opening },
  });
}

/** Les ouvertures d'un rail sont-elles toutes égales (sur les `upto` premières marques) ? */
function evenMarks(s, rail, upto = s.rails[rail].length) {
  const list = s.rails[rail].slice(0, upto);
  return list.every((m) => m.r === list[0].r);
}

/* ── mode 'equal' : relier, glisser l'équerre, tracer ─────────────────────── */

export const rayMarks = (s) => s.rails.ray ?? [];

export function join(s, idx) {
  if (s.mode !== 'equal') return s;
  const marks = rayMarks(s);
  if (marks.length === 0) return put(s, { last: { kind: 'noMarks' } });
  if (!Number.isInteger(idx) || idx < 0 || idx >= marks.length) return s;
  if (s.parallels.length > 0) return put(s, { last: { kind: 'joinLocked' } });
  // lecteur : relier la marque 1 ne trace aucune parallèle et ne finit jamais un essai (impasse) — refusé, sans compter
  if (s.player && idx === 0) return put(s, { last: { kind: 'joinOne' } });
  return put(s, { joined: idx, slide: marks[idx].pos, last: { kind: 'joined', idx } });
}

export const slideMax = (s) => rayMarks(s).at(-1)?.pos ?? 0;

/** La position lue sous le doigt, aimantée à une marque à SNAP mm près. */
export function snapSlide(s, raw) {
  const v = clampInt(raw, 0, slideMax(s));
  let best = null;
  for (const m of rayMarks(s)) if (Math.abs(m.pos - raw) <= SNAP && (best == null || Math.abs(m.pos - raw) < Math.abs(best - raw))) best = m.pos;
  return best ?? v;
}

export function setSlide(s, v) {
  if (s.joined == null) return s;
  const x = clampInt(v, 0, slideMax(s));
  return x === s.slide ? s : put(s, { slide: x });
}

/** La marque sous le bord de l'équerre (index) ou -1. */
export const markUnderSquare = (s) => rayMarks(s).findIndex((m) => m.pos === s.slide);

/** La marque précédente / suivante (pour les boutons ‹ › de l'équerre). */
export function neighbourMark(s, dir) {
  const ps = rayMarks(s).map((m) => m.pos);
  const cur = s.slide ?? 0;
  const next = dir > 0 ? ps.find((p) => p > cur) : [...ps].reverse().find((p) => p < cur);
  return next ?? cur;
}

/** Le point de (AB) où tombe la parallèle passant à la position `pos` du rayon : pos / pos(jointe), en fraction de AB. */
function cutAt(s, pos) {
  const pj = rayMarks(s)[s.joined].pos;
  return TH.ratio(pos, pj);
}

export function complete(s) {
  if (s.mode !== 'equal' || s.joined == null) return false;
  for (let i = 0; i < s.joined; i += 1) if (!s.parallels.includes(i)) return false;
  return true;
}

/** Les points de partage tracés : [{ idx, t }] (t en fraction de AB ; t > 1 hors de [AB]). */
export const cutsOf = (s) => (s.joined == null ? [] : [...s.parallels].sort((a, b) => a - b).map((idx) => ({ idx, t: cutAt(s, rayMarks(s)[idx].pos) })));

/** Les parts de [AB] (fractions de AB) quand la construction est finie : différences successives. */
function partsOf(s) {
  if (!complete(s)) return null;
  const ts = cutsOf(s).filter((c) => c.idx < s.joined).map((c) => c.t);
  const pts = [frac(0), ...ts, frac(1)];
  return pts.slice(1).map((t, i) => sub(t, pts[i]));
}

export function draw(s) {
  if (s.mode !== 'equal') return s;
  if (s.joined == null) return put(s, { last: { kind: 'joinFirst' } });
  const idx = markUnderSquare(s);
  if (idx < 0) {
    const near = rayMarks(s).reduce((b, m, i) => (b == null || Math.abs(m.pos - s.slide) < Math.abs(rayMarks(s)[b].pos - s.slide) ? i : b), null);
    return put(s, { last: { kind: 'offMark', near } });
  }
  if (idx === s.joined) return put(s, { last: { kind: 'joinedLine', idx } });
  if (s.parallels.includes(idx)) return put(s, { last: { kind: 'already', idx } });
  const next = put(s, { parallels: Object.freeze([...s.parallels, idx]), last: { kind: 'drawn', idx, t: cutAt(s, rayMarks(s)[idx].pos) } });
  if (!complete(next) || complete(s)) return next;
  // la construction est finie : c'est un ESSAI
  const n = s.joined + 1;
  const even = evenMarks(next, 'ray', n);
  const kind = n !== s.parts ? 'count' : even ? 'ok' : 'unequal';
  const trial = Object.freeze({
    n, even, kind, ok: kind === 'ok', angle: s.angle,
    openings: rayMarks(next).slice(0, n).map((m) => m.r),
    parts: partsOf(next),
  });
  return put(next, { trials: Object.freeze([...s.trials, trial]), last: { kind: 'complete', trial } });
}

/** Un nouveau dessin : le rayon, les marques et les traits s'effacent ; les essais restent. */
export function fresh(s) {
  return put(s, {
    rails: Object.freeze(Object.fromEntries(RAILS[s.mode].map((r) => [r, []]))),
    joined: null, parallels: [], slide: null, ends: { a: null, b: null }, last: { kind: 'fresh' },
  });
}

/* ── mode 'ratio' : les deux bouts de la règle ────────────────────────────── */

/** Les abscisses signées (mm, depuis A ou B le long de d) des marques d'une droite, croissantes. */
export function lineMarks(s, line) {
  const up = s.rails[`${line}+`] ?? [];
  const down = s.rails[`${line}-`] ?? [];
  return [...down.map((m) => -m.pos).reverse(), ...up.map((m) => m.pos)];
}

/** Le rang (1, 2, …) d'une marque sur son rail, et le rail. */
export function markInfo(s, line, signed) {
  const rail = `${line}${signed > 0 ? '+' : '-'}`;
  const i = (s.rails[rail] ?? []).findIndex((m) => m.pos === Math.abs(signed));
  return i < 0 ? null : { rail, rank: i + 1, even: evenMarks(s, rail, i + 1) };
}

export function setEnd(s, line, signed) {
  if (s.mode !== 'ratio' || !lineMarks(s, line).includes(signed)) return s;
  if (s.ends[line] === signed) return s;
  return put(s, { ends: Object.freeze({ ...s.ends, [line]: signed }) });
}

/**
 * Où la règle (marque a de d₁, marque b de d₂) coupe (AB) : t (fraction de AB depuis A), MA/MB, et
 * la nature du point. Tout vient de thales.ratioPoint / thales.ratio.
 */
export function rulerPoint(s, a, b) {
  if (a === b) return Object.freeze({ a, b, parallel: true });
  const A = Math.abs(a); const B = Math.abs(b);
  const inside = Math.sign(a) !== Math.sign(b);
  const t = inside ? TH.ratioPoint(A, B, true) : TH.ratioPoint(A, B, false);
  // garde : la même chose que la droite passant par (0 ; a) et (1 ; b) — t = a / (a − b)
  if (!eq(t, div(frac(a), sub(frac(a), frac(b))))) throw new Error('segment-divider: rulerPoint incohérent');
  return Object.freeze({ a, b, parallel: false, inside, t, ratio: TH.ratio(A, B) });
}

/** Les ouvertures des graduations comptées jusqu'à la marque `signed` d'une droite (de A ou de B jusqu'à elle). */
function unitsTo(s, line, signed) {
  const info = markInfo(s, line, signed);
  return info ? s.rails[info.rail].slice(0, info.rank).map((m) => m.r) : [];
}

/** La signature des ouvertures sous une règle posée (a sur (d₁), b sur (d₂)). */
const unitsKey = (s, a, b) => `${unitsTo(s, 'a', a).join(',')}|${unitsTo(s, 'b', b).join(',')}`;

/** Valide la règle posée : un ESSAI de point. */
export function commitRuler(s) {
  if (s.mode !== 'ratio') return s;
  const { a, b } = s.ends;
  if (a == null || b == null) return put(s, { last: { kind: 'rulerHalf' } });
  const prev = s.joins.at(-1);
  const ia = markInfo(s, 'a', a); const ib = markInfo(s, 'b', b);
  // la même règle = les mêmes marques ET les mêmes ouvertures jusqu'à elles (revue 2026-11-10 : après « إنشاء جديد », des ouvertures 8 puis 12
  // retombent sur la position et le rang d'une graduation régulière de 10 — l'ancien verdict « juste » ne doit pas se remontrer)
  const units = unitsKey(s, a, b);
  const sameAs = (j) => j.a === a && j.b === b && j.rankA === (ia?.rank ?? null) && j.rankB === (ib?.rank ?? null) && (j.units ?? units) === units;
  if (prev && prev.a === a && prev.b === b && (!s.player || sameAs(prev))) return s.player ? put(s, { last: { kind: 'join', join: prev } }) : s;
  // lecteur : une règle DÉJÀ essayée (mêmes marques) se remontre, sans nouvel essai
  if (s.player) { const seen = s.joins.find(sameAs); if (seen) return put(s, { last: { kind: 'join', join: seen } }); }
  const pt = rulerPoint(s, a, b);
  const target = frac(s.p, s.q);
  // `sameUnitOnly` (conseil L3.1) : deux graduations d'ouvertures différentes ne se comparent pas — la règle est refusée AVANT tout rapport
  const mixed = new Set([...unitsTo(s, 'a', a), ...unitsTo(s, 'b', b)]).size > 1;
  let kind;
  if (pt.parallel) kind = 'parallel';
  else if (s.sameUnitOnly && mixed) kind = 'units';
  else if (eq(pt.ratio, target)) kind = pt.inside ? 'inside' : 'outside';
  else if (eq(pt.ratio, frac(s.q, s.p))) kind = 'inverted';
  else if (ia && ib && ia.rank * s.q === ib.rank * s.p) kind = 'units';
  else kind = 'other';
  const j = Object.freeze({ ...pt, kind, ok: kind === 'inside' || kind === 'outside', rankA: ia?.rank ?? null, rankB: ib?.rank ?? null, mixed, units });
  return put(s, { joins: Object.freeze([...s.joins, j]), last: { kind: 'join', join: j } });
}

export const found = (s) => ({
  inside: s.joins.some((j) => j.kind === 'inside'),
  outside: s.joins.some((j) => j.kind === 'outside'),
});

/* ── la découverte ────────────────────────────────────────────────────────── */

export function discoveryReady(s) {
  if (s.mode === 'ratio') { const f = found(s); return f.inside && f.outside; }
  const oks = s.trials.filter((t) => t.ok);
  if (oks.length === 0 || s.trials.length < 2) return false;
  if (s.trials.some((t) => !t.ok)) return true;
  const key = (t) => `${t.angle}|${t.openings.join(',')}`;
  return new Set(oks.map(key)).size >= 2;
}

/* ── les ÉTAPES du labo (questions pendant le labo, lot 4) ────────────────────────────────────────── */

/** Les étapes d'un mode : equal — les marques, la 1re construction juste, le contraste ; ratio — un 1er point juste, les deux points. */
export const stepsOf = (mode) => (mode === 'ratio' ? ['one', 'two'] : ['marks', 'built', 'contrast']);

/** L'étape est atteinte quand l'élève a FAIT ce qu'elle demande. */
export function stepReached(s, step) {
  if (s.mode === 'ratio') return step === 'one' ? s.joins.some((j) => j.ok) : discoveryReady(s);
  if (step === 'marks') return rayMarks(s).length >= s.parts || s.joined != null;
  if (step === 'built') return s.trials.some((t) => t.ok);
  return discoveryReady(s);
}

/** La même étape repart : tout est effacé, sauf ce que les étapes déjà finies ont établi (le 1er essai juste). */
export function retryStage(s, step) {
  const fresh = init({ mode: s.mode, parts: s.parts ?? undefined, p: s.p ?? undefined, q: s.q ?? undefined, marks: s.cap, length: s.length, sameUnitOnly: s.sameUnitOnly, player: s.player });
  if (s.mode === 'ratio') {
    if (step === 'one') return fresh;
    const first = s.joins.find((j) => j.ok);
    return Object.freeze({ ...fresh, joins: first ? [first] : [] });
  }
  if (step !== 'contrast') return fresh;
  const first = s.trials.find((t) => t.ok);
  return Object.freeze({ ...fresh, trials: first ? [first] : [] });
}

/** La preuve d'un essai, pour la leçon (`onTrial`). */
export function evidenceOf(s) {
  if (s.mode === 'ratio') {
    const j = s.joins.at(-1);
    // une règle refusée pour ses deux unités (`sameUnitOnly`) ne porte AUCUN rapport : il n'a pas de sens
    const told = j && !(s.sameUnitOnly && j.kind === 'units');
    return j && { mode: 'ratio', kind: j.kind, ok: j.ok, a: j.a, b: j.b, ratio: told && j.ratio ? fracText(j.ratio) : null, t: told && j.t ? fracText(j.t) : null };
  }
  const t = s.trials.at(-1);
  return t && { mode: 'equal', kind: t.kind, ok: t.ok, n: t.n, even: t.even, angle: t.angle, openings: [...t.openings], parts: t.parts.map(fracText) };
}

/* ── écritures ────────────────────────────────────────────────────────────── */

/** Une longueur en cm (fraction de AB × length) : « 10/3 ≈ 3,33 » en LaTeX, ou décimale exacte. */
export function lengthTex(s, f) {
  const v = LIN.mul(f, s.length);
  const dec = LIN.fracDecimal(v, 2);
  if (dec != null) return dec.replace(',', '{,}');
  return `${LIN.fracLatex(v)} \\approx ${TH.rounded(v, 2).replace(',', '{,}')}`;
}
/** Une ouverture (mm) en cm : 15 → « 1,5 ». */
export const cmText = (mm) => (mm / 10).toFixed(mm % 10 === 0 ? 0 : 1).replace('.', ',');

/* ── géométrie de dessin (flottants : jamais une décision) ────────────────── */

const rad = (deg) => (deg * Math.PI) / 180;
export const dirOf = (deg) => [Math.cos(rad(deg)), Math.sin(rad(deg))];

/** Le point d'un rail à la position pos (mm). */
export function railPoint(s, rail, pos) {
  const [dx, dy] = dirOf(s.angle);
  if (rail === 'ray') return [pos * dx, pos * dy];
  const o = rail[0] === 'a' ? [0, 0] : [AB, 0];
  const sg = rail[1] === '+' ? 1 : -1;
  return [o[0] + sg * pos * dx, o[1] + sg * pos * dy];
}

/** La longueur dessinée d'un rail : de quoi poser `cap` marques de l'ouverture maximale. */
export const railLength = (s) => s.cap * OPEN[s.mode].max;

/**
 * La boîte FIXE de la scène (indépendante de l'angle : la poignée ne doit pas changer d'échelle sous le
 * doigt) ; mode 'equal' + équerre : la règle et l'équerre s'y ajoutent ; mode 'ratio' : les points
 * trouvés hors de [AB] l'élargissent (t ∈ [−3 ; 4]).
 */
export function sceneBox(s) {
  const L = railLength(s);
  const { min, max } = ANGLE[s.mode];
  let x0; let x1; let y0; let y1;
  if (s.mode === 'equal') {
    x0 = -10; x1 = Math.max(AB, L * Math.cos(rad(min))) + 12;
    y0 = -20; y1 = L * Math.sin(rad(max)) + 10;
    const sq = s.joined != null ? setSquareFrame(s) : null;
    if (sq) { x0 = Math.min(x0, sq.x0 - 6); x1 = Math.max(x1, sq.x1 + 6); y0 = Math.min(y0, sq.y0 - 6); y1 = Math.max(y1, sq.y1 + 6); }
  } else {
    const c = Math.cos(rad(min));
    x0 = -L * c - 10; x1 = AB + L * c + 10;
    y0 = -L - 8; y1 = L + 8;
    for (const j of s.joins) {
      if (j.parallel) continue;
      const x = toNumber(j.t) * AB;
      if (x >= -3 * AB && x <= 4 * AB) { x0 = Math.min(x0, x - 14); x1 = Math.max(x1, x + 14); }
    }
  }
  return { x0, x1, y0, y1, w: x1 - x0, h: y1 - y0 };
}

const dot = (u, v) => u[0] * v[0] + u[1] * v[1];
const unit = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };

/**
 * L'équerre (mode 'equal', après `join`) : son bord de tracé suit u = direction (marque reliée → B) ;
 * la règle est posée perpendiculairement à u, du côté opposé à [AB] ; l'équerre glisse le long de la
 * règle. Pour la position `pos` du rayon : le sommet V sur la règle, le bord passe par R(pos) et coupe
 * (AB) en C(pos).
 */
export function setSquareAt(s, pos) {
  const pj = railPoint(s, 'ray', rayMarks(s)[s.joined].pos);
  const u = unit([AB - pj[0], -pj[1]]);
  const w = [-u[1], u[0]];
  const [dx, dy] = dirOf(s.angle);
  const du = dx * u[0] + dy * u[1];
  const c = Math.min(0, slideMax(s) * du) - 22;
  const R = railPoint(s, 'ray', pos);
  const V = [R[0] + (c - dot(R, u)) * u[0], R[1] + (c - dot(R, u)) * u[1]];
  // dessin seulement (flottant) : la position du point de (AB) sous le bord, pos / pos(reliée)
  const C = [(pos / rayMarks(s)[s.joined].pos) * AB, 0];
  const leg = 30; const base = 22;
  // l'équerre s'ouvre du côté des positions croissantes
  const side = dot([dx, dy], w) >= 0 ? 1 : -1;
  const tri = [V, [V[0] + leg * u[0], V[1] + leg * u[1]], [V[0] + side * base * w[0], V[1] + side * base * w[1]]];
  return { u, w, c, V, R, C, tri, side };
}

/** L'encombrement de la règle et de l'équerre sur toute la course. */
export function setSquareFrame(s) {
  if (s.joined == null) return null;
  const a = setSquareAt(s, 0); const b = setSquareAt(s, slideMax(s));
  const ext = 16;
  const ruler = [
    [a.V[0] - a.side * ext * a.w[0], a.V[1] - a.side * ext * a.w[1]],
    [b.V[0] + b.side * (ext + 22) * b.w[0], b.V[1] + b.side * (ext + 22) * b.w[1]],
  ];
  const pts = [...a.tri, ...b.tri, ...ruler, ...ruler.map((p) => [p[0] - 7 * a.u[0], p[1] - 7 * a.u[1]])];
  return { ruler, x0: Math.min(...pts.map((p) => p[0])), x1: Math.max(...pts.map((p) => p[0])), y0: Math.min(...pts.map((p) => p[1])), y1: Math.max(...pts.map((p) => p[1])) };
}

/** La projection (mm le long de d) d'un point de la scène sur un rail. */
export function projectOn(s, rail, pt) {
  const [dx, dy] = dirOf(s.angle);
  const o = rail === 'ray' || rail[0] === 'a' ? [0, 0] : [AB, 0];
  const sg = rail === 'ray' || rail[1] === '+' ? 1 : -1;
  return sg * ((pt[0] - o[0]) * dx + (pt[1] - o[1]) * dy);
}

/** L'angle (degrés) vu depuis A d'un point de la scène (la poignée est au bout du rayon, ou de (d₁) au-dessus de A). */
export function angleTo(s, pt) {
  let a = (Math.atan2(pt[1], pt[0]) * 180) / Math.PI;
  if (s.mode === 'ratio' && a < 0) a += 180;
  return a;
}

/* ══════════════ LECTEUR DE MISSION (rollout 2026-11-10, unité 9 leçon 3 `inshaat-talis` ; conseil du 2026-11-10, verdict L3.1–L3.7) ══════════════ */

/**
 * Ce que la manche reçoit d'un essai (`onVerdict`) :
 *   equal — groups = le rang de la marque reliée à B (le nombre de parts obtenu), exact = n parts égales ;
 *   ratio — groups = 1 (le point de [AB]) ou 2 (le point hors de [AB]) quand le rapport est le bon, 0 sinon ; exact = rapport demandé.
 */
export function verdictOf(lab) {
  if (lab.mode === 'ratio') {
    const j = lab.last?.kind === 'join' ? lab.last.join : lab.joins.at(-1);
    return j ? Object.freeze({ groups: j.ok ? (j.inside ? 1 : 2) : 0, exact: Boolean(j.ok) }) : null;
  }
  const t = lab.trials.at(-1);
  return t ? Object.freeze({ groups: t.n, exact: Boolean(t.ok) }) : null;
}

const trialKey = (t) => `${t.n}|${t.angle}|${t.openings.join(',')}`;
/** equal : la dernière construction refait-elle EXACTEMENT une construction d'avant (même marque, mêmes ouvertures, même angle) ? Pas un nouvel essai. */
export function repeatedTrial(lab) {
  if (lab.mode !== 'equal' || lab.trials.length < 2) return false;
  const last = lab.trials.at(-1);
  return lab.trials.slice(0, -1).some((t) => trialKey(t) === trialKey(last));
}

/** Une construction juste dont les réglages (angle, ouverture) diffèrent d'une construction juste d'avant : les points de partage n'ont pas bougé. */
export function sameCutsAgain(lab) {
  if (lab.mode !== 'equal') return false;
  const last = lab.trials.at(-1);
  return Boolean(last?.ok) && lab.trials.slice(0, -1).some((t) => t.ok && trialKey(t) !== trialKey(last));
}

/** La règle posée aux bouts courants : l'essai (déjà fait) de CETTE position, ou null — le verdict se relit sur l'état, pas sur `last`. */
export function joinAtEnds(lab) {
  if (lab.mode !== 'ratio') return null;
  const { a, b } = lab.ends;
  if (a == null || b == null) return null;
  const ra = markInfo(lab, 'a', a)?.rank ?? null; const rb = markInfo(lab, 'b', b)?.rank ?? null;
  const units = unitsKey(lab, a, b);
  return [...lab.joins].reverse().find((j) => j.a === a && j.b === b && j.rankA === ra && j.rankB === rb && j.units === units) ?? null;
}

/* ── les PRÉDICTIONS (≤ 2 par manche) : des clés ; les options et la vérité sont CALCULÉES ici ── */

export const PREDICT_KEYS = Object.freeze({ equal: Object.freeze(['joinWhich', 'parallels']), ratio: Object.freeze(['opposite', 'same']) });

/**
 * Les options d'une prédiction, dans l'ordre de l'écran (la bonne ne tient jamais la même place d'une manche à l'autre) :
 *   joinWhich « quelle marque relier à B ? » — n − 1, n, n + 1 (n multiple de 3) ou n, n + 1, n − 1 ;
 *   parallels « combien de parallèles ? »    — n, n + 1, n − 1 (la bonne, n − 1, en dernier) ;
 *   opposite  « marques de part et d'autre : où est le point ? » — avant A, entre A et B, après B ;
 *   same      « marques du même côté »       — après B, entre A et B, avant A (L3.7 : avant A si p < q, APRÈS B si p > q).
 */
export function predictOptions(lab, key) {
  const n = lab.parts;
  if (key === 'joinWhich') return n % 3 === 0 ? [n - 1, n, n + 1] : [n, n + 1, n - 1];
  if (key === 'parallels') return [n, n + 1, n - 1];
  if (key === 'opposite') return ['before', 'between', 'after'];
  if (key === 'same') return ['after', 'between', 'before'];
  return [];
}

export function predictTruth(lab, key) {
  if (key === 'joinWhich') return lab.parts;
  if (key === 'parallels') return lab.parts - 1;
  if (key === 'opposite') return 'between';
  if (key === 'same') {
    // par thales.ratioPoint : le point extérieur est à t·AB, t < 0 (avant A) ou t > 1 (après B)
    if (lab.p === lab.q) return null;
    return cmp(TH.ratioPoint(lab.p, lab.q, false), frac(0)) < 0 ? 'before' : 'after';
  }
  return null;
}

/** Les prédictions JUGÉES par le terrain : la construction juste (equal), le point intérieur / extérieur trouvé (ratio) ; toutes quand `all`. */
export function judgedPredictions(lab, keys, all = false) {
  const f = found(lab);
  return keys.filter((key) => {
    if (all) return true;
    if (key === 'joinWhich' || key === 'parallels') return lab.trials.some((t) => t.ok);
    if (key === 'opposite') return f.inside;
    if (key === 'same') return f.outside;
    return false;
  });
}

/**
 * Le GUIDE (LabCoach) du lecteur — le geste, jamais la réponse (ni le nombre de marques, ni la marque à relier, ni le côté) :
 *   equal : la marque pointillée → la ligne « صِل B بالعلامة » (dès une marque : « quand en as-tu assez ? ») → l'équerre → « إنشاء جديد »
 *           après une construction qui ne finit pas la manche ;
 *   ratio : une marque pointillée de (d₁) → (les deux droites graduées) les flèches de la règle pour le bout F, puis E → « un second point ? ».
 * `ctx` : { done } — la manche n'attend plus rien du labo. Une étape `idle` n'est montrée qu'après COACH_IDLE_MS sans geste (le labo attend).
 */
export const COACH_IDLE_MS = 3500;
export function coachOf(lab, ctx = {}) {
  if (ctx.done) return null;
  if (lab.mode === 'ratio') {
    const na = lineMarks(lab, 'a').length; const nb = lineMarks(lab, 'b').length;
    if (na === 0 && nb === 0) return { id: 'carryA', target: '[data-sd-ghost="a+"]', gesture: 'tap' };
    // tant qu'une seule droite est graduée : AUCUNE bulle (walk 2026-11-10 — au-dessus du compas elle couvrait le report suivant ; la consigne
    // et la ligne de lecture « علامات (d₂): 0 » le disent)
    if (na === 0 || nb === 0) return null;
    const f = found(lab);
    // les flèches de la règle sont AU-DESSUS de la scène dans le lecteur : la bulle s'ouvre dessous. `idle` : elle n'apparaît que si l'élève
    // S'ARRÊTE (COACH_IDLE_MS sans geste) — en pleine graduation elle couvrirait la marque pointillée suivante (walk 2026-11-10)
    if (f.inside !== f.outside) return { id: 'second', target: '[data-sd-ruler-row]', gesture: 'tap', prefer: 'below', idle: true };
    if (lab.joins.length > 0) return null;
    if (lab.ends.a == null) return { id: 'endA', target: '[data-sd-ruler-row]', gesture: 'tap', prefer: 'below', idle: true };
    if (lab.ends.b == null) return { id: 'endB', target: '[data-sd-ruler-row]', gesture: 'tap', prefer: 'below', idle: true };
    return null;
  }
  const n = rayMarks(lab).length;
  // « إنشاء جديد » est AU-DESSUS de la scène dans le lecteur : la bulle s'ouvre dessous, sur le haut (vide) de la scène — jamais sur les bandes
  // de la construction que l'élève vient de finir (elles sont la preuve)
  if (complete(lab)) return { id: 'fresh', target: '[data-sd-fresh]', gesture: 'tap', prefer: 'below' };
  if (lab.joined != null) return { id: 'square', target: '[data-sd-square]', gesture: 'drag', prefer: 'above' };
  if (n === 0) return { id: 'carry', target: '[data-sd-ghost="ray"]', gesture: 'tap' };
  // la ligne « صِل B بالعلامة » est AU-DESSUS de la scène dans le lecteur : la bulle s'ouvre dessous, loin de la marque pointillée à toucher
  return { id: 'join', target: '[data-sd-join-row]', gesture: 'tap', prefer: 'below' };
}

const ftext = (f) => fracText(f).replace('-', '');

/**
 * TOUT ce qu'un écran du lecteur peut montrer pour une manche (règle « valeurs interdites par RÔLE », conseil du 2026-11-10) — `{ role, v }` :
 *   length  AB (cm), et la longueur d'une part d'une construction JUSTE (AB/n — une construction fausse ne montre que ses bandes, L3.5) ;
 *   count   le nombre de parts demandé, les rangs des marques du rayon, les pastilles n − 1 / n / n + 1, les options des prédictions ;
 *   opening les ouvertures du compas (cm) ; angle les angles (degrés) ;
 *   rank    (ratio) les rangs des graduations de (d₁) et (d₂), ≤ `marks` ;
 *   ratio   MA/MB : le rapport demandé et celui de CHAQUE paire de rangs atteignable (même unité : `sameUnitOnly`) ;
 *   t       AM/AB et AN/AB de chaque paire ; pair les paires de rangs ; decoy-ratio / decoy-t les leurres de la question « AM/AB » de la
 *           suite `full` (p/q ; q/(p+q), p/|p−q|).
 */
export function shownValues(props = {}) {
  const out = [];
  const push = (role, v) => out.push(Object.freeze({ role, v: String(v) }));
  const one = (p) => {
    const mode = p.mode === 'ratio' ? 'ratio' : 'equal';
    const length = p.length ?? 9;
    push('length', length);
    for (let o = OPEN[mode].min; o <= OPEN[mode].max; o += 1) push('opening', cmText(o));
    for (let a = ANGLE[mode].min; a <= ANGLE[mode].max; a += 1) push('angle', a);
    if (mode === 'equal') {
      const n = p.parts ?? 3;
      const part = LIN.mul(frac(1, n), length);
      push('length', fracText(part)); push('length', TH.rounded(part, 2));
      [n - 1, n, n + 1].forEach((x) => push('count', x));
      for (let i = 1; i <= n + 1; i += 1) push('count', i);
      return;
    }
    const cap = p.marks ?? 5;
    push('ratio', fracText(frac(p.p, p.q)));
    push('t', ftext(TH.ratioPoint(p.p, p.q, true)));
    if (p.p !== p.q) push('t', ftext(TH.ratioPoint(p.p, p.q, false)));
    // les leurres de la question « AM/AB » (suite `full` seulement) : le rapport lui-même pris pour une part du tout, MB/AB, AN/AB
    if (p.chains === 'full') {
      push('decoy-ratio', fracText(frac(p.p, p.q))); push('decoy-t', fracText(frac(p.q, p.p + p.q)));
      if (p.p !== p.q) push('decoy-t', fracText(frac(p.p, Math.abs(p.p - p.q))));
    }
    for (let ra = 1; ra <= cap; ra += 1) {
      push('rank', ra);
      for (let rb = 1; rb <= cap; rb += 1) {
        push('pair', `${ra}:${rb}`);
        push('ratio', fracText(TH.ratio(ra, rb)));
        push('t', ftext(TH.ratioPoint(ra, rb, true)));
        if (ra !== rb) push('t', ftext(TH.ratioPoint(ra, rb, false)));
      }
    }
  };
  one(props);
  (props.choices ?? []).forEach((c) => one({ ...c, length: c.length ?? props.length }));
  return out;
}
