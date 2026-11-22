import { describe, it, expect } from 'vitest';
import { buildStorySteps, STORY_LENGTH } from './storySteps.js';
import { INVESTIGATIONS, getInvestigation } from './investigations.js';
import * as R from './ruleEngine.js';
import mathlabAr from '../../../../i18n/locales/ar/mathlab.json';

const story = mathlabAr.tools.measurement.story;
const lookup = (key) => key.split('.').reduce((node, part) => node?.[part], mathlabAr.tools.measurement);

describe('buildStorySteps — « كيف ظهرت هذه القاعدة؟ » pas à pas', () => {
  it('sept étapes, la règle en DERNIER, jamais avant', () => {
    for (const investigation of INVESTIGATIONS) {
      const { ok, steps } = buildStorySteps(investigation);
      expect(ok).toBe(true);
      expect(steps).toHaveLength(STORY_LENGTH);
      expect(steps.at(-1).kind).toBe('result');
      expect(steps.slice(0, -1).every((step) => step.kind === 'stage' && !step.rule)).toBe(true);
      // Chaque étape a un texte : le récit de l'enquête, ou le générique.
      for (const step of steps) {
        expect(typeof (lookup(step.textKey) ?? lookup(step.fallbackKey))).toBe('string');
      }
    }
  });

  it('avant la découverte : le dernier pas ne donne PAS la formule (§23)', () => {
    const investigation = getInvestigation('rectangle-area');
    const last = buildStorySteps(investigation, { found: false, rule: investigation.solution }).steps.at(-1);
    expect(last.rule).toBeUndefined();
    expect(last.noteKey).toBe('story.ruleAwaits');
  });

  it('après la découverte : le dernier pas est la règle de l’élève', () => {
    const investigation = getInvestigation('rectangle-area');
    const rule = R.operation('*', R.variable('length'), R.variable('width'));
    const last = buildStorySteps(investigation, { found: true, rule }).steps.at(-1);
    expect(last.rule).toBe('A = L × l');
    expect(last.noteKey).toBe('story.ruleFound');

    const circle = getInvestigation('circle-circumference');
    expect(buildStorySteps(circle, { found: true, rule: R.operation('*', R.constant('pi'), R.variable('diameter')) }).steps.at(-1).rule)
      .toBe('C = π × d');
  });

  it('déterministe, vide sans enquête', () => {
    const investigation = getInvestigation('triangle-area');
    expect(buildStorySteps(investigation)).toEqual(buildStorySteps(investigation));
    expect(buildStorySteps(null)).toEqual({ ok: false, steps: [] });
  });

  it('les notes du dernier pas existent en arabe', () => {
    expect(typeof story.ruleAwaits).toBe('string');
    expect(typeof story.ruleFound).toBe('string');
  });
});
