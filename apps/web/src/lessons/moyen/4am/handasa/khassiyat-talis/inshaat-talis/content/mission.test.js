import { describe, it, expect } from 'vitest';
import { LESSON_CONFIG } from '../lesson.config';
import { M1_ROUNDS, M2_ROUNDS, PREDICT } from './banner';
import { PEER_SHEET, PEER_KID } from './peerSheet';
import { PREP_LADDER } from './prep';
import { violations, NEVER, BAD_LENGTH, BAD_RATIO, BAD_T } from './forbidden';
import * as L from '../../../../../../common/manipulations/logic/segmentDivider.js';
import { LESSON_KNOWLEDGE } from '../knowledge.jsx';
import strings from '../../../../../../../i18n/locales/ar/lesson.manipulation.json';

/**
 * La mission d'inshaat-talis (rollout 2026-11-10, conseil du 2026-11-10, verdict « Cross-lesson » et « L3 ») : UN balayage par rôle de TOUT ce qu'un
 * écran avant la مسألة peut montrer — les manches des deux modules (`logic › shownValues` : chaque longueur, chaque paire de rangs atteignable avec
 * son rapport et son t, chaque pastille, chaque leurre, les manches libres), les options des prédictions, les textes de refus du labo, les points
 * d'étape, la ورقة زميل et « أستعدّ » — contre la signature de la مسألة (content/forbidden.js). Les points d'étape n'utilisent ni sa méthode (deux
 * parallèles graduées, côtés opposés / même côté) ni sa correction (passer de MA/MB à AM/AB). Aucun texte destiné à l'élève ne renvoie au manuel.
 */
const { mission } = LESSON_CONFIG;
const text = (cp) => [cp.prompt, ...cp.options, cp.explain].join(' ');
const isolated = (s, n) => new RegExp(`(^|[^0-9,{}.])${n}([^0-9,{}.]|$)`).test(s);
const CLIMAX_NUMS = [...NEVER.filter((x) => !x.includes('/')), ...BAD_LENGTH.filter((x) => /^\d+$/.test(x))];
const CLIMAX_FRACS = [/\{4\}\{3\}/, /\{3\}\{4\}/, /\{4\}\{7\}/, /\{3\}\{7\}/, /\{40\}\{7\}/, /\{30\}\{7\}/, /\{10\}\{7\}/, /\{40\}\{3\}/, /5\{?,\}?7(?![0-9])/];
const ROUNDS = [...M1_ROUNDS, ...M2_ROUNDS];
const each = (fn) => ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => fn(x, r)));

describe('the mission of inshaat-talis', () => {
  it('one checkpoint after each of modules 1–3, the climax in module 4, the banner scene, the map open', () => {
    expect(mission.climaxModule).toBe(4);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(4);
    expect(mission.checkpoints.map((c) => c.afterModule)).toEqual([1, 2, 3]);
    expect(mission.scene).toBe('tifo-banner');
    expect(LESSON_CONFIG.studentView).toBe('mission');
    expect(LESSON_CONFIG.knowledgeMapOpen).toBe(true);
  });

  it('the tools are knowledge ids of the lesson; no label starts with a Latin letter', () => {
    const ids = Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => x.id);
    mission.tools.forEach((tl) => { expect(ids, tl.id).toContain(tl.id); expect(tl.label).not.toMatch(/^[A-Za-z]/); });
  });

  it('the checkpoints never use the climax numbers, ratios, its two graduated parallels nor its fix (MA/MB → AM/AB)', () => {
    mission.checkpoints.forEach((cp) => {
      const s = text(cp);
      CLIMAX_NUMS.forEach((n) => expect(isolated(s, n), `${cp.id} ${n}`).toBe(false));
      CLIMAX_FRACS.forEach((re) => expect(re.test(s), `${cp.id} ${re}`).toBe(false));
      // the method and the fix of the climax: the two parallels, the sides, the ratio of the two parts
      [/d_1|d₁|d_2|d₂/, /متوازي/, /جهتين/, /الجهة نفسها|نفس الجهة/, /MA\}\{MB|\{MA\}/, /NA\}\{NB/, /p \+ q/].forEach((re) => expect(re.test(s), `${cp.id} ${re}`).toBe(false));
      expect(new Set(cp.options).size).toBe(cp.options.length);
    });
  });

  it('the checkpoints are the council\'s, recomputed from their own prompts: the 6th mark; 3 of 8 against 3 to 5; 12 cm in 4 → the third point at 9', () => {
    const [a, b, c] = mission.checkpoints;
    const ORD = ['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة'];
    const n = Number(a.prompt.match(/إلى (\d+) قطع/)[1]);
    expect(a.options[a.correct]).toBe(`العلامة ${ORD[n]}`);
    expect(a.options).toEqual(expect.arrayContaining([`العلامة ${ORD[n - 1]}`, `العلامة ${ORD[n + 1]}`]));
    // b: part over WHOLE (k/n), its decoy is part over the REST (k/(n − k))
    const parts = Number(b.prompt.match(/إلى (\d+) قطع/)[1]);
    const rank = ORD.indexOf(b.prompt.match(/نقطة التقسيم (\S+)/)[1]);
    expect(rank).toBeGreaterThan(0);
    expect(b.options[b.correct]).toBe(`$\\dfrac{AM}{AB} = \\dfrac{${rank}}{${parts}}$`);
    expect(b.options).toContain(`$\\dfrac{AM}{AB} = \\dfrac{${rank}}{${parts - rank}}$`);
    // c: one part = length ÷ parts, the third point at 3 parts
    const len = Number(c.prompt.match(/طوله (\d+) cm/)[1]);
    const cuts = Number(c.prompt.match(/إلى (\d+) قطع/)[1]);
    const third = ORD.indexOf(c.prompt.match(/نقطة التقسيم (\S+)/)[1]);
    expect(c.options[c.correct]).toBe(`${(len / cuts) * third} cm`);
    expect(c.options).toContain(`${len / cuts} cm`);
    expect((len / cuts) * third).toBe(9);
  });

  it('the dry-run: every value any round, practice round or free choice can show is clean (role-paired)', () => {
    const all = [];
    each((x) => all.push(...L.shownValues(x.props)));
    expect(all.length).toBeGreaterThan(900);
    expect(violations(all, 'all rounds')).toEqual([]);
    // what the scan covered: every rank pair of every ratio round with its ratio and both its t
    expect(all.filter((x) => x.role === 'pair').length).toBeGreaterThanOrEqual(9 * 3);
    const ratios = new Set(all.filter((x) => x.role === 'ratio').map((x) => x.v));
    BAD_RATIO.forEach((r) => expect(ratios.has(r), r).toBe(false));
    const ts = new Set(all.filter((x) => x.role === 't' || x.role === 'decoy-t').map((x) => x.v));
    BAD_T.forEach((r) => expect(ts.has(r), r).toBe(false));
    expect(all.filter((x) => x.role === 'length').map((x) => x.v)).not.toContain('10');
  });

  it('the prediction options and the lab\'s refusal texts are clean too', () => {
    // prediction options: marks and counts around n, or a place — never a climax token
    each((x) => (x.props.predict ?? []).forEach((key) => {
      const lab = L.init({ mode: x.props.mode, parts: x.props.parts, p: x.props.p, q: x.props.q, marks: x.props.marks });
      L.predictOptions(lab, key).forEach((o) => { if (typeof o === 'number') expect(o).toBeLessThanOrEqual(6); else expect(['before', 'between', 'after']).toContain(o); });
    }));
    expect(Object.values(PREDICT).every((list) => list.length <= 2)).toBe(true);
    // the strings the player shows around a trial (verdicts, refusals, journal words, coach, predictions) hold no number at all, hence no climax number
    const sd = strings.segmentDivider;
    const flat = (o) => Object.values(o).flatMap((v) => (typeof v === 'string' ? [v] : flat(v)));
    [...flat(sd.vp), ...flat(sd.rowWord), ...flat(sd.coach), ...flat(sd.predict), sd.vJoinOne].forEach((s) => {
      expect(/[0-9]/.test(s.replace(/\{\{[a-z]+\}\}/g, '').replace('العلامة 1', '')), s).toBe(false);
    });
    // the refusal of two units is EXPLAINED in words and carries no value
    expect(sd.vp.units).toContain('وحدتان مختلفتان');
    expect(sd.vp.units).not.toMatch(/\$|\{\{/);
  });

  it('what the rounds write, the peer sheet and « أستعدّ » never use the climax numbers', () => {
    each((x, r) => {
      const s = `${r.title ?? ''} ${x.props.lead} ${x.props.mission} ${x.helpLine ?? ''}`;
      CLIMAX_NUMS.forEach((n) => expect(isolated(s, n), `${r.id} ${n}`).toBe(false));
      CLIMAX_FRACS.forEach((re) => expect(re.test(s), `${r.id} ${re}`).toBe(false));
    });
    const peer = JSON.stringify(PEER_SHEET).replace(/\\\\/g, '\\');
    CLIMAX_NUMS.forEach((n) => expect(isolated(peer, n), `peer ${n}`).toBe(false));
    CLIMAX_FRACS.forEach((re) => expect(re.test(peer), `peer ${re}`).toBe(false));
    expect(PEER_KID.name).toBe('سلمى');
    const prep = PREP_LADDER.map((x) => `${x.text} ${x.why}`).join(' ');
    CLIMAX_NUMS.forEach((n) => expect(isolated(prep, n), `prep ${n}`).toBe(false));
    CLIMAX_FRACS.forEach((re) => expect(re.test(prep), `prep ${re}`).toBe(false));
  });

  it('no student-visible line of the config sends to the textbook; the climax classmate is never reused', () => {
    const visible = [LESSON_CONFIG.description, mission.title, mission.opening.text, ...mission.tools.map((t) => t.label), ...mission.checkpoints.map(text),
      ...LESSON_CONFIG.modules.map((m) => `${m.title} ${m.desc}`), ...LESSON_CONFIG.resources.map((r) => `${r.title} ${r.objective ?? ''} ${r.autonomy ?? ''}`)];
    visible.forEach((s) => { expect(s.includes('الكتاب'), s).toBe(false); expect(/نشاط\s*\d|تمرين\s*\d|ص\s*\d|طرائق ص/.test(s), s).toBe(false); });
    // the modules before the climax never show the climax's banner length nor its ratio
    LESSON_CONFIG.modules.filter((m) => m.number < mission.climaxModule).forEach((m) => {
      const s = `${m.title} ${m.desc}`;
      CLIMAX_NUMS.forEach((n) => expect(isolated(s, n), `module ${m.number} ${n}`).toBe(false));
      CLIMAX_FRACS.forEach((re) => expect(re.test(s), `module ${m.number} ${re}`).toBe(false));
    });
    expect(JSON.stringify([PEER_SHEET, PEER_KID, mission.checkpoints, ROUNDS.map((r) => [r.props.lead, r.props.mission])]).includes('وليد')).toBe(false);
  });
});
