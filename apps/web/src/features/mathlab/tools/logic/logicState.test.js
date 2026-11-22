/**
 * L'ÉTAT de l'atelier de logique : le document, sa frontière, ses transitions.
 *
 * Deux exigences du cahier des charges sont vérifiées ici plutôt que relues :
 * §54 (le laboratoire ouvre sur une EXPÉRIENCE, pas sur un menu) et la règle
 * de MATH_LAB.md §4 : rien de ce qui vient de la base n'est cru sur parole,
 * et rien de ce qui se calcule n'est stocké.
 */

import { describe, it, expect } from 'vitest';
import {
  LOGIC_SCHEMA_VERSION, AREAS, VERDICTS, IMPLICATION_FORMS, PROOF_MODES, MAX_TRIED,
  createLogicData, normalizeLogicData, applySeed, clearLogicData,
  setArea, setStatement, setStatementGuess, revealStatement, setProbe,
  setConnector, setOperand, setImplication, setImplicationForm, setImplicationX, toggleSets,
  setEquivalence, setCounterexampleChallenge, setCandidate, tryCandidate, setQuantifier, tryQuantifierValue,
  setProof, setProofMode, placeStep, undoStep, resetProof, nextGap,
  setStairsSequence, setStairsRule, recordStairVerdict, setStairsCursor, setStairsMode, resetStairs,
  setFallacy, nameFallacy, tryFallacyValue,
  togglePractice, setPracticeLevel, recordSolved, recordSeen, recordHint,
} from './logicState.js';
import { STATEMENTS, IMPLICATIONS, PROOFS, INDUCTION_SEQUENCES } from './presets.js';

describe('le document d’ouverture (§54)', () => {
  const data = createLogicData();

  it('n’ouvre PAS sur un menu : il ouvre sur le laboratoire du contre-exemple', () => {
    expect(data.area).toBe('counterexample');
    expect(data.counterexample.id).toBe('primeGtTwoIsEven');
    expect(data.counterexample.found).toBeNull();
    expect(data.counterexample.tried).toEqual([]);
  });

  it('a un schemaVersion entier ≥ 1', () => {
    expect(Number.isInteger(LOGIC_SCHEMA_VERSION)).toBe(true);
    expect(LOGIC_SCHEMA_VERSION).toBeGreaterThanOrEqual(1);
  });

  it('chaque aire a son propre sous-état', () => {
    for (const area of AREAS) expect(data[area]).toBeDefined();
  });

  it('ne garde AUCUN résultat calculable — pas de table, pas de régions, pas de verdict de recherche', () => {
    const serialized = JSON.stringify(data);
    for (const forbidden of ['truthTable', 'intervals', 'partition', 'rows', 'sample', 'challenge']) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it('deux documents neufs ne partagent pas leurs tableaux', () => {
    const a = createLogicData();
    const b = createLogicData();
    a.counterexample.tried.push(1);
    a.proof.placed.push('given');
    expect(b.counterexample.tried).toEqual([]);
    expect(b.proof.placed).toEqual([]);
  });

  it('tient LARGEMENT sous la borne serveur de 8 Ko (MathLabTools.php)', () => {
    const full = { ...createLogicData() };
    full.counterexample = { ...full.counterexample, tried: Array.from({ length: MAX_TRIED }, (_, i) => i) };
    full.quantifiers = { ...full.quantifiers, tried: Array.from({ length: MAX_TRIED }, (_, i) => -i) };
    full.fallacy = { ...full.fallacy, tried: Array.from({ length: MAX_TRIED }, (_, i) => i * 3) };
    full.proof = { ...full.proof, placed: PROOFS[2].steps.map((s) => s.id) };
    const bytes = new TextEncoder().encode(JSON.stringify(full)).length;
    expect(bytes).toBeLessThan(8_000);
  });
});

describe('applySeed — une leçon amorce, sans jamais fabriquer un document illisible', () => {
  it('règle l’aire, le préréglage et le connecteur', () => {
    const data = applySeed(createLogicData(), {
      area: 'implication', implicationId: 'xEqTwoImpliesSquareEqFour', connector: 'iff',
    });
    expect(data.area).toBe('implication');
    expect(data.implication.id).toBe('xEqTwoImpliesSquareEqFour');
    expect(data.connectors.connector).toBe('iff');
  });

  it('ignore ce qui n’existe pas', () => {
    const data = applySeed(createLogicData(), { area: 'nope', implicationId: 'nope', connector: 'xor' });
    expect(data.area).toBe('counterexample');
    expect(data.implication.id).toBe(IMPLICATIONS[0].id);
  });

  it('ne lève pas sur une amorce absente ou absurde', () => {
    for (const seed of [null, undefined, 42, 'x', []]) {
      expect(() => applySeed(createLogicData(), seed)).not.toThrow();
    }
  });
});

describe('normalizeLogicData — un document abîmé s’ouvre quand même', () => {
  it('rend le document par défaut pour une entrée vide', () => {
    expect(normalizeLogicData(null)).toEqual(createLogicData());
    expect(normalizeLogicData({})).toEqual(createLogicData());
  });

  it('ne lève JAMAIS, quelle que soit la forme reçue', () => {
    const rubbish = [null, undefined, {}, [], 'x', 42, { area: 42 }, { proof: 'non' },
      { connectors: { p: 'oui' } }, { counterexample: { tried: 'non' } }, { practice: { level: 99 } }];
    for (const value of rubbish) expect(() => normalizeLogicData(value)).not.toThrow();
  });

  it('rejette une aire, un verdict, une forme ou un mode hors énumération', () => {
    const data = normalizeLogicData({
      area: 'hacked',
      statements: { verdict: 'peut-être' },
      implication: { form: 'diagonal' },
      proof: { mode: 'triche' },
    });
    expect(AREAS).toContain(data.area);
    expect(data.statements.verdict).toBeNull();
    expect(IMPLICATION_FORMS).toContain(data.implication.form);
    expect(PROOF_MODES).toContain(data.proof.mode);
  });

  it('un identifiant de préréglage disparu retombe sur le défaut, l’aire reste utilisable', () => {
    const data = normalizeLogicData({ statements: { id: 'retiré' }, proof: { id: 'retirée' } });
    expect(STATEMENTS.some((s) => s.id === data.statements.id)).toBe(true);
    expect(PROOFS.some((p) => p.id === data.proof.id)).toBe(true);
  });

  it('écarte une étape de preuve inconnue plutôt que d’afficher une carte fantôme', () => {
    const data = normalizeLogicData({ proof: { id: 'evenSquareIsEven', placed: ['given', 'inventée', 'rewrite'] } });
    expect(data.proof.placed).toEqual(['given', 'rewrite']);
  });

  it('borne les listes d’essais', () => {
    const many = Array.from({ length: 500 }, (_, i) => i);
    const data = normalizeLogicData({
      counterexample: { tried: many }, quantifiers: { tried: many }, fallacy: { tried: many },
    });
    expect(data.counterexample.tried.length).toBeLessThanOrEqual(MAX_TRIED);
    expect(data.quantifiers.tried.length).toBeLessThanOrEqual(MAX_TRIED);
    expect(data.fallacy.tried.length).toBeLessThanOrEqual(MAX_TRIED);
  });

  it('garde un booléen pour P et Q, et rejette tout le reste', () => {
    expect(normalizeLogicData({ connectors: { p: false, q: true } }).connectors).toMatchObject({ p: false, q: true });
    const fallback = createLogicData().connectors;
    expect(normalizeLogicData({ connectors: { p: 'oui', q: 3 } }).connectors).toMatchObject({ p: fallback.p, q: fallback.q });
  });

  it('borne le niveau d’entraînement et arrondit les compteurs', () => {
    const data = normalizeLogicData({ practice: { level: 99, solved: 3.7, seen: -5 } });
    expect(data.practice.level).toBeLessThanOrEqual(4);
    expect(Number.isInteger(data.practice.solved)).toBe(true);
    expect(data.practice.seen).toBeGreaterThanOrEqual(0);
  });

  it('round-trip : normaliser un document neuf ne le change pas', () => {
    expect(normalizeLogicData(createLogicData())).toEqual(createLogicData());
  });
});

describe('les transitions — pures, et jamais destructrices par surprise', () => {
  const base = createLogicData();

  it('setArea n’accepte qu’une aire connue', () => {
    expect(setArea(base, 'proof').area).toBe('proof');
    expect(setArea(base, 'nope')).toBe(base);
  });

  it('changer d’énoncé remet le verdict et la prédiction à zéro', () => {
    const guessed = revealStatement(setStatementGuess(base, 'true'), 'depends');
    const switched = setStatement(guessed, 'squareNonNegative');
    expect(switched.statements.guess).toBeNull();
    expect(switched.statements.verdict).toBeNull();
  });

  it('la prédiction et la révélation n’acceptent que des verdicts connus', () => {
    expect(setStatementGuess(base, 'true').statements.guess).toBe('true');
    expect(setStatementGuess(base, 'oui')).toBe(base);
    expect(VERDICTS).toContain(revealStatement(base, 'false').statements.verdict);
  });

  it('setProbe borne la sonde et ignore le non-numérique', () => {
    expect(setProbe(base, 3).statements.probe).toBe(3);
    expect(setProbe(base, 'x').statements.probe).toBe(base.statements.probe);
  });

  it('setConnector / setOperand ne prennent que du valide', () => {
    expect(setConnector(base, 'or').connectors.connector).toBe('or');
    expect(setConnector(base, 'xor')).toBe(base);
    expect(setOperand(base, 'p', false).connectors.p).toBe(false);
    expect(setOperand(base, 'z', true)).toBe(base);
  });

  it('l’implication : préréglage, forme, x, ensembles', () => {
    expect(setImplication(base, 'divisibleByFourImpliesEven').implication.id).toBe('divisibleByFourImpliesEven');
    expect(setImplicationForm(base, 'contrapositive').implication.form).toBe('contrapositive');
    expect(setImplicationX(base, 7).implication.x).toBe(7);
    expect(toggleSets(base).implication.showSets).toBe(!base.implication.showSets);
    expect(setEquivalence(base, 'squareEqSelfIffZeroOrOne').equivalence.id).toBe('squareEqSelfIffZeroOrOne');
  });

  it('changer de défi de contre-exemple efface les essais de l’ancien', () => {
    const tried = tryCandidate(base, 3, true);
    expect(tried.counterexample.tried).toEqual([3]);
    expect(tried.counterexample.found).toBe(3);
    const switched = setCounterexampleChallenge(tried, 'everyPrimeIsOdd');
    expect(switched.counterexample.tried).toEqual([]);
    expect(switched.counterexample.found).toBeNull();
  });

  it('un essai n’est enregistré qu’une fois, et un échec n’efface pas une trouvaille', () => {
    let data = tryCandidate(base, 9, false);
    data = tryCandidate(data, 9, false);
    expect(data.counterexample.tried).toEqual([9]);
    data = tryCandidate(data, 3, true);
    data = tryCandidate(data, 5, false);
    expect(data.counterexample.found).toBe(3);
    expect(data.counterexample.tried).toEqual([9, 3, 5]);
  });

  it('setCandidate ne bouge que le curseur, pas les essais', () => {
    expect(setCandidate(base, 12).counterexample.candidate).toBe(12);
    expect(setCandidate(base, 12).counterexample.tried).toEqual([]);
  });

  it('les quantificateurs : premier témoin et premier contre-exemple sont gardés', () => {
    let data = tryQuantifierValue(base, 5, true);
    data = tryQuantifierValue(data, 7, true);
    data = tryQuantifierValue(data, 0, false);
    data = tryQuantifierValue(data, -1, false);
    expect(data.quantifiers.witness).toBe(5);
    expect(data.quantifiers.counterexample).toBe(0);
    expect(data.quantifiers.tried).toEqual([5, 7, 0, -1]);
  });

  it('changer de quantificateur repart de zéro', () => {
    const used = tryQuantifierValue(base, 5, true);
    expect(setQuantifier(used, 'existsSquareFour').quantifiers.witness).toBeNull();
  });

  it('la preuve : poser, défaire, remettre à zéro', () => {
    let data = setProof(base, 'evenSquareIsEven');
    data = placeStep(data, 'given');
    data = placeStep(data, 'rewrite');
    expect(data.proof.placed).toEqual(['given', 'rewrite']);
    // Une étape déjà posée ne se pose pas deux fois.
    expect(placeStep(data, 'given').proof.placed).toEqual(['given', 'rewrite']);
    expect(undoStep(data).proof.placed).toEqual(['given']);
    expect(resetProof(data).proof.placed).toEqual([]);
  });

  it('changer de preuve ou de mode vide le plateau', () => {
    const placed = placeStep(setProof(base, 'evenSquareIsEven'), 'given');
    expect(setProof(placed, 'sqrtTwoIrrational').proof.placed).toEqual([]);
    expect(setProofMode(placed, 'order').proof.placed).toEqual([]);
  });

  it('nextGap change la graine et vide le plateau', () => {
    const next = nextGap(base);
    expect(next.proof.gapSeed).not.toBe(base.proof.gapSeed);
    expect(next.proof.placed).toEqual([]);
  });

  it('le sophisme : nommer, essayer, changer', () => {
    let data = nameFallacy(base, 'invalidConverse');
    data = tryFallacyValue(data, -2);
    expect(data.fallacy.kind).toBe('invalidConverse');
    expect(data.fallacy.tried).toEqual([-2]);
    expect(setFallacy(data, 'evenSoMultipleOfFour').fallacy.kind).toBeNull();
  });

  it('l’entraînement : ouvrir, régler le niveau, compter', () => {
    expect(togglePractice(base).practice.open).toBe(true);
    expect(setPracticeLevel(base, 3).practice.level).toBe(3);
    expect(setPracticeLevel(base, 42).practice.level).toBe(4);
    expect(recordSolved(base).practice.solved).toBe(1);
    expect(recordSeen(base).practice.seen).toBe(1);
    expect(recordHint(base).practice.hintsUsed).toBe(1);
  });

  it('aucune transition ne MUTE son entrée', () => {
    const snapshot = JSON.stringify(base);
    placeStep(base, 'given');
    tryCandidate(base, 3, true);
    setArea(base, 'proof');
    recordSolved(base);
    expect(JSON.stringify(base)).toBe(snapshot);
  });

  it('« Tout recommencer » rend exactement un document neuf', () => {
    expect(clearLogicData()).toEqual(createLogicData());
  });
});

/**
 * §11, §15, §28 — L'ESCALIER dans le document.
 *
 * Ce qui compte ici est §15 : une règle différente EFFACE les verdicts. Les
 * garder serait un mensonge visuel sur le point précis que l'écran enseigne.
 */
describe('l’escalier : son état et ses transitions', () => {
  const base = createLogicData();

  it('ouvre sur une suite, sans règle et sans verdict', () => {
    expect(base.stairs.sequenceId).toBe(INDUCTION_SEQUENCES[0].id);
    expect(base.stairs.rule).toBe('');
    expect(base.stairs.statuses).toEqual([]);
    expect(base.stairs.cursor).toBe(0);
  });

  it('ne garde AUCUNE valeur calculée — elles se refont de la règle', () => {
    const serialized = JSON.stringify(base.stairs);
    for (const forbidden of ['expected', 'actual', 'values', 'terms']) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it('écrire une règle la garde, même invalide (l’élève doit la retrouver)', () => {
    expect(setStairsRule(base, '2n +').stairs.rule).toBe('2n +');
  });

  it('§15 — une règle DIFFÉRENTE efface les verdicts', () => {
    let data = setStairsRule(base, '2n + 1');
    data = recordStairVerdict(data, 0, 'correct');
    data = recordStairVerdict(data, 1, 'correct');
    expect(data.stairs.statuses).toEqual(['correct', 'correct']);

    const changed = setStairsRule(data, '2n');
    expect(changed.stairs.statuses).toEqual([]);
    expect(changed.stairs.cursor).toBe(0);
  });

  it('§15 — la MÊME règle réécrite (espaces, casse) ne les efface pas', () => {
    let data = setStairsRule(base, '2n + 1');
    data = recordStairVerdict(data, 0, 'correct');
    expect(setStairsRule(data, '  2N + 1 ').stairs.statuses).toEqual(['correct']);
  });

  it('changer de suite repart de zéro', () => {
    let data = setStairsRule(base, '2n + 1');
    data = recordStairVerdict(data, 0, 'correct');
    const switched = setStairsSequence(data, 'squares');
    expect(switched.stairs.sequenceId).toBe('squares');
    expect(switched.stairs.statuses).toEqual([]);
    expect(switched.stairs.rule).toBe('');
  });

  it('un verdict se pose à son rang, en comblant les trous', () => {
    const data = recordStairVerdict(base, 2, 'incorrect');
    expect(data.stairs.statuses).toEqual(['untested', 'untested', 'incorrect']);
  });

  it('refuse un rang ou un statut absurde plutôt que de corrompre l’escalier', () => {
    expect(recordStairVerdict(base, -1, 'correct')).toBe(base);
    expect(recordStairVerdict(base, 0, 'prouvé')).toBe(base);
    expect(recordStairVerdict(base, 1.5, 'correct')).toBe(base);
  });

  it('le curseur et le mode sont bornés', () => {
    expect(setStairsCursor(base, 3).stairs.cursor).toBe(3);
    expect(setStairsCursor(base, 999).stairs.cursor).toBe(20);
    expect(setStairsMode(base, 'discover').stairs.mode).toBe('discover');
    expect(setStairsMode(base, 'triche')).toBe(base);
  });

  it('« Reprendre le test depuis le début » efface les verdicts mais GARDE la règle', () => {
    let data = setStairsRule(base, 'n^2');
    data = recordStairVerdict(data, 0, 'correct');
    const reset = resetStairs(data);
    expect(reset.stairs.statuses).toEqual([]);
    expect(reset.stairs.rule).toBe('n^2');
  });

  it('un document abîmé s’ouvre quand même', () => {
    const data = normalizeLogicData({
      stairs: { sequenceId: 'inexistante', rule: 42, statuses: ['prouvé', 'correct'], cursor: 'x', mode: 'triche' },
    });
    expect(INDUCTION_SEQUENCES.some((s) => s.id === data.stairs.sequenceId)).toBe(true);
    expect(typeof data.stairs.rule).toBe('string');
    expect(data.stairs.statuses).toEqual(['correct']);
    expect(Number.isInteger(data.stairs.cursor)).toBe(true);
    expect(['climb', 'discover']).toContain(data.stairs.mode);
  });

  it('une règle démesurée est tronquée, pas refusée', () => {
    const data = setStairsRule(base, 'n'.repeat(500));
    expect(data.stairs.rule.length).toBeLessThanOrEqual(200);
  });
});

describe('les valeurs essayées restent bornées même après un long usage', () => {
  it('ne dépasse jamais MAX_TRIED', () => {
    let data = createLogicData();
    for (let i = 0; i < 200; i += 1) data = tryCandidate(data, i, false);
    expect(data.counterexample.tried.length).toBeLessThanOrEqual(MAX_TRIED);
  });
});
