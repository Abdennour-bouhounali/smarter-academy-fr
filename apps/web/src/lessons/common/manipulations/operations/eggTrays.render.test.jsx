import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import EggTrays, { chainOf, QUESTIONS } from './EggTrays';
import * as L from '../logic/eggTrays';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * egg-trays se rend aux deux niveaux de levels.js (les boîtes de Salma ; les plateaux du نشاط 1), sans clé i18n brute,
 * sans interpolation oubliée, sans prose latine ; il dit chaque chose UNE fois (DNA §17.7) ; et aucun message atteignable
 * avant la découverte ne contient la règle.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const NS = 'manipulation.eggTrays';
const html = (props) => renderToString(<EggTrays {...props} />);
const latinWords = (out) => {
  const text = out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
  return text.match(/[A-Za-z]{2,}/g) ?? [];
};
const attrs = (out, name) => [...out.matchAll(new RegExp(`${name}="([^"]*)"`, 'g'))].map((m) => m[1]);
const say = (key, o) => i18n.t(`lesson:${NS}.${key}`, o);
const res = () => i18n.getResource('ar-DZ', 'lesson', NS);

/** Toutes les chaînes (feuilles) d'un objet, avec leur chemin. */
function leaves(o, path = []) {
  if (typeof o === 'string') return [[path.join('.'), o]];
  if (Array.isArray(o)) return o.flatMap((v, i) => leaves(v, [...path, String(i)]));
  return Object.entries(o).flatMap(([key, v]) => leaves(v, [...path, key]));
}

describe('egg-trays — rendu', () => {
  it('beginner (carton): 50 eggs drawn once on the belt, the belt locked until the frame is placed, no marker yet', () => {
    const out = html({ ...LEVELS['egg-trays'].beginner.numbers });
    expect(out).toContain('data-egg-trays');
    expect(out).toContain('data-world="carton"');
    expect(out).toContain('data-a="50"');
    expect(out).toContain('data-b="12"');
    expect(out).toContain('data-count="0"');
    expect(out).toContain('data-solved="false"');
    expect(out).toContain('data-et-glance');
    expect(out).toContain('data-et-order="50"');
    expect(out).toContain('data-et-handle');
    expect(out).toContain('role="slider"');
    expect(out).toContain('aria-valuemax="50"');
    expect(out).toContain('aria-valuenow="0"');
    expect(attrs(out, 'data-et-belt-egg')).toEqual(Array.from({ length: 50 }, (_, i) => String(i)));
    expect(out).toContain('data-et-ruler="7"');
    expect(out).toContain('data-et-zoom="0"');
    expect(out).toContain('data-et-frame');
    expect(out).toContain('data-placed="false"');
    expect(out).toContain('data-state="idle"');
    expect(out).not.toContain('data-et-marker');
    expect(out).not.toContain('data-et-exact');
    expect(out).not.toContain('data-et-next');
    expect(out).not.toContain('data-et-claim');
    expect(out).not.toContain('data-et-formal');
    expect(out).toContain('data-et-verdict=""');
    expect(out).toContain('50 بيضةً');
    expect(out).toContain('12 بيضةً');
    // the closed trays: none yet; the open carton [0 ; 1] is empty
    expect(attrs(out, 'data-et-tray')).toEqual(['0']);
    expect(out).toContain('data-eggs="0"');
    expect(out).toContain('data-manipulation-levels-selector');
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    expect(latinWords(out)).toEqual([]);
  });

  it('advanced (tray, نشاط 1): 2145 eggs, the ruler 0 … 74, labels every 10 that are never 71 or 72', () => {
    const out = html({ ...LEVELS['egg-trays'].advanced.numbers });
    expect(out).toContain('data-world="tray"');
    expect(out).toContain('data-a="2145"');
    expect(out).toContain('data-b="30"');
    expect(out).toContain('data-et-ruler="74"');
    expect(out).toContain('aria-valuemax="2145"');
    expect(out).toContain('data-et-belt="2145"');
    expect(out).not.toContain('data-et-belt-egg');
    expect(out).toContain('2145 بيضةً');
    const labels = [...out.matchAll(/<text[^>]*>(\d+)<\/text>/g)].map((m) => Number(m[1]));
    expect(labels).toEqual(expect.arrayContaining([0, 10, 70]));
    expect(labels).not.toContain(71);
    expect(labels).not.toContain(72);
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    expect(latinWords(out)).toEqual([]);
  });

  it('inside a workspace: one selector, both levels mount', () => {
    const out = renderToString(
      <ManipulationWorkspace levels={{
        beginner: () => <EggTrays level="beginner" />,
        advanced: () => <EggTrays level="advanced" />,
      }} />,
    );
    expect(out).toContain('data-world="carton"');
    expect((out.match(/data-manipulation-levels-selector/g) ?? []).length).toBe(1);
  });

  it('every string of the namespace exists in Arabic, interpolates, and counted nouns agree', () => {
    for (const [path, s] of leaves(res())) {
      expect(s, path).not.toMatch(RAW);
      expect(/[؀-ۿ]/.test(s), path).toBe(true);
    }
    expect([0, 1, 2, 5, 15, 2145].map((count) => say('eggs', { count }))).toEqual(['لا بيضة', 'بيضة واحدة', 'بيضتان', '5 بيضات', '15 بيضةً', '2145 بيضةً']);
    expect([1, 2, 4, 71].map((count) => say('trays', { count }))).toEqual(['صفيحة واحدة', 'صفيحتان', '4 صفائح', '71 صفيحةً']);
    expect([1, 2, 4].map((count) => say('cartons', { count }))).toEqual(['علبة واحدة', 'علبتان', '4 علب']);
  });

  it('says each thing ONCE (MANIPULATION_DNA §17): no shell mission, the gesture told once, hints closed, no stepper hint', () => {
    for (const lv of ['beginner', 'advanced']) {
      const out = html({ ...LEVELS['egg-trays'][lv].numbers });
      const w = lv === 'beginner' ? 'carton' : 'tray';
      expect(out).not.toContain('data-manipulation-mission');
      expect(out).not.toContain('data-manipulation-hints');
      const lead = say(`instruction.frame.${w}`, { div: "@@" }).split("@@")[0];
      expect(out.split(lead).length - 1, lead).toBe(1);
    }
  });

  it('numbers keep their reading order: « 50 ÷ 12 » is a real LTR island (never « 12 ÷ 50 »)', () => {
    for (const [lv, a, b] of [['beginner', 50, 12], ['advanced', 2145, 30]]) {
      const out = html({ ...LEVELS['egg-trays'][lv].numbers });
      expect(out).toMatch(new RegExp(`<bdi dir="ltr"[^>]*>${a} ÷ ${b}</bdi>`));
      expect(out).not.toContain(`${b} ÷ ${a}`);
      expect(out).not.toMatch(/[\u2066\u2069]/);
    }
  });

  it('opens on NO visible title (DNA §17.9): the context with every number, then ONE question naming the end state', () => {
    for (const [lv, a, b, w] of [['beginner', 50, 12, 'carton'], ['advanced', 2145, 30, 'tray']]) {
      const out = html({ ...LEVELS['egg-trays'][lv].numbers });
      expect(out).toMatch(/<h3 class="sr-only">/);
      expect(out).not.toContain('data-manipulation-mission');
      const ctx = out.match(/data-et-context="true">([^<]*)</)?.[1] ?? '';
      expect(ctx).toContain(String(a));
      expect(ctx).toContain(String(b));
      expect(out).toMatch(new RegExp(`data-et-question="true">[^<]*<bdi dir="ltr"[^>]*>${a} ÷ ${b}</bdi>`));
      expect(say(`question.${w}`, { div: 'X' })).toContain('حتى يفرغ الحزام');
      expect(out.indexOf('data-et-context')).toBeLessThan(out.indexOf('data-et-question'));
    }
  });

  it('nothing reachable before the discovery states the rule (« الباقي معدوم », « بالنقصان », « بالزيادة », « يقسم »)', () => {
    const r = res();
    const before = leaves(r).filter(([path]) => !/^(discovery|formal|explanation|ends)\b/.test(path));
    expect(before.length).toBeGreaterThan(40);
    for (const [path, s] of before) {
      for (const word of ['الباقي معدوم', 'معدوم', 'بالنقصان', 'بالزيادة', 'يقسم', 'مضاعف', 'يقبل القسمة', 'قيمة مقرّبة']) {
        expect(s.includes(word), `${path}: ${word}`).toBe(false);
      }
    }
    // the hints never give q, the frame or the remainder of the lesson's numbers
    for (const [w, a, b, nums] of [['carton', 50, 12, [4, 5, 2]], ['tray', 2145, 30, [71, 72, 15]]]) {
      for (let i = 0; i < 3; i += 1) {
        const h = say(`hints.${w}.${i}`, { a, b });
        for (const n of nums) expect(h, `${w} hint ${i}`).not.toMatch(new RegExp(`(^|\\D)${n}(\\D|$)`));
      }
    }
    // the discovery's correct option carries no number
    expect(r.discovery.right.carton).not.toMatch(/\d|\{\{/);
    expect(r.discovery.right.tray).not.toMatch(/\d|\{\{/);
    expect(r.ends.right.tray).not.toMatch(/\d|\{\{/);
  });

  it('a lesson may pass its own numbers: a divisible order needs « يقع على عدد طبيعي », `then` defaults to the next multiple', () => {
    const out = html({ a: 84, b: 12, world: 'carton', levels: false });
    expect(out).toContain('data-a="84"');
    expect(out).toContain('data-et-ruler="10"');
    expect(out).not.toContain('data-manipulation-levels-selector');
    expect(out).not.toContain('{{');
  });
});

describe('egg-trays — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:${NS}.${key}`, o);
  const ctx = (world) => ({ world, discoveryOptions: [{ text: 'a', correct: true }, { text: 'b', why: 'c' }], formal: <p>f</p> });
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : chaque question a un texte, une seule bonne réponse, deux indices, et ni clé brute ni {{`, () => {
      const n = LEVELS['egg-trays'][level].numbers;
      const lab = L.init(n);
      const ids = L.stepIds(lab);
      for (const id of ids) {
        const chain = chainOf(lab, id);
        expect(chain.length, id).toBeGreaterThanOrEqual(2);
        for (const qid of chain) {
          const q = QUESTIONS[qid](lab, id, k, ctx(n.world));
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${id}.${qid}`).not.toMatch(RAW);
          expect(out, `${id}.${qid}`).not.toContain('{{');
          expect(q.hints, `${id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${id}.${qid}`).toHaveLength(1);
          else expect(q.expected, `${id}.${qid}`).toBeTruthy();
        }
      }
      expect(chainOf(lab, ids.at(-1)).at(-1)).toBe('rule');
    });
  }
  it('les nombres viennent de la commande : 50 = 12 × 4 + 2, 60 sur 5, le camarade 45 ≥ 30', () => {
    const lab = L.init(LEVELS['egg-trays'].beginner.numbers);
    expect(QUESTIONS.rest(lab, 'order', k, ctx('carton')).expected).toBe('2');
    expect(QUESTIONS.rest(lab, 'then', k, ctx('carton')).expected).toBe('0');
    expect(QUESTIONS.where(lab, 'then', k).options[0].correct).toBe(true);
    const adv = L.init(LEVELS['egg-trays'].advanced.numbers);
    expect(QUESTIONS.claimWhy(adv, 'claim', k, ctx('tray')).options[0].correct).toBe(true);
    expect(QUESTIONS.claimRest(adv, 'claim', k).expected).toBe('15');
    expect(L.stepIds(adv)).toEqual(['order', 'then', 'claim']);
  });
});

describe('egg-trays — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = html({ ...LEVELS['egg-trays'].beginner.numbers, level: 'beginner' });
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = html({ ...LEVELS['egg-trays'].beginner.numbers, level: 'beginner', checkpoints: false });
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
