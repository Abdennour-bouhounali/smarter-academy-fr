import { describe, it, expect } from 'vitest';
import { PROBLEMS } from './problems.js';
import { textViolations, violations, visibleLines } from './forbidden.js';
import { LESSON_KNOWLEDGE } from '../knowledge.jsx';
import { KNOWLEDGE_GRAPH } from '../knowledgeGraph.js';
import { LESSON_CONFIG } from '../lesson.config.js';
import { M7_ROUNDS, R1, R2, R1_EASY, R2_EASY, FREE, FOUNTAIN } from './rounds.js';
import { M7_SITUATION } from './textbook.js';
import { PEER_SHEET, PEER_KID } from './peerSheet.js';
import { PREP_LADDER } from './prep.js';
import * as L from '../../../../../../common/manipulations/logic/pitchExpansion.js';
import { chainsOfPlayer } from '../../../../../../common/manipulations/algebra/PitchExpansion.jsx';
import { emptyLog, logEvent, roundWon, starsFor, easierProps } from '../../../../../../common/manipulations/rounds/roundsModel.js';
import module7Src from '../modules/Module07AlWadiya.jsx?raw';
import module8Src from '../modules/Module08Ahill.jsx?raw';
import textbookSrc from './textbook.js?raw';

const knowledgeOf = import.meta.glob('../../*/knowledge.jsx', { eager: true });
const labContent = import.meta.glob(['../../*/content/{pitches,squares,turf}.js'], { eager: true });
const peerSheets = import.meta.glob('../../../../../../**/content/peerSheet.js', { eager: true });

/**
 * La synthèse de l'unité 3 dans le lecteur de mission (2026-11-12, recette PROVISOIRE de la synthèse) — LE BALAYAGE PAR RÔLE, écrit AVANT la
 * conversion : tout ce qu'un écran avant le module 7 ou le défi 🏆 peut montrer, contre la signature du défi (module 8) et la situation de l'unité
 * (module 7) : content/forbidden.js. Il a d'abord ÉCHOUÉ (rapport du constructeur : la carte des معارف montrait toute la وضعية et son « مساعدة »,
 * les cartes de mémoire le bassin 10 + 2x, l'entraînement 4 l'aire 144, l'entraînement 6 x(x + 10), le module 7 la racine −11 et x = 1).
 */
const json = (x) => JSON.stringify(x).replace(/\\\\/g, '\\');
const cardText = (item) => json({ title: item.title, summary: item.summary, memo: item.memo, body: item.body, predictPrompt: item.predictPrompt });
/** Ce qu'une étape tapée d'un entraînement TROUVE. */
const found = (p) => p.parts.flatMap((part) => part.steps).filter((s) => s.kind === 'numeric').map((s) => s.expected);

describe('the synthesis — role scan of every screen before its time', () => {
  it('the six trainings never show the challenge (module 8) nor the unit situation (module 7)', () => {
    PROBLEMS.forEach((p) => expect(textViolations(json(p), p.id)).toEqual([]));
  });
  it('money is « دج », never « DA », and no number carries a thousands space (owner, 2026-11-12) — trainings, memo cards, map, data, module 8', () => {
    const texts = [json(PROBLEMS), json(Object.values(LESSON_KNOWLEDGE.modules).flat().map(cardText)), json(KNOWLEDGE_GRAPH), module8Src, visibleLines(textbookSrc).join('\n')];
    texts.forEach((t) => { expect(t).not.toMatch(/DA\b/); expect(t).not.toMatch(/(?<![0-9.,])[0-9]{1,3} [0-9]{3}(?![0-9])/); });
  });
  it('no training FINDS a number of the challenge (144, 44, ±11)', () => {
    PROBLEMS.forEach((p) => found(p).forEach((v) => expect([144, 44, -11, 11], `${p.id}: ${v}`).not.toContain(v)));
  });
  it('the memo cards (open from the first screen) never hold the situation nor the challenge\'s answer', () => {
    Object.values(LESSON_KNOWLEDGE.modules).flat().forEach((item) => expect(textViolations(cardText(item), item.id)).toEqual([]));
  });
  it('the knowledge map (open from the first screen) never shows them either', () => {
    KNOWLEDGE_GRAPH.nodes.forEach((node) => expect(textViolations(json(node), node.id)).toEqual([]));
  });
  it('the role scan catches what it must (negative controls)', () => {
    ['$4x^2 + 40x$', '4x² + 40x', '$40x + 4x^2$', '$x^2 + 10x - 11 = 0$', '$x^2 + 10x = 11$', '$(x - 1)(x + 11)$', 'x + 11', '$-11$', '−11', '144', '\\text{144}',
      '$4x(x + 10)$', '$x(x + 10) = 11$', '$(x + 5)^2 = 36$', '$x = 1\\,m$', 'x = 1 m', 'عرض الشريط متر واحد',
      '$4 x^2 + 40x$', '$(x + 10)x$', '$12^2$', '12²', '$10 + 2 \\times x$', '١٤٤', '٤٤ مترًا مربّعًا', 'الحوض', 'الشريط', '44 مترًا مربّعًا', '$44m^2$', '$10 + 2x$', '2x + 10', 'x + 10 + x', '$10^2$', 'ضلعه 10']
      .forEach((s) => expect(textViolations(s).length, s).toBeGreaterThan(0));
    ['$4x^2 + 28x$', '$x^2 + 13x - 30$', '$(x - 2)(x + 15)$', '1440', '$14{,}4$', '$x = 1$', '$12x$', '$x + 12$', '$100 - 4$', '$x^2 + 12x$', '440', '$110$', '$3 \\times 11 = 33$', 'ممرّ', 'نافورة', '$2x + 7$', '$12x + 10$']
      .forEach((s) => expect(textViolations(s), s).toEqual([]));
    // module 7 may show the situation, never its solution
    expect(textViolations('$(10 + 2x)^2 - 10^2 = 44$', 'm7', { before7: false })).toEqual([]);
    expect(textViolations('حوض ضلعه 10 أمتار وشريط مساحته 44 مترًا مربّعًا', 'm7', { before7: false })).toEqual([]);
    expect(textViolations('$4x^2 + 40x = 44$', 'm7', { before7: false }).length).toBeGreaterThan(0);
    expect(violations([{ role: 'side', v: '12' }, { role: 'area', v: '100' }, { role: 'tile', v: '144' }, { role: 'term', v: '40x' }, { role: 'expansion', v: '4x^2 + 40x' }, { role: 'factor', v: 'x+11' }, { role: 'ring', v: '44' }])).toHaveLength(7);
    expect(violations([{ role: 'side', v: '11' }, { role: 'area', v: '49' }, { role: 'sum', v: '44' }, { role: 'decoy', v: '100' }, { role: 'term', v: '+28x' }, { role: 'x', v: '1' }])).toEqual([]);
  });
});

/* ── les manches du module 7 : chaque écran balayé (recalculé par la logique du labo), chaque manche jouée jusqu'à son but ── */
const ALL = M7_ROUNDS.flatMap((r) => [{ id: r.id, round: r, props: r.props }, ...(r.easier ? [{ id: `${r.id}-easy`, round: r.easier, props: easierProps(r) }] : [])]);
/** Porter les neuf zones, vérifier pour les x donnés (en mode termes, réunir d'abord les termes semblables). */
function play(props, xs) {
  let s = L.init({ expr: props.expr, simplify: props.labels !== 'area' });
  s.cells.forEach((c) => { s = L.collect(s, c.id); });
  if (props.labels !== 'area') {
    for (let guard = 0; guard < 20 && !L.isSimplified(s); guard += 1) {
      const [a, b] = s.tray.flatMap((u, i) => s.tray.slice(i + 1).filter((v) => v.term.p === u.term.p).map((v) => [u.id, v.id]))[0];
      s = L.merge(s, a, b);
    }
  }
  xs.forEach((x) => { s = L.verify(s, x); });
  return s;
}

describe('module 7 « وضعية الوحدة » — the rounds', () => {
  it('two required rounds (r1 in areas by hand, r2 in terms), their practice rounds RELEASE them, then the free lab', () => {
    expect(M7_ROUNDS.map((r) => r.id)).toEqual(['r1', 'r2', 'free']);
    expect(M7_ROUNDS.filter((r) => r.easier).every((r) => r.easier.releases)).toBe(true);
    expect(M7_ROUNDS.filter((r) => !r.free).every((r) => !r.optional)).toBe(true);
    expect(M7_ROUNDS[0].props).toMatchObject({ type: 'pitch-expansion', expr: 'x+7+x', labels: 'area', chains: 'ring' });
    expect(M7_ROUNDS[1].props).toMatchObject({ type: 'pitch-expansion', expr: 'x+7+x', labels: 'terms', chains: 'ringTerms' });
  });
  it('the sibling field is a ring: the fountain 7 in the middle, the path on both sides; an odd side is never 10 nor 12', () => {
    [R1, R2, R1_EASY, R2_EASY].forEach((p) => expect(L.ringOf(L.init({ expr: p.expr }))).toBeGreaterThan(0));
    expect(L.ringOf(L.init({ expr: R1.expr }))).toBe(FOUNTAIN);
    expect(FOUNTAIN % 2).toBe(1);
    expect(L.ringOf(L.init({ expr: '3|x+5' }))).toBeNull();
    expect(L.ringOf(L.init({ expr: 'x+3' }))).toBeNull();
  });
  it('r1 ends on the NUMERICAL build at the student\'s x: 121 − 49 = 4 × 14 + 4 × 4 (x = 2), decoy 7 (the side taken for the area)', () => {
    const s = play(R1, [2, 3]);
    expect(L.playerDiscovery(s)).toBe(true);
    const p = L.ringBuildParts(s, L.verifiedXs(s)[0]);
    expect(p.expected).toEqual(['121', '49', '14', '4']);
    expect(p.decoy).toBe('7');
    expect(p.outer - p.center).toBe(4 * p.strip + 4 * p.corner);
    for (const x of L.playerXs(R1)) {
      const q = L.ringBuildParts(s, x);
      expect(q.ring, `x=${x}`).toBe(4 * q.strip + 4 * q.corner);
      expect(new Set([...q.expected, q.decoy]).size, `x=${x}`).toBe(5);
    }
    expect(chainsOfPlayer('ring').map((c) => c.id)).toEqual(['ring']);
    expect(chainsOfPlayer('ring')[0].reached(s)).toBe(true);
    expect(chainsOfPlayer('ring')[0].reached(play(R1, [2]))).toBe(false);
  });
  it('r2 ends on the build (2x + 7)² − 7² = 4x² + 28x (decoys +49 and +14x), true for every x', () => {
    const s = play(R2, [2, 4]);
    expect(L.playerDiscovery(s)).toBe(true);
    const p = L.ringExprParts(s);
    expect(p.expected).toEqual(['4x^2', '+28x']);
    expect(p.decoys).toEqual(['+49', '+14x']);
    [0, 1, 2, 5, 9].forEach((x) => expect((2 * x + 7) ** 2 - 49).toBe(4 * x * x + 28 * x));
    expect(chainsOfPlayer('ringTerms')[0].reached(s)).toBe(true);
    expect(L.ringBuildParts(play(R1_EASY, [2]), 2).expected).toEqual(['49', '9', '6', '4']);
  });
  it('every practice round is smaller than its round; the area rule skips the collision x', () => {
    expect(L.ringOf(L.init({ expr: R1_EASY.expr }))).toBeLessThan(FOUNTAIN);
    expect(L.ringOf(L.init({ expr: R2_EASY.expr }))).toBeLessThan(FOUNTAIN);
    expect(L.playerXs(R1)).toEqual([1, 2, 3, 4]);
    expect(L.playerXs(R1_EASY)).not.toContain(3);
  });
  it('the dry-run: every value any round, practice round or free choice can show is clean (role-paired)', () => {
    ALL.forEach(({ id, props }) => expect(violations(L.shownValues(props), id), id).toEqual([]));
    FREE.forEach((expr) => expect(violations(L.shownValues({ expr, span: 3, labels: 'terms' }), `free ${expr}`)).toEqual([]));
    // the rounds' own roles: the whole field (« pitch »), the path (« ring ») and the fountain (« center ») at every reachable x
    const shown = L.shownValues(M7_ROUNDS[0].props);
    expect(shown.some((x) => x.role === 'ring' && x.v === '72')).toBe(true);
    M7_ROUNDS.forEach((r) => [r.props, r.easier && easierProps(r)].filter(Boolean).forEach((p) => {
      expect(textViolations(`${r.title} ${p.lead} ${p.mission ?? ''} ${r.easier?.helpLine ?? ''}`, r.id)).toEqual([]);
      expect(p.lead).not.toMatch(/DA\b|الكتاب/);
    }));
  });
  it('each required round is won by its chain; the practice rounds by their build', () => {
    const [r1, r2] = M7_ROUNDS;
    let log = logEvent(emptyLog(), 'trial', { tk: 'discovered' });
    expect(roundWon(r1, log)).toBe(false);
    log = logEvent(log, 'trial', { tk: 'checkpoint-done', id: 'ring' });
    expect(roundWon(r1, log)).toBe(true);
    expect(starsFor(r1, log)).toBe(3);
    let l2 = logEvent(emptyLog(), 'trial', { tk: 'discovered' });
    l2 = logEvent(l2, 'trial', { tk: 'checkpoint-done', id: 'ringExpr' });
    expect(roundWon(r2, l2)).toBe(true);
    expect(roundWon(r1.easier, logEvent(emptyLog(), 'trial', { tk: 'checkpoint-done', id: 'ring' }))).toBe(true);
    expect(roundWon(r2.easier, logEvent(emptyLog(), 'trial', { tk: 'checkpoint-done', id: 'ringExpr' }))).toBe(true);
  });
});

/* ── la règle des collisions : aucun terrain du module 7 n'est un terrain d'une manche des leçons de l'unité ── */
const lessonExprs = new Set();
const walk = (x, depth = 0) => {
  if (!x || typeof x !== 'object' || depth > 6) return;
  if (typeof x.expr === 'string') lessonExprs.add(x.expr);
  Object.values(x).forEach((v) => walk(v, depth + 1));
};
Object.values(labContent).forEach((m) => walk(m));
const productAt = (expr, x) => { const s = L.init({ expr }); return L.product(s, x); };
const sameField = (e1, e2) => [0, 1, 2, 3, 5].every((x) => productAt(e1, x) === productAt(e2, x));

describe('module 7 — the collision rule against the unit\'s lessons', () => {
  it('the lessons\' round fields are read', () => {
    expect(Object.keys(labContent).length).toBeGreaterThanOrEqual(3);
    ['3|x+5', 'x+4', '2x-3|x-1'].forEach((e) => expect(lessonExprs.has(e), e).toBe(true));
  });
  it('no round, practice or free field of module 7 is (or expands like) a field of a lesson\'s rounds', () => {
    const pitchExprs = [...lessonExprs].filter((e) => { try { L.init({ expr: e }); return true; } catch { return false; } });
    [R1.expr, R1_EASY.expr, ...FREE].forEach((e) => pitchExprs.forEach((l) => expect(sameField(e, l), `${e} vs ${l}`).toBe(false)));
  });
});

describe('module 7 — its own screens never show the challenge SOLVED', () => {
  it('no visible line of Module07AlWadiya.jsx holds the challenge\'s answer (the situation itself is allowed: module 7 analyses it)', () => {
    visibleLines(module7Src).forEach((line, i) => expect(textViolations(line, `m7:${i + 1}`, { before7: false }), line.trim().slice(0, 100)).toEqual([]));
    expect(textViolations(json(M7_SITUATION), 'm7 situation', { before7: false })).toEqual([]);
  });
  it('module 7 sends nowhere to the textbook and never shows the book\'s « مساعدة »', () => {
    visibleLines(module7Src).forEach((line) => expect(/الكتاب(?!ة)|ص\s*\d|SourceTag|caption|SITUATION\.help|مساعدة/.test(line), line.trim().slice(0, 100)).toBe(false));
  });
});

describe('the synthesis — config, peer sheet, ladder', () => {
  const { mission } = LESSON_CONFIG;
  it('mission: owned keys from the unit\'s lessons (each id exists there), every training uses a key, no checkpoint, two labels, two sittings', () => {
    expect(LESSON_CONFIG.studentView).toBe('mission');
    expect(LESSON_CONFIG.knowledgeMapOpen).toBe(true);
    expect(mission.toolsOwned).toBe(true);
    expect(mission.checkpoints).toEqual([]);
    expect(mission.climaxModule).toBe(8);
    expect(mission.stationLabels).toEqual({ 7: 'وضعية الوحدة', 8: 'التحدّي 🏆' });
    expect(mission.trainings).toEqual([1, 2, 3, 4, 5, 6]);
    expect(mission.hideStars).toBe(true);
    expect(mission.sittings).toBe(2);
    expect(mission.resumeInside).toBe(true);
    expect(mission.opening.cta).toBe('أجرّب');
    expect(mission.durationMin).toBe(LESSON_CONFIG.modules.reduce((a, m) => a + m.estimatedMin, 0));
    const ids = Object.entries(knowledgeOf).filter(([p]) => !p.includes('wadiya-idmajiya')).flatMap(([, m]) => Object.values(m.LESSON_KNOWLEDGE?.modules ?? {}).flat().map((x) => x.id));
    mission.tools.forEach((tl) => { expect(ids, tl.id).toContain(tl.id); expect(tl.label).not.toMatch(/^[A-Za-z]/); });
    mission.trainings.forEach((m) => expect(mission.tools.some((tl) => tl.usedIn.includes(m)), `training ${m}`).toBe(true));
    expect(mission.tools.some((tl) => tl.usedIn.includes(7))).toBe(true);
  });
  it('the opening holds no digit and no signature; no student-visible config line sends to the textbook or says « DA »', () => {
    expect(mission.opening.text).not.toMatch(/\d/);
    expect(textViolations(`${mission.title} ${mission.opening.text}`)).toEqual([]);
    [LESSON_CONFIG.description, ...mission.tools.map((t) => t.label), ...LESSON_CONFIG.modules.filter((m) => m.number < 7).map((m) => `${m.title} ${m.desc}`)]
      .forEach((s) => expect(textViolations(s, 'before7'), s).toEqual([]));
    LESSON_CONFIG.modules.filter((m) => m.number === 7).forEach((m) => expect(textViolations(`${m.title} ${m.desc}`, 'm7', { before7: false })).toEqual([]));
    const visible = [LESSON_CONFIG.description, mission.title, mission.opening.text, ...mission.tools.map((t) => t.label),
      ...LESSON_CONFIG.modules.map((m) => `${m.title} ${m.desc}`), ...LESSON_CONFIG.resources.map((r) => `${r.title} ${r.objective ?? ''}`)];
    visible.forEach((s) => { expect(/الكتاب(?!ة)/.test(s), s).toBe(false); expect(/نشاط\s*\d|تمرين\s*\d|ص\s*\d/.test(s), s).toBe(false); expect(/DA\b/.test(s), s).toBe(false); });
  });
  it('« ورقة مالك »: a wrong PLAN (the path = perimeter × width, the corners forgotten), no number, one right fix, every wrong fix says why', () => {
    expect(PEER_SHEET.lines[PEER_SHEET.errorLine]).toMatch(/محيط الحوض/);
    expect(PEER_SHEET.fixes.filter((x) => x.ok)).toHaveLength(1);
    expect(PEER_SHEET.fixes.find((x) => x.ok).text).toMatch(/ناقص مساحة الحوض/);
    PEER_SHEET.fixes.filter((x) => !x.ok).forEach((x) => expect(x.why).toBeTruthy());
    const words = [PEER_SHEET.task, ...PEER_SHEET.lines, ...PEER_SHEET.fixes.flatMap((x) => [x.text, x.why ?? '']), PEER_SHEET.why].join(' ');
    expect(words).not.toMatch(/\d/);
    expect(textViolations(json(PEER_SHEET), 'peer', { before7: false })).toEqual([]);
  });
  it('the classmate مالك has a first name used on no other peer sheet of the platform', () => {
    const names = Object.values(peerSheets).map((m) => m.PEER_KID?.name).filter(Boolean);
    expect(names.length).toBeGreaterThan(20);
    expect(names.filter((n) => n === PEER_KID.name)).toHaveLength(1);
  });
  it('« أستعدّ » never shows the signatures', () => {
    expect(textViolations(PREP_LADDER.map((x) => `${x.text} ${x.why}`).join(' '), 'prep')).toEqual([]);
  });
});
