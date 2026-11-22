import { resolveItemTheme } from './primitives/itemThemes';

/**
 * LES MOTS D'UN THÈME — ce qu'une scène d'objets dit en arabe.
 *
 * Les mots vivent dans lesson.json (`manipulation.themes.<id>.*`), jamais
 * dans un composant. Une leçon peut en remplacer certains par son `context`
 * (les mots du manuel : « باقة », « زهرة حمراء ») ; le reste vient du thème.
 * `more(n)` résume les groupes qu'on ne dessine pas (« +9 أخرى »).
 */
export function themeWords(t, theme, context = {}) {
  const id = resolveItemTheme(theme);
  const k = (key) => t(`manipulation.themes.${id}.${key}`);
  return {
    theme: id,
    group: context.group ?? k('group'),
    groups: context.groups ?? k('groups'),
    itemA: context.itemA ?? k('itemA'),
    itemB: context.itemB ?? k('itemB'),
    itemsA: context.itemsA ?? k('itemsA'),
    itemsB: context.itemsB ?? k('itemsB'),
    // les formes DÉFINIES (« الكرات », « الزهرات الحمراء ») pour une phrase arabe correcte (2026-11-09) — repli : la forme nue
    theA: context.theA ?? t(`manipulation.themes.${id}.theA`, { defaultValue: context.itemsA ?? k('itemsA') }),
    theB: context.theB ?? t(`manipulation.themes.${id}.theB`, { defaultValue: context.itemsB ?? k('itemsB') }),
    theGroups: context.theGroups ?? t(`manipulation.themes.${id}.theGroups`, { defaultValue: context.groups ?? k('groups') }),
    scene: k('scene'),
    leftover: k('leftover'),
    allUsed: k('allUsed'),
    // Le GESTE des groupes : d'où l'on tire une mission vide, et ses verbes.
    stock: context.stock ?? k('stock'),
    add: context.add ?? k('add'),
    remove: context.remove ?? k('remove'),
    more: (n) => t('manipulation.themes.more', { count: n }),
  };
}
