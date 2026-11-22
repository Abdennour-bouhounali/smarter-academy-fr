import { describe, it, expect } from 'vitest';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { LESSON_CONFIG } from '../lesson.config';
import { M1_ROUNDS, M2_ROUNDS } from './balances';
import { PEER_SHEET } from './peerSheet';
import { PREP_LADDER } from './prep';
import { violations, TEXT } from './forbidden';
import * as P from '../../../../../../common/manipulations/logic/equationBalancePlayer.js';
import { LESSON_KNOWLEDGE } from '../knowledge.jsx';
import { KNOWLEDGE_GRAPH } from '../knowledgeGraph.js';
import { EXERCISES, NOW_47_1 } from './exercises.js';
import * as TB from './textbook.js';
import strings from '../../../../../../../i18n/locales/ar/lesson.manipulation.json';

// les sources des modules d'avant la مسألة (0 à 4), en texte brut : la prose JSX est corrigée à la main et ÉPINGLÉE ici
const moduleSources = import.meta.glob(['../modules/Module0[0-4]*.jsx'], { eager: true, query: '?raw', import: 'default' });
const itqanSource = Object.values(import.meta.glob(['../modules/Module08*.jsx'], { eager: true, query: '?raw', import: 'default' }))[0];

/**
 * La mission de muadala-ula (rollout 2026-11-11, conseil du 2026-11-11, verdict L1) : UN balayage par rôle de TOUT ce qu'un écran avant la مسألة peut
 * montrer — les manches des deux modules et leurs entraînements (`logic › shownValues`), les textes du labo, les points d'étape, la ورقة زميل, « أستعدّ »,
 * les cartes (knowledge.jsx), la carte des معارف (ouverte dès le début), les exercices, la prose des modules — contre la signature de la مسألة
 * (content/forbidden.js). Les points d'étape ne posent JAMAIS les termes en x des deux membres additionnés, ni une opération sur un seul membre comme option.
 */
const { mission } = LESSON_CONFIG;
const cpText = (cp) => [cp.prompt, ...cp.options, cp.explain].join(' ');
const ROUNDS = [...M1_ROUNDS, ...M2_ROUNDS];
const each = (fn) => ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => fn(x, r)));
const flat = (o) => (typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(flat) : o && typeof o === 'object' ? Object.values(o).flatMap(flat) : []);
const scan = (label, s) => TEXT.forEach((re) => expect(re.test(String(s)), `${label}: ${re} — ${String(s).slice(0, 90)}`).toBe(false));
const BOOK = [/الكتاب(?!ة)/, /تمرين\s*\d+/, /خطأً? مطبعي/, /نشاط\s*\d/, /ص\s*\d{2}\b/, /معارف\s*\d/];
// les équations du test final (module 8) : aucun écran d'avant ne les pose
const FINAL = ['-4 + x = 6', '5x = 8x', '5x = -3', '6x - 4 = 2x + 8', '3(x - 2) = x + 4'];
const nospace = (s) => String(s).replace(/\s+/g, '').replace(/−/g, '-');

describe('the mission of muadala-ula', () => {
  it('one checkpoint after each of modules 1–4, the climax in module 5, the locker-balance scene, the map open', () => {
    expect(mission.climaxModule).toBe(5);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(mission.checkpoints.map((c) => c.afterModule)).toEqual([1, 2, 3, 4]);
    expect(mission.scene).toBe('locker-balance');
    expect(LESSON_CONFIG.studentView).toBe('mission');
    expect(LESSON_CONFIG.knowledgeMapOpen).toBe(true);
  });
  it('the tools are knowledge ids of the lesson; no label starts with a Latin letter', () => {
    const ids = Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => x.id);
    mission.tools.forEach((tl) => { expect(ids, tl.id).toContain(tl.id); expect(tl.label).not.toMatch(/^[A-Za-z]/); });
  });
  it('the opening and checkpoints never show the climax signature; options are distinct; no x-terms added across, no one-sided option', () => {
    scan('opening', mission.opening.text);
    expect(/\d/.test(mission.opening.text)).toBe(false);
    mission.checkpoints.forEach((cp) => {
      scan(cp.id, cpText(cp));
      expect(new Set(cp.options).size).toBe(cp.options.length);
      expect(/ثم[^.]*من الطرف الأيمن وحده|طرف واحد فقط/.test(cpText(cp)), cp.id).toBe(false);
    });
  });
  it('the checkpoints tell the truth (recomputed exactly from their own equation): only the right option is right', () => {
    const num = (o) => { const t = o.replace(/\$|x\s*=\s*/g, '').trim(); const f = t.match(/^\\dfrac\{(-?\d+)\}\{(\d+)\}$/); return f ? Lin.frac(Number(f[1]), Number(f[2])) : Lin.frac(Number(t)); };
    // the equation each checkpoint is about, read here as data (the prompt must show it)
    const EQ = { 'cp-tarafayn': ['x+8=11', '$x + 8 = 11$'], 'cp-hal': ['8x=4', '$8x = 4$'], 'cp-nashr': ['3x-3=9', '$3(x - 1) = 9$'] };
    mission.checkpoints.filter((cp) => EQ[cp.id]).forEach((cp) => {
      const [src, shown] = EQ[cp.id];
      expect(cp.prompt, cp.id).toContain(shown);
      const [l, r] = src.split('=').map(Lin.linear);
      cp.options.forEach((o, i) => expect(Lin.holds(l, r, num(o)), `${cp.id} ${o}`).toBe(i === cp.correct));
    });
    // 3x − 5 = x + 1 at 3: the value of each side is the right option; 9 and 14 are not
    const tq = mission.checkpoints.find((cp) => cp.id === 'cp-tahaqquq');
    expect(tq.prompt).toContain('$3x - 5 = x + 1$');
    const [l, r] = '3x-5=x+1'.split('=').map(Lin.linear);
    tq.options.forEach((o, i) => expect(Lin.eq(Lin.linAt(l, 3), num(o)) && Lin.eq(Lin.linAt(r, 3), num(o)), o).toBe(i === tq.correct));
    expect(3 * (4 - 1)).toBe(9);
  });
  it('the programme: (2x + 5) × 2 − 7 = 4x + 3; 8 → 35; −3 → −9; نسيم 4x + 3 = 6x → 3/2', () => {
    const f = (x) => (2 * x + 5) * 2 - 7;
    [-4, -3, 1, 2, 8].forEach((x) => expect(f(x)).toBe(4 * x + 3));
    expect(f(TB.ACTIVITY.numbers.start)).toBe(TB.ACTIVITY.numbers.end);
    expect(f(TB.ACTIVITY.numbers.khadijaChoice)).toBe(TB.ACTIVITY.numbers.khadija);
    // the decoys of the tap question: parenthesis misplaced, −7 forgotten, only 2x doubled — all differ from 4x + 3 at 1, 2, 3, 8, −4
    [[(x) => (2 * x + 5 - 7) * 2], [(x) => 2 * x + 5 * 2 - 7], [(x) => (2 * x + 5) * 2]].forEach(([g]) => expect([1, 2, 3, 8, -4].every((x) => g(x) !== 4 * x + 3)).toBe(true));
    const [L, R] = '4x+3=6x'.split('=').map(Lin.linear);
    expect(Lin.holds(L, R, Lin.frac(3, 2))).toBe(true);
  });
  it('every round screen (rounds, easier rounds, free choices) is clean by role', () => {
    each((x, r) => expect(violations(P.shownValues(x.props), r.id)).toEqual([]));
  });
  it('the lab\'s player strings, the peer sheet and « أستعدّ » never show the climax signature', () => {
    flat(strings.equationBalance.player).forEach((s) => scan('player', s));
    flat(strings.equationBalance.predict).forEach((s) => scan('predict', s));
    flat(strings.equationBalance.coach).forEach((s) => scan('coach', s));
    flat(PEER_SHEET).forEach((s) => scan('peer', s));
    PREP_LADDER.forEach((it) => scan(`prep ${it.n}`, `${it.text} ${it.why}`));
    each((x, r) => scan(r.id, `${x.props.lead} ${x.props.mission} ${x.helpLine ?? ''}`));
  });
  it('the knowledge cards, the map, the exercises, the textbook data and the module prose never show the climax signature nor the book', () => {
    flat(Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => ({ memo: x.memo, predictPrompt: x.predictPrompt, summary: x.summary }))).forEach((s) => scan('knowledge', s));
    flat(KNOWLEDGE_GRAPH).forEach((s) => scan('graph', s));
    flat([...EXERCISES, ...NOW_47_1]).forEach((s) => scan('exercises', s));
    flat([TB.ACTIVITY, TB.HISTORY, TB.HISTORY_NOTE, TB.BALANCE_LINES, TB.KNOWLEDGE, TB.METHOD, TB.HOOK]).forEach((s) => { scan('textbook', s); BOOK.forEach((re) => expect(re.test(s), `${re} ${s}`).toBe(false)); });
    flat(KNOWLEDGE_GRAPH).forEach((s) => BOOK.forEach((re) => expect(re.test(s), `${re} ${s}`).toBe(false)));
    flat(Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => ({ memo: x.memo, predictPrompt: x.predictPrompt }))).forEach((s) => BOOK.forEach((re) => expect(re.test(s), `${re} ${s}`).toBe(false)));
    expect(Object.keys(moduleSources)).toHaveLength(5);
    Object.entries(moduleSources).forEach(([path, src]) => src.split('\n').forEach((line, i) => {
      if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;
      scan(`${path}:${i + 1}`, line);
      BOOK.forEach((re) => expect(re.test(line), `${path}:${i + 1} ${re} — ${line.trim().slice(0, 80)}`).toBe(false));
    }));
  });
  it('the config text the student reads names no book, activity number or page', () => {
    flat([LESSON_CONFIG.modules, LESSON_CONFIG.resources, LESSON_CONFIG.teachingScope, mission]).forEach((s) => BOOK.forEach((re) => expect(re.test(s), `${re} ${s}`).toBe(false)));
  });
  it('the final test\'s equations are shown by no earlier screen', () => {
    const everything = [
      flat(Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => ({ memo: x.memo, predictPrompt: x.predictPrompt }))), flat(KNOWLEDGE_GRAPH), flat([...EXERCISES, ...NOW_47_1]),
      PREP_LADDER.map((it) => it.text), Object.values(moduleSources), flat(PEER_SHEET), flat(TB.METHOD), flat(TB.KNOWLEDGE), mission.checkpoints.map(cpText),
      ROUNDS.flatMap((r) => [r, r.easier].filter(Boolean).flatMap((x) => [x.props.eq, ...(x.props.choices ?? [])])),
    ].flat().map(nospace).join('|');
    FINAL.forEach((f) => expect(everything.includes(nospace(f).replace(/\(/g, '(')), f).toBe(false));
    expect(itqanSource).toContain('$-4 + x = 6$');
    expect(itqanSource).not.toMatch(/الكتاب|SourceTag/);
  });
});
