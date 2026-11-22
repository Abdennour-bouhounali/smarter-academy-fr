import { describe, it, expect } from 'vitest';
import { generateChallenge, checkAnswer, parseStudentNumber, CHALLENGE_KINDS, EXPERIMENTS, PREDICTIONS } from './practice.js';
import ar from '../../../../i18n/locales/ar/mathlab.json';
import { compileSource } from '../functionGrapher/expressionEvaluator.js';

describe('la saisie d’une réponse', () => {
  /**
   * Depuis que le champ est un champ MATHÉMATIQUE, la réponse arrive en
   * LaTeX : un élève qui tape ½ au clavier virtuel envoie `\\frac{1}{2}`.
   * Ne pas le lire aurait transformé une bonne réponse en « non compris ».
   */
  it.each([
    ['2,5', 2.5],
    ['2.5', 2.5],
    ['-3', -3],
    ['−3', -3],              // le vrai signe moins, U+2212
    ['1/2', 0.5],
    [' 7 ', 7],
    ['\\frac{1}{2}', 0.5],
    ['\\frac{7}{2}', 3.5],
    ['\\frac{-3}{4}', -0.75],
    ['-\\frac{1}{2}', -0.5],
    ['\\sqrt{4}', 2],
    ['\\pi', Math.PI],
    ['0', 0],
    // Clavier arabe : chiffres arabes-indiens, persans, virgule décimale « ٫ ».
    ['٢٫٥', 2.5],
    ['١٢', 12],
    ['−٣', -3],
    ['۱۲', 12],
    ['٣/٤', 0.75],
    // La notation scientifique d'une calculatrice, pas 1 × e × 3.
    ['1e3', 1000],
    ['2.5E-2', 0.025],
  ])('lit « %s »', (input, expected) => {
    expect(parseStudentNumber(input)).toBeCloseTo(expected, 9);
  });

  /** Une réponse doit être un NOMBRE : « 2x » n'en est pas une. */
  it.each([[''], ['abc'], ['x'], ['2x'], ['\\frac{1}{0}'], ['???'], [null], [undefined]])(
    'refuse « %s » sans jamais rendre NaN', (input) => {
      expect(parseStudentNumber(input)).toBeNull();
    },
  );
});

describe('les défis', () => {
  it('engendrent une famille connue, analysable et cohérente', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const challenge = generateChallenge(seed * 13);
      expect(CHALLENGE_KINDS).toContain(challenge.kind);
      expect(compileSource(challenge.source).ok, challenge.source).toBe(true);
      // Un énoncé ne montre jamais « x^2-4x+0 » : un terme nul ne s'écrit pas.
      expect(challenge.source, challenge.source).not.toMatch(/[+-]0$|\+-|--/);
      // Le défi se valide lui-même : sa réponse attendue est correcte.
      expect(checkAnswer(challenge, challenge.expected).correct, `${challenge.kind} ${challenge.source}`).toBe(true);
    }
  });

  /** §37 : au niveau « programme », on ne pose que ce qui relève de 4AM. */
  it('ne pose au niveau programme que le taux d’accroissement', () => {
    for (let seed = 1; seed <= 60; seed += 1) {
      const challenge = generateChallenge(seed * 13, { level: 'programme' });
      expect(challenge.kind).toBe('averageRate');
      // Et sa réponse est vérifiable indépendamment.
      const fn = compileSource(challenge.source).fn;
      const { a, b } = challenge.promptParams;
      expect(challenge.expected).toBeCloseTo((fn(b) - fn(a)) / (b - a), 9);
    }
  });

  it('porte trois indices gradués et une explication, jamais la réponse', () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const challenge = generateChallenge(seed * 7);
      expect(challenge.hintKeys.length).toBe(3);
      expect(challenge.explainKey).toBeTruthy();
      for (const key of challenge.hintKeys) expect(typeof key).toBe('string');
    }
  });

  /** §30 : « adjust n until close enough » — tout n assez grand est juste. */
  it('accepte TOUT n suffisant pour le défi de Riemann', () => {
    const challenge = generateChallenge(5, { kinds: ['riemannClose'] });
    expect(checkAnswer(challenge, challenge.expected).correct).toBe(true);
    expect(checkAnswer(challenge, challenge.expected + 50).correct).toBe(true);
    expect(checkAnswer(challenge, 1).correct).toBe(false);
  });

  /**
   * Le juge de Riemann, vérifié contre un calcul INDÉPENDANT : la somme à
   * gauche recalculée ici, et l'aire exacte par primitive (b³/3, b⁴/4,
   * ⅔·b^{3/2}). n est libre (curseur de 1 en 1) : chaque n de 1 à 200 doit
   * être jugé exactement comme le dit ce calcul. L'ancien juge (« n ≥ le
   * premier cran de {2, 5, 10, 20, 50, 100} qui suffit ») refusait 12 à 19
   * pour √x sur [0 ; 1] alors que 12 suffit.
   */
  it('juge chaque n par la somme à gauche réelle, pas par des crans', () => {
    const exactOf = { 'x^2': (b) => b ** 3 / 3, 'x^3': (b) => b ** 4 / 4, '\\sqrt{x}': (b) => (2 / 3) * b ** 1.5 };
    const fnOf = { 'x^2': (x) => x * x, 'x^3': (x) => x ** 3, '\\sqrt{x}': (x) => Math.sqrt(x) };
    const leftSum = (fn, b, n) => {
      let total = 0;
      for (let i = 0; i < n; i += 1) total += fn((i * b) / n) * (b / n);

      return total;
    };
    const seen = new Set();
    for (let seed = 1; seed <= 400; seed += 1) {
      const challenge = generateChallenge(seed * 31, { kinds: ['riemannClose'] });
      const key = `${challenge.source}|${challenge.bounds.b}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const { b } = challenge.bounds;
      const exact = exactOf[challenge.source](b);
      // Le seuil jugé est celui qu'on AFFICHE (au millième).
      expect(Math.abs(challenge.threshold - 0.05 * Math.max(1, exact))).toBeLessThanOrEqual(0.0005 + 1e-9);
      expect(Number(challenge.threshold.toFixed(3))).toBe(challenge.threshold);
      const close = (n) => Math.abs(leftSum(fnOf[challenge.source], b, n) - exact) < challenge.threshold;
      let minimal = null;
      for (let n = 1; n <= 200; n += 1) {
        expect(checkAnswer(challenge, String(n)).correct, `${key} n=${n}`).toBe(close(n));
        if (minimal === null && close(n)) minimal = n;
      }
      expect(challenge.expected, key).toBe(minimal);
      // Un n non entier ou nul n'est pas un nombre de rectangles.
      expect(checkAnswer(challenge, '0').correct).toBe(false);
      expect(checkAnswer(challenge, String(minimal + 0.5)).correct).toBe(false);
    }
    expect(seen.has('\\sqrt{x}|1')).toBe(true);
    // √x sur [0 ; 1], seuil 0,05 : le vrai minimum est 12 (calcul ci-dessus).
    const sqrtOne = [...Array(400).keys()].map((i) => generateChallenge((i + 1) * 31, { kinds: ['riemannClose'] }))
      .find((c) => c.source === '\\sqrt{x}' && c.bounds.b === 1);
    expect(sqrtOne.expected).toBe(12);
    expect(checkAnswer(sqrtOne, '12').correct).toBe(true);
    expect(checkAnswer(sqrtOne, '11').correct).toBe(false);
  });

  /** La question dit « يسارية », et « أرني على الرسم » règle le mode gauche. */
  it('annonce des rectangles à gauche et règle le laboratoire en conséquence', () => {
    const challenge = generateChallenge(5, { kinds: ['riemannClose'] });
    expect(challenge.focus.riemann.mode).toBe('left');
    expect(ar.tools.analysis.practice.q.riemannClose).toMatch(/يسارية/);
  });

  /**
   * Le sens de variation d'un trinôme k(x − r₁)(x − r₂) : les DEUX
   * orientations sortent, et la réponse attendue est vérifiée par la pente
   * mesurée à part (différence symétrique) un pas avant le sommet.
   */
  it('tire les deux orientations de la parabole et juge chacune juste', () => {
    const orientations = new Set();
    for (let seed = 1; seed <= 300; seed += 1) {
      const challenge = generateChallenge(seed * 17, { kinds: ['monotonic'] });
      const fn = compileSource(challenge.source).fn;
      const vertex = challenge.focus.point;
      const h = 1e-4;
      const slopeBefore = (fn(vertex - 1 + h) - fn(vertex - 1 - h)) / (2 * h);
      const slopeAfter = (fn(vertex + 1 + h) - fn(vertex + 1 - h)) / (2 * h);
      const truth = slopeBefore < 0 && slopeAfter > 0 ? 'beforeVertex'
        : slopeBefore > 0 && slopeAfter < 0 ? 'afterVertex' : null;
      expect(truth, challenge.source).not.toBeNull();
      orientations.add(truth);
      expect(challenge.expected, challenge.source).toBe(truth);
      expect(checkAnswer(challenge, truth).correct).toBe(true);
      expect(checkAnswer(challenge, truth === 'beforeVertex' ? 'afterVertex' : 'beforeVertex').correct).toBe(false);
      // L'explication suit l'orientation.
      expect(challenge.explainKey.endsWith(truth === 'afterVertex' ? 'monotonicDown' : 'monotonic')).toBe(true);
    }
    expect([...orientations].sort()).toEqual(['afterVertex', 'beforeVertex']);
  });

  /** §43 : un verdict, jamais un verrou — rien dans le résultat ne bloque. */
  it('ne rend jamais d’état bloquant', () => {
    const challenge = generateChallenge(11);
    const wrong = checkAnswer(challenge, 999999);
    expect(wrong.correct).toBe(false);
    expect(Object.keys(wrong).sort()).toEqual(['correct', 'parsed']);
    expect(checkAnswer(challenge, '')).toMatchObject({ reason: 'empty' });
    expect(checkAnswer(challenge, 'abc')).toMatchObject({ reason: 'unparsed' });
  });
});

describe('les expériences et les prédictions', () => {
  it('nomment un laboratoire réel et une fonction analysable', () => {
    const labs = ['secant', 'tangent', 'derivative', 'limit', 'integral', 'study', 'transform'];
    for (const experiment of EXPERIMENTS) {
      expect(labs).toContain(experiment.lab);
      expect(compileSource(experiment.source, { variables: ['x', 'a', 'b', 'c'] }).ok, experiment.source).toBe(true);
      expect(experiment.questionKey).toBeTruthy();
      expect(experiment.observationKey).toBeTruthy();
    }
    for (const prediction of PREDICTIONS) {
      expect(labs).toContain(prediction.lab);
      expect(prediction.choices).toContain(prediction.expected);
      expect(compileSource(prediction.source).ok, prediction.source).toBe(true);
      expect(prediction.setup.lab).toBe(prediction.lab);
      // Chaque choix a son libellé : « same » (لا تتغيّر) ne répond pas à « مساوية؟ ».
      for (const choice of prediction.choices) expect(ar.tools.analysis.predict.choices[choice], choice).toBeTruthy();
    }
  });

  /**
   * La réponse d'une prédiction se CALCULE sur sa propre scène, ici
   * recalculée à la main : elle ne peut plus dire « تكبر » pour une aire qui
   * rétrécit, ni « مختلفة » pour une fonction continue.
   */
  it('calcule la réponse de chaque prédiction sur sa scène', () => {
    const byId = Object.fromEntries(PREDICTIONS.map((prediction) => [prediction.id, prediction]));
    const fnOf = (prediction) => compileSource(prediction.source).fn;
    const slope = (fn, x) => (fn(x + 1e-5) - fn(x - 1e-5)) / 2e-5;

    const vertex = byId.tangentSlopeAtVertex;
    // x² − 4x + 3 : rayon du sommet en x = 2 (−b/2a), pente nulle.
    expect(vertex.after.point).toBe(2);
    expect(Math.abs(slope(fnOf(vertex), 2))).toBeLessThan(1e-6);
    expect(vertex.expected).toBe('zero');

    const increasing = byId.derivativeSignWhenIncreasing;
    const at = increasing.setup.point;
    // La prémisse « elle est croissante ICI » doit être vraie sur la scène.
    expect(fnOf(increasing)(at + 0.01)).toBeGreaterThan(fnOf(increasing)(at));
    expect(increasing.expected).toBe(slope(fnOf(increasing), at) > 0 ? 'positive' : 'negative');

    const area = byId.areaWhenBoundMoves;
    // ∫₀ᵇ x² = b³/3 : 8/3 → 9.
    const before = area.setup.bounds.b ** 3 / 3;
    const after = area.after.bounds.b ** 3 / 3;
    expect(area.after.bounds.b).toBeGreaterThan(area.setup.bounds.b);
    expect(area.expected).toBe(after > before ? 'larger' : 'smaller');

    const riemann = byId.riemannWhenNGrows;
    const left = (n) => {
      let total = 0;
      for (let i = 0; i < n; i += 1) total += ((i * 2) / n) ** 2 * (2 / n);

      return total;
    };
    expect(riemann.after.riemann.n).toBeGreaterThan(riemann.setup.riemann.n);
    const better = Math.abs(left(riemann.after.riemann.n) - 8 / 3) < Math.abs(left(riemann.setup.riemann.n) - 8 / 3);
    expect(riemann.expected).toBe(better ? 'better' : 'worse');

    const limit = byId.limitFromBothSides;
    // |x|/x vaut −1 à gauche de 0 et 1 à droite.
    expect(fnOf(limit)(-1e-3)).toBe(-1);
    expect(fnOf(limit)(1e-3)).toBe(1);
    expect(limit.expected).toBe('different');
  });
});
