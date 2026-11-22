import { describe, it, expect } from 'vitest';
import { LESSON_CONFIG } from '../lesson.config';
import { M1_ROUNDS, M2_ROUNDS } from './pitch';
import { PEER_SHEET } from './peerSheet';
import { PREP_LADDER } from './prep';
import { violations, TEXT, SITUATION_REFUSAL } from './forbidden';
import * as P from '../../../../../../common/manipulations/logic/vanishingPitchPlayer.js';
import { LESSON_KNOWLEDGE } from '../knowledge.jsx';
import { KNOWLEDGE_GRAPH } from '../knowledgeGraph.js';
import { EXERCISES, NOW_47_2 } from './exercises.js';
import strings from '../../../../../../../i18n/locales/ar/lesson.manipulation.json';

// les sources des modules d'avant la مسألة (0 à 4) et le dernier (8), en texte brut : la prose JSX est corrigée à la main et ÉPINGLÉE ici
const moduleSources = import.meta.glob(['../modules/Module0[0-4]*.jsx', '../modules/Module08*.jsx'], { eager: true, query: '?raw', import: 'default' });

/**
 * La mission de jidaa-maadum (rollout 2026-11-11, conseil du 2026-11-11, verdict L2) : UN balayage par rôle de TOUT ce qu'un écran avant la مسألة peut
 * montrer — les manches des deux modules et leurs entraînements (`logic › shownValues`), les textes du labo, les points d'étape, la ورقة زميل,
 * « أستعدّ », les cartes (knowledge.jsx), la carte des معارف et les exercices — contre la signature de la مسألة (content/forbidden.js). La correction
 * interdite (refuser une solution à cause d'une situation) n'apparaît dans aucun point d'étape ni dans la ورقة.
 */
const { mission } = LESSON_CONFIG;
const cpText = (cp) => [cp.prompt, ...cp.options, cp.explain].join(' ');
const ROUNDS = [...M1_ROUNDS, ...M2_ROUNDS];
const each = (fn) => ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => fn(x, r)));
const flat = (o) => (typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(flat) : o && typeof o === 'object' ? Object.values(o).flatMap(flat) : []);
const scan = (label, s) => TEXT.forEach((re) => expect(re.test(String(s).replace(/−/g, '-')), `${label}: ${re} — ${String(s).slice(0, 90)}`).toBe(false));

describe('the mission of jidaa-maadum', () => {
  it('one checkpoint after each of modules 1–4, the climax in module 5, the pitch-planner scene, the map open', () => {
    expect(mission.climaxModule).toBe(5);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(mission.checkpoints.map((c) => c.afterModule)).toEqual([1, 2, 3, 4]);
    expect(mission.scene).toBe('pitch-planner');
    expect(LESSON_CONFIG.studentView).toBe('mission');
    expect(LESSON_CONFIG.knowledgeMapOpen).toBe(true);
  });
  it('the tools are knowledge ids of the lesson; no label starts with a Latin letter', () => {
    const ids = Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => x.id);
    mission.tools.forEach((tl) => { expect(ids, tl.id).toContain(tl.id); expect(tl.label).not.toMatch(/^[A-Za-z]/); });
  });
  it('the opening has no digit; the checkpoints never show the climax signature nor a situation refusal; options are distinct; « أو » answers', () => {
    scan('opening', mission.opening.text);
    expect(/\d/.test(mission.opening.text)).toBe(false);
    mission.checkpoints.forEach((cp) => {
      scan(cp.id, cpText(cp));
      expect(SITUATION_REFUSAL.test(cpText(cp)), cp.id).toBe(false);
      expect(new Set(cp.options).size).toBe(cp.options.length);
    });
    const byId = Object.fromEntries(mission.checkpoints.map((c) => [c.id, c]));
    expect(byId['cp-farq'].options[byId['cp-farq'].correct]).toBe('$7$ أو $-7$');
    expect(byId['cp-sifr'].options[byId['cp-sifr'].correct]).toBe('$0$ أو $2$');
  });
  it('the checkpoint arithmetic is right', () => {
    expect([(-8) * 0, (-8) * 8, 7 ** 2 - 49, (-7) ** 2 - 49, 7 * 0 * (0 - 2), 7 * 2 * (2 - 2)]).toEqual([-0, -64, 0, 0, -0, 0].map((v) => (Object.is(v, -0) ? -0 : v)));
    expect(7 * 7 * 5).not.toBe(0);                      // 7 is not a solution of 7x(x − 2) = 0
    expect((9 - 9) * (9 + 2)).toBe(0);                    // (x − 9)(x + 2) = 7 is not a zero-product equation: at x = 9 it gives 0, not 7
    expect((9 - 9) * (9 + 2)).not.toBe(7);
  });
  it('every round screen (rounds, easier rounds, free choices) is clean by role', () => {
    each((x, r) => expect(violations(P.shownValues(x.props), r.id)).toEqual([]));
  });
  it('no round shows the old activity pitches', () => {
    each((x) => {
      const exprs = [x.props, ...(x.props.choices ?? [])].map((p) => p.expr).filter(Boolean);
      ['3|x-5', 'x-2|x+5', '3x-4|-2x+1', '2x+1'].forEach((e) => expect(exprs).not.toContain(e));
    });
  });
  it('the lab\'s player strings, the peer sheet and « أستعدّ » never show the climax signature', () => {
    flat(strings.vanishingPitch).forEach((s) => scan('vanishingPitch', s));
    flat(PEER_SHEET).forEach((s) => scan('peer', s));
    PREP_LADDER.forEach((it) => scan(`prep ${it.n}`, `${it.text} ${it.why}`));
    each((x, r) => scan(r.id, `${x.props.lead} ${x.props.mission} ${x.helpLine ?? ''}`));
  });
  it('the knowledge cards, the map, the exercises and the module texts never show the climax signature nor the book', () => {
    flat(Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => ({ memo: x.memo, predictPrompt: x.predictPrompt, summary: x.summary }))).forEach((s) => scan('knowledge', s));
    flat(KNOWLEDGE_GRAPH).forEach((s) => scan('graph', s));
    flat([...EXERCISES, ...NOW_47_2].map(({ id, source, ...rest }) => rest)).forEach((s) => scan('exercises', s));
    expect(Object.keys(moduleSources)).toHaveLength(6);
    Object.entries(moduleSources).forEach(([path, src]) => src.split('\n').forEach((line, i) => {
      if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;
      scan(`${path}:${i + 1}`, line);
      expect(/الكتاب(?!ة)|ص\s*\d|تمرين\s*\d|إلياس|أمين/.test(line), `${path}:${i + 1} ${line.trim().slice(0, 80)}`).toBe(false);
    }));
  });
  it('the module 1 and 2 steps read what the player screen shows: the question screens carry their own numbers (no back-and-forth audit)', () => {
    // every build / rule question states the pitch (`prod`) or the pin it reads (`xEq`, `val`) in its own prompt
    ['buildConst', 'buildOr', 'buildSol', 'countP'].forEach((id) => {
      const p = strings.vanishingPitch.player[id].prompt;
      expect(/\{\{(prod|xEq|eq)\}\}/.test(p), id).toBe(true);
    });
    expect(strings.vanishingPitch.player.rest.prompt).toContain('{{xEq}}');
    expect(strings.vanishingPitch.cp.which.prompt).toContain('{{a}}');   // « which » restates both sides at the first pin
  });
});
