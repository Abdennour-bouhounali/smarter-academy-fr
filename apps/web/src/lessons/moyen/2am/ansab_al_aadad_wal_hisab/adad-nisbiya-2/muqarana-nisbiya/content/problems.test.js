import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle (centièmes, BigInt), indépendante de relative.js. */
const num = (s) => { const t = String(s).replace(/\{,\}/g, '.').replace(/,/g, '.').replace(/\$/g, '').replace(/\s/g, ''); const m = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(t); const v = BigInt(m[2]) * 100n + BigInt((m[3] ?? '').padEnd(2, '0').slice(0, 2) || '0'); return m[1] === '-' ? -v : v; };
const choice = (id, part, i = 0) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice')[i];
const answer = (id, part, ask) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'numeric' && s.ask === ask).expected;
const right = (c) => c.options[c.correct].replace(/\$/g, '');
const chainOK = (s) => { const sym = s.includes('<') ? '<' : '>'; const v = s.replace(/\$/g, '').split(sym).map((x) => num(x)); return v.every((x, i) => i === 0 || (sym === '<' ? v[i - 1] < x : v[i - 1] > x)); };
const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const temps = LESSON_CONFIG.lessonProblem.table.rows[0].slice(1);

describe('les مسائل du درس « مقارنة وترتيب أعداد نسبية »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — le registre : le plus froid, le plus chaud, le rangement, le nombre de jours', () => {
    const v = temps.map(num);
    const coldest = days[v.indexOf(v.reduce((a, b) => (a < b ? a : b)))];
    const warmest = days[v.indexOf(v.reduce((a, b) => (a > b ? a : b)))];
    expect(choice('masala-1', 0, 0).options[choice('masala-1', 0, 0).correct]).toBe(coldest);
    expect(choice('masala-1', 0, 1).options[choice('masala-1', 0, 1).correct]).toBe(warmest);
    const c = choice('masala-1', 1);
    expect(chainOK(right(c)) && right(c).includes('<')).toBe(true);
    const negs = v.filter((x) => x < 0n).sort((a, b) => (a < b ? -1 : 1));
    expect(right(c).split('<').map(num)).toEqual(negs);
    c.options.forEach((o, k) => expect(chainOK(o.replace(/\$/g, '')), o).toBe(k === c.correct));
    expect(answer('masala-1', 2, 0)).toBe(v.filter((x) => x < num('-1')).length);
    const t = choice('masala-1', 2);
    expect(num(right(t)) < num('-1')).toBe(true);
    t.options.forEach((o, k) => expect(num(o.replace(/\$/g, '')) < num('-1'), o).toBe(k === t.correct));
  });

  it('مسألة 2 — altitudes : la plus basse, la plus proche, l’ordre, la profondeur entre deux', () => {
    const things = { النورس: '8,5', السمكة: '-3,25', الغوّاص: '-12,5', الغواصة: '-41' };
    const lowest = Object.entries(things).sort((a, b) => (num(a[1]) < num(b[1]) ? -1 : 1))[0][0];
    const nearest = Object.entries(things).sort((a, b) => { const x = num(a[1]); const y = num(b[1]); const ax = x < 0n ? -x : x; const ay = y < 0n ? -y : y; return ax < ay ? -1 : 1; })[0][0];
    expect(choice('masala-2', 0, 0).options[choice('masala-2', 0, 0).correct]).toBe(lowest);
    expect(choice('masala-2', 0, 1).options[choice('masala-2', 0, 1).correct]).toBe(nearest);
    const c = choice('masala-2', 1);
    c.options.forEach((o, k) => expect(chainOK(o), o).toBe(k === c.correct));
    expect(right(c).includes('>')).toBe(true);
    const b = choice('masala-2', 2);
    b.options.forEach((o, k) => { const x = num(o); expect(x > num('-41') && x < num('-12,5'), o).toBe(k === b.correct); });
  });

  it('مسألة 3 — soldes : le plus endetté, le rangement, le nombre au-dessus de −2500', () => {
    const bal = { سلمى: '3400', كريم: '-2750', ليلى: '-2075', ياسين: '0', سفيان: '-3000' };
    const lowest = Object.entries(bal).sort((a, b) => (num(a[1]) < num(b[1]) ? -1 : 1))[0][0];
    expect(choice('masala-3', 0).options[choice('masala-3', 0).correct]).toBe(lowest);
    const c = choice('masala-3', 1);
    c.options.forEach((o, k) => expect(chainOK(o), o).toBe(k === c.correct));
    expect(right(c).split('<').map(num)).toEqual(Object.values(bal).map(num).sort((a, b) => (a < b ? -1 : 1)));
    expect(answer('masala-3', 2, 0)).toBe(Object.values(bal).filter((x) => num(x) > num('-2500')).length);
    const t = choice('masala-3', 2);
    t.options.forEach((o, k) => expect(num(o) > num('-2500'), o).toBe(k === t.correct));
  });
});
