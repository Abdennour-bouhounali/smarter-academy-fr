// Guards the LP-extraction library against the two ways it could lie:
// under-counting a module whose steps are built by `.map()`, and mistaking
// chrome for a manipulation.
import { describe, it, expect } from 'vitest';
import { join, dirname } from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const STATUSES = ['COVERED', 'PARTIALLY_COVERED', 'MENTIONED_ONLY', 'EXERCISED_ONLY',
  'MANIPULATION_ONLY', 'ASSESSMENT_ONLY', 'MISSING', 'DUPLICATED', 'MISALIGNED'];
import { parseLessonConfig, moduleOfFile, listSourceFiles } from './lib/lessonAst.mjs';
import { readKnowledge } from './lib/knowledgeData.mjs';
import { readModuleFacts } from './lib/moduleFacts.mjs';
import { extractAssessmentQuestions } from './lib/assessmentQuestions.mjs';

const FIXTURE = join(dirname(fileURLToPath(import.meta.url)), 'audit/__fixtures__/2de/demo-lesson-2nde');
const config = parseLessonConfig(FIXTURE);
const knowledge = readKnowledge(FIXTURE);
const files = listSourceFiles(join(FIXTURE, 'modules'));
const factsFor = (n) => readModuleFacts(
  files.find((f) => moduleOfFile(FIXTURE, config.modules, f)?.number === n),
  config.modules.find((m) => m.number === n),
  knowledge.items,
);

describe('parseLessonConfig', () => {
  it('reads the fields a duration audit needs', () => {
    expect(config.title).toBe('Démo');
    expect(config.estimatedDurationMin).toBe(20);
    expect(config.modules.map((m) => m.title)).toEqual(['Le labo', 'Atelier', 'Finale']);
  });

  it('does not hide a drift: the module sum is its own number', () => {
    const sum = config.modules.reduce((n, m) => n + m.estimatedMin, 0);
    expect(sum).toBe(19);
    expect(config.estimatedDurationMin).not.toBe(sum);
  });
});

describe('readModuleFacts — literal steps', () => {
  const facts = factsFor(1);

  it('sees both steps and the single question', () => {
    expect(facts.stepsShape).toBe('literal');
    expect(facts.steps).toEqual([1, 2]);
    expect(facts.questionCounts.stream).toEqual({ TapQuestion: 1 });
  });

  it('places the brick on the step whose gesture earns it', () => {
    expect(facts.bricks).toEqual([expect.objectContaining({ itemId: 'pente', step: 1, itemMissing: false })]);
  });

  it('counts a gated reveal as a teaching position', () => {
    expect(facts.gatedReveals).toBeGreaterThan(0);
  });

  it('keeps chrome out of the manipulations', () => {
    expect(facts.manipulations.map((m) => m.name)).toEqual(['SlopeLab']);
  });

  it('reports the requires contract without treating it as coverage', () => {
    expect(facts.requires.ids).toEqual(['pente']);
    expect(facts.requires.invalid).toBe(0);
  });
});

describe('readModuleFacts — mapped steps', () => {
  const facts = factsFor(2);

  it('expands DATA.map into one step per situation', () => {
    expect(facts.stepsShape).toBe('mapped');
    expect(facts.steps).toEqual([1, 2]);
  });

  it('counts every question the student meets, not the single template', () => {
    expect(facts.questionCounts.stream.NumericQuestion).toBe(2);
    expect(facts.questionCounts.jsxStatic.NumericQuestion).toBe(1);
  });

  it('sees a brick placed in the intro slot exactly once', () => {
    expect(facts.bricks.filter((b) => b.itemId === 'lecture')).toHaveLength(1);
  });
});

describe('extractAssessmentQuestions', () => {
  const questions = extractAssessmentQuestions(files.find((f) => f.includes('Module03')));

  it('returns each boss question with its learning points and prompt', () => {
    expect(questions).toHaveLength(2);
    expect(questions[0]).toMatchObject({
      id: 'demo-e1', enabled: true, type: 'assessment',
      learningPointIds: ['seconde_demo-lesson-2nde_P1'],
      prompt: 'Pente de la droite ?', skill: 'pente', optionCount: 2,
    });
  });

  it('ignores a file with no assessment metadata', () => {
    expect(extractAssessmentQuestions(files.find((f) => f.includes('Module01')))).toHaveLength(0);
  });
});

describe('judgement files', () => {
  // These are written by hand or by an agent; two of them shipped with a JSON
  // syntax error during the 2de audit (an object closed with `]`, and an
  // unescaped quote inside a string). The audit merges them silently, so a
  // broken file would quietly drop a whole lesson's statuses.
  const dir = join(dirname(fileURLToPath(import.meta.url)), '../docs/audits/judgements');
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')) : [];

  it('parse as JSON and carry the documented shape', () => {
    for (const f of files) {
      let data;
      expect(() => { data = JSON.parse(readFileSync(join(dir, f), 'utf-8')); }, `${f} is not valid JSON`).not.toThrow();
      expect(data.lesson, `${f}: missing "lesson"`).toBe(f.replace(/\.json$/, ''));
      expect(data.learningPoints, `${f}: missing "learningPoints"`).toBeTypeOf('object');
      for (const [id, lp] of Object.entries(data.learningPoints)) {
        expect(STATUSES, `${f}/${id}: unknown status ${lp.status}`).toContain(lp.status);
        expect(Array.isArray(lp.evidence ?? []), `${f}/${id}: evidence must be an array`).toBe(true);
      }
    }
  });
});
