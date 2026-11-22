import { describe, it, expect, vi } from 'vitest';
import { isCoachLesson, loadRule, explainSteps, guideSteps, notebookEntry, primaryPoint, MODES } from './examCoach';

// No lesson has a pack and no bank exists until the French lessons: a neutral pack (its coach and its knowledge sheets)
// and two neutral questions stand in for them.
vi.mock('../../../lessons/lessonPack', () => {
  const PACK = {
    coach: { P1: 'cle-1', P2: 'cle-2' },
    knowledge: {
      modules: {
        1: [{ id: 'cle-1', title: 'Clé 1', memo: { rule: 'r = 0', hook: 'Le reste est nul', example: '12 = 3 \\times 4', trap: 'Piège 1', exam: 'Au brevet 1' } }],
        2: [{ id: 'cle-2', title: 'Clé 2', memo: { rule: 'a = b \\times q', hook: 'Un produit', trap: 'Piège 2', exam: 'Au brevet 2' } }],
      },
    },
  };
  return {
    hasPackPart: (lesson, part) => lesson === 'lecon-a' && part in PACK,
    loadPackPart: async (lesson, part) => (lesson === 'lecon-a' ? (PACK[part] ?? null) : null),
  };
});

const QUESTIONS = [
  {
    id: 'q1',
    lead: 'Un jardin de 12 m.',
    statement: '3 est-il un diviseur de 12 ?',
    learningPoints: [{ code: '3e_lecon-a_P1', role: 'primary' }],
    solution: { lines: ['$12 = 3 \\times 4 + 0$', 'Le reste est nul.'], result: '3 divise 12' },
  },
  {
    id: 'q2',
    statement: 'Écris 15 comme un produit.',
    learningPoints: [{ code: '3e_lecon-a_P2' }],
    solution: { lines: ['$15 = 3 \\times 5$'] },
  },
];

describe('Le coach du brevet — the exam coach of the exercise bank', () => {
  it('is on for a lesson whose pack names its coach, with two modes', () => {
    expect(isCoachLesson('lecon-a')).toBe(true);
    expect(isCoachLesson('lecon-b')).toBe(false);
    expect(MODES).toEqual(['guide', 'explain']);
  });

  it('finds the rule of the lesson behind every question, from the lesson’s own knowledge sheets', async () => {
    const seen = new Set();
    for (const q of QUESTIONS) {
      const rule = await loadRule('lecon-a', primaryPoint(q));
      expect(rule, `${q.id} ${primaryPoint(q)}`).toBeTruthy();
      expect(rule.title && rule.rule && rule.hook && rule.trap && rule.exam).toBeTruthy();
      seen.add(rule.id);
    }
    expect(seen).toEqual(new Set(['cle-1', 'cle-2']));
    expect(await loadRule('lecon-a', '3e_lecon-a_P9')).toBe(null);
    expect(await loadRule('lecon-b', '3e_lecon-b_P1')).toBe(null);
  });

  it('GUIDE mode never contains the answer: no solution line, no result', async () => {
    for (const q of QUESTIONS) {
      const rule = await loadRule('lecon-a', primaryPoint(q));
      const told = JSON.stringify([guideSteps(q, rule), notebookEntry(q, rule, 'guide', 'x')]);
      for (const line of q.solution?.lines ?? [])
        expect(told.includes(JSON.stringify(line).slice(1, -1)), `${q.id}: a solution line leaked`).toBe(false);
      expect(notebookEntry(q, rule, 'guide').some((l) => l.result)).toBe(false);
      expect(guideSteps(q, rule).map((s) => s.kind)).toEqual(['reread', 'rule', 'trap']);
    }
  });

  it('EXPLAIN mode tells the whole solution as a lesson: asked, rule, every line, the result, the trap, the exam tip, then « write it »', async () => {
    for (const q of QUESTIONS.filter((x) => x.solution?.lines?.length)) {
      const rule = await loadRule('lecon-a', primaryPoint(q));
      const steps = explainSteps(q, rule);
      const kinds = steps.map((s) => s.kind);
      expect(kinds[0]).toBe('asked');
      expect(kinds[1]).toBe('rule');
      expect(kinds.at(-1)).toBe('write');
      expect(steps.filter((s) => s.kind === 'line').map((s) => s.text)).toEqual(q.solution.lines);
      expect(kinds.includes('trap') && kinds.includes('exam')).toBe(true);
      if (q.solution.result) {
        expect(kinds.includes('result')).toBe(true);
        expect(notebookEntry(q, rule, 'explain').some((l) => l.result)).toBe(true);
      }
    }
  });

  it('the notebook entry always asks the student to write his mistake in his own words', async () => {
    const q = QUESTIONS[0];
    const rule = await loadRule('lecon-a', primaryPoint(q));
    const entry = notebookEntry(q, rule, 'guide', 'Utiliser la définition');
    expect(entry.map((l) => l.label)).toEqual(['Question', 'Mon erreur', 'À retenir']);
    expect(entry[1].own).toBe(true);
  });
});
