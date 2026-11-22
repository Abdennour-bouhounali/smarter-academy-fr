/**
 * CE QU'AUCUN ÉCRAN AVANT SON HEURE NE MONTRE — la synthèse de l'unité 4 dans le lecteur de mission (2026-11-12 ; le propriétaire : « go ahead »
 * pour les synthèses des unités 1–4, recette PROVISOIRE de la synthèse — docs/reports/MISSION_ROLLOUT_PROGRESS.md › « The synthesis recipe »).
 * Lue par content/mission.test.js (le balayage par RÔLE, écrit AVANT la conversion : il a d'abord échoué — rapport du constructeur) et, pour la
 * signature du défi résolu, par `_unit/signatures/wadiya-idmajiya-muadalat.js` (`_unit/missionStrings.test.js`).
 *
 * LE DÉFI 🏆 (module 8, `Module08Ahill.jsx` — jamais retouché, sauf règles du propriétaire) est la وضعية du مسبح : la formule 1 coûte 75 دج la
 * séance, la formule 2 un abonnement de 560 دج et 5 دج la séance → 75x et 560 + 5x → « la formule 2 est meilleure » : 560 + 5x < 75x → 560 < 70x
 * → x > 8 → à partir de 9 séances (à 8 séances les deux coûtent 600 دج ; vérification à 9 : 675 et 605).
 * La وضعية DE L'UNITÉ (module 7) est la MÊME situation : le module 7 l'ANALYSE (les données, ce que « أفضل » et « ابتداءً من » demandent, la
 * stratégie, le modèle 560 + 5x < 75x, la démarche en lettres) et ne la RÉSOUT jamais. Donc deux niveaux :
 *   1. LE DÉFI RÉSOLU (`ANSWER_TEXT`) : 70x, 560 < 70x / 70x > 560, x > 8 / 8 < x, x ≥ 9, « 9 حصص », x = 8, 600, 675, 605, 560 ÷ 70 —
 *      nulle part avant le 🏆, le module 7 compris ;
 *   2. LA SITUATION ELLE-MÊME (`SITUATION_TEXT`) : le مسبح et la سباحة, 560, 75x, 75 دج / دينارًا, 560 + 5x — nulle part AVANT le module 7
 *      (entraînements, cartes de mémoire et carte des معارف ouvertes dès le premier écran, ouverture, « أستعدّ »).
 * Rôles (`{ role, v }` d'un écran de manche — `logic/growthRacePlayer › shownValues`, avec `chains` : les tuiles des questions du lecteur) :
 *   tout rôle (sauf 'screen' / 'structure')   jamais 560, 600, 675, 605 ;
 *   'rate'   (le prix d'une séance)            jamais 75, 5 ; ni 90, 20 (le défi de la page d'unité, un club d'équitation 90 / 700 + 20) ;
 *   'fixed'  (l'abonnement)                    jamais 560, 700 ;
 *   'saving' (ce qu'une séance économise)       jamais 70 ;
 *   'solution' (la séance d'égalité)           jamais 8, 10 ;  'first' (la première séance meilleure) jamais 9, 11 ;
 *   'meet'   (le coût à l'égalité)              jamais 600, 900 ;
 *   'eq'     (une écriture de la manche)        jamais 75x, 560 + 5x, 70x, x > 8, x > 10.
 */
export const NEVER = ['560', '600', '675', '605'];
const BAD = {
  rate: ['75', '5', '90', '20'],
  fixed: ['560', '700'],
  saving: ['70'],
  solution: ['8', '10'],
  first: ['9', '11'],
  meet: ['600', '900'],
};
const BAD_EQ = [/(?<![0-9])75x/, /(?<![0-9])560/, /(?<![0-9])70x/, /x>8(?![0-9])/, /x>10(?![0-9])/, /8<x/, /x(\\geq|≥)9(?![0-9])/];
const SKIP = new Set(['screen', 'structure']);

/** Une écriture TeX ramenée à sa forme nue : sans espaces, « − » → « - ». */
export const bare = (v) => String(v).replace(/\s+/g, '').replace(/−/g, '-').replace(/\\left|\\right|\\times/g, '');

/** Les violations pour ce qu'un écran de manche montre (`{ role, v }`) — vide si l'écran est propre. */
export function violations(shown, label = '') {
  const bad = [];
  shown.forEach((x) => {
    if (SKIP.has(x.role)) return;
    const v = bare(x.v);
    const at = `${label}: ${x.v} (${x.role})`;
    if (NEVER.includes(v)) bad.push(at);
    else if (BAD[x.role]?.includes(v)) bad.push(at);
    else if (x.role === 'eq' && BAD_EQ.some((re) => re.test(v))) bad.push(at);
  });
  return bad;
}

/* ── Les mêmes signatures pour un TEXTE (un énoncé, une carte, la carte des معارف, l'ouverture, « أستعدّ », la feuille de camarade) ── */
// un nombre ENTIER isolé (ni dans 5600, ni dans 56,0 ou 5{,}60) — « { » avant le nombre n'est PAS exclu (\text{600} est attrapé)
// (ni après un tiret de nom de classe : « text-slate-600 » n'est pas un nombre montré)
const num = (n) => new RegExp(`(?<![0-9.,]|\\{,\\}|[a-z]-)${n}(?![0-9]|\\{?,\\}?[0-9]|\\.[0-9])`);
const GEQ = '(\\\\geq|\\\\ge|≥|>=)';

/** 1. Le défi RÉSOLU : jamais avant le 🏆 (le module 7 compris). */
export const ANSWER_TEXT = [
  /(?<![0-9])70\s*x/, /(?<![0-9])70\s*(\\times|×|\\cdot)\s*x/,
  /x\s*>\s*8(?![0-9,.])/, /(?<![0-9])8\s*<\s*x/, new RegExp(`x\\s*${GEQ}\\s*9(?![0-9])`), /x\s*=\s*8(?![0-9,.])/,
  /(?<![0-9])9\s*(\\[,;]|\\text\{\s*)*\s*حص/, /(?<![0-9])8\s*(\\[,;]|\\text\{\s*)*\s*حص/, /تسع[ةه]?\s*حص/, /ثمان(ي|ية)?\s*حص/, /الحص(?:ة|ّ)+\s*التاسعة/, /ستمائة|ستّمائة/,
  /x\s*(\\gt)\s*8(?![0-9])/, /8\s*(\\lt)\s*x/, new RegExp(`x\\s*(\\\\geqslant|⩾)\\s*9(?![0-9])`),
  num('600'), num('675'), num('605'), /560\s*(\\div|÷|\/)\s*70/, /\\d?frac\{560\}\{70\}/,
];
/** 2. La situation elle-même : jamais AVANT le module 7. */
export const SITUATION_TEXT = [
  ...ANSWER_TEXT,
  /مسبح|المسبح|سباحة|السباحة/, /خمسة\s*و\s*سبعون/, num('560'), /(?<![0-9])75\s*x/, /(?<![0-9.,])75\s*(دج|دينار)/, /(?<![0-9])75\s*(\\times|×)/,
  /5\s*x\s*\+\s*560/,
];

/** Les violations d'un texte — vide s'il est propre. `before7` : l'écran vient avant le module 7 (la situation elle-même y est interdite). */
// les chiffres arabes-indiens (٠–٩) sont ramenés aux chiffres occidentaux avant le balayage
const western = (s) => String(s).replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0)).replace(/−/g, '-');
export const textViolations = (s, label = '', { before7 = true } = {}) => (before7 ? SITUATION_TEXT : ANSWER_TEXT)
  .filter((re) => re.test(western(s))).map((re) => `${label}: ${re}`);

/** Les lignes d'un source sans ses commentaires ni ses métadonnées de source. */
export const visibleLines = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')
  .replace(/\s\/\/ .*$/gm, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/src\([^)]*\)/g, '')
  .split('\n');
