import { describe, expect, it } from 'vitest';
import {
  featureState, isToolVisible, refusalFromError, toolFeatureKey, withRefusal, DOCUMENTS_FEATURE,
} from './featureAccess';

const summary = {
  tier: 'free',
  features: {
    'math_lab.tool.whiteboard': { enabled: true, allowed: true, reason: 'ok', quota: null },
    'math_lab.tool.logic': { enabled: true, allowed: false, reason: 'premium_required', quota: null },
    'math_lab.tool.conics': { enabled: false, allowed: false, reason: 'feature_disabled', quota: null },
    'math_lab.documents': {
      enabled: true, allowed: true, reason: 'ok',
      quota: { usageType: 'document_generation', used: 2, limit: 3, remaining: 1, unlimited: false, period: 'month', resetsAt: null },
    },
    notebook: {
      enabled: true, allowed: true, reason: 'ok',
      quota: { usageType: 'notebook_copy', used: 9, limit: null, remaining: null, unlimited: true, period: 'month', resetsAt: null },
    },
  },
};

describe('featureAccess — lecture du résumé serveur', () => {
  it('ne ferme rien tant que le résumé est inconnu', () => {
    expect(featureState(null, toolFeatureKey('logic'))).toMatchObject({ known: false, allowed: true, canCreate: true });
  });

  it('lit le cadenas et le motif tels que le serveur les donne', () => {
    expect(featureState(summary, toolFeatureKey('whiteboard')).allowed).toBe(true);
    expect(featureState(summary, toolFeatureKey('logic'))).toMatchObject({ allowed: false, reason: 'premium_required' });
  });

  it('retire de l’accueil un instrument coupé globalement, garde un instrument verrouillé', () => {
    expect(isToolVisible(summary, 'conics')).toBe(false);
    expect(isToolVisible(summary, 'logic')).toBe(true);
    expect(isToolVisible(summary, 'unknown')).toBe(true);
  });

  it('sait si une création reste possible, illimité compris', () => {
    expect(featureState(summary, DOCUMENTS_FEATURE).canCreate).toBe(true);
    expect(featureState(summary, 'notebook').canCreate).toBe(true);
    const exhausted = withRefusal(summary, { reason: 'quota_exceeded', feature: DOCUMENTS_FEATURE, quota: { ...summary.features[DOCUMENTS_FEATURE].quota, used: 3, remaining: 0 } });
    expect(featureState(exhausted, DOCUMENTS_FEATURE)).toMatchObject({ allowed: true, canCreate: false, reason: 'quota_exceeded' });
  });

  it('reconnaît un refus d’accès dans une erreur de service, et seulement lui', () => {
    const error = { code: 'premium_required', data: { code: 'premium_required', access: { feature: 'math_lab.tool.logic', quota: null } } };
    expect(refusalFromError(error)).toEqual({ reason: 'premium_required', feature: 'math_lab.tool.logic', quota: null });
    expect(refusalFromError({ code: 'math_lab_document_too_large' })).toBeNull();
    expect(refusalFromError(null)).toBeNull();
  });

  it('ne contient aucune règle de palier', async () => {
    const { readFileSync } = await import('node:fs');
    const source = readFileSync(new URL('./featureAccess.js', import.meta.url), 'utf8');
    expect(source).not.toMatch(/=== ['"]premium['"]/);
    expect(source).not.toMatch(/tier\s*===/);
  });
});
