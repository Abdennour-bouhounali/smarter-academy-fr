import { describe, it, expect } from 'vitest';
import { PROBLEMS } from './problems.js';
import { textViolations, violations, visibleLines } from './forbidden.js';
import { LESSON_KNOWLEDGE } from '../knowledge.jsx';
import { KNOWLEDGE_GRAPH } from '../knowledgeGraph.js';
import { LESSON_CONFIG } from '../lesson.config.js';
import { M7_ROUNDS, R1, R2, R1_EASY, R2_EASY, FREE, CARD, LAB } from './rounds.js';
import { M7_SITUATION, REMARKS, METHOD_LETTERS } from './textbook.js';
import { PEER_SHEET, PEER_KID } from './peerSheet.js';
import { PREP_LADDER } from './prep.js';
import * as G from '../../../../../../common/manipulations/logic/growthRace.js';
import * as P from '../../../../../../common/manipulations/logic/growthRacePlayer.js';
import { emptyLog, logEvent, roundWon, starsFor, easierProps } from '../../../../../../common/manipulations/rounds/roundsModel.js';
import { UNIT_MISSIONS } from '../../../../../../../pages/unit/unitMissions.js';
import module7Src from '../modules/Module07AlWadiya.jsx?raw';
import module8Src from '../modules/Module08Ahill.jsx?raw';
import textbookSrc from './textbook.js?raw';

const knowledgeOf = import.meta.glob('../../*/knowledge.jsx', { eager: true });
const lessonContent = import.meta.glob(['../../{muadala-ula,jidaa-maadum,mutarajiha-ula,tarrid-mushkila}/content/*.js', '!../../*/content/*.test.js'], { eager: true, query: '?raw', import: 'default' });
const peerSheets = import.meta.glob('../../../../../../**/content/peerSheet.js', { eager: true });

/**
 * La synthèse de l'unité 4 dans le lecteur de mission (2026-11-12, recette PROVISOIRE de la synthèse) — LE BALAYAGE PAR RÔLE, écrit AVANT la
 * conversion : tout ce qu'un écran avant le module 7 ou le défi 🏆 peut montrer, contre la signature du défi (module 8) et la situation de l'unité
 * (module 7) : content/forbidden.js. Il a d'abord ÉCHOUÉ (rapport du constructeur, `synth/rolescan-muadalat-first-fail.log` : l'entraînement 6
 * trouvait x > 8, l'entraînement 3 montrait 600, les cartes de mémoire 560 + 5x et 75x, la carte des معارف et la description toute la وضعية, le
 * module 7 « الكتاب »).
 */
const json = (x) => JSON.stringify(x).replace(/\\\\/g, '\\');
const cardText = (item) => json({ title: item.title, summary: item.summary, memo: item.memo, body: item.body, predictPrompt: item.predictPrompt });
const found = (p) => p.parts.flatMap((part) => part.steps).filter((s) => s.kind === 'numeric').map((s) => s.expected);

describe('the synthesis — role scan of every screen before its time', () => {
  it('the six trainings never show the challenge (module 8) nor the unit situation (module 7)', () => {
    PROBLEMS.forEach((p) => expect(textViolations(json(p), p.id)).toEqual([]));
  });
  it('no training FINDS a number of the challenge (8 → 9, 600, 70, 675, 605)', () => {
    PROBLEMS.forEach((p) => found(p).forEach((v) => expect([8, 9, 600, 70, 675, 605], `${p.id}: ${v}`).not.toContain(v)));
  });
  it('money is « دج », never « DA », and no number carries a thousands space (owner, 2026-11-12) — trainings, memo cards, map, data, module 8', () => {
    const texts = [json(PROBLEMS), json(Object.values(LESSON_KNOWLEDGE.modules).flat().map(cardText)), json(KNOWLEDGE_GRAPH), module8Src, visibleLines(textbookSrc).join('\n'), visibleLines(module7Src).join('\n')];
    texts.forEach((t) => {
      expect(t).not.toMatch(/DA\b/);
      expect(t).not.toMatch(/(?<![0-9.,])[0-9]{1,3} [0-9]{3}(?![0-9])/);
      expect(t).not.toMatch(/دينار|دنانير/);
    });
  });
  it('the memo cards (open from the first screen) never hold the situation nor the challenge\'s answer', () => {
    Object.values(LESSON_KNOWLEDGE.modules).flat().forEach((item) => expect(textViolations(cardText(item), item.id)).toEqual([]));
  });
  it('the knowledge map (open from the first screen) never shows them either', () => {
    KNOWLEDGE_GRAPH.nodes.forEach((node) => expect(textViolations(json(node), node.id)).toEqual([]));
    expect(textViolations(json(METHOD_LETTERS), 'letters')).toEqual([]);
    expect(textViolations(json(REMARKS), 'remarks')).toEqual([]);
  });
  it('the role scan catches what it must (negative controls)', () => {
    ['$70x$', '70 x', '$70 \\times x$', '$560 < 70x$', '$x > 8$', 'x>8', '$8 < x$', '$x \\geq 9$', 'x ≥ 9', '$x = 8$', '9 حصص', '8 حصص', 'تسع حصص', '600', '\\text{600}', '675', '605', '$560 \\div 70$', '$\\dfrac{560}{70}$', '٦٠٠',
      'تسعة حصص', 'ثمانية حصص', 'الحصة التاسعة', 'ستمائة دج', '$9 \\text{ حصص}$', '$x \\geqslant 9$', '$x \\gt 8$', '$8 \\lt x$', '۶۰۰', 'خمسة وسبعون دج', 'المسبح', 'السباحة', '560', '$75x$', '75 دج', '75 دينارًا', '$75 \\times 10$', '$5x + 560$']
      .forEach((s) => expect(textViolations(s).length, s).toBeGreaterThan(0));
    ['$60x$', '$300 + 10x$', '$x > 6$', '$x > 80$', '5600', '$60{,}0$', '1600', '6000', '$x = 7$', '$750$', '75%', 'ممرّ', 'حصّة', '$x > 5$', '$7{,}5$', '$x \\geq 90$', '$45x$']
      .forEach((s) => expect(textViolations(s), s).toEqual([]));
    // module 7 may show the situation, never its solution
    expect(textViolations('$560 + 5x < 75x$', 'm7', { before7: false })).toEqual([]);
    expect(textViolations('75 دج لكل حصّة، أو اشتراك 560 دج و 5 دج لكل حصّة في المسبح البلدي', 'm7', { before7: false })).toEqual([]);
    expect(textViolations('$560 < 70x$', 'm7', { before7: false }).length).toBeGreaterThan(0);
    expect(violations([{ role: 'rate', v: '75' }, { role: 'rate', v: '5' }, { role: 'fixed', v: '560' }, { role: 'saving', v: '70' }, { role: 'solution', v: '8' }, { role: 'first', v: '9' },
      { role: 'meet', v: '600' }, { role: 'total', v: '675' }, { role: 'eq', v: '70x>560' }, { role: 'eq', v: 'x>8' }, { role: 'rate', v: '90' }, { role: 'fixed', v: '700' }])).toHaveLength(12);
    expect(violations([{ role: 'value', v: '75' }, { role: 'total', v: '70' }, { role: 'solution', v: '6' }, { role: 'screen', v: '600' }, { role: 'eq', v: 'x>80' }, { role: 'tile', v: '8' }])).toEqual([]);
  });
});

/* ── les manches du module 7 : chaque écran balayé (recalculé par la logique du labo), chaque manche jouée jusqu'à son but ── */
const ALL = M7_ROUNDS.flatMap((r) => [{ id: r.id, round: r, props: r.props }, ...(r.easier ? [{ id: `${r.id}-easy`, round: r.easier, props: easierProps(r) }] : [])]);
const freeProps = FREE.map((c) => { const [left, right, maxX] = c.split('|'); return { left, right, maxX: Number(maxX), goal: 'greater' }; });

describe('module 7 « وضعية الوحدة » — the rounds', () => {
  it('two required rounds (r1 the inequality and its first session, r2 the saving), their practice rounds RELEASE them, then the free lab', () => {
    expect(M7_ROUNDS.map((r) => r.id)).toEqual(['r1', 'r2', 'free']);
    expect(M7_ROUNDS.filter((r) => r.easier).every((r) => r.easier.releases)).toBe(true);
    expect(M7_ROUNDS.filter((r) => !r.free).every((r) => !r.optional)).toBe(true);
    expect(M7_ROUNDS[0].props).toMatchObject({ type: 'growth-race', left: '60x', right: '300+10x', goal: 'greater', chains: 'pool' });
    expect(M7_ROUNDS[1].props).toMatchObject({ type: 'growth-race', left: '45x', right: '150+15x', goal: 'greater', chains: 'poolSaving' });
  });
  it('each round is two tariffs « ax » against « f + bx », formula 2 better from the first session AFTER the equality', () => {
    [[R1, 6, 7, 360], [R2, 5, 6, 225], [R1_EASY, 3, 4, 90], [R2_EASY, 4, 5, 160]].forEach(([p, n, first, cost]) => {
      const m = G.parseModel(p.left, p.right);
      expect(P.poolOf(m), p.left).not.toBeNull();
      const a = G.answer(m, 'greater');
      expect([G.toNumber(a.sol.x), a.first, a.toInfinity], p.left).toEqual([n, first, true]);
      expect(G.valueText(G.trialAt(m, n).left)).toBe(String(cost));
      expect(G.trialAt(m, n).rel).toBe('=');
    });
  });
  it('r1 builds 300 + 10x < 60x (decoy 300x); r2 ends on the NUMERICAL build 30 × 5 = 150 (decoy 45)', () => {
    expect(P.ineqSpec(G.parseModel(R1.left, R1.right))).toMatchObject({ expected: ['300', '10x', '60x'], decoy: '300x' });
    const sv = P.savingSpec(G.parseModel(R2.left, R2.right));
    expect(sv).toMatchObject({ expected: ['30', '5', '150'], decoy: '45' });
    expect(sv.d * sv.n).toBe(sv.f);
    expect(P.firstSpec(G.parseModel(R1.left, R1.right))).toMatchObject({ n: 6, first: 7 });
  });
  it('every tile set and chip set of every round is made of DISTINCT values (review 2026-11-12)', () => {
    [R1, R2, R1_EASY, R2_EASY, CARD].forEach((p) => {
      const m = G.parseModel(p.left, p.right);
      expect(new Set(P.ineqSpec(m).tiles).size, p.left).toBe(4);
      expect(new Set(P.savingSpec(m).tiles).size, p.left).toBe(4);
      expect(new Set(P.firstSpec(m).options).size, p.left).toBe(3);
    });
  });
  it('every practice round is smaller than its round', () => {
    expect(P.poolOf(G.parseModel(R1_EASY.left, R1_EASY.right)).f).toBeLessThan(P.poolOf(G.parseModel(R1.left, R1.right)).f);
    expect(P.poolOf(G.parseModel(R2_EASY.left, R2_EASY.right)).f).toBeLessThan(P.poolOf(G.parseModel(R2.left, R2.right)).f);
  });
  it('the dry-run: every value any round, practice round or free choice can show is clean (role-paired)', () => {
    ALL.forEach(({ id, props }) => expect(violations(P.shownValues(props), id), id).toEqual([]));
    freeProps.forEach((p) => expect(violations(P.shownValues(p), `free ${p.left}`)).toEqual([]));
    const sv = P.shownValues(M7_ROUNDS[1].props);
    expect(sv.some((x) => x.role === 'saving' && x.v === '30')).toBe(true);
    expect(sv.some((x) => x.role === 'tile' && x.v === '45')).toBe(true);
    M7_ROUNDS.forEach((r) => [r.props, r.easier && easierProps(r)].filter(Boolean).forEach((p) => {
      expect(textViolations(`${r.title} ${p.lead} ${p.mission ?? ''} ${r.easier?.helpLine ?? ''}`, r.id)).toEqual([]);
      expect(p.lead).not.toMatch(/DA\b|الكتاب|دينار/);
    }));
  });
  it('the negative control: the challenge\'s own tariffs and the unit page\'s challenge are caught', () => {
    expect(violations(P.shownValues({ left: '75x', right: '560+5x', maxX: 12, goal: 'greater', chains: 'poolSaving' }), 'climax').length).toBeGreaterThan(5);
    expect(violations(P.shownValues({ left: '90x', right: '700+20x', maxX: 13, goal: 'greater', chains: 'poolSaving' }), 'unit page').length).toBeGreaterThan(3);
  });
  it('the page workspace shows the same sibling tariffs (lab.render.test.jsx)', () => {
    expect(LAB.beginner).toMatchObject({ left: R1.left, right: R1.right });
    expect(LAB.advanced).toMatchObject({ left: R2.left, right: R2.right });
  });
  it('each required round is won by its chains; the practice rounds by their build', () => {
    const [r1, r2] = M7_ROUNDS;
    let log = logEvent(emptyLog(), 'trial', { tk: 'model', ok: true, key: 'a+' });
    log = logEvent(log, 'trial', { tk: 'checkpoint-done', id: 'build' });
    log = logEvent(log, 'trial', { tk: 'discovered' });
    expect(roundWon(r1, log)).toBe(false);
    log = logEvent(log, 'trial', { tk: 'checkpoint-done', id: 'race' });
    expect(roundWon(r1, log)).toBe(true);
    expect(starsFor(r1, log)).toBe(3);
    let l2 = logEvent(emptyLog(), 'trial', { tk: 'model', ok: true, key: 'b+' });
    l2 = logEvent(l2, 'trial', { tk: 'discovered' });
    l2 = logEvent(l2, 'trial', { tk: 'checkpoint-done', id: 'race' });
    expect(roundWon(r2, l2)).toBe(true);
    const easy = logEvent(logEvent(emptyLog(), 'trial', { tk: 'model', ok: true }), 'trial', { tk: 'checkpoint-done', id: 'race' });
    expect(roundWon(r1.easier, easy)).toBe(true);
    expect(roundWon(r2.easier, easy)).toBe(true);
  });
});

/* ── la règle des collisions : aucun tarif du module 7 n'est un tarif écrit dans une leçon de l'unité, ni le défi de la page d'unité ── */
describe('module 7 — the collision rule against the unit\'s lessons and the unit page', () => {
  const pairs = [R1, R2, R1_EASY, R2_EASY, CARD].map((p) => P.poolOf(G.parseModel(p.left, p.right)));
  it('the lessons\' content files are read', () => {
    expect(Object.keys(lessonContent).length).toBeGreaterThanOrEqual(8);
  });
  it('no lesson of the unit writes one of these tariffs (« ax » with « f + bx »)', () => {
    Object.entries(lessonContent).forEach(([path, src]) => pairs.forEach(({ a, b, f }) => {
      const both = new RegExp(`(?<![0-9])${a}\\s*x`).test(src) && new RegExp(`(?<![0-9])${f}\\s*\\+\\s*${b}\\s*x`).test(src);
      expect(both, `${path}: ${a}x / ${f} + ${b}x`).toBe(false);
    }));
  });
  it('the unit page\'s challenge (another club) stays different from every round', () => {
    const page = json(UNIT_MISSIONS['muadalat-mutarajihat']);
    expect(page).toMatch(/90/);
    pairs.forEach(({ a, b, f }) => expect(page.includes(`${f}`) && page.includes(`${a}`) && page.includes(`${b}`), `${a}/${f}+${b}`).toBe(false));
  });
});

describe('module 7 — its own screens never show the challenge SOLVED', () => {
  it('no visible line of Module07AlWadiya.jsx holds the challenge\'s answer (the situation itself is allowed: module 7 analyses it)', () => {
    visibleLines(module7Src).forEach((line, i) => expect(textViolations(line, `m7:${i + 1}`, { before7: false }), line.trim().slice(0, 100)).toEqual([]));
    expect(textViolations(json(M7_SITUATION), 'm7 situation', { before7: false })).toEqual([]);
  });
  it('module 7 sends nowhere to the textbook', () => {
    visibleLines(module7Src).forEach((line) => expect(/الكتاب(?!ة)|ص\s*\d|SourceTag|SITUATION\.(source|figure)/.test(line), line.trim().slice(0, 100)).toBe(false));
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
  it('« ورقة زكريا »: a wrong PLAN (the bound taken for the answer), no number, one right fix, every wrong fix says why', () => {
    expect(PEER_SHEET.lines[PEER_SHEET.errorLine]).toMatch(/يحدّ الحلول/);
    expect(PEER_SHEET.fixes.filter((x) => x.ok)).toHaveLength(1);
    expect(PEER_SHEET.fixes.find((x) => x.ok).text).toMatch(/قطعية/);
    PEER_SHEET.fixes.filter((x) => !x.ok).forEach((x) => expect(x.why).toBeTruthy());
    const words = [PEER_SHEET.task, ...PEER_SHEET.lines, ...PEER_SHEET.fixes.flatMap((x) => [x.text, x.why ?? '']), PEER_SHEET.why].join(' ');
    expect(words).not.toMatch(/\d/);
    expect(textViolations(json(PEER_SHEET), 'peer', { before7: false })).toEqual([]);
  });
  it('the classmate زكريا has a first name used on no other peer sheet of the platform', () => {
    const names = Object.values(peerSheets).map((m) => m.PEER_KID?.name).filter(Boolean);
    expect(names.length).toBeGreaterThan(20);
    expect(names.filter((n) => n === PEER_KID.name)).toHaveLength(1);
  });
  it('« أستعدّ » never shows the signatures', () => {
    expect(textViolations(PREP_LADDER.map((x) => `${x.text} ${x.why}`).join(' '), 'prep')).toEqual([]);
  });
});
