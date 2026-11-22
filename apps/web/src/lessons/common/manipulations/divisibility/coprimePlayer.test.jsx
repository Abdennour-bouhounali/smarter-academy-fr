import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import { CHAINS, CHAINS_PLAYER, QUESTIONS, buildFocus } from './CoprimeExplorer';
import * as L from '../logic/coprime';
import { isCorrect } from '../primitives/labCheckpoint';
import { themeWords } from '../themeWords';

/**
 * Le traitement v2 du labo `coprime-explorer` dans le lecteur de mission (rollout 2026-11-09) : compter d'un toucher, BÂTIR l'égalité
 * (ce qui reste, ou n = k × q quand un k > 1 marche), puis la règle ; listes : compter les testés, les communs, la règle. Les vérités sont
 * celles de la logique du labo ; et le guide (coachOf) montre le bon geste.
 */
const t = (key, o) => i18n.t(`lesson:${key}`, o);
const k = (key, o) => t(`manipulation.coprime.${key}`, o);
const rawKey = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.fields?.map((f) => f.label)}{q.slots}</div>);
const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
/** Les trousses ajoutées une à une jusqu'à la preuve — ce que fait l'élève (et ce que groupsInsightReady exige). */
const played = (a, b) => { let s = L.initGroups({ a, b }); while (!L.groupsInsightReady(s)) s = L.addGroupTo(s); return s; };

describe('coprime-explorer in the mission player', () => {
  it('the player chains count → build → rule, and count → commons → rule; the page keeps its own chains', () => {
    expect(CHAINS_PLAYER.groups).toEqual(['gWorkFill', 'gLeftBuild', 'rule']);
    expect(CHAINS_PLAYER.lists).toEqual(['lTestedFill', 'lCommon', 'rule']);
    expect(CHAINS.groups).toEqual(['gWork', 'gBecause', 'rule']);
  });

  it.each([[8, 9], [17, 18], [10, 21], [21, 28], [12, 18]])('groups %i and %i: the questions tell the SAME truth as the groups', (a, b) => {
    const groups = played(a, b);
    const ctx = { a, b, groups, lab: L.init({ a, b }), words: themeWords(t, 'school'), mode: 'groups' };
    const works = L.workingCounts(groups).filter((x) => x > 1);
    const count = QUESTIONS.gWorkFill(ctx, k);
    expect(count.fields[0].expected).toBe(works.length);
    expect(count.fields[0].options).toContain(works.length);
    if (gcd(a, b) === 1) expect(works).toEqual([]);
    const f = buildFocus({ a, b, groups });
    const bld = QUESTIONS.gLeftBuild(ctx, k);
    expect(bld.kind).toBe('build');
    // the equality is TRUE, and its numbers are the ones the scene shows
    if (f.works) {
      expect(bld.expected).toEqual([f.n, f.kk, f.q]);
      expect(f.kk * f.q).toBe(f.n);
      expect(bld.ops).toEqual(['=', '×']);
    } else {
      expect(bld.expected).toEqual([f.n, f.kk, f.q, f.r]);
      expect(f.kk * f.q + f.r).toBe(f.n);
      expect(f.r).toBeGreaterThan(0);
      expect(f.r).toBeLessThan(f.kk);
    }
    expect(isCorrect(bld, bld.expected)).toBe(true);
    bld.expected.forEach((x) => expect(bld.tiles).toContain(x));
    [count, bld].forEach((q) => { expect(text(q)).not.toMatch(rawKey); expect(q.hints).toHaveLength(2); });
  });

  it('lists: the tested count is what the student confronted', () => {
    let lab = L.init({ a: 15, b: 22 });
    for (const d of L.untested(lab)) lab = L.share(lab, L.chipId('a', d));
    lab = L.check(lab);
    expect(L.listsConclusive(lab)).toBe(true);
    const q = QUESTIONS.lTestedFill({ a: 15, b: 22, lab }, k);
    expect(q.fields[0].expected).toBe(4);
    expect(q.fields[0].options).toContain(4);
    expect(text(q)).not.toMatch(rawKey);
  });

  it('the guide shows the wrapper, then «+», then the middle, then «تحقّق» — never a chip', () => {
    const g0 = L.initGroups({ a: 8, b: 9 });
    expect(L.coachOf({ inGroups: true, groups: g0, lab: null }).id).toBe('add');
    expect(L.coachOf({ inGroups: true, groups: L.addGroupTo(g0), lab: null }).id).toBe('more');
    expect(L.coachOf({ inGroups: true, groups: played(8, 9), lab: null })).toBeNull();
    let lab = L.init({ a: 15, b: 22 });
    expect(L.coachOf({ inGroups: false, groups: null, lab }).id).toBe('shared');
    for (const d of L.untested(lab)) lab = L.share(lab, L.chipId('a', d));
    expect(L.coachOf({ inGroups: false, groups: null, lab }).id).toBe('check');
    expect(L.coachOf({ inGroups: false, groups: null, lab: L.check(lab) })).toBeNull();
    ['add', 'more', 'shared', 'check'].forEach((id) => expect(t(`manipulation.coprime.coach.${id}`, { group: 'حقيبة' })).not.toMatch(rawKey));
  });
});
