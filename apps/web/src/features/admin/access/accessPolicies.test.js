import { describe, expect, it } from 'vitest';
import { MATH_LAB_TOOLS } from '../../mathlab/toolRegistry';
import { isDirty, isRestrictive, toDraft, toPayload, toolLabelKey, toolDescriptionKey } from './accessPolicies';

const notebook = {
  key: 'notebook', hasQuota: true, enabled: true, period: 'month',
  free: { allowed: true, unlimited: false, limit: 50 },
  premium: { allowed: true, unlimited: true, limit: null },
};
const tool = {
  key: 'math_lab.tool.logic', hasQuota: false, enabled: true, period: 'month',
  free: { allowed: false, unlimited: null, limit: null },
  premium: { allowed: true, unlimited: null, limit: null },
};

describe('accessPolicies — éditeur « الوصول والحدود »', () => {
  it('nomme chaque instrument par la convention du catalogue mathlab', () => {
    for (const t of MATH_LAB_TOOLS) {
      expect(t.labelKey).toBe(toolLabelKey(t.id));
      expect(t.descriptionKey).toBe(toolDescriptionKey(t.id));
    }
  });

  it('fait l’aller-retour ligne → brouillon → corps, « illimité » explicite', () => {
    const { body, errorKey } = toPayload(notebook, toDraft(notebook));
    expect(errorKey).toBeNull();
    expect(body).toEqual({
      enabled: true,
      free: { allowed: true, unlimited: false, limit: 50 },
      premium: { allowed: true, unlimited: true },
      period: 'month',
    });
    expect(toPayload(tool, toDraft(tool)).body).toEqual({ enabled: true, free: { allowed: false }, premium: { allowed: true } });
  });

  it('refuse une limite négative, vide ou décimale avant d’envoyer', () => {
    for (const limit of ['-1', '', '2.5', 'abc']) {
      const draft = toDraft(notebook);
      draft.free.limit = limit;
      expect(toPayload(notebook, draft).errorKey).toBe('access.errors.limitInvalid');
    }
  });

  it('demande confirmation pour ce qui ferme, pas pour ce qui ouvre', () => {
    const lower = toDraft(notebook); lower.free.limit = '10';
    const raise = toDraft(notebook); raise.free.limit = '80';
    const capPremium = toDraft(notebook); capPremium.premium = { allowed: true, unlimited: false, limit: '500' };
    const lifetime = toDraft(notebook); lifetime.period = 'lifetime';
    const off = toDraft(tool); off.enabled = false;
    const open = toDraft(tool); open.free.allowed = true;

    expect(isRestrictive(notebook, lower)).toBe(true);
    expect(isRestrictive(notebook, raise)).toBe(false);
    expect(isRestrictive(notebook, capPremium)).toBe(true);
    expect(isRestrictive(notebook, lifetime)).toBe(true);
    expect(isRestrictive(tool, off)).toBe(true);
    expect(isRestrictive(tool, open)).toBe(false);
    expect(isDirty(tool, open)).toBe(true);
    expect(isDirty(tool, toDraft(tool))).toBe(false);
  });
});
