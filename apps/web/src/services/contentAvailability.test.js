import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, '../..');
const read = (p) => readFileSync(resolve(webRoot, p), 'utf8');

/**
 * L'autorité de publication vue du frontend.
 *
 * Ces vérifications portent sur la STRUCTURE : que la décision vienne bien du
 * serveur, et que l'interface s'y aligne au lieu de s'appuyer uniquement sur
 * le catalogue embarqué. La preuve fonctionnelle vit côté backend
 * (PublicationAccessMatrixTest) — c'est lui l'autorité.
 */
describe('l’autorité de publication côté élève', () => {
  it('la carte de cours consulte le serveur, pas seulement le bundle', () => {
    const source = read('src/components/student/LessonCard.jsx');
    expect(source).toContain('useContentAvailability');
    // Le statut du catalogue ne suffit plus à lui seul.
    expect(source).toMatch(/isAvailable\s*=\s*lesson\.status === 'available' && !isLessonClosed/);
  });

  it('la feuille de route d’une leçon verrouille un module retiré', () => {
    const source = read('src/lessons/common/components/LessonIndex.jsx');
    expect(source).toContain('isModuleClosed(config.id, module.number)');
  });

  it('le contexte reste OUVERT tant que la réponse n’est pas arrivée', () => {
    // Politique délibérée : verrouiller sur une requête en vol enfermerait
    // l'élève hors de son parcours pour une raison purement technique. Le
    // serveur refuse de toute façon toute écriture.
    const source = read('src/context/ContentAvailabilityContext.jsx');
    expect(source).toContain('isLessonClosed: () => false');
    expect(source).toMatch(/catch\(\(\) => \{/);
  });

  it('l’inventaire est une liste de FERMETURES, pas d’ouvertures', () => {
    // Envoyer « voici les 132 leçons ouvertes » ferait de la base une
    // seconde définition du catalogue, qui dériverait.
    const source = read('src/services/contentAvailabilityService.js');
    expect(source).toContain('/content/availability');
    expect(source).toContain('data.closed');
  });

  it('l’inventaire des exercices vient du registre, pas des fichiers embarqués', () => {
    const source = read('src/services/contentAvailabilityService.js');
    expect(source).toContain('/exercises');
    expect(source).toContain('fetchLessonExercises');
  });

  it('le fournisseur est monté sous AuthProvider (il lui faut le jeton)', () => {
    const app = read('src/App.jsx');
    const auth = app.indexOf('<AuthProvider>');
    const avail = app.indexOf('<ContentAvailabilityProvider>');
    expect(auth).toBeGreaterThan(-1);
    expect(avail).toBeGreaterThan(auth);
  });
});

describe('le cadre de page partagé n’a pas régressé', () => {
  it('garde les gouttières 20/40/60', () => {
    const css = read('src/index.css');
    const frame = css.slice(css.indexOf('.sa-page {'));
    expect(frame).toMatch(/padding-left: 20px/);
    expect(frame).toMatch(/padding-left: 40px/);
    expect(frame).toMatch(/padding-left: 60px/);
  });

  const PAGES = [
    ['Courses', 'src/pages/Courses.jsx'],
    ['Lesson Index', 'src/lessons/common/components/LessonIndex.jsx'],
    ['Module', 'src/lessons/common/components/ModuleLayout.jsx'],
    ['Exercice', 'src/pages/student/practice/PracticeSession.jsx'],
    ['Espace pratique', 'src/pages/student/practice/PracticeHub.jsx'],
    ['Progression', 'src/pages/student/Progression.jsx'],
    ['Espace', 'src/pages/student/StudentHome.jsx'],
    ['Profil', 'src/pages/student/Profil.jsx'],
  ];

  it.each(PAGES)('%s utilise .sa-page', (_label, file) => {
    expect(read(file)).toContain('sa-page');
  });

  it('l’administration partage le même cadre', () => {
    expect(read('src/components/admin/AdminPage.jsx')).toContain('sa-page');
  });
});

describe('la redirection après connexion', () => {
  it('envoie l’admin vers /admin et l’élève vers /espace', () => {
    const source = read('src/pages/Login.jsx');
    expect(source).toMatch(/role === 'admin'.*'\/admin'/s);
    expect(source).toMatch(/role === 'student'.*'\/espace'/s);
  });
});
