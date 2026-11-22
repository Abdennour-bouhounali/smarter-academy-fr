/**
 * bucket-fill — LA LOGIQUE PURE du seau de plage (unité 14 « الهندسة في الفضاء », « أدمج تعلّماتي », le تحدّ p. 163 : un دلو
 * en مخروط مبتور, Ø 40 cm en haut, Ø 30 cm au fond, l'eau à 7 cm du bord et 28 cm au-dessus du fond — H = 35 cm).
 * Aucune arithmétique ici : chaque rayon, chaque rapport, chaque volume vient de packages/core/arithmetic/space.js
 * (`bucketWater`, `cone`, `cylinder`, `scaled`, `piMultiple`, `cm3ToLitres`) et de linear.js (fractions) ; ce module dit
 * seulement ce que la main a le droit de faire, ce que le lab refuse et pourquoi.
 *
 * LE MONDE : un seau de rayon r au fond, R au bord, de hauteur H (cm) ; l'eau a la profondeur d (mesurée depuis le fond).
 * L'élève, dans UNE scène 3D, en trois phases qu'il ouvre lui-même (avec un chemin de retour) :
 *   1. `level` — il fait MONTER / DESCENDRE la surface de l'eau (au centimètre) jusqu'au niveau de la وضعية ; « ثبّت » JUGE :
 *      l'eau doit être à H − depth du bord (7 cm) — un niveau à 7 cm du FOND est refusé en le nommant ;
 *   2. `apex` — « أكمل المخروط » : il descend le sommet S sur l'axe, sous le fond ; les deux génératrices issues de S et
 *      passant par le bord du fond (A) montent jusqu'au plan du bord : elles ne passent par la حافة (B, à R de l'axe) QUE
 *      pour SO = r·H / (R − r) (Thalès dans la coupe axiale). Ailleurs elles arrivent trop loin (« wide », S trop haut) ou
 *      trop près (« narrow », S trop bas) — le lab écrit où ;
 *   3. `volume` — le cône est complété : le grand cône (S → surface de l'eau) et le petit (S → fond), réduction du grand de
 *      rapport k = SO/SW. L'élève CHOISIT comment calculer le volume d'eau (des cartes) AVANT de le voir : V₁ − V₂ = V₁(1 − k³)
 *      est accepté ; V₁(1 − k) (k au lieu de k³), le cylindre au rayon moyen π·d·((ρ + r)/2)² et le cylindre au rayon de la
 *      surface π·ρ²·d sont refusés avec la valeur qu'ils donnent (ils ne remplissent pas le seau jusqu'au même trait).
 * La découverte s'ouvre quand le sommet est trouvé, la bonne carte choisie, et qu'un contraste a été vu (un refus au moins).
 */
import * as space from '@smarter-academy/core/arithmetic/space.js';
import * as LN from '@smarter-academy/core/arithmetic/linear.js';

const PHASES = Object.freeze(['level', 'apex', 'volume']);
/** L'ordre d'affichage des cartes (jamais la bonne en premier). */
export const CARD_IDS = Object.freeze(['avg', 'k', 'k3', 'cyl']);

const num = (p) => LN.toNumber(p);
const clampInt = (x, lo, hi) => Math.min(hi, Math.max(lo, Math.round(x)));

/** Ce que la mathématique dit du seau (space.bucketWater) : ρ, SO, k, V₁, V₂, V, et la capacité en litres. */
export function facts({ r, R, H, depth }) {
  const w = space.bucketWater({ R, r, H, depth });
  return Object.freeze({
    rho: w.surfaceRadius, apex: w.apexBelowBottom, k: w.k, big: w.bigCone, small: w.smallCone, volume: w.volume,
    litres: num(space.cm3ToLitres(1)) * w.volume.number,
    bucket: space.frustumVolume({ R, r, h: H }),
  });
}

/** Le rayon de la section de l'eau à la profondeur d (Thalès : le bord du seau est une droite) — exact. */
export const surfaceRadiusAt = ({ r, R, H }, d) => LN.add(LN.frac(r), LN.div(LN.mul(LN.sub(LN.frac(R), LN.frac(r)), LN.frac(d)), LN.frac(H)));

/** Le niveau de départ de l'eau : jamais celui de la وضعية, jamais vide. */
const levelStart = ({ H, depth }) => {
  const s = Math.max(1, Math.round(H * 0.4));
  return s === depth ? s + 1 : s;
};
/** La plage du sommet S sous le fond (cm, au centimètre) ; contient toujours le sommet exact, jamais au milieu. */
export function apexRange(nums) {
  const a = num(facts(nums).apex);
  return Object.freeze({ lo: Math.max(1, Math.round(a / 5)), hi: Math.round(a * 1.45), start: Math.max(1, Math.round(a * 0.45)) });
}

export function init(nums) {
  const { r, R, H, depth } = nums;
  return Object.freeze({
    nums: Object.freeze({ r, R, H, depth }),
    phase: 'level',
    level: levelStart(nums), levelOk: false,
    apex: apexRange(nums).start, apexOk: false,
    card: null, cardOk: false,
    refusals: 0, trials: Object.freeze([]), last: null,
  });
}

const push = (s, trial, patch = {}) => Object.freeze({
  ...s, ...patch, trials: Object.freeze([...s.trials, Object.freeze(trial)]), last: Object.freeze(trial),
  refusals: s.refusals + (trial.ok ? 0 : 1),
});

/* ── phase 1 : le niveau de l'eau ──────────────────────────────────────── */

/** Monte / descend la surface (au centimètre, entre le fond et le bord). Un niveau fixé se défait si on le bouge. */
export function setLevel(s, d) {
  if (s.phase !== 'level') return s;
  const level = clampInt(d, 0, s.nums.H);
  if (level === s.level) return s;
  return Object.freeze({ ...s, level, levelOk: false, last: s.last?.kind === 'levelOk' ? null : s.last });
}

/** « ثبّت » : l'eau est-elle à H − depth du bord ? */
export function fixLevel(s) {
  if (s.phase !== 'level') return s;
  const { H, depth } = s.nums;
  if (s.level === depth) return push(s, { kind: 'levelOk', ok: true, d: s.level, gap: H - depth }, { levelOk: true });
  return push(s, {
    kind: 'levelKo', ok: false, d: s.level, gap: H - s.level, want: H - depth,
    // le piège de lecture : la cote du bord prise depuis le FOND (7 cm au-dessus du fond au lieu de 7 cm sous le bord)
    fromBottom: s.level === H - depth && H - depth !== depth,
  });
}

/* ── navigation entre les phases (l'élève l'ouvre, et peut revenir) ───── */

export const canOpenApex = (s) => s.levelOk;
export const canOpenVolume = (s) => s.apexOk && s.levelOk;
export function openPhase(s, phase) {
  if (!PHASES.includes(phase) || phase === s.phase) return s;
  if (phase === 'apex' && !canOpenApex(s)) return s;
  if (phase === 'volume' && !canOpenVolume(s)) return s;
  return Object.freeze({ ...s, phase, last: null });
}

/* ── phase 2 : le sommet S du cône complété ────────────────────────────── */

/**
 * Où la génératrice (SA) — de S, à `a` cm sous le fond, par le bord du fond A (à r de l'axe) — coupe le plan du bord :
 * à r·(a + H)/a de l'axe (Thalès). `ok` ⇔ c'est exactement R ; `wide` : S trop haut (la droite s'ouvre trop) ;
 * `narrow` : S trop bas.
 */
export function apexVerdict({ r, R, H }, a) {
  const A = LN.frac(a);
  const reach = LN.div(LN.mul(LN.frac(r), LN.add(A, LN.frac(H))), A);
  const c = LN.cmp(reach, LN.frac(R));
  return Object.freeze({ kind: c === 0 ? 'ok' : c > 0 ? 'wide' : 'narrow', reach, reachNumber: num(reach) });
}

/** Déplace S sur l'axe (au centimètre, dans la plage). */
export function setApex(s, a) {
  if (s.phase !== 'apex') return s;
  const { lo, hi } = apexRange(s.nums);
  const apex = clampInt(a, lo, hi);
  if (apex === s.apex) return s;
  return Object.freeze({ ...s, apex, apexOk: s.apexOk && apex === num(facts(s.nums).apex), last: s.last?.kind === 'apexOk' ? null : s.last });
}

/** Un essai VALIDÉ (lâcher, Entrée, « تحقّق ») : les deux génératrices passent-elles par le bord ? */
export function commitApex(s) {
  if (s.phase !== 'apex') return s;
  const v = apexVerdict(s.nums, s.apex);
  if (v.kind === 'ok') return push(s, { kind: 'apexOk', ok: true, a: s.apex }, { apexOk: true });
  return push(s, { kind: 'apexKo', ok: false, a: s.apex, dir: v.kind, reach: v.reachNumber, R: s.nums.R });
}

/* ── phase 3 : le volume d'eau ─────────────────────────────────────────── */

/**
 * Les cartes de calcul : chacune est une VRAIE formule, calculée par space.js ; une seule donne le volume d'eau.
 *   k3   V₁ − V₂ = V₁(1 − k³)            (le petit cône est la réduction du grand, rapport k)
 *   k    V₁(1 − k)                      (k au lieu de k³ — MISC-MABTUR-FARQ)
 *   avg  π·d·((ρ + r)/2)²               (un cylindre au rayon moyen — MISC-MABTUR-TALIS)
 *   cyl  π·ρ²·d                          (un cylindre au rayon de la surface)
 */
export function cards(nums) {
  const f = facts(nums);
  const d = LN.frac(nums.depth);
  const mean = LN.div(LN.add(f.rho, LN.frac(nums.r)), LN.frac(2));
  const values = {
    k3: f.volume,
    k: space.piMultiple(LN.sub(f.big.k, space.scaled(f.big, f.k, 1).k)),
    avg: space.cylinder(mean, d).volume,
    cyl: space.cylinder(f.rho, d).volume,
  };
  return CARD_IDS.map((id) => Object.freeze({ id, value: values[id], ok: LN.eq(values[id].k, f.volume.k) }));
}

/** Choisit une carte : la bonne remplit le seau jusqu'au trait ; une fausse est refusée avec sa valeur. */
export function pickCard(s, id) {
  if (s.phase !== 'volume' || s.cardOk) return s;
  const card = cards(s.nums).find((c) => c.id === id);
  if (!card) return s;
  const right = facts(s.nums).volume.number;
  if (card.ok) return push(s, { kind: 'cardOk', ok: true, id, value: card.value.number }, { card: id, cardOk: true });
  return push(s, { kind: 'cardKo', ok: false, id, value: card.value.number, right }, { card: id });
}

/** La découverte : le sommet trouvé, la bonne carte, et un contraste (au moins un refus). */
export const discoveryReady = (s) => s.levelOk && s.apexOk && s.cardOk && s.refusals > 0;

/* ── les étapes du labo et leurs questions (lot 4, `primitives/LabCheckpoint`) ───────────────────────────── */

/** Trois étapes : le niveau de l'eau, le sommet du cône complété, le volume (contraste fait, puis la règle). */
export function stepsOf(s) {
  return [
    { id: 'level', reached: s.levelOk },
    { id: 'apex', reached: s.apexOk },
    { id: 'volume', reached: discoveryReady(s) },
  ].map((x) => Object.freeze(x));
}
/** « أعِد التجربة » : l'étape repart (niveau de départ, sommet de départ, carte non choisie ; les refus gardés comptent comme contraste). */
export function retryStep(s, id) {
  if (id === 'level') return Object.freeze({ ...s, phase: 'level', level: levelStart(s.nums), levelOk: false, last: null });
  if (id === 'apex') return Object.freeze({ ...s, phase: 'apex', apex: apexRange(s.nums).start, apexOk: false, last: null });
  if (id === 'volume') return Object.freeze({ ...s, phase: 'volume', card: null, cardOk: false, last: null });
  return s;
}

/** Le dernier geste jugé, pour la leçon (`onTrial`) : sans fonction ni fraction, des nombres seulement. */
export function evidenceOf(s) {
  const t = s.last ?? s.trials[s.trials.length - 1];
  return t ? { ...t } : null;
}

/** Le rayon (exact → nombre) de la surface de l'eau au niveau courant — pour le DESSIN seulement. */
export const drawRadius = (nums, d) => num(surfaceRadiusAt(nums, d));

/**
 * La figure de REPLI (SpaceFigure) du lab quand WebGL manque : le seau, l'eau au niveau courant — sans aucune cote calculée.
 */
export function fallbackFigure(nums, d, ariaLabel) {
  const { r, R, H } = nums;
  const rho = drawRadius(nums, d);
  return {
    kind: 'space',
    view: { azimuth: -90, elevation: 16 },
    points: { O: [0, 0, 0], O1: [0, 0, H], W: [0, 0, Math.max(d, 0.001)], A: [r, 0, 0], B: [R, 0, H] },
    solids: [{ type: 'frustum', base: 'O', top: 'O1', radius: r, topRadius: R, tone: 'amber' }],
    circles: d > 0 ? [{ center: 'W', radius: rho, tone: 'sky', bold: true }] : [],
    hidden: ['O', 'O1', 'W', 'A', 'B'],
    ariaLabel,
    maxWidth: 260,
  };
}
