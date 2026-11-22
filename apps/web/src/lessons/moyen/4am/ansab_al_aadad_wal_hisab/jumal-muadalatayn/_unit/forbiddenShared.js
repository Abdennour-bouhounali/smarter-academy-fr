/**
 * Unité 5 « جمل معادلتين » — outils communs aux signatures et à la règle des collisions (commit 0 du 2026-11-11 ; conseil du 2026-11-11,
 * verdict X3–X4). Chaque leçon écrit SA signature dans `_unit/signatures/<leçon>.js` (contrat : `signatures/README.md`). Ce fichier ne contient
 * que des aides pures et la signature de la SYNTHÈSE (`SYNTH`), lue par la règle d'avance (« forward ban ») de `unitCollisions.test.js`.
 * L'algèbre est importée PAR CHEMIN (jamais par le barrel du core).
 */
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import { fracText } from '@smarter-academy/core/arithmetic/linear.js';

/** Le moins typographique U+2212 et le tiret sont lus pareil. */
const normMinus = (s) => String(s).replace(/−/g, '-');

/** Vrai si une chaîne montre l'une des signatures (le moins est normalisé). */
export const showsAny = (sigs, s) => sigs.some((re) => re.test(String(s)) || re.test(normMinus(s)));

/** Les lignes d'un texte sans ses commentaires ni ses métadonnées de source. */
export const visibleLines = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')
  .replace(/\s\/\/ .*$/gm, '')
  .replace(/src\([^)]*\)/g, '')
  .split('\n');

/**
 * Une jumla sous l'une de ses trois formes → `[e1, e2]` de linearSystem :
 *   - la chaîne « x + y = 7 | 3x + y = 17 » (séparateur `|` ou `∣`) ;
 *   - deux chaînes `['x + y = 7', '3x + y = 17']` ;
 *   - une jumla déjà construite par `LS.system(…)` (deux objets { a, b, c }).
 */
function toSystem(s) {
  if (typeof s === 'string') {
    const parts = s.split(/[|∣]/);
    if (parts.length !== 2) throw new Error(`toSystem: deux équations séparées par « | » attendues dans « ${s} »`);
    return LS.system(parts[0], parts[1]);
  }
  if (Array.isArray(s) && s.length === 2 && s.every((e) => typeof e === 'string')) return LS.system(s[0], s[1]);
  if (Array.isArray(s) && s.length === 2 && s.every((e) => e && typeof e === 'object' && 'a' in e && 'b' in e && 'c' in e)) return s;
  throw new Error(`toSystem: forme de jumla inconnue ${JSON.stringify(s)}`);
}

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const lcm = (a, b) => (a / gcd(a, b)) * b;

/** Une équation en entiers premiers entre eux, premier coefficient non nul positif : « 2x + 2y = 8 » et « x + y = 4 » → « 1,1,4 ». */
function canonEq(e) {
  const fs = [e.a, e.b, e.c];
  const m = fs.reduce((acc, f) => lcm(acc, f.d), 1);
  let v = fs.map((f) => (f.n * m) / f.d);
  const g = v.reduce((acc, n) => gcd(acc, n), 0) || 1;
  v = v.map((n) => n / g);
  if (v.find((n) => n !== 0) < 0) v = v.map((n) => -n);
  return v.map((n) => (Object.is(n, -0) ? 0 : n)).join(',');
}

/** La forme CANONIQUE d'une jumla (règle K1) : chaque équation canonisée, les deux équations sans ordre. */
export const canonSystem = (s) => toSystem(s).map(canonEq).sort().join(' | ');

/**
 * La solution EXACTE d'une jumla : `{ kind: 'unique', x, y, key: '(5 ; 2)' }` (fractions de linear.js, couple ORDONNÉ), ou
 * `{ kind: 'none' | 'infinite', key: 'none' | 'infinite' }`.
 */
export function solutionOf(s) {
  const c = LS.classify(toSystem(s));
  if (c.kind !== 'unique') return { kind: c.kind, key: c.kind };
  return { kind: 'unique', x: c.x, y: c.y, key: `(${fracText(c.x)} ; ${fracText(c.y)})` };
}

/** Un couple écrit `[5, 2]` ou `'(5 ; 2)'` → la clé `'(5 ; 2)'` de `solutionOf`. */
export const pairKey = (p) => (Array.isArray(p) ? `(${p[0]} ; ${p[1]})` : String(p).replace(/\s+/g, ' ').replace(/−/g, '-').replace(/\(\s*/, '(').replace(/\s*\)/, ')').replace(/\s*;\s*/, ' ; '));

/**
 * LA SIGNATURE DE LA SYNTHÈSE `wadiya-idmajiya-jumal` (verdict X4) : aucune leçon de l'unité ne montre, avant sa مسألة, l'une de ces jumal, l'un de
 * ces couples ou l'un de ces totaux (la synthèse vient APRÈS les trois leçons).
 */
// The synthesis's module-7 rounds (converted 2026-11-12, `wadiya-idmajiya-jumal/content/rounds.js`) join its signature: r1 « رحلة القسم »,
// r2 « حفل المدرسة » and their two practice rounds — no lesson of the unit may show them before the synthesis (forward ban). The old
// « رحلة » (30 ; 50) stays: the teacher page still shows it.
export const SYNTH = Object.freeze({
  systems: ['10x + 10y = 800 | 2x + 3y = 210', '150x + 150y = 11250 | 24x + 30y = 2100',
    '10x + 10y = 550 | 5x + 3y = 235', '120x + 120y = 8400 | 9x + 14y = 780', '4x + 4y = 240 | 3x + 2y = 160', '20x + 20y = 900 | 3x + 5y = 165'],
  pairs: ['(25 ; 50)', '(30 ; 50)', '(35 ; 20)', '(40 ; 30)', '(40 ; 20)', '(30 ; 15)'],
  never: [248, 11250, 2100, 800],
});

/**
 * LE DÉFI DE LA PAGE D'UNITÉ (intégrateur, après la fusion — verdict X2), RÉSERVÉ dès le commit 0 : 23 caisses de dattes de 5 kg et de 2 kg, 82 kg,
 * présenté par ملاك. Aucune leçon n'utilise cette jumla, ce couple, ni 23 ou 82 dans une jumla.
 */
export const UNIT_PAGE = Object.freeze({
  systems: ['x + y = 23 | 5x + 2y = 82'],
  pairs: ['(12 ; 11)'],
  never: [23, 82],
});
