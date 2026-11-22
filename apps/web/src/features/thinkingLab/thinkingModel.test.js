import { describe, it, expect } from 'vitest';
import { mathRuns, whenLabel, stateLines, errorKey, phaseOf, draftReady } from './thinkingModel';

describe('mathRuns — îlots LTR dans un texte arabe', () => {
  it('isole les formules et garde l\'arabe', () => {
    const runs = mathRuns('احسب x² + 1/x² إذا كان x + 1/x = 3.');
    expect(runs.filter((r) => r.math).map((r) => r.text)).toEqual(['x² + 1/x²', 'x + 1/x = 3']);
    expect(runs.map((r) => r.text).join('')).toBe('احسب x² + 1/x² إذا كان x + 1/x = 3.');
  });

  it('un nombre seul, une unité, un pourcentage', () => {
    expect(mathRuns('حائط 5 m و 20 %').filter((r) => r.math).map((r) => r.text)).toEqual(['5 m', '20 %']);
  });

  it('une parenthèse arabe reste du texte, une formule entre parenthèses est un îlot', () => {
    expect(mathRuns('بين الأقواس الأربعة (في وسط المربّع) بدلالة x.').filter((r) => r.math).map((r) => r.text)).toEqual(['x']);
    expect(mathRuns('احسب (x + 1)² الآن').filter((r) => r.math).map((r) => r.text)).toEqual(['(x + 1)²']);
  });

  it('les points de suspension restent dans la formule', () => {
    expect(mathRuns('عُدّ بنظام: (7 − 1) + (7 − 2) + … + 1.').filter((r) => r.math).map((r) => r.text)).toEqual(['(7 − 1) + (7 − 2) + … + 1']);
  });

  it('les fractions unicode font partie de la formule', () => {
    expect(mathRuns('قطعة = قطاع − مثلّث = ½x²(π/6 − ½)').filter((r) => r.math).map((r) => r.text)).toEqual(['½x²(π/6 − ½)']);
  });

  it('garde les sauts de ligne', () => {
    expect(mathRuns('(1) a = b\n(2) a² = ab').map((r) => r.text).join('')).toBe('(1) a = b\n(2) a² = ab');
  });
});

describe('whenLabel — à l\'heure d\'Alger', () => {
  const now = new Date('2026-11-02T08:00:00Z'); // 09:00 à Alger
  it('aujourd\'hui, demain, plus tard', () => {
    expect(whenLabel('2026-11-02T15:30:00Z', now)).toBe('اليوم 16:30');
    expect(whenLabel('2026-11-03T08:40:00Z', now)).toBe('غدًا 09:40');
    expect(whenLabel('2026-11-05T08:40:00Z', now)).toBe('05/11/2026 09:40');
  });
});

describe('stateLines — l\'état en mots', () => {
  const base = { status: 'trying', attemptsCounted: 2, attemptsToUnlock: 3, thinkHours: 24, canReplay: false, unlockAt: null };
  it('en cours, avant la 3ᵉ tentative', () => {
    expect(stateLines(base)).toEqual([{ key: 'state.attempts', params: { count: 2, total: 3 } }, { key: 'state.thinkDay' }]);
  });
  it('les 3 tentatives faites : l\'heure d\'ouverture', () => {
    const lines = stateLines({ ...base, attemptsCounted: 3, unlockAt: '2026-11-03T08:40:00Z' }, new Date('2026-11-02T08:00:00Z'));
    expect(lines[1]).toEqual({ key: 'state.opensAt', params: { when: 'غدًا 09:40' } });
  });
  it('résolu seul, appris, jumeau', () => {
    expect(stateLines({ status: 'solved', outcome: 'alone' })).toEqual([{ key: 'state.solvedAlone' }]);
    expect(stateLines({ status: 'learned', outcome: 'twin' })).toEqual([{ key: 'state.twin' }]);
  });
});

describe('aides', () => {
  it('raisons inconnues → générique ; phases inconnues → S ; jamais de rouge', () => {
    expect(errorKey('locked')).toBe('locked');
    expect(errorKey('boom')).toBe('generic');
    expect(phaseOf('Z').sign).toBe('S');
    for (const code of 'SMARTOB') expect(phaseOf(code).tone).not.toMatch(/red|rose/);
  });
  it('brouillon', () => {
    expect(draftReady({ minDraftChars: 12 }, 'قصير')).toBe(false);
    expect(draftReady({ minDraftChars: 12 }, 'جرّبت فكرة جديدة هنا')).toBe(true);
    expect(draftReady({ minDraftChars: 0 }, '')).toBe(true);
  });
});
