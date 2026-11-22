import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isCoachLesson, loadRule, explainSteps, guideSteps, notebookEntry, primaryPoint, MODES } from './examCoach';

const DIR = fileURLToPath(new URL('../../../../../../content/practice/4am/qasim-adad-tabii/', import.meta.url));
const QUESTIONS = readdirSync(DIR)
  .filter((d) => d.startsWith('level-'))
  .flatMap((lvl) =>
    readdirSync(`${DIR}${lvl}`)
      .filter((f) => f.endsWith('.json'))
      .flatMap((f) => JSON.parse(readFileSync(`${DIR}${lvl}/${f}`, 'utf8')).questions),
  );

describe('مدرّب الامتحان — the exam coach of the exercise bank', () => {
  it('is a pilot on one lesson, with two modes', () => {
    expect(isCoachLesson('qasim-adad-tabii')).toBe(true);
    expect(isCoachLesson('muadalat-x-murabba')).toBe(false); // a lesson with no pack (jidhr-tarbii and natiqa-ghayr-natiqa have one since 2026-11-21)
    expect(MODES).toEqual(['guide', 'explain']);
  });

  it('finds the rule of the lesson behind EVERY question of the bank (172 questions)', async () => {
    expect(QUESTIONS.length).toBeGreaterThan(150);
    const seen = new Set();
    for (const q of QUESTIONS) {
      const rule = await loadRule('qasim-adad-tabii', primaryPoint(q));
      expect(rule, `${q.id} ${primaryPoint(q)}`).toBeTruthy();
      expect(rule.title && rule.rule && rule.hook && rule.trap && rule.exam).toBeTruthy();
      seen.add(rule.id);
    }
    expect(seen.size).toBe(4);
    expect(await loadRule('muadalat-x-murabba', '4am_muadalat-x-murabba_P1')).toBe(null);
    // unit 2, lesson 1 (2026-11-21): each الكفاءة finds its world's sheet
    expect((await loadRule('jidhr-tarbii', '4am_jidhr-tarbii_P1'))?.id).toBe('dil-as-saha');
    expect((await loadRule('jidhr-tarbii', '4am_jidhr-tarbii_P3'))?.id).toBe('dhahab-wa-iyab');
    // unit 2, lesson 2 (2026-11-21): P1 (classifying) and P2 share the 🧩 sheet; P3 finds the ♾️ one
    expect((await loadRule('natiqa-ghayr-natiqa', '4am_natiqa-ghayr-natiqa_P1'))?.id).toBe('murabba-natiq');
    expect((await loadRule('natiqa-ghayr-natiqa', '4am_natiqa-ghayr-natiqa_P2'))?.id).toBe('murabba-natiq');
    expect((await loadRule('natiqa-ghayr-natiqa', '4am_natiqa-ghayr-natiqa_P3'))?.id).toBe('la-kasr-yarkab');
  });

  it('GUIDE mode never contains the answer: no solution line, no result', async () => {
    for (const q of QUESTIONS) {
      const rule = await loadRule('qasim-adad-tabii', primaryPoint(q));
      const told = JSON.stringify([guideSteps(q, rule), notebookEntry(q, rule, 'guide', 'x')]);
      for (const line of q.solution?.lines ?? [])
        expect(told.includes(JSON.stringify(line).slice(1, -1)), `${q.id}: a solution line leaked`).toBe(false);
      expect(notebookEntry(q, rule, 'guide').some((l) => l.result)).toBe(false);
      expect(guideSteps(q, rule).map((s) => s.kind)).toEqual(['reread', 'rule', 'trap']);
    }
  });

  it('EXPLAIN mode tells the whole solution as a lesson: asked, rule, every line, the result, the trap, the exam tip, then « write it »', async () => {
    for (const q of QUESTIONS.filter((x) => x.solution?.lines?.length)) {
      const rule = await loadRule('qasim-adad-tabii', primaryPoint(q));
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
    const rule = await loadRule('qasim-adad-tabii', primaryPoint(q));
    const entry = notebookEntry(q, rule, 'guide', 'استعمل التعريف');
    expect(entry.map((l) => l.label)).toEqual(['السؤال', 'خطئي', 'لأتذكّر']);
    expect(entry[1].own).toBe(true);
  });
});
