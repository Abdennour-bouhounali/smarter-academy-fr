import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import '../../../i18n';
import CompassHomeSections from './CompassHomeSections';

const TODAY = '2026-11-16';
const RESUME = { course: { id: 'talis-hisab-atwal', title: 'خاصية طالس' }, progress: 40, resumePath: '/courses/x' };
const AVAIL = { '4am.m1.r06': [1, 2], '4am.m1.r01': [1, 2] };

function render(compass, extra = {}) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <CompassHomeSections compass={compass} gradeId="4am" today={TODAY} resume={RESUME} visits={{}} classroom={null}
        challenge={<a href="/espace/defi" data-challenge>defi</a>} {...extra} />
    </MemoryRouter>,
  );
}

const LAST = {
  uuid: 'u', finishedAt: '2026-11-15T10:00:00Z', pointerLesson: 'jidhr-tarbii',
  targets: ['4am.m1.r01', '4am.m1.r06'],
  answers: [
    { itemId: '4am.m1.r01', level: 1, correct: true, unsure: false },
    { itemId: '4am.m1.r06', level: 1, correct: false, unsure: false },
    { itemId: '4am.m1.r01', level: 2, correct: true, unsure: false },
    { itemId: '4am.m1.r06', level: 1, correct: false, unsure: false },
  ],
  bands: { '4am.m1.r01': 'solid', '4am.m1.r06': 'start' },
};

describe('CompassHomeSections — l’accueil mené par بوصلتي', () => {
  it('jamais fait : UNE carte « اعرف من أين تنطلق » et un lien vers la leçon, rien d’autre', () => {
    const html = render({ enabled: true, active: null, last: null, availability: AVAIL });
    expect(html).toContain('data-compass-hero="new"');
    expect(html).toContain('اعرف من أين تنطلق');
    expect(html).toContain('data-compass-or-lesson');
    expect(html).not.toContain('data-challenge');
    expect(html).not.toContain('data-compass-week');
  });

  it('jauge en cours : « واصل جولة الانطلاق », puis la leçon et le défi', () => {
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
    expect(html).toContain('الجذر التربيعي لعدد موجب');
  });

  it('jauge pas encore ouverte (1AM–3AM) : la même page sans la jauge — leçon, défi, bande de l’année', () => {
    const html = render({ enabled: false });
    expect(html).toContain('data-compass-home="off"');
    expect(html).toContain('data-compass-lesson');
    expect(html).toContain('data-challenge');
    expect(html).toContain('data-compass-year');
    expect(html).not.toContain('data-compass-hero');
  });

  it('une tâche dont la leçon a été ouverte après la jauge est cochée', () => {
    const html = render({ enabled: true, active: null, last: LAST, availability: AVAIL }, {
      visits: { 'jidhr-tarbii': Date.parse('2026-11-16T08:00:00Z') },
    });
    expect(html).toContain('data-week-task="done"');
  });
});
