import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/** Arithmétique décimale EXACTE : « 3,205 » → { n: 3205n, k: 3 } ; comparaison. */
const dec = (s) => { const [i, f = ''] = String(s).replace(',', '.').split('.'); return { n: BigInt(i + f), k: f.length }; };
const cmp = (a, b) => { const k = Math.max(a.k, b.k); const p = a.n * 10n ** BigInt(k - a.k); const q = b.n * 10n ** BigInt(k - b.k); return p < q ? -1 : p > q ? 1 : 0; };
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const tex = (o) => o.replace(/\$/g, '').replace(/\{,\}/g, ',');
const chainOf = (o) => tex(o).split('<').map((x) => dec(x.trim()));
const choiceOf = (id, part, role) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'choice' && s.role === role);

describe('les مسائل du درس « مقارنة الأعداد العشرية وترتيبها »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((p) => p.question));
  });

  it('مسألة 1 — 3,25 > 3,205 ; 3,052 < 3,205 < 3,25 < 3,5 ; la plus lourde est la 3e', () => {
    const [b1, b2, b3, b4] = ['3,25', '3,205', '3,5', '3,052'].map(dec);
    expect(cmp(b1, b2)).toBe(1);
    expect(cmp(dec('3,25'), dec('3,250'))).toBe(0);
    expect(expectedOf('masala-1', 1)).toEqual([500]); // 3,5 = 3,500
    const asc = [b4, b2, b1, b3];
    asc.forEach((v, i) => { if (i) expect(cmp(asc[i - 1], v)).toBe(-1); });
    const order = choiceOf('masala-1', 1, 'conclude');
    order.options.forEach((o, j) => {
      const c = chainOf(o);
      const sorted = c.every((v, i) => i === 0 || cmp(c[i - 1], v) === -1);
      expect(sorted, `option ${j}`).toBe(j === order.correct);
    });
    // la conclusion de la partie 1 : seule « > » est vraie
    const concl = choiceOf('masala-1', 0, 'conclude');
    expect(tex(concl.options[concl.correct])).toBe('3,25>3,205');
    expect(cmp(b3, b1) > 0 && cmp(b3, b2) > 0 && cmp(b3, b4) > 0).toBe(true);
    // les compléments de zéros : 3,250 vaut 3,25 ; 3,025 non ; 3,205 non
    const zeros = choiceOf('masala-1', 0, 'translate');
    zeros.options.forEach((o, j) => expect(cmp(dec(tex(o)), dec('3,25')) === 0, o).toBe(j === zeros.correct));
  });

  it('مسألة 2 — 12,5 = 12,50 ; 12,5 > 12,05 > 11,95 ; seul 11,95 est sous 12', () => {
    expect(cmp(dec('12,5'), dec('12,50'))).toBe(0);
    const desc = [dec('12,5'), dec('12,05'), dec('11,95')];
    desc.forEach((v, i) => { if (i) expect(cmp(desc[i - 1], v)).toBe(1); });
    expect(expectedOf('masala-2', 1)).toEqual([11]);
    const order = choiceOf('masala-2', 1, 'conclude');
    order.options.forEach((o, j) => {
      const c = tex(o).split('>').map((x) => dec(x.trim()));
      const sorted = c.every((v, i) => i === 0 || cmp(c[i - 1], v) === 1);
      expect(sorted, `option ${j}`).toBe(j === order.correct);
    });
    // sous 12 : seulement 11,95 (12,05 > 12, 12,5 > 12)
    expect(['12,5', '12,50', '12,05', '11,95'].filter((v) => cmp(dec(v), dec('12')) < 0)).toEqual(['11,95']);
  });

  it('مسألة 3 — cartes 4, 0, 7, 1 : plus petit 0,147, plus grand 740,1 ; 4,107 > 4,017', () => {
    const digits = ['4', '0', '7', '1'];
    const perms = (arr) => (arr.length <= 1 ? [arr] : arr.flatMap((d, i) => perms([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [d, ...p])));
    const valid = new Set();
    for (const p of perms(digits)) {
      for (let after = 1; after <= 3; after += 1) {
        const s = `${p.slice(0, 4 - after).join('')},${p.slice(4 - after).join('')}`;
        const [i, f] = s.split(',');
        if (i.length > 1 && i.startsWith('0')) continue;
        if (f.endsWith('0')) continue;
        valid.add(s);
      }
    }
    const sorted = [...valid].sort((a, b) => cmp(dec(a), dec(b)));
    expect(sorted[0]).toBe('0,147');
    expect(sorted.at(-1)).toBe('740,1');
    expect(expectedOf('masala-3', 0)).toEqual([0.147]);
    expect(expectedOf('masala-3', 1)).toEqual([740.1]);
    expect(cmp(dec('4,107'), dec('4,017'))).toBe(1);
    expect(cmp(dec('741,0'), dec('740,1'))).toBe(1); // 741,0 est plus grand mais il a un zéro inutile : refusé
  });
});
