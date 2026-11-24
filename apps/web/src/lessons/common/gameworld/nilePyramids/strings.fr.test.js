/**
 * The FRENCH words of the pyramids world (`strings.fr.js`) — the tests whose point is the wording itself: the twin of
 * Algeria's `strings.ar.test.js` (same checks, French words), plus the KEY TREE of the file, written below so that a
 * later sync with `strings.ar.js` (which is not in this tree) compares two lists: every exported key path, an array's
 * length `[n]`, a function's arity `()n`.
 */
import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';
import * as FR from './strings.fr';
import { DIR, FIGURE_TEXT, KIND_TEXT, THALES_TEXT, WORLD_TEXT } from './strings.fr';
import { PLAN_SPEC, HALFTURN_SPEC, SCALE_SPEC } from './test/specs';

globalThis.window = globalThis.window ?? {};
const plain = (html) => html.replace(/<annotation[^>]*>.*?<\/annotation>/g, '').replace(/<[^>]+>/g, ' ');
/** The words that would NAME a rule of the unit: Thalès, the butterfly, proportional, parallel, equal ratios, k. */
const RULE_WORDS =
  /thal[eè]s|papillon|proportionn|parall[eè]l|rapports? [ée]gaux|[ée]galit[ée] des rapports|coefficient/i;

/** The key tree of `strings.fr.js` — the same as `strings.ar.js` on 2026-11-24 (198 paths). */
const KEY_TREE = [
  'DIR',
  'FIGURE_TEXT.butterfly()1',
  'FIGURE_TEXT.nested()5',
  'FIGURE_TEXT.pair()1',
  'KIND_TEXT.halfturn.ask()1',
  'KIND_TEXT.halfturn.chainOwn',
  'KIND_TEXT.halfturn.hit',
  'KIND_TEXT.halfturn.landed()3',
  'KIND_TEXT.halfturn.lead',
  'KIND_TEXT.halfturn.line()2',
  'KIND_TEXT.halfturn.miss',
  'KIND_TEXT.halfturn.next',
  'KIND_TEXT.halfturn.turn',
  'KIND_TEXT.plan.again',
  'KIND_TEXT.plan.cards',
  'KIND_TEXT.plan.fact.fits',
  'KIND_TEXT.plan.fact.gap()1',
  'KIND_TEXT.plan.fact.overhang()1',
  'KIND_TEXT.plan.lay',
  'KIND_TEXT.plan.lead',
  'KIND_TEXT.plan.line.fits',
  'KIND_TEXT.plan.line.gap()1',
  'KIND_TEXT.plan.line.overhang()1',
  'KIND_TEXT.plan.next',
  'KIND_TEXT.plan.tools',
  'KIND_TEXT.plan.twoUnknown',
  'KIND_TEXT.plan.typeIt()1',
  'KIND_TEXT.plan.unit',
  'KIND_TEXT.scale.again',
  'KIND_TEXT.scale.ask()1',
  'KIND_TEXT.scale.copy',
  'KIND_TEXT.scale.copyPerimeter',
  'KIND_TEXT.scale.copySides',
  'KIND_TEXT.scale.dial',
  'KIND_TEXT.scale.fact',
  'KIND_TEXT.scale.hit',
  'KIND_TEXT.scale.image.exact',
  'KIND_TEXT.scale.image.inside',
  'KIND_TEXT.scale.image.outside',
  'KIND_TEXT.scale.lead',
  'KIND_TEXT.scale.miss',
  'KIND_TEXT.scale.next',
  'KIND_TEXT.scale.perimeter.plus',
  'KIND_TEXT.scale.perimeter.times',
  'KIND_TEXT.scale.perimeter.times3',
  'KIND_TEXT.scale.perimeterAsk',
  'KIND_TEXT.scale.say.exact',
  'KIND_TEXT.scale.say.larger',
  'KIND_TEXT.scale.say.smaller',
  'KIND_TEXT.scale.setK()1',
  'THALES_TEXT.agreed',
  'THALES_TEXT.aligned',
  'THALES_TEXT.apart',
  'THALES_TEXT.fire',
  'THALES_TEXT.log',
  'THALES_TEXT.mirrored',
  'THALES_TEXT.next',
  'THALES_TEXT.sub',
  'THALES_TEXT.survived',
  'THALES_TEXT.testing',
  'THALES_TEXT.title',
  'THALES_TEXT.wordsHint',
  'WORLD_TEXT.docks[5]',
  'WORLD_TEXT.end.stay',
  'WORLD_TEXT.end.text',
  'WORLD_TEXT.end.title',
  'WORLD_TEXT.fact.above',
  'WORLD_TEXT.fact.apex',
  'WORLD_TEXT.fact.as',
  'WORLD_TEXT.fact.below',
  'WORLD_TEXT.fact.fits',
  'WORLD_TEXT.fact.gap',
  'WORLD_TEXT.fact.longer',
  'WORLD_TEXT.fact.overhang',
  'WORLD_TEXT.fact.short',
  'WORLD_TEXT.fact.shorter',
  'WORLD_TEXT.fact.slack',
  'WORLD_TEXT.fact.ties',
  'WORLD_TEXT.held()1',
  'WORLD_TEXT.hud.back',
  'WORLD_TEXT.hud.drop',
  'WORLD_TEXT.hud.knots()1',
  'WORLD_TEXT.hud.plan',
  'WORLD_TEXT.hud.reads',
  'WORLD_TEXT.hud.record',
  'WORLD_TEXT.hud.register',
  'WORLD_TEXT.hud.rope',
  'WORLD_TEXT.hud.top',
  'WORLD_TEXT.hud.topBack',
  'WORLD_TEXT.hud.typed',
  'WORLD_TEXT.objective.board()1',
  'WORLD_TEXT.objective.canal()2',
  'WORLD_TEXT.objective.course()1',
  'WORLD_TEXT.objective.edge()2',
  'WORLD_TEXT.objective.end',
  'WORLD_TEXT.objective.later',
  'WORLD_TEXT.objective.look',
  'WORLD_TEXT.objective.predict()1',
  'WORLD_TEXT.objective.slide()3',
  'WORLD_TEXT.order.canal.ask()1',
  'WORLD_TEXT.order.canal.send',
  'WORLD_TEXT.order.canal.title',
  'WORLD_TEXT.order.course.ask()1',
  'WORLD_TEXT.order.course.send',
  'WORLD_TEXT.order.course.title',
  'WORLD_TEXT.order.later',
  'WORLD_TEXT.order.refused.empty',
  'WORLD_TEXT.order.refused.out',
  'WORLD_TEXT.practice.again',
  'WORLD_TEXT.practice.bump',
  'WORLD_TEXT.practice.gate',
  'WORLD_TEXT.practice.leave',
  'WORLD_TEXT.practice.left',
  'WORLD_TEXT.practice.lost.text',
  'WORLD_TEXT.practice.lost.title',
  'WORLD_TEXT.practice.of',
  'WORLD_TEXT.practice.order',
  'WORLD_TEXT.practice.pause',
  'WORLD_TEXT.practice.pausedText',
  'WORLD_TEXT.practice.pausedTitle',
  'WORLD_TEXT.practice.quit',
  'WORLD_TEXT.practice.resume',
  'WORLD_TEXT.practice.right',
  'WORLD_TEXT.practice.rule',
  'WORLD_TEXT.practice.say',
  'WORLD_TEXT.practice.start',
  'WORLD_TEXT.practice.title',
  'WORLD_TEXT.practice.won.text',
  'WORLD_TEXT.practice.won.title',
  'WORLD_TEXT.prompt.board()1',
  'WORLD_TEXT.prompt.drop',
  'WORLD_TEXT.prompt.look',
  'WORLD_TEXT.prompt.order',
  'WORLD_TEXT.prompt.predict',
  'WORLD_TEXT.prompt.take()1',
  'WORLD_TEXT.recall.title',
  'WORLD_TEXT.say.built',
  'WORLD_TEXT.say.sail',
  'WORLD_TEXT.say.star',
  'WORLD_TEXT.say.tied()2',
  'WORLD_TEXT.say.water',
  'WORLD_TEXT.stage.card.check',
  'WORLD_TEXT.stage.card.later',
  'WORLD_TEXT.stage.card.notToScale',
  'WORLD_TEXT.stage.fact.big',
  'WORLD_TEXT.stage.fact.markFits',
  'WORLD_TEXT.stage.fact.markGap',
  'WORLD_TEXT.stage.fact.markOver',
  'WORLD_TEXT.stage.fact.meet',
  'WORLD_TEXT.stage.fact.quarry()1',
  'WORLD_TEXT.stage.fact.sits',
  'WORLD_TEXT.stage.fact.small',
  'WORLD_TEXT.stage.hud.triangle',
  'WORLD_TEXT.stage.objective.bankStart',
  'WORLD_TEXT.stage.objective.base',
  'WORLD_TEXT.stage.objective.capstone',
  'WORLD_TEXT.stage.objective.climb',
  'WORLD_TEXT.stage.objective.end',
  'WORLD_TEXT.stage.objective.ferry',
  'WORLD_TEXT.stage.objective.forge',
  'WORLD_TEXT.stage.objective.mark()1',
  'WORLD_TEXT.stage.objective.mission',
  'WORLD_TEXT.stage.objective.noon',
  'WORLD_TEXT.stage.objective.shadow',
  'WORLD_TEXT.stage.objective.sight',
  'WORLD_TEXT.stage.objective.slideStick',
  'WORLD_TEXT.stage.objective.stick',
  'WORLD_TEXT.stage.order.capstone.ask()0',
  'WORLD_TEXT.stage.order.capstone.seg',
  'WORLD_TEXT.stage.order.capstone.send',
  'WORLD_TEXT.stage.order.capstone.title',
  'WORLD_TEXT.stage.order.ferry.ask()0',
  'WORLD_TEXT.stage.order.ferry.seg',
  'WORLD_TEXT.stage.order.ferry.send',
  'WORLD_TEXT.stage.order.ferry.title',
  'WORLD_TEXT.stage.order.mark.ask()1',
  'WORLD_TEXT.stage.order.mark.seg',
  'WORLD_TEXT.stage.order.mark.send',
  'WORLD_TEXT.stage.order.mark.title',
  'WORLD_TEXT.stage.prompt.box',
  'WORLD_TEXT.stage.prompt.capstone',
  'WORLD_TEXT.stage.prompt.climb',
  'WORLD_TEXT.stage.prompt.ferry',
  'WORLD_TEXT.stage.prompt.forge',
  'WORLD_TEXT.stage.prompt.mark',
  'WORLD_TEXT.stage.prompt.mission',
  'WORLD_TEXT.stage.prompt.rope',
  'WORLD_TEXT.stage.prompt.stick',
  'WORLD_TEXT.stage.say.built',
  'WORLD_TEXT.stage.say.carved',
  'WORLD_TEXT.stage.say.climbed',
  'WORLD_TEXT.stage.say.noon',
  'WORLD_TEXT.stage.say.rise',
  'WORLD_TEXT.stage.say.thrown',
  'WORLD_TEXT.subtitle',
  'WORLD_TEXT.title',
  'WORLD_TEXT.turn.body',
  'WORLD_TEXT.unit',
];

const tree = (v, p = '') =>
  typeof v === 'function'
    ? [`${p}()${v.length}`]
    : Array.isArray(v)
      ? [`${p}[${v.length}]`]
      : v && typeof v === 'object'
        ? Object.keys(v).flatMap((k) => tree(v[k], p ? `${p}.${k}` : k))
        : [p];

/** Every sentence of the file, each function called with letters and a decimal length. */
const sentences = (v) =>
  typeof v === 'function'
    ? [v(...['AB', 'MN', 'C', 'D', 'E'].slice(0, v.length))]
    : v && typeof v === 'object'
      ? Object.values(v).flatMap(sentences)
      : typeof v === 'string'
        ? [v]
        : [];
const ALL = sentences({ WORLD_TEXT, KIND_TEXT, THALES_TEXT, FIGURE_TEXT });

describe('the French words of the pyramids world', () => {
  it('the experiments name no rule on screen', () => {
    for (const spec of [PLAN_SPEC, HALFTURN_SPEC, SCALE_SPEC]) {
      const out = renderToString(createElement(Inquiry, { spec, game: null, onDone: () => {} }));
      expect(out).toContain(`data-iq="${spec.kind}"`);
      expect(plain(out)).not.toMatch(RULE_WORDS);
    }
  });

  it('read left to right; no dock name, no experiment sentence and no world sentence says a rule', () => {
    expect(DIR).toBe('ltr');
    for (const name of WORLD_TEXT.docks) expect(name).not.toMatch(RULE_WORDS);
    for (const k of ['plan', 'halfturn', 'scale'])
      for (const v of Object.values(KIND_TEXT[k]))
        if (typeof v === 'string') expect(v, `${k}: ${v}`).not.toMatch(RULE_WORDS);
    for (const s of ALL) expect(s).not.toMatch(RULE_WORDS);
  });

  it('a rope from the vertex is said with its own words, never the course’s', () => {
    const { line, fact } = KIND_TEXT.plan;
    expect(line.gap('2')).not.toBe(fact.gap('2'));
    expect(line.overhang('2')).toContain('$2$');
    expect(line.gap('2')).toContain('$2$');
    expect(line.fits).not.toBe(fact.fits);
  });

  it('a screen reader hears the figure’s letters', () => {
    expect(FIGURE_TEXT.butterfly('O')).toContain('O');
    expect(FIGURE_TEXT.nested('A', 'B', 'C', 'M', 'N')).toContain('ABC');
    expect(FIGURE_TEXT.nested('A', 'B', 'C', 'M', 'N')).toContain('[MN]');
    expect(FIGURE_TEXT.pair('I')).toContain('I');
  });

  it('French typography: « ’ », no-break spaces, « m » after a no-break space, no « // », no bidi control', () => {
    for (const s of ALL) {
      expect(s, s).not.toMatch(/'/); // the typographic apostrophe
      expect(s, s).not.toMatch(/[ \u202f]:/); // U+00A0 before « : »
      expect(s, s).not.toMatch(/[ \u00a0][;!?]/); // U+202F before « ; ! ? »
      expect(s, s).not.toMatch(/« | »/); // U+00A0 inside « … »
      expect(s, s).not.toMatch(/[\d$] m\b/); // a length and its unit never split
      expect(s, s).not.toMatch(/\/\//);
      expect(s, s).not.toMatch(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/);
      expect(s, s).not.toMatch(/\bfaux\b/i);
    }
  });

  it('a decimal length is written with a comma, in a sentence and in a formula', () => {
    expect(WORLD_TEXT.held('2.5')).toBe('Corde\u00a0: 2,5\u00a0m');
    expect(WORLD_TEXT.stage.fact.quarry('12.5')).toContain('12,5\u00a0m');
    expect(WORLD_TEXT.say.tied('SE', '4.5')).toContain('$SE = 4{,}5$\u00a0m');
  });

  it('Zéro keeps the name the kit gives him', () => {
    expect(WORLD_TEXT.fact.apex).toContain('Zéro');
  });

  it('the key tree is the documented one (compare it with `strings.ar.js` at every sync)', () => {
    expect(tree(FR).sort()).toEqual([...KEY_TREE].sort());
  });
});
