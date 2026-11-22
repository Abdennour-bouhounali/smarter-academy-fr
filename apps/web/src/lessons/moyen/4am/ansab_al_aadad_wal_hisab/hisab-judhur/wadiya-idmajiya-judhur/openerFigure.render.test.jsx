import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import OpenerFigure from './components/OpenerFigure';

it('the unit-page challenge figure renders the carpet with no measurement text', () => {
  const html = renderToString(<OpenerFigure />);
  expect(html).toContain('<svg');
  expect(html).not.toMatch(/<text/);
  expect(html.replace(/<[^>]*>/g, "")).toBe("");
});
