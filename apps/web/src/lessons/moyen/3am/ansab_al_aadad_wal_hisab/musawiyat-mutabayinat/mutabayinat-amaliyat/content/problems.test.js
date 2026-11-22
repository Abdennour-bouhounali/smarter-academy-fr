import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle en BigInt (indépendante de linear.js). */
const sOf = (e) => 50n - 3n * e;
const choiceOf = (id, part) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'choice');
const right = (id, part) => { const c = choiceOf(id, part); return c.options[c.correct]; };

describe('les مسائل du درس « المتباينات والعمليات »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — S = 50 − 3e : e > 8 ⟹ −3e < −24 ⟹ S < 26 ; 0 ≤ e ≤ 5 ⟹ 35 ≤ S ≤ 50 ; سلمى أكبر', () => {
    expect(right('masala-1', 0)).toBe('$-3e<-24$');
    expect(right('masala-1', 1)).toBe('$S<26$');
    expect(right('masala-1', 2)).toBe('$35\\leq S\\leq 50$');
    // témoins : tous les e entiers > 8 ; la clé vraie pour tous, chaque distracteur faux pour un témoin
    const es = []; for (let e = 9n; e < 60n; e += 1n) es.push(e);
    const preds0 = { '$-3e<-24$': (e) => -3n * e < -24n, '$-3e>-24$': (e) => -3n * e > -24n, '$3e<-24$': (e) => 3n * e < -24n, '$-3e>24$': (e) => -3n * e > 24n };
    const preds1 = { '$S<26$': (e) => sOf(e) < 26n, '$S>26$': (e) => sOf(e) > 26n, '$S<-26$': (e) => sOf(e) < -26n, '$S>74$': (e) => sOf(e) > 74n };
    for (const [part, preds] of [[0, preds0], [1, preds1]]) {
      const c = choiceOf('masala-1', part);
      expect(Object.keys(preds).sort()).toEqual([...c.options].sort());
      c.options.forEach((o, i) => expect(es.every(preds[o]), `${part} ${o}`).toBe(i === c.correct));
    }
    const eSalma = [0n, 1n, 2n, 3n, 4n, 5n];
    const preds2 = { '$35\\leq S\\leq 50$': (e) => 35n <= sOf(e) && sOf(e) <= 50n, '$50\\leq S\\leq 35$': (e) => 50n <= sOf(e) && sOf(e) <= 35n, '$-15\\leq S\\leq 0$': (e) => -15n <= sOf(e) && sOf(e) <= 0n, '$65\\leq S\\leq 80$': (e) => 65n <= sOf(e) && sOf(e) <= 80n };
    const c2 = choiceOf('masala-1', 2);
    c2.options.forEach((o, i) => expect(eSalma.every(preds2[o]), o).toBe(i === c2.correct));
    // salma
    const values = [0n, 1n, 2n, 3n, 4n, 5n].map(sOf);
    expect(values.reduce((a, b) => (a < b ? a : b))).toBe(35n);
    expect(values.reduce((a, b) => (a > b ? a : b))).toBe(50n);
    expect(35n > 26n).toBe(true);
    expect(sOf(9n)).toBe(23n);
  });

  it('مسألة 2 — 25x + 80 ≤ 630 ⟺ x ≤ 22 ; 23 صندوقًا : 655 > 630', () => {
    expect(right('masala-2', 0)).toBe('$25x+80\\leq 630$');
    expect(right('masala-2', 1)).toBe('$25x\\leq 550$');
    expect(right('masala-2', 2)).toBe('$x\\leq 22$');
    for (let x = 0n; x <= 40n; x += 1n) expect(25n * x + 80n <= 630n).toBe(x <= 22n);
    // e partie 2 et 3 : sur les x qui vérifient la condition, la clé est vraie et chaque distracteur faux pour un x
    const xs = []; for (let x = 0n; x <= 22n; x += 1n) xs.push(x);
    const p1 = { '$25x\\leq 550$': (x) => 25n * x <= 550n, '$25x\\geq 550$': (x) => 25n * x >= 550n, '$25x\\geq 710$': (x) => 25n * x >= 710n, '$25x\\leq 530$': (x) => 25n * x <= 530n };
    const p2 = { '$x\\leq 22$': (x) => x <= 22n, '$x\\geq 22$': (x) => x >= 22n, '$x\\leq 2$': (x) => x <= 2n, '$x\\leq 21$': (x) => x <= 21n };
    for (const [part, preds] of [[1, p1], [2, p2]]) {
      const c = choiceOf('masala-2', part);
      c.options.forEach((o, i) => expect(xs.every(preds[o]), `${part} ${o}`).toBe(i === c.correct));
    }
    expect(25n * 22n + 80n).toBe(630n);
    expect(25n * 23n + 80n).toBe(655n);
    expect(630n - 80n).toBe(550n);
    expect(550n / 25n).toBe(22n);
  });
  it('مسألة 3 — 12 < L < 15 : 40 < P < 46, 45 m indécidable, 46 m suffit, 96 < A < 120', () => {
    expect(right('masala-3', 0)).toBe('$40<P<46$');
    expect(right('masala-3', 3)).toBe('$96<A<120$');
    const Ls = []; for (let n = 1201n; n < 1500n; n += 1n) Ls.push(n); // L en centièmes
    const P = (L) => 2n * L + 1600n; // en centièmes
    expect(Ls.every((L) => P(L) > 4000n && P(L) < 4600n)).toBe(true);
    expect(Ls.some((L) => P(L) < 4500n) && Ls.some((L) => P(L) > 4500n)).toBe(true);
    expect(Ls.every((L) => P(L) < 4600n)).toBe(true);
    expect(Ls.every((L) => 8n * L > 9600n && 8n * L < 12000n)).toBe(true);
    expect(PROBLEM['masala-3'].parts[1].steps.find((s) => s.kind === 'choice').options[0]).toContain('لا يمكن الجزم');
  });
});
