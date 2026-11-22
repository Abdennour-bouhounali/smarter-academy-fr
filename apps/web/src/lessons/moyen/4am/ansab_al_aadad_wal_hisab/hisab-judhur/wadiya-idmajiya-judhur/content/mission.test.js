import { describe, it, expect } from 'vitest';
import { PROBLEMS } from './problems.js';
import { textViolations, violations, visibleLines } from './forbidden.js';
import { LESSON_KNOWLEDGE } from '../knowledge.jsx';
import { KNOWLEDGE_GRAPH } from '../knowledgeGraph.js';
import { LESSON_CONFIG } from '../lesson.config.js';
import { M7_ROUNDS, BED, FOLD_EASY, TILE_EASY, FREE_TILES } from './rounds.js';
import { PEER_SHEET, PEER_KID } from './peerSheet.js';
import { PREP_LADDER } from './prep.js';
import * as fold from '../../../../../../common/manipulations/logic/squareFold.js';
import * as tiling from '../../../../../../common/manipulations/logic/squareTiling.js';
import { eqBuildOf, chainOfPlayer } from '../../../../../../common/manipulations/roots/SquareFold.jsx';
import { emptyLog, logEvent, roundWon, starsFor, easierProps } from '../../../../../../common/manipulations/rounds/roundsModel.js';
import module7Src from '../modules/Module07AlWadiya.jsx?raw';
import module8Src from '../modules/Module08Ahill.jsx?raw';
import textbookSrc from './textbook.js?raw';

// a v2 lesson's knowledge is its world's (LESSON_V2.md §2): its root knowledge.jsx is gone
const knowledgeOf = import.meta.glob(['../../*/knowledge.jsx', '../../*/world/knowledge.js'], { eager: true });
const labContent = import.meta.glob(['../../*/content/{folds,tilings,squares,rulers}.js'], { eager: true });
// a v2 lesson's rounds are its world's: the courts (areas) of « قصر الساحات » (world/story.js › COURTS, YARD)
const worldStories = import.meta.glob('../../*/world/story.js', { eager: true });
const peerSheets = import.meta.glob('../../../../../../**/content/peerSheet.js', { eager: true });

/**
 * La synthèse de l'unité 2 dans le lecteur de mission (2026-11-12, recette PROVISOIRE de la synthèse) — LE BALAYAGE PAR RÔLE, écrit AVANT la
 * conversion : tout ce qu'un écran avant le module 7 ou le défi 🏆 peut montrer, contre la signature du défi (module 8) et la situation de l'unité
 * (module 7) : content/forbidden.js. Il a d'abord ÉCHOUÉ (rapport du constructeur).
 */
const json = (x) => JSON.stringify(x).replace(/\\\\/g, '\\');
const cardText = (item) => json({ title: item.title, summary: item.summary, memo: item.memo, body: item.body });
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
  it('no training FINDS a number of the challenge (346, 693, 692, 3,46, 6,93, ℓ² = 12)', () => {
    PROBLEMS.forEach((p) => found(p).forEach((v) => expect([346, 693, 692, 3.46, 6.93, 3.464, 6.928], `${p.id}: ${v}`).not.toContain(v)));
  });
  it('the memo cards (open from the first screen) never hold the situation nor the challenge\'s answer', () => {
    Object.values(LESSON_KNOWLEDGE.modules).flat().forEach((item) => expect(textViolations(cardText(item), item.id)).toEqual([]));
  });
  it('the knowledge map (open from the first screen) never shows them either', () => {
    KNOWLEDGE_GRAPH.nodes.forEach((node) => expect(textViolations(json(node), node.id)).toEqual([]));
  });
  it('the role scan catches what it must (negative controls)', () => {
    ['$\\sqrt{12}$', '√12', '$2\\sqrt{3}$', '2√3', '$4\\sqrt{3}$', '$\\sqrt{48}$', '$\\ell^2 = 12$', 'x² = 12', '3,46', '$3{,}4641$', '6,93', '$6{,}928$', '346 cm', '\\text{693}', '692',
      'الزربية', 'زرابي', 'وادي سوف', '12000 دج', '$24m^2$', '24 م²', '$2\\ell^2 = 24$',
      '$2\\sqrt3$', '$2 \\times \\sqrt{3}$', '$4\\cdot\\sqrt 3$', '2 × √3', '$\\sqrt{ 12 }$', '3.46', '6.93', '$24\\,m^2$', '$24 \\text{m}^2$', 'مساحتها 24']
      .forEach((s) => expect(textViolations(s).length, s).toBeGreaterThan(0));
    ['$12\\sqrt{3}$', '$\\sqrt{120}$', '$24\\sqrt{5}$', '$9\\sqrt{3}$', '$x^2 = 120$', '1346', '$13{,}46$', '2026', 'مساحة المفرش 12', '$\\sqrt{3} \\approx 1{,}732$', '$x^2 = 40$']
      .forEach((s) => expect(textViolations(s), s).toEqual([]));
    // module 7 may show the situation, never its solution
    expect(textViolations('$2\\ell^2 = 24$', 'm7', { before7: false })).toEqual([]);
    expect(textViolations('زربية مساحتها $24m^2$', 'm7', { before7: false })).toEqual([]);
    expect(textViolations('$\\ell = 2\\sqrt{3}$', 'm7', { before7: false }).length).toBeGreaterThan(0);
    expect(violations([{ role: 'form', v: '2√3' }, { role: 'area', v: '3' }, { role: 'card', v: '12' }, { role: 'root', v: '√6' }, { role: 'k', v: '24' }, { role: 'near', v: '3,4641' }, { role: 'near', v: '6,928' }])).toHaveLength(7);
    expect(violations([{ role: 'form', v: '2√10' }, { role: 'area', v: '10' }, { role: 'card', v: '40' }, { role: 'k', v: '3' }, { role: 'kk', v: '36' }])).toEqual([]);
  });
});

/* ── les manches du module 7 : chaque écran balayé (recalculé par la logique des labos), chaque manche jouée jusqu'à son but ── */
/** Ce qu'un écran de la DROITE QUI SE PLIE peut montrer : les cartes, leurs solutions, la construction et sa tuile de trop, les prédictions. */
function shownFold(p) {
  const lab = fold.init({ targets: p.targets, scale: p.scale, radius: p.radius, exactOnly: true });
  const out = [];
  lab.targets.forEach((tg, i) => {
    out.push({ role: 'card', v: fold.targetText(tg.a) }, { role: 'solution', v: fold.solutionText(tg, 1) }, { role: 'solution', v: fold.solutionText(tg, -1) });
    const x = eqBuildOf(lab, i);
    out.push({ role: 'tile', v: x.pos }, { role: 'tile', v: x.neg }, { role: 'card', v: x.a }, { role: 'near', v: x.decoy });
  });
  ['0', '1', '2'].forEach((v) => out.push({ role: 'k', v }));
  return out;
}
const shownTiles = (p) => tiling.simplestShown(p.n, { chains: p.chains, predictKs: p.predictKs ?? [], predictAlso: p.predictAlso ?? [], avoid: p.avoid ?? [] });
const shownOf = (p) => (p.type === 'square-fold' ? shownFold(p) : shownTiles(p));
const ALL = M7_ROUNDS.flatMap((r) => [{ id: r.id, round: r, props: r.props }, ...(r.easier ? [{ id: `${r.id}-easy`, round: r.easier, props: easierProps(r) }] : [])]);

describe('module 7 « وضعية الوحدة » — the rounds', () => {
  it('two required rounds (r1 the fold by hand, r2 the tiling with predictions), their practice rounds RELEASE them, then the free lab; no ⭐', () => {
    expect(M7_ROUNDS.map((r) => r.id)).toEqual(['r1', 'r2', 'free']);
    expect(M7_ROUNDS.filter((r) => r.easier).every((r) => r.easier.releases)).toBe(true);
    expect(M7_ROUNDS.filter((r) => !r.free).every((r) => !r.optional)).toBe(true);
    expect(M7_ROUNDS[0].props).toMatchObject({ type: 'square-fold', targets: [BED.a], chains: 'build', predict: true });
    expect(M7_ROUNDS[1].props).toMatchObject({ type: 'square-tiling', n: BED.a, mode: 'simplest', chains: 'fullS', predict: true });
  });
  it('the sibling, recomputed: 2x² = 80 → x² = 40 → x = √40 = 2√10; the early-rounding trap is the 🏆\'s (2 × 632 ≠ 1265)', () => {
    expect(BED.area).toBe(2 * BED.a);
    expect(tiling.kmax(tiling.init({ n: BED.a, mode: 'simplest' }))).toBe(2);
    expect(tiling.tiling(BED.a, 2)).toMatchObject({ valid: true, b: 10 });
    const w = Math.sqrt(BED.a);
    expect(Math.round(w * 100)).toBe(632);
    expect(Math.round(2 * w * 100)).toBe(1265);
    expect(2 * Math.round(w * 100)).not.toBe(Math.round(2 * w * 100));
  });
  it('r1: √40 falls on no graduation (the exact mark is pinned), the chain is the build, its decoy the nearest tick 13/2 (6,5)', () => {
    const p = M7_ROUNDS[0].props;
    let lab = fold.init({ targets: p.targets, scale: p.scale, radius: p.radius, exactOnly: true });
    expect(fold.landsOnTick(fold.current(lab), p.scale)).toBe(false);
    expect(fold.solutionCount(fold.current(lab).r)).toBe(2);
    expect(eqBuildOf(lab, 0)).toMatchObject({ a: '40', pos: '√40', neg: '−√40', decoy: '13/2' });
    lab = fold.move(lab, 13); lab = fold.pin(lab);
    expect(lab.last.kind).toBe('nearTick');
    lab = fold.pinExact(lab, 1);
    lab = fold.move(lab, -13); lab = fold.pin(lab); lab = fold.pinExact(lab, -1);
    expect(fold.cardSolved(lab, 0)).toBe(true);
    expect(chainOfPlayer(lab, 'build', [0])).toEqual(['eqBuild']);
    // the practice card: √14 on no unit graduation
    expect(fold.landsOnTick({ r: fold.toRational(FOLD_EASY[0]) }, 1)).toBe(false);
  });
  it('r2 ends on the NUMERICAL build √40 = 2 × √10; the predictions: smallest among [4, 2, 3] is 2, k = 3 is refused', () => {
    const s = tiling.init({ n: BED.a, mode: 'simplest' });
    const x = tiling.simplestBuildOf(s);
    expect(x.km).toBe(2);
    expect(x.m).toBe(10);
    expect(tiling.tilesWhole(BED.a, 3)).toBe(false);
    expect(tiling.tilesWhole(BED.a, 4)).toBe(false);
    expect(tiling.tilesWhole(TILE_EASY, 2)).toBe(true);
    FREE_TILES.forEach((n) => expect(tiling.validBig(tiling.init({ n, mode: 'simplest' })).length, n).toBeGreaterThan(0));
  });
  it('every practice round is smaller than its round', () => {
    expect(FOLD_EASY[0]).toBeLessThan(BED.a);
    expect(TILE_EASY).toBeLessThan(BED.a);
  });
  it('the dry-run: every value any round, practice round or free choice can show is clean (role-paired)', () => {
    ALL.forEach(({ id, props }) => expect(violations(shownOf(props), id), id).toEqual([]));
    FREE_TILES.forEach((n) => expect(violations(tiling.simplestShown(n), `free ${n}`)).toEqual([]));
    M7_ROUNDS.forEach((r) => [r.props, r.easier && easierProps(r)].filter(Boolean).forEach((p) => {
      expect(textViolations(`${r.title} ${p.lead} ${p.mission ?? ''} ${r.easier?.helpLine ?? ''}`, r.id)).toEqual([]);
      expect(p.lead).not.toMatch(/DA\b|الكتاب/);
    }));
  });
  it('each required round is won by its chain; the practice rounds by their cards / discovery', () => {
    const [r1, r2] = M7_ROUNDS;
    let log = logEvent(emptyLog(), 'trial', { tk: 'predict', ok: true });
    log = logEvent(log, 'verdict', { groups: 0, exact: true });
    expect(roundWon(r1, log)).toBe(false);
    log = logEvent(log, 'trial', { tk: 'checkpoint-done', id: 'c0' });
    expect(roundWon(r1, log)).toBe(true);
    expect(starsFor(r1, log)).toBe(3);
    let l2 = logEvent(emptyLog(), 'trial', { tk: 'discovered' });
    expect(roundWon(r2, l2)).toBe(false);
    l2 = logEvent(l2, 'trial', { tk: 'checkpoint-done', id: 'rule' });
    expect(roundWon(r2, l2)).toBe(true);
    expect(roundWon(r1.easier, logEvent(emptyLog(), 'verdict', { groups: 0, exact: true }))).toBe(true);
    expect(roundWon(r2.easier, logEvent(emptyLog(), 'trial', { tk: 'discovered' }))).toBe(true);
  });
});

/** Tous les nombres que les manches des leçons de l'unité exportent (cartes, aires, défis, libres). */
const lessonNumbers = new Set();
// les réglages d'une manche (étoiles, but, droite, prédictions) ne sont pas des nombres montrés comme cartes
const SETTINGS = new Set(['stars', 'goal', 'radius', 'scale', 'predictCards', 'predictKs', 'predictAlso', 'helpAfterRefusals', 'table']);
const walk = (x, depth = 0) => {
  if (typeof x === 'number') { lessonNumbers.add(x); return; }
  if (!x || typeof x !== 'object' || depth > 6) return;
  Object.entries(x).forEach(([k, v]) => { if (!SETTINGS.has(k)) walk(v, depth + 1); });
};
Object.values(labContent).forEach((m) => walk(m));
// a court is written as the student reads it (« 2,56 »): the decimal comma is read as a point
Object.values(worldStories).forEach((m) => [...Object.values(m.COURTS ?? {}), ...(m.YARD ?? [])].forEach((v) => lessonNumbers.add(Number(String(v).replace(',', '.')))));

describe('module 7 — the collision rule against the unit\'s lessons', () => {
  it('the lessons\' round numbers are read', () => {
    // lessons 3 and 4 (folds, tilings) and the worlds of lessons 1 and 2 (since 2026-11-21: lesson 2's rulers left with its pages)
    expect(Object.keys(labContent).length + Object.keys(worldStories).length).toBeGreaterThanOrEqual(4);
    // 196: the last court of lesson 1's world; 10.24 (« 10,24 »), a court of lesson 2's — proves the worlds' numbers are read
    [27, 32, 75, 98, 2.25, 196, 10.24].forEach((n) => expect(lessonNumbers.has(n), n).toBe(true));
  });
  it('no card, area, practice or free choice of module 7 is a number of a lesson\'s rounds', () => {
    [BED.a, ...FOLD_EASY, TILE_EASY, ...FREE_TILES].forEach((n) => expect(lessonNumbers.has(n), String(n)).toBe(false));
  });
});

describe('module 7 — its own screens never show the challenge SOLVED', () => {
  it('no visible line of Module07AlWadiya.jsx holds the challenge\'s answer (the situation itself is allowed: module 7 analyses it)', () => {
    visibleLines(module7Src).forEach((line, i) => expect(textViolations(line, `m7:${i + 1}`, { before7: false }), line.trim().slice(0, 100)).toEqual([]));
  });
  it('module 7 sends nowhere to the textbook', () => {
    visibleLines(module7Src).forEach((line) => expect(/الكتاب(?!ة)|ص\s*\d|SourceTag|caption/.test(line), line.trim().slice(0, 100)).toBe(false));
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
  it('« ورقة رقيّة »: a wrong PLAN (double the ROUNDED width), no number, one right fix, every wrong fix says why', () => {
    expect(PEER_SHEET.lines[PEER_SHEET.errorLine]).toMatch(/أضاعف هذه القيمة المدوّرة/);
    expect(PEER_SHEET.fixes.filter((x) => x.ok)).toHaveLength(1);
    expect(PEER_SHEET.fixes.find((x) => x.ok).text).toMatch(/في النهاية/);
    PEER_SHEET.fixes.filter((x) => !x.ok).forEach((x) => expect(x.why).toBeTruthy());
    const words = [PEER_SHEET.task, ...PEER_SHEET.lines, ...PEER_SHEET.fixes.flatMap((x) => [x.text, x.why ?? '']), PEER_SHEET.why].join(' ');
    expect(words).not.toMatch(/\d/);
    expect(textViolations(json(PEER_SHEET), 'peer', { before7: false })).toEqual([]);
  });
  it('the classmate رقيّة is in hijab and her first name is on no other peer sheet of the platform', () => {
    expect(PEER_KID.figure.hairStyle).toBe('hijab');
    const names = Object.values(peerSheets).map((m) => m.PEER_KID?.name).filter(Boolean);
    expect(names.length).toBeGreaterThan(20);
    expect(names.filter((n) => n === PEER_KID.name)).toHaveLength(1);
  });
  it('« أستعدّ » never shows the signatures', () => {
    expect(textViolations(PREP_LADDER.map((x) => `${x.text} ${x.why}`).join(' '), 'prep')).toEqual([]);
  });
});
