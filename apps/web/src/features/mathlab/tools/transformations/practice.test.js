/**
 * Les tests de l'ENTRAÎNEMENT, des PUZZLES et des MOTIFS.
 *
 * Le générateur reçoit son `random` : chaque question est donc reproductible,
 * et on peut affirmer des choses sur MILLE questions plutôt que sur une.
 */

import { describe, it, expect } from 'vitest';
import * as M from './transformMath.js';
import {
  CHALLENGE_KINDS, generateChallenge, applySteps, checkAnswer,
  PUZZLES, getPuzzle, puzzleTarget, isPuzzleSolved,
  EXPERIMENTS, getExperiment, PRESETS, patternCopies, MAX_PATTERN_COPIES,
  describeChallengeStep, isImageHidden, maskImages, practiceFrame,
} from './practice.js';
import { matrixFor } from './transformModel.js';
import {
  normalizeScene, setSteps, addFigure, emptyScene, createTransformationsData, resolveData,
} from './transformState.js';
import mathlabAr from '../../../../i18n/locales/ar/mathlab.json';

const at = (x, y) => ({ x, y });

/** Un générateur déterministe : les tests ne dépendent pas de la chance. */
function seeded(seed = 1) {
  let state = seed;

  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;

    return state / 2147483648;
  };
}

describe('generateChallenge — prédire (§38, §39, §40)', () => {
  it('produit une question complète, quel que soit le tirage', () => {
    const random = seeded(7);
    for (let i = 0; i < 300; i += 1) {
      const challenge = generateChallenge(random);
      expect(CHALLENGE_KINDS).toContain(challenge.kind);
      expect(M.isPoint(challenge.point)).toBe(true);
      expect(M.isPoint(challenge.answer)).toBe(true);
      expect(challenge.steps.length).toBeGreaterThan(0);
    }
  });

  it('la réponse est bien l’image du point par les pas — toujours', () => {
    const random = seeded(11);
    for (let i = 0; i < 300; i += 1) {
      const challenge = generateChallenge(random);
      expect(M.samePoint(challenge.answer, applySteps(challenge.point, challenge.steps))).toBe(true);
    }
  });

  it('une question « à plusieurs pas » en a bien plusieurs (§40)', () => {
    const challenge = generateChallenge(seeded(3), { kind: 'multiStep' });
    expect(challenge.kind).toBe('multiStep');
    expect(challenge.steps).toHaveLength(2);
  });

  it('une question à choix propose QUATRE positions distinctes, dont la bonne (§39)', () => {
    const random = seeded(5);
    for (let i = 0; i < 200; i += 1) {
      const challenge = generateChallenge(random, { kind: 'choosePosition' });
      expect(challenge.choices).toHaveLength(4);
      // La bonne réponse y est.
      expect(challenge.choices.some((choice) => M.samePoint(choice, challenge.answer))).toBe(true);
      // Et une seule fois : sinon deux cases seraient justes.
      expect(challenge.choices.filter((choice) => M.samePoint(choice, challenge.answer))).toHaveLength(1);
      // Toutes distinctes.
      for (let a = 0; a < 4; a += 1) {
        for (let b = a + 1; b < 4; b += 1) {
          expect(M.samePoint(challenge.choices[a], challenge.choices[b])).toBe(false);
        }
      }
    }
  });

  it('les coordonnées proposées restent des ENTIERS lisibles', () => {
    const random = seeded(13);
    for (let i = 0; i < 200; i += 1) {
      const challenge = generateChallenge(random, { kind: 'choosePosition' });
      for (const choice of challenge.choices) {
        expect(Number.isFinite(choice.x)).toBe(true);
        expect(Number.isFinite(choice.y)).toBe(true);
      }
    }
  });

  it('les pas générés décrivent tous une VRAIE transformation', () => {
    const random = seeded(17);
    for (let i = 0; i < 300; i += 1) {
      for (const step of generateChallenge(random).steps) {
        expect(matrixFor(step, [])).not.toBeNull();
      }
    }
  });

  it('les pas générés survivent à la relecture du document', () => {
    const random = seeded(19);
    for (let i = 0; i < 100; i += 1) {
      const { steps } = generateChallenge(random);
      expect(normalizeScene({ figures: [], steps }).steps).toHaveLength(steps.length);
    }
  });
});

describe('checkAnswer — juger sans jamais bloquer', () => {
  const challenge = { answer: at(3, -2) };

  it('accepte la bonne réponse', () => {
    expect(checkAnswer(challenge, at(3, -2)).correct).toBe(true);
  });

  it('tolère l’imprécision d’un CLIC sur le plan', () => {
    expect(checkAnswer(challenge, at(3.01, -1.98)).correct).toBe(true);
  });

  it('refuse une vraie erreur', () => {
    expect(checkAnswer(challenge, at(3, 2)).correct).toBe(false);
    expect(checkAnswer(challenge, at(-3, -2)).correct).toBe(false);
  });

  it('rend TOUJOURS la réponse attendue, même quand c’est faux — on ne bloque pas', () => {
    const verdict = checkAnswer(challenge, at(0, 0));
    expect(verdict.correct).toBe(false);
    expect(verdict.expected).toEqual(at(3, -2));
  });

  it('une réponse absente ou cassée est fausse, pas une exception', () => {
    expect(checkAnswer(challenge, null).correct).toBe(false);
    expect(checkAnswer(challenge, { x: Number.NaN, y: 0 }).correct).toBe(false);
    expect(checkAnswer(null, at(1, 1)).correct).toBe(false);
  });
});

describe('les puzzles (§42)', () => {
  it('chaque puzzle est résolu par SA solution', () => {
    for (const puzzle of PUZZLES) {
      const solved = puzzle.solution.reduce((vertices, step) => {
        const matrix = matrixFor(step, puzzle.figure);

        return vertices.map((vertex) => M.cleanPoint(M.applyMatrix(matrix, vertex)));
      }, puzzle.figure);
      expect(isPuzzleSolved(puzzle, solved)).toBe(true);
    }
  });

  it('aucun puzzle n’est résolu AVANT d’avoir été joué', () => {
    for (const puzzle of PUZZLES) {
      expect(isPuzzleSolved(puzzle, puzzle.figure)).toBe(false);
    }
  });

  it('la solution n’est pas UNIQUE — une autre route est acceptée (§42)', () => {
    const puzzle = getPuzzle('slide');
    // La même image, obtenue par deux انسحاب successifs au lieu d'un.
    const twoHops = [
      { kind: 'translation', enabled: true, vx: 4, vy: -1 },
      { kind: 'translation', enabled: true, vx: 3, vy: -1 },
    ].reduce((vertices, step) => vertices.map((v) => M.cleanPoint(M.applyMatrix(matrixFor(step, vertices), v))), puzzle.figure);
    expect(isPuzzleSolved(puzzle, twoHops)).toBe(true);
  });

  it('une figure RENVERSÉE mais superposée compte comme résolue', () => {
    const puzzle = getPuzzle('mirror');
    expect(isPuzzleSolved(puzzle, [...puzzleTarget(puzzle)].reverse())).toBe(true);
  });

  it('presque résolu n’est pas résolu', () => {
    const puzzle = getPuzzle('quarter');
    const nearly = puzzleTarget(puzzle).map((v) => at(v.x + 0.5, v.y));
    expect(isPuzzleSolved(puzzle, nearly)).toBe(false);
  });

  it('tolère le flottant d’une rotation, pas un écart visible', () => {
    const puzzle = getPuzzle('quarter');
    const jittered = puzzleTarget(puzzle).map((v) => at(v.x + 1e-9, v.y - 1e-9));
    expect(isPuzzleSolved(puzzle, jittered)).toBe(true);
  });

  it('les identifiants sont uniques et retrouvables', () => {
    const ids = PUZZLES.map((puzzle) => puzzle.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(getPuzzle(id)).not.toBeNull();
    expect(getPuzzle('inconnu')).toBeNull();
  });

  it('un puzzle absent n’est jamais « résolu »', () => {
    expect(isPuzzleSolved(null, [at(0, 0)])).toBe(false);
  });
});

describe('les expériences guidées (§41)', () => {
  it('chaque expérience pose une scène VALIDE', () => {
    for (const experiment of EXPERIMENTS) {
      expect(experiment.figure.length).toBeGreaterThanOrEqual(3);
      expect(experiment.steps.length).toBeGreaterThan(0);
      for (const step of experiment.steps) expect(matrixFor(step, experiment.figure)).not.toBeNull();
      // Et sa scène survit à la relecture du document.
      const scene = normalizeScene({ figures: [{ kind: 'polygon', vertices: experiment.figure }], steps: experiment.steps });
      expect(scene.steps).toHaveLength(experiment.steps.length);
      expect(scene.figures[0].vertices).toHaveLength(experiment.figure.length);
    }
  });

  it('chaque expérience CHANGE quelque chose — sinon il n’y a rien à observer', () => {
    for (const experiment of EXPERIMENTS) {
      const image = experiment.steps.reduce((vertices, step) => {
        const matrix = matrixFor(step, experiment.figure);

        return vertices.map((vertex) => M.cleanPoint(M.applyMatrix(matrix, vertex)));
      }, experiment.figure);
      expect(M.figuresCoincide(experiment.figure, image)).toBe(false);
    }
  });

  it('les identifiants sont uniques et retrouvables', () => {
    const ids = EXPERIMENTS.map((experiment) => experiment.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(getExperiment(id)).not.toBeNull();
    expect(getExperiment('inconnu')).toBeNull();
  });

  it('l’expérience « ordre » a bien DEUX pas, sans quoi il n’y a pas d’ordre', () => {
    expect(getExperiment('order').steps).toHaveLength(2);
  });
});

describe('les préréglages (§35)', () => {
  it('chacun pose un pas valide', () => {
    for (const preset of PRESETS) {
      expect(matrixFor(preset.step, [])).not.toBeNull();
      expect(normalizeScene({ figures: [], steps: [preset.step] }).steps).toHaveLength(1);
    }
  });

  it('les quarts de tour font bien ce qu’ils annoncent', () => {
    const imageOf = (id) => M.applyMatrix(matrixFor(PRESETS.find((p) => p.id === id).step, []), at(1, 0));
    expect(imageOf('rotate90')).toEqual(at(0, 1));
    expect(imageOf('rotate180')).toEqual(at(-1, 0));
    expect(imageOf('rotate270')).toEqual(at(0, -1));
  });

  it('les identifiants sont uniques', () => {
    const ids = PRESETS.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('les motifs (§37)', () => {
  const triangle = [at(0, 0), at(1, 0), at(0, 1)];
  const slide = { kind: 'translation', enabled: true, vx: 2, vy: 0 };

  it('répète la transformation n fois', () => {
    const copies = patternCopies(triangle, slide, 3);
    expect(copies).toHaveLength(3);
    expect(copies[0][0]).toEqual(at(2, 0));
    expect(copies[1][0]).toEqual(at(4, 0));
    expect(copies[2][0]).toEqual(at(6, 0));
  });

  it('une rotation répétée ferme le motif', () => {
    const copies = patternCopies(triangle, { kind: 'rotation', enabled: true, angle: 90, center: { type: 'origin' } }, 4);
    // Quatre quarts de tour ramènent la figure sur elle-même.
    expect(M.figuresCoincide(copies[3], triangle)).toBe(true);
  });

  it('borne le nombre de copies (§37 — « do not turn this into a CAD editor »)', () => {
    expect(patternCopies(triangle, slide, 1000)).toHaveLength(MAX_PATTERN_COPIES);
  });

  it('zéro copie, une figure vide ou un pas invalide ne rendent rien', () => {
    expect(patternCopies(triangle, slide, 0)).toEqual([]);
    expect(patternCopies([], slide, 3)).toEqual([]);
    expect(patternCopies(triangle, { kind: 'shear' }, 3)).toEqual([]);
    expect(patternCopies(triangle, slide, Number.NaN)).toEqual([]);
  });
});

// ── Audit de l'énoncé et du plan (défauts T1, T2, T3) ────────────────────
//
// Les attentes ci-dessous sont calculées INDÉPENDAMMENT du moteur : pas de
// `matrixFor`, pas de `applySteps` — de la géométrie écrite à la main, pour
// qu'un moteur faux ne puisse pas se valider lui-même.

/** L'image d'un point par un pas, calculée à la main (formules du manuel). */
function imageByHand(step, p, vertices = []) {
  const centerOf = (center) => {
    if (!center || center.type === 'origin') return { x: 0, y: 0 };
    if (center.type === 'vertex') return vertices[center.index];
    return center.point;
  };
  switch (step.kind) {
    case 'translation': return { x: p.x + step.vx, y: p.y + step.vy };
    case 'rotation': {
      const c = centerOf(step.center);
      const r = (step.angle * Math.PI) / 180;
      const dx = p.x - c.x;
      const dy = p.y - c.y;
      return { x: c.x + dx * Math.cos(r) - dy * Math.sin(r), y: c.y + dx * Math.sin(r) + dy * Math.cos(r) };
    }
    case 'dilation': {
      const c = centerOf(step.center);
      return { x: c.x + step.k * (p.x - c.x), y: c.y + step.k * (p.y - c.y) };
    }
    case 'reflection': {
      const axis = step.axis;
      if (axis.type === 'origin') {
        const c = centerOf(axis.center);
        return { x: 2 * c.x - p.x, y: 2 * c.y - p.y };
      }
      // La droite par un point A et une direction u : P′ = 2·H − P, H projeté de P.
      let a;
      let u;
      switch (axis.type) {
        case 'xAxis': a = { x: 0, y: 0 }; u = { x: 1, y: 0 }; break;
        case 'yAxis': a = { x: 0, y: 0 }; u = { x: 0, y: 1 }; break;
        case 'diagonal': a = { x: 0, y: 0 }; u = { x: 1, y: 1 }; break;
        case 'antidiagonal': a = { x: 0, y: 0 }; u = { x: 1, y: -1 }; break;
        case 'horizontal': a = { x: 0, y: axis.value }; u = { x: 1, y: 0 }; break;
        case 'vertical': a = { x: axis.value, y: 0 }; u = { x: 0, y: 1 }; break;
        case 'line': a = { x: 0, y: axis.intercept }; u = { x: 1, y: axis.slope }; break;
        case 'twoPoints': a = axis.a; u = { x: axis.b.x - axis.a.x, y: axis.b.y - axis.a.y }; break;
        default: throw new Error(axis.type);
      }
      const t = ((p.x - a.x) * u.x + (p.y - a.y) * u.y) / (u.x * u.x + u.y * u.y);
      const h = { x: a.x + t * u.x, y: a.y + t * u.y };
      return { x: 2 * h.x - p.x, y: 2 * h.y - p.y };
    }
    default: throw new Error(step.kind);
  }
}

const byHand = (point, steps) => steps.reduce((p, step) => imageByHand(step, p), point);
const close = (a, b) => Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.y - b.y) < 1e-9;

/** Le texte ARABE affiché, interpolé comme le fait i18next. */
function stepSentence(step, vertices) {
  const description = describeChallengeStep(step, vertices);
  if (!description) return null;
  const template = mathlabAr.tools.transformations.practice.stepText[description.key];
  if (typeof template !== 'string') return null;

  return template.replace(/\{\{(\w+)\}\}/g, (match, name) => {
    const value = description.params[name];
    if (typeof value !== 'string' || value === '' || value === '—') throw new Error(`paramètre ${name} manquant (${description.key})`);
    return value;
  });
}

describe('T1 — la réponse n’est pas à l’écran avant d’être donnée', () => {
  it('l’image est masquée en entraînement tant qu’il n’y a ni verdict ni « أرني »', () => {
    const challenge = { point: at(1, 2) };
    expect(isImageHidden({ mode: 'practice', challenge, verdict: null })).toBe(true);
    expect(isImageHidden({ mode: 'practice', challenge, verdict: { correct: true } })).toBe(false);
    expect(isImageHidden({ mode: 'practice', challenge, verdict: { correct: false, revealed: true } })).toBe(false);
    expect(isImageHidden({ mode: 'practice', challenge: null, verdict: null })).toBe(false);
    expect(isImageHidden({ mode: 'free', challenge, verdict: null })).toBe(false);
    expect(isImageHidden({ mode: 'puzzle', challenge, verdict: null })).toBe(false);
  });

  it('sur 3 000 questions, la scène masquée ne contient AUCUNE coordonnée de la réponse', () => {
    const random = seeded(101);
    for (let i = 0; i < 3000; i += 1) {
      const challenge = generateChallenge(random);
      const expected = byHand(challenge.point, challenge.steps);
      // La scène exactement comme l'outil la pose.
      const scene = setSteps(addFigure(emptyScene(), 'point', [challenge.point]), challenge.steps);
      const data = { ...createTransformationsData(), history: [scene], cursor: 0 };
      const full = resolveData(data);
      // Sans masque, l'image EST la réponse : c'est bien elle qu'il faut cacher.
      expect(close(full.figures[0].image[0], expected)).toBe(true);

      const masked = maskImages(full);
      const shown = masked.figures.flatMap((entry) => [
        ...entry.image,
        ...entry.stages.flatMap((stage) => stage.vertices),
      ]);
      expect(shown.some((p) => close(p, expected))).toBe(false);
      // L'image masquée est le point lui-même : rien de « déplacé » à dessiner.
      expect(masked.figures[0].image).toEqual([challenge.point]);
      expect(masked.figures[0].stages).toEqual([]);
      // Et la figure d'origine est intacte.
      expect(masked.figures[0].figure.vertices).toEqual([challenge.point]);
    }
  });

  it('le cadrage avant verdict ne dépend que de l’énoncé ; après, il montre l’image', () => {
    const viewport = { xMin: -8, xMax: 8, yMin: -6, yMax: 6 };
    const a = { point: at(2, 3), steps: [{ kind: 'translation', enabled: true, vx: 5, vy: -4 }] };
    const b = { point: at(2, 3), steps: [{ kind: 'dilation', enabled: true, k: 3, center: { type: 'origin' } }] };
    expect(practiceFrame(a, false, viewport)).toEqual(practiceFrame(b, false, viewport));
    expect(practiceFrame(a, true, viewport).some((p) => close(p, at(7, -1)))).toBe(true);
    expect(practiceFrame(b, true, viewport).some((p) => close(p, at(6, 9)))).toBe(true);
    expect(practiceFrame(null, false, viewport)).toEqual([]);
  });
});

describe('T2 — l’énoncé détermine la transformation', () => {
  it('chaque pas de 3 000 questions a une phrase complète : axe, centre, sens, rapport', () => {
    const random = seeded(202);
    for (let i = 0; i < 3000; i += 1) {
      const challenge = generateChallenge(random);
      for (const step of challenge.steps) {
        const sentence = stepSentence(step, [challenge.point]);
        expect(sentence).toBeTruthy();
        expect(sentence).not.toMatch(/\{\{|\}\}/);
        if (step.kind === 'reflection') {
          const expectedAxis = {
            xAxis: 'محور الفواصل', yAxis: 'محور التراتيب', diagonal: 'y = x', origin: 'تناظر مركزي مركزه O',
          }[step.axis.type];
          expect(sentence).toContain(expectedAxis);
        }
        if (step.kind === 'rotation') {
          expect(sentence).toContain('مركزه O');
          expect(sentence).toContain(`${step.angle}°`);
          expect(sentence).toContain('الاتجاه الموجب');
        }
        if (step.kind === 'dilation') {
          expect(sentence).toContain('مركزه O');
          expect(sentence).toContain(`نسبته ${String(step.k).replace('-', '−')}`);
        }
      }
    }
  });

  it('deux transformations différentes n’ont JAMAIS la même phrase', () => {
    const catalogue = [];
    for (let vx = -5; vx <= 5; vx += 1) {
      for (let vy = -5; vy <= 5; vy += 1) catalogue.push({ kind: 'translation', vx, vy });
    }
    const centers = [{ type: 'origin' }, { type: 'point', point: at(1, 2) }, { type: 'point', point: at(-3, 0.5) }];
    for (const center of centers) {
      for (const angle of [30, 90, 180, 270, -90, -45]) catalogue.push({ kind: 'rotation', angle, center });
      for (const k of [2, -1, 3, 0.5, -2]) catalogue.push({ kind: 'dilation', k, center });
      catalogue.push({ kind: 'reflection', axis: { type: 'origin', center } });
    }
    for (const type of ['xAxis', 'yAxis', 'diagonal', 'antidiagonal']) catalogue.push({ kind: 'reflection', axis: { type } });
    for (const value of [-2, 0, 1, 3]) {
      catalogue.push({ kind: 'reflection', axis: { type: 'horizontal', value } });
      catalogue.push({ kind: 'reflection', axis: { type: 'vertical', value } });
    }
    for (const [slope, intercept] of [[2, 1], [-1, 3], [1, -2], [0.5, 0], [0, 4]]) {
      catalogue.push({ kind: 'reflection', axis: { type: 'line', slope, intercept } });
    }
    catalogue.push({ kind: 'reflection', axis: { type: 'twoPoints', a: at(0, 1), b: at(2, 3) } });
    catalogue.push({ kind: 'reflection', axis: { type: 'twoPoints', a: at(1, 0), b: at(1, 4) } });

    // La « signature » d'un pas : les images, calculées à la main, de trois points non alignés.
    const probes = [at(0.3, 0.7), at(2.1, -1.3), at(-1.7, 2.9)];
    const signature = (step) => probes.map((p) => imageByHand(step, p))
      .map((q) => `${q.x.toFixed(6)},${q.y.toFixed(6)}`).join('|');

    const bySentence = new Map();
    for (const step of catalogue) {
      const sentence = stepSentence(step, []);
      expect(sentence, JSON.stringify(step)).toBeTruthy();
      const sig = signature(step);
      if (bySentence.has(sentence)) expect(bySentence.get(sentence)).toBe(sig);
      bySentence.set(sentence, sig);
    }
    // Et la réciproque n'est pas ce qu'on exige — mais aucune phrase ne sert deux transformations.
    expect(bySentence.size).toBeGreaterThan(150);
  });

  it('le sens d’un دوران est dit : 90° direct et 90° indirect ne se confondent pas', () => {
    const direct = stepSentence({ kind: 'rotation', angle: 90, center: { type: 'origin' } }, []);
    const indirect = stepSentence({ kind: 'rotation', angle: -90, center: { type: 'origin' } }, []);
    expect(direct).toContain('الاتجاه الموجب');
    expect(indirect).toContain('الاتجاه السالب');
    expect(direct).not.toBe(indirect);
  });

  it('un centre posé sur un sommet est résolu et écrit en coordonnées', () => {
    const sentence = stepSentence({ kind: 'dilation', k: 2, center: { type: 'vertex', index: 0 } }, [at(3, -1)]);
    expect(sentence).toContain('(3 ; −1)');
  });
});

describe('T3 — pas de question dont la réponse est le point lui-même', () => {
  it('sur 6 000 questions, l’image (calculée à la main) diffère toujours du point', () => {
    const random = seeded(303);
    for (let i = 0; i < 6000; i += 1) {
      const challenge = generateChallenge(random, { kind: CHALLENGE_KINDS[i % 3] });
      expect(close(byHand(challenge.point, challenge.steps), challenge.point)).toBe(false);
    }
  });

  it('un tirage dégénéré (constante) rend quand même une question non triviale', () => {
    // random() = 0,5 donne le point O et le تناظر مركزي : trivial à chaque tirage.
    for (const kind of CHALLENGE_KINDS) {
      const challenge = generateChallenge(() => 0.5, { kind });
      expect(close(byHand(challenge.point, challenge.steps), challenge.point)).toBe(false);
      expect(close(challenge.answer, byHand(challenge.point, challenge.steps))).toBe(true);
      if (kind === 'choosePosition') expect(challenge.choices).toHaveLength(4);
    }
  });
});
