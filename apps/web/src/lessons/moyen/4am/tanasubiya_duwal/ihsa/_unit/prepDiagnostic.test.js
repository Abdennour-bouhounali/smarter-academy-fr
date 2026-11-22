import { describe, it, expect } from 'vitest';

/**
 * Chaque leçon de l'unité ouvre sur « أستعدّ » (module 0, `prerequisite_check`),
 * et chaque affirmation dit d'où elle vient : l'élément « prep » du manuel pour les items
 * 1–4 du manuel (p. 91), `addition('prerequisite_diagnostic')` pour ceux de la
 * plateforme. Les `requires` littéraux sont vérifiés par l'audit des
 * dépendances (npm run audit:knowledge:gate) : ici, la forme des données.
 */
const configs = import.meta.glob('../*/lesson.config.js', { eager: true });
const contents = import.meta.glob('../*/content/textbook.js', { eager: true });
const modules = import.meta.glob('../*/modules/Module00Astaidd.jsx', { query: '?raw', import: 'default', eager: true });

const lessonOf = (path) => path.split('/')[1];
const LESSONS = Object.entries(configs).map(([path, mod]) => ({ id: lessonOf(path), config: mod.LESSON_CONFIG }));

describe('« أستعدّ » in every lesson of the unit', () => {
  it('finds the five lessons (4 + the synthesis)', () => {
    expect(LESSONS).toHaveLength(5);
  });

  it.each(LESSONS.map((l) => [l.id, l]))('%s opens on module 0 « أستعدّ »', (id, { config }) => {
    const first = config.modules[0];
    expect(first).toMatchObject({ number: 0, slug: 'astaidd', title: 'أستعدّ', stage: 'prerequisite_check', style: 'diagnostic' });
    expect(modules[`../${id}/modules/Module00Astaidd.jsx`]).toBeTruthy();
    expect(config.priorKnowledge.length).toBeGreaterThan(0);
  });

  it.each(LESSONS.map((l) => [l.id]))('%s: every item is sourced, typed and uses a declared skill', (id) => {
    const content = contents[`../${id}/content/textbook.js`];
    const items = [...(content.PREP_ITEMS ?? []), ...(content.PREP_PLATFORM_ITEMS ?? [])];
    const source = modules[`../${id}/modules/Module00Astaidd.jsx`];
    expect(items.length).toBeGreaterThanOrEqual(4);
    for (const it of items) {
      expect(typeof it.answer).toBe('boolean');
      expect(it.text.length).toBeGreaterThan(0);
      expect(it.why.length).toBeGreaterThan(0);
      expect(['textbook', 'platform_addition']).toContain(it.source?.type);
      if (it.source.type === 'textbook') expect(it.source.elementId).toBe('prep');
      // la compétence est déclarée dans `skills={{ … }}` du module
      expect(source).toMatch(new RegExp(`\\b${it.skill}: \\{ label:`));
    }
    // les deux réponses existent : un diagnostic « tout vrai » ne diagnostique rien
    expect(new Set(items.map((it) => it.answer)).size).toBe(2);
    // une question par item, chacune avec des `requires` littéraux
    expect((source.match(/\.\.\.prepQuestion\(/g) ?? []).length).toBe(items.length);
    expect((source.match(/requires: \['[a-z0-9-]+'\]/g) ?? []).length).toBe(items.length);
  });
});
