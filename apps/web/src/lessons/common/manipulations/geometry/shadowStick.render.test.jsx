import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import ShadowStick from './ShadowStick';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * shadow-stick se rend aux deux niveaux de levels.js (bâton à 4 m ; le تحدّ, bâton à 10 m), seul et dans un
 * workspace, sans clé i18n brute, sans interpolation oubliée et sans la hauteur de la minaret écrite.
 */
const RAW = /manipulation\.[a-zA-Z]/;

describe('shadow-stick — rendu', () => {
  it('beginner: the minaret, the stick at 1 m, its shadow, the ground ruler, the stick handle', () => {
    const html = renderToString(<ShadowStick {...LEVELS['shadow-stick'].beginner.numbers} />);
    expect(html).toContain('data-shadow-stick');
    expect(html).toContain('data-sh-glance');
    expect(html).toContain('data-stage="stick"');
    expect(html).toContain('data-meets="false"');
    expect(html).toContain('data-sh-stick-handle="5"');
    expect(html).toContain('data-sh-tip="5"');
    expect(html).toContain('data-deco="minaret"');
    expect(html).not.toContain('data-sh-pole-handle');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('advanced (تحدّ): O at 11,6 m, the answer 7,25 nowhere on the first screen', () => {
    const html = renderToString(<ShadowStick {...LEVELS['shadow-stick'].advanced.numbers} />);
    expect(html).toContain('data-sh-tip="11,6"');
    expect(html).not.toContain('7,25');
    expect(html).not.toContain('7{,}25');
    expect(html).not.toMatch(RAW);
  });

  it('inside a workspace: both levels mounted, one selector', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <ShadowStick level="beginner" {...LEVELS['shadow-stick'].beginner.numbers} />,
        advanced: () => <ShadowStick {...LEVELS['shadow-stick'].advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-shadow-stick/g) ?? []).length).toBe(2);
    expect(html).not.toMatch(RAW);
  });
});
