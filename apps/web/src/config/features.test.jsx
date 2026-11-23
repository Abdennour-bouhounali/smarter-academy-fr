import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import '../i18n';
import { AuthContext } from '../context/AuthContext';
import { features } from './features';
import { visibleDoors, visibleLinks } from '../data/doors';
import { studentDoors } from '../data/studentNavigation';
import { teacherDoors, teacherAccountLinks } from '../data/teacherNavigation';
import { adminNavSectionsFor } from '../data/adminNavigation';
import { navLinks } from '../data/navigation';
import { pathAfterGrade } from '../pages/student/ChooseGrade';
import StudentHome from '../pages/student/StudentHome';

// `on` switches a feature on for one test, as the day its French content exists.
const on = vi.hoisted(() => new Set());
vi.mock('./features', async (importOriginal) => {
  const real = await importOriginal();
  return { ...real, isFeatureOn: (name) => on.has(name) || real.isFeatureOn(name) };
});
afterEach(() => on.clear());

const src = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const pathsOf = (doors) => doors.flatMap((door) => [door.path, ...door.pages.map((page) => page.path)]);
const adminPaths = () => adminNavSectionsFor('admin').flatMap((section) => section.links.map((link) => link.path));

// Each off feature: the addresses of its doors, its admin pages, its public link.
const OFF = [
  { feature: 'books', student: [], teacher: [], admin: ['/admin/livres', '/admin/livres/commandes', '/admin/livres/messages', '/admin/livres/gestionnaires'], public: ['/books'] },
  { feature: 'thinkingLab', student: ['/espace/enigmes'], teacher: ['/enseignant/enigmes'], admin: [], public: [] },
  { feature: 'dailyChallenge', student: ['/espace/defi'], teacher: [], admin: ['/admin/offres/defi-quotidien'], public: [] },
  { feature: 'compass', student: [], teacher: [], admin: [], public: [] },
  { feature: 'diagnostic', student: [], teacher: [], admin: [], public: [] },
];

describe('config/features.js — what has no French content yet', () => {
  it('is frozen, one boolean per feature, all off today', () => {
    expect(Object.isFrozen(features)).toBe(true);
    expect(features).toEqual({ books: false, thinkingLab: false, dailyChallenge: false, compass: false, diagnostic: false });
  });

  it.each(OFF)('$feature off: no door, no menu entry, no admin page in the menu, no public link', (row) => {
    const student = pathsOf(visibleDoors(studentDoors));
    const teacher = pathsOf(visibleDoors(teacherDoors));
    for (const path of row.student) expect(student, path).not.toContain(path);
    for (const path of row.teacher) expect(teacher, path).not.toContain(path);
    for (const path of row.admin) expect(adminPaths(), path).not.toContain(path);
    for (const path of row.public) expect(navLinks.map((link) => link.path), path).not.toContain(path);
  });

  it.each(OFF)('$feature on: every entry comes back', (row) => {
    on.add(row.feature);
    for (const path of row.student) expect(pathsOf(visibleDoors(studentDoors)), path).toContain(path);
    for (const path of row.teacher) expect(pathsOf(visibleDoors(teacherDoors)), path).toContain(path);
    for (const path of row.admin) expect(adminPaths(), path).toContain(path);
  });

  it('every door stays, opening on a page that is shown — « Je m’entraîne » opens on the games while the challenge is off', () => {
    const doors = visibleDoors(studentDoors);
    expect(doors.map((door) => door.id)).toEqual(studentDoors.map((door) => door.id));
    const train = doors.find((door) => door.id === 'train');
    expect(train.path).toBe('/espace/jeux');
    expect(train.pages.map((page) => page.path)).toEqual(['/espace/jeux', '/espace/atelier']);
    expect(visibleDoors(teacherDoors).find((door) => door.id === 'tools').pages.map((page) => page.path)).toEqual([
      '/enseignant/atelier',
      '/enseignant/cahier',
    ]);
    on.add('dailyChallenge');
    expect(visibleDoors(studentDoors).find((door) => door.id === 'train').path).toBe('/espace/defi');
  });

  it('the spaces that stay on keep their doors: games, math lab, notebook, progression, class', () => {
    const student = pathsOf(visibleDoors(studentDoors));
    for (const path of ['/espace/jeux', '/espace/atelier', '/espace/cahier', '/espace/progression', '/espace/classe']) {
      expect(student).toContain(path);
    }
    const teacher = pathsOf(visibleDoors(teacherDoors));
    for (const path of ['/enseignant/jeux', '/enseignant/atelier', '/enseignant/cahier', '/enseignant/classes']) {
      expect(teacher).toContain(path);
    }
    expect(visibleLinks(teacherAccountLinks, { paymentsOpen: true }).map((link) => link.path)).toContain('/enseignant/etablissement');
  });

  it('the book manager, books off, is sent to his account — never back and forth to a store that is gone', () => {
    expect(adminNavSectionsFor('book_manager').map((section) => section.labelKey)).toEqual(['nav.account']);
    expect(src('../components/auth/AdminOnlyOutlet.jsx')).toMatch(/isFeatureOn\('books'\) \? BOOK_MANAGER_HOME : ACCOUNT_HOME/);
  });
});

describe('an off feature calls nothing on page load', () => {
  it('ChooseGrade no longer sends a new 6e student to the diagnostic', () => {
    expect(pathAfterGrade('6e')).toBe('/espace');
    expect(pathAfterGrade('3e')).toBe('/espace');
    on.add('diagnostic');
    expect(pathAfterGrade('6e')).toBe('/espace/diagnostic');
    expect(pathAfterGrade('3e')).toBe('/espace');
  });

  it('the student home asks for neither the compass nor the daily challenge, and is not left waiting for them', () => {
    const home = src('../pages/student/StudentHome.jsx');
    // The compass is read in ONE effect, which returns at once while the feature is off.
    const effects = home.split('useEffect(').slice(1).filter((chunk) => chunk.includes('fetchCompass('));
    expect(effects).toHaveLength(1);
    expect(effects[0]).toMatch(/if \(!token \|\| !compassOn\) return undefined;/);
    expect(home).toMatch(/useState\(!compassOn\)/);
    // The challenge card (which fetches today's challenge on mount) is not mounted at all.
    expect(home).toContain("challenge={isFeatureOn('dailyChallenge') ? <DailyChallengeCard /> : null}");

    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/espace']}>
        <AuthContext.Provider value={{ token: 't', user: { role: 'student', grade: '3e', first_name: 'A' } }}>
          <StudentHome />
        </AuthContext.Provider>
      </MemoryRouter>,
    );
    // Not « busy »: the home does not wait for an answer that will never be asked.
    expect(html).toContain('aria-busy="false"');
    expect(html).not.toContain('data-daily-challenge-card');
    // Nothing of the compass is rendered — not its « off » state, which reads the school calendar and drew the year
    // strip (the real home went blank on the empty French calendar, 2026-11-23): his lesson, the first of his grade.
    expect(home).toContain('{!compassOn ? (');
    expect(html).not.toContain('data-compass-home');
    expect(html).toContain('data-home-today');
    expect(html).toContain('href="/courses/college/3e/nombres_calculs/decomposer-en-facteurs-premiers"');
  });

  it('a class page has no daily-challenge tab (whose tab fetches the class’s challenge)', () => {
    const page = src('../pages/teacher/ClassGroupDetail.jsx');
    expect(page).toContain("tabs: [...(isFeatureOn('dailyChallenge') ? ['dailyChallenge'] : []), 'madar']");
  });

  it('the admin is offered no push topic and no access row for an off feature', () => {
    expect(src('../pages/admin/notifications/AdminNotifications.jsx')).toMatch(/filter\(shownTopic\)/);
    expect(src('../pages/admin/access/AccessLimits.jsx')).toMatch(/isFeatureOn\('thinkingLab'\) \? features\.find/);
  });
});
