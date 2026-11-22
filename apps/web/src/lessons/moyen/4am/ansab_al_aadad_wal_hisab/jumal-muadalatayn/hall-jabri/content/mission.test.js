import { describe, it, expect } from 'vitest';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { LESSON_CONFIG } from '../lesson.config';
import { M1_ROUNDS } from './cards';
import { PEER_SHEET } from './peerSheet';
import { PREP_LADDER } from './prep';
import { TEXT, RULE_P } from './forbidden';
import { LESSON_KNOWLEDGE } from '../knowledge.jsx';
import { KNOWLEDGE_GRAPH } from '../knowledgeGraph.js';
import { EXERCISES, NOW_59 } from './exercises.js';
import * as TB from './textbook.js';
import strings from '../../../../../../../i18n/locales/ar/lesson.manipulation.json';

// les sources des modules d'avant la مسألة (0 à 3), en texte brut : la prose JSX est corrigée à la main et ÉPINGLÉE ici
const moduleSources = import.meta.glob(['../modules/Module0[0-3]*.jsx'], { eager: true, query: '?raw', import: 'default' });
const itqanSource = Object.values(import.meta.glob(['../modules/Module07*.jsx'], { eager: true, query: '?raw', import: 'default' }))[0];
const m5Source = Object.values(import.meta.glob(['../modules/Module05*.jsx'], { eager: true, query: '?raw', import: 'default' }))[0];

/**
 * La mission de hall-jabri (rollout 2026-11-12, conseil du 2026-11-11, verdict L2 + X11) : UN balayage de TOUT ce qu'un écran avant la مسألة peut
 * montrer — textes du labo, points d'étape, ورقة زميل, « أستعدّ », cartes (knowledge.jsx), carte des معارف (ouverte dès le début), exercices, données,
 * prose des modules 0–3 — contre la signature de la مسألة ET la règle P (aucun moins devant une parenthèse avant le module 4).
 */
const { mission } = LESSON_CONFIG;
const cpText = (cp) => [cp.prompt, ...cp.options, cp.explain].join(' ');
const flat = (o) => (typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(flat) : o && typeof o === 'object' ? Object.values(o).flatMap(flat) : []);
const scan = (label, s) => {
  TEXT.forEach((re) => expect(re.test(String(s)), `${label}: ${re} — ${String(s).slice(0, 90)}`).toBe(false));
  expect(RULE_P.test(String(s)), `${label}: rule P — ${String(s).slice(0, 90)}`).toBe(false);
};
const BOOK = [/الكتاب(?!ة)/, /تمرين\s*\d+/, /خطأً? مطبعي/, /نشاط\s*\d/, /ص\s*\d{2}\b/, /التلميذ\s*[12]/];

describe('the mission of hall-jabri', () => {
  it('one checkpoint after each of modules 1–3, the climax in module 4, the kiosk-cards scene, the map open', () => {
    expect(mission.climaxModule).toBe(4);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(4);
    expect(mission.checkpoints.map((c) => c.afterModule)).toEqual([1, 2, 3]);
    expect(mission.scene).toBe('kiosk-cards');
    expect(LESSON_CONFIG.studentView).toBe('mission');
    expect(LESSON_CONFIG.knowledgeMapOpen).toBe(true);
  });
  it('the tools are knowledge ids of the lesson; no label starts with a Latin letter', () => {
    const ids = Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => x.id);
    mission.tools.forEach((tl) => { expect(ids, tl.id).toContain(tl.id); expect(tl.label).not.toMatch(/^[A-Za-z]/); });
  });
  it('the opening and checkpoints never show the climax signature; the opening has no digit; options are distinct', () => {
    scan('opening', mission.opening.text);
    expect(/\d/.test(mission.opening.text)).toBe(false);
    mission.checkpoints.forEach((cp) => { scan(cp.id, cpText(cp)); expect(new Set(cp.options).size).toBe(cp.options.length); });
  });
  it('the checkpoints tell the truth, recomputed exactly from their own system (shown in the prompt)', () => {
    const sysOf = (cp) => LS.system(...cp.system.split('|'));
    const texOf = (s) => s.split('|').map((e) => e.replace(/([+\-=])/g, ' $1 ').replace(/\s+/g, ' ').trim());
    mission.checkpoints.forEach((cp) => texOf(cp.system).forEach((e) => expect(cp.prompt, cp.id).toContain(e)));
    // cp-thunaiya: only (4 ; 3) satisfies both equations
    const th = mission.checkpoints.find((c) => c.id === 'cp-thunaiya');
    th.options.forEach((o, i) => {
      const [x, y] = o.replace(/[$()\s]/g, '').split(';').map(Number);
      expect(LS.isSolution(sysOf(th), x, y), o).toBe(i === th.correct);
    });
    // cp-jam: multiplying (1) by the right option makes the y coefficients OPPOSITE; the others do not
    const jm = mission.checkpoints.find((c) => c.id === 'cp-jam');
    const [e1, e2] = sysOf(jm);
    jm.options.forEach((o, i) => {
      const k = Number(o.replace(/\$/g, ''));
      expect(LS.eliminated(LS.addEqs(LS.scale(e1, k), e2)) === 'y', o).toBe(i === jm.correct);
    });
    const sol = LS.classify(sysOf(jm));
    expect([Lin.toNumber(sol.x), Lin.toNumber(sol.y)]).toEqual([7, 1]);
    // cp-ikhtiyar: the y coefficients are opposite as they are; no coefficient is 1; (3 ; −2)
    const ik = mission.checkpoints.find((c) => c.id === 'cp-ikhtiyar');
    const [f1, f2] = sysOf(ik);
    expect(LS.eliminated(LS.addEqs(f1, f2))).toBe('y');
    expect([f1.a, f1.b, f2.a, f2.b].some((c) => Math.abs(Lin.toNumber(c)) === 1)).toBe(false);
    expect(LS.isSolution(sysOf(ik), 3, -2)).toBe(true);
  });
  it('the lab\'s player strings, the round texts, the peer sheet and « أستعدّ » never show the climax signature', () => {
    const lab = strings.eliminationCards;
    flat([lab.player, lab.predict, lab.coach]).forEach((s) => scan('player', s));
    flat(PEER_SHEET).forEach((s) => scan('peer', s));
    PREP_LADDER.forEach((it) => scan(`prep ${it.n}`, `${it.text} ${it.why}`));
    M1_ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => scan(r.id, `${x.props.lead} ${x.props.mission} ${x.helpLine ?? ''} ${r.title}`)));
  });
  it('the knowledge cards, the map, the exercises, the textbook data and the module prose never show the climax signature nor the book', () => {
    flat(Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => ({ memo: x.memo, predictPrompt: x.predictPrompt, summary: x.summary }))).forEach((s) => scan('knowledge', s));
    flat(KNOWLEDGE_GRAPH).forEach((s) => scan('graph', s));
    flat([...EXERCISES, ...NOW_59].map((ex) => ({ s: ex.statement, i: ex.items, q: ex.question, m: ex.method, c: ex.commonError }))).forEach((s) => scan('exercises', s));
    flat([TB.ACTIVITY, TB.IDEAS, TB.METHOD, TB.METHOD_BOX, TB.CHOICE]).forEach((s) => { scan('textbook', s); BOOK.forEach((re) => expect(re.test(s), `${re} ${s}`).toBe(false)); });
    flat(KNOWLEDGE_GRAPH).forEach((s) => BOOK.forEach((re) => expect(re.test(s), `${re} ${s}`).toBe(false)));
    flat(Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => ({ memo: x.memo, predictPrompt: x.predictPrompt }))).forEach((s) => BOOK.forEach((re) => expect(re.test(s), `${re} ${s}`).toBe(false)));
    expect(Object.keys(moduleSources)).toHaveLength(4);
    Object.entries(moduleSources).forEach(([path, src]) => src.split('\n').forEach((line, i) => {
      if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;
      scan(`${path}:${i + 1}`, line);
      BOOK.forEach((re) => expect(re.test(line), `${path}:${i + 1} ${re} — ${line.trim().slice(0, 80)}`).toBe(false));
    }));
  });
  it('the config text the student reads names no book, activity number or page', () => {
    flat([LESSON_CONFIG.modules, LESSON_CONFIG.resources, LESSON_CONFIG.teachingScope, mission]).forEach((s) => BOOK.forEach((re) => expect(re.test(s), `${re} ${s}`).toBe(false)));
  });
  it('the kiosk riddle lives after the climax (module 5), with prices in دج; the final test cites no book', () => {
    expect(m5Source).toContain('KioskRiddle');
    Object.values(moduleSources).forEach((src) => expect(src).not.toMatch(/HOOK|KioskVignette/));
    expect(JSON.stringify(TB.HOOK)).not.toMatch(/\bDA\b/);
    expect(itqanSource).not.toMatch(/الكتاب|SourceTag/);
  });
  it('the final test: E1 has one right pair, recomputed; E2 has ONE true option', () => {
    const e1 = TB.QCM[5];
    const s = LS.classify(LS.system('5x-y=4', '5x+y=8'));
    expect(e1.options[e1.correct]).toBe(`$\\left(${Lin.fracLatex(s.x)} ; ${Lin.toNumber(s.y)}\\right)$`);
    const e2 = TB.QCM[6];
    // y = 2x − 5 is the only rewriting of 2x − y = 5 among the options
    const eqs = ['y=2x-5', 'y=5-2x', 'y=2x+5', '2x=y-5'].map((q) => LS.eq2(q));
    const base = LS.eq2('2x-y=5');
    const equiv = (e) => Lin.isZero(Lin.sub(Lin.mul(e.a, base.b), Lin.mul(e.b, base.a))) && Lin.isZero(Lin.sub(Lin.mul(e.a, base.c), Lin.mul(e.c, base.a)));
    expect(eqs.map(equiv)).toEqual([true, false, false, false]);
    expect(e2.correct).toBe(0);
    // the module writes the answer keys as literals (assessment registry): they must be the data's
    expect(itqanSource).toMatch(new RegExp(`id: 'E1'[\\s\\S]*?correct: ${e1.correct}, cols`));
    expect(itqanSource).toMatch(new RegExp(`id: 'E2'[\\s\\S]*?correct: ${e2.correct}, cols`));
  });
});
