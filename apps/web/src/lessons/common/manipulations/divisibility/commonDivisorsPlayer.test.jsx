import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import { CHAINS, CHAINS_PLAYER, QUESTIONS, greatestTried } from './CommonDivisors';
import * as L from '../logic/commonDivisors';
import { isCorrect } from '../primitives/labCheckpoint';
import { themeWords } from '../themeWords';

/**
 * Le traitement v2 du labo `common-divisors` dans le lecteur de mission (rollout 2026-11-08) : observer d'un toucher (le plus grand nombre
 * de groupes, ce qu'il y a dans chaque groupe), BÂTIR a = k × q, puis au-delà et la règle ; les vérités sont celles de la logique du labo.
 */
const t = (key, o) => i18n.t(`lesson:${key}`, o);
const k = (key, o) => t(`manipulation.common.${key}`, o);
const RAW = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.fields?.map((f) => f.label)}{q.slots}</div>);
const PAIRS = [[12, 18, 'football'], [90, 54, 'garden'], [60, 45, 'garden'], [8, 12, 'garden']];
const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
/** Les groupes essayés un à un jusqu'au premier au-delà du PGCD — ce que fait l'élève (et ce que greatestGroupFound exige). */
const played = (a, b) => { let s = L.initBouquets({ a, b }); for (let x = 1; x <= gcd(a, b) + 1; x += 1) s = L.addGroup(s); return s; };

describe('common-divisors in the mission player', () => {
  it('the player chains observe → build → beyond → rule, and count → why → rule; the page keeps its own chains', () => {
    expect(CHAINS_PLAYER.groupsOnly).toEqual(['observe', 'build', 'beyondFill', 'rule']);
    expect(CHAINS_PLAYER.lists).toEqual(['listCommonFill', 'listWhy', 'rule']);
    expect(CHAINS.groupsOnly).toEqual(['greatest', 'beyond', 'rule']);
  });
  it.each(PAIRS)('a=%i, b=%i: the group questions tell the SAME truth as the groups', (a, b, theme) => {
    const bouquets = played(a, b);
    expect(L.greatestGroupFound(bouquets)).toBe(true);
    const g = greatestTried(bouquets);
    expect(g).toBe(gcd(a, b));
    const ctx = { a, b, bouquets, lists: L.initLists({ a, b }), words: themeWords(t, theme) };
    const obs = QUESTIONS.observe(ctx, k);
    expect(obs.kind).toBe('fill');
    expect(obs.fields.map((f) => f.expected)).toEqual([g, a / g, b / g]);
    obs.fields.forEach((f) => expect(f.options).toContain(f.expected));
    expect(isCorrect(obs, [g, a / g, b / g])).toBe(true);
    const bld = QUESTIONS.build(ctx, k);
    expect(bld.kind).toBe('build');
    expect(bld.expected).toEqual([a, g, a / g]);
    expect(g * (a / g)).toBe(a);
    expect(isCorrect(bld, [a, g, a / g])).toBe(true);
    // the number of groups and the count per group are not interchangeable
    if (a / g !== g) expect(isCorrect(bld, [a, a / g, g])).toBe(false);
    const bey = QUESTIONS.beyondFill(ctx, k);
    const over = g + 1;
    const n = a % over !== 0 ? a : b;
    expect(bey.fields[0].expected).toBe(n % over);
    expect(n % over).toBeGreaterThan(0);
    [obs, bld, bey].forEach((q) => { expect(text(q)).not.toMatch(RAW); expect(q.hints).toHaveLength(2); });
  });
  it.each(PAIRS)('a=%i, b=%i: the lists count is the number of common divisors', (a, b) => {
    const lists = L.initLists({ a, b });
    const q = QUESTIONS.listCommonFill({ a, b, lists }, k);
    expect(q.fields[0].expected).toBe(lists.common.length);
    expect(q.fields[0].options).toContain(lists.common.length);
    expect(lists.common.every((d) => a % d === 0 && b % d === 0)).toBe(true);
    expect(text(q)).not.toMatch(RAW);
  });
});
