import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const webRoot = resolve(__dirname, '../../..');
const read = (p) => readFileSync(resolve(webRoot, p), 'utf8');

/**
 * L'ISOLEMENT de la surface de QA.
 *
 * Elle monte les vrais composants du moteur pour qu'on puisse les regarder
 * sous RTL — mais elle ne doit atteindre ni un élève, ni un catalogue, ni une
 * des gardes d'intégration continue. Ces contrôles sont ce qui garantit
 * qu'elle reste un outil et ne devienne jamais du contenu.
 */
describe('surface de QA — isolement', () => {
  it('vit hors de src/lessons/, donc hors du registre et des gardes', () => {
    // registry.js parcourt `./**/lesson.config.js` SOUS src/lessons/ ;
    // check-routes, validate-lessons et check-dormant-isolation partent tous
    // du même dossier. Être ailleurs suffit à n'être vu par aucun d'eux.
    expect(existsSync(resolve(webRoot, 'src/qa/rtlLessonFixture'))).toBe(true);
    expect(existsSync(resolve(webRoot, 'src/lessons/qa'))).toBe(false);
  });

  it('ne contient aucun lesson.config.js', () => {
    // Le nom EXACT que cherche le glob du registre. Le fichier de la surface
    // s'appelle fixture.config.js précisément pour ne pas y répondre.
    const files = readdirSync(resolve(webRoot, 'src/qa/rtlLessonFixture'));
    expect(files).not.toContain('lesson.config.js');
    expect(files).toContain('fixture.config.js');
  });

  it('n’est montée que derrière une condition de construction', () => {
    const app = read('src/App.jsx');

    // La condition est LITTÉRALE — Vite remplace import.meta.env.* par des
    // constantes, donc Rollup peut prouver la branche morte et retirer le
    // fragment avec elle.
    expect(app).toContain('QA_FIXTURES_ENABLED');
    expect(app).toContain('import.meta.env.DEV');
    expect(app).toContain("import.meta.env.VITE_QA_FIXTURES === 'true'");

    // Et l'import est PARESSEUX : un import statique aurait suffi à garder le
    // module dans le lot d'entrée, Rollup ne pouvant pas prouver l'absence
    // d'effets de bord. Constaté en construisant : 'qa-rtl-fixture' se
    // retrouvait alors dans index-*.js.
    expect(app).toContain("import('./qa/rtlLessonFixture/FixtureRoutes.jsx')");
    expect(app).not.toMatch(/^import .* from '\.\/qa\//m);
  });

  it('n’apparaît dans aucun catalogue ni aucune navigation', () => {
    for (const file of [
      'src/data/studentNavigation.js',
      'src/data/navigation.js',
      'src/data/adminNavigation.js',
    ]) {
      expect(read(file)).not.toContain('__qa');
    }
  });

  it('ne prétend pas être du contenu du programme', () => {
    // La surface existe pour éprouver le MOTEUR. Si elle commençait à porter
    // des points d'apprentissage ou un code de leçon du catalogue, elle
    // deviendrait du contenu non validé servi par une porte dérobée.
    const config = read('src/qa/rtlLessonFixture/fixture.config.js');
    expect(config).not.toContain('learningPoints');
    expect(config).not.toContain('teachesLearningPointIds');
    expect(config).toContain('qa-rtl-fixture');
  });
});
