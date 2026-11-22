import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import SegmentDivider from './SegmentDivider';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';
import i18n from '../../../../i18n';
import * as L from '../logic/segmentDivider';

/**
 * segment-divider se rend aux deux niveaux de levels.js (3 parts égales ; MA/MB = 3/2), seul, sans
 * niveaux (levels={false}, دوري الآن 2/5) et dans le workspace — sans clé i18n brute ni interpolation oubliée.
 */
const RAW = /manipulation\.[a-zA-Z]/;

describe('segment-divider — rendu', () => {
  it('beginner (equal): the ray, its angle handle, one ghost mark, the compass, the glance block', () => {
    const html = renderToString(<SegmentDivider {...LEVELS['segment-divider'].beginner.numbers} theme="tifo" />);
    expect(html).toContain('data-segment-divider');
    expect(html).toContain('data-mode="equal"');
    expect(html).toContain('data-step="ray"');
    expect(html).toContain('data-sd-glance');
    expect(html).toContain('data-sd-angle="40"');
    expect(html).toContain('data-sd-ghost="ray"');
    expect(html).toContain('data-sd-open="15"');
    expect(html).toContain('data-deco="tifo"');
    expect(html).toContain('لافتة التيفو');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('advanced (ratio): two parallels, four ghost rails, no ruler before marks', () => {
    const html = renderToString(<SegmentDivider {...LEVELS['segment-divider'].advanced.numbers} theme="tifo" />);
    expect(html).toContain('data-mode="ratio"');
    for (const rail of ['a+', 'a-', 'b+', 'b-']) expect(html).toContain(`data-sd-ghost="${rail}"`);
    expect(html).not.toContain('data-sd-end=');
    expect(html).toContain('(d₁)');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('a single level (levels={false}) — دوري الآن 2/5: no selector', () => {
    const html = renderToString(<SegmentDivider mode="ratio" p={2} q={5} marks={5} levels={false} />);
    expect(html).toContain('data-mode="ratio"');
    expect(html).not.toContain('data-manipulation-levels-selector');
    expect(html).not.toMatch(RAW);
  });

  it('inside a workspace: both levels mounted, one selector', () => {
    const html = renderToString(
      <ManipulationWorkspace levels={{
        beginner: () => <SegmentDivider level="beginner" parts={3} theme="tifo" />,
        advanced: () => <SegmentDivider level="advanced" mode="ratio" p={3} q={2} marks={5} theme="tifo" />,
      }} />,
    );
    expect((html.match(/data-segment-divider/g) ?? []).length).toBe(2);
    expect((html.match(/data-manipulation-levels-selector/g) ?? []).length).toBe(1);
    expect(html).not.toMatch(RAW);
  });
});

const k = (key, o) => i18n.t(`lesson:manipulation.segmentDivider.${key}`, o);
const times = (n, f, s) => { let x = s; for (let i = 0; i < n; i += 1) x = f(x); return x; };
/** Une construction `equal` complète : `n` marques, la marque `joined` reliée, une parallèle par marque avant elle. */
function build(s0, n, joined) {
  let s = times(n, (x) => L.carry(x), s0);
  s = L.join(s, joined);
  for (let i = 0; i < joined; i += 1) { s = L.setSlide(s, L.rayMarks(s)[i].pos); s = L.draw(s); }
  return s;
}
/** Un point `ratio` : marque de rang ra sur d₁ (haut), rang rb sur d₂ (bas si `across`, haut sinon). */
function ruler(s0, ra, rb, across) {
  let s = s0;
  s = times(ra, (x) => L.carry(x, 'a+'), s);
  s = times(rb, (x) => L.carry(x, across ? 'b-' : 'b+'), s);
  const op = s.opening;
  s = L.setEnd(s, 'a', ra * op); s = L.setEnd(s, 'b', (across ? -1 : 1) * rb * op);
  return L.commitRuler(s);
}

describe('segment-divider — questions pendant le labo (LabCheckpoint)', () => {
  const check = async (lab, mode) => {
    const { chainOf, QUESTIONS } = await import('./SegmentDivider');
    for (const step of L.stepsOf(mode)) {
      expect(L.stepReached(lab, step), `${mode}.${step} atteinte`).toBe(true);
      const chain = chainOf(step, mode);
      expect(chain.length).toBeGreaterThanOrEqual(2);
      for (const qid of chain) {
        const q = QUESTIONS[qid](lab, step, k);
        const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
        expect(out, `${mode}.${qid}`).not.toMatch(RAW);
        expect(out, `${mode}.${qid}`).not.toContain('{{');
        expect(q.hints, `${mode}.${qid}`).toHaveLength(2);
        expect(q.options.filter((o) => o.correct), `${mode}.${qid}`).toHaveLength(1);
        expect(q.options.length, `${mode}.${qid}`).toBeGreaterThanOrEqual(2);
        expect(q.options.filter((o) => !o.correct).every((o) => o.why), `${mode}.${qid} why`).toBe(true);
      }
    }
  };

  it('equal : les trois étapes (avec un essai raté, puis avec deux essais justes), toutes les questions', async () => {
    const base = L.init({ mode: 'equal', parts: 3 });
    // un essai juste, puis un essai raté (la 2e marque reliée : 2 parts)
    let a = build(base, 3, 2);
    expect(a.trials[0].ok).toBe(true);
    a = build(L.fresh(a), 3, 1);
    expect(a.trials.map((t) => t.kind)).toEqual(['ok', 'count']);
    await check(a, 'equal');
    // deux essais justes d'ouvertures différentes
    let b = build(base, 3, 2);
    b = L.fresh(b); b = L.setOpening(b, b.opening + 5); b = build(b, 3, 2);
    expect(L.discoveryReady(b)).toBe(true);
    await check(b, 'equal');
  });

  it('ratio : un 1er point (dedans) puis les deux points (dehors), toutes les questions', async () => {
    let s = L.init({ mode: 'ratio', p: 3, q: 2, marks: 5 });
    s = ruler(s, 3, 2, true);
    expect(s.joins.at(-1).kind).toBe('inside');
    expect(L.stepReached(s, 'one')).toBe(true);
    expect(L.stepReached(s, 'two')).toBe(false);
    s = L.fresh(s);
    s = ruler(s, 3, 2, false);
    expect(s.joins.at(-1).kind).toBe('outside');
    await check(s, 'ratio');
  });

  it('mode guidé : ni la progression ni le bouton d’indice, mais les étapes ; la même étape repart', () => {
    const html = renderToString(<SegmentDivider {...LEVELS['segment-divider'].beginner.numbers} level="beginner" />);
    expect(html).not.toContain('data-manipulation-progress');
    expect(html).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(html).toContain('data-lab-stepper');
    let a = build(build(L.init({ mode: 'equal', parts: 3 }), 3, 2), 3, 1);
    a = build(L.fresh(a), 3, 1);
    const r = L.retryStage(a, 'contrast');
    expect(r.trials).toHaveLength(1);
    expect(L.stepReached(r, 'built') && !L.stepReached(r, 'contrast')).toBe(true);
    expect(L.retryStage(a, 'built').trials).toHaveLength(0);
    expect(L.markCount(L.retryStage(a, 'marks'))).toBe(0);
  });
});
