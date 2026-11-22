import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import '../../../i18n';
import CompassHomeSections from './CompassHomeSections';

// The delivered net and school year are EMPTY until Stage 2: the page is rendered on the neutral compass fixture.
vi.mock('@smarter-academy/core/curriculum/fr/net/learningNet.js', async (importOriginal) =>
  (await import('../../compass/test/compassFixture.js')).mockLearningNet(importOriginal));
vi.mock('@smarter-academy/core/compass/scope.js', async (importOriginal) =>
  (await import('../../compass/test/compassFixture.js')).mockScope(importOriginal));
vi.mock('@smarter-academy/core/curriculum/fr/calendar/schoolCalendar.js', async (importOriginal) =>
  (await import('../../compass/test/compassFixture.js')).mockSchoolCalendar(importOriginal));

const TODAY = '2026-11-16';
const RESUME = { course: { id: 'l1', title: 'Leçon l1' }, progress: 40, resumePath: '/courses/x' };
const AVAIL = { '3e.m1.r02': [1, 2], '3e.m1.r01': [1, 2] };

function render(compass, extra = {}) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <CompassHomeSections compass={compass} gradeId="3e" today={TODAY} resume={RESUME} visits={{}} classroom={null}
        challenge={<a href="/espace/defi" data-challenge>defi</a>} {...extra} />
    </MemoryRouter>,
  );
}

const LAST = {
  uuid: 'u', finishedAt: '2026-11-15T10:00:00Z', pointerLesson: 'l2',
  targets: ['3e.m1.r01', '3e.m1.r02'],
  answers: [
    { itemId: '3e.m1.r01', level: 1, correct: true, unsure: false },
    { itemId: '3e.m1.r02', level: 1, correct: false, unsure: false },
    { itemId: '3e.m1.r01', level: 2, correct: true, unsure: false },
    { itemId: '3e.m1.r02', level: 1, correct: false, unsure: false },
  ],
  bands: { '3e.m1.r01': 'solid', '3e.m1.r02': 'start' },
};

describe('CompassHomeSections — l’accueil mené par Ma boussole', () => {
  it('jamais fait : UNE carte « Sache d’où tu pars » et un lien vers la leçon, rien d’autre', () => {
    const html = render({ enabled: true, active: null, last: null, availability: AVAIL });
    expect(html).toContain('data-compass-hero="new"');
    expect(html).toContain('Sache d’où tu pars');
    expect(html).toContain('data-compass-or-lesson');
    expect(html).not.toContain('data-challenge');
    expect(html).not.toContain('data-compass-week');
  });

  it('jauge en cours : « Continue ton tour de départ », puis la leçon et le défi', () => {
    const html = render({ enabled: true, active: { ...LAST, finishedAt: null, bands: undefined }, last: null, availability: AVAIL });
    expect(html).toContain('data-compass-hero="active"');
    expect(html).toContain('data-compass-lesson');
    expect(html).toContain('data-challenge');
  });

  it('après la jauge : la tâche du jour, la semaine, les bandes du serveur, l’année et la reprise', () => {
    const html = render({ enabled: true, active: null, last: LAST, availability: AVAIL, nextRetakeAt: '2026-11-22T10:00:00Z' });
    expect(html).toContain('data-compass-hero="today"');
    expect(html).toContain('data-compass-week');
    expect(html).toContain('data-compass-map');
    expect(html).toContain('data-compass-year');
    expect(html).toContain('data-compass-retake="later"');
    expect(html).toContain('Leçon l2');
  });

  it('jauge pas encore ouverte : la même page sans la jauge — leçon, défi, bande de l’année', () => {
    const html = render({ enabled: false });
    expect(html).toContain('data-compass-home="off"');
    expect(html).toContain('data-compass-lesson');
    expect(html).toContain('data-challenge');
    expect(html).toContain('data-compass-year');
    expect(html).not.toContain('data-compass-hero');
  });

  it('une tâche dont la leçon a été ouverte après la jauge est cochée', () => {
    const html = render({ enabled: true, active: null, last: LAST, availability: AVAIL }, {
      visits: { l2: Date.parse('2026-11-16T08:00:00Z') },
    });
    expect(html).toContain('data-week-task="done"');
  });
});
