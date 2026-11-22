import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import SheetLab from './SheetLab';
import ManipulationWorkspace from '../ManipulationWorkspace';
import manipulationAr from '../../../../i18n/locales/ar/lesson.manipulation.json';
import source from './SheetLab.jsx?raw';

/**
 * sheet-lab se rend à ses deux niveaux (cinq notes d'une mini-مسابقة, déjà saisies ; le تمرين 7 corrigé, à
 * saisir), seul et dans un workspace, sans clé i18n brute, avec la barre, les cartes, la ligne 1 sélectionnable,
 * les lignes d'indicateurs (A / B / C), le bloc « d'un seul regard » et le décor.
 */
it('sheet-lab se rend aux deux niveaux, sans clé brute', () => {
  const cases = [
    { cells: '5|8|6|9|7', ask: 'MAX-MIN|MOYENNE', n: 5, rows: 2, entered: 'true' },
    { cells: '4|10|8|4|3|2|4', ask: 'MAX-MIN|MEDIANE|MOYENNE|MODE', chart: 'bars|pie|histogram', entry: 'type', n: 7, rows: 4, entered: 'false' },
  ];
  for (const c of cases) {
    const html = renderToString(<SheetLab {...c} />);
    expect(html).toContain('data-sheet-lab');
    expect(html).toContain('data-sh-glance');
    expect(html).toContain('data-sh-bar');
    expect(html).toContain('data-sh-enter');
    expect(html).toContain('data-sh-grid');
    expect((html.match(/data-sh-cell="/g) ?? []).length).toBe(c.n);
    expect((html.match(/data-sh-row="/g) ?? []).length).toBe(c.rows);
    expect((html.match(/data-sh-hand="/g) ?? []).length).toBe(c.rows);
    expect(html).toContain(`data-entered="${c.entered}"`);
    expect(html).toContain('data-sh-card="MAX-MIN"');
    expect(html).toContain('data-deco="screen"');
    expect(html).toContain('data-deco="cursor"');
    expect(html).toContain('data-lab-fold="sheet-lab.trials"');
    expect(html).toContain('dir="ltr"');
    expect(html).not.toMatch(/manipulation\.[a-zA-Z]/);
    expect(html).not.toContain('katex'); // les دساتير ne passent jamais par KaTeX
  }
});

it('sheet-lab se rend dans un workspace à deux niveaux', () => {
  const html = renderToString(
    <ManipulationWorkspace
      defaultLevel="advanced"
      levels={{
        beginner: () => <SheetLab level="beginner" cells="5|8|6|9|7" ask="MAX-MIN|MOYENNE" />,
        advanced: () => <SheetLab level="advanced" cells="4|10|8|4|3|2|4" ask="MAX-MIN|MEDIANE|MOYENNE|MODE" chart="bars|pie|histogram" entry="type" />,
      }}
    />,
  );
  expect((html.match(/data-sheet-lab/g) ?? []).length).toBe(2);
  expect(html).toContain('data-sh-card="MODE"');
});

it('une donnée de leçon fautive est une erreur au rendu', () => {
  expect(() => renderToString(<SheetLab cells="1|2|3" ask="MODE" />)).toThrow();
});

it('chaque clé que le composant lit existe (aucune clé brute à l’écran)', () => {
  const ns = manipulationAr.sheetLab;
  const own = [...source.matchAll(/\bk\('([a-zA-Z0-9_]+)'/g)].map((m) => m[1]);
  expect(own.length).toBeGreaterThan(30);
  for (const key of own) expect(ns[key], `manipulation.sheetLab.${key}`).toBeTypeOf('string');
  const dyn = [
    ...['enterFirst', 'pickRow', 'cellNumber', 'cellBounds', 'needHand', 'empty', 'noEquals', 'typedNumber', 'unknownFn', 'noRange', 'outsideRow', 'syntax', 'notYet'].map((r) => `r_${r}`),
    ...['range', 'median', 'mean', 'mode', 'max', 'min', 'sum', 'other'].map((x) => `kind_${x}`),
    'v_wrongFn', 'v_wrongRange', 'v_wrongBoth', 'v_wrongFnSame', 'v_wrongRangeSame', 'v_wrongBothSame', 'colCShort',
    ...['bars', 'pie', 'histogram'].flatMap((x) => [`ds_${x}`, `dsShort_${x}`, `chart_${x}`, `ok_${x}`]),
    'partial_pie', 'partial_cols',
    ...['noSelection', 'noValues', 'noLabels', 'bars_pie', 'bars_histogram', 'pie_bars', 'pie_histogram', 'histogram_bars', 'histogram_pie'].map((r) => `c_${r}`),
  ];
  for (const key of dyn) expect(ns[key], key).toBeTypeOf('string');
  // un دستور cité dans une phrase arabe est isolé LTR (LRI … PDI), jamais en KaTeX
  for (const [key, text] of Object.entries(ns).filter(([, v]) => typeof v === 'string')) {
    if (/=(MAX|MEDIANE|MOYENNE|MODE)\(/.test(text)) expect(text, key).toMatch(/⁦=[A-Z]/);
    expect(text, key).not.toMatch(/\$[^$]*(MOYENNE|MEDIANE|MAX\()/);
  }
});
