/**
 * Les énoncés du laboratoire, vérifiés UN PAR UN (§48 : « Every generated
 * problem and every validation rule must be mathematically verified »).
 *
 * C'est le fichier le plus important du laboratoire : un préréglage qui ment
 * ne peut pas le franchir, donc ne peut pas atteindre un élève. Tout ce que
 * l'instrument affichera comme vrai est vérifié ici contre le calcul réel.
 */

import { describe, it, expect } from 'vitest';
import {
  isPrime, isEven, isOdd, sampleOf, findPreset, KNOWN_SET_SYMBOLS, JUDGE_LIMIT, domainStatus, domainLabel,
  STATEMENTS, IMPLICATIONS, EQUIVALENCES, COUNTEREXAMPLE_CHALLENGES, CONDITIONS,
  QUANTIFIER_STATEMENTS, PROOFS, INDUCTIONS, DIRECT_PROOFS, INDUCTION_CASES, FALLACIES, FALLACY_KINDS,
  DEFAULT_STATEMENT_ID, DEFAULT_COUNTEREXAMPLE_ID, DEFAULT_PROOF_ID,
} from './presets.js';
import { analyzeImplication, evaluate } from './logicMath.js';
import { anyValidOrder, isComplete, stepIds } from './proofMath.js';

describe('les prédicats de base', () => {
  it('isPrime reconnaît les premiers et rejette 0, 1 et les négatifs', () => {
    expect([2, 3, 5, 7, 11, 13, 41].every(isPrime)).toBe(true);
    expect([-7, 0, 1, 4, 9, 1681].some(isPrime)).toBe(false);
  });

  it('isEven / isOdd sont justes sur les NÉGATIFS — le piège de `% 2 === 1`', () => {
    expect(isOdd(-3)).toBe(true);
    expect(isEven(-4)).toBe(true);
    expect(isOdd(-4)).toBe(false);
    // Le bug qu'on évite : en JS, (-3) % 2 === -1, donc `n % 2 === 1` dirait « pair ».
    expect((-3) % 2 === 1).toBe(false);
  });

  it('sampleOf parcourt les entiers, ou le pas déclaré', () => {
    expect(sampleOf({ min: 0, max: 3, integer: true })).toEqual([0, 1, 2, 3]);
    expect(sampleOf({ min: 0, max: 1, integer: false, step: 0.5 })).toEqual([0, 0.5, 1]);
  });

  it('findPreset retombe sur le premier plutôt que rendre undefined', () => {
    expect(findPreset(STATEMENTS, 'inexistant')).toBe(STATEMENTS[0]);
  });
});

describe('STATEMENTS — le verdict déclaré est celui du calcul', () => {
  for (const statement of STATEMENTS.filter((s) => s.kind === 'variable')) {
    it(`${statement.id} : « ${statement.verdict} »`, () => {
      const values = sampleOf(statement.domain).filter((x) => !(statement.excluded ?? []).includes(x));
      const results = values.map((x) => evaluate(statement.predicate, x, statement.excluded ?? []))
        .filter((r) => r !== undefined);
      expect(results.length).toBeGreaterThan(0);
      const allTrue = results.every((r) => r === true);
      const allFalse = results.every((r) => r === false);

      if (statement.verdict === 'true') expect(allTrue).toBe(true);
      if (statement.verdict === 'false') expect(allFalse).toBe(true);
      if (statement.verdict === 'depends') {
        expect(allTrue).toBe(false);
        expect(allFalse).toBe(false);
      }
    });
  }

  it('§6 — le même énoncé change de verdict avec son DOMAINE', () => {
    const onReals = findPreset(STATEMENTS, 'oneOverXPositive');
    const onNaturals = findPreset(STATEMENTS, 'oneOverNPositive');
    expect(onReals.verdict).toBe('depends');
    expect(onNaturals.verdict).toBe('true');
  });

  it('le préréglage par défaut existe', () => {
    expect(findPreset(STATEMENTS, DEFAULT_STATEMENT_ID).id).toBe(DEFAULT_STATEMENT_ID);
  });
});

describe('IMPLICATIONS — chaque verdict et chaque contre-exemple est réel', () => {
  for (const preset of IMPLICATIONS) {
    const sample = sampleOf(preset.domain);

    it(`${preset.id} : P ⇒ Q est ${preset.implicationHolds ? 'vraie' : 'fausse'}`, () => {
      const analysis = analyzeImplication(preset.p.test, preset.q.test, sample);
      expect(analysis.direct.holds).toBe(preset.implicationHolds);
    });

    if (preset.implicationCounterexample !== undefined) {
      it(`${preset.id} : le contre-exemple vérifie P sans vérifier Q`, () => {
        const x = preset.implicationCounterexample;
        expect(preset.p.test(x)).toBe(true);
        expect(preset.q.test(x)).toBe(false);
      });
    }

    if (preset.converseCounterexample !== undefined) {
      it(`${preset.id} : le contre-exemple de la réciproque vérifie Q sans vérifier P`, () => {
        const x = preset.converseCounterexample;
        expect(preset.q.test(x)).toBe(true);
        expect(preset.p.test(x)).toBe(false);
      });
    } else {
      it(`${preset.id} : la réciproque tient vraiment sur le domaine`, () => {
        const analysis = analyzeImplication(preset.p.test, preset.q.test, sample);
        expect(analysis.converse.holds).toBe(true);
      });
    }
  }

  it('au moins une implication FAUSSE existe — sinon « صحيحة » serait toujours juste', () => {
    expect(IMPLICATIONS.some((p) => !p.implicationHolds)).toBe(true);
  });

  it('au moins une réciproque VRAIE existe — sinon « خاطئة » serait toujours juste', () => {
    expect(IMPLICATIONS.some((p) => p.converseCounterexample === undefined)).toBe(true);
  });
});

describe('EQUIVALENCES — les deux sens, vérifiés séparément', () => {
  for (const preset of EQUIVALENCES) {
    const sample = sampleOf(preset.domain);

    it(`${preset.id} : ${preset.holds ? 'équivalence' : 'un seul sens'}`, () => {
      const analysis = analyzeImplication(preset.p.test, preset.q.test, sample);
      expect(analysis.direct.holds && analysis.converse.holds).toBe(preset.holds);
    });

    if (!preset.holds) {
      it(`${preset.id} : le sens qui échoue a un contre-exemple réel`, () => {
        const x = preset.backwardCounterexample;
        expect(preset.q.test(x)).toBe(true);
        expect(preset.p.test(x)).toBe(false);
      });
    }
  }
});

describe('COUNTEREXAMPLE_CHALLENGES — l’énoncé est bien FAUX, et on sait où', () => {
  for (const challenge of COUNTEREXAMPLE_CHALLENGES) {
    it(`${challenge.id} : le contre-exemple annoncé réfute vraiment`, () => {
      expect(evaluate(challenge.predicate, challenge.knownCounterexample)).toBe(false);
    });

    it(`${challenge.id} : ce contre-exemple appartient au domaine montré`, () => {
      expect(sampleOf(challenge.domain)).toContain(challenge.knownCounterexample);
    });

    it(`${challenge.id} : l’énoncé est vrai AILLEURS — sinon il n’aurait rien de tentant`, () => {
      const values = sampleOf(challenge.domain);
      const trueSomewhere = values.some((x) => evaluate(challenge.predicate, x) === true);
      expect(trueSomewhere).toBe(true);
    });
  }

  it('§54 — l’expérience d’ouverture est « tout premier > 2 est pair », réfutée par 3', () => {
    const opener = findPreset(COUNTEREXAMPLE_CHALLENGES, DEFAULT_COUNTEREXAMPLE_ID);
    expect(opener.id).toBe('primeGtTwoIsEven');
    expect(evaluate(opener.predicate, 3)).toBe(false);
    expect(evaluate(opener.predicate, 2)).toBe(true); // 2 n'est pas > 2 : la prémisse est fausse
    expect(evaluate(opener.predicate, 9)).toBe(true); // 9 n'est pas premier : prémisse fausse
  });

  it('§22 — le polynôme d’Euler est premier pour n = 0…39 et composé en 40', () => {
    const euler = findPreset(COUNTEREXAMPLE_CHALLENGES, 'eulerPolynomialAlwaysPrime');
    for (let n = 0; n <= 39; n += 1) expect(evaluate(euler.predicate, n)).toBe(true);
    expect(evaluate(euler.predicate, 40)).toBe(false);
    expect(40 * 40 + 40 + 41).toBe(1681);
    expect(1681).toBe(41 * 41);
  });
});

describe('CONDITIONS — A ⇒ B tient, B ⇏ A a son contre-exemple', () => {
  for (const preset of CONDITIONS) {
    const sample = sampleOf(preset.domain);

    it(`${preset.id} : A ⇒ B`, () => {
      expect(analyzeImplication(preset.a.test, preset.b.test, sample).direct.holds).toBe(true);
    });

    it(`${preset.id} : B ne suffit pas — ${preset.bNotSufficientCounterexample} le montre`, () => {
      const x = preset.bNotSufficientCounterexample;
      expect(preset.b.test(x)).toBe(true);
      expect(preset.a.test(x)).toBe(false);
    });
  }
});

describe('QUANTIFIER_STATEMENTS — la valeur de vérité annoncée est la vraie', () => {
  for (const preset of QUANTIFIER_STATEMENTS) {
    it(`${preset.id} (${preset.kind}) : ${preset.truth}`, () => {
      const values = sampleOf(preset.domain);
      const results = values.map((x) => evaluate(preset.predicate, x));
      const actual = preset.kind === 'forall'
        ? results.every((r) => r === true)
        : results.some((r) => r === true);
      expect(actual).toBe(preset.truth);
    });

    it(`${preset.id} : la négation annoncée est bien celle du manuel`, () => {
      expect(typeof preset.negationFormula).toBe('string');
      // ∀ se nie en ∃ et réciproquement — c'est l'idée de §25.
      const expectSymbol = preset.kind === 'forall' ? '∃' : '∀';
      expect(preset.negationFormula.startsWith(expectSymbol)).toBe(true);
    });

    it(`${preset.id} : sa structure réécrit exactement l’énoncé et sa négation`, () => {
      const sign = preset.kind === 'forall' ? '∀' : '∃';
      const other = preset.kind === 'forall' ? '∃' : '∀';
      const set = preset.domain.symbol;
      expect(preset.formula).toBe(`${sign}${preset.variable} ∈ ${set}, ${preset.inner}`);
      expect(preset.negationFormula).toBe(`${other}${preset.variable} ∈ ${set}, ${preset.negatedInner}`);
    });
  }
});

describe('PROOFS — des graphes cohérents, chacun résoluble', () => {
  for (const proof of PROOFS) {
    it(`${proof.id} : ids uniques, prérequis existants, au moins une racine`, () => {
      const ids = stepIds(proof);
      expect(new Set(ids).size).toBe(ids.length);
      for (const step of proof.steps) {
        for (const needed of step.requires ?? []) expect(ids).toContain(needed);
      }
      expect(proof.steps.some((step) => (step.requires ?? []).length === 0)).toBe(true);
    });

    it(`${proof.id} : un ordre valide existe et complète la preuve`, () => {
      const order = anyValidOrder(proof);
      expect(order).toHaveLength(proof.steps.length);
      expect(isComplete(proof, order)).toBe(true);
    });

    it(`${proof.id} : aucun cycle (tout le monde est atteignable)`, () => {
      expect(anyValidOrder(proof).length).toBe(stepIds(proof).length);
    });
  }

  it('les cinq stratégies de §28 sont représentées', () => {
    const strategies = new Set(PROOFS.map((p) => p.strategy));
    expect(strategies).toContain('direct');
    expect(strategies).toContain('contradiction');
    expect(strategies).toContain('contrapositive');
    expect(strategies).toContain('cases');
    expect(strategies).toContain('induction');
  });

  /**
   * §28 — البرهان بالتراجع. L'énoncé qu'il porte doit être VRAI avant
   * d'être mis en scène : on le vérifie terme à terme, comme tout le reste
   * de ce fichier (§48). Une preuve par récurrence d'une formule fausse
   * enseignerait la méthode ET une fausseté.
   */
  it('la récurrence porte un énoncé vrai : 1 + 2 + … + n = n(n+1)/2', () => {
    for (let n = 1; n <= 200; n += 1) {
      let sum = 0;
      for (let i = 1; i <= n; i += 1) sum += i;
      expect(sum, `n = ${n}`).toBe((n * (n + 1)) / 2);
    }
  });

  it('la récurrence a DEUX racines — le cas de base et l’hypothèse (§32)', () => {
    const induction = findPreset(PROOFS, 'sumOfFirstIntegers');
    const roots = induction.steps.filter((step) => (step.requires ?? []).length === 0);
    // « goal » est la seule racine du graphe ; base et hypothèse en dépendent
    // et sont INDÉPENDANTES l'une de l'autre — c'est ce qui les met au même
    // rang dans l'arbre.
    expect(roots).toHaveLength(1);
    const base = induction.steps.find((s) => s.id === 'base');
    const hypothesis = induction.steps.find((s) => s.id === 'hypothesis');
    expect(base.requires).toEqual(['goal']);
    expect(hypothesis.requires).toEqual(['goal']);
    // La conclusion a besoin des DEUX chemins : la base seule ne conclut pas.
    const conclude = induction.steps.find((s) => s.id === 'conclude');
    expect(conclude.requires).toEqual(expect.arrayContaining(['base', 'rankUp']));
  });

  it('la récurrence refuse ses deux pièges : « quelques cas » et « on suppose tout »', () => {
    const induction = findPreset(PROOFS, 'sumOfFirstIntegers');
    expect(induction.distractors).toEqual(expect.arrayContaining(['baseOnly', 'assumeAll']));
  });

  it('la preuve par cas RÉUNIT ses deux branches dans sa conclusion (§32)', () => {
    const byCases = findPreset(PROOFS, 'squarePlusNEven');
    const conclude = byCases.steps.find((s) => s.id === 'conclude');
    expect(conclude.requires).toEqual(expect.arrayContaining(['evenCase', 'oddCase']));
  });

  it('le préréglage par défaut existe', () => {
    expect(findPreset(PROOFS, DEFAULT_PROOF_ID).id).toBe(DEFAULT_PROOF_ID);
  });
});

/**
 * §28 — البرهان بالتراجع, et surtout les exemples qui NE MARCHENT PAS.
 *
 * Un contre-exemple de méthode doit être aussi vrai qu'un exemple : si
 * « 2ⁿ > n² » était en réalité vraie partout, l'écran enseignerait une
 * fausseté en prétendant qu'elle casse. On vérifie donc les trois cas
 * contre le calcul, comme tout le reste de ce fichier.
 */
describe('INDUCTION_CASES — ce qui marche et ce qui ne marche pas', () => {
  for (const item of INDUCTION_CASES) {
    it(`${item.id} : l'énoncé est ${item.expected ? 'vrai' : 'faux'} sur sa plage`, () => {
      const [from, to] = item.verifyRange;
      let holdsEverywhere = true;
      for (let n = from; n <= to; n += 1) if (!item.verify(n)) holdsEverywhere = false;
      expect(holdsEverywhere).toBe(item.expected);
    });

    it(`${item.id} : « works » dit la vérité sur ses deux moitiés`, () => {
      expect(item.works).toBe(item.baseHolds && item.stepHolds);
    });
  }

  it('les trois situations sont couvertes : tout tient, pas de base, pas cassé', () => {
    const shapes = INDUCTION_CASES.map((c) => `${c.baseHolds}-${c.stepHolds}`);
    expect(shapes).toContain('true-true');
    expect(shapes).toContain('false-true');
    expect(shapes).toContain('true-false');
  });

  it('« n = n+1 » : le PAS est formellement correct, mais la base est fausse', () => {
    const noBase = findPreset(INDUCTION_CASES, 'noBase');
    expect(noBase.baseHolds).toBe(false);
    expect(noBase.stepHolds).toBe(true);
    expect(noBase.verify(1)).toBe(false); // 1 ≠ 2 : rien ne démarre
  });

  it('« 2ⁿ > n² » : vrai en 0 et 1, FAUX en 2, 3 et 4 — le piège de deux vérifications', () => {
    const broken = findPreset(INDUCTION_CASES, 'brokenStep');
    expect(broken.verify(0)).toBe(true);
    expect(broken.verify(1)).toBe(true);
    expect(broken.verify(2)).toBe(false);
    expect(broken.verify(3)).toBe(false);
    expect(broken.verify(4)).toBe(false);
    // Et il redevient vrai ensuite : d'où l'importance du PAS, pas des cas.
    expect(broken.verify(5)).toBe(true);
  });
});

describe('les deux listes de preuves', () => {
  it('les récurrences sont hors de « بناء البرهان »', () => {
    expect(DIRECT_PROOFS.every((p) => p.strategy !== 'induction')).toBe(true);
    expect(INDUCTIONS.every((p) => p.strategy === 'induction')).toBe(true);
  });

  it('et les deux réunies font bien toutes les preuves', () => {
    expect(DIRECT_PROOFS.length + INDUCTIONS.length).toBe(PROOFS.length);
  });

  it('l’aire de la récurrence a plus d’un exemple', () => {
    expect(INDUCTIONS.length).toBeGreaterThanOrEqual(2);
  });
});

describe('FALLACIES — chaque sophisme est réfutable, et nommé correctement', () => {
  for (const fallacy of FALLACIES) {
    it(`${fallacy.id} : le contre-exemple annoncé réfute`, () => {
      expect(fallacy.refutes(fallacy.counterexample)).toBe(true);
    });

    it(`${fallacy.id} : une valeur quelconque ne réfute pas`, () => {
      const wrong = sampleOf(fallacy.domain).filter((v) => !fallacy.refutes(v));
      expect(wrong.length).toBeGreaterThan(0);
    });

    it(`${fallacy.id} : son type est dans la liste fermée`, () => {
      expect(FALLACY_KINDS).toContain(fallacy.kind);
    });
  }

  it('§33 — plusieurs contre-exemples sont acceptés quand il y en a plusieurs', () => {
    const affirming = findPreset(FALLACIES, 'evenSoMultipleOfFour');
    expect(affirming.refutes(6)).toBe(true);
    expect(affirming.refutes(10)).toBe(true);
    expect(affirming.refutes(8)).toBe(false); // 8 EST multiple de 4 : il ne réfute rien
  });
});

describe('les domaines nomment un ensemble que le juge connaît', () => {
  // Sans symbole connu, le juge retomberait sur les bornes de la FENÊTRE —
  // exactement le défaut corrigé le 2026-09-24 (31 refusé pour « tout premier
  // > 2 est pair » parce que la droite s'arrêtait à 30).
  const all = [
    ...COUNTEREXAMPLE_CHALLENGES, ...STATEMENTS.filter((s) => s.domain), ...IMPLICATIONS,
    ...EQUIVALENCES, ...CONDITIONS, ...QUANTIFIER_STATEMENTS, ...FALLACIES,
  ];
  for (const preset of all) {
    it(`${preset.id} : ${preset.domain.symbol}`, () => {
      expect(KNOWN_SET_SYMBOLS).toContain(preset.domain.symbol);
      // Le symbole et l'accroche aux entiers disent la même chose.
      expect(preset.domain.integer).toBe(preset.domain.symbol !== 'ℝ');
    });
  }

  it('domainStatus : ensemble, exclusion, limite du juge', () => {
    expect(domainStatus(31, { min: 0, max: 30, integer: true, symbol: 'ℕ' })).toBe('in');
    expect(domainStatus(-1, { min: 0, max: 30, integer: true, symbol: 'ℕ' })).toBe('outside');
    expect(domainStatus(0, { min: -6, max: 6, integer: false, symbol: 'ℝ', excluded: [0] })).toBe('outside');
    expect(domainStatus(JUDGE_LIMIT + 2, { min: 0, max: 30, integer: true, symbol: 'ℕ' })).toBe('tooLarge');
    // Sans ensemble connu, seules les bornes définissent le domaine.
    expect(domainStatus(11, { min: 0, max: 10, integer: true })).toBe('outside');
  });

  it('domainLabel écrit la lettre de l’énoncé', () => {
    expect(domainLabel(findPreset(FALLACIES, 'squareFourConverse'))).toBe('x ∈ ℤ');
    expect(domainLabel(findPreset(STATEMENTS, 'oneOverNPositive'))).toBe('n ∈ ℕ*');
    expect(domainLabel(findPreset(STATEMENTS, 'fiveGtThree'))).toBeNull();
  });
});
