import { describe, it, expect } from 'vitest';
import { cumulativeKnowledge, allKnowledge, knowledgeModuleNumbers, groupByCategory, toModuleSet, findKnowledgeItem } from './knowledgeState';

const K = {
  modules: {
    1: [{ id: 'a', type: 'concepts', title: 'A' }, { id: 'm', type: 'memoriser', title: 'M' }],
    2: [{ id: 'b', type: 'regles', title: 'B' }],
    3: [{ id: 'c', type: 'methodes', title: 'C' }, { id: 'a', type: 'concepts', title: 'A bis (doublon)' }],
    7: [],
  },
};
const CATS = [{ id: 'concepts' }, { id: 'regles' }, { id: 'methodes' }, { id: 'memoriser' }];

describe('cumulativeKnowledge — réducteur module → carte', () => {
  it('leçon non commencée : carte vide', () => {
    expect(cumulativeKnowledge(K, [])).toEqual([]);
    expect(cumulativeKnowledge(K, null)).toEqual([]);
  });

  it('accumule module par module, dans l’ordre de découverte', () => {
    expect(cumulativeKnowledge(K, [1]).map((i) => i.id)).toEqual(['a', 'm']);
    expect(cumulativeKnowledge(K, [1, 2]).map((i) => i.id)).toEqual(['a', 'm', 'b']);
    expect(cumulativeKnowledge(K, [1, 2, 3]).map((i) => i.id)).toEqual(['a', 'm', 'b', 'c']);
  });

  it('ne révèle jamais un module non validé (pas de spoiler)', () => {
    const ids = cumulativeKnowledge(K, [1]).map((i) => i.id);
    expect(ids).not.toContain('b');
    expect(ids).not.toContain('c');
  });

  it('appartenance, pas « max atteint » : un module sauté reste absent', () => {
    expect(cumulativeKnowledge(K, [1, 3]).map((i) => i.id)).toEqual(['a', 'm', 'c']);
  });

  it('accepte les numéros sous forme de chaînes (format useProgress)', () => {
    expect(cumulativeKnowledge(K, ['0', '1', '2']).map((i) => i.id)).toEqual(['a', 'm', 'b']);
    expect(toModuleSet(['1', 2, 'x'])).toEqual(new Set([1, 2]));
  });

  it('un même id n’apparaît qu’une fois : le premier module gagne', () => {
    const items = cumulativeKnowledge(K, [1, 2, 3]);
    expect(items.filter((i) => i.id === 'a')).toHaveLength(1);
    expect(items.find((i) => i.id === 'a').title).toBe('A');
  });

  it('étiquette chaque item avec son module et signale les nouveautés', () => {
    const items = cumulativeKnowledge(K, [1, 2], [2]);
    expect(items.find((i) => i.id === 'a')).toMatchObject({ module: 1, isNew: false });
    expect(items.find((i) => i.id === 'b')).toMatchObject({ module: 2, isNew: true });
  });

  it('ignore un module sans contribution et des modules inconnus', () => {
    expect(cumulativeKnowledge(K, [7, 42])).toEqual([]);
    expect(knowledgeModuleNumbers(K)).toEqual([1, 2, 3, 7]);
  });

  it('allKnowledge = carte complète ; groupByCategory omet les catégories vides', () => {
    expect(allKnowledge(K).map((i) => i.id)).toEqual(['a', 'm', 'b', 'c']);
    const groups = groupByCategory(cumulativeKnowledge(K, [1]), CATS);
    expect(groups.map((g) => g.category.id)).toEqual(['concepts', 'memoriser']);
  });
});

describe('déblocage par item — <KnowledgeBrick> pose une connaissance en cours de module', () => {
  it('une brique fait entrer SON item dans la carte, avant la fin de son module', () => {
    const items = cumulativeKnowledge(K, [1], [], ['b']);
    expect(items.map((i) => i.id)).toEqual(['a', 'm', 'b']);
    expect(items.find((i) => i.id === 'b')).toMatchObject({ module: 2, isNew: true });
  });

  it('ne fait entrer que l’item établi : aucun de ses voisins ne fuite', () => {
    const ids = cumulativeKnowledge(K, [], [], ['b']).map((i) => i.id);
    expect(ids).toEqual(['b']);
  });

  it('un id inconnu est ignoré', () => {
    expect(cumulativeKnowledge(K, [1], [], ['inexistant']).map((i) => i.id)).toEqual(['a', 'm']);
  });

  it('un item déjà acquis par son module validé n’est pas re-signalé « nouveau »', () => {
    const items = cumulativeKnowledge(K, [1, 2], [], ['b']);
    expect(items.find((i) => i.id === 'b')).toMatchObject({ module: 2, isNew: false });
  });

  it('déduplication : le premier module déclarant gagne, même sur un déblocage par item', () => {
    const items = cumulativeKnowledge(K, [3], [], ['a']);
    expect(items.filter((i) => i.id === 'a')).toHaveLength(1);
    expect(items.find((i) => i.id === 'a')).toMatchObject({ module: 1, title: 'A' });
  });

  it('sans quatrième argument, le comportement est inchangé', () => {
    expect(cumulativeKnowledge(K, [1, 2], [2])).toEqual(cumulativeKnowledge(K, [1, 2], [2], []));
    expect(cumulativeKnowledge(K, [1]).map((i) => i.id)).toEqual(['a', 'm']);
  });

  it('findKnowledgeItem rend l’item et son module ; null si inconnu', () => {
    expect(findKnowledgeItem(K, 'a')).toMatchObject({ id: 'a', module: 1, title: 'A' });
    expect(findKnowledgeItem(K, 'c')).toMatchObject({ id: 'c', module: 3 });
    expect(findKnowledgeItem(K, 'inexistant')).toBeNull();
    expect(findKnowledgeItem(K, '')).toBeNull();
  });
});
