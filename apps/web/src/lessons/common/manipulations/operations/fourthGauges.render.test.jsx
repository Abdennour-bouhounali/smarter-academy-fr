import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import FourthGauges, { discoveryOptions, discoveryKey, numbersFor, contextOf, columnText, gaugeNames, gaugeView, chainOf, QUESTIONS } from './FourthGauges';
import { layout, labelBoxes, overlaps, tiltOf, splitLabel, labelLines, gaugeGeo, MAX_TILT, xOfValue, valueOfX } from './fourthGauges/geometry';
import { LEVELS } from '../levels';
import * as L from '../logic/fourthGauges';
import * as F from '@smarter-academy/core/arithmetic/fourthProportional.js';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<FourthGauges {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const k = (key, o) => i18n.t(`lesson:manipulation.fourthGauges.${key}`, o);
const LV = LEVELS['fourth-gauges'];
const cases = { beginner: { level: 'beginner' }, advanced: { level: 'advanced' } };
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));

describe('fourth-gauges — rendu', () => {
  for (const [name, props] of Object.entries(cases)) {
    it(`${name}: the glance, the stage, the board, the knob slider, the gauges, −/+, the input; no raw key, no Latin prose`, () => {
      const out = html(props);
      expect(out).toContain('data-fourth-gauges');
      expect(out).toContain('data-world="market"');
      expect(out).toContain(`data-level="${name}"`);
      expect(out).toContain('data-fg-glance');
      expect(out).toContain('data-fg-stage');
      expect(out).toContain('data-fg-svg');
      for (const c of ['a', 'b', 'c', 'd']) expect(out).toContain(`data-fg-cell="${c}"`);
      expect(out.match(/data-hole="true"/g)).toHaveLength(1);
      expect(out).toContain('data-fg-knob');
      expect(out).toContain('role="slider"');
      expect(out).toContain('data-fg-ruler');
      for (const g of ['unit', 'between', 'cross']) expect(out).toContain(`data-fg-gauge="${g}"`);
      expect(out).toContain('data-fg-lamp');
      expect(out).toContain('data-fg-less');
      expect(out).toContain('data-fg-more');
      expect(out).toContain('data-fg-input');
      expect(out).toContain('data-fg-readout');
      expect(out).toContain('data-fg-stepper');
      expect(out).toContain('data-fg-verdict=""');
      expect(out).toContain('data-fg-kid');
      expect(out).toContain('data-mood="neutral"');
      expect(out).toContain('data-fg-free');
      expect(out).toContain('data-fg-free-a');
      expect(out).toContain('data-fg-free-b');
      expect(out).toContain('data-fg-free-c');
      expect(out).not.toContain('data-fg-next');
      expect(out).not.toContain('data-fg-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []);
      // seules les unités des lignes (kg, DA, L, m) et les lettres a, b, c de « جرّب أعدادك » sont latines
      expect(words.filter((w) => !['kg', 'DA', 'Enter'].includes(w))).toEqual([]);
    });
  }

  it('beginner opens on open gauges (tilting, not covered); advanced opens on COVERED gauges', () => {
    const b = html(cases.beginner);
    expect(b).not.toContain('data-state="covered"');
    expect(b).toMatch(/data-fg-gauge="unit" data-state="(lt|gt)"/);
    expect(b).toContain('data-fg-lamp="true" data-lit="false"');
    expect(b).not.toContain('data-fg-gauge="diff"'); // le leurre n'est que dans la 3e tâche
    const a = html(cases.advanced);
    for (const g of ['unit', 'between', 'cross']) expect(a).toContain(`data-fg-gauge="${g}" data-state="covered"`);
    expect(a).toContain('data-fg-cover="true"');
  });

  it('opens on its CONTEXT then ONE question that names the goal (§17.9) — no visible title; every number in the context, none in the question', () => {
    const out = html(cases.beginner);
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t).toContain(k('question.generic'));
    expect(t.indexOf('في السوق عمودان')).toBeGreaterThan(-1);
    expect(t.indexOf('في السوق عمودان')).toBeLessThan(t.indexOf(k('question.generic')));
    expect(out).toContain('class="sr-only"');
    expect(k('question.generic')).not.toMatch(/\d/);
    expect(k('question.decoy')).not.toMatch(/\d/);
    const ctx = out.match(/<p[^>]*data-lab-context[^>]*>[\s\S]*?<\/p>/)[0];
    for (const n of ['4', '520', '6']) expect(ctx).toContain(`⁦${n}⁩`);
    expect(ctx).toContain('التفاح');
    expect(ctx).toContain('خانة ناقصة');
    const adv = text(html(cases.advanced));
    expect(adv).toContain('2,5');
    expect(adv).toContain('325');
  });

  it('the context of every preset task carries ALL its numbers and names its missing cell', () => {
    for (const lv of ['beginner', 'advanced']) {
      for (const task of L.init(LV[lv].numbers).tasks) {
        const c = contextOf(task, k).replace(/[⁦⁩]/g, '');
        for (const v of Object.values(task.nums)) expect(c, `${lv} ${task.hole} ${v}`).toContain(String(v));
        expect(c).toContain('خانة ناقصة');
        expect(c.split('خانة ناقصة')).toHaveLength(2);
      }
    }
    const hc = columnText(L.init(LV.beginner.numbers).tasks[1], 1, k);
    expect(hc).toContain('خانة ناقصة');
    expect(hc).toContain('1400');
  });

  it('numbers are LTR isolates with a decimal COMMA — never an ASCII point or a bare number', () => {
    const adv = html(cases.advanced);
    expect(adv).toContain('⁦2,5⁩');
    expect(adv).toContain('<bdi dir="ltr"');
    expect(text(adv)).not.toMatch(/\d\.\d/);
    expect(adv.match(/<text[^>]*unicode-bidi:isolate[^>]*>/g).length).toBeGreaterThan(8);
  });

  it('says each thing ONCE: the gesture line is the idle verdict, not repeated as a hint', () => {
    const t = text(html(cases.beginner));
    expect(t.split(k('idle')).length - 1).toBe(1);
    expect(t.split(k('question.generic')).length - 1).toBe(1);
    for (const h of [0, 1, 2]) {
      expect(k(`hints.${h}`)).not.toContain('اسحب');
      expect(k(`hints.${h}`)).not.toMatch(/\d/);
    }
  });

  it('the coach never states the rule or the number; the coach targets exist on the first screen', () => {
    for (const id of ['grab', 'try', 'gauge', 'decoy', 'next']) {
      expect(k(`coach.${id}`)).not.toMatch(/متساوي|يتوازن|الجداء|تتوازن|أصغر|أكبر|\d/);
    }
    const out = html(cases.beginner);
    for (const target of ['data-fg-knob', 'data-fg-stepper', 'data-fg-gauge="cross"']) expect(out).toContain(target);
    // la tâche à leurre, montée seule : la balance « الفرق » est la cible du coach
    const decoy = html({ tasks: [LV.beginner.numbers.tasks[2]], level: 'beginner' });
    expect(decoy).toContain('data-fg-gauge="diff"');
    expect(decoy).toContain(k('question.decoy'));
  });

  it('discovery options refute with the student’s own trials and have exactly one correct answer', () => {
    const s = L.init(LV.beginner.numbers);
    const opts = discoveryOptions(s, false, k);
    expect(opts.filter((o) => o.correct)).toHaveLength(1);
    expect(opts[1].correct).toBe(true);
    expect(opts[0].why).toContain('780');
    expect(opts[2].why).toContain('404');
    expect(discoveryKey(false)).toBe('together');
    expect(discoveryKey(true)).toBe('add');
    const adv = discoveryOptions(L.init(LV.advanced.numbers), true, k);
    expect(adv.filter((o) => o.correct)).toHaveLength(1);
    expect(adv[0].why).toContain('12');
    expect(adv[0].why).toContain('18');
    expect(adv[0].why).toContain('9');
    expect(adv[0].why).toContain('4,5');
  });

  it('the textbook-free wording and no rule before the discovery', () => {
    const all = JSON.stringify(i18n.t('lesson:manipulation.fourthGauges', { returnObjects: true }));
    expect(all.length).toBeGreaterThan(1500);
    expect(all).not.toMatch(/الكتاب|ص \d/);
    for (const key of ['context.generic', 'question.generic', 'question.decoy', 'idle', 'v.wrong']) {
      expect(k(key, { c1: '', c2: '' })).not.toMatch(/الجداءان المتصالبان|مساواة الجداءين|a × d/);
    }
  });

  it('numbersFor: the level gives the tasks, the lesson may give its own', () => {
    expect(numbersFor({ level: 'advanced' }).tasks).toBe(LV.advanced.numbers.tasks);
    expect(numbersFor({ level: 'beginner' }).world).toBe('market');
    const mine = [{ hole: 'd', a: '5', b: '625', c: '6', rows: ['البرتقال (kg)', 'الثمن (DA)'], step: '1', max: '2250' }];
    expect(numbersFor({ tasks: mine, level: 'beginner' }).tasks).toBe(mine);
    const out = html({ tasks: mine, level: 'beginner' });
    expect(text(out)).toContain('البرتقال');
    expect(out).toContain('data-fg-gauge="cross"');
  });

  it('the gauge names follow the unit of row 1 (kilo, litre…)', () => {
    const [t0] = L.init(LV.beginner.numbers).tasks;
    expect(gaugeNames(t0, k).unit).toBe('في الكيلو');
    const t4 = L.init(LV.advanced.numbers).tasks[3]; // m²
    expect(gaugeNames(t4, k).unit).toBe('في المتر المربع');
    expect(gaugeNames({ rows: ['السلعة', 'الثمن'] }, k).unit).toBe('في الواحدة');
  });

  it('gaugeView: covered, open (tilt toward the heavier side), off', () => {
    const s = L.init(LV.beginner.numbers);
    const names = gaugeNames(L.taskOf(s), k);
    const open = gaugeView(s, 'unit', L.gaugesShown({ ...s, hh: 50000 }), names, k);
    expect(open).toMatchObject({ state: 'gt', left: '130', right: '500/6' });
    expect(open.deg).toBeLessThan(0); // le côté GAUCHE descend
    expect(open.dL).toBeGreaterThan(open.dR);
    const eq = gaugeView(s, 'cross', L.gaugesShown({ ...s, hh: 78000 }), names, k);
    expect(eq).toMatchObject({ state: 'eq', deg: 0, left: '3120', right: '3120' });
    expect(gaugeView(s, 'unit', null, names, k)).toMatchObject({ state: 'covered', deg: 0, left: '؟' });
    const c = { ...L.init({ tasks: [LV.beginner.numbers.tasks[1]] }) };
    expect(gaugeView(c, 'unit', L.gaugesShown(c), names, k).state).toBe('off');
  });
});

describe('fourth-gauges — la scène : aucune étiquette ne se chevauche', () => {
  /** Les largeurs de scène aux cinq tailles : colonne de leçon ≈ 414 px à 1024×768, jusqu’à un grand écran. */
  const WIDTHS = [340, 378, 396, 420, 520, 532, 600, 640, 700, 760, 850, 1100];
  const taskSets = [...L.init(LV.beginner.numbers).tasks, ...L.init(LV.advanced.numbers).tasks, ...L.normalizeTasks([
    { hole: 'd', a: '12,5', b: '3125', c: '8,5', rows: ['مساحة الجدار (m²)', 'الدهان (L)'], step: '1', max: '9000' },
    { hole: 'c', a: '0,5', b: '1250', d: '99999', rows: ['الكتلة الإجمالية للبطاطا (kg)', 'الثمن (DA)'], step: '1', max: '50000', decoy: false },
  ].slice(0, 1))];

  function stateFor(geo, task, nG, open) {
    const values = { ...task.nums, [task.hole]: task.answer };
    const ids = ['unit', 'between', 'cross', 'diff'].slice(0, nG);
    const gaugesAtAns = F.gauges(task.hole, task.nums, F.parse(task.answer), { decoy: true });
    const names = { unit: 'في المتر المربع', between: 'بين العمودين', cross: 'الجداءان', diff: 'الفرق' };
    return {
      rows: task.rows, values, maxText: String(task.maxH / 100).replace('.', ','),
      open,
      gauges: ids.map((id) => {
        const g = gaugesAtAns[id];
        return { id, name: names[id], left: F.showValue(g.left.value ?? F.parse('1')), right: F.showValue(g.right.value ?? F.parse('1')),
          capL: `${F.showValue(g.left.x)} ${g.left.op} ${F.showValue(g.left.y)}`, capR: `${F.showValue(g.right.x)} ${g.right.op} ${F.showValue(g.right.y)}` };
      }),
    };
  }

  it('lignes, cartes, puces, nombres, noms, légendes et plateaux ne se touchent jamais : 12 largeurs, 3 ou 4 balances, ouvertes ou non', () => {
    let checked = 0;
    const problems = [];
    for (const W of WIDTHS) {
      for (const nG of [3, 4]) {
        const geo = layout(W, nG);
        for (const task of taskSets) {
          for (const open of [false, true]) {
            const boxes = labelBoxes(geo, stateFor(geo, task, nG, open));
            const where = `W${W} nG${nG} ${task.hole}${task.answer} open${open}`;
            for (const pair of overlaps(boxes)) problems.push(`${where}: ${pair.join('×')}`);
            for (const b of boxes) {
              if (b.box.x0 < -0.5 || b.box.x1 > W + 0.5 || b.box.y0 < -0.5 || b.box.y1 > geo.H + 0.5) problems.push(`${where}: ${b.id} hors de la scène`);
            }
            checked += 1;
          }
        }
      }
    }
    expect(problems.slice(0, 8)).toEqual([]);
    expect(checked).toBeGreaterThan(200);
  });

  it('la mise en page : la planche à droite des balances de la cliente, les balances de droite à gauche, la règle sous elles, rien hors de la scène', () => {
    for (const W of WIDTHS) {
      const geo = layout(W, 4);
      expect(geo.board.x0).toBe(geo.kidW);
      expect(geo.cells.a.x0).toBeGreaterThan(geo.cells.c.x1); // le tableau se lit de droite à gauche
      expect(geo.rows[0].x0).toBeGreaterThan(geo.cells.a.x1);
      expect(geo.cells.b.y0).toBeGreaterThan(geo.cells.a.y1);
      expect(geo.gauges[0].x1).toBeGreaterThan(geo.gauges[3].x1); // la 1re balance est à droite
      expect(geo.gauges[0].y0).toBeGreaterThan(geo.board.y1);
      expect(geo.ruler.y0).toBeGreaterThanOrEqual(geo.gauges[0].y1);
      expect(geo.ruler.tx0).toBeGreaterThanOrEqual(geo.board.x0);
      expect(geo.ruler.tx1).toBeLessThanOrEqual(geo.board.x1);
      expect(geo.H).toBeLessThanOrEqual(400);
      expect(geo.kid.top).toBeGreaterThan(geo.aw);
      expect(geo.cw).toBeGreaterThanOrEqual(60);
    }
    expect(layout(396, 3).roomy).toBe(false);
    expect(layout(1100, 3).roomy).toBe(true);
  });

  it('la poignée : la valeur et l’abscisse sont réciproques ; la règle est bornée', () => {
    const geo = layout(600, 3);
    for (const v of [0, 100, 78000, 156000]) expect(Math.round(valueOfX(geo, xOfValue(geo, v, 156000), 156000))).toBe(v);
    expect(xOfValue(geo, -5, 1000)).toBe(geo.ruler.tx0);
    expect(xOfValue(geo, 99999, 1000)).toBe(geo.ruler.tx1);
  });

  it('l’inclinaison : 0 à l’égalité, de 3° à MAX_TILT° sinon, vers le côté le plus lourd, jamais plus', () => {
    expect(tiltOf('eq', 1, 1)).toBe(0);
    expect(tiltOf('off', 1, 2)).toBe(0);
    expect(tiltOf('covered', 1, 2)).toBe(0);
    expect(tiltOf('gt', 130, 83)).toBeLessThan(0);
    expect(tiltOf('lt', 130, 200)).toBeGreaterThan(0);
    expect(Math.abs(tiltOf('gt', 100000, 1))).toBe(MAX_TILT);
    expect(Math.abs(tiltOf('gt', 1001, 1000))).toBeGreaterThanOrEqual(3);
    for (let r = 1; r <= 400; r += 3) expect(Math.abs(tiltOf('gt', r, 100))).toBeLessThanOrEqual(MAX_TILT);
  });

  it('un plateau reste à l’intérieur de sa balance, quelle que soit l’inclinaison', () => {
    for (const W of WIDTHS) {
      const geo = layout(W, 4);
      for (const g of geo.gauges) {
        for (const deg of [-MAX_TILT, 0, MAX_TILT]) {
          const gg = gaugeGeo(geo, g, deg);
          expect(gg.left.x - 13).toBeGreaterThanOrEqual(g.x0 - 0.5);
          expect(gg.right.x + 13).toBeLessThanOrEqual(g.x1 + 0.5);
          expect(gg.left.y + gg.dishDrop + 7).toBeLessThan(gg.baseY + 6);
          expect(gg.right.y + gg.dishDrop + 7).toBeLessThan(gg.baseY + 6);
        }
      }
    }
  });

  it('splitLabel / labelLines : le nom, l’unité, des lignes qui tiennent dans la colonne des noms', () => {
    expect(splitLabel('التفاح (kg)')).toEqual({ name: 'التفاح', unit: 'kg' });
    expect(splitLabel('الثمن')).toEqual({ name: 'الثمن', unit: '' });
    expect(labelLines('مساحة الجدار (m²)', 8)).toEqual({ lines: ['مساحة', 'الجدار'], unit: 'm²' });
    expect(labelLines('مساحة الجدار (m²)', 20)).toEqual({ lines: ['مساحة الجدار'], unit: 'm²' });
  });
});

describe('fourth-gauges — questions pendant le labo (LabCheckpoint)', () => {
  for (const [level, adv] of [['beginner', false], ['advanced', true]]) {
    it(`${level} : chaque question a un texte, une seule bonne réponse, deux indices, et ni clé brute ni {{`, () => {
      const lab = L.init(LV[level].numbers);
      lab.tasks.forEach((tk, i) => {
        const chain = chainOf(lab, i);
        expect(chain.length, tk.id).toBeGreaterThanOrEqual(2);
        for (const qid of chain) {
          const q = QUESTIONS[qid](lab, i, k, adv);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${tk.id}.${qid}`).not.toMatch(RAW);
          expect(out, `${tk.id}.${qid}`).not.toContain('{{');
          expect(q.hints, `${tk.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${tk.id}.${qid}`).toHaveLength(1);
          else expect(q.expected).toBeTruthy();
        }
      });
      expect(chainOf(lab, lab.tasks.length - 1).at(-1)).toBe('rule');
    });
  }
  it('les nombres viennent de la tâche : 520 ÷ 4 = 130, 840 ÷ 3 = 280, 3 ÷ 12 = 0,25 ; le leurre ouvre la tâche 3', () => {
    const b = L.init(LV.beginner.numbers);
    expect(QUESTIONS.unit(b, 0, k).expected).toBe('130');
    expect(QUESTIONS.unit(b, 1, k).expected).toBe('280');
    expect(chainOf(b, 2)).toEqual(['decoy', 'unit', 'cross', 'rule']);
    const a = L.init(LV.advanced.numbers);
    expect(QUESTIONS.unit(a, 3, k).expected).toBe('0.25');
    expect(QUESTIONS.unit(a, 1, k).expected).toBe('300');
    const s = L.retryTask(L.release(b, L.answerOf(b)));
    expect(L.taskDone(s)).toBe(false);
  });
});

describe('fourth-gauges — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = html({ ...LV.beginner.numbers, level: 'beginner', checkpoints: false });
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
