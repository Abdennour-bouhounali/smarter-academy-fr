import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import OpenerFigure from './OpenerFigure';

it("la vignette de la page d'unité se rend : le مسبح, sans nombre ni texte", () => {
  const html = renderToString(<OpenerFigure />);
  expect(html).toContain('<svg');
  expect(html).toContain('aria-label="مسبح بلدي مغطّى"');
  expect(html).not.toMatch(/<text/);
});
