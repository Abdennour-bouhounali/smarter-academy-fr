import { describe, it, expect } from 'vitest';
import {
  CHALLENGE_KINDS, generateChallenge, parseAnswer, checkAnswer,
  relativeTolerance, explainTerms, kindsForSpec, revealTarget, trueBehaviours,
} from './practice.js';
import { buildDefinition } from './sequenceModel.js';
import { generate, termAt, analyseTrend } from './sequenceMath.js';

/**
 * L'ENTRAÎNEMENT (§27, §28, §29).
 *
 * La vérification centrale de ce fichier n'est pas qu'une question s'affiche :
 * c'est que la RÉPONSE ATTENDUE soit la vraie mathématique. Une question
 * d'entraînement dont la correction est fausse est bien pire que pas
 * d'entraînement du tout — elle apprend l'erreur. On recalcule donc chaque
 * réponse avec le moteur, sur des centaines de graines.
 */

/** Complète une spécification de défi pour la donner au moteur. */
const fullSpec = (spec) => ({
  kind: 'arithmetic', startIndex: 0, first: 0, second: 0, difference: 0,
  ratio: 0, a: 0, b: 0, explicitSource: '0', ruleSource: '0', ...spec,
});

describe('la fabrication d’un défi', () => {
  it('rend toujours un défi complet, quelle que soit la graine', () => {
    for (let seed = 1; seed <= 300; seed += 1) {
      const challenge = generateChallenge(seed);
      expect(CHALLENGE_KINDS, `graine ${seed}`).toContain(challenge.kind);
      expect(typeof challenge.promptKey, `graine ${seed}`).toBe('string');
      expect(challenge.promptKey.startsWith('tools.sequences.practice.q.'), challenge.promptKey).toBe(true);
      expect(Array.isArray(challenge.hintKeys), `graine ${seed}`).toBe(true);
      expect(challenge.hintKeys.length, `graine ${seed}`).toBeGreaterThan(0);
      expect(typeof challenge.explainKey, `graine ${seed}`).toBe('string');
      expect(challenge.spec, `graine ${seed}`).toBeTruthy();
      expect(['number', 'choice'], `graine ${seed}`).toContain(challenge.answerType);
    }
  });

  it('est REPRODUCTIBLE : la même graine rend le même défi', () => {
    expect(generateChallenge(42)).toEqual(generateChallenge(42));
    expect(generateChallenge(7)).not.toEqual(generateChallenge(8));
  });

  it('visite les SIX familles de questions — pas une seule, encore et encore', () => {
    const seen = new Set();
    for (let seed = 1; seed <= 300; seed += 1) seen.add(generateChallenge(seed).kind);
    // Le piège du générateur mal mélangé (documenté dans trigonometry/practice.js)
    // se manifesterait par une seule famille ici.
    expect(seen.size).toBe(CHALLENGE_KINDS.length);
  });

  it('respecte les familles demandées', () => {
    for (let seed = 1; seed <= 60; seed += 1) {
      const challenge = generateChallenge(seed, { kinds: ['behaviour'] });
      expect(challenge.kind).toBe('behaviour');
    }
  });

  it('une liste de familles vide ou absurde retombe sur toutes', () => {
    expect(CHALLENGE_KINDS).toContain(generateChallenge(1, { kinds: [] }).kind);
    expect(CHALLENGE_KINDS).toContain(generateChallenge(1, { kinds: ['inventé'] }).kind);
  });
});

describe('la réponse attendue EST la vraie mathématique', () => {
  it('chaque défi numérique à terme cible est confirmé par le moteur', () => {
    let checked = 0;
    for (let seed = 1; seed <= 400; seed += 1) {
      const challenge = generateChallenge(seed);
      if (challenge.answerType !== 'number' || !Number.isFinite(challenge.targetIndex)) continue;
      if (challenge.kind === 'limitValue') continue;   // vérifié à part, c'est une limite
      const built = buildDefinition(fullSpec(challenge.spec));
      expect(built.ok, `graine ${seed}`).toBe(true);
      const truth = termAt(built.definition, challenge.targetIndex);
      expect(truth.ok, `graine ${seed} (${challenge.kind})`).toBe(true);
      expect(Math.abs(truth.value - challenge.expected), `graine ${seed} (${challenge.kind})`).toBeLessThan(1e-6);
      checked += 1;
    }
    expect(checked).toBeGreaterThan(50);
  });

  it('une question « trouve la raison » attend la raison réelle de la suite montrée', () => {
    let checked = 0;
    for (let seed = 1; seed <= 400; seed += 1) {
      const challenge = generateChallenge(seed);
      if (challenge.kind !== 'findRule') continue;
      const key = challenge.spec.kind === 'geometric' ? 'ratio' : 'difference';
      expect(challenge.spec[key], `graine ${seed}`).toBeCloseTo(challenge.expected, 9);
      checked += 1;
    }
    expect(checked).toBeGreaterThan(10);
  });

  it('une question de comportement dit ce que le MOTEUR observe — pas autre chose', () => {
    let checked = 0;
    for (let seed = 1; seed <= 400; seed += 1) {
      const challenge = generateChallenge(seed);
      if (challenge.kind !== 'behaviour') continue;
      const built = buildDefinition(fullSpec(challenge.spec));
      const run = generate(built.definition, 14);
      const observed = analyseTrend(built.definition, run.terms).status;
      expect(observed, `graine ${seed} : le défi annonce ${challenge.expected}`).toBe(challenge.expected);
      expect(challenge.choices).toContain(challenge.expected);
      checked += 1;
    }
    expect(checked).toBeGreaterThan(20);
  });

  it('une question de limite attend la valeur dont les termes s’approchent vraiment', () => {
    let checked = 0;
    for (let seed = 1; seed <= 400; seed += 1) {
      const challenge = generateChallenge(seed);
      if (challenge.kind !== 'limitValue') continue;
      const built = buildDefinition(fullSpec(challenge.spec));
      const far = termAt(built.definition, 80);
      expect(far.ok, `graine ${seed}`).toBe(true);
      expect(Math.abs(far.value - challenge.expected), `graine ${seed}`).toBeLessThan(0.01);
      checked += 1;
    }
    expect(checked).toBeGreaterThan(10);
  });

  it('les nombres proposés restent PROPRES : pas d’exercice en 0,37 (§30)', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const challenge = generateChallenge(seed);
      if (challenge.answerType !== 'number') continue;
      // La réponse attendue ne doit pas être un décimal interminable.
      const decimals = String(challenge.expected).split('.')[1] ?? '';
      expect(decimals.length, `graine ${seed} : ${challenge.expected}`).toBeLessThanOrEqual(6);
    }
  });
});

describe('la lecture d’une réponse (§27)', () => {
  it('accepte les écritures équivalentes', () => {
    expect(parseAnswer('17')).toBe(17);
    expect(parseAnswer('0,5')).toBe(0.5);
    expect(parseAnswer('0.5')).toBe(0.5);
    expect(parseAnswer('1/2')).toBe(0.5);
    expect(parseAnswer('−2,5')).toBe(-2.5);
    expect(parseAnswer('٣')).toBe(3);
    expect(parseAnswer(' 7 ')).toBe(7);
    expect(parseAnswer(17)).toBe(17);
  });

  it('accepte un grand nombre avec ses séparateurs, tel qu’on le lui a montré', () => {
    expect(parseAnswer('1 048 576')).toBe(1048576);
    expect(parseAnswer('1 048 576')).toBe(1048576);
  });

  it('refuse ce qui n’est pas un nombre', () => {
    expect(parseAnswer('quatre')).toBeNaN();
    expect(parseAnswer('')).toBeNaN();
    expect(parseAnswer('1/0')).toBeNaN();
    expect(parseAnswer(null)).toBeNaN();
    expect(parseAnswer({})).toBeNaN();
  });
});

describe('le verdict : trois valeurs, jamais un verrou (§27, §29)', () => {
  it('distingue juste, faux, et ILLISIBLE', () => {
    const challenge = { answerType: 'number', expected: 17 };
    expect(checkAnswer(challenge, '17')).toEqual({ correct: true, readable: true });
    expect(checkAnswer(challenge, '20')).toEqual({ correct: false, readable: true });
    // « quatre » n'est pas une erreur de mathématiques : c'est une saisie
    // qu'on n'a pas su lire, et le dire est la vérité.
    expect(checkAnswer(challenge, 'quatre')).toEqual({ correct: false, readable: false });
    expect(checkAnswer(challenge, '')).toEqual({ correct: false, readable: false });
  });

  it('accepte une écriture équivalente de la bonne réponse', () => {
    const challenge = { answerType: 'number', expected: 0.5 };
    expect(checkAnswer(challenge, '1/2').correct).toBe(true);
    expect(checkAnswer(challenge, '0,5').correct).toBe(true);
    expect(checkAnswer(challenge, '0.5').correct).toBe(true);
  });

  it('tolère RELATIVEMENT sur les grands nombres, sévèrement sur les petits', () => {
    expect(checkAnswer({ answerType: 'number', expected: 1048576 }, '1048576').correct).toBe(true);
    expect(checkAnswer({ answerType: 'number', expected: 1048576 }, '1048000').correct).toBe(false);
    expect(checkAnswer({ answerType: 'number', expected: 3 }, '3,1').correct).toBe(false);
    expect(relativeTolerance(1e6)).toBeGreaterThan(relativeTolerance(1));
    expect(relativeTolerance(Number.NaN)).toBe(1e-3);
  });

  it('une question de limite tolère largement : 4 pour des termes à 3,998', () => {
    const challenge = [...Array(400).keys()]
      .map((index) => generateChallenge(index + 1))
      .find((candidate) => candidate.kind === 'limitValue');
    expect(checkAnswer(challenge, String(challenge.expected)).correct).toBe(true);
    expect(challenge.tolerance).toBeGreaterThan(0.1);
  });

  it('un choix se vérifie par égalité', () => {
    const challenge = { answerType: 'choice', expected: 'increasing', choices: ['increasing', 'decreasing'] };
    expect(checkAnswer(challenge, 'increasing')).toEqual({ correct: true, readable: true });
    expect(checkAnswer(challenge, 'decreasing')).toEqual({ correct: false, readable: true });
    expect(checkAnswer(challenge, '')).toEqual({ correct: false, readable: false });
  });

  it('sans défi, aucun verdict — et surtout aucune exception', () => {
    expect(checkAnswer(null, '5')).toEqual({ correct: false, readable: false });
    expect(checkAnswer({ answerType: 'inconnu' }, '5')).toEqual({ correct: false, readable: false });
  });

  it('il n’y a AUCUN état de blocage dans ce module (§27)', async () => {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const source = readFileSync(fileURLToPath(new URL('./practice.js', import.meta.url)), 'utf8');
    const code = source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .filter((line) => !line.trim().startsWith('//'))
      .join('\n');
    // Aucun champ ne peut verrouiller l'élève, donc aucun ne peut arriver.
    expect(code).not.toMatch(/\b(blocked|locked|gameOver|failed)\b/);
  });
});

describe('l’explication montre les VRAIS termes (§29)', () => {
  it('rend la suite calculée jusqu’au terme demandé', () => {
    const challenge = {
      spec: { kind: 'arithmetic', startIndex: 0, first: 2, difference: 3 },
      expected: 14, targetIndex: 4,
    };
    const explanation = explainTerms(challenge);
    expect(explanation.terms.map((term) => term.value)).toEqual([2, 5, 8, 11, 14]);
    expect(explanation.expected).toBe(14);
  });

  it('pour une limite, montre le début ET le terme lointain', () => {
    const challenge = [...Array(400).keys()]
      .map((index) => generateChallenge(index + 1))
      .find((candidate) => candidate.kind === 'limitValue');
    const explanation = explainTerms(challenge);
    expect(explanation.truncated).toBe(true);
    const far = explanation.terms[explanation.terms.length - 1];
    expect(far.far).toBe(true);
    expect(far.n).toBe(challenge.targetIndex);
    expect(Math.abs(far.value - challenge.expected)).toBeLessThan(0.01);
  });

  it('chaque défi engendré sait s’expliquer', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const explanation = explainTerms(generateChallenge(seed));
      expect(explanation, `graine ${seed}`).not.toBeNull();
      expect(explanation.terms.length, `graine ${seed}`).toBeGreaterThan(1);
      expect(explanation.terms.every((term) => Number.isFinite(term.value)), `graine ${seed}`).toBe(true);
    }
  });

  it('sans défi, aucune explication inventée', () => {
    expect(explainTerms(null)).toBeNull();
    expect(explainTerms({})).toBeNull();
  });
});

describe('la révélation POSE la suite dans l’espace (§27)', () => {
  it('rend la spécification, le nombre de termes, et la lecture qui explique', () => {
    const arithmetic = revealTarget({ spec: { kind: 'arithmetic', first: 2, difference: 3 }, targetIndex: 5 });
    expect(arithmetic.spec.kind).toBe('arithmetic');
    expect(arithmetic.count).toBeGreaterThan(5);
    expect(arithmetic.cursor).toBe(5);
    // une arithmétique s'explique par ses DIFFÉRENCES, une géométrique par ses rapports
    expect(arithmetic.layer).toBe('differences');
    expect(revealTarget({ spec: { kind: 'geometric' }, targetIndex: 3 }).layer).toBe('ratios');
  });

  it('le curseur révélé reste DANS les termes engendrés', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const target = revealTarget(generateChallenge(seed));
      if (!target) continue;
      expect(target.cursor, `graine ${seed}`).toBeLessThan(target.count);
      expect(target.cursor, `graine ${seed}`).toBeGreaterThanOrEqual(0);
    }
  });

  it('sans défi, rien à révéler', () => {
    expect(revealTarget(null)).toBeNull();
    expect(revealTarget({})).toBeNull();
  });
});

describe('les familles pertinentes pour la suite affichée', () => {
  it('ne demande pas une limite sur une suite arithmétique, qui n’en a pas', () => {
    expect(kindsForSpec({ kind: 'arithmetic' })).not.toContain('limitValue');
    expect(kindsForSpec({ kind: 'geometric' })).not.toContain('limitValue');
    expect(kindsForSpec({ kind: 'affine' })).toContain('limitValue');
  });

  it('sans suite, toutes les familles sont possibles', () => {
    expect(kindsForSpec(null)).toEqual([...CHALLENGE_KINDS]);
    expect(kindsForSpec({ kind: 'explicit' })).toEqual([...CHALLENGE_KINDS]);
  });

  it('chaque famille proposée existe bel et bien', () => {
    for (const kind of ['arithmetic', 'geometric', 'affine', 'explicit', 'recurrence', 'secondOrder']) {
      for (const proposed of kindsForSpec({ kind })) {
        expect(CHALLENGE_KINDS, `${kind} → ${proposed}`).toContain(proposed);
      }
    }
  });
});

/**
 * RÉGRESSION — les étiquettes de comportement ne s'excluent pas.
 *
 * Une arithmétique de raison 4 est متزايدة ET تتباعد ; une géométrique de
 * raison 0,5 est متناقصة ET تقترب من قيمة. Le défi n'acceptait qu'une
 * étiquette et refusait l'autre, pourtant vraie.
 *
 * La vérité est recalculée ICI, sur 400 termes itérés un par un — pas sur la
 * forme fermée de `trueBehaviours` — pour que le test ne recopie pas le code.
 */
describe('le comportement : toute étiquette VRAIE est acceptée, toute fausse refusée', () => {
  const N = 400;

  /** Les termes u₀ … u_{N−1}, par la définition de récurrence. */
  function iterate(spec) {
    const terms = [spec.first];
    for (let n = 1; n < N; n += 1) {
      const previous = terms[n - 1];
      terms.push(spec.kind === 'arithmetic' ? previous + spec.difference : previous * spec.ratio);
    }

    return terms;
  }

  /** La table de vérité des cinq étiquettes, lue sur les termes. */
  function truthTable(spec) {
    const u = iterate(spec);
    const pairs = u.slice(1).map((value, n) => [u[n], value]);
    const increasing = pairs.every(([a, b]) => b - a > 0);
    const decreasing = pairs.every(([a, b]) => b - a < 0);
    const alternating = pairs.every(([a, b]) => a * b < 0);
    // Convergente : la queue est de Cauchy et bornée (400 termes suffisent à
    // départager |q| < 1, q = ±1 et |q| > 1, r ≠ 0).
    const tail = u.slice(N - 50);
    const converges = tail.every((v) => Number.isFinite(v))
      && Math.max(...tail) - Math.min(...tail) < 1e-9;

    return {
      increasing, decreasing, alternating, approaching: converges, diverging: !converges,
    };
  }

  it('sur 600 graines et trois difficultés, le verdict suit la table de vérité', () => {
    const seen = new Set();
    let checked = 0;
    for (const difficulty of ['easy', 'normal', 'hard']) {
      for (let seed = 1; seed <= 600; seed += 1) {
        const challenge = generateChallenge(seed, { kinds: ['behaviour'], difficulty });
        const truth = truthTable(challenge.spec);
        // L'étiquette principale est vraie, elle aussi.
        expect(truth[challenge.expected], `graine ${seed} : ${challenge.expected}`).toBe(true);
        for (const choice of challenge.choices) {
          expect(
            checkAnswer(challenge, choice).correct,
            `graine ${seed} ${JSON.stringify(challenge.spec)} : « ${choice} »`,
          ).toBe(truth[choice]);
          if (truth[choice] && choice !== challenge.expected) seen.add(`${challenge.expected}+${choice}`);
        }
        checked += 1;
      }
    }
    expect(checked).toBe(1800);
    // Les quatre recouvrements signalés par l'audit sont bien couverts.
    for (const pair of ['approaching+decreasing', 'increasing+diverging', 'decreasing+diverging', 'diverging+increasing']) {
      expect(seen, pair).toContain(pair);
    }
  });

  it('les cas nommés par l’audit, un par un', () => {
    const behaviour = (spec, expected) => ({
      answerType: 'choice', expected, accepted: trueBehaviours(spec),
    });
    const geoHalf = behaviour({ kind: 'geometric', first: 11, ratio: 0.5 }, 'approaching');
    expect(checkAnswer(geoHalf, 'decreasing').correct).toBe(true);
    expect(checkAnswer(geoHalf, 'diverging').correct).toBe(false);
    const arithUp = behaviour({ kind: 'arithmetic', first: 2, difference: 4 }, 'increasing');
    expect(checkAnswer(arithUp, 'diverging').correct).toBe(true);
    expect(checkAnswer(arithUp, 'approaching').correct).toBe(false);
    const arithDown = behaviour({ kind: 'arithmetic', first: 15, difference: -5 }, 'decreasing');
    expect(checkAnswer(arithDown, 'diverging').correct).toBe(true);
    const geoTwo = behaviour({ kind: 'geometric', first: 3, ratio: 2 }, 'diverging');
    expect(checkAnswer(geoTwo, 'increasing').correct).toBe(true);
    expect(checkAnswer(geoTwo, 'decreasing').correct).toBe(false);
    // (−1)ⁿ oscille sans limite : متباعدة au sens du programme.
    const flip = behaviour({ kind: 'geometric', first: 4, ratio: -1 }, 'alternating');
    expect(checkAnswer(flip, 'diverging').correct).toBe(true);
    expect(checkAnswer(flip, 'approaching').correct).toBe(false);
  });

  it('trueBehaviours : un premier terme négatif renverse le sens de variation', () => {
    // u₀ = −8, q = 0,5 : −8, −4, −2… CROISSANTE, et convergente vers 0.
    expect(trueBehaviours({ kind: 'geometric', first: -8, ratio: 0.5 })).toEqual(['increasing', 'approaching']);
    expect(trueBehaviours({ kind: 'geometric', first: -1, ratio: 3 })).toEqual(['decreasing', 'diverging']);
    expect(trueBehaviours({ kind: 'affine', first: 1, a: 2, b: 1 })).toBeNull();
  });
});
