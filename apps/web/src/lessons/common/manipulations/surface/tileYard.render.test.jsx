import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import TileYard, { Formal, discoveryOptions, numbersFor, chainsOf, QUESTIONS, taskReached } from './TileYard';
import { LEVELS } from '../levels';
import * as L from '../logic/tileYard';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<TileYard {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/\s+/g, ' ');
const say = (key, o) => i18n.t(`lesson:manipulation.tileYard.${key}`, o);
const attrs = (out, name) => [...out.matchAll(new RegExp(`${name}="([^"]*)"`, 'g'))].map((m) => m[1]);

const LV = LEVELS['tile-yard'];
const cases = {
  'yard beginner (fence)': { ...LV.beginner.numbers, level: 'beginner' },
  'yard advanced (rope)': { ...LV.advanced.numbers, level: 'advanced' },
  'floor (both scenes)': { world: 'floor', levels: false, tasks: ['terrace-halves', 'terrace-double'] },
  'floor (double only)': { world: 'floor', levels: false, tasks: ['terrace-double'] },
};

describe('tile-yard — rendu', () => {
  for (const [name, props] of Object.entries(cases)) {
    it(`${name}: renders, no raw key, no {{, no Latin prose`, () => {
      const out = html(props);
      expect(out).toContain('data-tile-yard');
      expect(out).toContain('data-ty-glance');
      expect(out).toContain('data-ty-');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      expect(text(out).match(/[A-Za-z]{2,}/g) ?? []).toEqual([]);
    });
  }

  it('fence: 12 tiles (a 2 × 6), the two meters side by side, walk and keep, an empty notebook, no formal block', () => {
    const out = html(cases['yard beginner (fence)']);
    expect(out).toContain('data-world="yard"');
    expect(out).toContain('data-mode="fence"');
    expect(out).toContain('data-task="shortest"');
    expect(attrs(out, 'data-ty-tile')).toHaveLength(12);
    expect(attrs(out, 'data-ty-tile')).toContain('2-2');
    expect(out).toContain('data-ty-area="12"');
    expect(out).toContain('data-ty-fence="16"');
    expect(out).toContain('data-ty-walk');
    expect(out).toContain('data-ty-keep');
    expect(out).toContain('data-ty-notebook');
    expect(out).toContain('data-count="0"');
    expect(out).not.toContain('data-ty-stamp');
    expect(out).not.toContain('data-ty-heap');
    expect(out).not.toContain('data-ty-formal');
    expect(attrs(out, 'data-ty-step')).toEqual(['0', '1']);
    expect(out).toContain(say('meter.tiles'));
    expect(out).toContain(say('meter.fence'));
  });

  it('rope: an empty yard, the heap of 12, the roll of 12 sticks with its counter', () => {
    const out = html(cases['yard advanced (rope)']);
    expect(out).toContain('data-mode="rope"');
    expect(out).toContain('data-task="biggest"');
    expect(attrs(out, 'data-ty-tile')).toHaveLength(0);
    expect(out).toContain('data-ty-heap');
    expect(out).toContain('data-count="12"');
    expect(out).toContain('data-ty-rope');
    expect(out).toContain('data-used="0"');
    expect(out).toContain('data-ty-area="0"');
  });

  it('floor: the terrace, the box (unit ① and the half tile), the live reading, the confirm button; the double scene offers the single tile first', () => {
    const out = html(cases['floor (both scenes)']);
    expect(out).toContain('data-world="floor"');
    expect(out).toContain('data-scene="terrace-halves"');
    expect(attrs(out, 'data-ty-box')).toEqual(['one', 'half']);
    expect(out).toContain('data-ty-reading="0"');
    expect(out).toContain('data-ty-confirm');
    expect(out).not.toContain('data-ty-rotate');
    expect(attrs(out, 'data-half')).toHaveLength(4);
    const two = html(cases['floor (double only)']);
    expect(two).toContain('data-scene="terrace-double"');
    expect(attrs(two, 'data-ty-box')).toEqual(['one']);
    expect(attrs(two, 'data-ty-cell')).toHaveLength(21);
  });

  it('the floor never offers the level selector, whatever the lesson passes', () => {
    const out = html({ world: 'floor', tasks: ['terrace-halves'] });
    expect(out).not.toContain('manipulation.level');
    expect(attrs(out, 'data-level')).toEqual(['beginner']);
  });

  it('numbersFor: the level preset, a forced mode, the floor scenes', () => {
    expect(numbersFor({})).toEqual({ world: 'yard', mode: 'fence' });
    expect(numbersFor({ level: 'advanced' })).toEqual({ world: 'yard', mode: 'rope' });
    expect(numbersFor({ world: 'yard', mode: 'rope' })).toEqual({ world: 'yard', mode: 'rope' });
    expect(numbersFor({ world: 'floor', tasks: ['terrace-double'] })).toEqual({ world: 'floor', mode: 'floor', tasks: ['terrace-double'] });
  });
});

describe('tile-yard — strings', () => {
  it('counted nouns carry every plural form (zero … other)', () => {
    for (const base of ['tile', 'stick', 'reading.tile', 'reading.halfTile', 'reading.double', 'reading.halfDouble']) {
      for (const f of ['zero', 'one', 'two', 'few', 'many', 'other']) {
        const v = i18n.t(`lesson:manipulation.tileYard.${base}_${f}`, { count: 3 });
        expect(v, `${base}_${f}`).not.toMatch(/manipulation\./);
        expect(v.length).toBeGreaterThan(0);
      }
    }
    expect(say('tile', { count: 2 })).toBe('بلاطتان');
    expect(say('stick', { count: 14 })).toBe('14 عصًا');
    expect(say('reading.halfTile', { count: 4 })).toContain('4');
  });
  it('every refusal reason of the logic has its sentence', () => {
    for (const r of ['detached', 'splits', 'hole', 'rope', 'overlap', 'outside', 'unit']) expect(say(`refused.${r}`, { fence: 14 })).not.toMatch(/manipulation\./);
  });
  it('every coach step of the logic has its text', () => {
    for (const id of ['pick', 'walk', 'keep', 'again', 'next', 'add', 'more', 'sweep', 'half', 'double', 'halfTwo', 'cover', 'confirm']) expect(say(`coach.${id}`)).not.toMatch(/manipulation\./);
  });
});

describe('tile-yard — discovery and rule come from the student’s own yards', () => {
  const keptFence = () => {
    let s = L.keep(L.init({ world: 'yard', mode: 'fence' }));
    const mv = (x, a, b) => L.moveTile(x, L.tileAt(x, ...a).id, b);
    for (const [a, b] of [[[3, 7], [4, 5]], [[2, 7], [4, 4]], [[3, 6], [4, 3]], [[2, 6], [4, 2]]]) s = mv(s, a, b);
    s = L.keep(s);
    const tail = [...[2, 3].flatMap((r) => [2, 3, 4, 5].map((c) => [r, c])), ...[6, 7, 8, 9].map((c) => [2, c])];
    return L.keep({ ...s, tiles: tail.map(([r, c], id) => ({ id, r, c })) });
  };
  it('fence: the wrong conjectures are refuted by the kept fences 14 and 20, the right one is the second option', () => {
    const s = keptFence();
    const opts = discoveryOptions(s, (key, o) => say(key, o));
    expect(opts.map((o) => !!o.correct)).toEqual([false, true, false]);
    expect(opts[0].why).toContain('14');
    expect(opts[0].why).toContain('20');
    expect(opts[2].why).toContain('12');
    expect(opts[1].why).toBeUndefined();
    for (const o of opts) expect(o.text).not.toMatch(/manipulation\./);
  });
  it('formal block: the two definitions, the student’s own pair, the sentence it illustrates (same area only)', () => {
    const out = renderToString(<Formal lab={keptFence()} k={(key, o) => say(key, o)} />);
    expect(out).toContain('data-ty-def="area"');
    expect(out).toContain('data-ty-def="perimeter"');
    expect(out).toContain('data-ty-sentence="sameAreaOnly"');
    expect(out).not.toContain('data-ty-sentence="samePerimeterOnly"');
    expect(out).toContain('data-ty-formal-pair');
    expect(out).not.toMatch(/\{\{/);
  });
});

describe('tile-yard — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.tileYard.${key}`, o);
  const RAW_ = /manipulation\.[a-zA-Z]/;
  const cases = [['fence', { world: 'yard', mode: 'fence' }], ['rope', { world: 'yard', mode: 'rope' }], ['floor', { world: 'floor', mode: 'floor' }]];
  for (const [name, nums] of cases) {
    it(`${name} : chaque question a un texte, une seule bonne réponse, deux indices, et ni clé brute ni {{`, () => {
      const lab = L.init(nums);
      const chains = chainsOf(lab);
      expect(Object.keys(chains)).toEqual(lab.tasks);
      for (const [task, chain] of Object.entries(chains)) {
        expect(chain.length, task).toBeGreaterThanOrEqual(2);
        for (const qid of chain) {
          const q = QUESTIONS[qid](lab, task, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${task}.${qid}`).not.toMatch(RAW_);
          expect(out, `${task}.${qid}`).not.toContain('{{');
          expect(q.hints, `${task}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${task}.${qid}`).toHaveLength(1);
          else expect(q.expected, `${task}.${qid}`).toBeTruthy();
        }
      }
    });
  }
  it('les nombres viennent des scènes ; la dernière tâche d’une cour attend la découverte', () => {
    const fl = L.init({ world: 'floor', mode: 'floor' });
    expect(QUESTIONS.areaNum(fl, 'terrace-halves', k).expected).toBe('16');
    const lab = L.init({ world: 'yard', mode: 'fence' });
    expect(QUESTIONS.fenceNum(lab, 'shortest', k).expected).toBe('14');
    expect(taskReached({ ...lab, done: [true, true], ti: 1 }, 1)).toBe(false);
    expect(chainsOf(lab).twenty.at(-1)).toBe('rule');
  });
});

describe('tile-yard — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = renderToString(<TileYard world="yard" mode="fence" />);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = renderToString(<TileYard world="yard" mode="fence" checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
