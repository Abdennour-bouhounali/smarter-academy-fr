import { describe, it, expect } from 'vitest';
import {
  subscript, superscript, termName, formatTerm, formatLargeInteger, formatScientific,
  formatCoefficient, formatAddend, formatRule, prettySource, formatClosedForm,
  formatFixedPointFormula, formatDifference, formatRatio, formatSum,
  formatStepBreakdown, substituted, substituteCurrent,
  NEXT_TERM_NAME, CURRENT_TERM_NAME,
} from './sequenceFormat.js';
import { closedForm } from './sequenceMath.js';

/**
 * L'ÉCRITURE (§44) : la notation reste lisible, latine, et mathématiquement
 * JUSTE. Le test le plus important du fichier est celui du signe moins
 * substitué : sans parenthèse, la ligne du milieu enseigne une erreur.
 */

describe('les indices et les exposants', () => {
  it('écrit les indices en caractères Unicode, pas en balises', () => {
    expect(subscript(0)).toBe('₀');
    expect(subscript(12)).toBe('₁₂');
    expect(subscript(105)).toBe('₁₀₅');
    expect(subscript(-3)).toBe('₋₃');
    expect(subscript(Number.NaN)).toBe('');
  });

  it('nomme un terme', () => {
    expect(termName(0)).toBe('u₀');
    expect(termName(7)).toBe('u₇');
    expect(termName(3, 'S')).toBe('S₃');
  });

  it('écrit les exposants de même', () => {
    expect(superscript(2)).toBe('²');
    expect(superscript(12)).toBe('¹²');
    expect(superscript(-5)).toBe('⁻⁵');
  });

  it('n’utilise aucune balise HTML : la notation traverse un aria-label et un SVG', () => {
    for (const text of [termName(12), subscript(3), superscript(4), NEXT_TERM_NAME, CURRENT_TERM_NAME]) {
      expect(text).not.toMatch(/[<>]/);
    }
  });
});

describe('les nombres (§44)', () => {
  it('un entier s’écrit sans décimale inventée', () => {
    expect(formatTerm(11)).toBe('11');
    expect(formatTerm(0)).toBe('0');
    expect(formatTerm(-4)).toBe('−4');
  });

  it('un décimal garde la virgule et le vrai signe moins', () => {
    expect(formatTerm(0.5)).toBe('0,5');
    expect(formatTerm(-2.5)).toBe('−2,5');
    expect(formatTerm(1 / 3)).toBe('0,3333');
  });

  it('les chiffres restent LATINS — convention des manuels algériens', () => {
    expect(formatTerm(1234.5)).not.toMatch(/[٠-٩]/);
    expect(formatLargeInteger(1048576)).not.toMatch(/[٠-٩]/);
  });

  it('un grand entier reçoit des séparateurs de milliers, jamais une virgule', () => {
    expect(formatLargeInteger(1048576)).toBe('1 048 576');
    expect(formatLargeInteger(-832040)).toBe('−832 040');
    expect(formatLargeInteger(999)).toBe('999');
  });

  it('au-delà de mille milliards, on passe en notation scientifique', () => {
    expect(formatTerm(1e13)).toMatch(/10¹³/);
    expect(formatScientific(1.05e12)).toBe('1,05 × 10¹²');
    expect(formatScientific(-3e-5)).toBe('−3 × 10⁻⁵');
    expect(formatScientific(0)).toBe('0');
  });

  it('une valeur absente s’écrit « — », jamais NaN ni Infinity', () => {
    expect(formatTerm(Number.NaN)).toBe('—');
    expect(formatTerm(Number.POSITIVE_INFINITY)).toBe('—');
    expect(formatTerm(null)).toBe('—');
    expect(formatTerm(undefined)).toBe('—');
    expect(formatLargeInteger(Number.NaN)).toBe('—');
    expect(formatScientific(Number.NaN)).toBe('—');
  });
});

describe('les coefficients : la formule se lit comme au cahier', () => {
  it('n’écrit jamais « 1u » ni « −1u »', () => {
    expect(formatCoefficient(1, 'u')).toBe('u');
    expect(formatCoefficient(-1, 'u')).toBe('−u');
    expect(formatCoefficient(2, 'u')).toBe('2u');
    expect(formatCoefficient(0.5, 'u')).toBe('0,5u');
    expect(formatCoefficient(0, 'u')).toBe('0');
  });

  it('un terme additif nul ne s’écrit pas', () => {
    expect(formatAddend(0)).toBe('');
    expect(formatAddend(3)).toBe(' + 3');
    expect(formatAddend(-2)).toBe(' − 2');
  });
});

describe('les règles (§8, §16)', () => {
  it('écrit chaque famille comme au tableau', () => {
    expect(formatRule({ kind: 'arithmetic', difference: 3 })).toBe('uₙ₊₁ = uₙ + 3');
    expect(formatRule({ kind: 'arithmetic', difference: -1 })).toBe('uₙ₊₁ = uₙ − 1');
    expect(formatRule({ kind: 'geometric', ratio: 1.5 })).toBe('uₙ₊₁ = 1,5 uₙ');
    expect(formatRule({ kind: 'geometric', ratio: -1 })).toBe('uₙ₊₁ = − uₙ');
    expect(formatRule({ kind: 'affine', a: 0.5, b: 2 })).toBe('uₙ₊₁ = 0,5 uₙ + 2');
    expect(formatRule({ kind: 'explicit', explicitSource: '2n + 1' })).toBe('uₙ = 2n + 1');
    expect(formatRule({ kind: 'secondOrder', a: 1, b: 1 })).toBe('uₙ₊₂ = uₙ₊₁ + uₙ');
    expect(formatRule({ kind: 'secondOrder', a: 2, b: -1 })).toBe('uₙ₊₂ = 2 uₙ₊₁ − uₙ');
  });

  it('une raison de 1 donne « uₙ₊₁ = uₙ » — la suite constante de §14', () => {
    expect(formatRule({ kind: 'geometric', ratio: 1 })).toBe('uₙ₊₁ = uₙ');
    expect(formatRule({ kind: 'affine', a: 1, b: 0 })).toBe('uₙ₊₁ = uₙ');
  });

  it('embellit la saisie de l’élève sans la réanalyser', () => {
    expect(prettySource('u^2 - 1', true)).toBe('uₙ² − 1');
    expect(prettySource('2u - 1', true)).toBe('2uₙ − 1');
    expect(prettySource('u/2 + 3', true)).toBe('uₙ/2 + 3');
    expect(prettySource('3.2u(1-u)', true)).toBe('3,2uₙ(1−uₙ)');
  });

  it('écrit (−1)ⁿ correctement : c’est LA suite alternée de §20 et §24', () => {
    expect(prettySource('(-1)^n')).toBe('(−1)ⁿ');
    expect(prettySource('(-1)^n/n')).toBe('(−1)ⁿ/n');
    expect(prettySource('n^2')).toBe('n²');
  });

  it('ne confond pas `u` avec la lettre d’une fonction', () => {
    expect(prettySource('sqrt(u) + 1', true)).toBe('sqrt(uₙ) + 1');
    expect(prettySource('exp(u)', true)).toBe('exp(uₙ)');
  });

  it('nomme le terme d’avant au second ordre', () => {
    expect(prettySource('u + v', true)).toBe('uₙ + uₙ₋₁');
  });

  it('une règle vide ou inconnue ne rend rien plutôt qu’une phrase cassée', () => {
    expect(formatRule(null)).toBe('');
    expect(formatRule({ kind: 'inconnu' })).toBe('');
    expect(prettySource('')).toBe('');
    expect(prettySource(null)).toBe('');
  });
});

describe('la forme explicite (§16)', () => {
  it('écrit les trois formules que le cours donne', () => {
    expect(formatClosedForm(closedForm({ kind: 'arithmetic', startIndex: 0, initial: [2], difference: 3 })))
      .toBe('uₙ = 2 + 3 × n');
    expect(formatClosedForm(closedForm({ kind: 'geometric', startIndex: 0, initial: [2], ratio: 1.5 })))
      .toBe('uₙ = 2 × 1,5ⁿ');
    expect(formatClosedForm(closedForm({ kind: 'affine', startIndex: 0, initial: [0], a: 0.5, b: 2 })))
      .toBe('uₙ = 4 − 4 × 0,5ⁿ');
  });

  it('parti de u₁, l’exposant est décalé — et on le MONTRE', () => {
    expect(formatClosedForm(closedForm({ kind: 'arithmetic', startIndex: 1, initial: [2], difference: 3 })))
      .toBe('uₙ = 2 + 3 × (n − 1)');
  });

  it('une raison nulle donne une constante', () => {
    expect(formatClosedForm(closedForm({ kind: 'arithmetic', startIndex: 0, initial: [7], difference: 0 })))
      .toBe('uₙ = 7');
  });

  it('sans forme explicite connue, on n’écrit rien (§16)', () => {
    expect(formatClosedForm(null)).toBe('');
  });

  it('le point fixe s’écrit comme la formule qu’il est (§15)', () => {
    expect(formatFixedPointFormula(0.5, 2)).toBe('L = 2 / (1 − 0,5) = 4');
    // a = 1 : la formule n'existe pas, on ne l'écrit pas
    expect(formatFixedPointFormula(1, 2)).toBe('');
    expect(formatFixedPointFormula(Number.NaN, 2)).toBe('');
  });
});

describe('les lectures écrites (§17)', () => {
  it('une différence, un rapport, une somme', () => {
    expect(formatDifference(3, 3)).toBe('u₄ − u₃ = 3');
    expect(formatRatio(3, 1.5)).toBe('u₄ / u₃ = 1,5');
    expect(formatSum(3, 15)).toBe('S₃ = 15');
  });

  it('un rapport indéfini s’écrit « — », pas l’infini (§35)', () => {
    expect(formatRatio(3, null, false)).toBe('u₄ / u₃ = —');
    expect(formatRatio(3, Number.POSITIVE_INFINITY, true)).toBe('u₄ / u₃ = —');
  });
});

describe('le pas montré en trois temps (§8)', () => {
  it('sépare la valeur courante, la règle appliquée, et la valeur suivante', () => {
    expect(formatStepBreakdown({ kind: 'arithmetic', difference: 3 }, 3, 11, 14))
      .toEqual({ from: 'u₃ = 11', applied: '11 + 3', to: 'u₄ = 14' });
    expect(formatStepBreakdown({ kind: 'affine', a: 0.5, b: 2 }, 1, 10, 7))
      .toEqual({ from: 'u₁ = 10', applied: '0,5 × 10 + 2', to: 'u₂ = 7' });
  });

  it('PARENTHÈSE une valeur négative substituée — sans quoi la ligne enseigne une erreur', () => {
    // (−2)² − 1 = 3 ; « −2² − 1 » se lirait −5. La parenthèse n'est pas
    // cosmétique : c'est la différence entre juste et faux.
    const step = formatStepBreakdown({ kind: 'recurrence', ruleSource: 'u^2 - 1' }, 1, -2, 3);
    expect(step.applied).toBe('(−2)² − 1');
    expect(step.applied).not.toBe('−2² − 1');
  });

  it('rend EXPLICITES les produits que la substitution aurait collés', () => {
    // 3,2uₙ(1−uₙ) avec uₙ = 0,3 ne doit pas donner « 3,20,3(1−0,3) »
    const step = formatStepBreakdown({ kind: 'recurrence', ruleSource: '3.2u(1-u)' }, 0, 0.3, 0.672);
    expect(step.applied).toBe('3,2 × 0,3 × (1−0,3)');
    expect(step.applied).not.toMatch(/\d,\d+,\d/);
  });

  it('ne colle jamais deux nombres dans une règle substituée', () => {
    for (const [source, value] of [['2u - 1', 3], ['u(u+1)', 2], ['2u', -1.5], ['u^2', 1.5], ['1/(u-2)', 5]]) {
      const applied = formatStepBreakdown({ kind: 'recurrence', ruleSource: source }, 0, value, 0).applied;
      // deux chiffres séparés par une seule virgule décimale sont normaux ;
      // deux NOMBRES accolés ne le sont jamais
      expect(applied, `${source} avec u = ${value}`).not.toMatch(/\d,\d+,\d/);
    }
  });

  it('substitue une valeur, parenthésée si elle est négative', () => {
    expect(substituted(-2)).toBe('(−2)');
    expect(substituted(5)).toBe('5');
    expect(substituted(0.5)).toBe('0,5');
  });

  it('substituteCurrent laisse intact ce qui ne parle pas de uₙ', () => {
    expect(substituteCurrent('2n + 1', 5)).toBe('2n + 1');
    expect(substituteCurrent('', 5)).toBe('');
  });

  it('sans règle, pas de décomposition', () => {
    expect(formatStepBreakdown(null, 0, 1, 2)).toBeNull();
  });
});

describe('aucune chaîne traduisible dans ce module', () => {
  it('ne contient ni arabe ni phrase d’interface dans son CODE', async () => {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const source = readFileSync(fileURLToPath(new URL('./sequenceFormat.js', import.meta.url)), 'utf8');
    const code = source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .filter((line) => !line.trim().startsWith('//'))
      .join('\n');
    // Les symboles mathématiques sont les mêmes dans toutes les langues ;
    // les mots ne le sont pas et vivent dans mathlab.json.
    expect(code).not.toMatch(/[؀-ۿ]/);
  });
});
