import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LESSON_CONFIG } from '../lesson.config.js';
import { M1_ROUNDS, M2_ROUNDS, FREE } from './pitches.js';
import { PEER_SHEET } from './peerSheet.js';
import { PREP_LADDER } from './prep.js';
import { EXERCISES, NOW_EXERCISE } from './exercises.js';
import { violations, textHit, oppositeCross } from './forbidden.js';
import * as L from '../../../../../../common/manipulations/logic/pitchExpansion.js';
import { LESSON_KNOWLEDGE } from '../knowledge.jsx';
import { KNOWLEDGE_GRAPH } from '../knowledgeGraph.js';
import { easierProps } from '../../../../../../common/manipulations/rounds/roundsModel.js';

/**
 * La mission de nashr-tabsit (rollout 2026-11-11, conseil du 2026-11-11, verdict X3 et « L1 ») : UN balayage par rôle de TOUT ce qu'un écran
 * avant la مسألة (module 4) peut montrer — les manches, leurs entraînements, le module 2 et la ورشة libre (`logic › shownValues`), les points
 * d'étape, la ورقة زميل, « أستعدّ », les cartes de connaissance (corps compris : la carte est ouverte dès le début), la carte des معارف et les
 * exercices du module 3 — contre la signature de la مسألة (content/forbidden.js). Les points d'étape n'utilisent ni sa méthode (réduire deux termes
 * croisés opposés, l'écart lu à un grand x, la différence de deux développements, un prix) ni sa correction. La prose des modules est corrigée à la
 * main et ÉPINGLÉE ici par des chaînes littérales (conseil : pas d'analyseur de rôles pour le JSX).
 */
const { mission } = LESSON_CONFIG;
const cpText = (cp) => [cp.prompt, ...cp.options, cp.explain].join(' ');
const modules = import.meta.glob('../modules/*.jsx', { eager: true, query: '?raw', import: 'default' });
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('the mission of nashr-tabsit', () => {
  it('one checkpoint after each of modules 1–3, the climax in module 4, the pitch with its benches, the map open', () => {
    expect(mission.climaxModule).toBe(4);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(4);
    expect(mission.checkpoints.map((c) => c.afterModule)).toEqual([1, 2, 3]);
    expect(mission.scene).toBe('neighbourhood-pitch');
    expect(mission.title.startsWith('مقاعد')).toBe(true);   // the title starts with the scene's object (verdict « Scenes »)
    expect(LESSON_CONFIG.studentView).toBe('mission');
    expect(LESSON_CONFIG.knowledgeMapOpen).toBe(true);
  });

  it('the tools are knowledge ids of the lesson; no label starts with a Latin letter', () => {
    const ids = Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => x.id);
    mission.tools.forEach((tl) => { expect(ids, tl.id).toContain(tl.id); expect(tl.label).not.toMatch(/^[A-Za-z]/); });
  });

  it('the checkpoints never show the climax signature nor its method (opposite cross terms, a minus before a bracket of the climax, a price, a gap)', () => {
    mission.checkpoints.forEach((cp) => {
      const s = cpText(cp);
      expect(textHit(s), cp.id).toBe(false);
      [/دج/, /ثمن/, /الفرق بين/, /فرق المساحتين/, /\$\s*-\s*\(/].forEach((re) => expect(re.test(s), `${cp.id} ${re}`).toBe(false));
    });
  });

  it('the checkpoints are the council\'s, recomputed from their prompts', () => {
    const [a, b, c] = mission.checkpoints;
    // −3(x − 2): k and the constant read from the prompt
    const [, k, n] = a.prompt.match(/-(\d)\(x - (\d)\)/).map(Number);
    expect(a.options[a.correct]).toBe(`$-${k}x + ${k * n}$`);
    // (x + p)(x + q): both cross terms positive — no « cancel » temptation
    const [, p, q] = b.prompt.match(/\(x \+ (\d)\)\(x \+ (\d)\)/).map(Number);
    expect(b.options[b.correct]).toBe(`$x^2 + ${p + q}x + ${p * q}$`);
    expect(oppositeCross(`x+${p}|x+${q}`)).toBe(false);
    expect(c.options[c.correct].startsWith('لا')).toBe(true);
    mission.checkpoints.forEach((cp) => expect(new Set(cp.options).size).toBe(cp.options.length));
  });

  it('the dry-run: every value any round, practice round, module 2 or free pitch can show is clean (role-paired)', () => {
    const all = [];
    [...M1_ROUNDS, ...M2_ROUNDS].forEach((r) => [r.props, r.easier ? easierProps(r) : null].filter(Boolean).forEach((p) => all.push(...L.shownValues(p))));
    FREE.forEach((e) => all.push(...L.shownValues({ expr: e, span: 5, labels: 'terms' })));
    expect(all.length).toBeGreaterThan(500);
    expect(violations(all, 'all rounds')).toEqual([]);
  });

  it('what the rounds write, the peer sheet and « أستعدّ » never show the climax signature', () => {
    [...M1_ROUNDS, ...M2_ROUNDS].forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => {
      const p = x.props;
      expect(textHit(`${r.title ?? ''} ${p.lead} ${p.mission} ${x.helpLine ?? ''}`), r.id).toBe(false);
    }));
    expect(textHit(JSON.stringify(PEER_SHEET).replace(/\\\\/g, '\\'))).toBe(false);
    PREP_LADDER.forEach((it) => expect(textHit(`${it.text} ${it.why}`), it.text).toBe(false));
  });

  it('the memo cards (bodies included) and the knowledge map never show the climax signature', () => {
    Object.values(LESSON_KNOWLEDGE.modules).flat().forEach((item) => {
      const body = renderToStaticMarkup(item.body ?? null);
      const s = `${item.title} ${item.summary ?? ''} ${item.predictPrompt ?? ''} ${JSON.stringify(item.memo ?? {})} ${body}`.replace(/\\\\/g, '\\');
      expect(textHit(s), item.id).toBe(false);
      expect(s.includes('الكتاب'), item.id).toBe(false);
    });
    KNOWLEDGE_GRAPH.nodes.forEach((node) => expect(textHit(JSON.stringify(node).replace(/\\\\/g, '\\')), node.id).toBe(false));
  });

  it('the module-3 exercises are the platform\'s: no climax token, every product of two brackets with same-sign cross terms, no book wording', () => {
    const list = [NOW_EXERCISE, ...EXERCISES];
    expect(list).toHaveLength(9);
    list.forEach((ex) => {
      // what the student reads (the `source` metadata is muted for students — SourceTag)
      const s = JSON.stringify({ ...ex, source: undefined }).replace(/\\\\/g, '\\');
      expect(textHit(s), ex.id).toBe(false);
      expect(/الكتاب|رياض|إيمان|دوري الآن/.test(s), ex.id).toBe(false);
      // every « (ax ± b)(cx ± d) » written in the exercise: its cross terms have the same sign
      [...s.matchAll(/\((-?\d*[xa]\s*[+-]\s*\d+|-?\d+\s*[+-]\s*\d*[xa])\)\((-?\d*[xa]\s*[+-]\s*\d+|-?\d+\s*[+-]\s*\d*[xa])\)/g)]
        .forEach((m) => expect(oppositeCross(`${m[1]}|${m[2]}`.replace(/\s+/g, '').replace(/a/g, 'x')), `${ex.id} ${m[0]}`).toBe(false));
      expect(ex.source.part).toBeTruthy();   // the teacher sees it is rewritten with the platform's numbers
    });
  });

  it('module prose: the hand-fixed book references stay gone (literal pins)', () => {
    const src = Object.entries(modules).map(([path, s]) => [path, strip(s)]);
    const GONE = ['مثال الكتاب', 'الكتاب يكتب', 'في الكتاب', 'نشاط 1 —', 'السؤال 1', 'السؤال 2', 'السؤال 3', 'تمارين الكتاب', 'دوري الآن ص', 'ص 31', 'ص 35', 'ص 37',
      'الكتاب المدرسي', 'ACTIVITY.questions', 'correctionNote', 'رياض وإيمان'];
    src.forEach(([path, s]) => GONE.forEach((g) => expect(s.includes(g), `${path}: ${g}`).toBe(false)));
    // module 2's PLAYER evidence names its own pitch's zones; the page keeps (2x − 1)(x + 4) for the teacher
    const m2 = src.find(([p]) => p.endsWith('Module02Maarif.jsx'))[1];
    expect(m2).toContain('(-3) \\\\times (-1) = 3');
    expect(m2).toContain('PeerSheet');
  });

  it('no student-visible line of the config sends to the textbook', () => {
    const visible = [LESSON_CONFIG.description, mission.title, mission.opening.text, ...mission.tools.map((t) => t.label), ...mission.checkpoints.map(cpText),
      ...LESSON_CONFIG.modules.map((m) => `${m.title} ${m.desc}`), ...LESSON_CONFIG.resources.map((r) => `${r.title} ${r.objective ?? ''} ${r.autonomy ?? ''}`)];
    visible.forEach((s) => { expect(s.includes('الكتاب'), s).toBe(false); expect(/نشاط\s*\d|تمرين\s*\d|ص\s*\d/.test(s), s).toBe(false); });
  });
});
