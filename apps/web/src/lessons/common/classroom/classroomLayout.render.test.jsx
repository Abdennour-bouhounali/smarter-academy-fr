import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import ClassroomToolbar, { ClassroomNav } from './ClassroomToolbar';

/**
 * The class mode reads LEFT TO RIGHT: the step back is on the left, the step forward on the right, and the floating
 * column sits on the END edge (right), away from the student space's sidebar at the start edge (left).
 */
const css = readFileSync(new URL('./classroom.css', import.meta.url), 'utf8');
const rule = (selector) => {
  const at = css.indexOf(`${selector} {`);
  return at < 0 ? '' : css.slice(at, css.indexOf('}', at));
};

describe('class mode — left to right', () => {
  it('the bottom bar puts « previous » before « next »: back on the left, forward on the right', () => {
    const noop = () => {};
    const html = renderToStaticMarkup(
      <ClassroomNav onPrevious={noop} onNext={noop} onPreviousModule={noop} onNextModule={noop} />,
    );
    const at = (hook) => html.indexOf(hook);
    expect(at('data-classroom-nav-module="previous"')).toBeGreaterThan(-1);
    expect(at('data-classroom-nav-module="previous"')).toBeLessThan(at('data-classroom-nav-unit="previous"'));
    expect(at('data-classroom-nav-unit="previous"')).toBeLessThan(at('data-classroom-nav-unit="next"'));
    expect(at('data-classroom-nav-unit="next"')).toBeLessThan(at('data-classroom-nav-module="next"'));
  });

  it('the toolbar writes the scale the French way (« 110 % ») with no direction island', () => {
    const html = renderToStaticMarkup(
      <ClassroomToolbar title="Leçon" scope="lesson" scale={1.1} onScaleStep={() => {}} onExit={() => {}} />,
    );
    expect(html).toContain('110 %');
    expect(html).not.toMatch(/dir="(rtl|ltr)"/);
    // the exit closes the toolbar, at its END (right)
    expect(html.indexOf('data-classroom-exit')).toBeGreaterThan(html.indexOf('110 %'));
  });

  it('the floating button stands in the bottom-RIGHT corner, and the CSS holds no right-to-left rule', () => {
    const fab = rule('.sa-classroom-fab');
    expect(fab).toMatch(/right:\s*1\.5rem/);
    expect(fab).not.toMatch(/\bleft:/);
    expect(css).not.toMatch(/direction:\s*rtl|row-reverse|\[dir=["']?rtl/);
    expect(css).not.toMatch(/[\u0600-\u06FF]/);
  });
});
