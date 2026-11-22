import { Sun, BookOpen, Users, FlaskConical } from 'lucide-react';

/**
 * The TEACHER's navigation: FOUR doors and the account menu under his picture (owner, 2026-11-16; plan
 * `docs/reports/NAVIGATION_REBUILD_PLAN.md`). DATA, like `data/studentNavigation.js`: the rail, the bottom bar and the
 * line of pages under a door read this file. `labelKey` → i18n `nav`.
 *
 * « Réponses à corriger » is no longer a menu entry: its count (`badge: 'reviews'`) shows on « Mes classes » and on its page line.
 * `rest: true` marks the door that stays lit on every other page of his space (a lesson and its tools).
 */
export const teacherDoors = [
  { id: 'today', labelKey: 'doors.today', icon: Sun, path: '/enseignant', end: true, pages: [] },
  {
    id: 'lessons',
    labelKey: 'doors.lessons',
    icon: BookOpen,
    path: '/enseignant/cours',
    match: ['/courses'],
    rest: true,
    pages: [],
  },
  {
    id: 'classes',
    labelKey: 'doors.classes',
    icon: Users,
    path: '/enseignant/classes',
    badge: 'reviews',
    pages: [
      { labelKey: 'myClasses', path: '/enseignant/classes' },
      { labelKey: 'answerReviews', path: '/enseignant/tashih', badge: 'reviews' },
      { labelKey: 'teacherGames', path: '/enseignant/jeux' },
    ],
  },
  {
    id: 'tools',
    labelKey: 'doors.tools',
    icon: FlaskConical,
    path: '/enseignant/atelier',
    pages: [
      { labelKey: 'mathLab', path: '/enseignant/atelier' },
      { labelKey: 'thinkingLab', path: '/enseignant/tafkir', feature: 'thinkingLab' },
      { labelKey: 'notebook', path: '/enseignant/cahier' },
    ],
  },
];

/** The account, not the work: reached from his picture, never from a door. */
export const teacherAccountLinks = [
  { labelKey: 'doors.account', path: '/enseignant/profil' },
  { labelKey: 'myPlan', path: '/enseignant/offre', paid: true },
  { labelKey: 'mySchool', path: '/enseignant/muassasa' },
];
