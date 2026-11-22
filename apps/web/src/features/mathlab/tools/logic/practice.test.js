/**
 * L'entraînement (§37-39), éprouvé sur beaucoup de graines.
 *
 * L'épreuve qui compte le plus : la réponse ATTENDUE est TOUJOURS acceptée.
 * Un instrument qui refuse la bonne réponse enseigne une fausseté que
 * l'élève n'a aucun moyen de contester.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import PracticePanel from './PracticePanel.jsx';
import {
  CHALLENGE_KINDS, DIFFICULTY_KINDS, generateChallenge, checkAnswer,
  parseNumericAnswer, inDomain, revealTarget, kindsForLevel, verdictOfSearch, negationDistractors,
} from './practice.js';
import {
  COUNTEREXAMPLE_CHALLENGES, FALLACIES, PROOFS, QUANTIFIER_STATEMENTS, STATEMENTS, EQUIVALENCES,
  IMPLICATIONS, CONDITIONS, JUDGE_LIMIT, findPreset, sampleOf,
} from './presets.js';
import { anyValidOrder, refutesFallacy } from './proofMath.js';
import { evaluate } from './logicMath.js';

const SEEDS = Array.from({ length: 400 }, (_, i) => i + 1);

/*
 * La VÉRITÉ des énoncés à réfuter, réécrite ici SANS passer par presets.js :
 * un juge et son test qui partagent le même prédicat seraient toujours
 * d'accord. Primalité par division naïve, parité par BigInt-free modulo
 * positif — assez pour |n| ≤ 10⁶.
 */
const primeT = (n) => {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;

  return true;
};
const evenT = (n) => ((n % 2) + 2) % 2 === 0;
const CLAIMS = {
  primeGtTwoIsEven: { inSet: (n) => Number.isInteger(n) && n >= 0, holds: (n) => !(primeT(n) && n > 2) || evenT(n) },
  everyPrimeIsOdd: { inSet: (n) => Number.isInteger(n) && n >= 0, holds: (n) => !primeT(n) || !evenT(n) },
  squareEvenImpliesOdd: { inSet: (n) => Number.isInteger(n), holds: (n) => !evenT(n) },       // n² pair ⇔ n pair
  divisibleByFourImpliesByEight: { inSet: (n) => Number.isInteger(n) && n >= 1, holds: (n) => n % 4 !== 0 || n % 8 === 0 },
  eulerPolynomialAlwaysPrime: { inSet: (n) => Number.isInteger(n) && n >= 0, holds: (n) => primeT(n * n + n + 41) },
};
const counterexampleChallenge = (challengeId) => ({ kind: 'counterexample', answerType: 'number', challengeId });
const fallacyChallenge = (preset) => ({ kind: 'fallacy', answerType: 'fallacy', fallacyId: preset.id, expected: preset.kind });

describe('generateChallenge — toujours bien formé', () => {
  it('rend un défi complet pour 400 graines', () => {
    for (const seed of SEEDS) {
      const challenge = generateChallenge(seed);
      expect(CHALLENGE_KINDS).toContain(challenge.kind);
      expect(typeof challenge.promptKey).toBe('string');
      expect(Array.isArray(challenge.hintKeys)).toBe(true);
      expect(challenge.hintKeys.length).toBeGreaterThanOrEqual(2);
      expect(typeof challenge.explainKey).toBe('string');
    }
  });

  it('couvre toutes les familles', () => {
    const seen = new Set(SEEDS.map((seed) => generateChallenge(seed).kind));
    for (const kind of CHALLENGE_KINDS) expect(seen).toContain(kind);
  });

  it('est reproductible : même graine, même défi', () => {
    expect(generateChallenge(42)).toEqual(generateChallenge(42));
  });

  it('respecte la restriction de familles', () => {
    for (const seed of SEEDS.slice(0, 50)) {
      expect(generateChallenge(seed, ['counterexample']).kind).toBe('counterexample');
    }
  });

  it('§38 — les quatre niveaux ne tirent que des familles réelles', () => {
    for (const level of [1, 2, 3, 4]) {
      expect(kindsForLevel(level).every((kind) => CHALLENGE_KINDS.includes(kind))).toBe(true);
    }
    expect(kindsForLevel(99)).toEqual(CHALLENGE_KINDS);
  });

  it('un niveau bas ne pose pas de preuve à ordonner', () => {
    expect(DIFFICULTY_KINDS[1]).not.toContain('orderProof');
    expect(DIFFICULTY_KINDS[4]).toContain('orderProof');
  });

  it('les choix d’une question à choix ne sont jamais vides', () => {
    for (const seed of SEEDS) {
      const challenge = generateChallenge(seed);
      if (challenge.answerType !== 'choice') continue;
      expect(Array.isArray(challenge.choices)).toBe(true);
      expect(challenge.choices.length).toBeGreaterThanOrEqual(2);
      expect(challenge.choices).toContain(challenge.expected);
    }
  });
});

describe('checkAnswer — la bonne réponse est TOUJOURS acceptée', () => {
  it('pour les questions à choix et numériques, sur 400 graines', () => {
    for (const seed of SEEDS) {
      const challenge = generateChallenge(seed);
      if (challenge.answerType === 'order' || challenge.answerType === 'fallacy') continue;
      const answer = challenge.answerType === 'number' ? String(challenge.expected) : challenge.expected;
      expect(checkAnswer(challenge, answer), `${challenge.kind} @ ${seed}`).toMatchObject({ correct: true, readable: true });
    }
  });

  it('pour une preuve à ordonner : un ordre valide passe, l’inverse non', () => {
    for (const seed of SEEDS.slice(0, 40)) {
      const challenge = generateChallenge(seed, ['orderProof']);
      const proof = findPreset(PROOFS, challenge.proofId);
      const order = anyValidOrder(proof);
      expect(checkAnswer(challenge, order).correct).toBe(true);
      expect(checkAnswer(challenge, [...order].reverse()).correct).toBe(false);
    }
  });

  it('pour un sophisme : nommer ET réfuter', () => {
    const challenge = generateChallenge(1, ['fallacy']);
    const preset = findPreset(FALLACIES, challenge.fallacyId);
    expect(checkAnswer(challenge, { kind: preset.kind, value: String(preset.counterexample) }).correct).toBe(true);
    // Nommer juste sans réfuter ne suffit pas : c'est réciter (§33).
    const notRefuting = sampleOf(preset.domain).find((v) => !preset.refutes(v));
    expect(checkAnswer(challenge, { kind: preset.kind, value: String(notRefuting) }).correct).toBe(false);
    // Réfuter sans nommer ne suffit pas non plus.
    const otherKind = challenge.choices.find((k) => k !== preset.kind);
    expect(checkAnswer(challenge, { kind: otherKind, value: String(preset.counterexample) }).correct).toBe(false);
  });

  it('§10 — TOUT contre-exemple valide est accepté, pas seulement celui attendu', () => {
    const challenge = generateChallenge(1, ['counterexample']);
    const preset = findPreset(COUNTEREXAMPLE_CHALLENGES, challenge.challengeId);
    const allValid = sampleOf(preset.domain).filter((v) => evaluate(preset.predicate, v) === false);
    expect(allValid.length).toBeGreaterThan(0);
    for (const value of allValid) {
      expect(checkAnswer(challenge, String(value)).correct, `${value} réfute pourtant`).toBe(true);
    }
  });

  // Ce test affirmait autrefois « 99999 est hors domaine » : c'était verrouiller
  // le défaut (ℕ n'a pas de maximum ; 30 n'est que la fin de la droite). Le
  // verdict attendu est maintenant CALCULÉ ici, par le prédicat de l'énoncé.
  it('99999 est jugé par le prédicat, pas par la fin de la droite graduée', () => {
    const challenge = generateChallenge(1, ['counterexample']);
    const truth = CLAIMS[challenge.challengeId];
    expect(checkAnswer(challenge, '99999').correct).toBe(truth.inSet(99999) && !truth.holds(99999));
  });

  it('§39 — une saisie illisible n’est PAS une réponse fausse', () => {
    const challenge = generateChallenge(1, ['counterexample']);
    expect(checkAnswer(challenge, 'peut-être')).toEqual({ correct: false, readable: false });
    expect(checkAnswer(challenge, '')).toEqual({ correct: false, readable: false });
  });

  it('ne lève jamais, quelle que soit l’entrée', () => {
    const challenge = generateChallenge(1);
    for (const answer of [undefined, null, {}, [], 0, NaN, { kind: 1 }]) {
      expect(() => checkAnswer(challenge, answer)).not.toThrow();
    }
    expect(() => checkAnswer(null, 'x')).not.toThrow();
    expect(() => checkAnswer(undefined, undefined)).not.toThrow();
  });
});

describe('parseNumericAnswer — accepter large, car la question porte sur la logique', () => {
  it('lit les entiers, les décimaux à virgule, les fractions et le vrai signe moins', () => {
    expect(parseNumericAnswer('4')).toBe(4);
    expect(parseNumericAnswer('-3')).toBe(-3);
    expect(parseNumericAnswer('−3')).toBe(-3);
    expect(parseNumericAnswer('2,5')).toBeCloseTo(2.5);
    expect(parseNumericAnswer('1/2')).toBeCloseTo(0.5);
    expect(parseNumericAnswer(' 7 ')).toBe(7);
    expect(parseNumericAnswer(6)).toBe(6);
  });

  it('lit les chiffres arabes-indiens', () => {
    expect(parseNumericAnswer('٤')).toBe(4);
    expect(parseNumericAnswer('٢٠')).toBe(20);
  });

  it('rend NaN sur une saisie illisible, sans lever', () => {
    for (const bad of ['abc', '', '  ', '1/0', null, undefined, {}]) {
      expect(Number.isNaN(parseNumericAnswer(bad))).toBe(true);
    }
  });
});

describe('inDomain', () => {
  it('refuse un décimal dans un domaine entier', () => {
    expect(inDomain(2.5, { min: 0, max: 10, integer: true })).toBe(false);
    expect(inDomain(2, { min: 0, max: 10, integer: true })).toBe(true);
  });

  it('refuse hors bornes', () => {
    expect(inDomain(11, { min: 0, max: 10, integer: true })).toBe(false);
  });
});

describe('§37 — la révélation sait quoi MONTRER', () => {
  it('chaque défi désigne une aire du laboratoire et un préréglage', () => {
    for (const seed of SEEDS.slice(0, 120)) {
      const target = revealTarget(generateChallenge(seed));
      expect(target).not.toBeNull();
      expect(typeof target.area).toBe('string');
      expect(target.id).toBeTruthy();
    }
  });

  it('rend null sans défi, plutôt que de lever', () => {
    expect(revealTarget(null)).toBeNull();
  });
});

describe('verdictOfSearch — le laboratoire ne se ment pas à lui-même (§22)', () => {
  it('« pas de contre-exemple trouvé » n’est pas « prouvé »', () => {
    const preset = findPreset(QUANTIFIER_STATEMENTS, 'squareNonNegative');
    const verdict = verdictOfSearch('forall', preset.predicate, preset.domain);
    expect(verdict.status).toBe('notFound');
  });

  it('un contre-exemple réfute pour de bon', () => {
    const preset = findPreset(QUANTIFIER_STATEMENTS, 'naturalPositive');
    const verdict = verdictOfSearch('forall', preset.predicate, preset.domain);
    expect(verdict.status).toBe('disproved');
    expect(verdict.value).toBe(0);
  });

  it('un témoin prouve un ∃', () => {
    const preset = findPreset(QUANTIFIER_STATEMENTS, 'existsSquareFour');
    expect(verdictOfSearch('exists', preset.predicate, preset.domain).status).toBe('proved');
  });
});

/* ── Régressions de l'audit du juge (2026-09-24) ─────────────────────────── */

describe('#1 — un contre-exemple se juge sur l’ENSEMBLE déclaré, pas sur la fenêtre', () => {
  it('les contre-exemples cités par l’audit, hors de la droite, sont acceptés', () => {
    const cases = [
      ['primeGtTwoIsEven', [31, 37, 97]],
      ['squareEvenImpliesOdd', [14, -14, 100]],
      ['divisibleByFourImpliesByEight', [44, 52, 1004]],
      ['eulerPolynomialAlwaysPrime', [49]],
    ];
    for (const [id, values] of cases) {
      const preset = findPreset(COUNTEREXAMPLE_CHALLENGES, id);
      for (const value of values) {
        // Au-delà de la fenêtre d'échantillonnage : c'était le défaut.
        expect(value < preset.domain.min || value > preset.domain.max).toBe(true);
        // La vérité est calculée ICI, indépendamment.
        expect(CLAIMS[id].inSet(value) && !CLAIMS[id].holds(value), `${id} @ ${value}`).toBe(true);
        expect(checkAnswer(counterexampleChallenge(id), String(value)), `${id} @ ${value}`)
          .toMatchObject({ correct: true, readable: true });
      }
    }
    // 49² + 49 + 41 = 2491 = 47 × 53.
    expect(49 * 49 + 49 + 41).toBe(47 * 53);
  });

  it('sur −300…300, le juge dit exactement ce que dit l’énoncé, pour chaque préréglage', () => {
    for (const preset of COUNTEREXAMPLE_CHALLENGES) {
      const truth = CLAIMS[preset.id];
      expect(truth, `vérité indépendante manquante pour ${preset.id}`).toBeDefined();
      for (let value = -300; value <= 300; value += 1) {
        const expected = truth.inSet(value) && !truth.holds(value);
        expect(checkAnswer(counterexampleChallenge(preset.id), String(value)).correct, `${preset.id} @ ${value}`).toBe(expected);
      }
    }
  });

  it('une valeur hors de l’ensemble déclaré reste refusée (et lisible)', () => {
    // −4 est multiple de 4 sans l'être de 8, mais −4 ∉ ℕ*.
    expect(checkAnswer(counterexampleChallenge('divisibleByFourImpliesByEight'), '-4')).toMatchObject({ correct: false, readable: true });
    // 2,5 ∉ ℤ.
    expect(checkAnswer(counterexampleChallenge('squareEvenImpliesOdd'), '2,5')).toMatchObject({ correct: false, readable: true });
  });

  it('au-delà de JUDGE_LIMIT, on ne juge pas : ni « juste » ni « faux »', () => {
    const big = String(JUDGE_LIMIT * 10 + 2); // pair : un vrai contre-exemple de « n² pair ⇒ n impair »
    expect(checkAnswer(counterexampleChallenge('squareEvenImpliesOdd'), big))
      .toMatchObject({ correct: false, readable: false, detail: { tooLarge: true } });
    expect(checkAnswer(counterexampleChallenge('primeGtTwoIsEven'), '99999999999999999999'))
      .toMatchObject({ readable: false, detail: { tooLarge: true } });
  });

  it('la primalité reste juste et rapide à la limite du juge', () => {
    // 999983 est le plus grand premier < 10⁶ ; il réfute « tout premier > 2 est pair ».
    expect(primeT(999983)).toBe(true);
    const started = Date.now();
    expect(checkAnswer(counterexampleChallenge('primeGtTwoIsEven'), '999983').correct).toBe(true);
    expect(checkAnswer(counterexampleChallenge('eulerPolynomialAlwaysPrime'), String(JUDGE_LIMIT)).correct)
      .toBe(!primeT(JUDGE_LIMIT * JUDGE_LIMIT + JUDGE_LIMIT + 41));
    expect(Date.now() - started).toBeLessThan(500);
  });
});

describe('inDomain — l’ensemble déclaré', () => {
  it('ℕ, ℕ*, ℤ, ℝ sans borne de fenêtre', () => {
    const window = { min: 0, max: 10, integer: true };
    expect(inDomain(31, { ...window, symbol: 'ℕ' })).toBe(true);
    expect(inDomain(-1, { ...window, symbol: 'ℕ' })).toBe(false);
    expect(inDomain(0, { ...window, symbol: 'ℕ*' })).toBe(false);
    expect(inDomain(-14, { ...window, symbol: 'ℤ' })).toBe(true);
    expect(inDomain(-14.5, { ...window, symbol: 'ℤ' })).toBe(false);
    expect(inDomain(123.25, { min: -6, max: 6, integer: false, symbol: 'ℝ' })).toBe(true);
  });
});

/*
 * Les définitions du laboratoire (fallacy.kindHints) :
 *   استعمال العكس : de P ⇒ Q on passe à Q ⇒ P — la CONCLUSION est une implication ;
 *   إثبات التالي  : de P ⇒ Q et de Q on passe à P — la conclusion est un fait.
 * Le test lit l'argument arabe lui-même et le classe par sa forme.
 */
describe('#2 — le nom attendu d’un sophisme suit la forme de son argument', () => {
  const ar = JSON.parse(readFileSync(new URL('../../../../i18n/locales/ar/mathlab.json', import.meta.url), 'utf8'));
  const args = ar.tools.logic.fallacy.arguments;
  const clean = (text) => text.replace(/[\u200e\u200f.]/g, '').trim();

  function classify(text) {
    const [premises, conclusion] = clean(text).split(/إذن|فإنّ/).map((part) => part.replace(/[،,]\s*$/, '').trim());
    if (conclusion === undefined) return 'examplesNotProof';
    if (conclusion.includes('⇒')) {
      const [p, q] = premises.split('⇒').map((x) => x.trim());
      const [q2, p2] = conclusion.split('⇒').map((x) => x.trim());
      return p === p2 && q === q2 ? 'invalidConverse' : 'unknown';
    }
    if (/أوّلي عند|n = 0/.test(premises)) return 'examplesNotProof';

    return 'affirmingConsequent';
  }

  it('le classement lit bien la forme : l’ANCIEN texte était un إثبات التالي', () => {
    expect(classify('‏x = 2 ⇒ x² = 4، وبما أنّ x² = 4 فإنّ x = 2.')).toBe('affirmingConsequent');
  });

  it('squareFourConverse ÉNONCE une réciproque : استعمال العكس', () => {
    expect(classify(args.squareFourConverse)).toBe('invalidConverse');
    expect(findPreset(FALLACIES, 'squareFourConverse').kind).toBe('invalidConverse');
  });

  it('chaque argument porte le nom que sa forme lui donne', () => {
    for (const preset of FALLACIES) {
      expect(classify(args[preset.id]), preset.id).toBe(preset.kind);
    }
  });

  it('le juge accepte le nom juste avec −2, refuse إثبات التالي', () => {
    const preset = findPreset(FALLACIES, 'squareFourConverse');
    // −2 : x² = 4 vrai, x = 2 faux — la réciproque tombe.
    expect((-2) ** 2 === 4 && -2 !== 2).toBe(true);
    expect(checkAnswer(fallacyChallenge(preset), { kind: 'invalidConverse', value: '-2' }).correct).toBe(true);
    expect(checkAnswer(fallacyChallenge(preset), { kind: 'affirmingConsequent', value: '-2' }).correct).toBe(false);
  });
});

describe('#3 — la question montre son domaine et son connecteur', () => {
  it('« 1/n > 0 » porte n ∈ ℕ*, « 1/x > 0 » porte x ∈ ℝ, x ≠ 0', () => {
    const labels = {};
    for (const seed of SEEDS) {
      const challenge = generateChallenge(seed, ['trueOrFalse']);
      labels[challenge.statementId] = challenge.domainLabel;
    }
    expect(labels.oneOverNPositive).toBe('n ∈ ℕ*');
    expect(labels.oneOverXPositive).toBe('x ∈ ℝ, x ≠ 0');
  });

  it('toute question sur un préréglage à domaine affiche ce domaine', () => {
    const withDomain = new Set([
      ...STATEMENTS.filter((s) => s.domain).map((s) => s.id),
      ...IMPLICATIONS.map((s) => s.id), ...EQUIVALENCES.map((s) => s.id), ...CONDITIONS.map((s) => s.id),
      ...COUNTEREXAMPLE_CHALLENGES.map((s) => s.id), ...FALLACIES.map((s) => s.id),
    ]);
    for (const seed of SEEDS) {
      const c = generateChallenge(seed);
      const id = c.statementId ?? c.implicationId ?? c.equivalenceId ?? c.conditionId ?? c.challengeId ?? c.fallacyId;
      if (!withDomain.has(id)) continue;
      expect(c.domainLabel, `${c.kind} ${id}`).toMatch(/^[nx] ∈ (ℕ\*?|ℤ|ℝ)/);
    }
  });

  it('une équivalence se dessine ⇔ et sans mot français', () => {
    for (const seed of SEEDS.slice(0, 80)) {
      const c = generateChallenge(seed, ['equivalence']);
      expect(c.connective).toBe('⇔');
      for (const formula of [c.pFormula, c.qFormula]) expect(formula).not.toMatch(/[A-Za-z]{2,}/);
    }
    // 2 | n ⇔ 2 | n² : la notation décrit bien le préréglage, vérifié ici sur ℤ.
    const eq = findPreset(EQUIVALENCES, 'evenIffSquareEven');
    for (let n = -50; n <= 50; n += 1) {
      expect(eq.p.test(n)).toBe(evenT(n));
      expect(eq.q.test(n)).toBe(evenT(n * n));
    }
  });

  it('PracticePanel rend le domaine et ⇔', () => {
    const find = (kind, key, id) => SEEDS.map((seed) => generateChallenge(seed, [kind])).find((c) => c[key] === id);
    const oneOverN = find('trueOrFalse', 'statementId', 'oneOverNPositive');
    const html = renderToStaticMarkup(createElement(PracticePanel, { challenge: oneOverN, level: 1, solved: 0, seen: 0 }));
    expect(html).toContain('data-ml-lg-practice-domain');
    expect(html).toContain('n ∈ ℕ*');
    const equivalence = generateChallenge(1, ['equivalence']);
    const html2 = renderToStaticMarkup(createElement(PracticePanel, { challenge: equivalence, level: 3, solved: 0, seen: 0 }));
    expect(html2).toContain('⇔');
    expect(html2).not.toContain('  ⇒  ');
  });
});

describe('#4 — réfuter un sophisme exige une valeur de l’ensemble déclaré', () => {
  it('evenSoMultipleOfFour (ℕ) : −2 et −6 refusés, 6, 10, 34 et 102 acceptés', () => {
    const preset = findPreset(FALLACIES, 'evenSoMultipleOfFour');
    const refutesT = (n) => Number.isInteger(n) && n >= 0 && evenT(n) && n % 4 !== 0;
    for (const value of [-2, -6, 6, 10, 34, 102, 8, 7]) {
      expect(checkAnswer(fallacyChallenge(preset), { kind: preset.kind, value: String(value) }).correct, String(value))
        .toBe(refutesT(value));
    }
  });

  it('squareFourConverse (ℤ) : −2 accepté, 2,0000001 et 2 refusés', () => {
    const preset = findPreset(FALLACIES, 'squareFourConverse');
    expect(refutesFallacy(preset, -2)).toBe(true);
    expect(refutesFallacy(preset, 2)).toBe(false);
    expect(refutesFallacy(preset, -2.5)).toBe(false);
  });

  it('eulerExamples (ℕ) : 41 hors fenêtre accepté (41² + 41 + 41 = 41 × 43)', () => {
    const preset = findPreset(FALLACIES, 'eulerExamples');
    expect(41 * 41 + 41 + 41).toBe(41 * 43);
    expect(refutesFallacy(preset, 41)).toBe(true);
    expect(refutesFallacy(preset, 49)).toBe(true);
    expect(refutesFallacy(preset, -1)).toBe(false); // −1 ∉ ℕ (et (−1)² − 1 + 41 = 41 est premier de toute façon)
  });
});

describe('#5 — la négation ne se trahit pas et ne se propose pas elle-même', () => {
  // La négation construite ICI, indépendamment : ∀ ↔ ∃ et relation contraire.
  const OPPOSITE = { '≥': '<', '<': '≥', '>': '≤', '≤': '>', '=': '≠', '≠': '=' };
  const negateT = (formula) => {
    const [, q, rest, rel, right] = formula.match(/^([∀∃])(.*?, .*?) ([≥<>≤=≠]) (.*)$/);
    return `${q === '∀' ? '∃' : '∀'}${rest} ${OPPOSITE[rel]} ${right}`;
  };

  it('trois choix distincts, dans le même ensemble, sans l’énoncé de départ, une seule vraie négation', () => {
    for (const seed of SEEDS) {
      const c = generateChallenge(seed, ['quantifierNegation']);
      const preset = findPreset(QUANTIFIER_STATEMENTS, c.quantifierId);
      const truth = negateT(preset.formula);
      expect(c.expected).toBe(truth);
      expect(c.choices).toHaveLength(3);
      expect(new Set(c.choices).size).toBe(3);
      expect(c.choices).not.toContain(preset.formula);
      expect(c.choices.filter((choice) => choice === truth)).toHaveLength(1);
      for (const choice of c.choices) expect(choice).toContain(`∈ ${preset.domain.symbol},`);
    }
  });

  it('les leurres sont les deux erreurs classiques', () => {
    const preset = findPreset(QUANTIFIER_STATEMENTS, 'naturalPositive');
    expect(negationDistractors(preset).sort()).toEqual(['∃n ∈ ℕ, n > 0', '∀n ∈ ℕ, n ≤ 0'].sort());
  });
});
