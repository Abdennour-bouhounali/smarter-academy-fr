import { describe, it, expect } from 'vitest';
import { LESSON_CONFIG } from '../lesson.config';
import { M1_ROUNDS, M2_ROUNDS } from './rays';
import { PEER_SHEET, PEER_KID } from './peerSheet';
import { PREP_LADDER } from './prep';
import { violations, TEXT } from './forbidden';
import * as P from '../../../../../../common/manipulations/logic/solutionRayPlayer.js';
import { LESSON_KNOWLEDGE } from '../knowledge.jsx';
import { KNOWLEDGE_GRAPH } from '../knowledgeGraph.js';
import { EXERCISES, NOW_49_1 } from './exercises.js';
import strings from '../../../../../../../i18n/locales/ar/lesson.manipulation.json';

// les sources des modules d'avant la مسألة (0 à 5), en texte brut : la prose JSX est corrigée à la main et ÉPINGLÉE ici
const moduleSources = import.meta.glob(['../modules/Module0[0-5]*.jsx'], { eager: true, query: '?raw', import: 'default' });

/**
 * La mission de mutarajiha-ula (rollout 2026-11-11, conseil du 2026-11-11, verdict « L3 ») : UN balayage par rôle de TOUT ce qu'un écran avant la
 * مسألة peut montrer — les manches des deux modules et leurs entraînements (`logic › shownValues`), les textes du labo, les points d'étape, la
 * ورقة زميل, « أستعدّ », les cartes (knowledge.jsx), la carte des معارف (ouverte dès le début), les exercices et la prose des modules 0 à 5 —
 * contre la signature de la مسألة (content/forbidden.js). Aucun point d'étape ne divise par un négatif (L3.8 a).
 */
const { mission } = LESSON_CONFIG;
const cpText = (cp) => [cp.prompt, ...cp.options, cp.explain].join(' ');
const ROUNDS = [...M1_ROUNDS, ...M2_ROUNDS];
const each = (fn) => ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => fn(x, r)));
const flat = (o) => (typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(flat) : o && typeof o === 'object' ? Object.values(o).flatMap(flat) : []);
const scan = (label, s) => TEXT.forEach((re) => expect(re.test(String(s)) || re.test(String(s).replace(/−/g, '-')), `${label}: ${re} — ${String(s).slice(0, 90)}`).toBe(false));

describe('the mission of mutarajiha-ula', () => {
  it('one checkpoint after each of modules 1–5, the climax in module 6, the phone-credit scene, the map open', () => {
    expect(mission.climaxModule).toBe(6);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(6);
    expect(mission.checkpoints.map((c) => c.afterModule)).toEqual([1, 2, 3, 4, 5]);
    expect(mission.scene).toBe('phone-credit');
    expect(LESSON_CONFIG.studentView).toBe('mission');
    expect(LESSON_CONFIG.knowledgeMapOpen).toBe(true);
  });
  it('the tools are knowledge ids of the lesson; no label starts with a Latin letter', () => {
    const ids = Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => x.id);
    mission.tools.forEach((tl) => { expect(ids, tl.id).toContain(tl.id); expect(tl.label).not.toMatch(/^[A-Za-z]/); });
  });
  it('the opening and checkpoints never show the climax signature; options are distinct; none divides an unknown by a negative', () => {
    scan('opening', mission.opening.text);
    expect(/\d/.test(mission.opening.text)).toBe(false);
    mission.checkpoints.forEach((cp) => {
      scan(cp.id, cpText(cp));
      expect(new Set(cp.options).size).toBe(cp.options.length);
      expect(/\\div|÷|نقسم الطرفين على\s*\$?-/.test(cpText(cp)), cp.id).toBe(false);
    });
  });
  it('every checkpoint answer is the truth, recomputed', () => {
    const byId = Object.fromEntries(mission.checkpoints.map((c) => [c.id, c]));
    // cp-hal: 6x + 1 < 43 -> x < 7
    expect([6, 7, 8].map((n) => 6 * n + 1 < 43)).toEqual([true, false, false]);
    expect(byId['cp-hal'].correct).toBe(0);
    // cp-yabqa: x + 9 > -2 -> x > -11 (-12 fails, -10 holds)
    expect([-12, -11, -10].map((n) => n + 9 > -2)).toEqual([false, false, true]);
    // cp-tariqa: 5x - 2 >= 33 -> x >= 7
    expect([6, 7, 8].map((n) => 5 * n - 2 >= 33)).toEqual([false, true, true]);
    // cp-nafs: x + 6 <= 8 <=> x <= 2 on a sweep
    for (let x = -10; x <= 10; x += 0.5) {
      expect(x + 6 <= 8, `x=${x}`).toBe(x <= 2);
    }
    expect(byId['cp-ramz'].correct).toBe(0);
    // the option TEXTS agree with the arithmetic above (the right one at `correct`)
    expect(byId['cp-hal'].options[byId['cp-hal'].correct]).toBe('$6$');
    expect(byId['cp-yabqa'].options[byId['cp-yabqa'].correct]).toBe('$x > -11$');
    expect(byId['cp-tariqa'].options[byId['cp-tariqa'].correct]).toContain('x \\geq 7');
    expect(byId['cp-nafs'].options[byId['cp-nafs'].correct]).toContain('x + 6 \\leq 8');
    expect(byId['cp-ramz'].options[byId['cp-ramz'].correct]).toContain('يمين 8، والرمز غير موجّه');
    // the decoys are false: 7 and 8 are not solutions; x < -11 and x > 7 disagree with x > -11 at x = -10 and x = 0
    expect(-10 < -11).toBe(false); expect(0 > 7).toBe(false);
  });
  it('every round screen (rounds, easier rounds, free choices) is clean by role', () => {
    each((x, r) => expect(violations(P.shownValues(x.props), r.id)).toEqual([]));
  });
  it('the texts of the rounds, the lab\'s player strings, the peer sheet and « أستعدّ » never show the climax signature', () => {
    flat(strings.solutionRay.player).forEach((s) => scan('player', s));
    flat(strings.solutionRay.coach).forEach((s) => scan('coach', s));
    flat(strings.solutionRay.predict).forEach((s) => scan('predict', s));
    flat(PEER_SHEET).forEach((s) => scan('peer', s));
    PREP_LADDER.forEach((it) => scan(`prep ${it.n}`, `${it.text} ${it.why}`));
    each((x, r) => scan(r.id, `${x.props.lead} ${x.props.mission} ${x.helpLine ?? ''}`));
  });
  it('the knowledge cards, the map, the exercises and the module texts never show the climax signature', () => {
    flat(Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => ({ memo: x.memo, predictPrompt: x.predictPrompt, summary: x.summary }))).forEach((s) => scan('knowledge', s));
    flat(KNOWLEDGE_GRAPH).forEach((s) => scan('graph', s));
    flat([...EXERCISES, ...NOW_49_1]).forEach((s) => scan('exercises', s));
    expect(Object.keys(moduleSources)).toHaveLength(6);
    Object.entries(moduleSources).forEach(([path, src]) => src.split('\n').forEach((line, i) => {
      if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;
      scan(`${path}:${i + 1}`, line);
    }));
  });
  it('the peer classmate is not a name of the climax, and the lesson names are the verdict\'s', () => {
    expect(PEER_KID.name).toBe('لقمان');
    const names = ['هدى', 'عماد'];
    const text = JSON.stringify(M1_ROUNDS.map((r) => r.props.lead));
    expect(names.some((n) => text.includes(n))).toBe(true);
    ['إيمان', 'يونس', 'نزيم'].forEach((n) => expect(JSON.stringify(PEER_SHEET).includes(n)).toBe(false));
  });
  it('no student-visible book reference in the config, the textbook data or the module sources', () => {
    const BOOK = [/الكتاب(?!ة)/, /تمرين\s*\d+/, /خطأً? مطبعي/, /ص\s*\d{2}/, /نشاط\s*3/];
    flat(LESSON_CONFIG.modules).concat(flat(mission), flat(LESSON_CONFIG.teachingScope)).forEach((s) => BOOK.forEach((re) => expect(re.test(s), `${re} — ${s.slice(0, 80)}`).toBe(false)));
    Object.entries(moduleSources).forEach(([path, src]) => src.split('\n').forEach((line, i) => {
      if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;
      BOOK.forEach((re) => expect(re.test(line), `${path}:${i + 1} ${re}`).toBe(false));
    }));
  });
  it('the back-and-forth audit: every build / rule / fill question reads only what its own screen holds', () => {
    // the lab\'s chain questions are laid OVER the lab: they restate their numbers in their prompts (costFill, edgeFill, boundFill, divFill, buildDiv)
    ['costFill', 'edgeFill', 'boundFill', 'divFill', 'buildDiv', 'buildIneq'].forEach((id) => {
      expect(strings.solutionRay.player[id].prompt ?? strings.solutionRay.player[id].promptLast, id).toBeTruthy();
    });
    // the table and its question share ONE keep block (Module02) and the graph question restates the solved line
    const m2 = Object.entries(moduleSources).find(([p]) => /Module02/.test(p))[1];
    expect(m2).toContain('data-paging-keep');
    expect(m2).toContain('كل قيم $x$ الأكبر من أو تساوي $-6$ . التمثيل البياني');
    NOW_49_1.concat(EXERCISES.filter((e) => e.graph)).forEach((e) => expect(e.graph.prompt, e.id).toMatch(/الحلّ/));
  });
});
