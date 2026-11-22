/**
 * LES THÈMES D'OBJETS — la partie sans React et sans arabe.
 *
 * Un thème dit QUELS objets une scène dessine (`ItemFigure` kinds + teintes)
 * et sous quelle clé lesson.json fournit ses MOTS (`manipulation.themes.<id>`).
 * Il ne touche à aucune mathématique : la répartition, les restes et les
 * verdicts viennent de `packages/core/arithmetic`. C'est ce qui permet à une
 * même manipulation (`common-divisors`, `coprime-explorer`,
 * `fraction-reduction`) de servir plusieurs leçons en ne changeant que le
 * thème — une DONNÉE — et jamais le composant.
 *
 * Les identifiants sont ceux de `VISUAL_THEMES` (packages/core, registre
 * fermé) ; `themeItems.test.js` vérifie que chaque thème d'objets existe bien
 * dans le registre.
 */
export const ITEM_THEMES = Object.freeze({
  garden:   { itemA: { kind: 'flower', tone: 'a' }, itemB: { kind: 'flower', tone: 'b' }, container: 'vase' },
  football: { itemA: { kind: 'ball' },              itemB: { kind: 'shirt' },              container: 'bag' },
  school:   { itemA: { kind: 'pen' },               itemB: { kind: 'notebook' },           container: 'bag' },
  kitchen:  { itemA: { kind: 'spoon' },             itemB: { kind: 'cup' },                container: 'tray' },
});

export const ITEM_THEME_IDS = Object.freeze(Object.keys(ITEM_THEMES));

/** Le thème demandé, ou `garden` (les fleurs du manuel) quand il est inconnu. */
export function resolveItemTheme(id) {
  return ITEM_THEMES[id] ? id : 'garden';
}
