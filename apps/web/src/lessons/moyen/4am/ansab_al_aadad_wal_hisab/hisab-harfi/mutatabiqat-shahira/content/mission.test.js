import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LESSON_CONFIG } from '../lesson.config.js';
import { M1_ROUNDS, M2_ROUNDS, FREE, FREE_M2 } from './squares.js';
import { PEER_SHEET } from './peerSheet.js';
import { PREP_LADDER } from './prep.js';
import { EX } from './exercises.js';
import { PLATFORM } from './textbook.js';
import { violations, textHit } from './forbidden.js';
import * as L from '../../../../../../common/manipulations/logic/pitchExpansion.js';
import { LESSON_KNOWLEDGE } from '../knowledge.jsx';
import { KNOWLEDGE_GRAPH } from '../knowledgeGraph.js';
import { easierProps } from '../../../../../../common/manipulations/rounds/roundsModel.js';

/**
 * La mission de mutatabiqat-shahira (rollout 2026-11-11, conseil du 2026-11-11, verdict X3 et « L2 ») : UN balayage par rôle de TOUT ce qu'un écran
 * avant la مسألة (module 5) peut montrer — les manches, leurs entraînements, les défis et les ورشات libres (`logic › shownValues`), les points
 * d'étape, la ورقة زميل, « أستعدّ », les cartes de connaissance (corps compris : la carte est ouverte dès le début), la carte des معارف, les
 * exercices du module 4 et la PROSE des modules 0–4 (ligne par ligne, la signature de texte) — contre la signature de la مسألة
 * (content/forbidden.js). Les points d'étape n'utilisent ni sa méthode (un carré mental ancré sur un nombre rond) ni sa correction (le coin
 * retranché deux fois).
 */
const { mission } = LESSON_CONFIG;
const cpText = (cp) => [cp.prompt, ...cp.options, cp.explain].join(' ');
const modules = import.meta.glob('../modules/Module0[0-4]*.jsx', { eager: true, query: '?raw', import: 'default' });
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, '');
const unescape = (s) => s.replace(/\\\\/g, '\\');

describe('the mission of mutatabiqat-shahira', () => {
  it('one checkpoint after each of modules 1–4, the climax in module 5, the stands scene, the map open', () => {
    expect(mission.climaxModule).toBe(5);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(mission.checkpoints.map((c) => c.afterModule)).toEqual([1, 2, 3, 4]);
    expect(mission.scene).toBe('stands-pitch');
    expect(mission.title.startsWith('مدرّجات')).toBe(true);   // the title starts with the scene's object (verdict « Scenes »)
    expect(LESSON_CONFIG.studentView).toBe('mission');
    expect(LESSON_CONFIG.knowledgeMapOpen).toBe(true);
  });

  it('the tools are knowledge ids of the lesson; no label starts with a Latin letter', () => {
    const ids = Object.values(LESSON_KNOWLEDGE.modules).flat().map((x) => x.id);
    mission.tools.forEach((tl) => { expect(ids, tl.id).toContain(tl.id); expect(tl.label).not.toMatch(/^[A-Za-z]/); });
  });

  it('the checkpoints never show the climax signature, its method (a mental square around a round number) nor its fix (the corner)', () => {
    mission.checkpoints.forEach((cp) => {
      const s = cpText(cp);
      expect(textHit(s), cp.id).toBe(false);
      [/ركن/, /مرّتين/, /يُضاف .* مرّة/, /الكلّ ناقص/, /\d{2,}\s*\\times\s*\d{2,}/, /\(\s*\d0\s*[-−+]/, /دج/].forEach((re) => expect(re.test(s), `${cp.id} ${re}`).toBe(false));
    });
  });

  it('the checkpoints are the council\'s, recomputed from their prompts', () => {
    const [a, b, c, d] = mission.checkpoints;
    const [, k] = a.prompt.match(/\(x \+ (\d+)\)\^2/).map(Number);
    expect(a.options[a.correct]).toBe(`$x^2 + ${2 * k}x + ${k * k}$`);
    const [, n] = b.prompt.match(/\(x \+ (\d+)\)\(x - \1\)/).map(Number);
    expect(b.options[b.correct]).toBe(`$x^2 - ${n * n}$`);
    // c: x² + 4 = 4x holds at x = 2 only (a single point), refuted at x = 1
    expect(2 ** 2 + 4).toBe(4 * 2);
    expect(1 ** 2 + 4).not.toBe(4 * 1);
    expect(c.options[c.correct].startsWith('لا')).toBe(true);
    expect(d.options[d.correct]).toContain('$a = 4x$');
    mission.checkpoints.forEach((cp) => expect(new Set(cp.options).size).toBe(cp.options.length));
  });

  it('the dry-run: every value any round, practice round, challenge or free field can show is clean (role-paired)', () => {
    const all = [];
    [...M1_ROUNDS, ...M2_ROUNDS].forEach((r) => [r.props, r.easier ? easierProps(r) : null].filter(Boolean).forEach((p) => all.push(...L.shownValues(p))));
    [...FREE, ...FREE_M2].forEach((e) => all.push(...L.shownValues({ expr: e, span: 5, labels: 'terms' })));
    expect(all.length).toBeGreaterThan(500);
    expect(violations(all, 'all rounds')).toEqual([]);
  });

  it('what the rounds write, the peer sheet and « أستعدّ » never show the climax signature', () => {
    [...M1_ROUNDS, ...M2_ROUNDS].forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => {
      const p = x.props;
      expect(textHit(`${r.title ?? ''} ${p.lead} ${p.mission} ${x.helpLine ?? ''}`), r.id).toBe(false);
    }));
    expect(textHit(unescape(JSON.stringify(PEER_SHEET)))).toBe(false);
    PREP_LADDER.forEach((it) => expect(textHit(`${it.text} ${it.why}`), it.text).toBe(false));
  });

  it('the memo cards (bodies included) and the knowledge map never show the climax signature nor the book', () => {
    Object.values(LESSON_KNOWLEDGE.modules).flat().forEach((item) => {
      const body = renderToStaticMarkup(item.body ?? null);
      const s = unescape(`${item.title} ${item.summary ?? ''} ${item.predictPrompt ?? ''} ${JSON.stringify(item.memo ?? {})} ${body}`);
      expect(textHit(s), item.id).toBe(false);
      expect(s.includes('الكتاب'), item.id).toBe(false);
      // a quiz string never holds a control character (« \times » in single quotes becomes TAB + « imes »)
      (item.memo?.quiz ?? []).forEach((q) => expect(/[\t\n\r]/.test(q.q), `${item.id} ${q.q}`).toBe(false));
    });
    KNOWLEDGE_GRAPH.nodes.forEach((node) => expect(textHit(unescape(JSON.stringify(node))), node.id).toBe(false));
  });

  it('the module-4 exercises show no climax token, no book wording, and the retuned rows are right (recomputed)', () => {
    Object.values(EX).forEach((ex) => {
      const s = unescape(JSON.stringify({ ...ex, source: undefined }));
      expect(textHit(s), ex.id).toBe(false);
      expect(/الكتاب|سؤال التمرين السابق|مطبعي/.test(s), ex.id).toBe(false);
      expect(ex.correctionNote, ex.id).toBeUndefined();
    });
    const right = (id, i) => { const r = EX[id].question.rows[i]; return r.options[r.correct]; };
    const xs = [-2, 1, 3, 7];
    const same = (f, g) => xs.every((x) => Math.abs(f(x) - g(x)) < 1e-9);
    expect(right('now-36-1', 1)).toBe('$63x^3 + 34x^2 + 3x$');
    expect(same((x) => 4 * x * (4 * x + 1) ** 2 - x * (x - 1) ** 2, (x) => 63 * x ** 3 + 34 * x ** 2 + 3 * x)).toBe(true);
    expect(right('ex-11', 0)).toBe('$441$');
    expect(right('ex-11', 2)).toBe(`$1\\,016\\,064$`);
    expect(1008 ** 2).toBe(1016064);
    expect(right('ex-12', 0)).toBe('$x^2 + 10x + 25 = (x + 5)^2$');
    expect(right('ex-12', 1)).toBe('$16x^2 + 8x + 1 = (4x + 1)^2$');
    expect(right('ex-12', 2)).toBe('$x^2 + 14x + 49 = (x + 7)^2$');
    expect(right('ex-14', 0)).toBe('$4x^2 - 20x + 25$');
    expect(same((x) => (2 * x - 5) ** 2, (x) => 4 * x * x - 20 * x + 25)).toBe(true);
    expect(right('ex-15', 0)).toBe('$10x^2 - 32x + 32$');
    expect(same((x) => (3 * x - 4) ** 2 + (x - 4) ** 2, (x) => 10 * x * x - 32 * x + 32)).toBe(true);
    expect(right('ex-35', 0)).toBe('$x$');
    expect(same((x) => (x + 1) * (x + 4) - (x + 2) ** 2, (x) => x)).toBe(true);
    expect(101 * 104 - 102 ** 2).toBe(100);
    expect(1.5 * 4.5 - 2.5 ** 2).toBeCloseTo(0.5);
    // every wrong option of a retuned row is really wrong (one point suffices to refute)
    expect(1 ** 2 + 5 * 1 + 4 - (1 + 2) ** 2 + 1).not.toBe(5);
  });

  it('module prose (modules 0–4): no line shows the climax signature; the book references stay gone (literal pins)', () => {
    const src = Object.entries(modules).map(([path, s]) => [path, strip(s)]);
    expect(src).toHaveLength(5);
    src.forEach(([path, s]) => s.split('\n').forEach((line, i) => expect(textHit(line), `${path}:${i + 1} — ${line.trim().slice(0, 100)}`).toBe(false)));
    const GONE = ['الكتاب', 'ص 31', 'ص 34', 'ص 35', 'نشاط 2', 'ACTIVITY', 'DESCARTES', 'correctionNote', 'تمرين 9', 'تمرين 36', 'دوري الآن 1', 'KNOWLEDGE.examples', 'MNPQ', 'KLMN'];
    src.forEach(([path, s]) => GONE.forEach((g) => expect(s.includes(g), `${path}: ${g}`).toBe(false)));
    // modules 1 and 2 play the rounds in the player; module 2 ends on the peer sheet
    expect(src.find(([p]) => p.endsWith('Module01NashatMurabba.jsx'))[1]).toContain('labId="lab-square"');
    const m2 = src.find(([p]) => p.endsWith('Module02NashatJidaa.jsx'))[1];
    expect(m2).toContain('labId="lab-sumdiff"');
    expect(m2).toContain('<PeerSheet sheet={PEER_SHEET}');
    // the platform data that replaced the book's figures and examples is itself clean
    expect(textHit(unescape(JSON.stringify(PLATFORM)))).toBe(false);
  });

  it('no student-visible line of the config sends to the textbook', () => {
    const visible = [LESSON_CONFIG.description, ...LESSON_CONFIG.skills, mission.title, mission.opening.text, ...mission.tools.map((t) => t.label), ...mission.checkpoints.map(cpText),
      ...LESSON_CONFIG.modules.map((m) => `${m.title} ${m.desc}`), ...LESSON_CONFIG.resources.map((r) => `${r.title} ${r.objective ?? ''} ${r.autonomy ?? ''}`)];
    visible.forEach((s) => { expect(s.includes('الكتاب'), s).toBe(false); expect(/نشاط\s*\d|تمرين\s*\d|ص\s*\d/.test(s), s).toBe(false); });
    // the module list never shows the climax before module 5
    LESSON_CONFIG.modules.filter((m) => m.number < 5).forEach((m) => expect(textHit(`${m.title} ${m.desc}`), m.slug).toBe(false));
  });
});
