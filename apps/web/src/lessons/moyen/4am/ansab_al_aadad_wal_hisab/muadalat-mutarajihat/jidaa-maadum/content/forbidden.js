/**
 * LA SIGNATURE DE LA مسألة (module 5, « ملعب التدريب: ضلعان يتغيّران معًا ») qu'aucun écran avant elle ne montre DANS SON RÔLE — règle MÉCANIQUE
 * (conseil du 2026-11-11, verdict unité 4 L2 : écrite AVANT toute manche). Lue par content/mission.test.js (balayage de `logic › shownValues`)
 * et par ../_unit/signatures/jidaa-maadum.js (textes).
 *
 *   La مسألة : côtés 3x − 12 et x + 6, aire (3x − 12)(x + 6) ; solutions 4 et −6 ; au pin, l'autre côté vaut 10 (x = 4) ou −30 (x = −6) ;
 *   −6 est REFUSÉ par la situation (la correction interdite) ; cible 792 m², équation 3x² + 6x − 864 = 0 = 3(x − 16)(x + 18) ; racines 16 et −18 ;
 *   côtés 36 et 22, périmètre 116, 40 دج/m → 4640 دج ; bruit : 45 joueurs, 90 minutes. Leurres : 3x − 12 = x + 6, « −4 et 6 », « 12 et −6 »,
 *   3x² − 6x − 864, 3x² + 6x − 720, 3x² + 6x − 288.
 *   - `NEVER` (aucun rôle) : 792, 4640, 116, 864, 288, 720 ;
 *   - `root` / `option` / `tile` / `decoy` / `chip` (une solution montrée, offerte ou bâtie) : jamais 4, −6, 16, −18 ;
 *   - `rest` (le côté qui reste à un pin) : jamais 10, −30 ;
 *   - `side` / `area` (toute valeur que les lectures montrent pendant que x balaie la règle) : jamais 10, −30, 36, 22, −66, −12, 16, −18.
 * LA CORRECTION INTERDITE (au sens ÉTROIT) : points d'étape, « أستعدّ » et ورقة زميل ne REFUSENT jamais une solution à cause d'une situation, et ne
 * ramènent jamais « un produit égal à un nombre non nul » à « … = 0 » (la méthode de la partie 3).
 */
export const NEVER = ['792', '4640', '116', '864', '288', '720'];
export const BAD_ROOT = ['4', '-6', '16', '-18'];
export const BAD_REST = ['10', '-30'];
export const BAD_VALUE = ['10', '-30', '36', '22', '-66', '-12', '16', '-18'];

const norm = (s) => String(s).replace(/\s+/g, '').replace(/−/g, '-');

/** Les violations pour ce qu'un écran du labo montre (`logic › shownValues`, `{ role, v }`) — vide si l'écran est propre. */
export function violations(shown, label = '') {
  const bad = [];
  const at = (x) => `${label}: ${x.v} (${x.role})`;
  shown.forEach((x) => {
    const v = norm(x.v);
    if (NEVER.includes(v)) bad.push(at(x));
    if (['root', 'option', 'tile', 'decoy', 'chip'].includes(x.role) && BAD_ROOT.includes(v)) bad.push(at(x));
    if (x.role === 'rest' && BAD_REST.includes(v)) bad.push(at(x));
    if ((x.role === 'side' || x.role === 'area') && BAD_VALUE.includes(v)) bad.push(at(x));
    if (x.role === 'expr' && /3x-12|x\+6(?![0-9])|x-16|x\+18/.test(v)) bad.push(at(x));
  });
  return bad;
}

/**
 * Ce qu'un TEXTE montré à l'élève avant la مسألة ne contient jamais (points d'étape, « أستعدّ », ورقة زميل, cartes, carte des معارف, exercices) :
 * les facteurs, l'aire cible et ses développements, les prix et le bruit. (U+2212 et tiret sont lus pareil par `showsAny`.)
 */
export const TEXT = [
  /3x\s*-\s*12/, /(^|[^0-9a-z^])x\s*\+\s*6(?![0-9])/, /x\s*-\s*16(?![0-9])/, /x\s*\+\s*18(?![0-9])/, /3x\^2\s*[+-]\s*6x/,
  /(^|[^0-9.,{])(792|4640|864|288|720)(?![0-9])/, /(^|[^0-9.,{])116(?![0-9])/, /40\s*دج/, /45\s*لاعب/, /90\s*دقيقة/,
  /3\s*\(\s*x\s*-\s*16\s*\)/,
];

/** Ce que l'élève ne reçoit jamais avant la مسألة : refuser une solution à cause d'une situation. */
export const SITUATION_REFUSAL = /الطول لا يكون سالب|طول ضلع.*موجب|مرفوض/;
