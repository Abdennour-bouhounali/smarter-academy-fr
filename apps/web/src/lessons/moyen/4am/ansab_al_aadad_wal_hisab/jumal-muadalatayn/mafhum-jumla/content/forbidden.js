/**
 * LA SIGNATURE DE LA مسألة (module 4, « مصلحة الحالة المدنية: 42 عاملًا وشرطان ») qu'aucun écran avant elle ne montre DANS SON RÔLE — règle
 * MÉCANIQUE des conseils (jetons PAR RÔLE, la مسألة n'est pas retouchée ; conseil du 2026-11-11, verdict « L1 », L1.6, L1.14). ÉCRITE AVANT les
 * manches ; lue par content/pairs.test.js, content/mission.test.js et, par `_unit/signatures/mafhum-jumla.js`, par `_unit/missionStrings.test.js`
 * et `_unit/unitCollisions.test.js`.
 *
 *   La مسألة : 42 عاملًا ; 6 رجال و 4 نساء على التقاعد ; ثم الرجال ثلاثة أضعاف النساء ; ثم 10 عمّال جدد والرجال ضعف النساء. Partie 1 —
 *   x + y = 42, x − 6 = 3(y − 4), réduite x − 3y = −6 (leurres 3(x − 6) = y − 4, x − 6 = 3y − 4, x + y = 32, x − 3y = −18, x − 3y = 6, 3x − y = −6) ;
 *   partie 2 — trois propositions (32 ; 10), (30 ; 12), (12 ; 30) : la bonne (30 ; 12), sa renversée, la « 32 » ; vérification 30 − 36 = −6
 *   (et −78 pour la renversée), « 30 ≠ 24 » ; partie 3 — m + n = 10, 24 + m = 2(8 + n), (4 ; 6) / (6 ; 4), états (24 ; 8) et (28 ; 14), 28 = 28.
 *   - `eq` / `system` / `tile` / `decoy` : jamais une des équations de la مسألة ;
 *   - `total` (le N d'un monde « count ») : jamais 42, 32 ni 10 ;
 *   - `solution` / `swap` / `start` (une ثنائية montrée) : jamais un couple de la مسألة ;
 *   - `reading` (une valeur de jauge AU DÉPART, à la solution, à la renversée — les seuls points qu'un écran DÉSIGNE ; une valeur que la main
 *     traverse en glissant, 24 en (8 ; 0) par exemple, n'a pas de rôle — revue 2026-11-12) : jamais −6, −78, 28, 24 ;
 *   - `chip` : jamais −6, −78, 28 — le 24 du verdict L1.6 (« 24 = 3 × 8 », les victoires seules de la manche 3) est une pastille, PAS la
 *     vérification « 30 ≠ 24 » de la مسألة : le verdict (contraignant) l'emporte ici sur la liste de rôles du dessin.
 * LA CORRECTION INTERDITE (étroite, verdict Q6 / L1.6) : les points d'étape, « أستعدّ » et la ورقة زميل ne posent jamais la ثنائية renversée, les
 * parenthèses oubliées, le facteur du mauvais côté ni le total « après » comme PIÈGE ; le format « trois propositions » n'est nulle part avant.
 */
export const CLIMAX = Object.freeze({
  systems: ['x + y = 42 | x - 6 = 3(y - 4)'],
  pairs: ['(30 ; 12)', '(12 ; 30)', '(4 ; 6)', '(6 ; 4)'],
  never: [42],
});

const norm = (s) => String(s).replace(/\s+/g, '').replace(/−/g, '-').replace(/\\,/g, '');

export const BAD_EQ = ['x+y=42', 'x-6=3(y-4)', 'x-3y=-6', '3(x-6)=y-4', 'x-6=3y-4', 'x+y=32', 'x-3y=-18', 'x-3y=6', '3x-y=-6', 'x+y=10', '24+x=2(8+y)', '2(24+x)=8+y', 'x=2y'];
export const BAD_TOTAL = ['42', '32', '10'];
export const BAD_PAIR = ['(30;12)', '(12;30)', '(32;10)', '(4;6)', '(6;4)', '(24;8)', '(28;14)'];
export const BAD_READING = ['-6', '-78', '28', '24'];
export const BAD_CHIP = ['-6', '-78', '28'];
const eqOf = (v) => v.split('|');

/** Les violations pour ce qu'un écran du labo montre (`logic › shownValues`, `{ role, v }`) — vide si l'écran est propre. */
export function violations(shown, label = '') {
  const bad = [];
  const at = (x) => `${label}: ${x.v} (${x.role})`;
  shown.forEach((x) => {
    const v = norm(x.v);
    if (v === '42' || v.includes('42')) bad.push(at(x));
    if ((x.role === 'eq' || x.role === 'tile' || x.role === 'decoy' || x.role === 'line') && BAD_EQ.includes(v)) bad.push(at(x));
    if (x.role === 'system' && eqOf(v).some((e) => BAD_EQ.includes(e))) bad.push(at(x));
    if (x.role === 'total' && BAD_TOTAL.includes(v)) bad.push(at(x));
    if ((x.role === 'solution' || x.role === 'swap' || x.role === 'start') && BAD_PAIR.includes(v)) bad.push(at(x));
    if (x.role === 'reading' && BAD_READING.includes(v)) bad.push(at(x));
    if (x.role === 'chip' && BAD_CHIP.includes(v)) bad.push(at(x));
  });
  return bad;
}

/**
 * Ce qu'un TEXTE montré à l'élève avant la مسألة ne contient jamais (points d'étape, « أستعدّ », ورقة زميل, cartes et carte des معارف,
 * exercices, textes du labo, prose des modules 0–3). Lit le moins U+2212. Les trois expressions qui commencent par « x » prennent `(?<![0-9])`
 * (verdict L1.14 : `2x − 3y = 8` de la ورقة صهيب, `3x − 3y = 5` du cas sans solution ne sont pas la مسألة).
 */
export const TEXT = [
  /(?<![0-9])x\s*\+\s*y\s*=\s*(42|32|10)(?![0-9])/,
  /(?<![0-9])x\s*[-−]\s*6\s*=\s*3/,
  /(?<![0-9])x\s*[-−]\s*3y\s*=/,
  /3\s*\(\s*x\s*[-−]\s*6\s*\)/,
  /\(\s*(30\s*;\s*12|12\s*;\s*30|32\s*;\s*10|4\s*;\s*6|6\s*;\s*4|24\s*;\s*8|28\s*;\s*14)\s*\)/,
  /m\s*\+\s*n/, /24\s*\+\s*m/, /=\s*[-−]\s*78/,
  /(^|[^0-9.,{])42(?![0-9])/,
  /التقاعد|تقاعد|الحالة المدنية|توظيف/,
];
