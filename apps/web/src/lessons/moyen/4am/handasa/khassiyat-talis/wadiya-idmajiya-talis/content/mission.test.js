import { describe, it, expect } from 'vitest';
import { PROBLEMS } from './problems.js';
import { textViolations, violations } from './forbidden.js';
import { LESSON_KNOWLEDGE } from '../knowledge.jsx';
import { KNOWLEDGE_GRAPH } from '../knowledgeGraph.js';
import { LESSON_CONFIG } from '../lesson.config.js';
import { M7_ROUNDS, R2_REQUIRED, r1EasyH } from './rounds.js';
import { PEER_SHEET } from './peerSheet.js';
import { PREP_LADDER } from './prep.js';
import * as CC from '../../../../../../common/manipulations/logic/coneCylinder.js';
import * as SM from '../../../../../../common/manipulations/logic/shadowMeet.js';
import { emptyLog, logEvent, roundWon, starsFor, easierProps } from '../../../../../../common/manipulations/rounds/roundsModel.js';

const knowledgeOf = import.meta.glob('../../*/knowledge.jsx', { eager: true });

/**
 * La synthèse de l'unité 9 dans le lecteur de mission (pilote du recette « synthèse », 2026-11-10) — LE BALAYAGE PAR RÔLE, écrit AVANT la
 * conversion (décisions S, second conseil) : tout ce qu'un écran avant le module 7 ou le défi 🏆 peut montrer — les six وضعيات تدريبية, les cartes
 * de mémoire et la carte des معارف (ouvertes dès le premier écran), l'ouverture, « أستعدّ », la ورقة زميل et les manches du labo — contre la
 * signature du défi (module 8, jamais retouché) et les réponses propres de la وضعية de l'unité (module 7) : content/forbidden.js.
 */
const json = (x) => JSON.stringify(x).replace(/\\\\/g, '\\');
/** Le texte d'une carte de mémoire (ce que la fiche, le quiz et le résumé écrivent). */
const cardText = (item) => json({ title: item.title, summary: item.summary, memo: item.memo, body: item.body });

describe('the synthesis — role scan of every screen before its time', () => {
  it('the six trainings never show the challenge (module 8) nor the unit situation\'s answers (module 7)', () => {
    PROBLEMS.forEach((p) => expect(textViolations(json(p), p.id)).toEqual([]));
  });

  it('the memo cards (open from the first screen) never hold module 7\'s own problem nor its answers', () => {
    const items = Object.values(LESSON_KNOWLEDGE.modules).flat();
    items.forEach((item) => expect(textViolations(cardText(item), item.id)).toEqual([]));
    // the scan really reads the card bodies (rendered on the open map), not only the memo fields
    expect(cardText(items.find((x) => x.id === 'maqta-mihwari-talis'))).toContain('OSK');
  });

  it('the knowledge map (open from the first screen) never shows them either', () => {
    KNOWLEDGE_GRAPH.nodes.forEach((node) => expect(textViolations(json(node), node.id)).toEqual([]));
  });

  it('the role scan catches what it must (negative controls)', () => {
    ['عصا شاقولية طولها $1{,}5\\,\\mathrm{m}$', '$OB = 2\\,\\mathrm{m}$', '$\\dfrac{r}{6} = \\dfrac{18 - h}{18}$', '$r = 4{,}5$', '$24r = 108$',
      '$7{,}25$ m', '$64\\pi$', '$18r = 72$', '$10{,}5$', '$\\frac{18-r}{18}$', '$11{,}6$ m']
      .forEach((s) => expect(textViolations(s).length, s).toBeGreaterThan(0));
    ['$AB = 4{,}5\\,\\mathrm{m}$', '$1272\\,\\mathrm{cm}^3$', '$\\dfrac{r}{12} = \\dfrac{20 - h}{20}$', '$OB = 1{,}8$', '$12{,}5$', '$2{,}55$', '$r = 9$']
      .forEach((s) => expect(textViolations(s), s).toEqual([]));
    expect(violations([{ role: 'ratio', v: '8/12' }, { role: 'cone-H', v: '18' }, { role: 'square', v: '5' }, { role: 'OT', v: '8' }])).toHaveLength(4);
    expect(violations([{ role: 'ratio', v: '9/15' }, { role: 'cone-R', v: '6' }, { role: 'r', v: '4' }, { role: 'OT', v: '15' }])).toEqual([]);
  });
});

/* ── les manches du module 7 : chaque écran balayé, chaque manche jouée jusqu'à son but ── */
const propsOf = (r, log = emptyLog()) => (typeof r.props === 'function' ? r.props(log) : r.props);
function shown(props) {
  if (props.type === 'shadow-meet') return SM.shownValues(props);
  const out = [...CC.shownValuesPlayer(props)];
  [props.lockH, ...(props.lockR ?? [])].filter((v) => v != null).forEach((v) => out.push({ role: props.lockH === v ? 'h' : 'r', v: String(v) }));
  return out;
}
const played = (round, events) => events.reduce((log, [kind, ev]) => logEvent(log, kind, ev), emptyLog());
/** Appuyer sur une suite de cylindres (crans h, r) : les verdicts que la manche reçoit. */
const presses = (props, pairs) => {
  let lab = CC.initPlayer(props);
  const out = [];
  pairs.forEach(([h, r]) => { lab = CC.press(CC.moveTo(lab, { hIdx: h, rIdx: r })); const v = CC.verdictOfPress(lab); if (v) out.push(['verdict', v]); });
  return { lab, events: out };
};

describe('module 7 « وضعية الوحدة » — the rounds', () => {
  it('the required path: zill → r1 → r2, then ⭐ (optional) and the free lab', () => {
    expect(M7_ROUNDS.map((r) => r.id)).toEqual(['zill', 'r1', 'r2', 'star', 'free']);
    expect(M7_ROUNDS.find((r) => r.id === 'star').optional).toBe(true);
    expect(M7_ROUNDS.filter((r) => r.easier).every((r) => r.easier.releases)).toBe(true);   // an easier win releases the steps
  });

  it('the dry-run: every value any round, practice round, prediction or free cone can show is clean (role-paired), and no volume', () => {
    const all = [];
    M7_ROUNDS.forEach((r) => {
      const logs = [emptyLog(), logEvent(emptyLog(), 'verdict', { groups: 4, exact: true })];
      all.push(...shown(propsOf(r)));
      if (r.easier) logs.forEach((log) => all.push(...shown(easierProps(r, log))));
    });
    expect(all.length).toBeGreaterThan(100);
    expect(violations(all, 'm7 rounds')).toEqual([]);
    M7_ROUNDS.forEach((r) => [propsOf(r), r.easier && easierProps(r)].filter(Boolean).forEach((p) => {
      expect(textViolations(`${r.title} ${p.lead} ${p.mission} ${r.easier?.helpLine ?? ''}`, r.id)).toEqual([]);
      expect(`${p.lead} ${p.mission}`).not.toMatch(/حجم|\\pi|π/);
    }));
  });

  it('zill: the meet alone wins it (a free exact verdict), then « why »', () => {
    const z = M7_ROUNDS[0];
    let lab = SM.init(propsOf(z));
    lab = SM.settle(SM.moveStick(lab, SM.cur(lab).meetX));
    const log = played(z, [['verdict', SM.verdictOf(lab)], ['trial', { tk: 'checkpoint-done', id: 'why' }]]);
    expect(roundWon(z, log)).toBe(true);
    expect(starsFor(z, log)).toBe(3);
    expect(SM.meetOf(SM.cur(lab))).toMatchObject({ BA: 1000, OA: 1160 });        // the figure's givens: AB = 10 m, OA = 11,6 m
  });

  it('r1 by hand to ★★★: a refusal (free), two cylinders that touch, the sec question; its practice round locks h on a notch not yet seen', () => {
    const r1 = M7_ROUNDS[1];
    const { lab, events } = presses(propsOf(r1), [[2, 4], [2, 3], [3, 2]]);
    expect(CC.discoveredPlayer(lab)).toBe(true);
    const log = played(r1, [...events, ['trial', { tk: 'discovered' }], ['trial', { tk: 'checkpoint-done', id: 'sec' }]]);
    expect(roundWon(r1, log)).toBe(true);
    expect(starsFor(r1, log)).toBe(3);
    expect(r1EasyH(emptyLog())).toBe(20);
    expect(r1EasyH(log)).toBe(20);                                                  // notches 2 and 3 seen: 20 still free
    expect(r1EasyH(played(r1, [['verdict', { groups: 4, exact: true }]]))).toBe(15);
    // the practice round never STARTS on its answer, whatever the student already saw
    [emptyLog(), log, played(r1, [['verdict', { groups: 4, exact: true }]])].forEach((lg) => expect(CC.verdictKind(CC.initPlayer(easierProps(r1, lg)))).not.toBe('inscribed'));
    expect(CC.verdictKind(CC.initPlayer(easierProps(M7_ROUNDS[2])))).not.toBe('inscribed');
    const easy = easierProps(r1, log);
    const e = presses(easy, [[CC.initPlayer(easy).hIdx, 1]]);
    expect(roundWon(r1.easier, played(r1.easier, [...e.events, ['trial', { tk: 'checkpoint-done', id: 'sec' }]]))).toBe(true);
  });

  it('r2 to ★★★: both predictions right, the cylinders h = 5, 10, 20, the build; its practice round finds r = 4 at h = 15', () => {
    const r2 = M7_ROUNDS[2];
    const p = propsOf(r2);
    const fresh = CC.initPlayer(p);
    expect(p.predict.map((key) => CC.predictTruthPlayer(fresh, key))).toEqual(['no', 'more']);
    const pairs = R2_REQUIRED.map((i) => [i, Number(CC.touchIndex(fresh, i))]);
    expect(pairs).toEqual([[1, 4], [2, 3], [4, 1]]);
    const { events } = presses(p, pairs);
    const log = played(r2, [['trial', { tk: 'predict', ok: true }], ['trial', { tk: 'predict', ok: true }], ...events, ['trial', { tk: 'checkpoint-done', id: 'r2' }]]);
    expect(roundWon(r2, log)).toBe(true);
    expect(starsFor(r2, log)).toBe(3);
    const easy = easierProps(r2);
    const e = presses(easy, [[CC.initPlayer(easy).hIdx, 2]]);
    expect(e.events[0][1]).toMatchObject({ exact: true });
  });

  it('⭐ the reverse task: r = 10 → h = 6, then r = 4 → h = 15, in two presses', () => {
    const star = M7_ROUNDS[3];
    const { events } = presses(propsOf(star), [[2, 0], [5, 0]]);
    const log = played(star, events);
    expect(roundWon(star, log)).toBe(true);
    expect(starsFor(star, log)).toBe(3);
  });
});

describe('the synthesis — config, peer sheet, ladder', () => {
  const { mission } = LESSON_CONFIG;
  it('mission: owned keys from the unit\'s three lessons (each id exists there), every training uses a key, no checkpoint, two labels, two sittings', () => {
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
    const ids = Object.entries(knowledgeOf).filter(([p]) => !p.includes('wadiya-idmajiya')).flatMap(([, m]) => Object.values(m.LESSON_KNOWLEDGE.modules).flat().map((x) => x.id));
    mission.tools.forEach((tl) => { expect(ids, tl.id).toContain(tl.id); expect(tl.label).not.toMatch(/^[A-Za-z]/); });
    expect(mission.tools).toHaveLength(5);
    mission.trainings.forEach((m) => expect(mission.tools.some((tl) => tl.usedIn.includes(m)), `training ${m}`).toBe(true));
    expect(mission.tools.some((tl) => tl.usedIn.includes(7))).toBe(true);
  });
  it('the opening holds no digit and no signature; no student-visible config line sends to the textbook', () => {
    expect(mission.opening.text).not.toMatch(/\d/);
    expect(textViolations(`${mission.title} ${mission.opening.text}`)).toEqual([]);
    const visible = [LESSON_CONFIG.description, mission.title, mission.opening.text, ...mission.tools.map((t) => t.label),
      ...LESSON_CONFIG.modules.map((m) => `${m.title} ${m.desc}`), ...LESSON_CONFIG.resources.map((r) => `${r.title} ${r.objective ?? ''} ${r.autonomy ?? ''}`)];
    visible.forEach((s) => { expect(/الكتاب(?!ة)/.test(s), s).toBe(false); expect(/نشاط\s*\d|تمرين\s*\d|ص\s*\d/.test(s), s).toBe(false); });
  });
  it('« ورقة هاجر »: a wrong PLAN (Thales without the parallel), no number, one right fix, every wrong fix says why', () => {
    expect(PEER_SHEET.lines[PEER_SHEET.errorLine]).toMatch(/استقامة/);
    expect(PEER_SHEET.lines[PEER_SHEET.errorLine]).not.toMatch(/متوازي|عمودي/);
    expect(PEER_SHEET.fixes.filter((x) => x.ok)).toHaveLength(1);
    expect(PEER_SHEET.fixes.find((x) => x.ok).text).toMatch(/متوازيان/);
    PEER_SHEET.fixes.filter((x) => !x.ok).forEach((x) => expect(x.why).toBeTruthy());
    const words = [PEER_SHEET.task, ...PEER_SHEET.lines, ...PEER_SHEET.fixes.flatMap((x) => [x.text, x.why ?? '']), PEER_SHEET.why].join(' ');
    expect(words.replace('r^2', 'r²')).not.toMatch(/\d/);
    expect(textViolations(json(PEER_SHEET), 'peer')).toEqual([]);
  });
  it('« أستعدّ » never shows the signatures', () => {
    expect(textViolations(PREP_LADDER.map((x) => `${x.text} ${x.why}`).join(' '), 'prep')).toEqual([]);
  });
});
