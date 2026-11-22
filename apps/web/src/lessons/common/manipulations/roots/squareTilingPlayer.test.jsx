import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import strings from '../../../../i18n/locales/ar/lesson.manipulation.json';
import { CHAINS, CHAINS_PLAYER, QUESTIONS, chainOfPlayer, firstValid } from './SquareTiling';
import * as L from '../logic/squareTiling';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * Le traitement v2 du labo `square-tiling` dans le lecteur de mission (rollout 2026-11-10, unité 2 leçon 4 ; conseil du 2026-11-10), dans ses
 * DEUX modes (product : leçon 4 ; simplest : leçon 5, contenu seulement). Les vérités sont celles de la logique du labo, jamais retapées.
 */
const t = (key, o) => i18n.t(`lesson:${key}`, o);
const k = (key, o) => t(`manipulation.squareTiling.${key}`, o);
const rawKey = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.fields?.map((f) => f.label)}{q.slots}{q.ops}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}</div>);
const tileAll = (s, ks) => ks.reduce((acc, v) => L.tile(acc, v), s);
/** « √8 » → 8 (sous la racine), « 3 » → 9 (son carré) : la valeur au carré d'un texte de côté. */
const squareOfText = (s) => (String(s).startsWith('√') ? Number(String(s).slice(1)) : Number(s) ** 2);

describe('square-tiling in the mission player', () => {
  it('the « whole tile? » prediction truth is computed: 27 → k = 3 yes, k = 2 no; 32 → 2 and 4 yes, 3 no', () => {
    expect(L.tilesWhole(27, 3)).toBe(true);
    expect(L.tilesWhole(27, 2)).toBe(false);
    expect([2, 3, 4].map((v) => L.tilesWhole(32, v))).toEqual([true, false, true]);
    expect(L.tilesWhole(27, 6)).toBe(false); // more tiles than the square can hold
  });

  it('the tally counts accepted tilings with k > 1 and refusals', () => {
    const s = tileAll(L.init({ n: 32 }), [1, 2, 3, 4]);
    expect(L.tally(s)).toEqual({ ok: 2, ko: 1 });
  });

  it('the player chains: full in round 1, one question in the other rounds, the simplest chain for lesson 5', () => {
    expect(CHAINS.tile).toEqual(['area', 'side']);
    expect(CHAINS_PLAYER.full).toEqual(['areaFill', 'sideChoice', 'tileBuild', 'ruleP1']);
    expect(chainOfPlayer('bridge')).toEqual(['bridge']);
    expect(chainOfPlayer('quotient')).toEqual(['quotient']);
    expect(chainOfPlayer('area')).toEqual(['areaFill']);
    expect(chainOfPlayer('fullS')).toEqual(['bestFill', 'simplestBuild', 'ruleS1']);
    expect(chainOfPlayer('none')).toEqual([]);
  });

  it('round 1 (27): the area, the side among three, the BUILT « √27 = 3 × √3 » with the decoy 9, the rule', () => {
    const s = tileAll(L.init({ n: 27 }), [2, 3]);
    expect(firstValid(s).k).toBe(3);
    const area = QUESTIONS.areaFill(s, k);
    expect(area.fields[0].expected).toBe('3');
    expect(area.fields[0].options).toContain('3');
    expect(new Set(area.fields[0].options).size).toBe(3);
    expect(area.fields[0].options).not.toContain('9'); // never a number of tiles (3 × 3)
    expect(isCorrect(area, ['3'])).toBe(true);
    const side = QUESTIONS.sideChoice(s, k);
    expect(side.options.filter((o) => o.correct)).toHaveLength(1);
    expect(L.sideOptions(27, 3)).toEqual({ right: '3 × √3', wrongSquare: '9 × √3', wrongSelf: '√3 × √3' });
    const build = QUESTIONS.tileBuild(s, k);
    expect(build.expected).toEqual(['3', '√3']);
    expect(build.tiles).toEqual(expect.arrayContaining(['3', '√3', '9']));
    expect(isCorrect(build, ['3', '√3'])).toBe(true);
    expect(isCorrect(build, ['9', '√3'])).toBe(false);
    const rule = QUESTIONS.ruleP1(s, k);
    expect(rule.id).toBe('rule');
    [area, side, build, rule].forEach((q) => expect(text(q)).not.toMatch(rawKey));
  });

  it('the build is the TRUTH: k² × (side of the tile)² = n, the decoy k² is not', () => {
    [[27, 3], [32, 2], [32, 4], [98, 7], [96, 2], [96, 4], [8, 2], [75, 5], [50, 5]].forEach(([n, kv]) => {
      const x = L.tileBuildOf(n, kv);
      expect(Number(x.expected[0]) ** 2 * squareOfText(x.expected[1]), `${n}/${kv}`).toBe(n);
      expect(x.tiles).toContain(String(kv * kv));
      expect(new Set(x.tiles).size).toBe(3);
    });
  });

  it('round 2 bridge (32): « √(4 × 8) = √4 × … » → √8; round 3 quotient (98): « √2 = √(98 ÷ …) » → 49', () => {
    const r2 = tileAll(L.init({ n: 32 }), [2, 3, 4]);
    const bridge = QUESTIONS.bridge(r2, k);
    expect(bridge.fields[0].expected).toBe('√8');
    expect([...bridge.fields[0].options].sort()).toEqual(['2', '8', '√8']);
    expect(isCorrect(bridge, ['√8'])).toBe(true);
    const r3 = tileAll(L.init({ n: 98 }), [4, 7]);
    const quot = QUESTIONS.quotient(r3, k);
    expect(quot.fields[0].expected).toBe('49');
    expect([...quot.fields[0].options].sort()).toEqual(['14', '49', '7']);
    expect(98 / Number(quot.fields[0].expected)).toBe(2);
    [bridge, quot].forEach((q) => expect(text(q)).not.toMatch(rawKey));
  });

  it('simplest mode (lesson 5, 32 and 128): the largest k, the built simplest form with a smaller-k decoy pair, the rule', () => {
    const s32 = tileAll(L.init({ n: 32, mode: 'simplest' }), [2, 4]);
    expect(L.discoveryReady(s32)).toBe(true);
    const x = L.simplestBuildOf(s32);
    expect(x).toMatchObject({ km: 4, m: 2, ko: 2, bo: 8, expected: ['4', '√2'] });
    expect(x.tiles).toEqual(expect.arrayContaining(['2', '√8', '4', '√2']));
    const s128 = tileAll(L.init({ n: 128, mode: 'simplest' }), [2, 4, 8]);
    expect(L.kmax(s128)).toBe(8);
    expect(L.simplestBuildOf(s128).expected).toEqual(['8', '√2']);
    const best = QUESTIONS.bestFill(s128, k);
    expect(best.fields[0].expected).toBe('2');
    const build = QUESTIONS.simplestBuild(s128, k);
    expect(isCorrect(build, ['8', '√2'])).toBe(true);
    expect(isCorrect(build, ['2', '√32'])).toBe(false);
    [best, build, QUESTIONS.ruleS1(s128, k)].forEach((q) => expect(text(q)).not.toMatch(rawKey));
  });

  it('a refusal is shown with its EXACT quotient, not reduced: 98 ÷ 36 (never 49/18)', () => {
    expect(L.refusedPlain(98, 6)).toBe('98 ÷ 36');
    expect(L.refusedPlainTex(98, 6)).not.toContain('18');
    expect(L.refusedPlainTex(50, 2)).not.toContain('12');
  });

  it('the guide shows the handle, then the ruler for another try — never a valid k; nothing once discovered', () => {
    let s = L.init({ n: 32 });
    expect(L.coachOf(s)).toMatchObject({ id: 'drag', target: '[data-tiling-handle]' });
    s = L.tile(s, 3);
    expect(L.coachOf(s)).toMatchObject({ id: 'again', target: '[data-tiling-ruler]' });
    s = tileAll(s, [2, 4]);
    expect(L.coachOf(s)).toBeNull();
    // never a target naming a k
    const seen = new Set();
    let p = L.init({ n: 96 });
    [null, 3, 2, 4].forEach((v) => { if (v) p = L.tile(p, v); seen.add(L.coachOf(p)?.target); });
    expect([...seen].some((x) => /\d/.test(String(x)))).toBe(false);
  });

  it('every new string exists in Arabic, and none interpolates `ns`', () => {
    expect(JSON.stringify(strings.squareTiling)).not.toContain('{{ns}}');
    ['coach.drag', 'coach.again', 'predict.yes', 'predict.no', 'predict.wrong', 'predict.promptSmallest', 'journal', 'colB', 'refusedBig', 'refusedCell', 'cueRight', 'cueWrong', 'choicesLabel', 'cpP.tileField']
      .forEach((key) => expect(k(key)).not.toMatch(rawKey));
    expect(k('predict.promptWhole', { k: 3 })).toContain('3');
    expect(k('tallySr', { ok: 2, ko: 1 })).not.toMatch(rawKey);
    expect(k('validP', { k: 3, b: 3 })).not.toMatch(rawKey);
  });

  it('no player string speaks of a NUMBER OF TILES (k², « 16 بلاطة ») — only k, the tile area and the side', () => {
    const player = JSON.stringify({ ...strings.squareTiling.cpP, ...strings.squareTiling.predict, validP: strings.squareTiling.validP, ariaValidP: strings.squareTiling.ariaValidP });
    expect(player).not.toMatch(/\{\{k\}\}\s*\\\\times\s*\{\{k\}\}\s*بلاط/);
    expect(player).not.toContain('عدد البلاطات في المربّع كلّه');
  });

  it('the answer does not keep one place: chips and choices turn with the numbers (ECC review 2026-11-10)', () => {
    expect(L.spin([1, 2, 3], 4)).toEqual([2, 3, 1]);
    expect(L.spin([1, 2, 3], 3)).toEqual([1, 2, 3]);
    const plays = [[27, [3]], [32, [2, 4]], [98, [7]], [96, [4, 2]], [50, [5]], [75, [5]]].map(([n, ks]) => tileAll(L.init({ n }), ks));
    const fillPos = plays.flatMap((s) => ['areaFill', 'bridge', 'quotient'].map((id) => { const q = QUESTIONS[id](s, k); return q.fields[0].options.indexOf(q.fields[0].expected); }));
    expect(new Set(fillPos).size).toBeGreaterThan(1);
    const choicePos = plays.flatMap((s) => ['sideChoice', 'ruleP1'].map((id) => QUESTIONS[id](s, k).options.findIndex((o) => o.correct)));
    expect(new Set(choicePos).size).toBeGreaterThan(1);
  });

  it('n = k⁴ (√b = k) never writes the right side twice among the choices', () => {
    const so = L.sideOptions(16, 2); // b = 4, √b = 2 = k
    expect(new Set([so.right, so.wrongSquare, so.wrongSelf]).size).toBe(3);
  });

  it('k = 1 is never a trial of the round, and the chains wait for a valid k > 1', () => {
    const s = L.tile(L.init({ n: 27 }), 1);
    expect(firstValid(s)).toBeUndefined();
    expect(L.tally(s)).toEqual({ ok: 0, ko: 0 });
  });
});

describe('square-tiling simplest mode in the player (lesson 5, council of 2026-11-10)', () => {
  it('area decoys skip an `avoid` list and still offer two wrong areas; without it, nothing changes', () => {
    expect(L.areaOptions(80, 4)).toEqual(['5', '20', '9']);
    expect(L.areaOptions(72, 6)).toEqual(['2', '12', '8']);
    expect(L.areaOptions(72, 6, ['12', '10', '25', '2'])).toEqual(['2', '8', '4']);
    expect(L.areaOptions(32, 2, ['10'])).toEqual(['8', '16', '9']);
  });
  it('the short simplest chains are asked at the discovery, the build or the area alone', () => {
    expect(chainOfPlayer('buildS')).toEqual(['simplestBuild']);
    expect(chainOfPlayer('bestS')).toEqual(['bestFill']);
    const s = tileAll(L.init({ n: 80, mode: 'simplest' }), [4, 2]);
    expect(L.discoveryReady(s)).toBe(true);
    const q = QUESTIONS.bestFill(s, k, { avoid: ['10'] });
    expect(q.fields[0].expected).toBe('5');
    expect(q.fields[0].options).not.toContain('10');
    expect(rawKey.test(text(q))).toBe(false);
  });
  it('simplestShown tags every value with its role (k² only inside « n ÷ k² »)', () => {
    const shown = L.simplestShown(75, { chains: 'fullS', predictKs: [7, 3, 5], predictAlso: [3] });
    expect(shown).toContainEqual({ role: 'kk', v: '25' });
    expect(shown).toContainEqual({ role: 'form', v: '5√3' });
    expect(shown.filter((x) => x.role === 'area').map((x) => x.v)).toContain('3');
  });
});

describe('square-tiling predictions and decoys after the ECC review of lesson 5', () => {
  it('a prediction is judged when its k is tried, and every one at the discovery — never lost behind the round\'s question', () => {
    const keys = ['smallest', 'k:2'];
    let s = L.init({ n: 32, mode: 'simplest' });
    expect(L.judgedPredictions(s, keys)).toEqual([]);
    s = L.tile(s, 4);                                   // the largest k first: « smallest » is judged, k = 2 not yet
    expect(L.judgedPredictions(s, keys)).toEqual(['smallest']);
    s = L.tile(s, 2);                                   // the discovery: both, so the lab shows the k = 2 result before the question
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.judgedPredictions(s, keys)).toEqual(keys);
    // a k never tried is still judged (and shown) at the discovery: r1 of lesson 5 predicts k = 3 on 75
    const t = tileAll(L.init({ n: 75, mode: 'simplest' }), [5, 6]);
    expect(L.judgedPredictions(t, ['smallest', 'k:3'])).toEqual(['smallest', 'k:3']);
  });
  it('« مساحة البلاطة » always offers three distinct areas, with or without an avoid list (n = 1..100, every valid k)', () => {
    const AVOID = ['200', '√200', '10√2', '120', '12000', '12', '10', '100', '50', '25', '2'];
    for (let n = 1; n <= 100; n += 1) {
      L.validKs(L.init({ n })).forEach((v) => {
        [[], AVOID].forEach((avoid) => {
          const o = L.areaOptions(n, v, avoid);
          expect(new Set(o).size, `${n}, k = ${v}`).toBe(3);
          o.slice(1).forEach((x) => expect(avoid.includes(x), `${n}, k = ${v}: ${x}`).toBe(false));
        });
      });
    }
  });
  it('simplestBuild drops its second hint when no smaller valid k exists (ko = 1)', () => {
    const one = QUESTIONS.simplestBuild(tileAll(L.init({ n: 75, mode: 'simplest' }), [5, 6]), k);
    const two = QUESTIONS.simplestBuild(tileAll(L.init({ n: 32, mode: 'simplest' }), [4, 2]), k);
    expect(one.hints).toHaveLength(1);
    expect(two.hints).toHaveLength(2);
  });
});
