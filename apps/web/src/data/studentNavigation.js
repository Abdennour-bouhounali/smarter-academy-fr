import { Sun, BookOpen, Target, UserRound } from 'lucide-react';

/**
 * The STUDENT's navigation: FOUR doors, named by what he wants (owner, 2026-11-16; plan
 * `docs/reports/NAVIGATION_REBUILD_PLAN.md`). It is DATA: the rail (tablet, laptop), the bottom bar (phone) and the
 * line of pages under a door (`DoorTabs`) all read this file, and no menu entry is written anywhere else.
 *
 * A door = `path` (where a tap goes), `pages` (what lives behind it, shown as one line on those pages) and `match`
 * (other addresses that keep the door lit). `labelKey` → i18n `nav`. A page with `feature` shows only while that
 * feature is on (`config/features.js`), one with `paid` only while payments are open — `visibleDoors` (data/doors.js)
 * is what the menus draw.
 */
export const studentDoors = [
  {
    id: 'today',
    labelKey: 'doors.today',
    icon: Sun,
    path: '/espace',
    end: true,
    match: ['/espace/boussole'],
    pages: [],
  },
  {
    id: 'lessons',
    labelKey: 'doors.lessons',
    icon: BookOpen,
    path: '/espace/cours',
    match: ['/courses', '/espace/revision'],
    pages: [
      { labelKey: 'myCourses', path: '/espace/cours' },
      { labelKey: 'explore', path: '/espace/explorer' },
    ],
  },
  {
    id: 'train',
    labelKey: 'doors.train',
    icon: Target,
    path: '/espace/defi',
    match: ['/espace/pratique'],
    pages: [
      { labelKey: 'dailyChallenge', path: '/espace/defi', feature: 'dailyChallenge' },
      { labelKey: 'madar', path: '/espace/jeux' },
      { labelKey: 'thinkingLab', path: '/espace/enigmes', feature: 'thinkingLab' },
      { labelKey: 'mathLab', path: '/espace/atelier' },
    ],
  },
  {
    id: 'me',
    labelKey: 'doors.me',
    icon: UserRound,
    path: '/espace/progression',
    match: ['/espace/activation'],
    pages: [
      { labelKey: 'progression', path: '/espace/progression' },
      { labelKey: 'notebook', path: '/espace/cahier' },
      { labelKey: 'myClass', path: '/espace/classe' },
      { labelKey: 'doors.account', path: '/espace/profil' },
    ],
  },
];
