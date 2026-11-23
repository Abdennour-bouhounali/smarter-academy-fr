import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { allCourseLevels, getLessonPath } from '@smarter-academy/core';
import lessons3e from '@smarter-academy/core/curriculum/fr/lessons_3e_2026_2027.json';
import '../i18n';
import { AuthContext } from '../context/AuthContext';
import UnitPage from './UnitPage';
import MesCours from './student/MesCours';
import Progression from './student/Progression';
import StudentHome from './student/StudentHome';
import Explorer from './student/Explorer';
import Courses from './Courses';
import NoLessonYet from '../components/student/NoLessonYet';
import { earlierLessons } from '../features/classSession/knowledgeCards';
import { buildProgressionTree } from '../features/progression/buildProgressionTree';
import { applyProgressionView, DEFAULT_VIEW } from '../features/progression/progressionView';

// The 3e catalogue: 13 units; the lessons its file marks `available` are PUBLISHED (the first, 2026-11-23:
// `decomposer-en-facteurs-premiers`), every other one ANNOUNCED (`coming_soon`) and not built. 6e–4e: no lesson at all.
// PUBLISHED is read from the catalogue's own file, so the screens below are checked against it as lessons are published.
const PUBLISHED = lessons3e.lessons.filter((l) => l.status === 'available').map((l) => l.code);
const FIRST = 'decomposer-en-facteurs-premiers';
const grades = allCourseLevels.flatMap((l) => l.grades);
const g3 = grades.find((g) => g.id === '3e');
const units = g3.chapters.flatMap((c) => c.units);
const lessons = g3.chapters.flatMap((c) => c.lessons);

function render(ui, url, user) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[url]}>
      <AuthContext.Provider value={{ token: null, user }}>
        <Routes>
          <Route path="/courses/:levelId/:gradeId/:chapterId/units/:unitId" element={ui} />
          <Route path="*" element={ui} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('3e — a catalogue of coming-soon lessons and its first published one', () => {
  it('has 13 units, every lesson coming soon but the published one, and a lesson path for that one only', () => {
    expect(units).toHaveLength(13);
    expect(lessons).toHaveLength(60);
    expect(PUBLISHED).toContain(FIRST);
    expect(lessons.filter((l) => l.status === 'available').map((l) => l.id).sort()).toEqual([...PUBLISHED].sort());
    for (const l of lessons) {
      const published = PUBLISHED.includes(l.id);
      expect(l.status, l.id).toBe(published ? 'available' : 'coming_soon');
      expect(getLessonPath(l.id), l.id).toBe(published ? l.path : null);
    }
    for (const id of ['6e', '5e', '4e']) expect(grades.find((g) => g.id === id).chapters).toEqual([]);
  });

  it.each([
    ['student', { role: 'student', grade: '3e' }],
    ['teacher', { role: 'teacher' }],
  ])('unit page (%s): every lesson a non-clickable « coming soon » line with its learning points — the published one a link', (_, user) => {
    for (const unit of units) {
      const html = render(<UnitPage />, unit.path, user);
      expect(html, unit.id).toContain(`data-unit="${unit.id}"`);
      for (const l of [...unit.lessons, unit.synthesis]) {
        if (PUBLISHED.includes(l.id)) {
          expect(html, l.id).not.toContain(`data-lesson-draft="${l.id}"`);
          expect(html, l.id).toContain(`href="${l.path}"`);
        } else {
          expect(html, l.id).toContain(`data-lesson-draft="${l.id}"`);
          expect(html, l.id).not.toContain(`href="${l.path}"`);
        }
        for (const lp of l.learningPoints) expect(html, lp.id).toContain(lp.title.replace(/'/g, '&#x27;').replace(/\s+/g, ' '));
      }
    }
  });

  it('unit page: the chapter’s goals speak to the student (« je ») and, to a teacher, about his students (« vos élèves »)', () => {
    const unit = units[0];
    const asStudent = render(<UnitPage />, unit.path, { role: 'student', grade: '3e' });
    expect(asStudent).toContain('Ce que je vais apprendre dans ce chapitre');
    const asTeacher = render(<UnitPage />, unit.path, { role: 'teacher' });
    expect(asTeacher).toContain('Ce que vos élèves apprennent dans ce chapitre');
    expect(asTeacher).not.toContain('Ce que je vais apprendre');
  });

  it('lessons page of a 3e student: the units, not « no lesson yet »', () => {
    const html = render(<MesCours />, '/espace/cours', { role: 'student', grade: '3e' });
    expect(html).not.toContain('data-no-lesson-yet');
    for (const unit of units) expect(html, unit.id).toContain(`data-unit-group="${unit.id}"`);
    for (const l of lessons) expect(html).not.toContain(`href="${l.path}"`);
  });

  it.each(['6e', '5e', '4e'])('lessons page of a %s student: « no lesson yet »', (grade) => {
    const html = render(<MesCours />, '/espace/cours', { role: 'student', grade });
    expect(html).toContain('data-no-lesson-yet');
  });

  it('the announced notice leads to the lessons page; the empty one says « no lesson yet »', () => {
    const announced = render(<NoLessonYet announced />, '/espace', { role: 'student', grade: '3e' });
    expect(announced).toContain('data-lessons-announced');
    expect(announced).toContain('href="/espace/cours"');
    expect(render(<NoLessonYet />, '/espace', { role: 'student', grade: '6e' })).toContain('data-no-lesson-yet');
  });

  it('progress page: the 3e programme keeps every unit, each with its count of lessons in preparation', () => {
    const tree = buildProgressionTree(allCourseLevels, { lessons: [] }, [], { gradeId: '3e' });
    expect(tree.lessonCount).toBe(0);
    const shown = applyProgressionView(tree, DEFAULT_VIEW);
    const groups = shown.grades.flatMap((g) => g.fields.flatMap((f) => f.groups));
    expect(groups.map((g) => g.id).sort()).toEqual(units.map((u) => u.id).sort());
    // « n lessons + the synthesis · n + 1 in preparation ».
    for (const g of groups) expect(g.comingSoon, g.id).toBe(g.lessonCount + (g.hasSynthesis ? 1 : 0));
  });

  it('class session cards: a stub prerequisite is the competence itself, with no lesson and no link; a published one links', () => {
    for (const l of lessons) {
      for (const card of earlierLessons(l.id)) {
        expect(card.title, l.id).toBeTruthy();
        expect(card.path, `${l.id} ← ${card.code}`).toBe(PUBLISHED.includes(card.code) ? getLessonPath(card.code) : null);
      }
    }
    // the PGCD lesson's first card is the published decomposition lesson, with its link
    expect(earlierLessons('trouver-le-pgcd').find((c) => c.code === FIRST)?.path).toBe(getLessonPath(FIRST));
    const cards = earlierLessons('racine-carree-en-probleme');
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.every((c) => c.code === null)).toBe(true);
  });

  it('progress page of a 3e student: neither « lessons announced » nor « no lesson yet » (one is published); of a 6e student: « no lesson yet »', () => {
    const html3 = render(<Progression />, '/espace/progression', { role: 'student', grade: '3e' });
    expect(html3).not.toContain('data-lessons-announced');
    expect(html3).not.toContain('data-no-lesson-yet');
    const html6 = render(<Progression />, '/espace/progression', { role: 'student', grade: '6e' });
    expect(html6).toContain('data-no-lesson-yet');
    expect(html6).not.toContain('data-lessons-announced');
  });

  it('home of a 3e student: no « lessons announced » notice any more (one is published); of a 4e student: « no lesson yet »', () => {
    const html3 = render(<StudentHome />, '/espace', { role: 'student', grade: '3e' });
    expect(html3).not.toContain('data-lessons-announced');
    expect(html3).not.toContain('data-no-lesson-yet');
    expect(render(<StudentHome />, '/espace', { role: 'student', grade: '4e' })).toContain('data-no-lesson-yet');
  });

  it('a teacher’s catalogue opens on 3e (the grade whose lessons are announced) and shows its units', () => {
    const html = render(<Explorer />, '/enseignant/cours', { role: 'teacher' });
    for (const unit of units) expect(html, unit.id).toContain(`data-unit-group="${unit.id}"`);
    for (const l of lessons) expect(html).not.toContain(`href="${l.path}"`);
  });

  it('the /courses page of 3e shows its units; of 5e, « no lesson yet »', () => {
    const html3 = render(<Courses />, '/courses?level=college&grade=3e', { role: 'student', grade: '3e' });
    expect(html3).not.toContain('data-no-lesson-yet');
    for (const unit of units) expect(html3, unit.id).toContain(`data-unit-group="${unit.id}"`);
    for (const l of lessons) expect(html3).not.toContain(`href="${l.path}"`);
    expect(render(<Courses />, '/courses?level=college&grade=5e', { role: 'student', grade: '5e' })).toContain('data-no-lesson-yet');
  });
});
