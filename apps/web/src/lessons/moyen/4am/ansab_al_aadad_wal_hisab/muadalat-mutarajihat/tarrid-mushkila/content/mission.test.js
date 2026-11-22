import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LESSON_CONFIG } from '../lesson.config.js';
import { M1_ROUNDS, M2_ROUNDS } from './race.js';
import { PEER_SHEET } from './peerSheet.js';
import { PREP_LADDER } from './prep.js';
import { EXERCISES, EXERCISES_1 } from './exercises.js';
import * as TB from './textbook.js';
import { LESSON_KNOWLEDGE } from '../knowledge.jsx';
import { KNOWLEDGE_GRAPH } from '../knowledgeGraph.js';
import { TEXT } from '../../_unit/signatures/tarrid-mushkila.js';
import { showsAny } from '../../_unit/forbiddenShared.js';
import { easierProps } from '../../../../../../common/manipulations/rounds/roundsModel.js';

/**
 * La mission de tarrid-mushkila (rollout 2026-11-11, conseil du 2026-11-11, verdicts L4.1–L4.9 et X1–X3). Le balayage par RÔLE de tout ce qu'un écran de
 * manche peut montrer est dans race.test.js ; ici : la config, les points d'étape (recalculés), le texte (manches, ورقة, « أستعدّ », cartes, carte des
 * معارف, exercices) contre la signature de la مسألة (_unit/signatures/tarrid-mushkila.js), et la réécriture des exercices du manuel.
 */
const { mission } = LESSON_CONFIG;
const cpText = (cp) => [cp.prompt, ...cp.options, cp.explain].join(' ');
const modules = import.meta.glob('../modules/*.jsx', { eager: true, query: '?raw', import: 'default' });
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const BOOK = /الكتاب(?!ة)|دوري الآن|تمرين\s*\d|خطأً? مطبعي|ص\s*\d{2}/;

describe('the mission of tarrid-mushkila', () => {
  it('one checkpoint after each of modules 1–3, the climax in module 4, the height board, the map open', () => {
    expect(mission.climaxModule).toBe(4);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(4);
    expect(mission.checkpoints.map((c) => c.afterModule)).toEqual([1, 2, 3]);
    expect(mission.scene).toBe('family-heights');
    expect(mission.title.startsWith('جدار')).toBe(true);
    expect(LESSON_CONFIG.studentView).toBe('mission');
    expect(LESSON_CONFIG.knowledgeMapOpen).toBe(true);
  });

  it('the tools are knowledge ids of the lesson; no label starts with a Latin letter', () => {
    const ids = Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => x.id);
    mission.tools.forEach((tl) => { expect(ids, tl.id).toContain(tl.id); expect(tl.label).not.toMatch(/^[A-Za-z]/); });
  });

  it('the opening has no number and no « ثلاثة »; the checkpoints never show the signature nor an age, a negative duration or an inequality picked from', () => {
    expect(/\d/.test(mission.opening.text)).toBe(false);
    expect(mission.opening.text.includes('ثلاث')).toBe(false);
    mission.checkpoints.forEach((cp) => {
      const s = cpText(cp);
      expect(showsAny(TEXT, s), cp.id).toBe(false);
      [/سنة/, /سنوات/, /منذ/, /أصغر عدد صحيح/].forEach((re) => expect(re.test(s), `${cp.id} ${re}`).toBe(false));
      expect(new Set(cp.options).size).toBe(cp.options.length);
    });
  });

  it('the checkpoints are recomputed from their prompts', () => {
    const [a, b, c] = mission.checkpoints;
    // rectangle x by x + 3 : perimeter 2(x + x + 3) = 4x + 6
    const k = Number(a.prompt.match(/بـ (\d) أمتار/)[1]);
    expect(a.options[a.correct]).toBe(`$${2 * 2}x + ${2 * k}$`.replace('$4x', '$4x'));
    // « لا يتجاوز » : ≤ ; 45 × 8 = 360 ≤ 400 < 45 × 9
    const [, price, limit] = b.options[b.correct].match(/(\d+)x \\leq (\d+)/).map(Number);
    expect(price * 8 <= limit).toBe(true);
    expect(price * 9 > limit).toBe(true);
    // x + 2x = 57 ⇒ x = 19 ; the check adds the number and its double
    const [, x, tot] = c.prompt.match(/x = (\d+)/) && [0, Number(c.prompt.match(/x = (\d+)/)[1]), Number(c.prompt.match(/نجد (\d+)/)[1])];
    expect(x + 2 * x).toBe(tot);
    expect(c.options[c.correct]).toBe(`$${x} + 2 \\times ${x} = ${tot}$`);
  });

  it('what the rounds write, the peer sheet and « أستعدّ » never show the signature', () => {
    [...M1_ROUNDS, ...M2_ROUNDS].forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => {
      const p = x.props ?? easierProps(r);
      expect(showsAny(TEXT, `${r.title ?? ''} ${p.lead ?? ''} ${p.mission ?? ''} ${x.helpLine ?? ''}`), r.id).toBe(false);
    }));
    expect(showsAny(TEXT, JSON.stringify(PEER_SHEET).replace(/\\\\/g, '\\'))).toBe(false);
    PREP_LADDER.forEach((it) => expect(showsAny(TEXT, `${it.text} ${it.why}`), it.text).toBe(false));
  });

  it('the memo cards (bodies included), the knowledge map and the method data never show the signature, the book nor a control character', () => {
    Object.values(LESSON_KNOWLEDGE.modules).flat().forEach((item) => {
      const body = renderToStaticMarkup(item.body ?? null);
      const s = `${item.title} ${item.summary ?? ''} ${item.predictPrompt ?? ''} ${JSON.stringify(item.memo ?? {})} ${body}`.replace(/\\\\/g, '\\');
      expect(showsAny(TEXT, s), item.id).toBe(false);
      expect(BOOK.test(s), item.id).toBe(false);
    });
    KNOWLEDGE_GRAPH.nodes.forEach((node) => { const s = JSON.stringify(node).replace(/\\\\/g, '\\'); expect(showsAny(TEXT, s), node.id).toBe(false); expect(BOOK.test(s), node.id).toBe(false); });
    ['METHOD_MODELLING', 'MODEL_RULE', 'INEQUALITY_RULE', 'REALITY_RULE', 'MISTAKE_ONE_X', 'STEPS', 'NOW_49_2'].forEach((key) => {
      const s = JSON.stringify({ ...TB[key], source: undefined });
      expect(showsAny(TEXT, s), key).toBe(false);
      expect(BOOK.test(s), key).toBe(false);
    });
  });

  it('the exercises are the platform\'s: ten rewritten, ids and كفاءات kept, no signature, no book, exercise 12 is static', () => {
    expect(EXERCISES.map((e) => e.id)).toEqual(['ex-10', 'ex-11', 'ex-12', 'ex-13', 'ex-30', 'ex-33', 'ex-37-1', 'ex-37-2', 'ex-38', 'ex-39', 'ex-40']);
    [...EXERCISES_1, ...EXERCISES].forEach((ex) => {
      const s = JSON.stringify({ ...ex, source: undefined }).replace(/\\\\/g, '\\');
      expect(showsAny(TEXT, s), ex.id).toBe(false);
      expect(BOOK.test(s), ex.id).toBe(false);
      expect(/[\t\r]/.test(s)).toBe(false);
      expect(ex.source.part).toContain('بأعداد المنصّة');
    });
    const ex12 = JSON.stringify(EXERCISES.find((e) => e.id === 'ex-12'));
    expect(ex12.includes('بعد كم سنة')).toBe(false);
  });

  it('the exercise answers are right (recomputed)', () => {
    const row = (id, i) => EXERCISES.find((e) => e.id === id).question.rows[i];
    const right = (r) => r.options[r.correct];
    expect(right(row('ex-10', 1))).toBe('$6$');                 // 4x + 11 = 35
    expect(4 * 6 + 11).toBe(35);
    expect(right(row('ex-11', 1))).toBe('$12$');                // 5x − 36 = 2x
    expect(5 * 12 - 36).toBe(2 * 12);
    expect(right(row('ex-12', 1))).toBe('$12$');                // x + (x + 3) = 27
    expect(12 + 15).toBe(27);
    expect(right(row('ex-13', 1))).toBe('150 صفحة');            // 0,4N + 30 + 60 = N
    expect(0.4 * 150 + 30 + 60).toBe(150);
    expect(2 * 11 + 8 >= 30 && 2 * 10 + 8 < 30).toBe(true);     // ex-33 : x ≥ 11
    expect(4 * 10 - 6).toBe(34);                                // ex-37-1
    expect(4 * -3 - 6).toBe(6 * -3);                            // ex-37-2
    expect(6 < 7 && 7 < 14 && 10 < 4 + 7).toBe(true);           // ex-38
    [4, 6].forEach((x) => expect(100 - 2 * x * (10 - x)).toBe(52)); // ex-39
    expect((4 + 6) * (4 - 2)).toBe(20);                         // ex-40 : (x + 6)(x − 2) at x = 4
    expect(6 * 10).toBe(4 * (10 + 5));                          // now : 6x = 4(x + 5) at 10
  });

  it('module prose: no book wording remains in the modules, and nothing the student reads names the textbook', () => {
    Object.entries(modules).forEach(([path, s]) => expect(BOOK.test(strip(s)), path).toBe(false));
    const visible = [LESSON_CONFIG.description, mission.title, mission.opening.text, ...mission.tools.map((t) => t.label), ...mission.checkpoints.map(cpText),
      ...LESSON_CONFIG.modules.map((m) => `${m.title} ${m.desc}`), ...LESSON_CONFIG.resources.map((r) => `${r.title} ${r.objective ?? ''} ${r.autonomy ?? ''}`)];
    visible.forEach((s) => expect(BOOK.test(s), s).toBe(false));
  });

  it('the peer sheet is the last step of module 2 and the lab rounds are played in module 1 and module 2', () => {
    const m2 = strip(Object.entries(modules).find(([p]) => p.endsWith('Module02Tarayiq.jsx'))[1]);
    expect(m2).toContain('PeerSheet');
    expect(m2).toContain('M2_ROUNDS');
    expect(strip(Object.entries(modules).find(([p]) => p.endsWith('Module01Sibaq.jsx'))[1])).toContain('M1_ROUNDS');
  });
});
