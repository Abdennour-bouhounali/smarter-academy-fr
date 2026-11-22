/**
 * Les calculs tapés dans un texte arabe (WrittenAnswer) s'inversent en RTL :
 * « 268 = 54 × 4 + 52 » s'affiche « 52 + 4 × 54 = 268 » — les opérateurs sont
 * neutres et les chiffres prennent la direction arabe. Aucun réglage CSS ne le
 * corrige au milieu d'une phrase (vérifié au navigateur, 2026-10-06) : il faut
 * isoler chaque calcul en LTR avec LRI (U+2066) … PDI (U+2069), invisibles.
 *
 * `isolateMath` est IDEMPOTENTE (elle retire d'abord les isolants qu'elle a
 * posés) et rend la position du curseur recalculée, pour la zone d'écriture.
 * Voir docs/architecture/ARABIC_RTL_CONTRACT.md (paires numériques).
 */
const LRI = '⁦';
const PDI = '⁩';
// Un calcul : commence par un chiffre, « ( » ou « √ », finit par un chiffre, « ) »,
// un exposant ou π ; peut contenir opérateurs, espaces, virgules décimales.
const MATH_RUN = /[\d(√][\d\s×÷=≠<>≤≥+\-−*/.,()²³√π%]*[\d)²³π%]|\d/g;

export function isolateMath(raw, cursor = raw.length) {
  // 1. Retirer nos isolants, en suivant le curseur.
  let plain = '';
  let plainCursor = 0;
  for (let i = 0; i < raw.length; i++) {
    if (i === cursor) plainCursor = plain.length;
    if (raw[i] !== LRI && raw[i] !== PDI) plain += raw[i];
  }
  if (cursor >= raw.length) plainCursor = plain.length;

  // 2. Isoler chaque calcul qui contient un opérateur (un nombre seul se lit
  //    bien). `at[i]` = position dans la sortie du caractère i du texte nu ;
  //    la fin d'un calcul reste DANS l'isolant (on continue d'y taper).
  let out = '';
  const at = new Array(plain.length + 1);
  let last = 0;
  const copy = (from, to) => {
    for (let i = from; i < to; i++) { if (at[i] == null) at[i] = out.length; out += plain[i]; }
  };
  for (const m of plain.matchAll(MATH_RUN)) {
    if (!/[×÷=≠<>≤≥+\-−*/√²³]/.test(m[0])) continue;
    const start = m.index;
    const end = start + m[0].length;
    copy(last, start);
    out += LRI;
    copy(start, end);
    at[end] = out.length; // avant le PDI
    out += PDI;
    last = end;
  }
  copy(last, plain.length);
  if (at[plain.length] == null) at[plain.length] = out.length;
  return { text: out, cursor: at[plainCursor] };
}

/** Le texte sans isolants (longueur utile, copie). */
export const stripIsolates = (s) => s.replace(/[⁦⁩]/g, '');
