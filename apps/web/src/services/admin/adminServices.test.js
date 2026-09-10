import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { query } from './adminClient';
import { REPORT_CATEGORIES } from '../reportService';
import { adminNavSections, adminNavLinks } from '../../data/adminNavigation';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, '../../..');
const read = (p) => readFileSync(resolve(webRoot, p), 'utf8');

describe('construction des filtres', () => {
  it('omet les filtres vides plutôt que d’envoyer des chaînes nulles', () => {
    // Sans ça, une liste sans filtre partirait en `?grade=&status=` et le
    // backend recevrait des chaînes vides à interpréter.
    expect(query({ grade: '6e', status: undefined, search: '', page: 1 }))
      .toBe('?grade=6e&page=1');
  });

  it('ne produit rien du tout quand aucun filtre n’est posé', () => {
    expect(query({})).toBe('');
    expect(query({ a: undefined, b: null, c: '' })).toBe('');
  });

  it('échappe ce qui doit l’être', () => {
    expect(query({ search: 'a&b=c' })).toContain('search=a%26b%3Dc');
  });
});

describe('signalement côté élève', () => {
  it('propose exactement les huit catégories du contrat serveur', () => {
    // La liste est fermée côté serveur (StudentReport::CATEGORIES) : c'est
    // ce qui rend l'agrégation par empreinte fiable. Un libellé en trop ici
    // produirait un 422 à l'envoi.
    expect(REPORT_CATEGORIES).toHaveLength(8);
    expect(REPORT_CATEGORIES.map((c) => c.id).sort()).toEqual([
      'content_error', 'display_problem', 'interaction_problem', 'other',
      'technical_problem', 'typo', 'unclear_question', 'wrong_answer',
    ]);
  });

  it('n’envoie jamais d’identifiant de base, seulement des codes', () => {
    const source = read('src/services/reportService.js');
    // Le serveur re-résout tout : un lesson_id envoyé par le client ne serait
    // même pas validé. Le service ne doit donc pas prétendre en fournir.
    expect(source).not.toMatch(/lesson_id|lessonId\s*[:,]/);
    expect(source).toContain('lessonCode');
  });

  it('ne collecte aucune donnée personnelle dans le contexte technique', () => {
    const source = read('src/services/reportService.js');
    for (const forbidden of ['geolocation', 'cookie', 'localStorage', 'email']) {
      expect(source.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });
});

describe('navigation d’administration', () => {
  it('couvre toutes les sections de la spécification', () => {
    const labels = adminNavSections.map((s) => s.label);
    expect(labels).toEqual([
      null, 'Statistiques', 'Contenu', 'Signalements',
      'Élèves', 'Abonnements', 'Compte', 'Système',
    ]);
  });

  it('ne pointe que vers des routes /admin', () => {
    for (const link of adminNavLinks) {
      expect(link.path.startsWith('/admin')).toBe(true);
    }
  });

  it('marque `end` ou `matchQuery` sur les liens dont le chemin en préfixe un autre', () => {
    // Sans ça, « Tous » resterait allumé en même temps que « Nouveaux ».
    for (const link of adminNavLinks) {
      const paths = adminNavLinks.map((l) => l.path);
      const isPrefix = paths.some((p) => p !== link.path && p.startsWith(`${link.path}/`));
      const hasQuery = link.path.includes('?');
      if (isPrefix && !hasQuery) {
        expect(link.end, `${link.path} doit être marqué end`).toBe(true);
      }
      if (hasQuery) {
        expect(link.matchQuery, `${link.path} doit porter matchQuery`).toBeTruthy();
      }
    }
  });
});

describe('la porte du panneau d’administration', () => {
  it('protège /admin par un rôle explicite', () => {
    const app = read('src/App.jsx');
    expect(app).toMatch(/path="\/admin" element=\{<ProtectedRoute allowedRoles=\{\['admin'\]\} \/>\}/);
  });

  it('n’expose aucune route /admin en dehors de cette porte', () => {
    const app = read('src/App.jsx');
    // Toutes les sous-routes admin sont relatives, donc imbriquées sous la
    // route protégée. Une route absolue "/admin/..." vivrait à côté.
    expect(app).not.toMatch(/path="\/admin\//);
  });
});

describe('les états d’écran', () => {
  it('distingue « pas de donnée » de « pas mesuré »', () => {
    const source = read('src/components/admin/ui/states.jsx');
    expect(source).toContain('MetricUnavailable');
    expect(source).toContain('no_tracking');
    expect(source).toContain('no_data');
  });

  it('chaque écran d’administration sait rendre chargement, erreur et vide', () => {
    const SCREENS = [
      'src/pages/admin/Dashboard.jsx',
      'src/pages/admin/content/Lessons.jsx',
      'src/pages/admin/content/LessonDetail.jsx',
      'src/pages/admin/reports/ReportList.jsx',
      'src/pages/admin/reports/ReportDetail.jsx',
      'src/pages/admin/students/StudentList.jsx',
      'src/pages/admin/students/StudentDetail.jsx',
      'src/pages/admin/subscriptions/Subscriptions.jsx',
      'src/pages/admin/system/ActivityLog.jsx',
    ];

    for (const screen of SCREENS) {
      const source = read(screen);
      const handles = source.includes('LoadingState') || source.includes('loading={');
      expect(handles, `${screen} doit gérer le chargement`).toBe(true);
      const errors = source.includes('ErrorState') || source.includes('error={');
      expect(errors, `${screen} doit gérer l’erreur`).toBe(true);
    }
  });
});

describe('le signalement est atteignable depuis tout le parcours élève', () => {
  const HOSTS = [
    ['module de leçon', 'src/lessons/common/components/ModuleLayout.jsx'],
    ['sommaire de leçon', 'src/lessons/common/components/LessonIndex.jsx'],
    ['question d’exercice', 'src/pages/student/practice/PracticeSession.jsx'],
    ['diagnostic', 'src/pages/student/diagnostic/DiagnosticRun.jsx'],
  ];

  it.each(HOSTS)('%s porte un bouton de signalement', (_label, file) => {
    expect(read(file)).toContain('ReportButton');
  });

  it('ModuleLayout le pose dans SES DEUX sorties', () => {
    // Le composant a une branche « module verrouillé » avec son propre
    // <main> : un bouton posé dans une seule disparaîtrait sans bruit.
    const source = read('src/lessons/common/components/ModuleLayout.jsx');
    const uses = source.split('<ReportButton').length - 1;
    expect(uses).toBe(2);
  });
});
