import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import OpenerFigure from './OpenerFigure';

it('la figure de la page d\'unité montre مقام الشهيد avec « ? » et x, sans la hauteur', () => {
  const html = renderToString(<OpenerFigure />);
  expect(html).toContain('data-landmark="maqam"');
  expect(html).toContain('2,30m');
  expect(html).toContain('95,65m');
  expect(html).toContain('2,45m');
  expect(html).not.toMatch(/92[,.]?\d*\s?m/);
});
