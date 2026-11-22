import { describe, it, expect } from 'vitest';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { LESSON_CONFIG } from '../lesson.config';
import { M1_ROUNDS, M2_ROUNDS } from './pairs';
import { PEER_SHEET } from './peerSheet';
import { PREP_LADDER } from './prep';
import { TEXT, violations } from './forbidden';
import { CP_SYSTEMS, CP_KATHIRA } from './checkpoints';
import { TEST_ITEMS } from './test';
import * as P from '../../../../../../common/manipulations/logic/pairScoreboardPlayer.js';
import { LESSON_KNOWLEDGE } from '../knowledge.jsx';
import { KNOWLEDGE_GRAPH } from '../knowledgeGraph.js';
import { EXERCISES } from './exercises.js';
import * as TB from './textbook.js';
import strings from '../../../../../../../i18n/locales/ar/lesson.manipulation.json';

// les sources des modules d'avant la مسألة (0 à 3), en texte brut : la prose JSX est écrite à la main et ÉPINGLÉE ici
const moduleSources = import.meta.glob(['../modules/Module0[0-3]*.jsx'], { eager: true, query: '?raw', import: 'default' });
const itqanSource = Object.values(import.meta.glob(['../modules/Module07*.jsx'], { eager: true, query: '?raw', import: 'default' }))[0];

/**
 * La mission de mafhum-jumla (rollout 2026-11-12, conseil du 2026-11-11, verdict L1) : UN balayage par rôle de TOUT ce qu'un écran avant la مسألة peut
 * montrer — les manches et leurs entraînements (`logic › shownValues`), les textes du labo, les points d'étape, la ورقة صهيب, « أستعدّ », les cartes
 * (knowledge.jsx), la carte des معارف (ouverte dès le début), les exercices, la prose des modules 0–3 — contre la signature de la مسألة
 * (content/forbidden.js). Les points d'étape disent la vérité (recalculée), et le test final n'a qu'une bonne réponse par question.
 */
const { mission } = LESSON_CONFIG;
const cpText = (cp) => [cp.prompt, ...cp.options, cp.explain].join(' ');
const each = (fn) => [...M1_ROUNDS, ...M2_ROUNDS].forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => fn(x, r)));
const flat = (o) => (typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(flat) : o && typeof o === 'object' ? Object.values(o).flatMap(flat) : []);
const scan = (label, s) => TEXT.forEach((re) => expect(re.test(String(s)), `${label}: ${re} — ${String(s).slice(0, 90)}`).toBe(false));
const BOOK = [/الكتاب(?!ة)/, /تمرين\s*\d+/, /خطأً? مطبعي/, /نشاط\s*\d/, /ص\s*\d{2}\b/, /معارف\s*\d/];
const F = (v) => (String(v).includes('/') ? Lin.frac(...String(v).split('/').map(Number)) : Lin.frac(Number(v)));
const casesTex = ([a, b]) => `$\\begin{cases} ${a} \\\\ ${b} \\end{cases}$`;
const visible = (obj) => flat(obj).filter((s) => !/^(textbook|platform_addition)$/.test(s));

describe('the mission of mafhum-jumla', () => {
  it('one checkpoint after each of modules 1–3, the climax in module 4, the civil-registry scene, the map open', () => {
    expect(mission.climaxModule).toBe(4);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(4);
    expect(mission.checkpoints.map((c) => c.afterModule)).toEqual([1, 2, 3]);
    expect(mission.scene).toBe('civil-registry');
    expect(LESSON_CONFIG.studentView).toBe('mission');
    expect(LESSON_CONFIG.knowledgeMapOpen).toBe(true);
  });
  it('the tools are knowledge ids of the lesson; no label starts with a Latin letter', () => {
    const ids = Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => x.id);
    mission.tools.forEach((tl) => { expect(ids, tl.id).toContain(tl.id); expect(tl.label).not.toMatch(/^[A-Za-z]/); });
  });
  it('the opening holds no digit; the checkpoints never show the climax signature; options are distinct', () => {
    expect(/\d/.test(mission.opening.text)).toBe(false);
    mission.checkpoints.forEach((cp) => {
      scan(cp.id, cpText(cp));
      expect(new Set(cp.options).size).toBe(cp.options.length);
      // no swapped pair of the right answer offered (the climax's fix), no « three candidates » format
      expect(cp.options.length).toBeLessThanOrEqual(3);
    });
  });
  it('the checkpoints tell the truth, recomputed from their own data', () => {
    const byId = Object.fromEntries(mission.checkpoints.map((cp) => [cp.id, cp]));
    // cp-kathira: both pairs satisfy 4x + y = 13 — « both » is the right option
    CP_KATHIRA.pairs.forEach(([x, y]) => expect(LS.holdsAt(LS.eq2(CP_KATHIRA.eq), x, y)).toBe(true));
    expect(byId['cp-kathira'].prompt).toContain(`$${CP_KATHIRA.eq}$`);
    expect(byId['cp-kathira'].options[byId['cp-kathira'].correct]).toContain('معًا');
    // cp-halat: infinitely many solutions
    expect(byId['cp-halat'].prompt).toContain(casesTex(CP_SYSTEMS['cp-halat']));
    expect(LS.classify(LS.system(...CP_SYSTEMS['cp-halat'])).kind).toBe('infinite');
    expect(byId['cp-halat'].options[byId['cp-halat'].correct]).toContain('غير منته');
    // cp-dhihni: (2 ; 5) — the other two pairs fail
    const dh = byId['cp-dhihni'];
    expect(dh.prompt).toContain(casesTex(CP_SYSTEMS['cp-dhihni']));
    const sys = LS.system(...CP_SYSTEMS['cp-dhihni']);
    dh.options.forEach((o, i) => {
      const [x, y] = o.replace(/[$()\s]/g, '').split(';').map(Number);
      expect(LS.isSolution(sys, x, y), o).toBe(i === dh.correct);
    });
  });
  it('every round screen (rounds, easier rounds, free choices) is clean by role', () => {
    each((x, r) => expect(violations(P.shownValues(x.props), r.id)).toEqual([]));
  });
  it('the lab\'s player strings, the peer sheet, « أستعدّ » and the round texts never show the climax signature', () => {
    flat(strings.pairScoreboard.player).forEach((s) => scan('player', s));
    flat(strings.pairScoreboard.predict).forEach((s) => scan('predict', s));
    flat(strings.pairScoreboard.coach).forEach((s) => scan('coach', s));
    flat(PEER_SHEET).forEach((s) => scan('peer', s));
    PREP_LADDER.forEach((it) => scan(`prep ${it.n}`, `${it.text} ${it.why}`));
    each((x, r) => scan(r.id, `${x.props.lead} ${x.props.mission} ${x.helpLine ?? ''} ${r.title ?? ''}`));
  });
  it('the knowledge cards, the map, the exercises, the rendered data and the module prose never show the climax signature nor the book', () => {
    const cards = Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => ({ memo: x.memo, predictPrompt: x.predictPrompt, summary: x.summary }));
    flat(cards).forEach((s) => { scan('knowledge', s); BOOK.forEach((re) => expect(re.test(s), `${re} ${s}`).toBe(false)); });
    flat(KNOWLEDGE_GRAPH).forEach((s) => { scan('graph', s); BOOK.forEach((re) => expect(re.test(s), `${re} ${s}`).toBe(false)); });
    visible(EXERCISES.map(({ source, ...rest }) => rest)).forEach((s) => scan('exercises', s));
    visible([TB.COINS, TB.KNOWLEDGE, TB.CASES_LINES, TB.EXAMPLE_LINES, TB.CHECK_METHOD, TB.MODULE_SYSTEMS].map((b) => ({ ...b, source: undefined }))).forEach((s) => {
      scan('textbook', s); BOOK.forEach((re) => expect(re.test(s), `${re} ${s}`).toBe(false));
    });
    expect(Object.keys(moduleSources)).toHaveLength(4);
    Object.entries(moduleSources).forEach(([path, src]) => src.split('\n').forEach((line, i) => {
      if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;
      scan(`${path}:${i + 1}`, line);
      BOOK.forEach((re) => expect(re.test(line), `${path}:${i + 1} ${re} — ${line.trim().slice(0, 80)}`).toBe(false));
    }));
  });
  it('the config text the student reads names no book, activity number or page', () => {
    flat([LESSON_CONFIG.modules, LESSON_CONFIG.resources.map((r) => r.title), LESSON_CONFIG.teachingScope, mission]).forEach((s) => BOOK.forEach((re) => expect(re.test(s), `${re} ${s}`).toBe(false)));
  });
  it('the scan fires (negative control) and lets the lesson\'s own look-alikes pass (positive control, verdict L1.14)', () => {
    ['$x - 3y = -6$', '$x + y = 42$', 'الثنائية $(30 ; 12)$', '$3(x - 6) = y - 4$', 'بعد التقاعد', '$x + y = 32$'].forEach((s) => expect(TEXT.some((re) => re.test(s)), s).toBe(true));
    ['$2x - 3y = 8$', '$3x - 3y = 5$', '$3x + y = 32$', '$2x + y = 10$'].forEach((s) => expect(TEXT.some((re) => re.test(s)), s).toBe(false));
  });
  it('the final test: E1–E4 are the platform\'s, each with exactly ONE true option (recomputed), and no book reference', () => {
    const holds = (eq, [x, y]) => LS.holdsAt(LS.eq2(eq), F(x), F(y));
    const e2 = TEST_ITEMS.E2.check;
    const truth2 = e2.eqs.map((eq) => holds(eq, e2.pair));
    const right2 = e2.options.map((set) => truth2.every((t, i) => t === set.includes(i)));
    expect(right2.filter(Boolean)).toHaveLength(1);
    expect(right2.indexOf(true)).toBe(TEST_ITEMS.E2.correct);
    const e3 = TEST_ITEMS.E3.check;
    const truth3 = e3.eqs.map((eq) => holds(eq, e3.pair));
    expect(truth3.filter(Boolean)).toHaveLength(1);
    expect(truth3.indexOf(true)).toBe(TEST_ITEMS.E3.correct);
    expect(itqanSource).not.toMatch(/الكتاب|SourceTag|QCM/);
    // the module writes `correct` as a LITERAL (the assessment registry exports it) — it must be the data's
    ['E1', 'E2', 'E3', 'E4'].forEach((id) => {
      const m = new RegExp(`id: '${id}'[\\s\\S]*?correct: (\\d)`).exec(itqanSource);
      expect(Number(m[1]), id).toBe(TEST_ITEMS[id].correct);
    });
  });
});
