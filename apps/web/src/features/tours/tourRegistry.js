/**
 * Le REGISTRE des « جولة تعريفية » — une visite par page et par rôle.
 * Des DONNÉES seulement (ce fichier est dans le lot d'entrée) : les textes
 * vivent dans `i18n/locales/ar/tour.json` (namespace à la demande), sous
 * `<key>.<step.id>.title|body`, plus `ui.*` pour les boutons.
 *
 *   key      `<role>.<page>` — le rôle en préfixe ; c'est la clé que le
 *            serveur garde (table page_tours, PageTourController). Ne jamais
 *            renommer une clé publiée : la visite se rouvrirait pour tous.
 *   role     'student' | 'teacher'
 *   path     motif react-router de la page (correspondance exacte, sans la
 *            requête : /espace/atelier couvre aussi ?lab=…)
 *   page     À LA PLACE de `path` : la page déclare elle-même sa visite
 *            (`useDeclarePageTour(page, enabled)`), quand l'URL ne suffit pas
 *            — le premier module d'une leçon.
 *   steps    dans l'ordre de lecture. `target` = sélecteur CSS ; le premier
 *            élément VISIBLE l'emporte. Sans `target` : carte centrale.
 *            Une étape dont la cible manque (état vide, autre largeur
 *            d'écran) est sautée ; une visite sans aucune cible à l'écran
 *            n'est pas jouée et n'est pas close.
 *
 * Cibles : réutiliser d'abord un crochet `data-*` existant de la page
 * (`[data-home-hero]`) ; sinon poser `data-tour="<page>.<élément>"` sur
 * l'élément. `tourRegistry.test.js` vérifie que chaque cible existe dans le
 * code et que chaque étape a ses textes. Voir docs/architecture/PAGE_TOURS.md.
 */

// La navigation de l'espace : barre latérale (grand écran) ou barre du bas
// (téléphone) — StudentNavbar / TeacherNavbar posent le même crochet.
const NAV = '[data-tour="workspace.nav"]';
const REPLAY = '[data-tour-replay]';

// Pages partagées entre élève et enseignant (mêmes composants).
const CATALOGUE = {
  search: '[data-tour="catalogue.search"]',
  grades: '[data-tour="catalogue.grades"]',
  chapters: '[data-tour="catalogue.chapters"]',
  view: '[data-tour="catalogue.view"]',
  list: '[data-tour="catalogue.list"]',
};
const MATHLAB = {
  shared: '[data-ml-common-tools]',
  labs: '[data-ml-lab-choices]',
  labSwitch: '[data-ml-lab-switch]',
  tools: '[data-ml-lab-tools]',
  works: '[data-tour="mathlab.works"]',
};
const NOTEBOOK = {
  create: '[data-nb-new]',
  search: '[data-tour="notebook.search"]',
  tabs: '[data-tour="notebook.tabs"]',
  filters: '[data-tour="notebook.filters"]',
};

// Un module de leçon : visite DÉCLARÉE par ModuleLayout
// (`useDeclarePageTour('lesson-module', …)`) — l'URL d'un module change
// d'une leçon à l'autre, la page se reconnaît elle-même. Elle s'ouvre d'elle-
// même sur le PREMIER module (une fois par compte, toutes leçons confondues)
// et se rejoue depuis n'importe quel module.
const LESSON = {
  module: '[data-tour="lesson.module"]',
  progress: '[data-tour="lesson.progress"]',
  map: '[data-km-trigger]',
  notebook: '[data-nb-trigger="lesson"]',
  lab: '[data-ml-overlay-trigger]',
  moduleNav: '[data-tour="lesson.moduleNav"]',
};

// Le sommaire d'une leçon (LessonIndex) : déclaré aussi, `lesson-index`.
const LESSON_INDEX = {
  hero: '[data-tour="lesson-index.hero"]',
  tools: '[data-tour="lesson-index.tools"]',
  progress: '[data-tour="lesson-index.progress"]',
  structure: '[data-lesson-structure]',
  modules: '[data-tour="lesson-index.modules"]',
};
// La page d'une وحدة : trouvée par son chemin.
const UNIT_PATH = '/courses/:levelId/:gradeId/:chapterId/units/:unitId';
// La page de l'élève d'une unité convertie (UnitMissionView, 2026-11-09) a d'autres éléments : chaque cible élève vise les DEUX pages.
const UNIT = {
  objectives: '[data-tour="unit.objectives"], [data-unit-chip="goals"]',
  challenge: '[data-unit-challenge], [data-unit-challenge-card]',
  progress: '[data-tour="unit.progress"], [data-unit-done]',
  lesson: '[data-unit-lesson], [data-unit-path]',
  modules: '[data-lesson-modules]',
  actions: '[data-teacher-lesson-actions]',
};

export const PAGE_TOURS = [
  // ── ÉLÈVE ──────────────────────────────────────────────────────────────
  {
    key: 'student.home',
    role: 'student',
    path: '/espace',
    steps: [
      { id: 'welcome' },
      { id: 'next', target: '[data-home-hero]' },
      { id: 'challenge', target: '[data-daily-challenge-card]' },
      { id: 'stats', target: '[data-home-stats]' },
      { id: 'where', target: '[data-home-where]' },
      { id: 'nav', target: NAV },
      { id: 'replay', target: REPLAY },
    ],
  },
  {
    key: 'student.courses',
    role: 'student',
    path: '/espace/cours',
    steps: [
      { id: 'search', target: CATALOGUE.search },
      { id: 'chapters', target: CATALOGUE.chapters },
      { id: 'view', target: CATALOGUE.view },
      { id: 'list', target: CATALOGUE.list },
    ],
  },
  {
    key: 'student.challenge',
    role: 'student',
    path: '/espace/defi',
    steps: [
      { id: 'mission', target: '[data-tour="challenge.mission"]' },
      { id: 'start', target: '[data-challenge-intro] [data-start]' },
      { id: 'score', target: '[data-tour="challenge.score"]' },
      { id: 'history', target: '[data-tour="challenge.history"]' },
    ],
  },
  {
    key: 'student.explorer',
    role: 'student',
    path: '/espace/explorer',
    steps: [
      { id: 'search', target: CATALOGUE.search },
      { id: 'mygrade', target: '[data-tour="catalogue.mygrade"]' },
      { id: 'grades', target: CATALOGUE.grades },
      { id: 'chapters', target: CATALOGUE.chapters },
      { id: 'list', target: CATALOGUE.list },
    ],
  },
  {
    key: 'student.mathlab',
    role: 'student',
    path: '/espace/atelier',
    steps: [
      { id: 'shared', target: MATHLAB.shared },
      { id: 'labs', target: MATHLAB.labs },
      { id: 'labSwitch', target: MATHLAB.labSwitch },
      { id: 'tools', target: MATHLAB.tools },
      { id: 'works', target: MATHLAB.works },
    ],
  },
  {
    key: 'student.progression',
    role: 'student',
    path: '/espace/progression',
    steps: [
      { id: 'stats', target: '[data-tour="progression.stats"]' },
      { id: 'worknow', target: '[data-progression-work-now]' },
      { id: 'curriculum', target: '[data-progression-curriculum]' },
    ],
  },
  {
    key: 'student.notebook',
    role: 'student',
    path: '/espace/cahier',
    steps: [
      { id: 'create', target: NOTEBOOK.create },
      { id: 'search', target: NOTEBOOK.search },
      { id: 'tabs', target: NOTEBOOK.tabs },
      { id: 'filters', target: NOTEBOOK.filters },
    ],
  },
  {
    key: 'student.class',
    role: 'student',
    path: '/espace/qism',
    steps: [
      { id: 'current', target: '[data-qism-current]' },
      { id: 'recommendations', target: '[data-qism-recommendations]' },
      { id: 'join', target: '[data-tour="qism.join"]' },
    ],
  },
  {
    key: 'student.profile',
    role: 'student',
    path: '/espace/profil',
    steps: [
      { id: 'identity', target: '[data-tour="profile.identity"]' },
      { id: 'plan', target: '[data-tour="profile.plan"]' },
      { id: 'settings', target: '[data-settings-open="profile"]' },
    ],
  },

  {
    key: 'student.lesson',
    role: 'student',
    page: 'lesson-module',
    steps: [
      { id: 'welcome' },
      { id: 'module', target: LESSON.module },
      { id: 'progress', target: LESSON.progress },
      { id: 'map', target: LESSON.map },
      { id: 'notebook', target: LESSON.notebook },
      { id: 'lab', target: LESSON.lab },
      { id: 'moduleNav', target: LESSON.moduleNav },
    ],
  },

  // ── ENSEIGNANT ─────────────────────────────────────────────────────────
  {
    key: 'teacher.home',
    role: 'teacher',
    path: '/enseignant',
    steps: [
      { id: 'welcome' },
      { id: 'week', target: '[data-tour="teacher-home.week"]' },
      { id: 'newClass', target: '[data-new-class]' },
      { id: 'classes', target: '[data-tour="teacher-home.classes"]' },
      { id: 'nav', target: NAV },
      { id: 'replay', target: REPLAY },
    ],
  },
  {
    key: 'teacher.courses',
    role: 'teacher',
    path: '/enseignant/cours',
    steps: [
      { id: 'search', target: CATALOGUE.search },
      { id: 'grades', target: CATALOGUE.grades },
      { id: 'chapters', target: CATALOGUE.chapters },
      { id: 'list', target: CATALOGUE.list },
    ],
  },
  {
    key: 'teacher.mathlab',
    role: 'teacher',
    path: '/enseignant/atelier',
    steps: [
      { id: 'shared', target: MATHLAB.shared },
      { id: 'labs', target: MATHLAB.labs },
      { id: 'labSwitch', target: MATHLAB.labSwitch },
      { id: 'tools', target: MATHLAB.tools },
      { id: 'works', target: MATHLAB.works },
    ],
  },
  {
    key: 'teacher.notebook',
    role: 'teacher',
    path: '/enseignant/cahier',
    steps: [
      { id: 'create', target: NOTEBOOK.create },
      { id: 'search', target: NOTEBOOK.search },
      { id: 'tabs', target: NOTEBOOK.tabs },
    ],
  },
  {
    key: 'teacher.classes',
    role: 'teacher',
    path: '/enseignant/classes',
    steps: [
      { id: 'newClass', target: '[data-new-class]' },
      { id: 'card', target: '[data-class-card]' },
    ],
  },
  {
    key: 'teacher.class',
    role: 'teacher',
    path: '/enseignant/classes/:id',
    steps: [
      { id: 'join', target: '[data-join-access]' },
      { id: 'tabs', target: '[data-tour="class.tabs"]' },
      { id: 'students', target: '[data-tour="class.tabs"] [data-tab="students"]' },
      { id: 'learningPoints', target: '[data-tour="class.tabs"] [data-tab="learningPoints"]' },
      { id: 'lessons', target: '[data-tour="class.tabs"] [data-tab="lessons"]' },
    ],
  },
  {
    key: 'teacher.reviews',
    role: 'teacher',
    path: '/enseignant/tashih',
    steps: [
      { id: 'queue', target: '[data-review-queue]' },
      { id: 'filter', target: '[data-review-class-filter]' },
      { id: 'item', target: '[data-review-item]' },
      { id: 'send', target: '[data-review-send]' },
    ],
  },
  {
    key: 'teacher.plan',
    role: 'teacher',
    path: '/enseignant/offre',
    steps: [
      { id: 'current', target: '[data-current-plan]' },
      { id: 'howto', target: '[data-tour="plan.howto"]' },
      { id: 'seats', target: '[data-seat-plan]' },
      { id: 'code', target: '[data-activation-code]' },
    ],
  },
  {
    key: 'teacher.profile',
    role: 'teacher',
    path: '/enseignant/profil',
    steps: [
      { id: 'name', target: '[data-tour="teacher-profile.name"]' },
    ],
  },
  {
    key: 'teacher.lesson',
    role: 'teacher',
    page: 'lesson-module',
    steps: [
      { id: 'welcome' },
      { id: 'module', target: LESSON.module },
      { id: 'progress', target: LESSON.progress },
      { id: 'map', target: LESSON.map },
      { id: 'notebook', target: LESSON.notebook },
      { id: 'lab', target: LESSON.lab },
      { id: 'moduleNav', target: LESSON.moduleNav },
    ],
  },
  // ── SOMMAIRE DE LEÇON ET UNITÉ (les deux rôles) ───────────────────────
  {
    key: 'student.lesson-index',
    role: 'student',
    page: 'lesson-index',
    steps: [
      { id: 'hero', target: LESSON_INDEX.hero },
      { id: 'tools', target: LESSON_INDEX.tools },
      { id: 'progress', target: LESSON_INDEX.progress },
      { id: 'structure', target: LESSON_INDEX.structure },
      { id: 'modules', target: LESSON_INDEX.modules },
    ],
  },
  {
    key: 'teacher.lesson-index',
    role: 'teacher',
    page: 'lesson-index',
    steps: [
      { id: 'hero', target: LESSON_INDEX.hero },
      { id: 'tools', target: LESSON_INDEX.tools },
      { id: 'structure', target: LESSON_INDEX.structure },
      { id: 'modules', target: LESSON_INDEX.modules },
    ],
  },
  {
    key: 'student.unit',
    role: 'student',
    path: UNIT_PATH,
    steps: [
      { id: 'objectives', target: UNIT.objectives },
      { id: 'challenge', target: UNIT.challenge },
      { id: 'progress', target: UNIT.progress },
      { id: 'lesson', target: UNIT.lesson },
    ],
  },
  {
    key: 'teacher.unit',
    role: 'teacher',
    path: UNIT_PATH,
    steps: [
      { id: 'objectives', target: UNIT.objectives },
      { id: 'lesson', target: UNIT.lesson },
      { id: 'modules', target: UNIT.modules },
      { id: 'actions', target: UNIT.actions },
    ],
  },
];
