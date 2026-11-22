/**
 * La statistique EXACTE — le calcul commun de l'unité 8 « الإحصاء » (manuel pp. 91–101,
 * docs/sources/4am/unit8/extraction.json) : tableaux d'effectifs, التكرار / التواتر المجمع
 * الصاعد والنازل, المدى, المتوسط (pondéré, par مراكز الفئات), الوسيط (par rangs) et الفئة
 * الوسيطية, المنوال, la moyenne de groupes réunis (تحدّ) et les valeurs cachées (أدمج تعلّماتي).
 *
 * Un nombre est une fraction de linear.js ({ n, d }) : 482/30 reste 482/30, 8,5 reste 17/2 ;
 * rien n'arrondit sauf l'écriture (`statText`). Les vues ne recalculent jamais : elles appellent ici.
 *
 *   const T = tableOf([160, 165, 154, …])        → { values: [154, 157, 159, 160, 165], freqs: [3, 4, 5, 5, 3] }
 *   cumulativeUp(T.freqs)                        → [3, 7, 12, 17, 20]
 *   countAtLeast(T, 159)                         → 13          (« 159cm على الأقل »)
 *   mean([18, 15, 16, 20], [2, 18, 6, 4])        → 241/15      (482/30)
 *   median([3, 5, 4, …])                         → 5           medianRanks(57) → { odd: true, ranks: [29] }
 *   medianClass(classes, [4, 10, 12, 9, 6])      → 2           (42 ≤ P < 46)
 *   combineGroups([{ n: 15, mean: 10 }, { n: 18, mean: 13 }]) → 128/11 (= 384/33)
 */
import {
  frac, parseNumber, add, sub, mul, div, cmp, eq, fracLatex, fracDecimal, fracText,
} from './linear.js';

const F = (v) => (typeof v === 'object' && v !== null ? v : Number.isInteger(v) ? frac(v) : parseNumber(v));
const sumF = (list) => list.reduce((s, v) => add(s, v), frac(0));
const isCount = (f) => Number.isInteger(f) && f >= 0;

/** Les valeurs d'une série, lues exactes (« 8,5 », 154, { n, d }). */
const series = (values) => values.map(F);

/** Le tableau des effectifs d'une série brute : valeurs DISTINCTES croissantes et leurs تكرارات. */
export function tableOf(values) {
  const out = [];
  for (const v of series(values)) {
    const hit = out.find((r) => eq(r.v, v));
    if (hit) hit.f += 1; else out.push({ v, f: 1 });
  }
  out.sort((p, q) => cmp(p.v, q.v));
  return Object.freeze({ values: out.map((r) => r.v), freqs: out.map((r) => r.f) });
}

/** Un tableau (valeurs, effectifs) tel que le manuel l'écrit — vérifié, sans tri imposé. */
export function table(values, freqs) {
  if (values.length !== freqs.length) throw new Error('table: valeurs et effectifs de longueurs différentes');
  if (!freqs.every(isCount)) throw new Error('table: un effectif est un entier ≥ 0');
  return Object.freeze({ values: series(values), freqs: [...freqs] });
}

/** التكرار الكلّي. */
export const total = (freqs) => freqs.reduce((s, f) => s + f, 0);

/** التكرار المجمع الصاعد : effectif de la valeur + effectifs des valeurs qui la PRÉCÈDENT. */
export function cumulativeUp(freqs) {
  let s = 0;
  return freqs.map((f) => (s += f));
}
/** التكرار المجمع النازل : effectif de la valeur + effectifs des valeurs qui la SUIVENT. */
export const cumulativeDown = (freqs) => cumulativeUp([...freqs].reverse()).reverse();

/** التكرار النسبي = التواتر : f / N, exact (des fractions ou des pourcentages donnés). */
export function relative(freqs) {
  const N = sumF(freqs.map(F));
  return freqs.map((f) => div(F(f), N));
}
/** التواتر المجمع الصاعد / النازل (somme exacte de fractions — 30/30 = 1). */
export const relativeUp = (freqs) => { let s = frac(0); return relative(freqs).map((r) => (s = add(s, r))); };
export const relativeDown = (freqs) => relativeUp([...freqs].reverse()).reverse();
/** Cumuls de nombres déjà relatifs (pourcentages du manuel : 97,97 % …), sans renormaliser. */
export const runningSum = (list) => { let s = frac(0); return list.map((v) => (s = add(s, F(v)))); };
export const runningSumDown = (list) => runningSum([...list].reverse()).reverse();

/** Combien de valeurs (pondérées) vérifient la relation : « على الأكثر » = '<=', « على الأقل » = '>=', « تفوق » = '>'. */
export function countWhere(T, rel, t) {
  const x = F(t);
  const ok = { '<=': (c) => c <= 0, '<': (c) => c < 0, '>=': (c) => c >= 0, '>': (c) => c > 0, '=': (c) => c === 0 }[rel];
  if (!ok) throw new Error(`countWhere: relation « ${rel} »`);
  return T.values.reduce((s, v, i) => (ok(cmp(v, x)) ? s + T.freqs[i] : s), 0);
}
export const countAtMost = (T, t) => countWhere(T, '<=', t);
export const countAtLeast = (T, t) => countWhere(T, '>=', t);

/** La série développée et triée (chaque valeur répétée selon son effectif). */
export function expand(values, freqs) {
  const vs = series(values);
  const fs = freqs ?? vs.map(() => 1);
  return vs.flatMap((v, i) => Array(fs[i]).fill(v)).sort(cmp);
}

/** المدى : plus grande valeur − plus petite (les valeurs d'effectif nul ne comptent pas). */
export function range(values, freqs) {
  const s = expand(values, freqs);
  if (!s.length) throw new Error('range: série vide');
  return sub(s[s.length - 1], s[0]);
}
export const min = (values, freqs) => expand(values, freqs)[0];
export const max = (values, freqs) => { const s = expand(values, freqs); return s[s.length - 1]; };

/** La somme pondérée Σ fᵢ·xᵢ. */
export const weightedSum = (values, freqs) => sumF(series(values).map((v, i) => mul(v, freqs ? freqs[i] : 1)));

/** المتوسط (المتوسط الحسابي المتوازن) m = Σ fᵢ·xᵢ / N. */
export function mean(values, freqs) {
  const N = freqs ? total(freqs) : values.length;
  if (!N) throw new Error('mean: série vide');
  return div(weightedSum(values, freqs), N);
}

/** Les rangs du الوسيط d'une série de N valeurs rangées : (N + 1)/2 si N impair, N/2 et N/2 + 1 sinon. */
export function medianRanks(N) {
  if (!Number.isInteger(N) || N < 1) throw new Error('medianRanks: N entier ≥ 1');
  return N % 2 ? { odd: true, ranks: [(N + 1) / 2] } : { odd: false, ranks: [N / 2, N / 2 + 1] };
}
/** La valeur de rang k (1 = la plus petite) d'un tableau. */
export function valueAtRank(values, freqs, k) {
  const s = expand(values, freqs);
  if (k < 1 || k > s.length) throw new Error(`valueAtRank: rang ${k} hors de 1…${s.length}`);
  return s[k - 1];
}
/** الوسيط Med : la valeur centrale (N impair) ou la moyenne des deux valeurs centrales (N pair). */
export function median(values, freqs) {
  const s = expand(values, freqs);
  const { ranks } = medianRanks(s.length);
  return ranks.length === 1 ? s[ranks[0] - 1] : div(add(s[ranks[0] - 1], s[ranks[1] - 1]), 2);
}

/** المنوال : la ou les valeurs de plus grand effectif. */
export function mode(values, freqs) {
  const T = freqs ? table(values, freqs) : tableOf(values);
  const top = Math.max(...T.freqs);
  return T.values.filter((_, i) => T.freqs[i] === top);
}

// ── Séries groupées en فئات ─────────────────────────────────────────────────

/** Une فئة [lo ; hi[ (ou [lo ; hi] pour la dernière, `closed`). */
export const klass = (lo, hi, closed = false) => Object.freeze({ lo: F(lo), hi: F(hi), closed });
/** Des classes CONTIGUËS de même amplitude : classesFrom(34, 4, 5) → 34–38 … 50–54 (la dernière fermée). */
export function classesFrom(start, width, count) {
  return Array.from({ length: count }, (_, i) => klass(add(F(start), mul(F(width), i)), add(F(start), mul(F(width), i + 1)), i === count - 1));
}
/** مركز الفئة (lo + hi) / 2. */
export const center = (c) => div(add(c.lo, c.hi), 2);
/** L'amplitude hi − lo. */
export const width = (c) => sub(c.hi, c.lo);
/** La classe qui contient x (la dernière est fermée à droite), ou −1. */
export function classIndexOf(classes, x) {
  const v = F(x);
  return classes.findIndex((c) => cmp(v, c.lo) >= 0 && (cmp(v, c.hi) < 0 || (c.closed && eq(v, c.hi))));
}
/** Le تكرار de chaque classe pour une série brute. */
export const classFreqs = (classes, values) => classes.map((_, i) => series(values).filter((v) => classIndexOf(classes, v) === i).length);
/** Le متوسط d'une série groupée, estimé par les مراكز الفئات (comme le manuel, نشاط 4). */
export const groupedMean = (classes, freqs) => mean(classes.map(center), freqs);
/** الفئة الوسيطية : l'indice de la classe qui contient la (ou les) valeur(s) de rang médian. */
export function medianClass(freqs) {
  const N = total(freqs);
  const { ranks } = medianRanks(N);
  const up = cumulativeUp(freqs);
  const at = (k) => up.findIndex((c) => c >= k);
  const idx = ranks.map(at);
  return idx[0] === idx[idx.length - 1] ? idx[0] : { between: idx };
}

// ── Raisonner sur des moyennes ─────────────────────────────────────────────

/** La moyenne de groupes RÉUNIS (تحدّ : 15 garçons de moyenne 10 et 18 filles de moyenne 13) — pondérée, jamais la moyenne des moyennes. */
export function combineGroups(groups) {
  const N = groups.reduce((s, g) => s + g.n, 0);
  return div(sumF(groups.map((g) => mul(F(g.mean), g.n))), N);
}
/** La valeur cachée d'indice `index` qui donne la moyenne `target` (أدمج تعلّماتي : 7 médailles). */
export function solveValueForMean(values, freqs, target, index) {
  const N = total(freqs);
  const others = sumF(series(values.map((v, i) => (i === index ? 0 : v))).map((v, i) => mul(v, freqs[i])));
  return div(sub(mul(F(target), N), others), freqs[index]);
}
/** Le nombre N de valeurs quand on retire une valeur v et que la moyenne passe de m à m′ : m·N − v = m′(N − 1). */
export const countFromRemoval = (m, v, mAfter) => div(sub(F(v), F(mAfter)), sub(F(m), F(mAfter)));
/** Les angles (en degrés) d'un مخطط دائري. */
export const pieAngles = (freqs) => relative(freqs).map((r) => mul(r, 360));
/** Un pourcentage exact d'un effectif relatif (0,15 → 15). */
export const percent = (r) => mul(F(r), 100);

// ── Écriture ───────────────────────────────────────────────────────────────

/** « 16,07 » n'est PAS 482/30 : l'écriture du manuel — décimal fini court sinon la fraction (LaTeX). */
export const statLatex = (p, maxDigits = 3) => { const d = fracDecimal(F(p), maxDigits); return d == null ? fracLatex(F(p)) : d.replace(',', '{,}'); };
/** Écriture texte (ARIA, tests) : « 16,5 » ou « 482/30 » réduit. */
export const statText = (p, maxDigits = 3) => fracDecimal(F(p), maxDigits) ?? fracText(F(p));
/** Valeur approchée à `digits` décimales, virgule (« ≈ 16,07 »). */
export function approx(p, digits = 2) {
  const q = F(p);
  const k = 10 ** digits;
  const r = Math.round((q.n * k) / q.d) / k;
  return r.toFixed(digits).replace(/\.?0+$/, '').replace('.', ',');
}
