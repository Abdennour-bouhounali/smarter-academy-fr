import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/** Arithmétique décimale EXACTE (BigInt, centièmes) : « -0,3 » → -30n. */
const cent = (s) => {
  const t = String(s).replace(/\$/g, '').replace(/\{,\}/g, '.').replace(',', '.').replace(/−/g, '-').trim();
  const m = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(t);
  const v = BigInt(m[2]) * 100n + BigInt((m[3] ?? '').padEnd(2, '0') || '0');
  return m[1] === '-' ? -v : v;
};
const abs = (x) => (x < 0n ? -x : x);
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const batchOf = (id, part) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'batch');
const choicesOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const keyOf = (r) => r.options[r.correct];

describe('les مسائل du درس « الأعداد النسبية وسياقات استعمالها »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((p) => p.question));
  });

  it('مسألة 1 — [3, −2, −6, 0, 2] ; distance du mardi 6 ; le plus froid est le plus petit (mardi), pas le plus grand (dimanche) ; opposé de −2 = 2 (jeudi)', () => {
    const week = [3, -2, -6, 0, 2];
    const rows = batchOf('masala-1', 0).rows;
    week.forEach((v, i) => expect(cent(keyOf(rows[i])), `jour ${i}`).toBe(BigInt(v) * 100n));
    rows.forEach((r) => r.options.forEach((o, j) => { if (j !== r.correct) expect(cent(o)).not.toBe(cent(keyOf(r))); }));
    expect(expectedOf('masala-1', 0)).toEqual([abs(BigInt(week[2])) === 6n ? 6 : -1]);
    const lowest = week.indexOf(Math.min(...week));
    expect(['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'][lowest]).toBe('الثلاثاء');
    expect(choicesOf('masala-1', 1)[0].options[0]).toBe('الثلاثاء');
    expect(week.indexOf(Math.max(...week))).toBe(0); // le plus grand nombre : dimanche — faux comme réponse
    expect(expectedOf('masala-1', 2)).toEqual([-week[1]]);
    expect(week[4]).toBe(-week[1]);
    expect(choicesOf('masala-1', 2)[0].options[0]).toBe('الخميس');
    expect(PROBLEM['masala-1'].data.filter((d) => !d.useful).map((d) => d.id)).toEqual(['thermo']);
  });

  it('مسألة 2 — écarts 0 · 0,4 · −0,3 · 0,7 · −0,5 ; le plus chaud 2021, le plus froid 2022 ; le plus éloigné 2022 (0,5 > 0,3)', () => {
    const dev = { 2018: '0', 2019: '0,4', 2020: '-0,3', 2021: '0,7', 2022: '-0,5' };
    const rows = batchOf('masala-2', 0).rows;
    ['2019', '2020', '2021', '2022'].forEach((y, i) => expect(cent(keyOf(rows[i])), y).toBe(cent(dev[y])));
    rows.forEach((r) => r.options.forEach((o, j) => { if (j !== r.correct) expect(cent(o)).not.toBe(cent(keyOf(r))); }));
    const years = Object.keys(dev);
    const warmest = years.reduce((a, b) => (cent(dev[b]) > cent(dev[a]) ? b : a));
    const coldest = years.reduce((a, b) => (cent(dev[b]) < cent(dev[a]) ? b : a));
    expect([warmest, coldest]).toEqual(['2021', '2022']);
    expect(choicesOf('masala-2', 1)[0].options[0]).toContain('2021');
    expect(choicesOf('masala-2', 1)[0].options[0]).toContain('2022');
    expect(abs(cent('-0,5')) > abs(cent('-0,3'))).toBe(true);
    expect(cent('-0,5') < cent('-0,3')).toBe(true); // le plus petit nombre est le plus éloigné ici, mais pas par le signe
    expect(expectedOf('masala-2', 2)).toEqual([0.5]);
    expect(PROBLEM['masala-2'].source.elementId).toBe('deep-1');
  });

  it('مسألة 3 — −40 · 30 · 0 ; le plus bas est le chott (−40 < 30) ; le plus loin de la mer aussi (40 > 30) ; l\'opposé de 30 est −30', () => {
    const alt = [-40, 30, 0];
    const rows = batchOf('masala-3', 0).rows;
    alt.forEach((v, i) => expect(cent(keyOf(rows[i])), `altitude ${i}`).toBe(BigInt(v) * 100n));
    rows.forEach((r) => r.options.forEach((o, j) => { if (j !== r.correct) expect(cent(o)).not.toBe(cent(keyOf(r))); }));
    expect(-40 < 30 && Math.abs(-40) > Math.abs(30)).toBe(true);
    const [lower, farther] = choicesOf('masala-3', 1);
    expect(lower.options[lower.correct]).toContain('الشطّ');
    expect(farther.options[farther.correct]).toContain('الشطّ');
    const opp = choicesOf('masala-3', 2)[0];
    expect(opp.options[opp.correct]).toContain('-30');
    expect(PROBLEM['masala-3'].data.filter((d) => !d.useful).map((d) => d.id)).toEqual(['team']);
  });
});
