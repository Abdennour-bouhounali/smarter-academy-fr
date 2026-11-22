import { describe, it, expect } from 'vitest';
import { LESSON_CONFIG } from '../lesson.config';
import { M1_ROUNDS, M2_ROUNDS } from './turf';
import { PEER_SHEET } from './peerSheet';
import { PREP_LADDER } from './prep';
import { violations, TEXT, incompleteFactor } from './forbidden';
import * as L from '../../../../../../common/manipulations/logic/turfFactoring.js';
import { LESSON_KNOWLEDGE } from '../knowledge.jsx';
import { KNOWLEDGE_GRAPH } from '../knowledgeGraph.js';
import { EXERCISES, NOW_35_2, NOW_36_2 } from './exercises.js';
import strings from '../../../../../../../i18n/locales/ar/lesson.manipulation.json';

// les sources des modules d'avant la مسألة (0 à 4), en texte brut : la prose JSX est corrigée à la main et ÉPINGLÉE ici (verdict « Cross-lesson »)
const moduleSources = import.meta.glob(['../modules/Module0[0-4]*.jsx'], { eager: true, query: '?raw', import: 'default' });

/**
 * La mission de tahlil-ibara (rollout 2026-11-11, conseil du 2026-11-11, verdicts « Cross-lesson » et « L3 ») : UN balayage par rôle de TOUT ce
 * qu'un écran avant la مسألة peut montrer — les manches des deux modules et leurs entraînements (`logic › shownValues` : chaque r de la règle avec
 * ses plaques restées dehors, chaque facteur commun, rangée et égalité, les pastilles, les tuiles et le leurre développé, chaque répartition du carré,
 * les choix libres), les options des prédictions, les textes du labo, les points d'étape, la ورقة زميل, « أستعدّ », les cartes (knowledge.jsx),
 * la carte des معارف (knowledgeGraph.js, ouverte dès le début) et les exercices — contre la signature de la مسألة (content/forbidden.js). La
 * correction interdite au sens ÉTROIT : ni point d'étape, ni ورقة زميل, ni « أستعدّ » ne posent une analyse incomplète k(…) dont le crochet
 * partage un x. Le 9x + 3 de l'activité du manuel n'est montré par AUCUNE manche (verdict L3).
 */
const { mission } = LESSON_CONFIG;
const cpText = (cp) => [cp.prompt, ...cp.options, cp.explain].join(' ');
const ROUNDS = [...M1_ROUNDS, ...M2_ROUNDS];
const each = (fn) => ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => fn(x, r)));
const flat = (o) => (typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(flat) : o && typeof o === 'object' ? Object.values(o).flatMap(flat) : []);
const scan = (label, s) => TEXT.forEach((re) => expect(re.test(String(s)), `${label}: ${re} — ${String(s).slice(0, 90)}`).toBe(false));

describe('the mission of tahlil-ibara', () => {
  it('one checkpoint after each of modules 1–4, the climax in module 5, the turf-rolls scene, the map open', () => {
    expect(mission.climaxModule).toBe(5);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(mission.checkpoints.map((c) => c.afterModule)).toEqual([1, 2, 3, 4]);
    expect(mission.scene).toBe('turf-rolls');
    expect(mission.title.startsWith('لفائف العشب')).toBe(true);
    expect(LESSON_CONFIG.studentView).toBe('mission');
    expect(LESSON_CONFIG.knowledgeMapOpen).toBe(true);
  });
  it('the tools are knowledge ids of the lesson; no label starts with a Latin letter', () => {
    const ids = Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => x.id);
    mission.tools.forEach((tl) => { expect(ids, tl.id).toContain(tl.id); expect(tl.label).not.toMatch(/^[A-Za-z]/); });
  });
  it('the opening and checkpoints never show the climax signature nor an incomplete factorisation; options are distinct', () => {
    scan('opening', mission.opening.text);
    expect(/\d/.test(mission.opening.text)).toBe(false);
    mission.checkpoints.forEach((cp) => {
      scan(cp.id, cpText(cp));
      expect(incompleteFactor(cpText(cp)), cp.id).toBe(false);
      expect(new Set(cp.options).size).toBe(cp.options.length);
    });
  });
  it('the checkpoints are the council\'s: read from the config, ONLY the right option equals the prompt\'s sum (recomputed by expansion)', async () => {
    const { expand, samePolynomial } = await import('@smarter-academy/core/arithmetic/polynomials.js');
    const P = (s) => L.parseTerms(s.replace(/\s+/g, ''));
    const strip = (s) => s.replace(/\$/g, '').replace(/\s+/g, '').replace(/=$/, '');
    /** « k(a ± b) » or « (a ± b)^2 » → the expanded sum */
    const expandOf = (s) => {
      const sq = s.match(/^\((.*)\)\^2$/); if (sq) return expand(P(sq[1]), P(sq[1]));
      const kf = s.match(/^(-?\d*x?)\((.*)\)$/); if (kf) return expand(P(kf[1] || '1'), P(kf[2]));
      return P(s);
    };
    const [a, b, c, d] = mission.checkpoints;
    // 1 and 4: the prompt IS the sum; each option is a factorisation
    [a, d].forEach((cp) => {
      const sum = P(strip(cp.prompt));
      cp.options.forEach((o, i) => expect(samePolynomial(expandOf(strip(o)), sum), `${cp.id} ${o}`).toBe(i === cp.correct));
    });
    // 3: the prompt ends with the square to expand; each option is a sum
    const sq = strip(c.prompt.split(':').at(-1));
    c.options.forEach((o, i) => expect(samePolynomial(expandOf(sq), P(strip(o))), `${c.id} ${o}`).toBe(i === c.correct));
    // 2: x² + c with c > 0 matches no identity; the two others DO factor
    const factors = { '$x^2 - 64$': '(x-8)(x+8)', '$x^2 + 16x + 64$': '(x+8)^2' };
    b.options.forEach((o, i) => {
      if (i === b.correct) { expect(o).toMatch(/^\$x\^2 \+ \d+\$$/); return; }
      const f = factors[o];
      const sumOf = f.startsWith('(x-8)') ? expand(P('x-8'), P('x+8')) : expandOf(f);
      expect(samePolynomial(sumOf, P(strip(o))), o).toBe(true);
    });
  });
  it('every round screen (rounds, easier rounds, free choices) is clean by role', () => {
    each((x, r) => expect(violations(L.shownValues(x.props), r.id)).toEqual([]));
  });
  it('no round shows the activity\'s 9x + 3 nor the book example 6x² + 4x', () => {
    each((x) => {
      const exprs = [x.props, ...(x.props.choices ?? [])].map((p) => p.expr).filter(Boolean);
      expect(exprs).not.toContain('9x+3');
      expect(exprs).not.toContain('6x^2+4x');
    });
  });
  it('the lab\'s player strings, the peer sheet and « أستعدّ » never show the climax signature', () => {
    flat(strings.turfFactoring).forEach((s) => scan('turfFactoring', s));
    flat(PEER_SHEET).forEach((s) => scan('peer', s));
    PREP_LADDER.forEach((it) => scan(`prep ${it.n}`, `${it.text} ${it.why}`));
    // round texts (lead, mission) too
    each((x, r) => scan(r.id, `${x.props.lead} ${x.props.mission} ${x.helpLine ?? ''}`));
  });
  it('the knowledge cards, the map, the exercises and the module texts never show the climax signature', () => {
    flat(Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => ({ memo: x.memo, predictPrompt: x.predictPrompt, summary: x.summary }))).forEach((s) => scan('knowledge', s));
    flat(KNOWLEDGE_GRAPH).forEach((s) => scan('graph', s));
    flat([...EXERCISES, ...NOW_35_2, ...NOW_36_2]).forEach((s) => scan('exercises', s));
    expect(Object.keys(moduleSources)).toHaveLength(5);
    Object.entries(moduleSources).forEach(([path, src]) => src.split('\n').forEach((line, i) => {
      if (/^\s*(\*|\/\/)/.test(line)) return;
      scan(`${path}:${i + 1}`, line);
    }));
  });
  it('the memo quiz no longer shows a ratio-2:3 row (6x + 9 → 3(2x + 3)) nor 5x as a common factor of a sum in x', () => {
    const quiz = JSON.stringify(Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => x.memo?.quiz ?? []));
    expect(quiz.includes('6x+9')).toBe(false);
    expect(quiz.includes('3(2x+3)')).toBe(false);
    expect(JSON.stringify(EXERCISES).includes('5x(x - 1)')).toBe(false);
  });
});
