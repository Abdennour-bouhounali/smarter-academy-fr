import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import OpenerFigure from './OpenerFigure';

it('OpenerFigure draws the table with both hidden values', () => {
  const html = renderToString(<OpenerFigure />);
  expect(html).toContain('عدد الميداليات الذهبية');
  expect(html).toContain('data-hidden-cell="1"');
  expect(html).toContain('data-hidden-cell="2"');
});
