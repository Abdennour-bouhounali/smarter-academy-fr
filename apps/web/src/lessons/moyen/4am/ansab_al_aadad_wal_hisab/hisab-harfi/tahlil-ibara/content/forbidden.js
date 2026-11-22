/**
 * LA SIGNATURE DE LA مسألة (module 5, « الملعب الجواري: كم صفًّا من العشب؟ ») qu'aucun écran avant elle ne montre DANS SON RÔLE — règle MÉCANIQUE
 * des conseils du 2026-11-10 et du 2026-11-11 (verdict « Cross-lesson » : un balayage par leçon, jetons PAR RÔLE, aucune liste d'exceptions, la
 * مسألة n'est pas retouchée ; verdict « L3 » : la correction interdite définie ÉTROITEMENT). Lue par content/mission.test.js et
 * ../_unit/missionStrings.test.js.
 *
 *   La مسألة : 10 grands carrés x² et 15 bandes x × 1, des rangées de hauteur x ; 10x² + 15x ; PGCD(10 ; 15) = 5 → 5 rangées de 2 carrés et
 *   3 bandes ; 10x² + 15x = 5x(2x + 3) ; x = 6 : aire 450, côtés 30 et 15, périmètre 90, clôture 1500 دج/m → 135000 دج ; bruit : 200 spectateurs,
 *   4 ouvriers. Partie 2 : سمير propose 3 rangées (10 = 3 × 3 + 1 : UN grand carré reste dehors) ; أمين écrit 5(2x² + 3x) (juste, incomplet).
 *   Leurres : 25x², 10x + 15, 10x² + 15, 5(2x + 3), 5x(2x + 15), 5x × 5x, 5x²(2 + 3x), 10x² + 3x, 7x² + 8x, 10x³ + 15x.
 *   - dans AUCUN rôle : 1500, 135000, 450, 200, 10x² + 15x, 5x²(2 + 3x) ;
 *   - `common` / `chip` (un facteur commun montré, une pastille de hauteur) : jamais 5x ;
 *   - `inner` / `decoy-inner` (une rangée, un crochet) : jamais 2x + 3 ni 2x + 15 — ÉQUIVALENT : aucun terrain en rangées dont les deux nombres
 *     de plaques sont dans le rapport 2 : 3 (`pair`) ;
 *   - `pair` : jamais 10 : 15 (le PGCD(10 ; 15) de la correction) ;
 *   - `eq` / `decoy-eq` : jamais 5(2x + 3), 5(2x² + 3x), 25x² ;
 *   - `leftover` : jamais « 3 rangées, un grand carré dehors » (`3:x2×1`, la proposition de سمير).
 * LA CORRECTION INTERDITE, au sens ÉTROIT (verdict L3) : les points d'étape, la ورقة زميل et « أستعدّ » ne posent JAMAIS une analyse incomplète
 * k(…) dont le crochet partage encore un x (`incompleteFactor`) ; la suite de questions du labo (`heightFill`, les leurres de la construction) PEUT
 * apprendre « la lettre sort aussi » et « les rangées divisent les deux nombres » sur SES nombres : c'est la découverte de la leçon.
 */
export const NEVER = ['1500', '135000', '450', '200', '10x^2+15x', '5x^2(2+3x)'];
export const BAD_COMMON = ['5x'];
export const BAD_INNER = ['2x+3', '2x+15'];
export const BAD_PAIR = ['10:15'];
export const BAD_EQ = ['5(2x+3)', '5(2x^2+3x)', '25x^2'];
export const BAD_LEFTOVER = ['3:x2×1'];

const norm = (s) => String(s).replace(/\s+/g, '').replace(/−/g, '-');
// ORDERED on purpose: x² : x = 2 : 3 (or x : 1) is what gives the climax's row 2x + 3 ; 3 : 2 gives 3x + 2, another row (revue 2026-11-11)
const ratio23 = (pair) => {
  const [a, b] = String(pair).split(':').map(Number);
  return a > 0 && b > 0 && a * 3 === b * 2;
};

/** Les violations pour ce qu'un écran du labo montre (`logic › shownValues`, `{ role, v }`) — vide si l'écran est propre. */
export function violations(shown, label = '') {
  const bad = [];
  const at = (x) => `${label}: ${x.v} (${x.role})`;
  shown.forEach((x) => {
    const v = norm(x.v);
    if (NEVER.some((n) => v === n || v.includes(n))) bad.push(at(x));
    if ((x.role === 'common' || x.role === 'chip' || x.role === 'tile') && BAD_COMMON.includes(v)) bad.push(at(x));
    if ((x.role === 'inner' || x.role === 'decoy-inner') && BAD_INNER.includes(v)) bad.push(at(x));
    if (x.role === 'pair' && (BAD_PAIR.includes(v) || ratio23(v))) bad.push(at(x));
    if ((x.role === 'eq' || x.role === 'decoy-eq') && BAD_EQ.some((e) => v.includes(e))) bad.push(at(x));
    if (x.role === 'leftover' && BAD_LEFTOVER.includes(v)) bad.push(at(x));
  });
  return bad;
}

/**
 * Ce qu'un TEXTE montré à l'élève avant la مسألة ne contient jamais (points d'étape, « أستعدّ », ورقة زميل, cartes et carte des معارف, exercices) :
 * la réponse et ses leurres développés, la correction de أمين, le PGCD de la correction, les prix et le bruit, et 5x posé en facteur d'une somme
 * en x (« 5x(x … ») — le rôle de la مسألة.
 */
export const TEXT = [
  /10x\^2\s*\+\s*15x/, /5x\s*\(\s*2x\s*\+\s*3\s*\)/, /\(\s*2x\s*\+\s*3\s*\)\s*\\?(times)?\s*5x/, /5\s*\(\s*2x\^2\s*\+\s*3x\s*\)/,
  /5x\^2\s*\(\s*2\s*\+\s*3x\s*\)/, /2x\s*\+\s*15(?![0-9])/, /PGCD\s*\$?\s*\(\s*10\s*;\s*15\s*\)/, /135\s*000/,
  /(^|[^0-9.,{])(1500|450)(?![0-9])/, /(^|[^0-9a-z(])5x\s*\(\s*x\s*[+-]/,
];

/** Une analyse INCOMPLÈTE : un facteur k (ou kx) devant un crochet dont les deux termes contiennent encore x (« 2(3x^2 + 2x) »). */
export const INCOMPLETE = /(^|[^0-9a-z^{}()])(\d+x?|x)\s*\(\s*-?\s*\d*x(\^\d)?\s*[+-]\s*\d*x(\^\d)?\s*\)/;
export const incompleteFactor = (text) => INCOMPLETE.test(String(text).replace(/\\left|\\right/g, ''));
