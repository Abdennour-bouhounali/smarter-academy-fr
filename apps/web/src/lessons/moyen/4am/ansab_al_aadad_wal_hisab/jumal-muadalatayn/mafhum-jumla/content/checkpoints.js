/**
 * Les jumal des points d'étape de la mission (lesson.config.js › mission.checkpoints, écrits en LITTÉRAUX pour scripts/validate-lessons.mjs) :
 * content/mission.test.js vérifie que chaque énoncé montre EXACTEMENT ces équations, et le registre de l'unité les lit d'ici
 * (`_unit/signatures/mafhum-jumla.js`, niveau `checkpoint`). `cp-kathira` porte une seule équation : il n'est pas une jumla.
 */
export const CP_SYSTEMS = {
  'cp-halat': ['x - 2y = 1', '3x - 6y = 3'],
  'cp-dhihni': ['x = 2', 'x + y = 7'],
};
/** L'équation de `cp-kathira` et les deux ثنائيات qu'elle accepte (verdict L1.13). */
export const CP_KATHIRA = { eq: '4x + y = 13', pairs: [[1, 9], [3, 1]] };
