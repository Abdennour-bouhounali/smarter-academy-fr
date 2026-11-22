import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../../../../i18n';
import OpenerFigure from './OpenerFigure';

it("la figure d'ouverture se rend seule, sans props", () => {
  const html = renderToString(<OpenerFigure />);
  expect(html).toContain('<svg');
  expect(html).toContain('الحي');
});
