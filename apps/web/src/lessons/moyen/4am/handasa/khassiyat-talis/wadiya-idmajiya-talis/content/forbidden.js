/**
 * CE QU'AUCUN ÉCRAN AVANT SON HEURE NE MONTRE — la synthèse de l'unité 9 dans le lecteur de mission (pilote du recette « synthèse », conseils du
 * 2026-11-10 : décisions S, verdict C). Lue par content/mission.test.js (le balayage par RÔLE, écrit AVANT la conversion : il a d'abord échoué
 * sur la وضعية تدريبية 1 et sur les cartes de mémoire) et par _unit/missionStrings.test.js.
 *
 * DEUX signatures :
 *   1. le défi 🏆 (module 8, `TEST` de content/textbook.js — JAMAIS retouché) : le cornet H = 12, R = 6 (r ÷ 6 = (12 − h) ÷ 12 ; h = r ⇒
 *      18r = 72 ⇒ r = 4, OT = 8 ; V = 64π ≈ 201,06 ; leurres 3 / 8 / 6, 256π ≈ 804,25, 16π ≈ 50,27 ; le rayon 9 REJETÉ) et la minaret (bâton
 *      1,5 m à 12 m, ombres finissant ensemble à 14 m ⇒ ombre du bâton 2, rapport 7, hauteur 10,5 ; leurres 7, 9, 21) ;
 *   2. les réponses PROPRES de la وضعية de l'unité (module 7) : la minaret 7,25 (1 ÷ H = 4/29), le cylindre h = r = 4,5 (24r = 108, OT = 13,5,
 *      rapport 0,75), V = 91,125π ≈ 286,28, et le 7,2 rejeté de son étape de vérification ; son ÉGALITÉ dans ses lettres (r ÷ 6 = (18 − h) ÷ 18).
 *      Ses DONNÉES (le bâton 1 m, AB = 10, OA = 11,6, le cône 18 / 6) restent permises là où le module 7 les donne lui-même.
 * Exemption NOMMÉE : le rayon R = 6 est une DONNÉE partagée par les cônes des modules 7 et 8 (jamais un couple, jamais une réponse).
 *
 * Par rôle (`{ role, v }` : ce qu'un écran de labo montre — logic/coneCylinder › shownValues, logic/shadowMeet › shownValues) :
 *   'cone-H'     jamais 12 ni 18 (H = 2R et H = 3R aussi : leurs rapports sont ceux des modules 8 et 7) ;
 *   'cone-R'     6 permis (l'exemption) ;
 *   'h' / 'r'    une dimension de cylindre : jamais 4,5 ni 13,5 ni 7,2 (le rayon 9 rejeté du défi : un refus n'écrit aucun nombre) ;
 *   'square'     le côté d'un cylindre h = r : AUCUN (le carré reste à l'étape « h = r » du module 7, puis au défi) ;
 *   'OT'         jamais 8 ni 13,5 ;
 *   'ratio'      jamais 2/3, 3/4 (ni leurs écritures 0,75), ni 4/29, ni 7 ;
 *   'height'     une hauteur trouvée : jamais 7,25 ni 10,5 ; 'decoy-height' : jamais 7, 9, 21 ;
 *   'length'     un ombre / une distance : jamais 14 ni 2 ni 12 (l'ombre du bâton du défi, sa distance) ;
 *   'value'      une tuile ou une pastille de nombre : jamais 72, 108, 64, 91,125, 201,06, 286,28.
 */
export const NEVER = ['7,25', '10,5', '13,5', '91,125', '286,28', '201,06', '804,25', '50,27', '4/29', '108', '72'];
const ROLE = {
  'cone-H': ['12', '18'],
  h: ['4,5', '13,5', '7,2', '10,5'],
  // le rayon 9 du défi est un rayon REJETÉ (E6) : un verdict de refus ne montre aucun nombre — 9 reste permis comme rayon d'un cylindre qui touche
  r: ['4,5', '13,5', '7,2'],
  OT: ['8', '13,5'],
  ratio: ['2/3', '3/4', '0,75', '4/29', '7', '1/2'],
  height: ['7,25', '10,5'],
  'decoy-height': ['7', '9', '21'],
  length: ['14', '2', '12'],
  value: ['72', '108', '64', '91,125', '201,06', '286,28'],
};

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
/** « 9/15 » → « 3/5 » ; un nombre reste lui-même (le rôle 'ratio' compare les fractions RÉDUITES). */
export function reduced(v) {
  const m = /^(\d+)\/(\d+)$/.exec(String(v));
  if (!m) return String(v);
  const [n, d] = [Number(m[1]), Number(m[2])];
  const g = gcd(n, d);
  return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`;
}

/** Les violations d'une liste `{ role, v }` — vide si l'écran est propre. Un cylindre h = r est signalé par le rôle 'square'. */
export function violations(shown, label = '') {
  const bad = [];
  shown.forEach((x) => {
    const v = reduced(String(x.v).replace('.', ','));
    const at = `${label}: ${x.v} (${x.role})`;
    if (NEVER.includes(v)) bad.push(at);
    if (x.role === 'square') bad.push(at);
    if ((ROLE[x.role] ?? []).includes(v)) bad.push(at);
  });
  return bad;
}

/**
 * La même signature pour un TEXTE (un énoncé de وضعية تدريبية, une carte de mémoire, la carte des معارف, l'ouverture, « أستعدّ », la ورقة زميل)
 * — PAS la page de l'unité : son défi EST le تحدّ du module 7 (ses données 11,6 et 1,6, jamais sa réponse ; pages/unit/unitMissions.test.js) : les nombres qui ne sont jamais permis et les couples « rôle = valeur » des deux situations — pas leurs petits nombres nus.
 */
const n = (s) => s.replace(',', '\\{?,\\}?');
const never = (list) => new RegExp(`(^|[^0-9,{}.])(${list.map(n).join('|')})(?![0-9]|\\{?,\\}?[0-9])`);
export const CLIMAX_TEXT = [
  // le défi 🏆, cornet : 18r = 72, r = 4 du cylindre h = r, V = 64π et ses leurres, l'égalité du cornet 12 / 6
  never(['10,5', '201,06', '804,25', '50,27', '72']),
  /64\s*\\?pi/, /256\s*\\?pi/,
  /\\d?frac\{12\s*-\s*[hr]\}\{12\}/, /12\s*-\s*r(?![a-z])/, /18\s*r\s*=/,
  // le défi 🏆, minaret : le bâton de 1,5 m, son ombre de 2 m, la fin des ombres à 14 m, le rapport 14 / 2
  /(عصا|العصا)[^.؛،]{0,40}1\{?,\}?5(?![0-9])/, /BE\s*=\s*1\{?,\}?5(?![0-9])/,
  /OB\s*=\s*2(?![0-9]|\{?,)/, /ظلّ\s*العصا[^.؛،]{0,30}(?<![0-9,{}])2\s*\\?,?\\?\s*\\?mathrm\{m\}/, /\\d?frac\{14\}\{2\}/,
  // la وضعية de l'unité (module 7) : ses réponses et son égalité dans ses lettres
  never(['7,25', '13,5', '0,75', '91,125', '286,28', '108', '7,2']),
  // 4,5 COMME DIMENSION de cylindre (« r = 4,5 », « 4,5² ») — 4,5 m reste permis ailleurs (le côté d'une زربية)
  /([hr]\s*=\s*)4\{?,\}?5(?![0-9])/, /4\{?,\}?5\s*\^/, /24\s*r/, /\\d?frac\{4\}\{29\}/,
  /\\d?frac\{18\s*-\s*[hr]\}\{18\}/, /\\d?frac\{r\}\{6\}/,
  // la وضعية de l'unité : son problème même (le bâton de 1 m, son ombre 1,6 m, l'ombre de la minaret 11,6 m)
  /(^|[^0-9,{}.])11\{?,\}?6(?![0-9])/, /(^|[^0-9,{}.])1\{?,\}?6(?![0-9])/,
];
/** Les violations d'un texte — vide s'il est propre. */
export const textViolations = (s, label = '') => CLIMAX_TEXT.filter((re) => re.test(String(s))).map((re) => `${label}: ${re}`);
