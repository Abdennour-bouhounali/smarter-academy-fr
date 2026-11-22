// EVERY COPY IS EVIDENCE, WHATEVER HAPPENS (owner, 2026-11-19: « we do not care if the student leave or not, we must count
// evidence whatever happen »): a sheet handed in blank and sat again sends its answers the second time like the first, and
// opening a sitting then quitting costs nothing. The runtime's own method is played on a bare object (no 3D scene is built).
import { describe, it, expect } from 'vitest';
import { WorldRuntime } from './WorldRuntime';
import { createBankSittings } from './bankSitting';
import { allQuestions } from './sitting';
import { emptyExam } from './journey';
import { rng } from './random';

const sheet = (id) => ({
  id,
  metadata: { title: id, estimatedMinutes: 4, exam: { heading: 'Exercice', points: '02' } },
  statement: { content: 'On considère le nombre 30.' },
  questions: [
    {
      id: 'q1',
      step: '01',
      statement: 'x =',
      answerType: 'rational',
      expectedAnswer: '3',
      learningPoints: [{ code: 'g_toy_P1', role: 'primary' }],
      solution: { lines: ['3'] },
    },
  ],
});
const levels = [{ n: 1, title: 'one', sheets: 1 }];
const keyOf = { g_toy_P1: 'tens' };

/** A runtime reduced to what a sitting touches: the tally and the copy sent to the practice engine. */
function runtime(sittings) {
  const sent = [];
  let n = 0;
  const w = Object.create(WorldRuntime.prototype);
  Object.assign(w, {
    lesson: { sittings },
    exam: emptyExam(),
    tally: {},
    set() {},
    save() {},
    onSitting: (subject, answers) => sent.push(sittings.sheetOf(subject, answers, () => `u${(n += 1)}`)),
  });
  return { w, sent };
}
const right = (s) => Object.fromEntries(allQuestions(s).map((q) => [q.id, { value: q.bank.expectedAnswer }]));

describe('a sitting is evidence whatever happened before it', () => {
  it('a sheet handed in blank, then sat again and answered, sends its answers the second time', async () => {
    const sittings = createBankSittings({ lesson: 'toy', levels, load: async () => [sheet('ex-only')] });
    await sittings.prepare();
    const { w, sent } = runtime(sittings);

    const first = sittings.makeSubject(rng(1), 1, [], keyOf);
    w.handInSitting(first, {}); // blank: no answer to send (the server would read it as `abandoned`, inert)
    expect(sent[0].items).toEqual([]);

    const again = sittings.makeSubject(rng(2), 1, [], keyOf);
    expect(again.exercises[0].bankId).toBe('ex-only');
    w.handInSitting(again, right(again));
    expect(sent[1].items).toEqual([
      expect.objectContaining({ exerciseId: 'ex-only', questionId: 'q1', answer: { value: '3' }, outcome: 'correct' }),
    ]);
    expect(w.tally).toEqual({ tens: { ok: 1, n: 1 } });
  });

  it('opening a sitting and quitting costs nothing: nothing sent, nothing kept, the same sheets can come back', async () => {
    const sittings = createBankSittings({ lesson: 'toy', levels, load: async () => [sheet('ex-only')] });
    await sittings.prepare();
    const { w, sent } = runtime(sittings);
    const before = JSON.stringify(w.exam);
    sittings.makeSubject(rng(1), 1, [], keyOf); // shown…
    w.quitSitting.call({ state: { overlay: null } }); // …then « Quitter »
    expect(sent).toEqual([]);
    expect(JSON.stringify(w.exam)).toBe(before);
    expect(sittings.makeSubject(rng(3), 1, [], keyOf).exercises[0].questions.every((q) => q.counted)).toBe(true);
  });
});
