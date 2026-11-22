import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../../../../i18n';
import OpenerFigure from './OpenerFigure';

it('the unit-page figure draws the two runners\' routes, with no answer written on it', () => {
  const html = renderToString(<OpenerFigure />);
  expect(html).toContain('<svg');
  expect(html).not.toMatch(/3π|√13|9[,.]42|9[,.]96/);
});
