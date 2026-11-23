import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import '../../../i18n';
import CompassHomeSections from './CompassHomeSections';
import { yearFor, yearStrip, teachingWeekNumber, milestone } from '../../compass/compassModel';

// The DELIVERED school year, not the fixture: the French calendar is not written yet (`start`/`end` null, no week).
// On 2026-11-23 the real home crashed here (« Cannot read properties of null (reading 'slice') » in <YearStrip>) and
// the student's space went blank. The day « Ma boussole » is switched on before stage 2D, it must still render.
const TODAY = '2026-11-23';
const RESUME = { course: { id: 'l1', title: 'Leçon l1' }, progress: 40, resumePath: '/courses/x' };

describe('CompassHomeSections on the empty French calendar', () => {
  it('the model answers « nothing » instead of throwing', () => {
    const year = yearFor('3e', TODAY);
    expect(year.calendar.start).toBeNull();
    expect(yearStrip(year, '3e', TODAY)).toEqual([]);
    expect(teachingWeekNumber(year, TODAY)).toBeNull();
    expect(milestone(year, '3e', TODAY)).toBeNull();
  });

  it('the « off » state renders the lesson, and no year strip, without crashing', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CompassHomeSections
          compass={{ enabled: false }}
          gradeId="3e"
          today={TODAY}
          resume={RESUME}
          visits={{}}
          classroom={null}
          challenge={null}
        />
      </MemoryRouter>,
    );
    expect(html).toContain('data-compass-home="off"');
    expect(html).toContain('data-compass-lesson');
    expect(html).not.toContain('data-compass-year');
  });
});
