import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LESSON_CONFIG } from '../lesson.config.js';
import { M1_ROUNDS, M2_ROUNDS } from './stories.js';
import { PEER_SHEET } from './peerSheet.js';
import { PREP_LADDER } from './prep.js';
import { EXERCISES, EXERCISES_1, MODULE2_SYSTEMS } from './exercises.js';
import { PROBLEMS } from './problems.js';
import * as TB from './textbook.js';
import { LESSON_KNOWLEDGE } from '../knowledge.jsx';
import { KNOWLEDGE_GRAPH } from '../knowledgeGraph.js';
import { TEXT, UNIT, SYSTEMS } from '../../_unit/signatures/mushkilat-jumla.js';
import { showsAny, solutionOf, canonSystem } from '../../_unit/forbiddenShared.js';
import { ABU_KAMIL } from '../../_unit/abuKamil.js';
import { easierProps } from '../../../../../../common/manipulations/rounds/roundsModel.js';

/**
 * La mission de mushkilat-jumla (rollout 2026-11-12, conseil du 2026-11-11, verdict L3 et X1–X11). Le balayage par RÔLE de tout ce qu'un écran de
 * manche peut montrer est dans stories.test.js ; ici : la config, les points d'étape (recalculés), le texte (manches, ورقة, « أستعدّ », cartes,
 * carte des معارف, exercices) contre la signature de la مسألة, la réécriture des exercices du manuel, et la signature elle-même.
 */
const { mission } = LESSON_CONFIG;
const cpText = (cp) => [cp.prompt, ...cp.options, cp.explain].join(' ');
const modules = import.meta.glob('../modules/*.jsx', { eager: true, query: '?raw', import: 'default' });
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, '');
const BOOK = /الكتاب(?!ة)|دوري الآن|تمرين\s*\d|خطأً? مطبعي|ص\s*\d{2}|نشاط\s*\d|\d\s*DA\b/;
const ROUNDING = /نقرّب|التدوير|بعد التقريب/;
const json = (o) => JSON.stringify(o).replace(/\\\\/g, '\\');

describe('the mission of mushkilat-jumla', () => {
  it('one checkpoint after each of modules 1–3, the climax in module 4, the museum desk, the map open', () => {
    expect(mission.climaxModule).toBe(4);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(4);
    expect(mission.checkpoints.map((c) => c.afterModule)).toEqual([1, 2, 3]);
    expect(mission.scene).toBe('museum-desk');
    expect(LESSON_CONFIG.studentView).toBe('mission');
    expect(LESSON_CONFIG.knowledgeMapOpen).toBe(true);
  });

  it('the tools are knowledge ids of the lesson; no label starts with a Latin letter', () => {
    const ids = Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => x.id);
    mission.tools.forEach((tl) => { expect(ids, tl.id).toContain(tl.id); expect(tl.label).not.toMatch(/^[A-Za-z]/); });
  });

  it('the opening has no digit and no day (verdict L3.2); the checkpoints never show the signature, a swap, a rounding nor people at two prices', () => {
    expect(/\d/.test(mission.opening.text)).toBe(false);
    expect(/الأحد|السبت|يوم/.test(mission.opening.text.replace('اليوم', ''))).toBe(false);
    mission.checkpoints.forEach((cp) => {
      const s = cpText(cp);
      expect(showsAny(TEXT, s), cp.id).toBe(false);
      expect(ROUNDING.test(s), cp.id).toBe(false);
      expect(/تذكرة|زائر|بالغ/.test(s), cp.id).toBe(false);
      expect(new Set(cp.options).size).toBe(cp.options.length);
    });
  });

  it('the checkpoints are recomputed from their prompts', () => {
    const [a, b, c] = mission.checkpoints;
    // 12 two-wheelers and 10 three-wheelers: 2 × 12 + 3 × 10 = 54 ; the right option counts wheels with their own coefficient
    const total = Number(a.prompt.match(/العجلات (\d+)/)[1]);
    expect(2 * 12 + 3 * 10).toBe(total);
    expect(a.options[a.correct]).toBe(`$2x + 3y = ${total}$`);
    // the answer sentence names both numbers, each with its noun; no swapped option
    const [x, y] = [Number(b.prompt.match(/x = (\d+)/)[1]), Number(b.prompt.match(/y = (\d+)/)[1])];
    expect(b.options[b.correct]).toContain(`${x} حافلات صغيرة`);
    expect(b.options[b.correct]).toContain(`${y} حافلات كبيرة`);
    expect(b.options.some((o) => o.includes(`${y} حافلات صغيرة`))).toBe(false);
    // the perimeter: 2(x + y)
    const p = Number(c.prompt.match(/محيطه (\d+)/)[1]);
    expect(c.options[c.correct]).toBe(`$2(x + y) = ${p}$`);
  });

  it('what the rounds write, the peer sheet and « أستعدّ » never show the signature', () => {
    [...M1_ROUNDS, ...M2_ROUNDS].forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => {
      const p = x.props ?? easierProps(r);
      const s = `${r.title ?? ''} ${p.lead ?? ''} ${p.mission ?? ''} ${p.story ?? ''} ${x.helpLine ?? ''} ${json(p.answer ?? {})} ${(p.choices ?? []).map((c) => c.props.story).join(' ')}`;
      expect(showsAny(TEXT, s), r.id).toBe(false);
      expect(BOOK.test(s), r.id).toBe(false);
    }));
    expect(showsAny(TEXT, json(PEER_SHEET))).toBe(false);
    PREP_LADDER.forEach((it) => expect(showsAny(TEXT, `${it.text} ${it.why}`), it.text).toBe(false));
  });

  it('the memo cards (bodies included), the knowledge map and the textbook data never show the signature, the book, a rounding nor a control character', () => {
    Object.values(LESSON_KNOWLEDGE.modules).flat().forEach((item) => {
      const body = renderToStaticMarkup(item.body ?? null);
      const s = `${item.title} ${item.summary ?? ''} ${item.predictPrompt ?? ''} ${json(item.memo ?? {})} ${body}`;
      expect(showsAny(TEXT, s), item.id).toBe(false);
      expect(BOOK.test(s), item.id).toBe(false);
      expect(ROUNDING.test(s), item.id).toBe(false);
    });
    KNOWLEDGE_GRAPH.nodes.forEach((node) => { const s = json(node); expect(showsAny(TEXT, s), node.id).toBe(false); expect(BOOK.test(s), node.id).toBe(false); });
    ['ACTIVITY', 'ACTIVITY_SOLUTION', 'STEPS', 'STEPS_TABLE', 'TRANSLATION_RULE', 'MISTAKE_TARJAMA', 'CHECK_RULE', 'MISTAKE_HALF', 'CHALLENGE', 'ABU_KAMIL', 'ABU_KAMIL_READING', 'QCM7', 'PREP_ITEMS'].forEach((key) => {
      const v = TB[key];
      const s = json(Array.isArray(v) ? v.map((x) => ({ ...x, source: undefined })) : { ...v, source: undefined });
      expect(showsAny(TEXT, s), key).toBe(false);
      expect(BOOK.test(s), key).toBe(false);
      expect(/[\t\r]/.test(s), key).toBe(false);
    });
  });

  it('Abū Kāmil: the module reads the unit\'s verified line, never the book\'s', () => {
    expect(TB.ABU_KAMIL.intro).toBe(ABU_KAMIL.line);
  });

  it('the exercises are the platform\'s: ids and كفاءات kept, no signature, no book, no rounding, ex-19 has no x + y = 180, ex-27 does not answer (150 ; 100)', () => {
    expect(EXERCISES.map((e) => e.id)).toEqual(['ex-14', 'ex-14-2', 'ex-15', 'ex-15-2', 'ex-16', 'ex-16-2', 'ex-17', 'ex-17-2', 'ex-18', 'ex-18-2', 'ex-19', 'ex-19-2',
      'ex-20', 'ex-20-2', 'ex-21', 'ex-21-2', 'ex-24', 'ex-24-2', 'ex-25', 'ex-25-2', 'ex-26', 'ex-26-2', 'ex-27', 'ex-27-2', 'ex-28', 'ex-28-2']);
    [...EXERCISES_1, ...EXERCISES].forEach((ex) => {
      const s = json({ ...ex, source: undefined });
      expect(showsAny(TEXT, s), ex.id).toBe(false);
      expect(BOOK.test(s), ex.id).toBe(false);
      expect(ROUNDING.test(s), ex.id).toBe(false);
      expect(/[\t\r]/.test(s)).toBe(false);
    });
    EXERCISES.forEach((ex) => expect(ex.source.part, ex.id).toBe('بأعداد المنصّة'));
    expect(json(EXERCISES.find((e) => e.id === 'ex-19'))).not.toMatch(/(?<![0-9])x \+ y = 180/);
    expect(EXERCISES.find((e) => e.id === 'ex-27-2').question.expected).not.toEqual({ x: '150', y: '100' });
  });

  it('every typed answer (pair) is the solution of its system, recomputed', () => {
    const sys = {
      'challenge-2': 'x+y=29|20x+5y=385', 'abu-kamil-2': 'x+y=30|7x-3y=0', 'ex-14-2': 'a+b=96|5a-3b=-8', 'ex-15-2': 'a-3b=-4|a-5b=4',
      'ex-16-2': 'x+y=177|x-5y=3', 'ex-17-2': 'x-y=30|x-4y=18', 'ex-18-2': 'x+y=70|x-y=10', 'ex-19-2': 'x+2y=180|2x-y=0', 'ex-20-2': 'x+y=40|4x+2y=124',
      'ex-21-2': 'x+y=16|6x-10y=0', 'ex-24-2': 'x+y=1500|x-y=64', 'ex-25-2': 'x+y=26|-2x+4y=8', 'ex-26-2': 'x+y=31|x-2y=4', 'ex-27-2': '7x+6y=1080|x-3y=0',
      'ex-28-2': '2x+y=36|x+2y=42',
    };
    const toXY = (s) => s.replace(/a/g, 'x').replace(/b/g, 'y');
    [...EXERCISES_1, ...EXERCISES].filter((e) => e.interaction === 'pair').forEach((e) => {
      expect(sys[e.id], e.id).toBeTruthy();
      expect(solutionOf(toXY(sys[e.id])).key, e.id).toBe(`(${e.question.expected.x} ; ${e.question.expected.y})`);
    });
    // the module-2 systems the signature reads are those of the exercises
    expect(MODULE2_SYSTEMS.map((m) => canonSystem(m.system))).toEqual([canonSystem(sys['challenge-2']), canonSystem(sys['abu-kamil-2'])]);
  });

  it('no QCM row has two true options: every wrong system is NOT equivalent to the right one', () => {
    const cases = /\\begin\{cases\} (.+?) \\\\ (.+?) \\end\{cases\}/;
    [...EXERCISES_1, ...EXERCISES].filter((e) => e.interaction === 'batch').forEach((e) => e.question.rows.forEach((row) => {
      const parsed = row.options.map((o) => { const m = cases.exec(o); return m && !/[a-z]\(|\)\(|dfrac|\(.*[a-z]/.test(`${m[1]}${m[2]}`) ? [m[1], m[2]] : null; });
      if (parsed.some((p) => p == null)) return;
      const right = canonSystem(parsed[row.correct].map((x) => x.replace(/a/g, 'x').replace(/b/g, 'y')));
      parsed.forEach((p, i) => { if (i !== row.correct) expect(canonSystem(p.map((x) => x.replace(/a/g, 'x').replace(/b/g, 'y'))), `${e.id} ${row.label} ${i}`).not.toBe(right); });
    }));
  });

  it('module prose: no book wording remains in the modules, and nothing the student reads names the textbook', () => {
    Object.entries(modules).forEach(([path, s]) => expect(BOOK.test(strip(s)), path).toBe(false));
    const visible = [LESSON_CONFIG.description, mission.title, mission.opening.text, ...mission.tools.map((t) => t.label), ...mission.checkpoints.map(cpText),
      ...LESSON_CONFIG.modules.map((m) => `${m.title} ${m.desc}`), ...LESSON_CONFIG.resources.map((r) => `${r.title} ${r.objective ?? ''} ${r.autonomy ?? ''}`),
      ...LESSON_CONFIG.teachingScope.include];
    visible.forEach((s) => expect(BOOK.test(s), s).toBe(false));
  });

  it('the peer sheet is the last step of module 2; the lab rounds are played in modules 1 and 2; both modules decide « in the player? » at module level', () => {
    const src = (name) => strip(Object.entries(modules).find(([p]) => p.endsWith(name))[1]);
    const m2 = src('Module02Marahil.jsx');
    expect(m2).toContain('PeerSheet');
    expect(m2.lastIndexOf('PeerSheet')).toBeGreaterThan(m2.lastIndexOf('abu-kamil-2'));
    expect(m2).toContain('M2_ROUNDS');
    expect(src('Module01Mathaf.jsx')).toContain('M1_ROUNDS');
    ['Module01Mathaf.jsx', 'Module02Marahil.jsx'].forEach((n) => expect(src(n)).toContain('useModulePlayer(MODULE_CTX)'));
  });
});

describe('the signature of mushkilat-jumla', () => {
  it('UNIT is the climax: its systems and pairs are those of the problems file', () => {
    const climax = json(PROBLEMS[0]).replace(/\s+/g, '');
    UNIT.systems.forEach((s) => s.split('|').forEach((e) => expect(climax, e).toContain(e)));
    expect(solutionOf(UNIT.systems[0]).key).toBe('(100 ; 80)');
    expect(solutionOf(UNIT.systems[1]).key).toBe('(380/3 ; 250/3)');
    UNIT.never.forEach((n) => expect(climax).toContain(String(n)));
  });
  it('TEXT catches the climax (negative control) and lets the peer sheet and a triangle\'s 180° through (positive controls)', () => {
    ['$x + y = 180$', '$150x = 15000$', 'المداخيل 33000 دج', '$(100 ; 80)$', '$250x + 100y = 33000$', '$x = \\dfrac{380}{3}$', '180 زائرًا', 'متحف الولاية']
      .forEach((s) => expect(showsAny(TEXT, s), s).toBe(true));
    expect(showsAny(TEXT, json(PEER_SHEET))).toBe(false);
    expect(showsAny(TEXT, '$x + 2y = 180$')).toBe(false);
    expect(showsAny(TEXT, '$2 \\times 150 = 300$')).toBe(false);
  });
  it('SYSTEMS lists every round, easier round, free story, prep item, the peer sheet and the module-2 problems, each once', () => {
    const ids = SYSTEMS.map((r) => r.id);
    ['r1', 'r1e', 'r2', 'r2e', 'star', 'p1', 'p1e', 'free-balls', 'free-grocer', 'free-fraction', 'peer', 'prep-3', 'prep-5', 'prep-7', 'prep-9', 'm2-coins', 'm2-abu-kamil']
      .forEach((id) => expect(ids, id).toContain(id));
    expect(new Set(SYSTEMS.map((r) => canonSystem(r.system))).size).toBe(SYSTEMS.length);
    expect(solutionOf(SYSTEMS.find((r) => r.id === 'peer').system).key).toBe('(20 ; 15)');
  });
});
