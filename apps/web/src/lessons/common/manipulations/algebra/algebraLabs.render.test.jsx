import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import PitchExpansion from './PitchExpansion';
import TurfFactoring from './TurfFactoring';

it('les deux labs de l’unité 3 se rendent pour chaque nature de produit et chaque mode', () => {
  for (const expr of ['3|x+5', '3x-1|3+x', 'x+3', 'x-2', 'x+3|x-3', '2x+5|2x-5', '2x-1|x+4', 'x+10+x']) {
    const html = renderToString(<PitchExpansion expr={expr} />);
    expect(html).toContain('data-pitch-expansion');
  }
  expect(renderToString(<TurfFactoring mode="rows" expr="6x^2+4x" />)).toContain('data-turf-factoring');
  expect(renderToString(<TurfFactoring mode="square" b={6} c={9} />)).toContain('data-turf-square');
  expect(renderToString(<TurfFactoring mode="square" b={0} c={25} />)).toContain('data-turf-square');
});

it('turf rows ouvre sur un r affiché (jamais « ? ») qui n\'est pas un essai', () => {
  const html = renderToString(<TurfFactoring mode="rows" expr="6x^2+4x" />);
  expect(html).toContain('data-turf-field');
  expect(html).not.toContain('data-tried-r');
  expect(html).toContain('data-manipulation-autocomplete="ready"');
});
