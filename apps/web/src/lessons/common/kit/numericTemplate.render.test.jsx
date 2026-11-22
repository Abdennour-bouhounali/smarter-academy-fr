import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { parseDec } from '@smarter-academy/core';

/**
 * « الإجابة تُكتب في شكلها » dans une étape de leçon : NumericQuestion avec `template` (2026-11-10).
 *
 * Ce dépôt n'a PAS d'environnement DOM pour vitest (ni jsdom ni test-renderer) : le composant est donc exécuté par un mini-moteur de
 * hooks (useState / useRef / useEffect / useId, effets joués après chaque rendu) et on lit l'ARBRE d'éléments qu'il rend — les gestes
 * sont les props des éléments (onChange, onEnter, onKeyDown), comme React les appellerait. Les composants enfants ne sont pas exécutés.
 */
const rt = vi.hoisted(() => {
  const r = { cells: [], cursor: 0, effects: [] };
  r.useState = (init) => {
    const i = r.cursor; r.cursor += 1;
    if (!(i in r.cells)) r.cells[i] = typeof init === 'function' ? init() : init;
    return [r.cells[i], (v) => { r.cells[i] = typeof v === 'function' ? v(r.cells[i]) : v; }];
  };
  r.useRef = (init) => r.useState(() => ({ current: init }))[0];
  r.useEffect = (fn, deps) => {
    const i = r.cursor; r.cursor += 1;
    const prev = r.cells[i];
    if (!prev || !deps || deps.some((d, k) => d !== prev[k])) { r.cells[i] = deps ?? []; r.effects.push(fn); }
  };
  r.useId = () => 'id';
  /** rend jusqu'à ce qu'aucun effet ne reste à jouer (un effet peut poser un état) */
  r.render = (Component, props) => {
    let el = null;
    for (let pass = 0; pass < 6; pass += 1) {
      r.cursor = 0;
      el = Component(props);
      const run = r.effects.splice(0);
      run.forEach((fn) => fn());
      if (!run.length) break;
    }
    return el;
  };
  r.reset = () => { r.cells = []; r.effects = []; r.cursor = 0; };
  return r;
});
const memory = vi.hoisted(() => ({ saved: null, save: null }));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useState: rt.useState, useRef: rt.useRef, useEffect: rt.useEffect, useId: rt.useId };
});
vi.mock('react-i18next', async (importOriginal) => ({ ...(await importOriginal()), useTranslation: () => ({ t: (key) => key }) }));
vi.mock('../answers/useSavedAnswer', () => ({ useSavedAnswer: () => memory }));
vi.mock('./kitContext', () => ({ useKit: () => ({ react: () => {} }), KitContext: { Provider: () => null } }));

const { NumericQuestion } = await import('./questions');
const { default: TemplateInput } = await import('../../../features/practice/answerTemplates/TemplateInput');
const { Feedback, NumberField } = await import('../components/LessonUI');
const { stepTemplate } = await import('../problems/guidedProblem');

/** tous les éléments de l'arbre (sans exécuter les composants) */
function all(node, out = []) {
  if (Array.isArray(node)) node.forEach((n) => all(n, out));
  else if (React.isValidElement(node)) { out.push(node); all(node.props.children, out); }
  return out;
}
const byType = (el, type) => all(el).filter((n) => n.type === type);
const text = (node) => (Array.isArray(node) ? node.map(text).join('') : React.isValidElement(node) ? text(node.props.children) : node == null || node === false ? '' : String(node));

const QUANTITY = stepTemplate({ kind: 'numeric', shape: 'quantity', unit: 'm' });

beforeEach(() => { rt.reset(); memory.saved = null; memory.save = vi.fn(); });

describe('NumericQuestion with a template', () => {
  it('draws the answer in its shape instead of the bare box, and Enter validates it (parse / check / saved answer kept)', () => {
    const onAnswered = vi.fn();
    const props = { prompt: 'ارتفاع المئذنة', expected: 7.25, parse: parseDec, display: '7,25', template: QUANTITY, onAnswered };
    let el = rt.render(NumericQuestion, props);
    expect(byType(el, NumberField)).toHaveLength(0);
    const input = byType(el, TemplateInput);
    expect(input).toHaveLength(1);
    expect(input[0].props.template).toEqual({ kind: 'quantity', unit: 'm', signed: false });
    expect(input[0].props.ariaLabel).toBe('ارتفاع المئذنة');

    // Entrée sur une case vide : rien
    input[0].props.onEnter();
    expect(onAnswered).not.toHaveBeenCalled();

    // l'élève tape 7,25 puis Entrée
    input[0].props.onChange({ value: '7,25' });
    el = rt.render(NumericQuestion, props);
    byType(el, TemplateInput)[0].props.onEnter();
    expect(onAnswered).toHaveBeenCalledWith(true, 7.25);
    expect(memory.save).toHaveBeenCalledWith('7,25');

    el = rt.render(NumericQuestion, props);
    expect(byType(el, TemplateInput)).toHaveLength(0);
    expect(byType(el, Feedback)[0].props.tone).toBe('ok');
  });

  it('a wrong value is revealed like before: the student answer, then the right one', () => {
    const onAnswered = vi.fn();
    const props = { prompt: 'p', expected: 7.25, parse: parseDec, display: '7,25', template: QUANTITY, onAnswered };
    let el = rt.render(NumericQuestion, props);
    byType(el, TemplateInput)[0].props.onChange({ value: '14,5' });
    el = rt.render(NumericQuestion, props);
    byType(el, TemplateInput)[0].props.onEnter();
    el = rt.render(NumericQuestion, props);
    const feedback = byType(el, Feedback)[0];
    expect(feedback.props.tone).toBe('ko');
    expect(text(feedback)).toContain('14,5');
    expect(text(feedback)).toContain('7,25');
    expect(onAnswered).toHaveBeenCalledWith(false, 14.5);
  });

  it('the saved answer is restored on return: revealed once, without typing', () => {
    memory.saved = { v: '7,25', at: 1700000000000 };
    const onAnswered = vi.fn();
    const el = rt.render(NumericQuestion, { prompt: 'p', expected: 7.25, parse: parseDec, display: '7,25', template: QUANTITY, onAnswered });
    expect(byType(el, TemplateInput)).toHaveLength(0);
    expect(byType(el, Feedback)[0].props.tone).toBe('ok');
    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith(true, 7.25);
    expect(memory.save).not.toHaveBeenCalled();
  });

  it('without a template nothing changes: the bare box with its prefix and suffix', () => {
    const el = rt.render(NumericQuestion, { prompt: 'p', expected: 3, prefix: 'x =', suffix: 'cm' });
    expect(byType(el, TemplateInput)).toHaveLength(0);
    expect(byType(el, NumberField)).toHaveLength(1);
    expect(text(el)).toContain('x =');
    expect(text(el)).toContain('cm');
  });
});

describe('TemplateInput — onEnter and the accessible name', () => {
  const inputs = (el) => all(el).filter((n) => n.type === 'input');
  it('Enter in the box calls onEnter; another key does not', () => {
    const onEnter = vi.fn();
    const el = rt.render(TemplateInput, { template: QUANTITY, onChange: () => {}, onEnter, ariaLabel: 'ارتفاع المئذنة' });
    const [box] = inputs(el);
    expect(box.props['aria-label']).toBe('ارتفاع المئذنة');
    box.props.onKeyDown({ key: 'a' });
    expect(onEnter).not.toHaveBeenCalled();
    box.props.onKeyDown({ key: 'Enter' });
    expect(onEnter).toHaveBeenCalledTimes(1);
  });
  it('without onEnter / ariaLabel the box is the one the practice screens already have', () => {
    const el = rt.render(TemplateInput, { template: QUANTITY, onChange: () => {} });
    const [box] = inputs(el);
    expect(box.props.onKeyDown).toBeUndefined();
    expect(box.props['aria-label']).toBe('practice.template.quantity');
  });
  it('the unit is printed beside the box and the row never wraps (a formula never breaks across two lines)', () => {
    for (const step of [
      { kind: 'numeric', shape: 'quantity', unit: 'دج' },
      { kind: 'numeric', shape: 'form', subject: 'V', factor: '\\pi' },
      { kind: 'numeric', shape: 'gap', subject: 'AM \\times AC' },
      { kind: 'numeric', shape: 'decimal' },
    ]) {
      rt.reset();
      const tpl = stepTemplate(step);
      const el = rt.render(TemplateInput, { template: tpl, onChange: () => {} });
      const row = all(el).find((n) => n.props['data-template'] === tpl.kind);
      expect(row.props.className).toContain('flex-nowrap');
      expect(row.props.dir).toBe('ltr');
      expect(inputs(el)).toHaveLength(1);
      if (step.unit) expect(text(el)).toContain(step.unit);
      if (step.subject) expect(text(el)).toContain(step.subject);
      if (step.factor) expect(text(el)).toContain(step.factor);
    }
  });
});
