import { describe, it, expect } from 'vitest';

/**
 * Chaque leçon de l'unité ouvre sur « أستعدّ » (module 0, `prerequisite_check`),
 * et chaque affirmation dit d'où elle vient : l'élément « prep » du manuel pour les items
 * 1–10 du manuel (p. 19), `addition('prerequisite_diagnostic')` pour ceux de la
 * plateforme. Les `requires` littéraux sont vérifiés par l'audit des
 * dépendances (npm run audit:knowledge:gate) : ici, la forme des données.
 */
const configs = import.meta.glob('../*/lesson.config.js', { eager: true });
const contents = import.meta.glob('../*/content/textbook.js', { eager: true });
// Une leçon convertie au prototype de mission écrit SA propre échelle (content/prep.js › PREP_LADDER, du plus facile au plus difficile) : elle
// remplace alors les items du manuel dans le module, qui restent dans textbook.js comme source (même règle que l'unité 1).
const ladders = import.meta.glob('../*/content/prep.js', { eager: true });
const modules = import.meta.glob('../*/modules/Module00Astaidd.jsx', { query: '?raw', import: 'default', eager: true });
const routes = import.meta.glob('../*/routes.jsx', { query: '?raw', import: 'default', eager: true });

const lessonOf = (path) => path.split('/')[1];
const LESSONS = Object.entries(configs).map(([path, mod]) => ({ id: lessonOf(path), config: mod.LESSON_CONFIG }));
// A v2 lesson (LESSON_V2.md §2) has no « أستعدّ » page: its launch kit « عُدّة الانطلاق » measures what it needs. Its
// module 0 stays in the config as DATA (progress is stored by its number).
const isV2 = (id) => /retiredModules:\s*true/.test(routes[`../${id}/routes.jsx`] ?? '');
const ON_PAGES = LESSONS.filter((l) => !isV2(l.id));

describe('« أستعدّ » in every lesson of the unit', () => {
  it('finds the six lessons (5 + the synthesis)', () => {
    expect(LESSONS).toHaveLength(6);
  });

  it.each(LESSONS.map((l) => [l.id, l]))('%s opens on module 0 « أستعدّ »', (id, { config }) => {
    const first = config.modules[0];
    expect(first).toMatchObject({ number: 0, slug: 'astaidd', title: 'أستعدّ', stage: 'prerequisite_check', style: 'diagnostic' });
    expect(Boolean(modules[`../${id}/modules/Module00Astaidd.jsx`])).toBe(!isV2(id));
    expect(config.priorKnowledge.length).toBeGreaterThan(0);
  });

  it('the v2 lessons of the unit have no « أستعدّ » page left', () => {
    expect(LESSONS.filter((l) => isV2(l.id)).map((l) => l.id).sort()).toEqual(['jidhr-tarbii', 'natiqa-ghayr-natiqa']);
  });

  it.each(ON_PAGES.map((l) => [l.id]))('%s: every item is sourced, typed and uses a declared skill', (id) => {
    const content = contents[`../${id}/content/textbook.js`];
    const items = ladders[`../${id}/content/prep.js`]?.PREP_LADDER ?? [...(content.PREP_ITEMS ?? []), ...(content.PREP_PLATFORM_ITEMS ?? [])];
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
