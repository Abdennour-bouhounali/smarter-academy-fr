import { Sun, BookOpen, Target, UserRound } from 'lucide-react';

/**
 * The STUDENT's navigation: FOUR doors, named by what he wants (owner, 2026-11-16; plan
 * `docs/reports/NAVIGATION_REBUILD_PLAN.md`). It is DATA: the rail (tablet, laptop), the bottom bar (phone) and the
 * line of pages under a door (`DoorTabs`) all read this file, and no menu entry is written anywhere else.
 *
 * A door = `path` (where a tap goes), `pages` (what lives behind it, shown as one line on those pages) and `match`
 * (other addresses that keep the door lit). `labelKey` → i18n `nav`.
 */
export const studentDoors = [
  {
    id: 'today',
    labelKey: 'doors.today',
    icon: Sun,
    path: '/espace',
    end: true,
    match: ['/espace/bawsala'],
    pages: [],
  },
  {
    id: 'lessons',
    labelKey: 'doors.lessons',
    icon: BookOpen,
    path: '/espace/cours',
    match: ['/courses'],
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
      { labelKey: 'dailyChallenge', path: '/espace/defi' },
      { labelKey: 'madar', path: '/espace/jeux' },
      { labelKey: 'thinkingLab', path: '/espace/tafkir' },
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
      { labelKey: 'myClass', path: '/espace/qism' },
      { labelKey: 'doors.account', path: '/espace/profil' },
    ],
  },
];
