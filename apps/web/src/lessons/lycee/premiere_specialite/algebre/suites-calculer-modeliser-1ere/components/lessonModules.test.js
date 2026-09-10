/**
 * CHAQUE FICHIER DE LA LEÇON S'IMPORTE VRAIMENT.
 *
 * Pourquoi ce test existe : tant que `routes.jsx` n'est pas branché dans
 * App.jsx, la leçon est EXCLUE du bundle — `vite build` passe au vert sans
 * jamais avoir transformé un seul de ses modules. Une faute de frappe dans un
 * import, un composant appelé sous un mauvais nom, un `export default`
 * manquant : rien de tout cela ne serait vu avant la première ouverture de la
 * page par un élève.
 *
 * Le test importe donc les dix-huit fichiers et vérifie qu'ils exportent bien
 * ce que `routes.jsx` et les modules attendent d'eux.
 */
import { describe, it, expect } from 'vitest';

const MODULES = import.meta.glob('../modules/Module*.jsx');
const COMPOSANTS = import.meta.glob('./*.jsx');

describe('la leçon entière s’importe — le bundle ne la voit pas encore', () => {
  it('les huit modules exportent un composant par défaut', async () => {
    const chemins = Object.keys(MODULES).sort();
    expect(chemins).toHaveLength(8);
    for (const chemin of chemins) {
      const mod = await MODULES[chemin]();
      expect(typeof mod.default, chemin).toBe('function');
    }
  }, 30000);   // huit modules et tout le kit : sous charge, 5 s ne suffisent pas

  it('les quatre composants de la leçon exportent un composant par défaut', async () => {
    const chemins = Object.keys(COMPOSANTS).sort();
    expect(chemins).toHaveLength(4);
    for (const chemin of chemins) {
      const mod = await COMPOSANTS[chemin]();
      expect(typeof mod.default, chemin).toBe('function');
    }
  }, 30000);

  it('routes.jsx, index.jsx, knowledge.jsx et la config s’accordent', async () => {
    const [routes, index, knowledge, config, ctx] = await Promise.all([
      import('../routes.jsx'),
      import('../index.jsx'),
      import('../knowledge.jsx'),
      import('../lesson.config.js'),
      import('../moduleContext.js'),
    ]);
    expect(typeof routes.default).toBe('function');
    expect(typeof index.default).toBe('function');

    const { LESSON_CONFIG, LESSON_BASE_PATH } = config;
    expect(LESSON_BASE_PATH).toBe('/courses/lycee/premiere_specialite/algebre/suites-calculer-modeliser-1ere');
    // LESSON_BASE_PATH doit se terminer par l'id : un écart renvoie l'élève à
    // l'accueil avec toutes les gardes au vert.
    expect(LESSON_BASE_PATH.endsWith(`/${LESSON_CONFIG.id}`)).toBe(true);
    expect(LESSON_CONFIG.grade).toBe('premiere_specialite');
    expect(ctx.MODULE_CTX.gradeId).toBe('premiere_specialite');
    expect(ctx.MODULE_CTX.gradeLabel).toBe('Première');

    // La durée catalogue, à la minute près.
    const total = LESSON_CONFIG.modules.reduce((s, m) => s + m.estimatedMin, 0);
    expect(total).toBe(LESSON_CONFIG.estimatedDurationMin);
    expect(total).toBe(80);

    // Stages NON DÉCROISSANTS.
    const ordre = ['prerequisite_check', 'trigger', 'discovery', 'manipulation', 'practice_lab', 'evaluation'];
    const rangs = LESSON_CONFIG.modules.map((m) => ordre.indexOf(m.stage));
    expect(rangs.every((r) => r >= 0)).toBe(true);
    for (let i = 1; i < rangs.length; i += 1) {
      expect(rangs[i], `module ${i} : ${LESSON_CONFIG.modules[i].stage}`).toBeGreaterThanOrEqual(rangs[i - 1]);
    }

    // Chaque module a un fichier, et chaque fichier un module.
    const numerosFichiers = Object.keys(MODULES)
      .map((c) => Number(c.match(/Module(\d+)/)[1])).sort((a, b) => a - b);
    expect(numerosFichiers).toEqual(LESSON_CONFIG.modules.map((m) => m.number));

    // Chaque brique de knowledge.jsx appartient à un module qui existe.
    const numerosModules = new Set(LESSON_CONFIG.modules.map((m) => m.number));
    for (const clef of Object.keys(knowledge.LESSON_KNOWLEDGE.modules)) {
      expect(numerosModules.has(Number(clef)), `brique de module ${clef}`).toBe(true);
    }
  }, 30000);

  it('les six LP du catalogue sont ceux du boss, en littéraux', async () => {
    const source = await import('../modules/Module07MissionFinaleLeSautEtLeTotal.jsx?raw');
    for (let i = 1; i <= 6; i += 1) {
      const id = `premiere_specialite_suites-calculer-modeliser-1ere_P${i}`;
      expect(source.default.includes(id), id).toBe(true);
      // ET une épreuve dont learningPointIds vaut EXACTEMENT [ce LP] : sans
      // elle, le profil de maîtrise du boss n'est pas interprétable.
      expect(source.default.includes(`learningPointIds: ['${id}'] }`), `${id} seul`).toBe(true);
    }
  });
});
