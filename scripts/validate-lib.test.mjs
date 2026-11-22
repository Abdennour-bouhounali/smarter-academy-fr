// The pure rules of the validate-* gates (scripts/validate-lib.mjs): each case breaks ONE rule.
import { describe, it, expect, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  isV2Lesson,
  packWorldId,
  packKnowledgePath,
  typographyErrors,
  mathErrors,
  exerciseTypographyErrors,
  examProvenanceErrors,
  brevetTagErrors,
  gradeOfExercise,
  CONTROL_BADGE,
} from './validate-lib.mjs';

const NB = '\u00a0'; // no-break space, before « : » and inside « … »
const NNB = '\u202f'; // narrow no-break space, before « ; ! ? »
const kinds = (text) => typographyErrors(text).map((e) => e.kind);

describe('what a v2 lesson is — its lesson.pack.js, never a marker in routes.jsx (plan §8bis)', () => {
  const root = mkdtempSync(join(tmpdir(), 'v2-'));
  afterAll(() => rmSync(root, { recursive: true, force: true }));
  const lesson = (name, files) => {
    const dir = join(root, name);
    mkdirSync(dir, { recursive: true });
    for (const [f, src] of Object.entries(files)) writeFileSync(join(dir, f), src);
    return dir;
  };

  it('a lesson whose pack exports LESSON_PACK is v2, and its world and knowledge are read from the pack', () => {
    const dir = lesson('decomposer', {
      'lesson.config.js': 'export const LESSON_CONFIG = {};',
      'routes.jsx': 'export default buildLessonRoutes({ config, basePath, loadIndex });',
      'lesson.pack.js': [
        'export const LESSON_PACK = {',
        "  id: 'decomposer',",
        "  world: { id: 'divisor-isles', content: () => import('./world').then((m) => m.lesson) },",
        "  knowledge: () => import('./world/knowledge.js').then((m) => m.LESSON_KNOWLEDGE),",
        '};',
      ].join('\n'),
    });
    expect(isV2Lesson(dir)).toBe(true);
    expect(packWorldId(dir)).toBe('divisor-isles');
    expect(packKnowledgePath(dir)).toBe('world/knowledge.js');
  });

  it('the old text « retiredModules: true » without a pack does NOT make a v2 lesson', () => {
    const dir = lesson('ancienne', {
      'lesson.config.js': '',
      'routes.jsx': 'buildLessonRoutes({ config, retiredModules: true });',
    });
    expect(isV2Lesson(dir)).toBe(false);
    expect(packWorldId(dir)).toBeNull();
  });

  it('a lesson.pack.js that exports no LESSON_PACK is not a pack', () => {
    const dir = lesson('vide', { 'lesson.config.js': '', 'lesson.pack.js': 'export const OTHER = {};' });
    expect(isV2Lesson(dir)).toBe(false);
  });

  it('an integration lesson is recognised by its world « mission-isle »', () => {
    const dir = lesson('vers-le-brevet', {
      'lesson.config.js': '',
      'lesson.pack.js':
        "export const LESSON_PACK = { id: 'x', world: { id: 'mission-isle', content: () => import('./world') } };",
    });
    expect(isV2Lesson(dir)).toBe(true);
    expect(packWorldId(dir)).toBe('mission-isle');
    expect(packKnowledgePath(dir)).toBeNull();
  });
});

describe('French typography of a sentence (FRENCH_LANGUAGE_CONTRACT.md §4, §5)', () => {
  it('accepts a clean sentence with a formula, a price, a percentage and quotes', () => {
    const s = `L’élève écrit «${NB}$60 = 2^2 \\times 3 \\times 5$${NB}»${NB}: le prix est 12,50${NB}€, soit 20${NB}% de plus${NNB}! Est-ce exact${NNB}?`;
    expect(typographyErrors(s)).toEqual([]);
  });

  it('refuses a missing or plain space before « : ; ! ? », also right after a formula', () => {
    expect(kinds('Calcule : 12 × 3')).toContain('espace');
    expect(kinds('Calcule: 12 × 3')).toContain('espace');
    expect(kinds('On a $x = 4$; donc')).toContain('espace');
    expect(kinds(`Est-ce exact${NNB}?`)).toEqual([]);
  });

  it('refuses quotes without their no-break spaces, and English quotes', () => {
    expect(kinds('Il dit «oui»')).toContain('guillemets');
    expect(kinds('Il dit "oui"')).toContain('guillemets-anglais');
    expect(kinds('Il dit “oui”')).toContain('guillemets-anglais');
  });

  it('refuses the straight apostrophe, « 3ème », « !! »', () => {
    expect(kinds("l'élève")).toContain('apostrophe');
    expect(kinds('la 3ème question')).toContain('ordinal');
    expect(kinds('la 1ère question')).toContain('ordinal');
    expect(kinds('Bravo!!')).toContain('double');
  });

  it('refuses a decimal point in prose, a unit glued or after a plain space, money before its number, an Algerian currency', () => {
    expect(kinds('il mesure 3.5 cm')).toContain('point-décimal');
    expect(kinds('il coûte 35€')).toContain('unité');
    expect(kinds('il coûte 35 €')).toContain('unité');
    expect(kinds('une hausse de 20 %')).toContain('unité');
    expect(kinds('il coûte €35')).toContain('monnaie');
    expect(kinds('il coûte 35 EUR')).toContain('monnaie');
    expect(kinds('il coûte 450 DA')).toContain('devise');
    expect(kinds('il coûte 450 dinars')).toContain('devise');
    // « [DA] », the segment from D to A, is geometry, not money.
    expect(kinds('Le segment [DA] mesure 5\u00a0cm.')).toEqual([]);
  });

  it('refuses an Arabic letter, an Arabic comma and a bidi control anywhere', () => {
    expect(kinds('PGCD \u0648 PPCM')).toContain('arabe');
    expect(kinds('1\u060c 2')).toContain('arabe');
    expect(kinds('\u2067x\u2069')).toContain('bidi');
  });

  it('refuses « PGCD(12, 18) »: a pair takes a semicolon, in prose and in a formula', () => {
    expect(kinds('Calcule PGCD(12, 18).')).toContain('point-virgule');
    expect(kinds('Calcule $\\mathrm{PGCD}(12 ; 18)$.')).toEqual([]);
    expect(mathErrors('PGCD(12,18) = 6').map((e) => e.kind)).toContain('point-virgule');
  });
});

describe('French mathematical writing inside a formula (§5, §7)', () => {
  const mk = (s) => mathErrors(s).map((e) => e.kind);
  it('accepts × , {,} and the slanted inequalities', () => {
    expect(mk('60 = 2^2 \\times 3 \\times 5')).toEqual([]);
    expect(mk('x = 2{,}5')).toEqual([]);
    expect(mk('x \\leqslant 3 \\text{ et } y \\geqslant 1')).toEqual([]);
    expect(mk('\\{1, 2, 3\\}')).toEqual([]);
  });
  it('refuses \\cdot and *, a bare decimal comma or point, \\le and \\geq', () => {
    expect(mk('2 \\cdot 3')).toContain('produit');
    expect(mk('2 * 3')).toContain('produit');
    expect(mk('x = 2,5')).toContain('virgule');
    expect(mk('x = 2.5')).toContain('point-décimal');
    expect(mk('x \\le 3')).toContain('inégalité');
    expect(mk('x \\geq 3')).toContain('inégalité');
  });
  it('a sentence checks the formulas it holds', () => {
    expect(kinds('On trouve $x = 2,5$.')).toContain('virgule');
  });
});

describe('the visible texts of an exercise are all read, the answer key is not', () => {
  it('names the path of each mistake', () => {
    const data = {
      metadata: { title: 'Exercice 1', exam: { heading: 'Exercice 1' } },
      statement: { content: 'Calcule.', formulas: ['2 \\cdot 3'] },
      questions: [
        {
          statement: "Quel est l'entier ?",
          expectedAnswer: '2.5',
          hints: [{ content: 'Regarde bien.' }],
          feedback: { correct: 'Exact.', incorrect: 'Pas encore.' },
          solution: { lines: ['On a $x = 2{,}5$.'], result: 'x = 2.5' },
        },
      ],
    };
    const paths = exerciseTypographyErrors(data).map((e) => `${e.path}:${e.kind}`);
    expect(paths).toEqual(
      expect.arrayContaining([
        'statement.formulas[0]:produit',
        'questions[0].statement:apostrophe',
        'questions[0].statement:espace',
        'questions[0].solution.result:point-décimal',
      ]),
    );
    expect(paths.some((p) => p.includes('expectedAnswer'))).toBe(false);
  });
});

describe('the provenance of an exam sheet — the brevet in 3e, a « contrôle » in 6e–4e (port of the Algerian rule)', () => {
  const ex = (id, metadata) => ({ id, metadata });
  const exam = (kind, badge) => ({ kind, badge, heading: 'Exercice 1', points: '03' });

  it('reads the grade in the exercise id', () => {
    expect(gradeOfExercise({ id: 'ex-3e-decomposer-en-facteurs-premiers-l1-001' })).toBe('3e');
    expect(gradeOfExercise({ id: 'ex-5e-x-l3-004' })).toBe('5e');
    expect(gradeOfExercise({ id: 'ex-4am-x-l1-001' })).toBeNull();
  });

  it('accepts a 3e brevet excerpt citing its session with the badge « Brevet <year> »', () => {
    const ok = ex('ex-3e-x-l3-001', {
      exam: exam('excerpt', 'Brevet 2023'),
      source: { type: 'brevet', year: 2023, part: 2, exercise: 3 },
    });
    expect(examProvenanceErrors(ok)).toEqual([]);
  });

  it('refuses a wrong badge, a session out of range, a part other than 1 or 2, a missing exercise number', () => {
    const src = (over, badge = 'Brevet 2023') =>
      ex('ex-3e-x-l3-001', {
        exam: exam('official', badge),
        source: { type: 'brevet', year: 2023, part: 2, exercise: 3, ...over },
      });
    expect(examProvenanceErrors(src({}, 'BEM 2023')).join()).toMatch(/« Brevet 2023 »/);
    expect(examProvenanceErrors(src({ year: 2009 }, 'Brevet 2009')).join()).toMatch(/session du brevet/);
    expect(examProvenanceErrors(src({ part: 3 })).join()).toMatch(/part vaut 1/);
    expect(examProvenanceErrors(src({ exercise: 0 })).join()).toMatch(/exercise est le numéro/);
  });

  it('refuses the Algerian sources « bem » and « term_exam » everywhere', () => {
    expect(examProvenanceErrors(ex('ex-3e-x-l3-001', { source: { type: 'bem', year: 2015, part: 1 } })).join()).toMatch(
      /algérien/,
    );
    expect(examProvenanceErrors(ex('ex-4e-x-l3-001', { source: { type: 'term_exam' } })).join()).toMatch(
      /corpus algérien/,
    );
  });

  it('a modelled 3e exercise carries « Sur le modèle du brevet <year> »', () => {
    expect(
      examProvenanceErrors(ex('ex-3e-x-l2-001', { exam: exam('modelled', 'Sur le modèle du brevet 2021') })),
    ).toEqual([]);
    expect(
      examProvenanceErrors(
        ex('ex-3e-x-l2-001', { exam: exam('modelled', '\u0639\u0644\u0649 \u0645\u0646\u0648\u0627\u0644 BEM 2016') }),
      ).join(),
    ).toMatch(/Sur le modèle du brevet/);
    expect(examProvenanceErrors(ex('ex-3e-x-l2-001', { exam: exam('modelled', CONTROL_BADGE) })).join()).toMatch(
      /Sur le modèle du brevet/,
    );
  });

  it('6e–4e: never official, excerpt or brevet; modelled on a « contrôle » of its own grade', () => {
    expect(
      examProvenanceErrors(
        ex('ex-4e-x-l1-001', {
          exam: exam('official', 'Brevet 2023'),
          source: { type: 'brevet', year: 2023, part: 1, exercise: 1 },
        }),
      ).join(),
    ).toMatch(/jamais « official »/);
    expect(
      examProvenanceErrors(
        ex('ex-4e-x-l1-001', { source: { type: 'brevet', year: 2023, part: 1, exercise: 1 } }),
      ).join(),
    ).toMatch(/seule une leçon de 3e/);
    const ok = ex('ex-4e-x-l2-001', {
      exam: exam('modelled', CONTROL_BADGE),
      source: { type: 'platform_addition', reason: 'control_modelled', modelledOn: '4e' },
    });
    expect(examProvenanceErrors(ok)).toEqual([]);
    const otherGrade = ex('ex-4e-x-l2-001', {
      exam: exam('modelled', CONTROL_BADGE),
      source: { type: 'platform_addition', reason: 'control_modelled', modelledOn: '5e' },
    });
    expect(examProvenanceErrors(otherGrade).join()).toMatch(/niveau de l’exercice « 4e »/);
    const noSource = ex('ex-4e-x-l2-001', { exam: exam('modelled', CONTROL_BADGE) });
    expect(examProvenanceErrors(noSource).join()).toMatch(/control_modelled/);
    const brevetBadge = ex('ex-4e-x-l2-001', {
      exam: exam('modelled', 'Sur le modèle du brevet 2021'),
      source: { type: 'platform_addition', reason: 'control_modelled', modelledOn: '4e' },
    });
    expect(examProvenanceErrors(brevetBadge).join()).toMatch(/Sur le modèle d’un contrôle/);
  });

  it('an adapted exercise carries no badge', () => {
    expect(examProvenanceErrors(ex('ex-3e-x-l1-001', { exam: exam('adapted', 'Brevet 2023') })).join()).toMatch(
      /adapted/,
    );
    expect(examProvenanceErrors(ex('ex-3e-x-l1-001', { exam: exam('adapted', null) }))).toEqual([]);
  });
});

describe('the brevet tags — brevet: 1 | 2 | null and calculator, required in 3e (plan §7bis)', () => {
  it('accepts the three values of brevet with a calculator flag', () => {
    expect(brevetTagErrors({ id: 'ex-3e-x-l1-001', brevet: 1, calculator: false })).toEqual([]);
    expect(brevetTagErrors({ id: 'ex-3e-x-l1-001', brevet: 2, calculator: true })).toEqual([]);
    expect(brevetTagErrors({ id: 'ex-3e-x-l1-001', brevet: null, calculator: true })).toEqual([]);
  });

  it('requires both tags in 3e, and only checks them when present below', () => {
    expect(brevetTagErrors({ id: 'ex-3e-x-l1-001' }).join()).toMatch(
      /brevet est obligatoire en 3e.*calculator est obligatoire/s,
    );
    expect(brevetTagErrors({ id: 'ex-4e-x-l1-001' })).toEqual([]);
    expect(brevetTagErrors({ id: 'ex-4e-x-l1-001', brevet: 3 }).join()).toMatch(/brevet vaut 1/);
  });

  it('the grade given by the bank folder wins over the id', () => {
    expect(brevetTagErrors({ id: 'ex-4e-x-l1-001' }, '3e').join()).toMatch(/obligatoire en 3e/);
  });

  it('brevet: 1 (automatisms) is done WITHOUT a calculator', () => {
    expect(brevetTagErrors({ id: 'ex-3e-x-l1-001', brevet: 1, calculator: true }).join()).toMatch(/SANS calculatrice/);
    expect(brevetTagErrors({ id: 'ex-4e-x-l1-001', brevet: 1 }).join()).toMatch(/SANS calculatrice/);
  });

  it('refuses a calculator that is not a boolean', () => {
    expect(brevetTagErrors({ id: 'ex-3e-x-l1-001', brevet: 2, calculator: 'oui' }).join()).toMatch(/booléen/);
  });

  it('a brevet excerpt trains the part it was taken from', () => {
    const data = {
      id: 'ex-3e-x-l1-001',
      brevet: 2,
      calculator: true,
      metadata: { source: { type: 'brevet', year: 2023, part: 1, exercise: 1 } },
    };
    expect(brevetTagErrors(data).join()).toMatch(/brevet doit valoir 1/);
  });
});
