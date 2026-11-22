import { describe, it, expect } from 'vitest';
import { LESSON_CONFIG } from '../lesson.config';
import { M1_ROUNDS, PREDICT } from './planks';
import { PEER_SHEET } from './peerSheet';
import { PREP_LADDER } from './prep';
import { violations, NEVER, BAD_DISTANCE, BAD_RATIO } from './forbidden';
import * as L from '../../../../../../common/manipulations/logic/parallelLevel.js';
import { LESSON_KNOWLEDGE } from '../knowledge.jsx';

/**
 * La mission d'aksiya-talis (rollout 2026-11-10, conseil du 2026-11-10, verdict « Cross-lesson » et « L2 ») : UN balayage par rôle de TOUT ce qu'un
 * écran avant la مسألة peut montrer — les manches (`logic › shownValues` : chaque encoche, chaque rapport atteignable par le glisser, chaque pastille),
 * les prédictions, les points d'étape, la ورقة زميل et « أستعدّ » — contre la signature de la مسألة (content/forbidden.js). Les points d'étape
 * n'utilisent ni sa méthode (produits en croix, le piège des côtés opposés, le trou partenaire) ni sa correction (« même distance, même côté »).
 * Aucun texte destiné à l'élève ne renvoie au manuel.
 */
const { mission } = LESSON_CONFIG;
const text = (cp) => [cp.prompt, ...cp.options, cp.explain].join(' ');
const isolated = (s, n) => new RegExp(`(^|[^0-9,{}.])${n}([^0-9,{}.]|$)`).test(s);
const CLIMAX_NUMS = [...NEVER, ...BAD_DISTANCE];
const CLIMAX_FRACS = [/\{3\}\{10\}/, /\{9\}\{20\}/, /\{23\}\{50\}/, /0\{?,\}?(3|45|46)(?![0-9])/];

describe('the mission of aksiya-talis', () => {
  it('one checkpoint after each of modules 1–4, the climax in module 5, the painted wall, the map open', () => {
    expect(mission.climaxModule).toBe(5);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(mission.checkpoints.map((c) => c.afterModule)).toEqual([1, 2, 3, 4]);
    expect(mission.scene).toBe('paint-wall');
    expect(LESSON_CONFIG.studentView).toBe('mission');
    expect(LESSON_CONFIG.knowledgeMapOpen).toBe(true);
  });

  it('the tools are knowledge ids of the lesson; no label starts with a Latin letter', () => {
    const ids = Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => x.id);
    mission.tools.forEach((tl) => { expect(ids, tl.id).toContain(tl.id); expect(tl.label).not.toMatch(/^[A-Za-z]/); });
  });

  it('the checkpoints never use the climax numbers, ratios, its cross products, its opposite-sides trap nor its fix', () => {
    mission.checkpoints.forEach((cp) => {
      const s = text(cp);
      CLIMAX_NUMS.forEach((n) => expect(isolated(s, n), `${cp.id} ${n}`).toBe(false));
      CLIMAX_FRACS.forEach((re) => expect(re.test(s), `${cp.id} ${re}`).toBe(false));
      // the method and the fix of the climax
      [/\\times/, /جداء/, /الجهة الأخرى/, /جهتين/, /ثقب/, /المسافة نفسها/, /الجهة نفسها/].forEach((re) => expect(re.test(s), `${cp.id} ${re}`).toBe(false));
    });
  });

  it('the checkpoints are the council\'s, recomputed: 1/4 ≠ 1/2 → not level; midpoints 1/2 + order; Thales vs its converse; 3/9 = 1/3', () => {
    const [a, b, c, d] = mission.checkpoints;
    // the numbers are READ from the prompts, then recomputed (no constant asserted)
    const fr = [...a.prompt.matchAll(/\\dfrac\{(\d+)\}\{(\d+)\}/g)].map((m) => Number(m[1]) / Number(m[2]));
    expect(fr).toHaveLength(2);
    expect(fr[0]).not.toBe(fr[1]);
    expect(a.options[a.correct]).toMatch(/^لا/);
    expect(b.options[b.correct]).toContain('\\dfrac{1}{2}');
    expect(c.options[c.correct].startsWith('خاصية طالس')).toBe(true);
    const [ab, abp] = [/AB = (\d+)/, /AB' = (\d+)/].map((re) => Number(d.prompt.match(re)[1]));
    expect(d.options[d.correct]).toBe(`$\\dfrac{1}{${ab / abp}}$`);
    expect(d.options[d.correct]).toBe('$\\dfrac{1}{3}$');
    expect(d.options).toContain('$\\dfrac{1}{2}$');          // part over the rest: 3/6
    mission.checkpoints.forEach((cp) => expect(new Set(cp.options).size).toBe(cp.options.length));
  });

  it('the dry-run: every value any round, practice round, prediction or free pair can show is clean (role-paired)', () => {
    const all = [];
    M1_ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => all.push(...L.shownValues(x.props))));
    expect(all.length).toBeGreaterThan(500);
    expect(violations(all, 'all rounds')).toEqual([]);
    Object.values(PREDICT).flat().forEach((p) => p.at.forEach((v) => expect(BAD_DISTANCE.includes(String(Math.abs(v)))).toBe(false)));
  });

  it('what the rounds write, the peer sheet and « أستعدّ » never use the climax numbers', () => {
    M1_ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => {
      const s = `${r.title ?? ''} ${x.props.lead} ${x.props.mission} ${x.helpLine ?? ''}`;
      CLIMAX_NUMS.forEach((n) => expect(isolated(s, n), `${r.id} ${n}`).toBe(false));
    }));
    const peer = JSON.stringify(PEER_SHEET);
    CLIMAX_NUMS.forEach((n) => expect(isolated(peer, n), `peer ${n}`).toBe(false));
    const prep = PREP_LADDER.map((x) => `${x.text} ${x.why}`).join(' ');
    CLIMAX_NUMS.forEach((n) => expect(isolated(prep, n), `prep ${n}`).toBe(false));
    BAD_RATIO.forEach((r) => expect(prep.includes(r), r).toBe(false));
  });

  it('no student-visible line of the config sends to the textbook', () => {
    const visible = [LESSON_CONFIG.description, mission.title, mission.opening.text, ...mission.tools.map((t) => t.label), ...mission.checkpoints.map(text),
      ...LESSON_CONFIG.modules.map((m) => `${m.title} ${m.desc}`), ...LESSON_CONFIG.resources.map((r) => `${r.title} ${r.objective ?? ''} ${r.autonomy ?? ''}`)];
    visible.forEach((s) => { expect(s.includes('الكتاب'), s).toBe(false); expect(/نشاط\s*\d|تمرين\s*\d|ص\s*\d/.test(s), s).toBe(false); });
  });
});
