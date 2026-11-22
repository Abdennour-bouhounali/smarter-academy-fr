import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import MooringLines, { ruleOptions, unitOptions } from './MooringLines';
import { LEVELS } from '../levels';
import * as L from '../logic/mooringLines';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<MooringLines {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.mooringLines.${key}`, o);
const LV = LEVELS['mooring-lines'];

describe('mooring-lines — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : la vue d'ensemble, le quai, le curseur, le cadran, les commandes ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      expect(out).toContain('data-mooring-lines');
      expect(out).toContain('data-ml-glance');
      for (const hook of ['data-ml-scene', 'data-ml-clip', 'role="slider"', 'data-ml-dial', 'data-ml-rank="0"', 'data-ml-lay', 'data-ml-less', 'data-ml-more', 'data-ml-free', 'data-ml-free-a', 'data-ml-free-b', 'data-lab-stepper']) expect(out, hook).toContain(hook);
      expect(out).toContain('data-ml-verdict=""');
      expect(out).not.toContain('data-ml-next');
      expect(out).not.toContain('data-ml-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['m', 'dm', 'cm', 'x'].includes(w));
      expect(words).toEqual([]);
    });
  }
  it('مبتدئ : le cadran n’ouvre que le rang 0 ; pas de choix d’unité', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toMatch(/data-ml-rank="1"[^>]*disabled/);
    expect(out).toMatch(/data-ml-rank="2"[^>]*disabled/);
    expect(out).not.toContain('data-ml-unit-opt');
    expect(out).toContain('data-ml-clip');
  });
  it('متقدم : le curseur est verrouillé tant que l’unité n’est pas choisie ; les trois unités sont proposées', () => {
    const out = html({ ...LV.advanced.numbers, level: 'advanced' });
    expect(out).toContain('data-locked="true"');
    for (const u of ['m', 'dm', 'cm']) expect(out).toContain(`data-ml-unit-opt="${u}"`);
  });
  it('ouvre sur son CONTEXTE puis UNE question qui nomme le but (§17.9), sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t.indexOf('حرّك المشبك لتجد')).toBeGreaterThan(t.indexOf('يريد ياسين'));
  });
  it('les réfutations de la règle citent SES produits', () => {
    let s = L.init({ tasks: [{ id: 'k1', kind: 'share', a: '10', b: '7' }] });
    const wrong = ruleOptions(s, k).filter((o) => !o.correct).map((o) => renderToString(<span>{o.why}</span>)).join(' ');
    expect(ruleOptions(s, k).filter((o) => o.correct)).toHaveLength(1);
    expect(text(wrong)).toContain('9,94');
    expect(text(wrong)).toContain('10,01');
    const u = unitOptions(L.init(LV.advanced.numbers), k);
    expect(u.filter((o) => o.correct)).toHaveLength(1);
  });
});

describe('mooring-lines — questions pendant le labo (LabCheckpoint)', () => {
  const check = (q, tag) => {
    const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
    expect(out, tag).not.toMatch(RAW);
    expect(out, tag).not.toContain('{{');
    expect(q.hints, tag).toHaveLength(2);
    if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), tag).toHaveLength(1);
    else expect(q.expected, tag).toBeTruthy();
  };
  const solve = (s) => {
    for (let g = 0; g < 60 && !L.taskDone(s); g += 1) {
      if (L.clipLocked(s)) s = L.setUnit(s, 'dm');
      if (L.bracketFound(s)) { s = L.setRank(s, s.w.rank + 1); continue; }
      const t = L.taskOf(s);
      const br = Math.floor(0); void br;
      const lo = s.w.lo ?? 0;
      // un élève méthodique : le plus grand q qui tient, puis le plus petit qui déborde
      let n = s.w.w1; let cand = null;
      for (let q = s.w.w0; q <= s.w.w1; q += 1) { const m = L.measure(s, q); if (m.verdict === 'over') { cand = q; break; } n = q; }
      s = L.lay(L.setQ(s, n)); s = L.lay(L.setQ(s, cand ?? s.w.w1));
      void lo; void t;
    }
    return s;
  };
  it('chaque question des suites r1 … r3, a1 … a3 et k1 : texte, deux indices, une seule bonne réponse, ni clé brute ni {{', async () => {
    const { CHAINS, QUESTIONS } = await import('./MooringLines');
    const run = (numbers) => {
      let s = L.init(numbers);
      const seen = [];
      for (let i = 0; i < s.tasks.length; i += 1) {
        s = solve(s);
        expect(L.taskDone(s), `tâche ${i}`).toBe(true);
        for (const qid of CHAINS[s.tasks[i].id]) { const q = QUESTIONS[qid](s, s.tasks[i], k); check(q, `${s.tasks[i].id}.${qid}`); seen.push([s.tasks[i].id, qid, q]); }
        if (i < s.tasks.length - 1) s = L.nextTask(s);
      }
      return seen;
    };
    const b = run(LV.beginner.numbers);
    expect(b.find(([t, q]) => t === 'r1' && q === 'leftA')[2].expected).toBe('0,2');
    expect(b.find(([t, q]) => t === 'r1' && q === 'leftB')[2].expected).toBe('0,02');
    expect(b.find(([t, q]) => t === 'r2' && q === 'prod')[2].expected).toBe('9');
    const a = run(LV.advanced.numbers);
    expect(a.find(([t, q]) => t === 'a1' && q === 'lineLen')[2].expected).toBe('7');
    expect(a.find(([t, q]) => t === 'a2' && q === 'prod')[2].expected).toBe('13,5');
    run({ tasks: [{ id: 'k1', kind: 'share', a: '10', b: '7', maxRank: 2 }] });
  });
});

describe('mooring-lines — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('مبتدئ et متقدم : ni la progression ni le bouton d’indice ; une tâche hors `CHAINS` : les deux restent ; les étapes sont un LabStepper', () => {
    for (const level of ['beginner', 'advanced']) {
      const out = html({ ...LV[level].numbers, level });
      expect(out).not.toContain('data-manipulation-progress');
      expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
      expect(out).toContain('data-lab-stepper');
    }
    const r = html({ tasks: [{ id: 'zz', kind: 'share', a: '8', b: '3' }], levels: false });
    expect(r).toContain('data-manipulation-progress');
    expect(r).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
