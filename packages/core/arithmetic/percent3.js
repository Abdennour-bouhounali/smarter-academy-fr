/**
 * Le POURCENTAGE comme situation de proportionnalité — le calcul exact de la leçon « النسبة المئوية » de 3AM (unité 6 « التناسبية »), construit SUR
 * `linear.js` (fractions exactes, rien n'arrondit). Une quantité x est coupée en 100 PAQUETS égaux : un paquet vaut x/100 (le « 1 % »), t paquets valent
 * x × t/100 ; une augmentation de t % AJOUTE t paquets (× (1 + t/100)), une diminution en RETIRE t (× (1 − t/100)).
 *
 *   partOf(240, 15)                    → 36            (15 % de 240)
 *   rateOf(60, 150)                    → 40            (60 sur 150, en %)
 *   wholeOf(84, 60)                    → 140           (84 est 60 % de …)
 *   changed(200, 'up', 15)             → 230
 *   factor('down', 20)                 → 4/5
 *   chain(200, [['up', 20], ['down', 20]]) → { values: [200, 240, 192], total: 24/25 → rate −4 % }
 *
 * Importé PAR CHEMIN (`@smarter-academy/core/arithmetic/percent3.js`), jamais depuis le barrel du cœur.
 */
import * as Lin from './linear.js';

const DIRS = Object.freeze(['up', 'down']);

const num = (v) => (typeof v === 'object' ? v : Lin.parseNumber(v));
const hundred = Lin.frac(100);

/** La valeur d'un paquet : x ÷ 100. */
export const packet = (x) => Lin.div(num(x), hundred);
/** t % de x : x × t/100 (t en paquets, nombre exact). */
export const partOf = (x, t) => Lin.mul(packet(x), num(t));
/** Le taux (en %) de `part` dans `whole` : part/whole = t/100. whole ≠ 0. */
export const rateOf = (part, whole) => Lin.mul(Lin.div(num(part), num(whole)), hundred);
/** Le tout dont `part` est t % : part ÷ (t/100). t ≠ 0. */
export const wholeOf = (part, t) => Lin.div(Lin.mul(num(part), hundred), num(t));
/** Le multiplicateur d'une variation de t % : 1 + t/100 (up) ou 1 − t/100 (down). */
export const factor = (dir, t) => {
  if (!DIRS.includes(dir)) throw new Error(`sens inconnu : ${dir}`);
  const r = Lin.div(num(t), hundred);
  return dir === 'up' ? Lin.add(1, r) : Lin.sub(1, r);
};
/** La quantité après une variation de t %. */
export const changed = (x, dir, t) => Lin.mul(num(x), factor(dir, t));
/** La quantité de départ avant une variation de t % qui a donné `after` (t % de la quantité de DÉPART). */
export const beforeChange = (after, dir, t) => Lin.div(num(after), factor(dir, t));
/** Le taux de variation (en %, signé) de `before` à `after`. before ≠ 0. */
export const changeRate = (before, after) => Lin.mul(Lin.div(Lin.sub(num(after), num(before)), num(before)), hundred);

/** Des variations successives : les valeurs, le multiplicateur total et le taux total (signé). */
export function chain(x, steps) {
  const start = num(x);
  const values = [start];
  let k = Lin.frac(1);
  for (const [dir, t] of steps) {
    k = Lin.mul(k, factor(dir, t));
    values.push(Lin.mul(start, k));
  }
  return { values, factor: k, rate: Lin.mul(Lin.sub(k, 1), hundred) };
}

/** Un stock saisi par l'élève (« جرّب أعدادك ») : positif, au plus 4 chiffres avant la virgule et 2 après ; sinon null. */
export function parseStock(raw) {
  try {
    const s = String(raw).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace('٫', ',').trim();
    if (!/^\d{1,4}([.,]\d{1,2})?$/.test(s)) return null;
    const v = Lin.parseNumber(s);
    return Lin.cmp(v, 0) > 0 ? v : null;
  } catch { return null; }
}

/** Écriture à virgule d'un nombre exact (décimal fini) ; sinon la fraction. */
export function text(v) {
  const p = num(v);
  return Lin.fracDecimal(p, 4) ?? Lin.fracText(p);
}
