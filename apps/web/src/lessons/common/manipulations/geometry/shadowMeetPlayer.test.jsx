import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import strings from '../../../../i18n/locales/ar/lesson.manipulation.json';
import ShadowMeet, { CHAINS, QUESTIONS, chainsOf, ratioNode, Scene } from './ShadowMeet';
import { InMissionPlayerContext } from '../../mission/missionPlayerContext';
import * as L from '../logic/shadowMeet';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * Le labo `shadow-meet` dans le lecteur de mission (unité 9, leçon 1 ; conseil du 2026-11-10, verdict L1). Chaque question dit la MÊME vérité que
 * la logique (centimètres entiers), aucune clé brute ni `{{` à l'écran, les réponses changent de place ; hors lecteur le labo garde ses étapes.
 */
const t = (key, o) => i18n.t(`lesson:${key}`, o);
const k = (key, o) => t(`manipulation.shadowMeet.${key}`, o);
const rawKey = /manipulation\.[a-zA-Z]|\{\{/;
const OBJ = 'عمود الإنارة';
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.fields?.map((f, i) => <span key={i}>{f.label}{f.options.map((o) => (f.render ? f.render(o) : o))}</span>)}{q.slots}{q.ops}{q.tiles?.map((x) => (q.render ? q.render(x) : x))}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}</div>);
const inPlayer = (el) => renderToString(<InMissionPlayerContext.Provider value>{el}</InMissionPlayerContext.Provider>);
const meet = (lab) => L.settle(L.moveStick(lab, L.cur(lab).meetX));
const R1 = { object: 'lamp', height: '2,75', hour: '14:00', ask: 'tap' };
const R2 = { steps: [{ object: 'tower', height: '6,5', hour: '14:00', ask: 'tap' }, { object: 'tower', height: '6,5', hour: '16:00' }] };
const R3 = { object: 'pole', height: '3,75', hour: '14:30', task: 'flag' };

describe('shadow-meet — rendering', () => {
  it('in the player: no stepper, the rays are SAID parallel, the hour is shown, no length is written before the meet', () => {
    const html = inPlayer(<ShadowMeet {...R1} levels={false} chains="read" />);
    expect(html).toContain('data-shadow-meet');
    expect(html).toContain('data-met="false"');
    expect(html).toContain('data-side="sun"');
    expect(html).toContain('data-sm-stick');
    expect(html).toContain('data-sm-rays-label');
    expect(html).toContain(k('rays'));
    expect(html).toContain('data-sm-hour="14:00"');
    expect(html).not.toContain('data-lab-stepper');
    expect(html).not.toContain('data-sm-dim="OA"');          // the lamp's shadow is not measured before the meet
    expect(html).not.toContain('3,3 m');
    expect(html).not.toContain('2,75');                       // the height is unknown
    expect(html).toContain('data-sm-dim="stick"');            // the stick, in the sun, has its own measured shadow
    expect(html).toContain('1,2 m');
    expect(html).not.toContain('data-sm-ask');                // nothing is asked before the meet
    expect(html).toMatch(/role="status"[^>]*data-sm-verdict-live|data-sm-verdict-live[^>]*role="status"/);
    expect(html).not.toMatch(rawKey);
  });

  it('the always-mounted live region and the frozen handle use aria, never the disabled attribute on the trial buttons', () => {
    const html = inPlayer(<ShadowMeet {...R3} levels={false} chains="flag" />);
    expect(html).toContain('data-sm-ask="flag"');
    expect(html).toMatch(/data-sm-check/);
    expect(html).toMatch(/aria-disabled="true"[^>]*data-sm-check|data-sm-check[^>]*aria-disabled="true"/);
    expect(html).not.toMatch(/<button[^>]*data-sm-check[^>]* disabled=""/);
    expect(html).toContain('data-template="gap"');            // the answer is typed in its own shape: AO = [ ] m
    expect(html).toContain('data-ghost="true"');              // the pole is not planted yet
    expect(html).not.toContain('4,95');
    expect(html).not.toMatch(rawKey);
  });

  it('a « ratio » step gives the measured shadow and asks the height in a template; the free round offers heights and hours', () => {
    const html = inPlayer(<ShadowMeet steps={[{ object: 'palm', height: '4,25', hour: '15:30', task: 'ratio', ask: 'type' }, { object: 'tower', height: '7,5', hour: '15:30', ask: 'type' }]} levels={false} />);
    expect(html).toContain('7,82 m');
    expect(html).toContain('data-sm-ask="type"');
    expect(html).toContain('data-sm-next');
    expect(html).not.toContain('4,25');
    const free = inPlayer(<ShadowMeet object="tower" height="5,75" hour="14:00" ask="type" levels={false} checkpoints={false} choices={{ heights: ['5,75', '6,75', '9,25'], hours: ['13:00', '13:30', '14:00', '14:30', '15:30', '16:00'] }} />);
    expect((free.match(/data-sm-choice="height:/g) ?? []).length).toBe(3);
    expect((free.match(/data-sm-choice="hour:/g) ?? []).length).toBe(6);
    expect((free.match(/aria-pressed="true"/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(free).not.toMatch(rawKey);
  });

  it('outside the player (page, teacher): the steps are shown, and the lab still renders', () => {
    const page = renderToString(<ShadowMeet {...R2} levels={false} />);
    expect(page).toContain('data-sm-step');
    expect(page).toContain('data-shadow-meet');
    expect(page).not.toMatch(rawKey);
    expect(renderToString(<ShadowMeet />)).toContain('data-manipulation="shadow-meet"');   // the bare lab, with its two levels
  });
});

describe('shadow-meet — the question chains', () => {
  it('chains: read (the lengths, the build) then rule; readEasy; same; flag; none', () => {
    expect(CHAINS.read.map((c) => [c.id, c.qs])).toEqual([['read', ['segFill', 'ratioBuild']], ['rule', ['rulePick']]]);
    expect(chainsOf('readEasy').map((c) => c.qs)).toEqual([['segFill']]);
    expect(chainsOf('same').map((c) => c.id)).toEqual(['same']);
    expect(chainsOf('flag').map((c) => c.id)).toEqual(['build']);
    expect(chainsOf('none')).toEqual([]);
    expect(chainsOf('nope')).toEqual([]);
  });

  it('« read » opens at the meet, « rule » only once the height is found', () => {
    let lab = L.init(R1);
    expect(CHAINS.read[0].reached(lab)).toBe(false);
    lab = meet(lab);
    expect(CHAINS.read[0].reached(lab)).toBe(true);
    expect(CHAINS.read[1].reached(lab)).toBe(false);
    lab = L.answer(lab, 275);
    expect(CHAINS.read[1].reached(lab)).toBe(true);
  });

  it('segFill: OB is the stick shadow, OA the whole shadow — BA (the segment) is the third chip', () => {
    const lab = meet(L.init(R1));
    const q = QUESTIONS.segFill(lab, k, OBJ);
    const s = L.cur(lab);
    expect(q.fields.map((f) => f.expected)).toEqual([L.m(s.OB), L.m(s.OA)]);
    expect([...q.fields[0].options].sort()).toEqual([L.m(s.OB), L.m(s.meetX), L.m(s.OA)].sort());
    expect(isCorrect(q, [L.m(s.OB), L.m(s.OA)])).toBe(true);
    expect(isCorrect(q, [L.m(s.meetX), L.m(s.OA)])).toBe(false);
    expect(text(q)).not.toMatch(rawKey);
  });

  it('ratioBuild: BE/AM is preset on the left; OB, OA and the decoy BA; the swapped equality is accepted, the segment one is not', () => {
    const lab = meet(L.init(R1));
    const q = QUESTIONS.ratioBuild(lab, k, OBJ);
    expect(q.preset).toEqual(['BE', 'AM', null, null]);
    expect(q.tiles.slice(0, 2)).toEqual(['BE', 'AM']);
    expect([...q.tiles.slice(2)].sort()).toEqual(['BA', 'OA', 'OB']);
    expect(isCorrect(q, ['BE', 'AM', 'OB', 'OA'])).toBe(true);
    expect(isCorrect(q, ['OB', 'OA', 'BE', 'AM'])).toBe(true);
    expect(isCorrect(q, ['BE', 'AM', 'OB', 'BA'])).toBe(false);
    expect(isCorrect(q, ['BE', 'AM', 'OA', 'OB'])).toBe(false);
    // the truth, in the lab's own centimetres: BE × OA = AM × OB, and BE × BA ≠ AM × OB
    const s = L.cur(lab);
    expect(L.STICK * s.OA).toBe(s.H * s.OB);
    expect(L.STICK * s.meetX).not.toBe(s.H * s.OB);
    expect(text(q)).not.toMatch(rawKey);
    // the decoy moves with the numbers
    const pos = [['2,75', '14:00'], ['1,5', '14:00'], ['6,5', '14:00'], ['5,75', '13:00']].map(([height, hour]) => QUESTIONS.ratioBuild(L.init({ height, hour }), k, OBJ).tiles.indexOf('BA'));
    expect(new Set(pos).size).toBeGreaterThan(1);
  });

  it('rulePick: one right sentence among three, and its place varies with the numbers', () => {
    const lab = L.answer(meet(L.init(R1)), 275);
    const q = QUESTIONS.rulePick(lab, k, OBJ);
    expect(q.options).toHaveLength(3);
    expect(q.options.filter((o) => o.correct)).toHaveLength(1);
    q.options.filter((o) => !o.correct).forEach((o) => expect(o.why).toBeTruthy());
    expect(text(q)).not.toMatch(rawKey);
    const places = ['1,5', '2,75', '6,5', '4,25', '9,25'].map((height) => QUESTIONS.rulePick(L.init({ height, hour: '14:00' }), k, OBJ).options.findIndex((o) => o.correct));
    expect(new Set(places).size).toBeGreaterThan(1);
  });

  it('sameWhat (two hours): the ratio OB/OA is the same, OB and OA are not', () => {
    let lab = L.init(R2);
    expect(CHAINS.same[0].reached(lab)).toBe(false);
    lab = meet(L.nextStep(L.answer(meet(lab), 650)));
    expect(CHAINS.same[0].reached(lab)).toBe(true);
    const [a, b] = lab.steps;
    expect(a.OB * b.OA).toBe(b.OB * a.OA);       // the same ratio, in cross products
    expect(a.OB).not.toBe(b.OB);
    expect(a.OA).not.toBe(b.OA);
    const q = QUESTIONS.sameWhat(lab, k, 'خزّان الماء');
    expect(q.options.filter((o) => o.correct)).toHaveLength(1);
    expect(renderToString(<div>{q.options.find((o) => o.correct).text}</div>)).toContain('13');   // 2/13
    expect(text(q)).not.toMatch(rawKey);
    expect(CHAINS.same[0].reached(meet(L.init(R1)))).toBe(false);   // a one-step round never asks it
  });

  it('flagBuild: the pole ratio equals the stick ratio BC/BE — the INVERTED ratio is a tile, never a number', () => {
    let lab = L.init(R3);
    expect(CHAINS.flag[0].reached(lab)).toBe(false);
    lab = L.answer(lab, 495);
    expect(CHAINS.flag[0].reached(lab)).toBe(true);
    const q = QUESTIONS.flagBuild(lab, k, 'السارية');
    expect(q.preset).toEqual(['AO/AM', null]);
    expect([...q.tiles.slice(1)].sort()).toEqual(['BC/AM', 'BC/BE', 'BE/BC']);
    expect(isCorrect(q, ['AO/AM', 'BC/BE'])).toBe(true);
    expect(isCorrect(q, ['BC/BE', 'AO/AM'])).toBe(true);
    expect(isCorrect(q, ['AO/AM', 'BE/BC'])).toBe(false);
    const s = L.cur(lab);
    expect(s.OA * L.STICK).toBe(s.H * s.OB);     // AO/AM = BC/BE in cross products
    expect(renderToString(<div>{ratioNode('BC/BE')}</div>)).toContain('katex');
    expect(text(q)).not.toMatch(rawKey);
    expect(text(q)).not.toMatch(/\$[^$]*\$[^$]*\$\$/);
  });
});

describe('shadow-meet — strings', () => {
  it('every string exists in Arabic, none interpolates `ns`', () => {
    expect(JSON.stringify(strings.shadowMeet)).not.toContain('{{ns}}');
    ['title', 'rays', 'hour', 'unknown', 'handle', 'check', 'plant', 'cueRight', 'cueWrong', 'journal', 'journalUnit', 'rowPending', 'choicesHeights', 'choicesHours',
      'col.hour', 'col.obj', 'col.shadow', 'col.stick', 'col.height', 'v.not', 'v.repeat', 'v.flagShort', 'v.flagLong',
      'predict.wrong', 'predict.stickSame.yes', 'predict.stickSame.no', 'predict.double.less', 'predict.double.exact', 'predict.double.more',
      'coach.drag', 'coach.tap', 'coach.type', 'coach.flag', 'coach.next', 'ask.line', 'ask.ratioLine', 'ask.flagLine', 'explanation',
      'cp.ratioBuild.slotSmall', 'cp.ratioBuild.slotBig', 'cp.flagBuild.slotStick']
      .forEach((key) => expect(k(key), key).not.toMatch(rawKey));
    ['lamp', 'tower', 'palm', 'pole', 'minaret'].forEach((id) => expect(k(`obj.${id}`), id).not.toMatch(rawKey));
    const o = { obj: OBJ, h: '16:00', n: 10, ob: '1,2', oa: '7,8' };
    ['mission.meet', 'mission.ratio', 'mission.flag', 'side.shade', 'side.sun', 'side.meet', 'nudgeToward', 'nudgeAway', 'next.hour', 'next.object', 'sayHour', 'sayObject', 'sayHeight',
      'waiting.meet', 'waiting.ratio', 'waiting.flag', 'v.right', 'v.meet', 'v.shade', 'v.sun', 'v.flagRight', 'ask.title', 'ask.flagTitle', 'hint1', 'hint2',
      'v.wrong.segment', 'v.wrong.additive', 'v.wrong.shadow', 'v.wrong.inverse', 'v.wrong.other', 'v.flag.inverse', 'v.flag.additive', 'v.flag.height', 'v.flag.other',
      'predict.stickSame.prompt', 'predict.double.prompt', 'cp.flagBuild.slotPole']
      .forEach((key) => expect(k(key, o), key).not.toMatch(rawKey));
    expect(k('predict.double.prompt', o)).toContain('7,8');
  });

  it('a PredictTray prompt holds no `$`; the ✓ / ✗ glyphs are never inside a string; no rule is written in a verdict', () => {
    Object.values(strings.shadowMeet.predict).filter((v) => typeof v === 'object').forEach((p) => expect(p.prompt).not.toContain('$'));
    expect(JSON.stringify(strings.shadowMeet)).not.toMatch(/[✓✗]/);
    Object.values(strings.shadowMeet.v.wrong).forEach((s) => expect(s).not.toMatch(/OB\s*\/\s*OA|\\dfrac/));
  });

  it('the predictions are worded for the truth the logic computes', () => {
    const lab = L.init(R2);
    ['stickSame', 'double'].forEach((key) => {
      const truth = L.predictTruth(lab, key);
      expect(L.predictOptions(key)).toContain(truth);
      expect(k(`predict.${key}.${truth}`)).not.toMatch(rawKey);
    });
  });
});

describe('shadow-meet — hideHeight and the « why » chain (the synthesis round, 2026-11-10)', () => {
  const MINARET = { object: 'minaret', height: '7,25', hour: '15:00' };
  it('the scene never writes the height, even when the meet solves the step', () => {
    const html = inPlayer(<ShadowMeet {...MINARET} levels={false} chains="why" hideHeight />);
    expect(html).toContain('data-sm-object="minaret"');
    expect(html).not.toContain('7,25');
    expect(html).not.toMatch(rawKey);
  });
  it('« why » is asked at the meet: three sentences, none with a number, the right one is the single ray', () => {
    expect(chainsOf('why').map((c) => c.id)).toEqual(['why']);
    const lab = meet(L.init(MINARET));
    expect(chainsOf('why')[0].reached(lab)).toBe(true);
    const q = QUESTIONS.whyMeet(lab, k, 'المئذنة');
    expect(q.kind).toBe('choice');
    expect(q.options).toHaveLength(3);
    const html = text(q);
    expect(html).not.toMatch(rawKey);
    q.options.forEach((o) => expect(renderToString(<span>{o.text}</span>)).not.toMatch(/\d/));
    expect(renderToString(<span>{q.options.find((o) => o.correct).text}</span>)).toContain(k('cp.whyMeet.right', { obj: 'المئذنة' }).slice(0, 12));
  });
});

describe('shadow-meet — the square becomes the figure (council of 2026-11-11, round 1 of talis-hisab-atwal)', () => {
  const lab = meet(L.init(R1));
  const step = L.cur(lab);
  const geo = L.layout(lab, { width: 560, height: 280, pad: 12, sky: 26, ground: 84 });
  const scene = (figure, parallel) => renderToString(<Scene geo={geo} lab={lab} step={step} side={L.sideOf(lab)} met solved={false} reduce unknown="؟" figure={figure} parallel={parallel} />);

  it('readFigure: read the lengths ON THE SQUARE, then the figure (parallels + why), then the equality (hypothesis before conclusion), then the rule', () => {
    expect(chainsOf('readFigure').map((c) => c.id)).toEqual(['read', 'figure', 'ratio', 'rule']);
    expect(CHAINS.readFigure.find((c) => c.id === 'figure').qs).toEqual(['parallelBuild', 'parallelWhy']);
    expect(chainsOf('read').map((c) => c.id)).toEqual(['read', 'rule']);   // the other users of « read » are unchanged
  });

  it('parallelBuild: four named lines as tiles, (AM) ∥ (BE) in either order; the lines that meet at O are refused', () => {
    const q = QUESTIONS.parallelBuild(lab, k, OBJ);
    expect([...q.tiles].sort()).toEqual(['(AM)', '(BE)', '(OA)', '(OM)']);
    expect(isCorrect(q, ['(AM)', '(BE)'])).toBe(true);
    expect(isCorrect(q, ['(BE)', '(AM)'])).toBe(true);
    expect(isCorrect(q, ['(OM)', '(OA)'])).toBe(false);
    expect(isCorrect(q, ['(AM)', '(OA)'])).toBe(false);
    expect(text(q)).not.toMatch(rawKey);
  });

  it('parallelWhy: the reason holds without ground or sun (two perpendiculars to one line); no option says « vertical » or « upright »', () => {
    const q = QUESTIONS.parallelWhy(lab, k, OBJ);
    expect(q.options.filter((o) => o.correct)).toHaveLength(1);
    const html = text(q);
    expect(html).not.toMatch(rawKey);
    expect(html).not.toMatch(/شاقولي|واقف|الأرض/);
    expect(renderToString(<div>{q.options.find((o) => o.correct).text}</div>)).toContain('عمودي');
  });

  it('the scene: the figure layer is off on the square; on, it draws [AM], [BE], (OM), (OA) and the right angles — the chevrons only once the student named the parallels', () => {
    expect(scene(false, false)).toContain('data-sm-geo="off"');
    const on = scene(true, false);
    expect(on).toContain('data-sm-geo="on"');
    ['AM', 'BE', 'OM', 'OA'].forEach((n) => expect(on).toContain(`data-sm-geo-line="${n}"`));
    expect((on.match(/data-sm-geo-right/g) ?? []).length).toBe(2);
    expect(on).not.toContain('data-sm-geo-parallel');
    expect((scene(true, true).match(/data-sm-geo-parallel/g) ?? []).length).toBe(2);
  });

  it('the morph toggle strings exist', () => {
    expect(k('morph.toScene')).not.toMatch(rawKey);
    expect(k('morph.toFigure')).not.toMatch(rawKey);
  });
});

