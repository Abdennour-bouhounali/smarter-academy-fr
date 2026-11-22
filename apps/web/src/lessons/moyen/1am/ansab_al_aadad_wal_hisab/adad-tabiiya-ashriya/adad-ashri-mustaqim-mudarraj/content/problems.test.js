import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/** Arithmétique décimale EXACTE (BigInt, millièmes) : « 14,3 » → 14300n. */
const milli = (s) => {
  const t = String(s).replace(/\$/g, '').replace(/\{,\}/g, '.').replace(',', '.').trim();
  const [i, f = ''] = t.split('.');
  return BigInt(i) * 1000n + BigInt((f + '000').slice(0, 3));
};
const TICK = milli('0,1');
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceOf = (id, part, role) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'choice' && s.role === role);
const batchOf = (id, part) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'batch');

describe('les مسائل du درس « الأعداد العشرية ونصف المستقيم المدرّج »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((p) => p.question));
  });

  it('مسألة 1 — dix graduations par mètre ; 2 m + 4 graduations = 2,4 ; 1 + 7/10 = 1,7 ; 0,8 < 1,7 < 2,4', () => {
    expect(expectedOf('masala-1', 0)).toEqual([10]);
    expect(milli('1') / TICK).toBe(10n); // dix graduations de 0,1 dans l'unité
    expect(2n * 1000n + 4n * TICK).toBe(milli('2,4'));
    expect(1n * 1000n + 7n * TICK).toBe(milli('1,7'));
    const rows = batchOf('masala-1', 1).rows;
    expect(milli(rows[0].options[rows[0].correct])).toBe(milli('2,4'));
    expect(milli(rows[1].options[rows[1].correct])).toBe(milli('1,7'));
    rows.forEach((r) => r.options.forEach((o, j) => { if (j !== r.correct) expect(milli(o)).not.toBe(milli(r.options[r.correct])); }));
    const trans = choiceOf('masala-1', 1, 'translate');
    expect(milli(trans.options[trans.correct])).toBe(milli('2,4'));
    const order = choiceOf('masala-1', 2, 'conclude');
    order.options.forEach((o, j) => {
      const v = o.replace(/\$/g, '').replace(/\{,\}/g, ',').split('<').map(milli);
      const sorted = v.every((x, i) => i === 0 || v[i - 1] < x);
      expect(sorted, `option ${j}`).toBe(j === order.correct);
      expect([...v].sort((x, y) => (x < y ? -1 : 1)).join()).toBe([milli('0,8'), milli('1,7'), milli('2,4')].join());
    });
    expect(PROBLEM['masala-1'].data.filter((d) => !d.useful).map((d) => d.id)).toEqual(['buttons']);
  });

  it('مسألة 2 — T = 14 + 3/10 = 14,3 ; S = 14,9 ; P entre 14,5 et 14,6 ; O(0) ; S est la plus proche de 15', () => {
    const rows = batchOf('masala-2', 0).rows;
    expect(milli(rows[0].options[rows[0].correct])).toBe(14n * 1000n + 3n * TICK);
    expect(milli(rows[1].options[rows[1].correct])).toBe(14n * 1000n + 9n * TICK);
    rows.forEach((r) => r.options.forEach((o, j) => { if (j !== r.correct) expect(milli(o)).not.toBe(milli(r.options[r.correct])); }));
    // P : entre la 5e et la 6e graduation après 14 → [14,5 ; 14,6], consécutives
    expect(14n * 1000n + 5n * TICK).toBe(milli('14,5'));
    expect(14n * 1000n + 6n * TICK).toBe(milli('14,6'));
    const conclude = choiceOf('masala-2', 1, 'conclude');
    expect(conclude.options[conclude.correct]).toBe('$14{,}5<P<14{,}6$');
    // la proximité à la borne 15 : 15 − 14,9 = 0,1 < 15 − 14,3 = 0,7
    expect(milli('15') - milli('14,9')).toBe(TICK);
    expect(milli('15') - milli('14,3')).toBe(7n * TICK);
    const nearest = PROBLEM['masala-2'].parts[2].steps.find((st) => st.kind === 'choice' && st.ask === 1);
    expect(nearest.options[nearest.correct]).toContain('S');
  });

  it('مسألة 3 — 2,9 < 3 ; 3 × 4 cm = 12 cm ; la graduation vaut 40 mm / 10 = 4 mm ; 2 × 10 + 9 = 29 graduations', () => {
    expect(milli('2,9') < milli('3')).toBe(true);
    expect(3 * 4).toBe(12); // la 3e marque tombe pile au bord de la page
    expect(expectedOf('masala-3', 1)).toEqual([40, 4]);
    expect(4 * 10).toBe(40);
    expect(40 / 10).toBe(4);
    expect(expectedOf('masala-3', 2)).toEqual([20, 29]);
    expect(2 * 10 + 9).toBe(29);
    expect(milli('2,9') / TICK).toBe(29n);
    // avec une unité de 5 cm la marque 3 sortirait de la page (15 > 12) : l'unité de 4 cm est la bonne
    expect(3 * 5 > 12 && 3 * 4 <= 12).toBe(true);
  });
});
