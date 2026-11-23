// « brevet blanc » — the box of a step is the practice space's OWN widget for its answer type (`ExamSitting.jsx › Field`,
// the table of `features/practice/QuestionRenderer.jsx`). A `factorization` step (a decomposition in prime factors, 3e)
// drew the number template (TemplateInput); it draws `FactorizationInput` now — the MathLive field with its pad, whose
// value `{ value: <LaTeX>, latex }` is what the sitting marks. Server render.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import '../../../../i18n';
import { Field, quietKey } from './ExamSitting';
import { createBankSittings } from './bankSitting';

globalThis.window = globalThis.window ?? {};

const shown = (answerType, extra = {}) => ({
  id: 'q1',
  answerType,
  answerFormat: 'Un produit de facteurs premiers',
  statement: 'Décompose 72.',
  ...extra,
});
const step = (answerType, extra) => ({ id: 'q1', answerType, text: 'Décompose 72.', shown: shown(answerType, extra) });
const draw = (q) => renderToStaticMarkup(<Field q={q} value={null} onChange={() => {}} />);

describe('the box of a sitting step', () => {
  it('a `factorization` step draws FactorizationInput — never the number template', () => {
    const html = draw(step('factorization'));
    expect(html).toContain('data-xs-type="factorization"');
    expect(html).toContain('data-factorization-answer');
    expect(html).toContain('data-math-pad-answer');
    // the pad of a decomposition: × and the power first
    expect(html).toContain('data-pad-key');
    // nothing of the number template: no plain numeric input
    expect(html).not.toContain('inputmode="numeric"');
    expect(html).not.toContain('inputMode="numeric"');
    // its note under the box is its own (no fraction note shared on the leaf)
    expect(quietKey(step('factorization'))).toBe(null);
  });

  it('a `rational` step still draws the number template, as before', () => {
    const html = draw(step('rational', { answerFormat: 'Un nombre entier' }));
    expect(html).toContain('data-xs-type="rational"');
    expect(html).not.toContain('data-factorization-answer');
  });

  it('the copy handed back writes the decomposition as a formula, never raw LaTeX', async () => {
    const sheet = {
      id: 'ex-fact',
      metadata: { title: 'Décomposer', estimatedMinutes: 4, exam: { heading: 'Exercice', points: '01' } },
      statement: { content: 'On considère le nombre 72.' },
      questions: [
        {
          id: 'q1',
          step: '01',
          statement: 'Décompose 72.',
          answerType: 'factorization',
          expectedAnswer: '2^3*3^2',
          learningPoints: [{ code: 'g_toy_P1', role: 'primary' }],
          solution: { lines: ['$72 = 2^3 \\times 3^2$'] },
        },
      ],
    };
    const sittings = createBankSittings({ lesson: 'toy', load: async () => [sheet] });
    await sittings.prepare();
    const q = { answerType: 'factorization', paper: false, bank: sheet.questions[0] };
    expect(sittings.written(q, { value: '2^{3}\\times3^{2}', latex: '2^{3}\\times3^{2}' })).toBe('$2^{3}\\times3^{2}$');
    expect(sittings.written({ ...q, answerType: 'rational' }, { value: '72' })).toBe('72');
  });
});
