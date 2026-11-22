import { describe, it, expect } from 'vitest';
import { mathRuns, whenLabel, stateLines, errorKey, phaseOf, draftReady } from './thinkingModel';

describe('mathRuns — les îlots mathématiques d’un texte français', () => {
  it('isole les formules et garde le texte', () => {
    const runs = mathRuns('Calcule x² + 1/x² sachant que x + 1/x = 3.');
    expect(runs.filter((r) => r.math).map((r) => r.text)).toEqual(['x² + 1/x²', 'x + 1/x = 3']);
    expect(runs.map((r) => r.text).join('')).toBe('Calcule x² + 1/x² sachant que x + 1/x = 3.');
  });

  it('un nombre seul, une unité, un pourcentage', () => {
    expect(mathRuns('Un mur de 5 m et 20 %').filter((r) => r.math).map((r) => r.text)).toEqual(['5 m', '20 %']);
  });

  it('une parenthèse de texte reste du texte, une formule entre parenthèses est un îlot', () => {
    expect(mathRuns('entre les quatre arcs (au centre du carré) en fonction de x.').filter((r) => r.math).map((r) => r.text)).toEqual(['x']);
    expect(mathRuns('Calcule (x + 1)² maintenant').filter((r) => r.math).map((r) => r.text)).toEqual(['(x + 1)²']);
  });

  it('les points de suspension restent dans la formule', () => {
    expect(mathRuns('Compte avec méthode : (7 − 1) + (7 − 2) + … + 1.').filter((r) => r.math).map((r) => r.text)).toEqual(['(7 − 1) + (7 − 2) + … + 1']);
  });

  it('les fractions unicode font partie de la formule ; « = » seul entre deux mots reste du texte', () => {
    expect(mathRuns('segment = secteur − triangle = ½x²(π/6 − ½)').filter((r) => r.math).map((r) => r.text)).toEqual(['½x²(π/6 − ½)']);
  });

  it('les mots d’une lettre et les élisions du français ne sont pas des variables', () => {
    expect(mathRuns('Il y a des billes dans l’urne.').some((r) => r.math)).toBe(false);
    expect(mathRuns('Lina a 12 billes.').filter((r) => r.math).map((r) => r.text)).toEqual(['12']);
    expect(mathRuns('l’aire de ABCD vaut a + b').filter((r) => r.math).map((r) => r.text)).toEqual(['a + b']);
  });

  it('garde les sauts de ligne', () => {
    expect(mathRuns('(1) a = b\n(2) a² = ab').map((r) => r.text).join('')).toBe('(1) a = b\n(2) a² = ab');
  });
});

describe('whenLabel — à l’heure de l’école (Europe/Paris)', () => {
  const now = new Date('2026-11-02T08:00:00Z'); // 9 h à Paris (heure d’hiver)
  it('aujourd’hui, demain, plus tard — l’heure à la française', () => {
    expect(whenLabel('2026-11-02T15:30:00Z', now)).toBe('aujourd’hui à 16 h 30');
    expect(whenLabel('2026-11-03T08:40:00Z', now)).toBe('demain à 9 h 40');
    expect(whenLabel('2026-11-05T08:05:00Z', now)).toBe('le 5 novembre à 9 h 05');
  });
  it('le jour change à minuit à Paris, pas à minuit UTC', () => {
    // 23 h 30 UTC le 2 novembre = 0 h 30 le 3 novembre à Paris : c'est « demain » vu de 9 h le 2.
    expect(whenLabel('2026-11-02T23:30:00Z', now)).toBe('demain à 0 h 30');
  });
});

describe('stateLines — l\'état en mots', () => {
  const base = { status: 'trying', attemptsCounted: 2, attemptsToUnlock: 3, thinkHours: 24, canReplay: false, unlockAt: null };
  it('en cours, avant la 3ᵉ tentative', () => {
    expect(stateLines(base)).toEqual([{ key: 'state.attempts', params: { count: 2, total: 3 } }, { key: 'state.thinkDay' }]);
  });
  it('les 3 tentatives faites : l\'heure d\'ouverture', () => {
    const lines = stateLines({ ...base, attemptsCounted: 3, unlockAt: '2026-11-03T08:40:00Z' }, new Date('2026-11-02T08:00:00Z'));
    expect(lines[1]).toEqual({ key: 'state.opensAt', params: { when: 'demain à 9\u00A0h\u00A040' } });
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
    expect(draftReady({ minDraftChars: 12 }, 'court')).toBe(false);
    expect(draftReady({ minDraftChars: 12 }, 'j’ai essayé une autre idée')).toBe(true);
    expect(draftReady({ minDraftChars: 0 }, '')).toBe(true);
  });
});
