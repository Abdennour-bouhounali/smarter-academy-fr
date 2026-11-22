/**
 * LA SIGNATURE DE LA مسألة (module 4, « عائلة مراد ») qu'aucun écran avant elle ne montre DANS SON RÔLE — règle mécanique du conseil du
 * 2026-11-11 (verdict X3 / gap 2). Lue par content/race.test.js et content/mission.test.js ; les écrans viennent de `logic › shownValues`.
 *
 *   père 44, enfants 5 · 9 · 16 ; x = 7 (père 51, enfants 12 · 16 · 23) ; « ثلاثة أضعاف » : x = −2 (42 et 14) ; x > 7, premier entier 8.
 *   - dans AUCUN rôle d'écran : 44, 51 ;
 *   - `age` (âge ÉCRIT, à x = 0) : 44, 39, 5, 9, 16 ; deux enfants à la fois sur {5, 9, 16} : jamais ; le père 42 avec un enfant 14 : jamais ;
 *   - `solution` : 7 et −2 ; `first` : 8 ; `meet` (total à la rencontre) : 51 ;
 *   - `structure` : un père contre la somme d'exactement TROIS enfants ; le facteur 3 sur une personne ; une inéquation d'âges ;
 *   - `eq` : 44 + x · 3x + 30 · 48 + 3x · 16 + x · 2x = 14 · 2x = −4 · x > 7.
 */
export const NEVER = ['44', '51'];
export const BAD_AGE = ['44', '39', '5', '9', '16'];
export const BAD_SOLUTION = ['7', '-2'];
export const BAD_FIRST = ['8'];
export const BAD_MEET = ['51'];
export const CLIMAX_KIDS = ['5', '9', '16'];
export const BAD_EQ = ['44+x', '3x+30', '48+3x', '16+x', '2x=14', '2x=-4', 'x>7'];

export const bare = (v) => String(v).replace(/\s+/g, '').replace(/−/g, '-');

/** Les violations pour ce qu'un écran montre (`{ role, v }`, ou `{ role: 'screen', ages: [{ side, v }] }`) — vide si l'écran est propre. */
export function violations(shown, label = '') {
  const bad = [];
  const at = (x, why = x.v) => `${label}: ${why} (${x.role})`;
  shown.forEach((x) => {
    if (x.role === 'screen') {
      const ages = x.ages.map((a) => String(a.v));
      const kids = x.ages.filter((a) => a.side === 'right').map((a) => String(a.v));
      if (kids.filter((v) => CLIMAX_KIDS.includes(v)).length >= 2) bad.push(at(x, `two climax children ${kids.join(',')}`));
      if (x.ages.some((a) => a.side === 'left' && String(a.v) === '42') && ages.includes('14')) bad.push(at(x, 'father 42 with a child 14'));
      return;
    }
    const v = bare(x.v);
    const abs = v.replace(/^-/, '');
    if (['value', 'age', 'total', 'readout', 'meet'].includes(x.role) && NEVER.includes(abs)) bad.push(at(x));
    if (x.role === 'age' && BAD_AGE.includes(v)) bad.push(at(x));
    if (x.role === 'solution' && BAD_SOLUTION.includes(v)) bad.push(at(x));
    if (x.role === 'first' && BAD_FIRST.includes(v)) bad.push(at(x));
    if (x.role === 'meet' && BAD_MEET.includes(v)) bad.push(at(x));
    if (x.role === 'structure' && ['three', 'factor3', 'ineq'].includes(v)) bad.push(at(x));
    if (['eq', 'decoy-eq'].includes(x.role) && BAD_EQ.includes(v)) bad.push(at(x));
  });
  return bad;
}
