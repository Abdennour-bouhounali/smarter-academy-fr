import { describe, it, expect } from 'vitest';
import { validateProblem, demandsOf, initialProgress, completeSubstep, isPartDone, asideOf, foundOf, rightAnswerOf } from './guidedProblem';

const solution = { kind: 'solution', lines: ['a', 'b'] };
const ok = {
  id: 'p', title: 't', statement: 's', source: { type: 'platform_addition', reason: 'exam_style_problem' },
  data: [{ id: 'a', text: 'x', useful: true }, { id: 'b', text: 'y', useful: false }],
  parts: [
    { label: '1)', question: 'كم؟', asks: ['كم؟'], steps: [{ kind: 'sort' }, { kind: 'numeric', role: 'answer', ask: 0, expected: 3 }, solution] },
    { label: '2)', question: 'هل؟', asks: ['هل؟'], steps: [{ kind: 'choice', role: 'conclude', ask: 0, options: ['a', 'b'], correct: 1 }, solution] },
  ],
};

describe('validateProblem', () => {
  it('accepts a complete exam-style problem', () => {
    expect(validateProblem(ok)).toEqual([]);
  });

  it('rejects a single-part problem, a missing written solution, and a one-line solution', () => {
    expect(validateProblem({ ...ok, parts: [ok.parts[0]] }).join()).toMatch(/at least 2 parts/);
    const noSolution = { ...ok, parts: [ok.parts[0], { ...ok.parts[1], steps: [ok.parts[1].steps[0], { kind: 'numeric', role: 'compute', expected: 1 }] }] };
    expect(validateProblem(noSolution).join()).toMatch(/must end with a 'solution'/);
    const oneLine = { ...ok, parts: [ok.parts[0], { ...ok.parts[1], steps: [ok.parts[1].steps[0], { kind: 'solution', lines: ['a'] }] }] };
    expect(validateProblem(oneLine).join()).toMatch(/≥ 2 lines/);
  });

  it('keeps data sorting in part 1, with useful AND useless data', () => {
    const late = { ...ok, parts: [ok.parts[0], { ...ok.parts[1], steps: [{ kind: 'sort' }, solution] }] };
    expect(validateProblem(late).join()).toMatch(/belongs to part 1/);
    expect(validateProblem({ ...ok, data: [{ id: 'a', text: 'x', useful: true }] }).join()).toMatch(/useful AND useless/);
  });

  it('checks choice ranges, numeric expectations and roles', () => {
    const bad = { ...ok, parts: [ok.parts[0], { ...ok.parts[1], steps: [{ kind: 'choice', role: 'compute', options: ['a', 'b'], correct: 2 }, { kind: 'numeric', role: 'compute', expected: '3' }, solution] }] };
    const errors = validateProblem(bad).join('\n');
    expect(errors).toMatch(/role 'compute' is not allowed/);
    expect(errors).toMatch(/correct out of range/);
    expect(errors).toMatch(/expected must be a number/);
  });
});

describe('every demand has its own answer', () => {
  const two = { label: '2)', question: 'كم حافلة يلزم؟ وكم مقعدًا يبقى شاغرًا؟', asks: ['كم حافلة؟', 'كم مقعدًا؟'] };

  it('rejects two questions answered by a single input (the owner\'s 2026-10-06 case)', () => {
    const one = { ...ok, parts: [ok.parts[0], { ...two, steps: [
      { kind: 'choice', role: 'conclude', options: ['a', 'b'], correct: 0 }, // interprétation, sans ask
      { kind: 'numeric', role: 'answer', ask: 1, expected: 2 }, { kind: 'solution', ask: 0, lines: ['a', 'b'] }] }] };
    expect(validateProblem(one).join()).toMatch(/ask 1 « كم حافلة؟ » has no answer step of its own/);
  });

  it('accepts one answer per demand', () => {
    const both = { ...ok, parts: [ok.parts[0], { ...two, steps: [
      { kind: 'numeric', role: 'answer', ask: 0, expected: 5 }, { kind: 'numeric', role: 'answer', ask: 1, expected: 2 }, solution] }] };
    expect(validateProblem(both)).toEqual([]);
  });

  it('counts ؟ and imperatives as demands, and requires them declared', () => {
    expect(demandsOf('بيّن أنّ 36 قاسم للعدد 756، ثم استنتج عدد الرفوف.')).toBe(2);
    expect(demandsOf('عبّر عن العلاقة بين العددين.')).toBe(1); // « بين » n'est pas « بيّن »
    const undeclared = { ...ok, parts: [ok.parts[0], { ...two, asks: ['كم حافلة؟'], steps: [{ kind: 'numeric', role: 'answer', ask: 0, expected: 5 }, solution] }] };
    expect(validateProblem(undeclared).join()).toMatch(/makes 2 demand\(s\)/);
  });

  it('requires a numeric answer to name its ask', () => {
    const loose = { ...ok, parts: [ok.parts[0], { ...ok.parts[1], steps: [ok.parts[1].steps[0], { kind: 'numeric', role: 'answer', expected: 1 }, solution] }] };
    expect(validateProblem(loose).join()).toMatch(/must say which ask/);
  });
});

describe('guided progress (non-blocking)', () => {
  it('opens the next sub-step once one is answered, monotonically', () => {
    let p = initialProgress(ok);
    expect(p).toEqual([0, 0]);
    p = completeSubstep(p, 0, 0);
    expect(p).toEqual([1, 0]);
    // Re-answering an earlier sub-step never closes later ones.
    expect(completeSubstep(p, 0, 0)).toBe(p);
    p = completeSubstep(completeSubstep(p, 0, 1), 0, 2);
    expect(isPartDone(p, ok, 0)).toBe(true);
    expect(isPartDone(p, ok, 1)).toBe(false);
  });
});

describe('the statement support (figure / visual / table, 2026-10-06)', () => {
  const TRI = { points: { A: [0, 0], B: [4, 0], C: [0, 3] }, segments: [['A', 'B'], ['B', 'C'], ['C', 'A']], ariaLabel: 'مثلث' };
  it('accepts a valid GeoFigure, a CoordPlane prop bag and a rectangular table', () => {
    expect(validateProblem({ ...ok, figure: TRI, visual: { range: { xMin: 0, xMax: 10, yMin: 0, yMax: 5 }, unit: 30 }, table: { head: ['x', '1', '2'], rows: [['f(x)', '3', '5']] } })).toEqual([]);
  });
  it('reports the figure validator errors, a non-object visual and a ragged table', () => {
    const errs = validateProblem({ ...ok, figure: { ...TRI, colour: 'red' }, visual: [1, 2], table: { head: ['x', '1', '2'], rows: [['f(x)', '3']] } });
    expect(errs.some((e) => e.includes('figure:'))).toBe(true);
    expect(errs.some((e) => e.includes('visual'))).toBe(true);
    expect(errs.some((e) => e.includes('row 1 must have 3 cells'))).toBe(true);
  });
  it('a statement that refers to a figure / table / graph must carry one (« مربّع الشكل » is not a reference)', () => {
    expect(validateProblem({ ...ok, statement: 'اقرأ الجدول المقابل' }).some((e) => e.includes('refers to a figure'))).toBe(true);
    expect(validateProblem({ ...ok, statement: 'اقرأ الجدول المقابل', table: { head: ['x', '1'], rows: [['y', '2']] } })).toEqual([]);
    expect(validateProblem({ ...ok, statement: 'حديقة مربّعة الشكل' })).toEqual([]);
  });

  it('closes the CoordPlane prop list and caps the plot size, as practice does', () => {
    const errs = validateProblem({ ...ok, visual: { range: { xMin: 0, xMax: 100, yMin: 0, yMax: 5 }, functionz: [] } });
    expect(errs.some((e) => e.includes('visual.functionz is not a CoordPlane prop'))).toBe(true);
    expect(errs.some((e) => e.includes('max 460'))).toBe(true);
  });
});

// ── « الإجابة تُكتب في شكلها » pour les sous-étapes saisies (2026-11-10) ────────────────────────────────────────────────────────────────
import { stepTemplate, stepGiven, shapeErrors, resumePart, STEP_UNITS } from './guidedProblem';

const num = (extra) => ({ kind: 'numeric', role: 'answer', ask: 0, expected: 3, ...extra });
const withStep = (step) => ({ ...ok, parts: [{ ...ok.parts[0], steps: [{ kind: 'sort' }, step, solution] }, ok.parts[1]] });

describe('stepTemplate — a typed step declares the SHAPE of its answer', () => {
  it('a step without shape has no template: the bare box of before', () => {
    expect(stepTemplate(num())).toBeNull();
    expect(stepTemplate(num({ suffix: 'm' }))).toBeNull();
    expect(stepTemplate(undefined)).toBeNull();
    expect(stepGiven(num({ suffix: 'm' }), 7.25)).toBe('7.25 m');
    expect(stepGiven(num(), 5)).toBe('5');
  });
  it('quantity: the unit is printed (m, cm, cm³, دج)', () => {
    for (const unit of ['m', 'cm', 'cm³', 'دج']) {
      expect(STEP_UNITS).toContain(unit);
      expect(stepTemplate(num({ shape: 'quantity', unit }))).toEqual({ kind: 'quantity', unit, signed: false });
    }
    expect(stepGiven(num({ shape: 'quantity', unit: 'm' }), 7.25)).toBe('7,25 m');
  });
  it('form: « V = [ ]π »', () => {
    const step = num({ shape: 'form', subject: 'V', factor: '\\pi' });
    expect(stepTemplate(step)).toMatchObject({ kind: 'form', subject: 'V', pre: '', post: '\\pi' });
    expect(stepGiven(step, 81)).toBe('$V = 81\\pi$');
  });
  it('gap: « AM × AC = [ ] », or the box in place of « \\ldots »', () => {
    const step = num({ shape: 'gap', subject: 'AM \\times AC' });
    expect(stepTemplate(step)).toMatchObject({ kind: 'gap', pre: 'AM \\times AC =', post: '', before: '', after: '' });
    expect(stepGiven(step, 3900)).toBe('$AM \\times AC = 3900$');
    expect(stepTemplate(num({ shape: 'gap', subject: '\\dfrac{AM}{AB} = \\ldots' }))).toMatchObject({ kind: 'gap', pre: '\\dfrac{AM}{AB} = ', post: '' });
    expect(stepTemplate(num({ shape: 'gap', subject: '2 \\times \\ldots = 13' }))).toMatchObject({ pre: '2 \\times ', post: ' = 13' });
  });
  it('decimal: a ratio, with the decimal comma', () => {
    expect(stepTemplate(num({ shape: 'decimal' }))).toEqual({ kind: 'decimal', signed: false });
    expect(stepGiven(num({ shape: 'decimal' }), 0.4)).toBe('0,4');
  });
  it('NEVER reads `expected`: two steps that differ only by the answer have the same template', () => {
    const a = num({ shape: 'quantity', unit: 'cm', expected: 4.5 });
    const b = num({ shape: 'quantity', unit: 'cm', expected: 9 });
    expect(stepTemplate(a)).toEqual(stepTemplate(b));
    expect(JSON.stringify(stepTemplate(num({ shape: 'form', subject: 'V', factor: '\\pi', expected: 405 })))).not.toContain('405');
  });
  it('an invalid shape gives no template (the bare box), never a broken formula', () => {
    expect(stepTemplate(num({ shape: 'quantity', unit: 'DA' }))).toBeNull();
    expect(stepTemplate(num({ shape: 'gap', subject: '\\dfrac{\\ldots}{5} = 2' }))).toBeNull();
    expect(stepTemplate({ kind: 'choice', shape: 'decimal' })).toBeNull();
  });
});

describe('validateProblem — the shape fields of a numeric step', () => {
  it('accepts the four shapes', () => {
    for (const s of [{ shape: 'quantity', unit: 'دج' }, { shape: 'form', subject: 'V', factor: '\\pi' }, { shape: 'gap', subject: 'AM \\times AC' }, { shape: 'decimal' }]) {
      expect(validateProblem(withStep(num(s)))).toEqual([]);
    }
  });
  it('rejects an unknown shape, a missing or unknown unit, a missing subject / factor, and a « $ » in the LaTeX', () => {
    expect(validateProblem(withStep(num({ shape: 'money' }))).join()).toMatch(/unknown shape 'money'/);
    expect(validateProblem(withStep(num({ shape: 'quantity' }))).join()).toMatch(/needs a 'unit'/);
    expect(validateProblem(withStep(num({ shape: 'quantity', unit: 'DA' }))).join()).toMatch(/needs a 'unit'/);
    expect(validateProblem(withStep(num({ shape: 'form', subject: 'V' }))).join()).toMatch(/needs a 'factor'/);
    expect(validateProblem(withStep(num({ shape: 'gap' }))).join()).toMatch(/needs a 'subject'/);
    expect(validateProblem(withStep(num({ shape: 'gap', subject: '$AM$' }))).join()).toMatch(/needs a 'subject'/);
    expect(validateProblem(withStep(num({ shape: 'gap', subject: '\\ldots + \\ldots' }))).join()).toMatch(/one « \\ldots » at most/);
    expect(validateProblem(withStep(num({ shape: 'gap', subject: '\\dfrac{\\ldots}{5}' }))).join()).toMatch(/inside a \{ \} group/);
  });
  it('rejects a field of another shape, a shape field without shape, a prefix / suffix beside a shape, and a shape on a non-numeric step', () => {
    expect(validateProblem(withStep(num({ shape: 'decimal', unit: 'm' }))).join()).toMatch(/'unit' is not a field of shape 'decimal'/);
    expect(validateProblem(withStep(num({ unit: 'm' }))).join()).toMatch(/'unit' need a 'shape'/);
    expect(validateProblem(withStep(num({ shape: 'quantity', unit: 'm', suffix: 'm' }))).join()).toMatch(/no 'prefix' \/ 'suffix'/);
    expect(shapeErrors({ kind: 'choice', shape: 'decimal' }).join()).toMatch(/belongs to a numeric step/);
  });
});

describe('resumePart — where a restored مسألة is resumed', () => {
  it('nothing done: no resume (the statement first)', () => {
    expect(resumePart([0, 0], ok)).toBeNull();
    expect(resumePart(undefined, ok)).toBeNull();
  });
  it('the first part not finished; the last one when all are', () => {
    expect(resumePart([1, 0], ok)).toBe(0);
    expect(resumePart([3, 0], ok)).toBe(1);
    expect(resumePart([3, 1], ok)).toBe(1);
    expect(resumePart([3, 2], ok)).toBe(1);
  });
});

describe('asideOf — « pas d\'aller-retour » : la figure et les données à côté de chaque sous-étape (lecteur)', () => {
  const fig = { points: { A: [0, 0], B: [1, 0] }, segments: [{ from: 'A', to: 'B' }] };
  it('shows the figure and the USEFUL data beside a computing step, never beside the sort that extracts them', () => {
    const p = { ...ok, figure: fig };
    expect(asideOf(p, { kind: 'sort' })).toBeNull();
    expect(asideOf(p, ok.parts[0].steps[1])).toEqual({ figure: fig, table: null, data: ['x'], statement: null });
  });
  it('falls back on the statement when the problem has no data list, and shows nothing when there is nothing to show', () => {
    const { data, ...noData } = ok; // eslint-disable-line no-unused-vars
    expect(asideOf(noData, solution)).toEqual({ figure: null, table: null, data: [], statement: 's' });
    expect(asideOf({ ...noData, statement: '' }, solution)).toBeNull();
  });
  it('ignores a plane figure without points (a trace of the extraction, drawn elsewhere)', () => {
    expect(asideOf({ ...ok, figure: { AD: 1 } }, solution).figure).toBeNull();
  });
});

describe('foundOf — ce que l\'élève a déjà trouvé, à côté de la sous-étape suivante (lecteur)', () => {
  const p = {
    ...ok,
    parts: [
      { label: '1)', question: 'q1', asks: ['الطول'], steps: [{ kind: 'sort' }, { kind: 'numeric', role: 'compute', prompt: 'السطر الأول:', expected: 2 }, { kind: 'numeric', role: 'answer', ask: 0, prompt: 'الطول:', expected: 3 }, solution] },
      { label: '2)', question: 'q2', asks: ['الثمن'], steps: [{ kind: 'numeric', role: 'compute', prompt: 'المجموع:', expected: 5 }, { kind: 'numeric', role: 'answer', ask: 0, prompt: 'الثمن:', expected: 6 }, solution] },
    ],
  };
  it('lists the earlier answered sub-steps of the same part with their RIGHT result, never one not answered yet', () => {
    expect(foundOf(p, 0, 1, {})).toEqual([]);
    // l'élève a tapé 7 (faux) : la ligne suivante se fait avec le bon résultat, celui que la correction a montré
    expect(foundOf(p, 0, 2, { '0:1': '7' })).toEqual([{ label: 'السطر الأول:', value: '2' }]);
  });
  it('puts the results of the earlier parts first (their demands), then the current part', () => {
    const given = { '0:1': '2', '0:2': '3', '1:0': '5' };
    expect(foundOf(p, 1, 1, given)).toEqual([{ label: 'الطول', value: '3' }, { label: 'المجموع:', value: '5' }]);
  });
  it('gives the right option of a choice, and nothing for a step without one answer (sort, solution, batch)', () => {
    expect(rightAnswerOf({ kind: 'choice', options: ['a', 'b'], correct: 1 })).toBe('b');
    expect(rightAnswerOf({ kind: 'numeric', expected: 0.4, display: '0,4' })).toBe('0,4');
    expect(rightAnswerOf({ kind: 'batch', rows: [] })).toBeNull();
  });
});
