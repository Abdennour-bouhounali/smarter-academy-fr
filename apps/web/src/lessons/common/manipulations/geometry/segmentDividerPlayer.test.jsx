import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import strings from '../../../../i18n/locales/ar/lesson.manipulation.json';
import SegmentDivider, { CHAINS_PLAYER, QUESTIONS, chainsOfPlayer, buildRank, sub } from './SegmentDivider';
import { InMissionPlayerContext } from '../../mission/missionPlayerContext';
import * as L from '../logic/segmentDivider';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * Le traitement v2 du labo `segment-divider` dans le lecteur de mission (rollout 2026-11-10, unité 9 leçon 3 ; conseil du 2026-11-10, L3.1–L3.7).
 * Chaque question dit la MÊME vérité que la logique (thales), aucune clé brute ni `{{` à l'écran, les réponses changent de place ; la page
 * (segmentDivider.render.test.jsx) reste inchangée — ici : ce que seul le lecteur montre.
 */
const t = (key, o) => i18n.t(`lesson:${key}`, o);
const k = (key, o) => t(`manipulation.segmentDivider.${key}`, o);
const rawKey = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.fields?.map((f, i) => <span key={i}>{f.label}{f.options.map((o) => (f.render ? f.render(o) : o))}</span>)}{q.slots}{q.ops}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}</div>);
const inPlayer = (el) => renderToString(<InMissionPlayerContext.Provider value>{el}</InMissionPlayerContext.Provider>);
const repeat = (s, f, n) => { let x = s; for (let i = 0; i < n; i += 1) x = f(x); return x; };
/** Une construction entière : n marques, la marque `joined` reliée, toutes les parallèles. */
const construct = (s, n, joined = n) => {
  let x = L.join(repeat(s, (y) => L.carry(y), n), joined - 1);
  for (let i = 0; i < x.joined; i += 1) x = L.draw(L.setSlide(x, L.rayMarks(x)[i].pos));
  return x;
};
const grad = (s, rail, n) => repeat(s, (y) => L.carry(y, rail), n);
const ruler = (s, a, b) => L.commitRuler(L.setEnd(L.setEnd(s, 'a', a * s.opening), 'b', b * s.opening));
const ratioLab = (p, q) => grad(grad(grad(L.init({ mode: 'ratio', p, q, marks: 3, sameUnitOnly: true, player: true }), 'a-', 3), 'a+', 3), 'b+', 3);

describe('segment-divider in the mission player — rendering', () => {
  it('the player shows no stepper, no page verdict line, no trials fold; AB is 9, never 10; the coach and the live region exist', () => {
    const html = inPlayer(<SegmentDivider mode="equal" parts={3} levels={false} chains="full" />);
    expect(html).toContain('data-sd-verdict-live');
    expect(html).toContain('role="status"');
    expect(html).not.toContain('data-lab-stepper');
    expect(html).not.toContain('data-lab-fold');
    expect(html).not.toMatch(rawKey);
    // the default mission line states the length: 9 in the player, 10 on the page (unchanged)
    expect(html).toContain('9cm');
    expect(html).not.toContain('10cm');
    const page = renderToString(<SegmentDivider mode="equal" parts={3} />);
    expect(page).toContain('10cm');
    expect(page).not.toContain('data-sd-verdict-live');
    expect(page).not.toContain('data-sd-player-col');
    expect(page).toMatch(/role="status"[^>]*data-sd-verdict|data-sd-verdict[^>]*role="status"/);
  });

  it('a prediction opens before the first gesture and freezes the controls (aria-disabled, never `disabled`)', () => {
    const html = inPlayer(<SegmentDivider mode="equal" parts={3} length={8} levels={false} chains="full" predict={['joinWhich']} />);
    // the mission intro is open at mount in a server render: the tray comes once it is closed — the controls exist and none is `disabled`
    expect(html).toContain('data-sd-ghost="ray"');
    expect(html).not.toMatch(/data-sd-(ghost|open-less|open-more|fresh|draw)[^>]* disabled=""/);
  });

  it('the free round offers its constructions as choices, the current one pressed; a ratio is drawn as a fraction', () => {
    const choices = [{ mode: 'equal', parts: 3, length: 12 }, { mode: 'equal', parts: 5, length: 12 }, { mode: 'ratio', p: 3, q: 2, marks: 3 }, { mode: 'ratio', p: 2, q: 1, marks: 3 }];
    const html = inPlayer(<SegmentDivider mode="equal" parts={3} length={12} levels={false} checkpoints={false} choices={choices} />);
    expect((html.match(/data-sd-choice="/g) ?? []).length).toBe(4);
    expect(html).toContain('data-sd-choice="ratio-3-2"');
    const pressed = [...html.matchAll(/<button[^>]*data-sd-choice="([a-z0-9-]+)"[^>]*>/g)].filter((m) => m[0].includes('aria-pressed="true"')).map((m) => m[1]);
    expect(pressed).toEqual(['equal-3']);
    expect(html).not.toMatch(rawKey);
    expect(renderToString(<SegmentDivider mode="equal" parts={3} choices={choices} />)).not.toContain('data-sd-choice');
  });

  it('a ratio round in the player: the ruler ends carry their names F and E', () => {
    const html = inPlayer(<SegmentDivider mode="ratio" p={2} q={3} marks={3} levels={false} chains="full" />);
    expect(html).toContain('data-mode="ratio"');
    expect(html).not.toMatch(rawKey);
  });
});

describe('segment-divider in the mission player — the question chains', () => {
  it('chains: equal full / build / none, ratio full (ranks, then rule) / build / none', () => {
    expect(CHAINS_PLAYER.equal.full.map((c) => [c.id, c.qs])).toEqual([['rule', ['apFill', 'apBuild', 'rule']]]);
    expect(chainsOfPlayer('equal', 'build').map((c) => [c.id, c.qs])).toEqual([['build', ['apBuild']]]);
    expect(CHAINS_PLAYER.ratio.full.map((c) => [c.id, c.qs])).toEqual([['ranks', ['ranksFill', 'maBuild']], ['rule', ['tIn', 'rule']]]);
    expect(chainsOfPlayer('ratio', 'build').map((c) => c.qs)).toEqual([['maBuild']]);
    expect(chainsOfPlayer('equal', 'none')).toEqual([]);
    expect(chainsOfPlayer('ratio', 'nope')).toEqual([]);
    // every question a chain names exists
    Object.values(CHAINS_PLAYER).forEach((byName) => Object.values(byName).flat().forEach((c) => c.qs.forEach((q) => expect(typeof QUESTIONS[q], q).toBe('function'))));
  });

  it('equal, 3 parts: the chain opens at the first RIGHT construction — not on a wrong one', () => {
    const base = L.init({ parts: 3, length: 8, player: true });
    const wrong = construct(base, 3, 2);
    expect(CHAINS_PLAYER.equal.full[0].reached(wrong)).toBe(false);
    const s = construct(L.fresh(wrong), 3);
    expect(CHAINS_PLAYER.equal.full[0].reached(s)).toBe(true);
    const fill = QUESTIONS.apFill(s, 'rule', k);
    expect(fill.fields).toHaveLength(1);
    expect(fill.fields[0].expected).toBe(String(s.parts));
    expect([...fill.fields[0].options].sort()).toEqual(['2', '3', '4']);
    expect(isCorrect(fill, ['3'])).toBe(true);
    expect(isCorrect(fill, ['2'])).toBe(false);
    const build = QUESTIONS.apBuild(s, 'rule', k);
    expect(build.preset).toEqual(['AM₁', 'AB', null, null]);
    expect([...build.tiles.slice(2)].sort()).toEqual(['AP₁', 'AP₃', 'P₁P₃'].sort());
    expect(isCorrect(build, ['AM₁', 'AB', 'AP₁', 'AP₃'])).toBe(true);
    expect(isCorrect(build, ['AP₁', 'AP₃', 'AM₁', 'AB'])).toBe(true);          // the equality the other way (shared `accept`)
    expect(isCorrect(build, ['AM₁', 'AB', 'AP₁', 'P₁P₃'])).toBe(false);        // part over the REST: the decoy
    expect(isCorrect(build, ['AM₁', 'AB', 'AP₃', 'AP₁'])).toBe(false);
    const rule = QUESTIONS.rule(s, 'rule', k);
    expect(rule.options.filter((o) => o.correct)).toHaveLength(1);
    [fill, build, rule].forEach((q) => expect(text(q)).not.toMatch(rawKey));
    // the truth the build states is Thales': the cut of rank k is at k/n of AB
    const r = buildRank(s.parts);
    expect(L.cutsOf(s)[r - 1].t).toEqual({ n: r, d: s.parts });
  });

  it('equal, 5 parts: the build asks the SECOND point (AM₂/AB = AP₂/AP₅, decoy P₂P₅)', () => {
    const s = construct(L.init({ parts: 5, length: 11, player: true }), 5);
    expect(buildRank(5)).toBe(2);
    const q = QUESTIONS.apBuild(s, 'build', k);
    expect(q.expected).toEqual(['AM₂', 'AB', 'AP₂', 'AP₅']);
    expect(q.tiles).toContain('P₂P₅');
    expect(sub(12)).toBe('₁₂');
    expect(text(q)).not.toMatch(rawKey);
  });

  it('the decoy tile turns with the numbers (never always at the same place)', () => {
    const at = [2, 3, 4, 5].map((n) => QUESTIONS.apBuild(L.init({ parts: n, player: true }), 'build', k).tiles.findIndex((x) => /^P.P.$/.test(x)));
    expect(new Set(at).size).toBeGreaterThan(1);
    const fills = [3, 4, 5].map((n) => { const f = QUESTIONS.apFill(L.init({ parts: n, player: true }), 'rule', k).fields[0]; return f.options.indexOf(f.expected); });
    expect(new Set(fills).size).toBeGreaterThan(1);
  });

  it('ratio 2/3: « ranks » at the first right point (AF = 2, BE = 3; build AF/BE = MA/MB, decoy AB), « rule » at both points (AM/AB = 2/5)', () => {
    let s = ruler(ratioLab(2, 3), -2, 3);
    expect(CHAINS_PLAYER.ratio.full[0].reached(s)).toBe(true);
    expect(CHAINS_PLAYER.ratio.full[1].reached(s)).toBe(false);
    const ranks = QUESTIONS.ranksFill(s, 'ranks', k);
    const j = s.joins.find((x) => x.ok);
    expect(ranks.fields.map((f) => f.expected)).toEqual([String(j.rankA), String(j.rankB)]);
    expect(ranks.fields[0].options).toEqual(['1', '2', '3']);
    expect(isCorrect(ranks, ['2', '3'])).toBe(true);
    expect(isCorrect(ranks, ['3', '2'])).toBe(false);
    const build = QUESTIONS.maBuild(s, 'ranks', k);
    expect(build.preset).toEqual(['AF', 'BE', null, null]);
    expect([...build.tiles.slice(2)].sort()).toEqual(['AB', 'MA', 'MB']);
    expect(isCorrect(build, ['AF', 'BE', 'MA', 'MB'])).toBe(true);
    expect(isCorrect(build, ['MA', 'MB', 'AF', 'BE'])).toBe(true);
    expect(isCorrect(build, ['AF', 'BE', 'MA', 'AB'])).toBe(false);            // part over the WHOLE: the decoy
    s = ruler(s, 2, 3);
    expect(CHAINS_PLAYER.ratio.full[1].reached(s)).toBe(true);
    const tIn = QUESTIONS.tIn(s, 'rule', k);
    const right = renderToString(<span>{tIn.options.find((o) => o.correct).text}</span>);
    const inside = s.joins.find((x) => x.kind === 'inside');
    expect([inside.t.n, inside.t.d]).toEqual([2, 5]);
    expect(right).toContain('2');
    expect(right).toContain('5');
    const rule = QUESTIONS.rule(s, 'rule', k);
    expect(rule.options.filter((o) => o.correct)).toHaveLength(1);
    [ranks, build, tIn, rule].forEach((q) => expect(text(q)).not.toMatch(rawKey));
  });

  it('the outside point found first: the build names N (NA, NB)', () => {
    const s = ruler(ratioLab(3, 2), 3, 2);
    expect(s.joins.at(-1).kind).toBe('outside');
    const q = QUESTIONS.maBuild(s, 'build', k);
    expect(q.expected).toEqual(['AF', 'BE', 'NA', 'NB']);
    expect(text(q)).not.toMatch(rawKey);
  });

  it('the rule never cites a ruler refused for its two units (its ratio means nothing)', () => {
    let s = L.init({ mode: 'ratio', p: 2, q: 3, marks: 3, sameUnitOnly: true, player: true });
    s = grad(L.setOpening(grad(L.setOpening(s, 12), 'a-', 3), 9), 'b+', 3);
    s = L.commitRuler(L.setEnd(L.setEnd(s, 'a', -36), 'b', 27));      // 36 / 27 = 4/3 — refused as two units
    expect(s.joins.at(-1).kind).toBe('units');
    s = ruler(ruler(grad(grad(grad(L.fresh(s), 'a-', 2), 'a+', 2), 'b+', 3), -2, 3), 2, 3);
    const html = text(QUESTIONS.rule(s, 'rule', k));
    expect(html).not.toMatch(/4<\/span>.{0,400}3<\/span>.{0,40}frac-line|\{4\}\{3\}/);
    expect(html).not.toMatch(rawKey);
  });
});

describe('segment-divider in the mission player — strings', () => {
  it('every new string exists in Arabic, none interpolates `ns`', () => {
    expect(JSON.stringify(strings.segmentDivider)).not.toContain('{{ns}}');
    ['vJoinOne', 'cueRight', 'cueWrong', 'journal', 'colJoined', 'colOpenings', 'colResult', 'choicesLabel', 'choiceRatio', 'choiceNow',
      'vp.parallel', 'vp.units', 'rowWord.ok', 'rowWord.count', 'rowWord.unequal', 'rowWord.inside', 'rowWord.outside', 'rowWord.inverted', 'rowWord.units',
      'rowWord.other', 'rowWord.parallel', 'predict.parallels', 'predict.opposite', 'predict.where.before', 'predict.where.between', 'predict.where.after',
      'predict.wrong', 'coach.carry', 'coach.join', 'coach.square', 'coach.fresh', 'coach.carryA', 'coach.endA', 'coach.endB', 'coach.second',
      'cp.build.slotPart', 'cp.build.slotWhole', 'cp.build.slotOnD1', 'cp.build.slotOnD2', 'cp.build.slotFromA', 'cp.build.slotFromB',
      'cp.ranksFill.af', 'cp.ranksFill.be', 'cp.ruleEqual.hint1', 'cp.ruleEqual.hint2']
      .forEach((key) => expect(k(key), key).not.toMatch(rawKey));
    expect(k('vp.ok', { n: 3, part: 'x' })).toContain('3');
    expect(k('vp.count', { got: 2, want: 3 })).toContain('2');
    expect(k('vp.unequal', { openings: '1,5 ، 2' })).toContain('1,5');
    expect(k('predict.joinWhich', { n: 5 })).toContain('5');
    expect(k('predict.same', { r: '2/3' })).toContain('2/3');
    expect(k('predict.mark', { x: 4 })).toContain('4');
    expect(k('choiceEqual', { n: 5 })).toContain('5');
  });

  it('a PredictTray prompt holds no `$` (unit-2 trap); one formula at most per player verdict; the ✓ / ✗ glyphs are never in a string', () => {
    Object.entries(strings.segmentDivider.predict).forEach(([key, v]) => { if (typeof v === 'string') expect(v.includes('$'), key).toBe(false); });
    Object.entries(strings.segmentDivider.vp).forEach(([key, v]) => {
      expect((v.match(/\$/g) ?? []).length, key).toBeLessThanOrEqual(2);
      expect(/[✓✗]/.test(v), key).toBe(false);
    });
    Object.values(strings.segmentDivider.rowWord).forEach((v) => expect(/[✓✗]/.test(v)).toBe(false));
  });

  it('a wrong construction is told in words and bands — never a computed length (L3.5); two units are EXPLAINED in words (L3.1)', () => {
    expect(strings.segmentDivider.vp.count.includes('$')).toBe(false);
    expect(strings.segmentDivider.vp.unequal.includes('$')).toBe(false);
    expect(strings.segmentDivider.vp.unequal).not.toContain('{{parts}}');
    expect(strings.segmentDivider.vp.count).not.toContain('{{parts}}');
    expect(strings.segmentDivider.vp.units.includes('$')).toBe(false);
    expect(strings.segmentDivider.vp.units).not.toMatch(/\{\{/);
    expect(strings.segmentDivider.vp.units.length).toBeGreaterThan(60);
    // the coach never names a count, a rank or a side
    Object.values(strings.segmentDivider.coach).forEach((v) => { expect(/[0-9٠-٩]/.test(v), v).toBe(false); expect(/(^|\s)(فوق|تحت|الثالثة|الثانية)(\s|$|[.،:])/.test(v), v).toBe(false); });
  });
});
