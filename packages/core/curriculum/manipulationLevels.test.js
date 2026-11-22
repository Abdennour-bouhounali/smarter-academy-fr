import { describe, it, expect } from 'vitest';
import {
  MANIPULATION_LEVEL_IDS, DEFAULT_MANIPULATION_LEVEL, EXPERIENCE_TYPES, ADAPTATION_REASONS,
  VISUAL_THEME_IDS, manipulationExperience, checkExperience, checkLevelPair, resolveLevelId,
} from './manipulationLevels.js';

/**
 * Ce que ces tests verrouillent : la mathématique vient TOUJOURS du manuel,
 * un contexte remplacé dit toujours pourquoi, et « avancé » n'est jamais
 * « débutant avec de plus grands nombres ».
 */

describe('les deux niveaux', () => {
  it('sont exactement deux, et le défaut est le débutant', () => {
    expect(MANIPULATION_LEVEL_IDS).toEqual(['beginner', 'advanced']);
    expect(DEFAULT_MANIPULATION_LEVEL).toBe('beginner');
  });

  it('un identifiant inconnu retombe sur le débutant, jamais sur rien', () => {
    expect(resolveLevelId('expert')).toBe('beginner');
    expect(resolveLevelId(undefined)).toBe('beginner');
    expect(resolveLevelId('advanced')).toBe('advanced');
  });
});

describe('traçabilité — jamais un remplacement silencieux', () => {
  it('une expérience cite la source du manuel et déclare ce qu’elle a fait', () => {
    const exp = manipulationExperience({
      sourceElementId: 'act-1', page: 8, type: 'platform_context',
      reason: 'improved_interactivity_and_age_appropriateness', theme: 'football',
    });
    expect(exp.source).toEqual({ type: 'textbook', elementId: 'act-1', page: 8 });
    expect(exp.experience.theme).toBe('football');
    expect(checkExperience(exp)).toEqual([]);
  });

  it('un contexte gardé tel quel n’a besoin d’aucune raison', () => {
    const exp = manipulationExperience({ sourceElementId: 'act-4', page: 8, type: 'textbook' });
    expect(checkExperience(exp)).toEqual([]);
  });

  it('un contexte REMPLACÉ sans raison est un défaut', () => {
    const exp = manipulationExperience({ sourceElementId: 'act-1', type: 'platform_context' });
    expect(checkExperience(exp).join(' ')).toMatch(/must carry one of these reasons/);
  });

  it('une raison ou un thème hors énumération est refusé', () => {
    expect(checkExperience({ source: { type: 'textbook', elementId: 'act-1' }, experience: { type: 'platform_context', reason: 'parce que' } }).length).toBe(1);
    expect(checkExperience({ source: { type: 'textbook', elementId: 'act-1' }, experience: { type: 'platform_context', reason: ADAPTATION_REASONS[0], theme: 'dragons' } }).join(' ')).toMatch(/unknown visual theme/);
  });

  it('une expérience sans source du manuel est refusée — la mathématique vient toujours du manuel', () => {
    expect(checkExperience({ experience: { type: 'textbook' } }).join(' ')).toMatch(/must cite a textbook elementId/);
    expect(EXPERIENCE_TYPES).toContain('platform_adaptation');
    expect(VISUAL_THEME_IDS).toContain('football');
  });
});

describe('checkLevelPair — la forme d’un couple débutant / avancé', () => {
  const ok = {
    beginner: {
      objective: 'b قاسم لـ a ⇔ الباقي معدوم',
      numbers: { total: 15, groups: 3 },
      autonomy: undefined,
      ...manipulationExperience({ sourceElementId: 'act-1', page: 8, type: 'platform_context', reason: 'smaller_numbers_for_first_contact', theme: 'football' }),
    },
    advanced: {
      objective: 'b قاسم لـ a ⇔ الباقي معدوم',
      numbers: { total: 420, groups: 28 },
      autonomy: 'لا اقتراحات: التلميذ يختار الحجم بنفسه ويقارن عدة محاولات',
      ...manipulationExperience({ sourceElementId: 'act-1', page: 8, type: 'textbook' }),
    },
  };

  it('accepte un couple complet et cohérent', () => {
    expect(checkLevelPair(ok)).toEqual([]);
  });

  it('refuse un niveau manquant — jamais un seul niveau', () => {
    expect(checkLevelPair({ beginner: ok.beginner }).join(' ')).toMatch(/missing 'advanced' level/);
  });

  it('refuse deux objectifs différents : le contexte change, l’objectif non', () => {
    const bad = { ...ok, advanced: { ...ok.advanced, objective: 'شيء آخر تمامًا' } };
    expect(checkLevelPair(bad).join(' ')).toMatch(/SAME mathematical objective/);
  });

  it('refuse un « avancé » qui ne dit pas ce qu’il exige de plus', () => {
    const bad = { ...ok, advanced: { ...ok.advanced, autonomy: '' } };
    expect(checkLevelPair(bad).join(' ')).toMatch(/not an advanced level/);
  });
});
