import { describe, it, expect } from 'vitest';
import { LESSON_CONFIG } from '../lesson.config';
import { M1_ROUNDS, PREDICT } from './shadows';
import { PEER_SHEET } from './peerSheet';
import { PREP_LADDER } from './prep';
import { violations, textViolations, NEVER } from './forbidden';
import * as L from '../../../../../../common/manipulations/logic/shadowMeet.js';
import { LESSON_KNOWLEDGE } from '../knowledge.jsx';

/**
 * La mission de talis-hisab-atwal (rollout 2026-11-10, conseil du 2026-11-10, verdict « Cross-lesson » et « L1 ») : UN balayage par rôle de TOUT
 * ce qu'un écran avant la مسألة peut montrer — les manches (`logic/shadowMeet › shownValues`), les prédictions, les points d'étape, la ورقة زميل
 * et « أستعدّ » — contre la signature de la مسألة et le تحدّ de la synthèse (content/forbidden.js). Les points d'étape n'utilisent ni sa méthode
 * (le faisceau, la planche, les produits en croix du test « non parallèles », l'agrandissement) ni ses nombres dans leur rôle. Aucun texte
 * destiné à l'élève ne renvoie au manuel.
 */
const { mission } = LESSON_CONFIG;
const text = (cp) => [cp.prompt, ...cp.options, cp.explain].join(' ');
/** Un nombre à virgule écrit en TeX (« 2{,}8 ») ou en clair (« 2,8 ») → une fraction exacte [n, d]. */
const frac = (t) => { const [i, d = ''] = String(t).replace('{,}', ',').split(','); return [Number(i + d), 10 ** d.length]; };
const nums = (s, re) => [...s.matchAll(re)].map((m) => frac(m[1]));
const val = ([n, d]) => n / d;
/** Les valeurs d'une liste d'options contiennent-elles chacune des valeurs attendues (à 1e-9 près) ? */
const holds = (options, expected) => {
  const got = options.map((o) => val(frac(o.replace(/[$m ]/g, ''))));
  expected.forEach((e) => expect(got.some((g) => Math.abs(g - e) < 1e-9), `${e} in ${got}`).toBe(true));
};

describe('the mission of talis-hisab-atwal', () => {
  it('one checkpoint after each of modules 1–4, the climax in module 5, the night cinema, the map open', () => {
    expect(mission.climaxModule).toBe(5);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(mission.checkpoints.map((c) => c.afterModule)).toEqual([1, 2, 3, 4]);
    expect(mission.scene).toBe('night-cinema');
    expect(LESSON_CONFIG.studentView).toBe('mission');
    expect(LESSON_CONFIG.knowledgeMapOpen).toBe(true);
    expect(mission.opening.cta).toContain('لا أعرف بعد');
  });

  it('the tools are knowledge ids of the lesson; no label starts with a Latin letter', () => {
    const ids = Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => x.id);
    mission.tools.forEach((tl) => { expect(ids, tl.id).toContain(tl.id); expect(tl.label).not.toMatch(/^[A-Za-z]/); });
    expect(new Set(mission.tools.map((tl) => tl.id)).size).toBe(mission.tools.length);
  });

  it('the checkpoints never use the climax signature in its role, its beam, its board, its cross-product test nor its enlargement', () => {
    mission.checkpoints.forEach((cp) => {
      const s = text(cp);
      expect(textViolations(s, cp.id)).toEqual([]);
      NEVER.forEach((n) => expect(s.includes(n.replace(',', '{,}')), `${cp.id} ${n}`).toBe(false));
      [/جداء/, /حزمة/, /لوحة/, /شاشة/, /جهاز/, /غير متوازي/, /تكبير/].forEach((re) => expect(re.test(s), `${cp.id} ${re}`).toBe(false));
      expect(new Set(cp.options).size).toBe(cp.options.length);
    });
  });

  it('the checkpoints are the council\'s, recomputed from their own prompts (no constant asserted)', () => {
    const [a, b, c, d] = mission.checkpoints;
    const right = (cp) => val(frac(cp.options[cp.correct].replace(/[$m ]/g, '')));
    // 1 — a 1 m stick with a shadow of s ; a pole of h → h × s
    const [stick, s1, h1] = nums(a.prompt, /(\d+(?:,\d+)?) m/g);
    expect(stick).toEqual([1, 1]);
    expect(right(a)).toBeCloseTo(val(h1) * val(s1), 9);
    holds(a.options, [val(h1) + (val(s1) - 1), val(h1) / val(s1)]);
    // 2 — k = AM ÷ AB
    const am = frac(b.prompt.match(/AM = ([\d{},]+)/)[1]); const ab = frac(b.prompt.match(/AB = ([\d{},]+)/)[1]);
    expect(right(b)).toBeCloseTo(val(am) / val(ab), 9);
    expect(b.options).toContain('$\\dfrac{10}{3}$');                    // the other direction, AB ÷ AM
    expect(val(ab) / val(am)).toBeCloseTo(10 / 3, 9);
    // 3 — EW = EV × ET ÷ EU
    const g = (name) => val(frac(c.prompt.match(new RegExp(`${name} = ([\\d{},]+)`))[1]));
    expect(right(c)).toBeCloseTo((g('EV') * g('ET')) / g('EU'), 9);
    holds(c.options, [(g('EV') * g('EU')) / g('ET'), g('EV') + (g('ET') - g('EU'))]);
    // 4 — Pythagoras then Thales: OE² = OB² + BE² ; OM = OE × OA ÷ OB
    const h = (name) => val(frac(d.prompt.match(new RegExp(`${name} = ([\\d{},]+)`))[1]));
    const oe = Math.sqrt(h('OB') ** 2 + h('BE') ** 2);
    expect(oe).toBeCloseTo(1.5, 9);
    expect(right(d)).toBeCloseTo((oe * h('OA')) / h('OB'), 9);
    holds(d.options, [(h('OA') * h('OB')) / oe, h('OA') + (oe - h('OB'))]);
    mission.checkpoints.forEach((cp) => expect(cp.correct).toBe(0));
  });

  it('the dry-run: every value any round, practice round, prediction or free pair can show is clean (role-paired)', () => {
    const all = [];
    M1_ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => all.push(...L.shownValues(x.props))));
    expect(all.length).toBeGreaterThan(150);
    expect(violations(all, 'all rounds')).toEqual([]);
    expect(Object.values(PREDICT).flat().every((key) => L.predictOptions(key).length >= 2)).toBe(true);
  });

  it('what the rounds write, the peer sheet and « أستعدّ » never use the climax signature', () => {
    M1_ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => {
      expect(textViolations(`${r.title ?? ''} ${x.props.lead} ${x.props.mission} ${x.helpLine ?? ''}`, r.id)).toEqual([]);
    }));
    expect(textViolations(JSON.stringify(PEER_SHEET).replace(/\\\\/g, '\\'), 'peer')).toEqual([]);
    expect(textViolations(PREP_LADDER.map((x) => `${x.text} ${x.why}`).join(' '), 'prep')).toEqual([]);
  });

  it('the prep revise targets and the catalogue prerequisite are published lessons that TEACH the skill', () => {
    // read by Module00Astaidd.jsx (literal) — checked against the catalogues by _unit/prepDiagnostic.test.js and here by name
    expect(PREP_LADDER.map((x) => x.skill).filter((v, i, a) => a.indexOf(v) === i)).toEqual(['kasr', 'tanasub']);
  });

  it('no student-visible line of the config sends to the textbook', () => {
    const visible = [LESSON_CONFIG.description, mission.title, mission.opening.text, ...mission.tools.map((t) => t.label), ...mission.checkpoints.map(text),
      ...LESSON_CONFIG.modules.map((m) => `${m.title} ${m.desc}`), ...LESSON_CONFIG.resources.map((r) => `${r.title} ${r.objective ?? ''} ${r.autonomy ?? ''}`)];
    visible.forEach((s) => { expect(s.includes('الكتاب'), s).toBe(false); expect(/نشاط\s*\d|تمرين\s*\d|ص\s*\d/.test(s), s).toBe(false); });
  });
});
